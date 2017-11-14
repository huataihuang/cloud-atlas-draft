QEMU安装后就可以从一个磁盘镜像运行一个guest OS。从[QEM网站](http://wiki.qemu.org/Testing)可以下载一些测试镜像。

> Deiban的Aurélien Jarno将[QEMU镜像移植到了不同的架构平台](https://people.debian.org/~aurel32/qemu/)。

# QEMU镜像类型

QEMU支持不同镜像类型，从"native"到最复杂的`qcow2`（支持copy on write,加密，压缩和VM快照）。

以下是QMEU支持的镜像类型：

* raw - 默认的raw个是是平面二进制磁盘镜像，移植性极佳。在支持稀疏文件的文件系统，raw格式镜像只在数据记录的时候才使用实际使用磁盘空间。
* cloop - 压缩的loop格式，主要用于Knooppix和类似的live CD镜像格式
* cow - copy-on-write格式，兼容历史的支持格式，并且在Windows平台QEMU不支持
* qcow - 旧的QEMU copy-on-write格式，历史支持，已经被qcow2取代
* qcow2 - 支持多快照，在不支持稀疏文件的文件系统中使用较小的镜像，可选AES加密，以及zlib压缩
* vmdk - VMware 3 & 4 或这 6的镜像格式
* vdi - VirtualBox 1.1兼容镜像格式，用于和VirtualBox交换镜像
* vhdx - Hyper-V兼容镜像格式，用于Hyper-V 2012或更高甘本的镜像交换
* vpc - Hyper-V历史镜像格式，用于和Virtual PC/Virtual Server/Hyper-V 2008交换镜像

# 创建镜像

* 建议使用QEMU qcow2，可以提供可伸缩的高性能镜像文件：

```
qemu-img create -f qcow2 winxp.img 3G
```

* 最简单的安装guest PS是创建一个启动CD然后告诉QEMU从启动CD启动：

```
qemu -m 256 -hda winxp.img -cdrom winxpsp2.iso -boot d
```

* 启动quest OS时可以使用kqemu内核模块来加速

```
qemu -m 256 -hda winxp.img -cdrom winxpsp2.iso -enable-kvm
```

如果运行x86-64 Linux（即64为）则使用x86-64版本QEMU：

```
qemu-system-x86_64 -m 256 -hda winxp.img -cdrom winxpsp2.iso -enable-kvm
```

* 使用多个磁盘镜像（例如用于交换分区，测试数据，临时文件等）

```
qemu -m 256 -had winxp.img -hdb pagefile.img -hdc testdata.img -hdd tempfiles.img -enable-kvm
```

# Copy on write

qcow2支持的"cow" (copy on write)时可以设置使用镜像并且不需要更改原始镜像的方法。要基于一个已有的镜像创建新镜像，可以使用`qemu-img`的`backing_file`选项，这样可以基于一个已有镜像创建新镜像，并且新镜像的修改只涉及到新的变化部分：

```
qemu-img create -f qcow2 -o backing_file=winxp.img test01.img
qemu -m 256 -hda test01.img -enable-kvm &
```

> 注意
>
> * 在使用copy-on-write虚拟环境时，建议使用版本管理管理，如subversion，cvs，git在服务器扩展虚拟环境。这样可以保持工作的虚拟环境副本。
> * `backing_file`镜像必须设置成对VM只读，否则有可能会破坏镜像，导致所有基于这个镜像的衍生镜像损坏。

# 在host物理服务器挂载镜像

* 可以使用以下命令在host主机上挂载镜像

```
mount -o loop,offset=32256 /path/to/image.img /mnt/mountpoint
```

要检查镜像的`offset`值，使用如下命令

```
fdisk -l /path/to/image.img
```

如果镜像的扇区开始是128，并且扇区大小是512,则offset就是65535。

> 注意：不要在QEMU使用镜像的时候挂载镜像

* 对于其他类型的qemu镜像，可以使用`qemu-nbd`

```
modprobe nbd max_part=16
qemu-nbd -c /dev/nbd0 image.qcow2
partprobe /dev/nbd0
mount /dev/nbd0p1 /mnt/image
```

* 使用`fdisk`获取`nbd0`的不同分区信息

```
$ fdisk /dev/nbd0
 Command (m for help): p
 Disk /dev/nbd0: 4294 MB, 4294967296 bytes
 255 heads, 63 sectors/track, 522 cylinders, total 8388608 sectors
 Units = sectors of 1 * 512 = 512 bytes
 Sector size (logical/physical): 512 bytes / 512 bytes
 I/O size (minimum/optimal): 512 bytes / 512 bytes
 Disk identifier: 0x000183ca
      Device  Boot     Start        End      Blocks   Id  System
 /dev/nbd0p1   *        2048      499711      248832   83  Linux
 /dev/nbd0p2          501758     8386559     3942401    5  Extended
 /dev/nbd0p5          501760     8386559     3942400   8e  Linux LVM
```

* LVM类型分区不能使用`mount`，需要如下操作

```
$ vgscan
  Reading all physical volumes. This may take a while...
  Found volume group "ub1110server-qemu" using metadata type lvm2
$ vgchange -ay
   2 logical volume(s) in volume group "ub1110server-qemu" now active
$ mount /dev/ub1110server-qemu/<LogicalVolumeName> /mnt/image
```

* 卸载nbd的镜像方法

```
$ umount /mnt/image
$ qemu-nbd -d /dev/nbd0
$ vgchange -an VolGroupName
$ killall qemu-nbd
```

`nbd`表示`Network Block Device`，这里是本地使用，也可以将镜像输出给其他服务器使用挂载。

# 复制镜像到物理设备

镜像也可以复制到物理设备，例如创建机群：

* 磁盘镜像需要是raw格式：

```
$ qemu-img convert -O raw diskimage.qcow2 diskimage.raw
```

* 然后dd到硬盘：

```
dd if=diskimage.raw of=/dev/sdX
```

* 或者使用`qemu-img`直接写入到硬盘（只需要一条命令）

```
# qemu-img convert -O raw diskimage.qcow2 /dev/sdX
```

> `警告`：要注意写入正确的磁盘设备！！！

# 获取磁盘格式信息

`qemu-img`程序可以告知我们磁盘镜像的类型，虚拟大小，物理大小，以及镜像中的快照：

```
qemu-img info CentOS7.vhd
```

显示案例：

```
block-vpc: open disk_type:3, total_sectors:41943040
block-vpc: open get free_data_block_offset:4076462080, page_size:4096, block_size:2097152, bitmap_size:512, max_table_entries:10240 
image: CentOS7.vhd
file format: vpc
virtual size: 20G (21474836480 bytes)
disk size: 3.8G
cluster_size: 2097152
```

# 镜像设施转换

`qemu-img`工具可以用来转换镜像格式，或者为镜像添加压缩或加密特性：

* `-f fmt` - 可选，指定输入文件的镜像格式（通常QEMU能够自动检测输入镜像的格式）
* `-O fmt` - 指定输出格式
* `-e` - 输出镜像文件加密（可以通过密码保护）
* `-c` - 输出镜像文件压缩（但是不能同时启用加密）
* `-6` - 当转换成vmdk格式（VMware），指定输出兼容VMware 6

举例：

```
qemu-img convert -O qcow2 CentOS7.vhd CentOS7.qcow2
```

> 

# 参考

* [QEUM/Images](https://en.wikibooks.org/wiki/QEMU/Images)