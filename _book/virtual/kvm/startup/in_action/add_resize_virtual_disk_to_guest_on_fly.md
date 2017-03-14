> 通过组合合适的VM文件系统功能（例如支持在线resize的XFS文件系统）和QEMU底层`virsh qemu-monitor-command`指令可以实现在线动态调整虚拟机磁盘容量，无需停机，对维护在线应用非常方便。本文实践在线不停机情况下添加KVM虚拟机磁盘以及在线扩展Linux虚拟机磁盘及文件系统。（Windows扩容虚拟磁盘需要重启vm后识别）

> 本文虚拟机磁盘扩容（resize）部分步骤需要在VM内部使用操作系统命令，所以适合自建自用的测试环境。

> 生产环境reize虚拟机磁盘系统，可采用[libguestfs](http://libguestfs.org/)来修改虚拟机磁盘镜像。`libguestfs`可以查看和编辑guest内部文件，脚本化修改VM，监控磁盘使用和空闲状态，以及创建虚拟机，P2V,V2V，以及备份，clone虚拟机，构建虚拟机，格式化磁盘，resize磁盘等等。

# 快速起步

> 案例使用的虚拟机名字是`dev7`，增加和resize的磁盘文件是`dev7-data.img`

* 创建虚拟磁盘文件（qcow2类型）

```
cd /var/lib/libvirt/images
qemu-img create -f qcow2 dev7-data.img 20G
```

* 虚拟磁盘文件添加到虚拟机

`qemu`可以映射物理存储磁盘（`/dev/sdb`）或虚拟磁盘文件到KVM虚拟机`my_vm`的虚拟磁盘(`vdb`)，语法如下

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent --driver qemu --subdriver qcow2
```

> 注意：这里一定要指定`--driver qemu --subdriver qcow2`，因为`libvirtd`出于安全因素默认关闭了虚拟磁盘类型自动检测功能，并且默认使用的磁盘格式是`raw`，如果不指定磁盘驱动类型会导致被识别成`raw`格式，就会在虚拟机内部看到非常奇怪的极小的磁盘。

* （演示动态扩容磁盘文件系统）`在dev7虚拟机内部`格式化文件系统和挂载文件系统

```
mkfs.xfs /dev/vdb

mkdir /data
echo "/dev/vdb                /data                   xfs     defaults        0 0" >> /etc/fstab

mount /data
```

> 此时在`dev7`虚拟机内部`df -h /data`可以看到输出信息显示磁盘20G

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         20G   33M   20G   1% /data
```

* 检查虚拟设备详细情况

```
virsh qemu-monitor-command dev7 --hmp "info block"
```

这里可以看到`dev7-data.img`虚拟磁盘文件对应的块信息

```
drive-virtio-disk1: removable=0 io-status=ok file=/var/lib/libvirt/images/dev7-data.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
```

* 在线修改虚拟磁盘大小

```
virsh qemu-monitor-command dev7 --hmp "block_resize drive-virtio-disk1 30G"
```

* 在`dev7虚拟机内部`

此时在`dev7`虚拟机内部`fdisk -l /dev/vbd`可以看到磁盘设备已经增长到30G

在虚拟机内部调整文件系统（XFS可以在线调整挂载磁盘的文件系统大小）

```
xfs_growfs /data/
```

> 此时在`dev7`虚拟机内部`df -h /data`可以看到输出信息显示磁盘30G

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         30G   33M   30G   1% /data
```

* Windows虚拟机磁盘添加和扩展方法类似，但需要注意处理`virtio`驱动以及磁盘resize后需要重启VM操作系统才能识别。详细见下文。

----

# `以下是实践过程记录`

----

# Linux虚拟机

## 添加磁盘

* 检查虚拟机列表

```
virsh list
```

以下操作针对`dev7`虚拟机操作

* 检查虚拟机`dev7`的虚拟磁盘设备

```
virsh qemu-monitor-command dev7 --hmp "info block"
```

> `--hmp`表示`human monitor command`，可以直接传入monitor中操作的命令，不需要任何格式转换。如果缺少`--hmp`，则monitor会认为接收`json`格式命令，会出现错误，如`internal error cannot parse json info kvm: lexical error: invalid char in json text`

这里输出显示

```
drive-virtio-disk0: removable=0 io-status=ok file=/var/lib/libvirt/images/dev7.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-0-0: removable=1 locked=0 tray-open=0 io-status=ok [not inserted]
```

* 创建一个本地的虚拟磁盘文件

```
cd /var/lib/libvirt/images
qemu-img create -f qcow2 dev7-data.img 20G
```

显示输出（初始文件只有193K）

```
Formatting 'dev7-data.img', fmt=qcow2 size=10737418240 encryption=off cluster_size=65536 lazy_refcounts=off
```

> **`警告`**
>
> 不要在运行虚拟机所连接的磁盘镜像上使用`qemu-img`命令修改镜像，有可能会导致镜像损坏。

检查新创建的磁盘信息

```
qemu-img info /var/lib/libvirt/images/dev7-data.img
```

这里输出显示

```
image: /var/lib/libvirt/images/dev7-data.img
file format: qcow2
virtual size: 10G (10737418240 bytes)
disk size: 196K
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: false
```

> `qemu-img`也支持磁盘格式转换

```
qemu-img convert -O vmdk /images/sles11sp1.raw /images/sles11sp1.vmdk
```

* 将磁盘文件映射添加到虚拟机`dev7`

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent
```

提示

```
Disk attached successfully
```

* 检查添加的虚拟磁盘

```
virsh domblklist dev7 --details
```

显示输出

```
Type       Device     Target     Source
------------------------------------------------
file       disk       vda        /var/lib/libvirt/images/dev7.img
file       disk       vdb        /var/lib/libvirt/images/dev7-data.img
block      cdrom      hda        -
```

* 登录到虚拟机`dev7`内部检查

```
fdisk -l /dev/vdb
```

可以看到输出

```
Disk /dev/vdb: 0 MB, 197120 bytes, 385 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

> 这里比较奇怪，在虚拟机内部看到的磁盘只有`0 MB, 197120 bytes, 385 sectors`，并不是`qemu-img create`命令创建的10G磁盘。（尝试重启了一次虚拟机也没有解决问题）

* 在虚拟机内部格式化磁盘文件系统会提示报错 - 因为对虚拟机内部来说这个虚拟磁盘没有可用空间

```
mkfs.xfs /dev/vdb
```

提示报错

```
size 48 of data subvolume is too small, minimum 100 blocks
```

但是在物理服务器上可以看到设备文件是10G

```
file dev7-data.img
```

显示输出

```
dev7-data.img: QEMU QCOW Image (v3), 10737418240 bytes
```

这个问题困扰了我，直到我通过`virsh edit dev7`查看这个虚拟机设备配置才发现，原来`virsh attach-disk`添加磁盘设备时候没有指定磁盘设备类型，被默认添加成`raw`类型，对比了原虚拟机系统`vda`设备和`vdb`设备：

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/dev7.img'/>
      <target dev='vda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </disk>
    <disk type='file' device='disk'>
      <driver name='qemu' type='raw'/>
      <source file='/var/lib/libvirt/images/dev7-data.img'/>
      <target dev='vdb' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
    </disk>
```

所以重新添加设备

```
virsh detach-disk dev7 /var/lib/libvirt/images/dev7-data.img --persistent
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent --type qcow2
```

但是提示`error: unsupported configuration: unknown disk device 'qcow2'`，似乎不能正确传递`--type`参数。

> 我搞错了，不是传递`--type qcow2`，而是使用`--driver qcow2`

检查`/etc/libvirt/qemu.conf`配置，原来为了安全原因，默认关闭了虚拟机镜像磁盘类型检测，即默认是注释掉 `#allow_disk_format_probing = 1`，建议通过更新guest XML的`<disk>`段落配置设置磁盘类型`<driver type='XXXX'/>`。

这里测试环境适当放低安全限制，生产环境不建议使用，而是应该通过控制系统来修订磁盘类型

```
# If allow_disk_format_probing is enabled, libvirt will probe disk
# images to attempt to identify their format, when not otherwise
# specified in the XML. This is disabled by default.
#
# WARNING: Enabling probing is a security hole in almost all
# deployments. It is strongly recommended that users update their
# guest XML <disk> elements to include  <driver type='XXXX'/>
# elements instead of enabling this option.
#
allow_disk_format_probing = 1
```

然后再次使用

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent 
```

但是还是出现报错`error: unsupported configuration: unsupported driver name '(null)' for disk '/var/lib/libvirt/images/dev7-data.img'`，则参考`sda`系统盘配置传递参数

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/dev7.img'/>
      <target dev='vda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </disk>
```

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent --driver qemu
```

此时确实在`dev7`虚拟机内部看到了正确的磁盘大小，但是`virsh edit dev7`显示的`sdb`设备配置并没有自动加上类型`type='qcow2'`

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/dev7.img'/>
      <target dev='vda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </disk>
    <disk type='file' device='disk'>
      <driver name='qemu'/>
      <source file='/var/lib/libvirt/images/dev7-data.img'/>
      <target dev='vdb' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x08' function='0x0'/>
    </disk>
```

所以，我觉得开启`libvirtd`的`allow_disk_format_probing = 1`并没有什么方便，还是手工传递参数比较准确。即再次编辑`/etc/libvirt/qemu.conf`注释掉`#allow_disk_format_probing = 1`，再重启`systemctl restart libvirtd.service`。然后重新传递完整参数挂载磁盘

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent --driver qemu --type qcow2
```

依然失败`unsupported configuration: unknown disk device 'qcow2'`！！！ 仔细看了 `virsh help attach-disk`帮助，发现传递参数实际上是和XML文件对应的。所以

```
<driver name='qemu' type='qcow2'/>
```

对应的参数是

```
    --driver <string>  driver of disk device
    --subdriver <string>  subdriver of disk device
```

即正确的命令是

```
virsh attach-disk dev7 --source /var/lib/libvirt/images/dev7-data.img --target vdb --persistent --driver qemu --subdriver qcow2
```

**终于成功**

> 参考 [Supported qemu-img Formats](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/sect-Using_qemu_img-Supported_qemu_img_formats.html) 说明，默认使用`raw`格式，这个格式是最快的虚拟磁盘文件格式。如果文件系统支持空洞（例如`ext2`或`ext3`，则只有写过的扇区将使用空间）。使用`qemu-img info`可以获得镜像的实际大小，或者使用`ls -l`。不过，虽然`raw`格式镜像有性能优势，但是只支持基本特性。例如，`raw`格式不支持快照。

* 在虚拟机内部创建文件系统

```
mkfs.xfs /dev/vdb

mkdir /data
echo "/dev/vdb                /data                   xfs     defaults        0 0" >> /etc/fstab

mount /data
```

挂载之后查看`/data`分区可以看到20G可用空间

```
/dev/vdb                  20G   33M   20G   1% /data
```

## resize Linux磁盘

> **注意**：只有`raw`格式支持双向resize（扩大或缩小），`qcow2`版本2或`qcow2`版本3的镜像只支持扩大(grown)不支持缩小(shrunk)

```
qemu-img resize filename [+|-]size[K|M|G|T]
```

* 将磁盘文件扩容到30G

```
qemu-img resize /var/lib/libvirt/images/dev7-data.img 30G
```

* 此时在虚拟机内部`fdisk -l /dev/vbd`查看磁盘是看不到磁盘空间增长到30G，依然是原先的20G

```
Disk /dev/vdb: 21.5 GB, 21474836480 bytes, 41943040 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

这说明`qemu-img resize`只在hypervisor层调整了虚拟磁盘镜像，所以我们需要采用`qemu-monitor`的底层命令

* 使用`qemu-monitor`底层命令获取虚拟机内部磁盘信息

```
virsh qemu-monitor-command dev7 --hmp "info block"
```

信息显示输出

```
drive-virtio-disk0: removable=0 io-status=ok file=/var/lib/libvirt/images/dev7.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-0-0: removable=1 locked=0 tray-open=0 io-status=ok [not inserted]
drive-virtio-disk1: removable=0 io-status=ok file=/var/lib/libvirt/images/dev7-data.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
```

则我们需要扩容的磁盘是`drive-virtio-disk1` （对应`dev7-data.img`）

```
virsh qemu-monitor-command dev7 --hmp "block_resize drive-virtio-disk1 30G"
```

此时再在虚拟机内部`fdisk -l`检查磁盘就可以看到`vbd`磁盘已经扩容到30G

```
Disk /dev/vdb: 32.2 GB, 32212254720 bytes, 62914560 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

* 不过此时XFS文件系统`/data`还看不到增长的磁盘空间，我们还需要使用XFS支持的动态扩容

```
# df -h /data
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         20G   33M   20G   1% /data

# mount -v | grep /data
/dev/vdb on /data type xfs (rw,relatime,seclabel,attr2,inode64,noquota)
```

* 扩容XFS

```
# xfs_growfs /data/
```

显示输出

```
meta-data=/dev/vdb               isize=512    agcount=4, agsize=1310720 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=5242880, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 5242880 to 7864320
```

再次检查文件系统`/data`可以看到已经30G空间

```
# df -h /data
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         30G   33M   30G   1% /data
```

# Windows虚拟机

## `virtio`设备驱动

> Windows虚拟机默认安装采用了`IDE`磁盘类型设备，性能较差，需要转换成`virtio`磁盘类型才能在KVM环境得到较好的性能。不过，Windows发行版并没有这个KVM Praavirtualized(virtio)驱动，需要独立安装以便识别出`virtio`磁盘。
>
> `virtio`驱动盘安装方法参考 [KVM Paravirtualized (virtio) Drivers](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Virtualization_Host_Configuration_and_Guest_Installation_Guide/chap-Virtualization_Host_Configuration_and_Guest_Installation_Guide-Para_virtualized_drivers.html)

* 在HOST物理服务器上安装`virtio`驱动盘(针对物理服务器RHEL 6.8操作系统)

```
yum install virtio-win
```

> 安装后，在`/usr/share/virtio-win/`有`virtio-win.iso`驱动ISO镜像，在`virtio`磁盘添加到Windows虚拟机之后，Windows操作系统会识别到新设备，就可以引导从该镜像安装驱动。
>
> 如果要在Windows安装时候就直接安装到`virtio`半虚拟化磁盘（`viostor/virtio-scsi`）上，则需要在Windows安装过程中选择`virtio-win.iso`驱动或者虚拟软盘镜像`virtio-win<version>.vfd`

RHEL/CentOS 7没有找到`virtio-win`软件包，参考 [Windows Virtio Drivers](https://fedoraproject.org/wiki/Windows_Virtio_Drivers) 直接下载 [Latest virtio-win iso](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/latest-virtio/virtio-win.iso) 或 [Stable virtio-win iso](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso) 存放到 `/var/lib/libvirt/images`目录下，连接到虚拟机

```
virsh attach-disk windev /var/lib/libvirt/images/virtio-win.iso hdb --type cdrom
```

> 这里`hdb`设备是从`virsh edit windev`查看的CDROM对应设备

如果原先在Windows虚拟机中已经添加了iso设备，则擦用`virsh update-device`（从XML文件获取配置）命令来更换ISO镜像 - 先创建`virtio-iso.xml`文件内容如下

```
<disk type='file' device='cdrom'>
  <driver name='qemu' type='raw'/>
  <source file='/var/lib/libvirt/images/virtio-win.iso'/>
  <backingStore/>
  <target dev='hdb' bus='ide'/>
  <readonly/>
  <alias name='ide0-0-1'/>
  <address type='drive' controller='0' bus='0' target='0' unit='1'/>
</disk>
```

然后执行

```
virsh update-device windev virtio-iso.xml
```

> 如果要持久替换，则使用`virsh update-device windev virtio-iso.xml --persistent`

## 增加磁盘设备

* 检查虚拟机列表

```
virsh list
```

以下操作针对`windev`虚拟机操作

* 检查虚拟机`windev`的虚拟磁盘设备

```
virsh qemu-monitor-command windev --hmp "info block"
```

这里输出显示

```
drive-ide0-0-0: removable=0 io-status=ok file=/var/lib/libvirt/images/windev.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-0-1: removable=1 locked=0 tray-open=0 io-status=ok file=/var/lib/libvirt/images/win2012.iso ro=1 drv=raw encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
```

* 创建一个本地的虚拟磁盘文件

```
cd /var/lib/libvirt/images
qemu-img create -f qcow2 windev-data.img 20G
```

* 添加磁盘设备

```
virsh attach-disk windev --source /var/lib/libvirt/images/windev-data.img --target vdb --persistent --driver qemu --subdriver qcow2
```

* 在Windows虚拟机中更新`virtio`驱动识别新增磁盘设备

在Windows虚拟机添加了`virtio`磁盘设备`vdb`之后，使用Window设备管理器可以看到新增加了一个`SCSI控制器`，此时还没有驱动安装，所以无法使用。在这个`SCSI控制器`设备上右击鼠标，选择`更新驱动程序软件...`，然后搜索`D:\`驱动器更新驱动程序

[virtio设备](../../../../img/virtual/kvm/startup/in_action/virtio_scsi.png)

> 可以同时更新另外一个没有识别的`PCI设备`驱动，方法相同，这个原先未识别到`PCI设备`实际上是`VirtIO Balloon Driver`

此时打开`计算机管理（本地）`工具查看`磁盘管理`(或者命令行调用`diskmgmt.msc`)可以看到新增了一块`未知且脱机`的20G磁盘，就是我们刚才动态添加的磁盘设备

[virtio设备识别](../../../../img/virtual/kvm/startup/in_action/virtio_disk.png)

按照Windows操作系统增加磁盘方法，先将新增磁盘`联机`，然后再`初始化`(创建MBR或GPT分区)

[virtio设备联机](../../../../img/virtual/kvm/startup/in_action/virtio_disk_link.png)

[virtio设备初始化](../../../../img/virtual/kvm/startup/in_action/virtio_disk_init.png)

然后再创建`简单卷`（分配盘符格式化）

[virtio设备格式化](../../../../img/virtual/kvm/startup/in_action/virtio_disk_format.png)

完成后即可使用磁盘

## resize Windows磁盘

* 检查虚拟设备详细情况

```
virsh qemu-monitor-command windev --hmp "info block"
```

这里可以看到`windev-data.img`虚拟磁盘文件对应的块信息

```
drive-virtio-disk1: removable=0 io-status=ok file=/var/lib/libvirt/images/windev-data.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
```

* 在线修改虚拟磁盘大小

```
virsh qemu-monitor-command windev --hmp "block_resize drive-virtio-disk1 30G"
```

此时在物理服务器查看文件可以看到增长到30G

```
qemu-img info windev-data.img
```

这里输出显示

```
image: windev-data.img
file format: qcow2
virtual size: 30G (32212254720 bytes)
disk size: 87M
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: false
```

但是在Windows虚拟内部还看不到磁盘空间增加依然显示是20G

**没有找到不停止Windows虚拟机动态扩展磁盘方法**，通过关闭Windows操作系统然后再次启动操作系统，就可以看到磁盘从20G更改到了30G：

[virtio设备resize](../../../../img/virtual/kvm/startup/in_action/virtio_disk_resize.png)

接下来只需要在Windows虚拟机中扩展磁盘分区就可以完整使用扩容后的30G磁盘空间。

# 参考

* [七：如何在线添加/更改虚拟磁盘](../how_to_add_resize_virtual_disk_on_fly)
* [Features/Qcow3](http://wiki.qemu-project.org/Features/Qcow3)
* [用VIRSH执行QEMU MONITOR中的命令](http://smilejay.com/2012/12/virsh-use-qemu-monitor-command/)
* [Re-sizing the Disk Image](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/sect-Using_qemu_img-Re_sizing_the_disk_image.html)