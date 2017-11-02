# 设置macOS + Fedora双启动说明

实际上只要先安装macOS，调整好空白分区，然后通过U盘启动Fedora安装，将Fedora安装到空白分区就可以实现双启动。

虽然Grub 2启动macOS还不能正确实现（因为最新的macOS High Sierra采用了APFS文件系统），但是MacBook启动时候提供了一种切换磁盘分区的方法，即按住`option`键再按电源键，提供了双操作系统磁盘分区切换的功能。所以，不需要第三方启动管理器也能够实现Dual boot。

> 实际操作即采用此方法，后面文档是我的实践记录，提供一些参考。

----

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

最初通过Fedora Live CD安装的操作系统之后，Grub自动接管了启动（覆盖了启动引导），替换了rEFInd，但是在Grub启动菜单中选择`/dev/sda (macOS)`之后，终端提示信息：

```
error: can't find command 'xnu_uuid'.
error: can't find command 'xnu_kernel64'.
error: can't find command 'xnu_kextdir'.

Press any key to continue...
```

然后又返回到最初的Grub启动菜单选择。

这个问题在[Bug 903937 - Mac OS X GRUB entries don't work](https://bugzilla.redhat.com/show_bug.cgi?id=903937)提到了解决方法，即参考[Grub error on Mb Air, dual boot F18+ Lion ](https://forums.fedoraforum.org/showthread.php?t=288002)执行以下步骤：

* 编辑`/etc/default/grub`添加`GRUB_DISABLE_OS_PROBER=true`
* 编辑`/etc/grub.d/40_custom`添加针对OS X的一个入口：

```
#!/bin/sh
exec tail -n +3 $0
# This file provides an easy way to add custom menu entries.  Simply type the
# menu entries you want to add after this comment.  Be careful not to change
# the 'exec tail' line above.

menuentry "macOS High Sierra" {
        insmod hfsplus
        set root=(hd1,gpt2)
        chainloader /System/Library/CoreServices/boot.efi
        boot
}
```

> 注意`/dev/sda2`是Mac分区，这里可以通过`parted`工具显示分区信息的对应的编号

```
# parted
GNU Parted 3.2
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) print                                                            
Model: ATA APPLE SSD SM0512 (scsi)
Disk /dev/sda: 500GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags: 

Number  Start   End    Size    File system  Name                  Flags
 1      20.5kB  210MB  210MB   fat32        EFI System Partition  boot, esp
 2      210MB   256GB  256GB
 3      256GB   256GB  210MB   hfs+         Linux HFS+ ESP
 4      256GB   257GB  1074MB  ext4
 5      257GB   500GB  243GB                                      lvm
```

然后运行`grub2-mkconfig`更新`grub.cfg`

```
sudo grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
```

> 注意：在MacBook上使用的是EFI启动，所以不是常规的`grub2-mkconfig -o /boot/grub2/grub.cfg`指令输出启动配置。

详细的设置方法参考 [Install Fedora 21 on MacAir 7,2](http://elatov.github.io/2015/04/install-fedora-21-on-macair-72/)

> **实际最后没有成功**，每次启动macOS分区都会遇到无法加载kernel报错。这个问题我觉得是因为使用了最新的macOS High Sierra系统，使用了最新的APFS导致的，尚未得到支持。所以上述操作方法存档备用。

# 使用system-boot工具

> 未尝试


# 参考

* [archlinux: MacBookPro 11.x](https://wiki.archlinux.org/index.php/MacBookPro11,x)
* [Install Fedora 21 on MacAir 7,2](http://elatov.github.io/2015/04/install-fedora-21-on-macair-72/)