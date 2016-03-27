# 制作Gentoo Linux安装U盘

* 在OS X 的Terminal终端，使用以下命令将`.iso`文件转换成`.img`

```bash
hdiutil convert -format UDRW -o livedvd-amd64-multilib-20140826.img livedvd-amd64-multilib-20140826.iso
```

> 这里选择使用livedvd而不是常用的minimal是因为：
>
> Mac设备需要使用EFI stub loader，但是需要注意EFI限制了boot loaderc参数，所以需要将参数结合到内核中 （[How to install Gentoo ONLY Mid-2012 macbook air](https://forums.gentoo.org/viewtopic-t-966240-view-previous.html?sid=8ccb81a5f18e9e1f7cb5ab533847ff93)）。[UEFI Gentoo Quick Install Guide](https://wiki.gentoo.org/wiki/UEFI_Gentoo_Quick_Install_Guide)指出需要使用`UEFI-enabled`启动介质，如LiveDVD或者Gentoo-based [SystemRescueCD](http://www.sysresccd.org/SystemRescueCd_Homepage)，详细参考 [Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:Main_Page)。此外，也可以参考[Arch Linux on a MacBook](https://wiki.archlinux.org/index.php/MacBook)

> OS X会自动添加`.dmg`文件名后缀，所以实际生成的文件名是`livedvd-amd64-multilib-20140826.img.dmg`

* 检查当前可用设备，可以看到插入的U盘的对应设备

```bash
diskutil list

/dev/disk2 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *16.0 GB    disk2
   1:                 DOS_FAT_16 NO NAME                 209.7 MB   disk2s1
   2:                 DOS_FAT_32 DATA                    15.8 GB    disk2s2
```

* 卸载掉被挂载的分区

```bash
sudo diskutil unmountDisk /dev/disk2s2
```

* 执行镜像写入U盘

```bash
sudo dd if=livedvd-amd64-multilib-20140826.img.dmg of=/dev/rdisk2 bs=100m
```

# 安装

MacBook Air使用UEFI启动，需要使用UEFI和GPT。参考 [Apple Macbook Pro Retina - Bootloader](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina#Bootloader) ，需要使用EFI boot manager，不能使用Apple的Bootcamp。选择有两个：[rEFIt](http://refit.sourceforge.net) 和 [rEFInd](http://www.rodsbooks.com/refind/)。

由于rEFIt已经不在继续开发，并且不被OSX Yosemite所支持，所以建议使用目前仍然在活跃开发的rEFInd。

rEFInd是从rEFIt项目fork出来的，并且支持传递内核参数。rEFInd是一个启动管理器，在主机首次启动时候提供菜单选项，当它加载了一个OS内核后会放弃控制。（从版本3.3.0开始，Linux内核包含了一个内建的boot loader）所有EFI-capable OS都包含了一个boot loader。实际上，Linux内核可以作为自己的一个EFI boot loader工作，这使得rEFInd特性类似Linux的一个boot loader。

> [Arch Linux - Unified Extensible Firmware Interface](https://wiki.archlinux.org/index.php/Unified_Extensible_Firmware_Interface) 提供了详细的介绍EFI技术。

* 从 [rEFInd](http://www.rodsbooks.com/refind/) 下载最新的binary zip文件

需要将获取的rEFInd二进制文件安装到主机的EFI系统分区，这个安装取决于操作系统和主机（UEFI的PC或者Macintosh）。在Linux或Mac OS X上，最简单的安装rEFInd的方法是使用`install.sh`脚本，这个脚本自动复制rEFInd文件到ESP或者其它目标位置，并更改firmware的NVRAM设置，这样下次启动就会启动rEFInd。如果你已经在UEFI-based主机上启动到OS X或者非安全启动EFI模式的Linux，`install.sh`就会这样操作。如果安装无效，或者主机是使用secure boot，或者希望创建一个使用rEFInd的U盘，则需要阅读[extra instructions](http://www.rodsbooks.com/refind/installing.htmlM

> 如果以后对Linux不满，需要回归Mac环境，也可以使用Mac的安装镜像重新安装一遍OS X，安装过程会清理掉rEFind

解压缩以后，执行其中的`install.sh`脚本

```bash
cd refind-bin-0.10.2
./refind-install
```

> 只要过程中没有明显报错，即为安装成功，然后重启系统，可以看到启动初始界面被替换成`rEFInd`菜单界面，此时就可以选择从原先的Mac OS X启动，或者从安装U盘启动。此时选择Gentoo Linux安装启动盘，就可以开始正常的安装流程了。

如果已经安装过一次rEFInd则上述方法有所不同，需要重新安装 rEFInd:

* 重启
* 在听到chime声音的时候按`Command+R`（进入Mac的recovery模式）
* 当OS启动后，选择 Utilities -> Terminal
* 进入到下面的目录（和你存放refind下载解压缩的目录有关）

    cd /Volume/OS X/Users/huatai/Downloads/refind-bin-0.10.1

重新运行 `./refind-install`
* 重启就可也看到rEFInd启动界面（不需要使用`option`键），表明rEFInd接管了EFI启动，这样就可以开始从U盘Linux启动进行安装了。