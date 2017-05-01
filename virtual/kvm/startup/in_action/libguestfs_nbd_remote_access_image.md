一些RHEL 7的virt命令允许你远程访问libvirt连接，但是在RHEL 7上的`libguestfs`则不能访问远程`libvirt` guest的磁盘，并且并且类似使用远程URL的指令都不能工作，例如：

```
virt-df -c qemu://remote/system -d Guest
```

然而，从RHEL 7开始，`libguestfs`可以通过`NBD`访问远程磁盘源。也就是能够通过`qemu-nbd`命令访问远程主机磁盘，并通过`nbd://` URL来访问磁盘。不过要注意远程服务器开启防火墙允许访问端口`10809`:

* 远程系统启动nbd，此时`qemu-nbd`运行在前台，打开了服务等待客户端连接（不返回桌面）

```
qemu-nbd -t /var/lib/libvirt/images/centos6.img
```

> 可以通过`yum install qemu-img`安装`qemu-nbd`工具

* 本地系统使用`virt-df`反问远程主机

```
virt-df -a nbd://192.168.122.1
```

> 这里 `192.168.122.1` 是启动了`qemu-nbd`的主机IP地址

> 可以使用`yum install libguestfs-tools`安装`libguestfs`工具

提示报错信息

```
libguestfs: error: could not auto-detect the format when using a non-file protocol.
If the format is known, pass the format to libguestfs, eg. using the
'--format' option, or via the optional 'format' argument to 'add-drive'.
```

我查看了`man virt-df`发现有一个传递给`virt-df` 参数 `--format=raw|qcow2|...` ，所以尝试

```
virt-df --format=qcow2 -a nbd://192.168.122.1
```

再次报错

```
libguestfs: error: qemu-img: /tmp/libguestfsI2WNsN/overlay1: qemu-img exited with error status 1.
To see full error messages you may need to enable debugging.
Do:
  export LIBGUESTFS_DEBUG=1 LIBGUESTFS_TRACE=1
and run the command again.
```

通过debug方式显示，检查Image不是qcow2格式，有如下报错：

```
libguestfs: trace: add_drive "" "readonly:true" "format:qcow2" "protocol:nbd" "server:tcp:192.168.122.1"
libguestfs: creating COW overlay to protect original drive content
libguestfs: trace: get_tmpdir
libguestfs: trace: get_tmpdir = "/tmp"
libguestfs: trace: disk_create "/tmp/libguestfsGXUYjt/overlay1" "qcow2" -1 "backingfile:nbd:192.168.122.1:10809" "backingformat:qcow2"
libguestfs: command: run: qemu-img
libguestfs: command: run: \ create
libguestfs: command: run: \ -f qcow2
libguestfs: command: run: \ -o backing_file=nbd:192.168.122.1:10809,backing_fmt=qcow2
libguestfs: command: run: \ /tmp/libguestfsGXUYjt/overlay1
qemu-img: /tmp/libguestfsGXUYjt/overlay1: Image is not in qcow2 format
libguestfs: error: qemu-img: /tmp/libguestfsGXUYjt/overlay1: qemu-img exited with error status 1, see debug messages above
```

但是在远程服务器上使用`qemu-img info /var/lib/libvirt/images/centos6.img`可以看到这个磁盘设备设备确实是`qcow2`类型（从`virsh dumxml centos6`看配置也是`qcow2`类型磁盘）

```
image: /var/lib/libvirt/images/centos6.img
file format: qcow2
virtual size: 10G (10737418240 bytes)
disk size: 2.7G
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: true
```

参考[Bug 1406981 - guestfish failed to launch nbd qcow2 image with --format=qcow2](https://bugzilla.redhat.com/show_bug.cgi?id=1406981)，原来：

**`qemu-nbd`进程打开`qcow2`文件是将其作为一个raw文件，所以在客户端(`libguestfs`)需要通过`raw`方式来访问**

所以正确的访问方式是

```
virt-df --format=raw -a nbd://192.168.122.1
```

此时报错改成

```
libguestfs: guest random name = guestfs-ydiirse7cebh4vfs
libguestfs: connect to libvirt
libguestfs: opening libvirt handle: URI = qemu:///system, auth = default+wrapper, flags = 0
libvirt: XML-RPC error : Failed to connect socket to '/var/run/libvirt/libvirt-sock': No such file or directory
libguestfs: error: could not connect to libvirt (URI = qemu:///system): Failed to connect socket to '/var/run/libvirt/libvirt-sock': No such file or directory [code=38 int1=2]
libguestfs: trace: launch = -1 (error)
```

也就是客户端还需要启动`libvirtd`，即先执行`systemctl start libvirtd`，然后再执行`virt-df --format=raw -a nbd://192.168.122.1`，此时输出就能够正确显示远程输出的`nbd`磁盘容量：

```
192.168.122.1:/dev/vg_centos6/lv_root
                                       8649736    2475860    5711440   29%
```

> 远程使用`libguestfs`访问`NBD`输出需要本地启动`libvirtd`服务，不过，本地访问磁盘则不需要`libvirtd` - 参考 [Does libguestfs need { libvirt / KVM / Red Hat / Fedora }?](http://libguestfs.org/guestfs-faq.1.html)

# libguestfs指令案例

```
guestfish --format=raw -a nbd://192.168.122.1 -i
```

* 检查磁盘文件系统

```
list-filesystems
```

可以看到输出远程NBD输出文件系统情况

```
/dev/sda1: ext4
/dev/vg_centos6/lv_root: ext4
/dev/vg_centos6/lv_swap: swap
```

* 挂载文件系统

```
mkdir /tmp/nbd_lv_root
mount /dev/vg_centos6/lv_root /tmp/nbd_lv_root
```

此时远程服务器输出的NBD设备的`/dev/vg_centos6/lv_root`就被挂载到本地的`libguestfs`系统上的`/tmp/nbd_lv_root/`目录下，就可以对该目录中文件进行读写操作。

例如，可以查看到远程文件系统中的主机名，确认确实是远程输出的磁盘镜像：

```
cat /tmp/nbd_lv_root/etc/sysconfig/network
```

输出信息确认是远程服务器上`centos6.img`的文件系统主机名配置（我配置的主机名是`centos6`）：

```
NETWORKING=yes
HOSTNAME=centos6
```

# 参考

* [Guest Virtual Machine Disk Access with Offline Tools](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/chap-Guest_virtual_machine_disk_access_with_offline_tools.html)
* [guestfish failed to launch nbd qcow2 image with --format=qcow2](https://bugzilla.redhat.com/show_bug.cgi?id=1406981)