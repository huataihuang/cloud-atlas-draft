> 本文将演示如何添加虚拟磁盘活LUN到KVM guest虚拟机，以及如何在线更改现有虚拟磁盘大小。整个操作无须停止guest操作系统。KVM支持物理LUN映射和虚拟磁盘映射到虚拟机。要映射虚拟磁盘，需要使用`qemu-img`命令来创建虚拟磁盘映像，而磁盘格式或者是`img`或者是`qcow2`。当然，你还是使用`dd`命令创建一个"无空隙"磁盘映像。

# 映射SAN或SCSI磁盘到KVM虚拟机

* 使用root账号登录到KVM Hypervisor主机（物理服务器）
* 这里假设我们在hypervisor节点从SAN存储获得了"`/dev/sdb`" LUN
* 使用`virsh`命令列出运行的虚拟机

```
[root@UA-HA ~]# virsh list
 Id    Name                           State
----------------------------------------------------
 32    UAKVM2                         running
[root@UA-HA ~]#
```

* 检查UAKVM2虚拟机的设备映射

```
[root@UA-HA ~]# virsh domblklist UAKVM2 --details
Type       Device     Target     Source
------------------------------------------------
file       disk       vda        /var/lib/libvirt/images/UAKVM2.qcow2
block      cdrom      hda        -
[root@UA-HA ~]#
```

* 将LUN连接到`UAKVM2`虚拟机作为`vdb`设备

```
[root@UA-HA ~]# virsh attach-disk UAKVM2 --source /dev/sdb --target vdb --persistent
Disk attached successfully
[root@UA-HA ~]#
```

* 检查完成的工作

```
[root@UA-HA ~]# virsh domblklist UAKVM2 --details
Type       Device     Target     Source
------------------------------------------------
file       disk       vda        /var/lib/libvirt/images/UAKVM2.qcow2
block      disk       vdb        /dev/sdb
block      cdrom      hda        -
[root@UA-HA ~]#
```

* 登录到`UAKVM2` KVM虚拟机中查看新添加的磁盘

```
[root@UA-KVM1 ~]# fdisk -l /dev/vdb

Disk /dev/vdb: 536 MB, 536870912 bytes, 1048576 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

[root@UA-KVM1 ~]#
```

以上已经成功在线将SAN LUN映射到KVM虚拟机的`/dev/sdb`

# 添加新虚拟磁盘到KVM Guests

要映射一个虚拟磁盘到KVM虚拟机需要以下步骤：

* 使用`qemu-img`命令创建一个新的虚拟磁盘
* 连接虚拟磁盘到guest domain

* 登录到`UAKVM2`虚拟机内部检查连接的虚拟磁盘

```
[root@UA-KVM1 ~]# fdisk -l |grep vd |grep -v Linux
Disk /dev/vda: 4294 MB, 4294967296 bytes, 8388608 sectors
Disk /dev/vdb: 536 MB, 536870912 bytes, 1048576 sectors
[root@UA-KVM1 ~]#
```

* 登录到KVM Hypervisor主机（物理服务器）
* 使用`qemu-img`命令创建一个新的虚拟磁盘

```
[root@UA-HA images]# cd /var/lib/libvirt/images
[root@UA-HA images]# qemu-img create -f qcow2 UAKVM2.disk2.qcow2 1G
Formatting 'UAKVM2.disk2.qcow2', fmt=qcow2 size=1073741824 encryption=off cluster_size=65536 lazy_refcounts=off
[root@UA-HA images]#
```

注意：所有环境中的存储池路径将不同

也可以使用以下方式创建虚拟磁盘，即raw格式：

```
[root@UA-HA images]# qemu-img create -f raw UAKVM2.disk3.img 256M
Formatting 'UAKVM2.disk3.img', fmt=raw size=268435456
[root@UA-HA images]#
```

或者创建预分配存储磁盘（预分配存储可以获得更好的性能）

```
[root@UA-HA images]# dd if=/dev/zero of=UAKVM2.disk4.img bs=1M count=1000
1000+0 records in
1000+0 records out
1048576000 bytes (1.0 GB) copied, 14.6078 s, 71.8 MB/s
[root@UA-HA images]#
```

检查存储池中的虚拟磁盘大小

```
[root@UA-HA images]# du -sh UAKVM2.disk*
196K    UAKVM2.disk2.qcow2      --- qcow2 formatted virtual disk file (thin)
0       UAKVM2.disk3.img        --- raw  formatted virtual disk file (thin)
1000M   UAKVM2.disk4.img        --- raw  formatted virtual disk file using dd command. 
[root@UA-HA images]#
```

* 将虚拟磁盘添加到KVM虚拟机

```
[root@UA-HA images]# virsh attach-disk UAKVM2 --source /var/lib/libvirt/images/UAKVM2.disk2.qcow2 --target vdc --persistent
Disk attached successfully
[root@UA-HA images]#
```

* 验证工作

```
[root@UA-HA images]# virsh domblklist UAKVM2 --details
Type       Device     Target     Source
------------------------------------------------
file       disk       vda        /var/lib/libvirt/images/UAKVM2.qcow2
block      disk       vdb        /dev/sdb
file       disk       vdc        /var/lib/libvirt/images/UAKVM2.disk2.qcow2
block      cdrom      hda        -
[root@UA-HA images]#
```

* 登录到虚拟机（`UAKVM2`）检查新添加的磁盘

```
[root@UA-KVM1 ~]# fdisk -l /dev/vdc
Disk /dev/vdc: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
[root@UA-KVM1 ~]#
```

以上我们成功地在线添加了KVM虚拟机的虚拟磁盘

# 在KVM中调整虚拟磁盘

* 登录到Guest VM(`UAKVM2`)检查磁盘

