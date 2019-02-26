在部署[Linux from Stratch](../../lfs/introduce)时，考虑到在只有64GB磁盘空间的MacBook Air上安装LFS，磁盘空间有限，所以决定把编译LFS的host系统（采用Ubuntu）安装到U盘上。

# 安装Ubuntu Budgie

Ubuntu Budgie是一个[Ubuntu flavours](https://www.ubuntu.com/download/flavours)版本，结合了[Budgie Desktop](https://budgie-desktop.org)的发行版。

## 创建Ubuntu HDD磁盘的ESP（EFI System Partition)

在使用UEFI的硬盘必须具有一个ESP(EFI System Partition)才能启动操作系统。ESP是一个具有特殊标记的FAT32分区，告诉EFI BIOS检查这个分区的启动信息。在安装过程中，最重要的一步就是创建ESP:

* 使用 `gparted` 进行分区，创建的第一个分区200Mb，设置文件系统是 `fat32`，然后将这个分区设置上 `boot` 和 `esp` 标记，这样EFI BIOS可以使用这个特殊分区。

Ubuntu Budgie安装过程的分区类型设置，其中有一项设置类型就是 `ESP` ，务必将U盘的第一个分区设置成`ESP`，这样才能确保在使用EFI系统的Apple MacBook Air上启动系统。

参考 [Install Ubuntu Budgie 18.04](https://linuxhint.com/install_ubuntu_budgie_1804/) 安装。如果要在常规的Ubuntu系统上安装Budgie Desktop则参考 [How To Install Budgie Desktop 10.4 On Ubuntu 16.04, 17.04, 17.10?](https://fossbytes.com/how-to-install-budgie-desktop-10-4-ubuntu-16-04-17-10/)

## Nvidia驱动导致无法登陆图形桌面的解决方法

MacBook Air 2010 later版本硬件使用了Nvdia 驱动，这样[图形界面登陆失败](https://bugs.launchpad.net/ubuntubudgie/+bug/1675830)，解决方法是[安装Nvidia 390驱动](https://askubuntu.com/questions/223501/ubuntu-gets-stuck-in-a-login-loop)。

默认安装的 `nvidia-current` 可能会安装错误的驱动，所以需要搜索实际视频卡的最新兼容驱动，即使用 `sudo apt-cache search nvidia-[0-9]+$` 找到可用软件包，然后手工安装：

```
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
sudo apt-cache search nvidia-[0-9]+$
sudo apt install nvidia-390
```

请参考 [How to Install NVIDIA 390.25 in Ubuntu 17.10, 18.04](http://tipsonubuntu.com/2018/01/31/install-nvidia-390-25-ubuntu-17-10-18-04/) ，或者参考 [How To Install The Latest Nvidia Drivers In Ubuntu or Linux Mint Via PPA](http://www.webupd8.org/2016/06/how-to-install-latest-nvidia-drivers-in.html)

另外 [How to install the NVIDIA drivers on Ubuntu 18.04 Bionic Beaver Linux](https://linuxconfig.org/how-to-install-the-nvidia-drivers-on-ubuntu-18-04-bionic-beaver-linux) 详细介绍了安装Nvidia驱动的各种方法。其中介绍了 `graphics-drivers` 这个PPA仓库是使用unstalbe系统的beta版本Nvdia驱动

```
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
ubuntu-drivers devices
sudo ubuntu-drivers autoinstall
```

`ubuntu-drivers devices`可以显示出当前驱动:

```
== /sys/devices/pci0000:00/0000:00:17.0/0000:02:00.0 ==
modalias : pci:v000010DEd000008A2sv0000106Bsd000000D4bc03sc00i00
vendor   : NVIDIA Corporation
model    : MCP89 [GeForce 320M]
driver   : nvidia-304 - third-party free
driver   : nvidia-340 - distro non-free recommended
driver   : xserver-xorg-video-nouveau - distro free builtin

== /sys/devices/pci0000:00/0000:00:15.0/0000:01:00.0 ==
modalias : pci:v000014E4d00004353sv0000106Bsd000000D1bc02sc80i00
vendor   : Broadcom Limited
model    : BCM43224 802.11a/b/g/n (AirPort Extreme)
driver   : bcmwl-kernel-source - distro non-free
```

`sudo ubuntu-drivers autoinstall` 会自动安装推荐的驱动，也技术

最后一行命令也可以修改成指定安装驱动版本

```
sudo apt install nvidia-340
```

> 悲剧了：升级了beta版本的nvdia驱动，现在启动后黑屏...

参考 [Ubuntu 18.04 on Macbook Air 13 (2010) - SOLVED](https://ubuntuforums.org/showthread.php?t=2390492) 可能需要关闭开源驱动的nodemode功能

不过，Nvidia 的官方驱动 [Linux x64 (AMD64/EM64T) Display Driver Version: 	340.107](https://www.nvidia.com/Download/driverResults.aspx/135161/en-us) 就是版本 nvdia-340 ，看上去就是默认安装版本。



# 之前的失败尝试

之前尝试了几次，包括在笔记本上插2个U盘，其中一个U盘采用`dd`命令将ISO文件写入作为Live-CD，启动后将操作系统安装到另外一个U盘。但是，没有想到，MacBook Air启动时按下`option`键并没有看到安装后的Ubuntu磁盘。

参考[Making a portable full installation of Ubuntu on a USB HDD](https://www.dionysopoulos.me/portable-ubuntu-on-usb-hdd/)，我发现原因是MacBook使用了EFI启动，如果不在U盘上设置一个`ESP`分区，就会导致无法使用U盘启动。

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

# 参考

* [Making a portable full installation of Ubuntu on a USB HDD](https://www.dionysopoulos.me/portable-ubuntu-on-usb-hdd/) - 这份指南提供了在EFI上启动USB磁盘的方法
* [How to Install The Real Ubuntu System on USB Flash Drive](http://ubuntuhandbook.org/index.php/2014/11/install-real-ubuntu-os-usb-drive/)
* [ LiveCD/Persistence](https://help.ubuntu.com/community/LiveCD/Persistence)
----
* 安装Nvidia驱动方法：
  * [2 Ways to Install Nvidia Driver on Ubuntu 18.04 (GUI & Command Line)](https://www.linuxbabe.com/ubuntu/install-nvidia-driver-ubuntu-18-04)
  * [How to install the NVIDIA drivers on Ubuntu 18.04 Bionic Beaver Linux](https://linuxconfig.org/how-to-install-the-nvidia-drivers-on-ubuntu-18-04-bionic-beaver-linuxe)