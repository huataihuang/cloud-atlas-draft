要将本地的iso文件挂载到xen虚拟机中，可以尝试如下命令：

```bash
sudo xm block-attach INSTANCE_NAME file://home/images/xen_drivers.iso /dev/sdb r
```

如果是xen server平台，可以将iso镜像问文件复制到本地目录下，然后创建一个本地的ISO库

```bash
xe sr-create name-label=ISO1 type=iso \
device-config:location=/var/opt/xen/iso_import/ISO1 \
device-config:legacy_mode=true content-type=iso
```

之后就可以使用命令`xe vdi-list`查看到挂载的本地ISO镜像库。

[How to add local ISO storage repo in XenServer](http://www.dedoimedo.com/computers/xen-xenserver-local-iso-repo.html)提供了3中本地挂载的方法，也可借鉴。

> 在KVM环境下，可以使用`virsh attach-disk`命令来挂载iso镜像文件

# 参考

* [How to mount a CDROM on a Xen guest virtual machine?](http://serverfault.com/questions/44895/how-to-mount-a-cdrom-on-a-xen-guest-virtual-machine)
* [Attach ISO image stored in XenServer local storage](http://www.linuxscrew.com/2012/04/06/local-iso-image-xenserver/)
* [How to add local ISO storage repo in XenServer](http://www.dedoimedo.com/computers/xen-xenserver-local-iso-repo.html)