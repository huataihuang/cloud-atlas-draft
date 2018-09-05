# 介绍

`virsh`是一个使用[libvirt](http://libvirt.org/)来管理KVM虚拟主机的命令行工具。

# 使用

* 查看主机信息

```bash
virsh nodeinfo
```

显示输出

```
CPU model:           x86_64
CPU(s):              8
CPU frequency:       1995 MHz
CPU socket(s):       2
Core(s) per socket:  4
Thread(s) per core:  1
NUMA cell(s):        1
Memory size:         4056256 kB
```

## 查看guest信息

* 显示已经定义的guest主机

```bash
virsh list --all
```

* 显示一个guest主机的信息

```bash
virsh dominfo guest_name
```
## 启动和停止guest

* 启动一个guest

```bash
virsh start guest_name
```

* 关闭一个guest

```bash
virsh shutdown guest_name
```

* 强制关闭一个guest

```bash
virsh destroy guest_name
```

* 挂起一个guest

```bash
virsh suspend guest_name
```

* 继续一个guest运行

```bash
virsh resume guest_name
```

* 保存一个guest

```bash
virsh save centos7 /var/lib/libvirt/images/centos7-save.img
```

> 这里将停止虚拟机并保存数据都文件(但是我使用`virsh list`显示`centos7`依然是running状态)

# 虚拟机磁盘设备

`virsh domblklist`可以输出磁盘设备清单，实际上，这个命令和`virsh dumpxml`中输出的磁盘设备是一致的，但是输出较清晰

```
 # virsh domblklist f17-base
Target     Source
---------------------------------------------
vda        /export/vmimages/f17-base.qcow2
```

# 虚拟机网卡设备信息

`virsh domiflist`可以输出网络设备信息。这个命令和`virsh dumpxml`中输出的网络设备是一致的，但是输出较清晰

```
#virsh domiflist f17-base
Interface  Type       Source     Model       VPort      MAC
-------------------------------------------------------------------
0003db     vhostuser  -          virtio      vp.0003db  00:16:3e:00:03:db
0003d2     vhostuser  -          virtio      vp.0003d2  00:16:3e:00:03:d2
```

# 参考

* [How To Manage KVM Virtual Machines Using Virsh](http://acidborg.wordpress.com/2010/02/19/how-to-manage-kvm-virtual-machines-using-virsh/)
* [Virsh Command Reference](http://libvirt.org/sources/virshcmdref/html-single/)
* [Live-disk-backup-with-active-blockcommit](http://wiki.libvirt.org/page/Live-disk-backup-with-active-blockcommit)