在部署[Linux from Stratch](../../lfs/introduce)时，考虑到在只有64GB磁盘空间的MacBook Air上安装LFS，磁盘空间有限，所以决定把编译LFS的host系统（采用Ubuntu）安装到U盘上。

尝试了几次，包括在笔记本上插2个U盘，其中一个U盘采用`dd`命令将ISO文件写入作为Live-CD，启动后将操作系统安装到另外一个U盘。但是，没有想到，MacBook Air启动时按下`option`键并没有看到安装后的Ubuntu磁盘。

参考了[How to Install The Real Ubuntu System on USB Flash Drive](http://ubuntuhandbook.org/index.php/2014/11/install-real-ubuntu-os-usb-drive/)发现我有一步做错了：

* 安装过程中，不能使用默认的`Install Ubuntu alonside MacOS`（原先我的笔记本有一个分区时Mac，但是这个是笔记本内置硬盘`/dev/sda`），这会导致GRUB启动管理器被安装到`sda`磁盘（虽然在Mac上启动按下`option`键可以跳过GRUB没有导致实际产生破坏），而不是安装到U盘`sdb`。

* 无法启动的原因：MacBook使用了EFI启动，上述手工设置分区的时候，实际上没有能够正确设置EFI分区，导致无法正常启动。已经反复测试，不论是安装到U盘或者本地磁盘，如果定制分区，则没有正确的EFI设置，就会导致MacBook无法识别和启动Ubuntu。这个问题有待我再仔细研究以下EFI启动。

# 具体操作

> 操作需要2个U盘，一个是LiveCD磁盘，一个是安装目标磁盘。这两个磁盘都在MacOS操作系统中格式成FAT文件格式，磁盘分区表类型MBR。这步操作是为了生成标准的DOS分区，实际在Liunx下也能操作。

## 对LiveCD的U盘操作

### 使用`dd`命令创建LiveCD启动U盘（实际操作）

```
sudo dd bs=4M if=xubuntu-16.04.3-desktop-amd64.iso of=/dev/sdb
```

### 使用UNetbooin创建LiveCD启动U盘（可选方法）

* 首先将U盘格式化成`FAT32`文件系统，然后挂载到`/mnt`目录（这是 [UNetbootin](http://unetbootin.github.io/) 的使用要求)

```
sudo mount /dev/sdb1 /mnt
```

* 使用[UNetbootin](http://unetbootin.github.io/)选择安装ISO镜像，写入到上述FAT32分区中。

```
sudo QT_X11_NO_MITSHM=1 /usr/bin/unetbootin
```

> 注意：这个LiveCD磁盘识别成`sdb`

## 对于Windows 8预装主机需要关闭`fast startup`和`secure boot`（未验证）

> `secure boot`时UEFI的一个安全功能，只从已经在UEFI firmware中签名的boot loader启动，这样可以避免rootkit malware以及提供一个附加安全层。

注意：对于预装了Windows 8的主机，必须要关闭`fast startup`和`secure boot`功能

Control Panel > Hardware and Sound > Power Options > System Settings > 选择d电源按钮，去除`fast startup`选项。

关闭`secure boot`则参考[How To Disable UEFI Secure Boot In Windows 8 & 8.1](https://itsfoss.com/disable-uefi-secure-boot-in-windows-8/)

## 对目标安装U盘分处理

* 启动LiveCD，再使用`GParted`工具直接删除目标U盘（`sdc`）的FAT32分区，这样可以空出完整的U盘用于安装Ubuntu。

## 安装操作系统Ubuntu

* 选择安装类型时一定要选择`Something else`，这样就可以选择分区表：

![分区类型](../../../../img/os/linux/ubuntu/install/something-else.jpg)

* `重要`：分区一定要按照以下规则：
  * 一个FAT32(或FAT16)分区（必须）
    * 必须是`/dev/sdX1`
    * 挂载点时`/NAME_HERE`（在案例中是`/UDISK`）
    * 设置成内存相同大小，用于存放普通数据
    * 其他选项默认即可
  * 一个EXT4文件系统用于安装Ubuntu（必须）
    * 挂载点`/`
    * 设置足够安装系统的空间大小（通常10G应该足够安装操作系统及常用软件）
  * swap分区（可选）
    * 如果你的主机内存足够大并且不许要使用hibernate可以不使用swap

* 最重要的一点是将boot-loader安装到USB flash驱动器`/dev/sdc`上，这样才能够在启动时选择该磁盘。

> 注意：在MacBook笔记本上安装需要使用64位版本的Ubuntu，如果需要安装broadcom驱动，参考 http://askubuntu.com/questions/626642/how-to-install-broadcom-wireless-drivers-offline

> [How to Install The Real Ubuntu System on USB Flash Drive](http://ubuntuhandbook.org/index.php/2014/11/install-real-ubuntu-os-usb-drive/)的读者留言中Valter Fukuoka介绍了使用2个甚至3个U盘来构建RAID0安装Ubuntu，可以使得程序启动加速。另外，有用户报告Mac使用这种方式无法找到启动U盘，但也有报告成功的。
>
> 目前我的实践，采用上述安装方法在MacBook Air上，由于定制分区没有正确激活UEFI，所以无法识别和启动操作系统。有待进一步探索。

# 参考

* [How to Install The Real Ubuntu System on USB Flash Drive](http://ubuntuhandbook.org/index.php/2014/11/install-real-ubuntu-os-usb-drive/)
* [ LiveCD/Persistence](https://help.ubuntu.com/community/LiveCD/Persistence)