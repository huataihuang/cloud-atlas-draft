# 准备安装U盘

在MacOS中准备磁盘，可能需要先卸载自动挂载的U盘：

```bash
sudo diskutil unmountDisk /dev/disk2s3
```

执行镜像写入U盘

```bash
sudo dd if=FreeBSD-11.0-RELEASE-amd64-memstick.img of=/dev/rdisk2 bs=100m conv=sync
```

> `memstick.img`是支持`EFI boot block`启动

# ThinkPad X220

在ThinkPad X220上安装FreeBSD 11会在启动U盘的时候hang住，参考[ThinkPad X220 and the upcoming FreeBSD 10](https://forums.freebsd.org/threads/42716/)

* 即使最新的BIOS 1.39，也不能使用传统启动方式从GPT分区启动，并且FreeBSD 10还不支持UEFI启动 - 似乎需要刷新BIOS来支持
* 文档中记载X220不能在BIOS设置Legacy boot的设置下从GPT分区启动 - [Problems with the Thinkpad X220 and GPT, UEFI, MBR and Legacy BIOS Booting](http://blog.jamiek.it/2011/10/problems-with-thinkpad-x220-and-gpt.html) / [Installing Gentoo on a ThinkPad X220](http://www.thinkwiki.org/wiki/Installing_Gentoo_on_a_ThinkPad_X220) (这篇文档提供了有关BIOS更新的信息：包括如何更新BIOS) / [ThinkPad X220 4290型 Windows 7 32位驱动（最新的BIOS 1.42-1.24下载）](http://think.lenovo.com.cn/support/driver/newdriversdownlist.aspx?yt=pt&categoryid=3091100&CODEName=4290&SearchType=1&wherePage=2&SearchNodeCC=ThinkPad+X220&osid=231)
* 对于PC-BSD，有记录显示 `MBR + GRUB + ZFS - PC-BSD 10-R2: Successful!` ，可能需要使用MBR方式来磁盘分区进行安装

## 升级BIOS

* 从 [ThinkPad X220 4290型 官方支持（最新的BIOS 1.42-1.24下载）](http://think.lenovo.com.cn/support/driver/newdriversdownlist.aspx?yt=pt&categoryid=3091100&CODEName=4290&SearchType=1&wherePage=2&SearchNodeCC=ThinkPad+X220&osid=231) 下载 BIOS升级光盘iso文件
* 获取`geteltorito`工具从iso中获取启动镜像

```bash
wget 'http://www.uni-koblenz.de/~krienke/ftp/noarch/geteltorito/geteltorito.pl'
perl geteltorito.pl 8duj10uc.iso > biosupdate.img
```

* 将镜像复制到U盘

```
sudo dd if=biosupdate.img of=/dev/rdisk2 bs=1m conv=sync
```

* 启动电源，按下F12从U盘启动刷新BIOS

* 刷先完成后，重启系统，按F1进入BIOS设置，在`Startup`栏设置`UEFI/Legancy Boot`选项中，设置成`UEFI Only`。这是因为X220s不能使用Legacy BIOS从GPT分区启动

# MacBook Air

> Mac系统的操作系统更新已经内建包含了Fireware更新，所以通常不需要单独安装升级Fireware。 - 参考 [How to Check and Update Your Mac’s Firmware](http://www.chriswrites.com/how-to-check-and-update-your-macs-firmware/)
>
> 不过苹果也提供了独立的[EFI and SMC firmware updates for Intel-based Mac computers](https://support.apple.com/en-us/HT201518)可针对性升级硬件的Fireware。可以对比自己的`Hareware Overview`信息中的`Boot ROM Version`和`SMC Version (system)`版本信息，确定是否需要升级Fireware。

有关在MacBook上安装FreeBSD参考 [Apple MacBook support on FreeBSD](https://wiki.freebsd.org/AppleMacbook)

我的实践是采用`only Installation with ZFS`，类似[在MacBook上安装Gentoo Linux](../linux/gentoo/install_gentoo_on_macbook)，首先在Mac系统中安装rEFInd来管理启动。

> [FreeBSD on a MacBook Pro](https://gist.github.com/mpasternacki/974e29d1e3865e940c53)提供了Preparing for Dual Boot的经验。

MacBook使用EFI stub loader，需要[安装rEFInd](../../../develop/mac/refind)来管理启动

* 首先[下载rEFInd二进制.zip文件](http://www.rodsbooks.com/refind/getting.html)并解压缩
* 重启主机，在听到chime声音的时候按`Command+R`（进入Mac的recovery模式）
* 当OS启动后，选择 Utilities -> Terminal
* 进入到下面的目录（和你存放refind下载解压缩的目录有关，这里假设用户名是`jerry`，所以用户目录就是`/Volume/OS X/Users/jerry`）

```bash
cd /Volume/OS X/Users/jerry/Downloads/refind-bin-0.10.2
./refind-install
```

再次启动系统，再次使用`Command+R`（进入Mac的recovery模式），使用Mac自带的`Disk Utility`划分好用于Linux的分区(即将当前Mac分区缩小)，就可以开始安装双启动系统。

如果想完全使用FreeBSD抛弃Mac，则采用删除Mac分区方法。

当插入FreeBSD memstick之后，使用rEFInd启动系统，会看到有2个启动选项：

* Boot Fallback boot loader from EFI （图标是3个不同颜色圈）
* Boot FreeBSD (Legacy) from whole disk Volume (图标是FreeBSD的小魔头)

我没有想到居然是使用前者来启动（EFI启动）才能进入FreeBSD安装 - 原来在MacBook平台，必须使用EFI启动模式。

# ThinkPad安装注意

* Booting / disk layout issues
  * The BIOS does not handle GPT-labelled disks that boot via BIOS (default install layout for FreeBSD). It seems to assume that the present of a GPT means it should expect an UEFI partition. Using MBR partition and BSD label with UFS works fine. - x220的BIOS不支持GPT标记的磁盘启动，似乎是对x220而言GPT就是需要UEFI分区。使用BSD分区UFS标记的分区工作正常。
  * Using ZFS with MBR is reported to not work with FreeBSD's bootloader (but does work with grub) - 使用MBR的ZFS文件系统被报告不能使用FreeBSD的bootloader启动，但是可以使用grub
  * See PR#194359 for the bug report and fix
  * Booting with UEFI works - UEFI启动正常

验证 FreeBSD 11 alpha 4版本可以安装在ThinkPad X220笔记本，并且会提示该型号笔记本BIOS有bug，可以在Installer中fix

# MacBook Air

* 内置的无线网卡没有识别
* Mac的USB网卡可以直接识别使用(暂时使用此方式连接网络)
* 选择ZFS作为文件系统，安装过程中选择AutoZFS自动分配存储池
* Xorg配置： For the MacBooks you need to use the "intel" Xorg driver. For MacBook Pros you need to use the "radeon" driver. 
* TouchPad: Use the atp(4) driver in FreeBSD 9.0 to get multi finger tapping, among other things. You should ensure that moused is only attaching to /dev/atp0, not /dev/ums0 too; use ps to check otherwise it will be jerky and unreliable. 
* System Management Console (SMC for short) is a device that allows you to read the temperatures, fan speed and keyboard backlight status. It also lets you control the fan minimum and maximum speed and the keyboard backlight on/off status. 

# FreeBSD安装后操作

* 安装后无线网卡设置见 [FreeBSD无线网络](freebsd_wireless.md)
* 安装后安装软件包 [在FreeBSD上安装软件:Packages和Ports](packages_and_ports.md)

```bash
pkg
pkg install sudo lsof aria2 tmux
```

> `aria2`是多线程下载工具，比wget要快速很多（[5 FASTEST LINUX DOWNLOAD MANAGER/ACCELERATOR PROGRAM](http://www.ubuntubuzz.com/2010/06/5-fastest-linux-download.html)）。使用`axel`也可以，不过没有很方便的安装方法。

FreeBSD的`sudoers`配置文件默认位于 `/usr/local/etc/sudoers` ，请使用 `visudo` 工具进行编辑。

* 安装编译开发工具

参考 [How to install g++ on FreeBSD?](http://stackoverflow.com/questions/23180725/how-to-install-g-on-freebsd)

```
pkg install lang/gcc49
```

> 当前也支持安装 gcc5/6

注意，安装完成`gcc49`之后，执行程序命令是`/usr/local/bin/gcc49`，如果希望默认是使用`gcc49`则执行

```
cd /usr/local/bin
ln -s gcc49 gcc
ln -s g++49 g++
```

> 注意：FreeBSD是采用LLVM代替了gcc，所以不安装gcc也可以编译

# 参考

* [Installing FreeBSD: Pre-Installation Tasks](https://www.freebsd.org/doc/handbook/bsdinstall-pre.html)
* [Using bsdinstall](https://www.freebsd.org/doc/handbook/using-bsdinstall.html)
* [Lenovo Thinkpad X220](https://wiki.freebsd.org/Laptops/Thinkpad_X220)
* [ThinkPad X220 and the upcoming FreeBSD 10](https://forums.freebsd.org/threads/42716/)