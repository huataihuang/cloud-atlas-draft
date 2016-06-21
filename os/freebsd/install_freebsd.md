# 准备安装U盘

在MacOS中准备磁盘，可能需要先卸载自动挂载的U盘：

```bash
sudo diskutil unmountDisk /dev/disk2s3
```

执行镜像写入U盘

```bash
sudo dd if=FreeBSD-11.0-CURRENT-amd64-20160518-r300097-memstick.img of=/dev/rdisk2 bs=100m conv=sync
```

> `memstick.img`是支持`EFI boot block`启动，所以磁盘

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


# 安装注意

* Booting / disk layout issues
  * The BIOS does not handle GPT-labelled disks that boot via BIOS (default install layout for FreeBSD). It seems to assume that the present of a GPT means it should expect an UEFI partition. Using MBR partition and BSD label with UFS works fine. - x220的BIOS不支持GPT标记的磁盘启动，似乎是对x220而言GPT就是需要UEFI分区。使用BSD分区UFS标记的分区工作正常。
  * Using ZFS with MBR is reported to not work with FreeBSD's bootloader (but does work with grub) - 使用MBR的ZFS文件系统被报告不能使用FreeBSD的bootloader启动，但是可以使用grub
  * See PR#194359 for the bug report and fix
  * Booting with UEFI works - UEFI启动正常

验证 FreeBSD 11 alpha 4版本可以安装在ThinkPad X220笔记本，并且会提示该型号笔记本BIOS有bug，可以在Installer中fix

安装后无线网卡设置见 [FreeBSD无线网络](freebsd_wireless.md)

# 参考

* [Installing FreeBSD: Pre-Installation Tasks](https://www.freebsd.org/doc/handbook/bsdinstall-pre.html)
* [Lenovo Thinkpad X220](https://wiki.freebsd.org/Laptops/Thinkpad_X220)
* [ThinkPad X220 and the upcoming FreeBSD 10](https://forums.freebsd.org/threads/42716/)