```
[root@UA-KVM1 ~]# df -h /orastage
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdc       1014M   33M  982M   4% /orastage
[root@UA-KVM1 ~]# mount -v |grep /orastage
/dev/vdc on /orastage type xfs (rw,relatime,attr2,inode64,noquota)
[root@UA-KVM1 ~]#
[root@UA-KVM1 ~]# fdisk -l /dev/vdc

Disk /dev/vdc: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

[root@UA-KVM1 ~]#
```

* 登录到KVM Hypervisor主机（物理服务器）
* 检查已经映射到KVM虚拟机的虚拟磁盘

```
[root@UA-HA ~]# virsh domblklist UAKVM2 --details
Type       Device     Target     Source
------------------------------------------------
file       disk       vda        /var/lib/libvirt/images/UAKVM2.qcow2
block      disk       vdb        /dev/sdb
file       disk       vdc        /var/lib/libvirt/images/UAKVM2.disk2.qcow2
block      cdrom      hda        -

[root@UA-HA ~]#
```

* 刷新KVM存储池

```
[root@UA-HA ~]# virsh pool-list
 Name                 State      Autostart
-------------------------------------------
 default              active     yes
 [root@UA-HA ~]#
[root@UA-HA ~]# virsh pool-refresh default
Pool default refreshed
[root@UA-HA ~]#
```

* 使用`virsh vol-list`命令列出虚拟磁盘（`vdc = UAKVM2.disk2.qcow2`）

```
[root@UA-HA ~]# virsh vol-list  default
 Name                 Path
------------------------------------------------------------------------------
 UAKVM2.disk2.qcow2   /var/lib/libvirt/images/UAKVM2.disk2.qcow2
 UAKVM2.disk3.img     /var/lib/libvirt/images/UAKVM2.disk3.img
 UAKVM2.disk4.img     /var/lib/libvirt/images/UAKVM2.disk4.img
 UAKVM2.qcow2         /var/lib/libvirt/images/UAKVM2.qcow2
[root@UA-HA ~]#
```

* 使用`qemu-monitor`列出`UAKVM2`域分配到块设备

```
[root@UA-HA ~]# virsh qemu-monitor-command UAKVM2 --hmp "info block"
drive-virtio-disk0: removable=0 io-status=ok file=/var/lib/libvirt/images/UAKVM2.qcow2 ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-virtio-disk1: removable=0 io-status=ok file=/dev/sdb ro=0 drv=raw encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-virtio-disk2: removable=0 io-status=ok file=/var/lib/libvirt/images/UAKVM2.disk2.qcow2 ro=0 drv=raw encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-0-0: removable=1 locked=0 tray-open=0 io-status=ok [not inserted]
[root@UA-HA ~]#
```

上述命令输出显示`UAKVM2.disk2.qcow2`被影射到`drive-virtio-disk2`

* 增加虚拟磁盘大小（注意：千万不要缩小磁盘）

```
[root@UA-HA images]# virsh qemu-monitor-command UAKVM2 --hmp "block_resize drive-virtio-disk2 2G"
[root@UA-HA images]#
```

* 登录到KVM虚拟机`UAKVM2`然后检查`vdc`磁盘大小

```
[root@UA-KVM1 ~]# fdisk -l /dev/vdc

Disk /dev/vdc: 2147 MB, 2147483648 bytes, 4194304 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

[root@UA-KVM1 ~]#
```

* 扩展文件系统，这里使用的文件系统是XFS

```
[root@UA-KVM1 ~]# df -h /orastage
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdc       1014M   33M  982M   4% /orastage
[root@UA-KVM1 ~]# mount -v |grep /orastage
/dev/vdc on /orastage type xfs (rw,relatime,attr2,inode64,noquota)
[root@UA-KVM1 ~]#
[root@UA-KVM1 ~]# xfs_growfs /orastage/
meta-data=/dev/vdc               isize=256    agcount=4, agsize=65536 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=0        finobt=0
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=0
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 262144 to 1310720
[root@UA-KVM1 ~]#
[root@UA-KVM1 ~]# df -h /orastage/
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdc        2.0G   33M  2.0G   1% /orastage
[root@UA-KVM1 ~]#
```

以上成功增加了虚拟机磁盘大小

# 系列教程编译

本系列教程根据 [UnixArena Linux KVM](http://www.unixarena.com/category/redhat-linux/linux-kvm) 系列教程编译，共分以下文章：

* [一：基于内核的虚拟机（KVM）概览](kernel_based_virtual_machine_kvm_overview)
* [二：Redhat企业Linux安装KVM](redhat_enterprise_linux_kvm_installation)
* [三：RHEL 7.2 配置KVM主机](rhel_7_2_configuring_kvm_hosts)
* [四：使用命令行启动第一个KVM实例](launch_the_first_kvm_instance_using_cli)
* [五：使用Virt-Manger(VMM)部署KVM实例](deploy_kvm_instance_using_virt_manger_vmm_gui)
* [六：如何克隆一个KVM虚拟机并重置该虚拟机](how_to_clone_a_kvm_virtual_machines_and_reset_the_vm)
* [七：如何在线添加/更改虚拟磁盘](how_to_add_resize_virtual_disk_on_fly)
* [八：如何在线添加/移除虚拟机的内存](how_to_add_remove_memory_to_guest_on_fly)
* [九：如何在线添加/移除虚拟机的vCPU](how_to_add_remove_vcpu_to_guest_on_fly)
* [十：更改libvirt虚拟机镜像存储路径](change_libvirt_vm_image_store_path)
* [十一：实现Linux KVM在线迁移](perform_live_migration_on_linux_kvm)
* [十二：RHEL7 Pacemaker - 配置高可用KVM虚拟机](rhel_7_pacemaker_configuring_ha_kvm_guest)