默认情况下树莓派Raspberry Pi是从SD卡启动系统的，但是SD卡存储容量有限，如果能够转换成磁盘启动（SSD/HDD）则可以实现一个海量的存储系统。

树莓派没有内建的SATA接口，如果要接磁盘设备，采用的是USB接口连接的磁盘设备。

> 最初我以为树莓派可以通过扩展卡来支持SATA磁盘，后来参考[Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)，发现类似的解决复方案是通过一种USB连接卡转换成 mSATA 或者 SATA接口，这样就类似于常用的USB接口移动硬盘连接，但使用转接卡可以获得紧凑的转接。
>
> [mSATA](https://baike.baidu.com/item/mSATA)是SATA技术整合在小尺寸装置的接口控制器规范。目前笔记本电脑开始使用这种接口用于固态硬盘。
>
> 

当前SSD固态硬盘价格还远高于HDD磁盘，在组建大容量存储用于存储离线数据或非高性能访问要求数据的，可以考虑采用低廉的HDD组建。

个人组建存储集群，建议采用的HDD，结合开源存储技术如Ceph，可以构建海量存储容量的NAS以及TimeMachine（用于Apple系列产品数据备份），甚至可以组建个人的云计算存储。

# 硬件

> 理论上直接将USB移动硬盘连接到树莓派也可以作为硬盘使用，但是为了方便和紧凑，我使用了硬件[SupTronics X820扩展卡](http://www.suptronics.com/miniPCkits/x820-hardware.html)。这个HDD扩展卡可以从淘宝上购买。

![SupTronics X820扩展卡 Top view](../../img/develop/raspberry_pi/x820-430p1.jpg)

安装过程请参考[SupTronics X820扩展卡安装手册](http://www.suptronics.com/miniPCkits/x820-hardware.html)，主要是安装顺序（固定树莓派的4个螺钉是在硬盘下方，所以要先插上螺钉后才能安装硬盘）。另外需要注意电源线连接，红色火线需要插在Pin4(5V电压)黑色地线插在Pin6 - GPIO接口可以参考微软的Windows10 IoT [Raspberry Pi 2 & 3 Pin Mappings](https://docs.microsoft.com/en-us/windows/iot-core/learn-about-hardware/pinmappings/pinmappingsrpi)：

![Raspberry Pi 2 & 3 Pin Mappings](../../img/develop/raspberry_pi/rp2_pinout.png)

> 

# 设置USB启动模式

在设置树莓派3能够从磁盘启动之前，它首先需要从SD卡启动并配置激活USB启动模式。这个过程是通过在树莓派SoC的OTP(One Time Programmable)内存设置一个激活从USB存储设备启动的。

一旦这个位设置，就不再需要SD卡。但是要注意：任何修改OTP都是永久的，不能撤销。

* 通过更新准备`/boot`目录：

```
sudo apt-get update && sudo apt-get upgrade
```

> 如果已经使用了Raspbian / Raspbian Lite 的 2017-04-10 发布版，则上述更新系统不是必须的。

* 使用以下命令激活USB启动模式

```
echo program_usb_boot_mode=1 | sudo tee -a /boot/config.txt
```

以上命令在`/boot/config.txt`中添加了`program_usb_boot_mode=1`。

使用`sudo reboot`命令重启树莓派，然后检查OTP是否已经设置成可编程：

```
vcgencmd otp_dump | grep 17:
```

确保输出是`17:3020000a`。如果不是这个输出值，责表示OTP还没有成功设置为可编程。

然后就可以从`config.txt`最后删除掉`program_usb_boot_mode`，这样你把这个SD卡插到其他树莓派上不会导致其进入USB启动模式。

> **`注意`**，确保`config.txt`配置文件最后没有空白行。

# 准备USB存储设备

从`2017-04-10`版本开始，可以通过复制方式将操作系统镜像直接安装到USB存储器。这种方式也可以针对一个SD卡。

由于我们已经在[树莓派快速起步](raspberry_pi_quick_start)过程中在SD卡上安装了Raspbian，现在我们可以从已经安装了系统的SD卡中直接复制到磁盘中，就可以保留原先所有做过的更改。

这个过程和从Raspbian镜像复制到SD卡相似，只是需要注意磁盘的命令，一定要确保是从SD卡复制到磁盘。

```
/dev/mmcblk0   SD卡
/dev/sda       USB接口的磁盘
```

当前在SD卡中的分区如下：

```
Disk /dev/mmcblk0: 29.3 GiB, 31486640128 bytes, 61497344 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x5e878358

Device         Boot Start      End  Sectors  Size Id Type
/dev/mmcblk0p1       8192    93236    85045 41.5M  c W95 FAT32 (LBA)
/dev/mmcblk0p2      94208 61497343 61403136 29.3G 83 Linux
```

* 划分USB磁盘分区

使用`fdisk`对磁盘分区，则`msdos`分区表就不会建立`PARTUUID`。但是我测试直接使用`UUID`替代`PARTUUID`来指引设置启动分区没有成功。所以改为`parted`来划分分区，看看能否增加`PARTUUID`

```
# parted --align optimal /dev/sda
(parted) rm 2
(parted) rm 1
(parted) mkpart primary fat32 2048s 50M
(parted) align-check optimal 1
1 aligned
(parted) unit s
(parted) print
Model: JMicron Generic (scsi)
Disk /dev/sda: 976773168s
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start  End     Size    Type     File system  Flags
 1      2048s  98303s  96256s  primary  fat32        lba
(parted) mkpart primary ext4 98304 30G
(parted) align-check optimal 2
2 aligned
(parted) print
Model: JMicron Generic (scsi)
Disk /dev/sda: 976773168s
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start   End        Size       Type     File system  Flags
 1      2048s   98303s     96256s     primary  fat32        lba
 2      98304s  58593279s  58494976s  primary  ext4         lba

(parted) unit MB
(parted) print
Model: JMicron Generic (scsi)
Disk /dev/sda: 500108MB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start   End      Size     Type     File system  Flags
 1      1.05MB  50.3MB   49.3MB   primary  fat32        lba
 2      50.3MB  30000MB  29949MB  primary  ext4         lba
```

> 4k对齐参考[How to align partitions for best performance using parted](https://rainbow.chard.org/2013/01/30/how-to-align-partitions-for-best-performance-using-parted/)，其中参数查看`/dev/sda`，所以第一个分区起始扇区选择`2048s`:

```
root@raspberrypi:~# cat /sys/block/sda/queue/optimal_io_size
0
root@raspberrypi:~# cat /sys/block/sda/queue/minimum_io_size
512
root@raspberrypi:~# cat /sys/block/sda/alignment_offset
0
root@raspberrypi:~# cat /sys/block/sda/queue/physical_block_size
512
```

> 注意：这里划分`/dev/sda2`只分配30G给操作系统使用，因为我准备把剩余的空间作为存储空间，将在后续使用卷管理来维护，并构建Ceph存储。

此时退出`parted`程序，可以看到`parted`工具在划分磁盘分区时候，确实创建了`PARTUUID`（神奇）：

```
root@raspberrypi:~# blkid /dev/sda
/dev/sda: PTUUID="1a99ca08" PTTYPE="dos"
root@raspberrypi:~# blkid /dev/sda1
/dev/sda1: UUID="5F6A-6FC8" TYPE="vfat" PARTUUID="1a99ca08-01"
root@raspberrypi:~# blkid /dev/sda2
/dev/sda2: PARTUUID="1a99ca08-02"
```

但是，此时看不到`UUID`。`UUID`则在`mkfs.ext4 /dev/sda2`之后就会标记上。

> 我感觉使用`tar`方法也应该能够从SD卡中复制出完整的磁盘分区内容到USB磁盘。和普通的PC不同，树莓派会默认尝试搜索可以启动的分区（默认会从SD卡启动，15秒之后将尝试从USB存储启动，即前面修改的配置）。

注意：一定要有一个fat分区用于存放`/boot`分区内容，因为UEFI启动默认会寻找vfat分区内容来启动。

```
Disk /dev/sda: 465.8 GiB, 500107862016 bytes, 976773168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x148374e0

Device     Boot Start      End  Sectors  Size Id Type
/dev/sda1        2048    98303    96256   47M  c W95 FAT32 (LBA)
/dev/sda2       98304 58593279 58494976 27.9G 83 Linux
```

  * 如果使用`dd`命令复制磁盘分区，所以要确保`/dev/sda2`磁盘分区大于源SD卡分区`/dev/mmcblk0p2`。
  * 如果使用`tar`方式复制磁盘文件系统，则目标分区只要能够容纳源`/dev/mmcblk0p2`文件就可以

## 通过`dd`复制磁盘（我没有采用这个方法）

如果使用`dd`复制磁盘，责执行操作系统复制命令如下（不需要区分磁盘分区）：

```
dd if=/dev/mmcblk0 of=/dev/sda conv=fsync
```

> 注意`/dev/mmcblk0p1`是`vfat`文件系统，挂载成`/boot`目录。UEFI启动需要使用一个单独的FAT分区。

> `dd`复制命令参考了在Linux中制作镜像到SD卡的命令 [INSTALLING OPERATING SYSTEM IMAGES ON LINUX](https://www.raspberrypi.org/documentation/installation/installing-images/linux.md)

## 通过`tar`复制磁盘（实践成功）

如果使用`tar`方式复制磁盘文件

```
cd /
tar -cpzf backup.tar.gz --exclude=/backup.tar.gz --one-file-system /

mkfs.ext4 /dev/sda2
mount /dev/sda2 /mnt

sudo tar -xpzf /backup.tar.gz -C /mnt --numeric-owner
```

注意：上述备份的`/backup.tar.gz`没有包含`/boot`分区内容。需要先挂载`/mnt/boot`分区之后，再从源分区复制(这个分区是启动分区，必须是`vfat`文件系统)

> 注意：在执行了`mkfs.ext4 /dev/sda2`之后，再使用`blkid /dev/sda2`就能够看到`UUID`，这个`UUID`是文件系统UUID：

```
root@raspberrypi:~# blkid /dev/sda2
/dev/sda2: UUID="b2e461e7-5a68-434d-bda1-c7c137e8c38e" TYPE="ext4" PARTUUID="1a99ca08-02"
```

```bash
# mkfs.vfat /dev/sda1  <= 这里没有指定FAT32文件系统，默认格式化是FAT16
# 检查发现`fdisk`虽然可以通过`c`这个type来标记分区为FAT32，但是如果`mkfs.fat`不指定`-F32`参数
# 会导致文件系统还是`fat16`文件系统，虽然用`fdisk -l`看不出，但是`parted`则能够看到是`fat16`
mkfs.fat -F32 /dev/sda1
mount /dev/sda1 /mnt/boot
(cd /boot && tar cf - .)|(cd /mnt/boot && tar xf -)
```

>  注意：要避免包含目录，使用`--exclude`参数。参考[Exclude Multiple Directories When Creating A tar Archive](https://www.question-defense.com/2012/06/13/exclude-multiple-directories-when-creating-a-tar-archive)。但是我使用如下命令依然包含了不需要的目录（**`失败`**），最后还是参考了Ubuntu的[使用tar方式备份和恢复系统](../../os/linux/ubuntu/install/backup_and_restore_system_by_tar)来实现tar方式复制系统成功。

```
(cd / && tar cf - --exclude "/mnt" --exclude "/sys" --exclude "/proc" --exclude "/lost+found" --exclude "/tmp" .)|(cd /mnt && tar xf -)
```

# 配置修改

> 注意：除非使用`dd`来复制SD卡到HDD才能保持原有的`PARTUUID`，否则使用`parted`划分分区以及使用`mkfs`创建文件系统，都会使得目标磁盘的`UUID`和`PARTUUID`变化。则需要修改启动配置文件反映分区标识的变化。

* 检查当前SD卡的分区UUID，例如如下：

```
pi@raspberrypi:/boot $ sudo blkid /dev/mmcblk0p1
/dev/mmcblk0p1: LABEL="boot" UUID="CDD4-B453" TYPE="vfat" PARTUUID="5e878358-01"

pi@raspberrypi:/boot $ sudo blkid /dev/mmcblk0p2
/dev/mmcblk0p2: LABEL="rootfs" UUID="72bfc10d-73ec-4d9e-a54a-1cc507ee7ed2" TYPE="ext4" PARTUUID="5e878358-02"

pi@raspberrypi:/boot $ sudo blkid /dev/mmcblk0
/dev/mmcblk0: PTUUID="5e878358" PTTYPE="dos"
```

> 有点疑惑：`/dev/mmcblk0`使用`parted`检查显示是`msdos`分区表，但是使用`blkid`检查可以看到具有`PARTUUID`。参考[Persistent block device naming](https://wiki.archlinux.org/index.php/persistent_block_device_naming)，原文介绍`GPT`分区表支持`PARTUUID`。不过，我实践发现树莓派默认安装的系统使用的是`msdos`分区表，但是也具有`PARTUUID`。测试验证发现，通过使用`parted`工耦划分磁盘分区就会有`PARTUUID`。
>
> 以下是`/dev/mmcblk0`在`parted`中`print`输出

```
Model: SD SD32G (sd/mmc)
Disk /dev/mmcblk0: 31.5GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start   End     Size    Type     File system  Flags
 1      4194kB  47.7MB  43.5MB  primary  fat32        lba
 2      48.2MB  31.5GB  31.4GB  primary  ext4
```

上述可以看到

| 分区 | PARTUUID |
| `/dev/mmcblk0p1` | `5e878358-01` |
| `/dev/mmcblk0p2` | `5e878358-02` |

> 我测试发现，如果使用`dd`命令来复制磁盘分区，则HDD磁盘的`/dev/sda1`和`/dev/sda2`的`PARTUUID`会和原先的TF卡完全相同，即依然保持`5e878358-01`和`5e878358-02`。这样就不用修改HDD文件系统中的配置。

但是通过磁盘`parted`和`mkfs.ext4`创建的HDD文件系统，然后再通过`tar`恢复操作系统。此时磁盘`PARTUUID`和`UUID`不同，则要修改对应配置`/boot/cmdline.txt`和`/etc/fstab`。例如：

```bash
root@raspberrypi:~# blkid /dev/sda1
/dev/sda1: UUID="47D1-C570" TYPE="vfat" PARTUUID="1a99ca08-01"
root@raspberrypi:~# blkid /dev/sda2
/dev/sda2: UUID="b2e461e7-5a68-434d-bda1-c7c137e8c38e" TYPE="ext4" PARTUUID="1a99ca08-02"
```

* 检查`/boot/cmdline.txt`配置文件，可以看到原先配置内容如下

```
pi@raspberrypi:/boot $ cat cmdline.txt
dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=PARTUUID=5e878358-02 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait
```

这里可以看到`root=PARTUUID=5e878358-02`就是SD卡的分区`/dev/mmcblk0p2`对应的`PARTUUID="5e878358-02"`

* 根据前述检查USB磁盘的分区`UUID`，即`e3f5b3fb-297c-44fe-b763-566b51b87524`，注意，我们要将启动指向分区`/dev/sda2`，因为这个分区就是从`/dev/mmcblk0p2`通过`tar`方式复制出来的。修改`/mnt/boot/cmdline.txt`（该文件位于`/dev/sda2`这个HDD分区文件系统中）

```
dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=PARTUUID=1a99ca08-02 rootfstype=ext4 elevator=cfq fsck.repair=yes rootwait
```

> 这里修改了2个地方：
> 
> * `root=PARTUUID=e3f5b3fb-297c-44fe-b763-566b51b87524` 指向HDD磁盘分区`/dev/sda2`表示从USB外接的硬盘启动
> * `evevator=cfq` 是修改原先针对SSD/SDCARD/TFCARD这类固态硬盘优化参数`deadline`，现在修改成针对HDD硬盘优化参数`cfq`

* 修改`/mnt/etc/fstab`配置文件，修改`/`行中`PARTUUID`内容

```
proc            /proc           proc    defaults          0       0
PARTUUID=5e878358-01  /boot           vfat    defaults          0       2
PARTUUID=5e878358-02  /               ext4    defaults,noatime  0       1
```

* 关机，然后取出TF卡，再次加电，此时树莓派将从外接USB的HDD磁盘启动

> 测试下来，如果再次使用TF卡，依然能够优先从TF卡启动树莓派。只有TF卡不可用时候，才会从USB HDD启动。

# 参考

* [Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)
* [HOW TO BOOT FROM A USB MASS STORAGE DEVICE ON A RASPBERRY PI 3](https://www.raspberrypi.org/documentation/hardware/raspberrypi/bootmodes/msd.md)