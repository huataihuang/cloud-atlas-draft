# rEFInd在Fedora上运行的问题

在MacBook Pro上安装Linux是通过[rEFInd](http://www.rodsbooks.com/refind/installing.html)来实现安装的。类似以前在[MacBook上安装Gentoo](../../gentoo/install_gentoo_on_macbook)，先在macOS中运行安装rEFInd，这样就可以控制启动从盘安装Fedora。

不过，Fedora安装似乎破坏了rEFInd配置，启动时候直接进入了Fedora Grub，导致无法启动到macOS，所以在Fedora中，再次安装rEFInd，运行：

```
sudo rpm -Uvh refind-0.11.2-1.x86_64.rpm
```

执行

```
refind-install
```

出现报错

```
ShimSource is none
Installing rEFInd on Linux....
The ESP doesn't seem to be mounted! Trying to find it....
Mounting ESP at //boot/efi
ESP was found at //boot/efi using vfat
Found rEFInd installation in //boot/efi/EFI/refind; upgrading it.
Installing driver for ext4 (ext4_x64.efi)
Copied rEFInd binary files

Notice: Backed up existing icons directory as icons-backup.
Existing refind.conf file found; copying sample file as refind.conf-sample
to avoid overwriting your customizations.

Could not identify ESP in AddBootEntry()!
Existing //boot/refind_linux.conf found; not overwriting.
```

检查磁盘分区`fdisk -l`显示

```
Device         Start       End   Sectors   Size Type
/dev/sda1         40    409639    409600   200M EFI System
/dev/sda2     409640 500409639 500000000 238.4G unknown
/dev/sda3  500410368 500819967    409600   200M Apple HFS/HFS+
/dev/sda4  500819968 502917119   2097152     1G Linux filesystem
/dev/sda5  502917120 977104895 474187776 226.1G Linux LVM
```

这里可以看到EFI文件系统分区是`/dev/sda1`，通过`df`命令可以看到挂载

```
/dev/sda1                197M   25M  173M  13% /boot/efi
```

参考[Archlinux: MacBookPro11,x](https://wiki.archlinux.org/index.php/MacBookPro11,x)是建议通过使用 [systemd-boot](https://wiki.archlinux.org/index.php/Systemd-boot)或者[Grub](https://wiki.archlinux.org/index.php/GRUB)来完成双启动，并不需要使用第三方工具rEFInd。建议在UEFI系统使用System-boot。


# 使用Grub

参考[Mac#Using the native Apple bootloader with GRUB](https://wiki.archlinux.org/index.php/Mac#Using_the_native_Apple_bootloader_with_GRUB)



# 使用system-boot工具

* 首先确认EFI系统分许挂载在`/boot`



# 参考

* [archlinux: MacBookPro 11.x](https://wiki.archlinux.org/index.php/MacBookPro11,x)