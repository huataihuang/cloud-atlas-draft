# 制作Gentoo Linux安装U盘

* 在OS X 的Terminal终端，使用以下命令将`.iso`文件转换成`.img`

```bash
hdiutil convert -format UDRW -o livedvd-amd64-multilib-20140826.img livedvd-amd64-multilib-20140826.iso
```

> 这里选择使用livedvd而不是常用的minimal是因为：
>
> Mac设备需要使用EFI stub loader，但是需要注意EFI限制了boot loaderc参数，所以需要将参数结合到内核中 （[How to install Gentoo ONLY Mid-2012 macbook air](https://forums.gentoo.org/viewtopic-t-966240-view-previous.html?sid=8ccb81a5f18e9e1f7cb5ab533847ff93)）。[UEFI Gentoo Quick Install Guide](https://wiki.gentoo.org/wiki/UEFI_Gentoo_Quick_Install_Guide)指出需要使用`UEFI-enabled`启动介质，如LiveDVD或者Gentoo-based [SystemRescueCD](http://www.sysresccd.org/SystemRescueCd_Homepage)，详细参考 [Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:Main_Page)。此外，也可以参考[Arch Linux on a MacBook](https://wiki.archlinux.org/index.php/MacBook)

> OS X会自动添加`.dmg`文件名后缀，所以实际生成的文件名是`livedvd-amd64-multilib-20140826.img.dmg`

> OS X的`hdiutil`支持各种镜像文件的转换，例如`.iso`文件的格式，称为`UDTO`，则可以使用如下命令转换`img`文件到`iso`文件，类似如下：

```bash
convert -format UDTO -o Fedora-Server-DVD-x86_64-23.iso Fedora-Server-DVD-x86_64-23.img
```

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

## rEFInd

MacBook使用EFI stub loader，需要[安装rEFInd](../../../develop/mac/refind.md)来管理启动

* 首先[下载rEFInd二进制.zip文件](http://www.rodsbooks.com/refind/getting.html)并解压缩
* 重启主机，在听到chime声音的时候按`Command+R`（进入Mac的recovery模式）
* 当OS启动后，选择 Utilities -> Terminal
* 进入到下面的目录（和你存放refind下载解压缩的目录有关，这里假设用户名是`jerry`，所以用户目录就是`/Volume/OS X/Users/jerry`）

```bash
cd /Volume/OS X/Users/jerry/Downloads/refind-bin-0.10.2
./refind-install
```

再次启动系统，参考[在Mac上双启动linux](../../../develop/mac/dual_boot_linux_on_mac.md)方式划分好用于Linux的分区，就可以开始安装。

## 磁盘设备准备

> 参考 [Preparing the disks](https://wiki.gentoo.org/wiki/Handbook:AMD64/Installation/Disks)

建议使用GPT分区，但是对于使用BIOS-based主机中使用GPT，则会导致双启动Microsoft Windows失败。这是因为当Windows检测到GPT分区标记时会从EFI启动。

**使用UEFI**

当将Gentoo安装在使用UEFI来启动操作系统（代替BIOS）的诸暨市，注意需要创建一个EFI系统分区。EFI系统分区需要是一个FAT32分区（或者在Linux系统中显示为`vfat`）：

    mkfs.vfat /dev/sda2

> 如果启动分区不是使用FAT32（vfat）文件系统，则系统UEFI firmware将不能找到Linux内核和启动系统

**分区的数量**

分区的数量高度依赖环境，良好的文件系统分区可以提高性能。对于内存足够的系统，甚至可以不使用swap空间，但是对于使用hibernation功能，则需要使用swap空间来存储整个内存

使用`parted`来划分分区

    parted -a optimal /dev/sda

然后`print`命令显示当前分区

	(parted) print                                                            
	Model: ATA APPLE SSD SM064C (scsi)
	Disk /dev/sda: 60.7GB
	Sector size (logical/physical): 512B/512B
	Partition Table: gpt
	Disk Flags: 

	Number  Start   End     Size    File system  Name                  Flags
	 1      20.5kB  210MB   210MB   fat32        EFI System Partition  boot
	 2      210MB   60.0GB  59.8GB  hfs+         Macintosh HD
	 3      60.0GB  60.7GB  650MB   hfs+         Recovery HD

> 可以看到第一个分区是系统的EFI启动分区，并且是`vfat`文件系统，可以看到Mac主机的默认分区表就是使用GPT，所以不需要改变分区类型。（**更改分区类型会导致磁盘所有数据擦除**）

删除分区2和3，只保留EFI分区

	(parted) rm 2                                                             
	(parted) rm 3                                                             
	(parted) print                                                            
	Model: ATA APPLE SSD SM064C (scsi)
	Disk /dev/sda: 60.7GB
	Sector size (logical/physical): 512B/512B
	Partition Table: gpt
	Disk Flags: 

	Number  Start   End    Size   File system  Name                  Flags
	 1      20.5kB  210MB  210MB  fat32        EFI System Partition  boot

创建新的Linux分区（ /boot 分区 256M / 分区 56G ，保留6G左右作为OP）

    (parted) mkpart primary 211 467
    (parted) name 2 boot
    (parted) mkpart primary 468 56480
    (parted) name 3 rootfs

> 保留6G空间不分配是因为MacBook Air使用SSD作为存储，需要预留一些空间不使用作为OP，可以提高访问性能和延长SSD使用寿命
>
> 使用EXT4文件系统 - [SSD存储的EXT4文件系统优化](#SSD存储的EXT4文件系统优化)

最后的分区

	Number  Start   End     Size    File system  Name                  Flags
	 1      20.5kB  210MB   210MB   fat32        EFI System Partition  boot
	 2      211MB   467MB   256MB                boot
	 3      468MB   56.5GB  56.0GB               rootfs

不过，参考[Intel SSD存储优化](#Intel SSD存储优化)，使用secter作为单位，设置4k对齐，采用如下的分区（64G的SSD保留6G）

	Number  Start    End         Size        File system  Name                  Flags
	 1      40s      409639s     409600s     fat32        EFI System Partition  boot
	 2      411648s  911360s     499713s     ext2         boot
	 3      913408s  110313472s  109400065s  ext4         rootfs

对于 128G 的SSD分区如下（保留10G）

	Number  Start    End         Size        File system  Name                  Flags
	 1      40s      409639s     409600s     fat32        EFI System Partition  boot
	 2      411648s  911360s     499713s                  primary
	 3      913408s  217391327s  216477920s               primary

> `parted /dev/sda`中，输入`unit s`，然后计算并调整边界

**创建文件系统**

对于小的分区（小于8GB），当使用ext2,ext3或ext4，需要使用相应的参数以便保留足够的inode。`mke2fs`使用`bytes-per-inode`参数来计算需要使用多少inode。对于小分区，将建议增加inode数量

在`ext2`，使用以下命令

    mk2fs -T small /dev/<device>

在ext3和ext4，添加`-j`参数激活日志

    mk2fs -j -T small /dev/<device>

以下是实际操作记录

    mkfs.ext2 -T small /dev/sda2
    mkfs.ext4 /dev/sda3

然后挂载文件系统

    mount /dev/sda3 /mnt/gentoo
    mkdir /mnt/gentoo/boot
    mount /dev/sda2 /mnt/gentoo/boot

# 安装stage tar文件

下载stage包

    cd /mnt/gentoo
    wget 最新的stage3包

验证SHA512 checksum

    openssl dgst -r -sha512 stage3-amd64-<release>.tar.bz2

或者使用

    sha512sum stage3-amd64-<release>.tar.bz2

验证 Whirlpool checksum

    openssl dgst -r -whirlpool stage3-amd64-<release>.tar.bz2

对比存储在.DIGESTS(.asc)文件中的值确认文件没有被破坏

解压缩

    tar xvjpf stage3-*.tar.bz2 --xattrs

> `p`参数表示Preserve permissions，`--xattrs`表示包含在归档中的扩展属性

# 配置编译参数

编辑 `/mnt/gentoo/etc/portage/make.conf`

    CFLAGS="-march=native -O2 -pipe"
    CXXFLAGS="${CFLAGS}"
    CHOST="x86_64-pc-linux-gnu"
    USE="bindist mmx sse sse2"
    PORTDIR="/usr/portage"
    DISTDIR="${PORTDIR}/distfiles"
    PKGDIR="${PORTDIR}/packages"

> 以上是基本配置，后续可以再做调整

为了能够从最快的镜像网站同步，可以执行以下命令添加最快镜像的3个站点到`make.conf` - 参考 [GENTOO_MIRRORS](https://wiki.gentoo.org/wiki/GENTOO_MIRRORS)

    /usr/bin/mirrorselect -s3 -D -o >> /mnt/gentoo/etc/portage/make.conf

# 复制DNS信息

    cp -L /etc/resolv.conf /mnt/gentoo/etc/

# 挂载文件系统

    mount -t proc proc /mnt/gentoo/proc
    mount --rbind /sys /mnt/gentoo/sys
    mount --make-rslave /mnt/gentoo/sys
    mount --rbind /dev /mnt/gentoo/dev
    mount --make-rslave /mnt/gentoo/dev

> `--make-rslave`参数在后面安装的systemd支持所需

进入新系统

    chroot /mnt/gentoo /bin/bash
    source /etc/profile
    export PS1="(chroot) $PS1"

如果ssh再次登陆则还要执行一遍

    mount --rbind /sys /mnt/gentoo/sys
    mount --make-rslave /mnt/gentoo/sys
    mount --rbind /dev /mnt/gentoo/dev
    mount --make-rslave /mnt/gentoo/dev
    chroot /mnt/gentoo /bin/bash
    source /etc/profile
    export PS1="(chroot) $PS1"

# 配置portage

安装一个portage snapshot

    emerge-webrsync

如果要更新portage，则使用`emerge --sync`，这个命令使用rsync协议同步最新portage

如果同步后有提示需要你阅读新消息，则使用命令

    eselect news list
    eselect news read

来查看提示信息

# 配置正确的profile

`profile`是任何Gentoo系统的构建块。它不仅设置默认的`USE`，`CFLAGS`以及其它重要的变量，而且它还锁定系统到一系列包版本

    eselect profile list

显示输出

	Available profile symlink targets:
	  [1]   default/linux/amd64/13.0 *
	  [2]   default/linux/amd64/13.0/selinux
	  [3]   default/linux/amd64/13.0/desktop
	  [4]   default/linux/amd64/13.0/desktop/gnome
	  [5]   default/linux/amd64/13.0/desktop/gnome/systemd
	  [6]   default/linux/amd64/13.0/desktop/kde
	  [7]   default/linux/amd64/13.0/desktop/kde/systemd
	  [8]   default/linux/amd64/13.0/desktop/plasma
	  [9]   default/linux/amd64/13.0/desktop/plasma/systemd
	  [10]  default/linux/amd64/13.0/developer
	  [11]  default/linux/amd64/13.0/no-multilib
	  [12]  default/linux/amd64/13.0/systemd
	  [13]  default/linux/amd64/13.0/x32
	  [14]  hardened/linux/amd64
	  [15]  hardened/linux/amd64/selinux
	  [16]  hardened/linux/amd64/no-multilib
	  [17]  hardened/linux/amd64/no-multilib/selinux
	  [18]  hardened/linux/amd64/x32
	  [19]  hardened/linux/musl/amd64
	  [20]  default/linux/uclibc/amd64
	  [21]  hardened/linux/uclibc/amd64

如果要构建纯64位环境，没有任何32位应用程序和库，可以使用`non-multilib` profile

     eselect profile set 11

# 配置USE变量

`USE`是Gentoo提供给用户最有力的变量，应用程序可以被编译支持或不支持某些特性。

所有USE flags的完整描述见 `/usr/portage/profiles/use.desc`

如果要完全自己控制参数，可以默认忽略所有USE设置，即开头使用 `-*`

    USE="-* X acl alsa ..."

# 配置时区

## BIOS时间设置local模式

编辑 `/etc/timezone` 设置

    Asia/Shanghai  

编辑 `/etc/conf.d/hwclock` 将 `clock="UTC"` 修改为 `clock="local"` 表示系统时间是本地时间而不是格林威治时间

    # Set CLOCK to "UTC" if your Hardware Clock is set to UTC (also known as  
    # Greenwich Mean Time).  If that clock is set to the local time, then   
    # set CLOCK to "local".  Note that if you dual boot with Windows, then   
    # you should set it to "local".  
    #clock="UTC"  
    clock="local"
	
`/etc/localtime` 做软链接指向时区

    cd /etc  
    rm localtime  
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime  

矫正系统时间

    /etc/init.d/ntp-client restart  

> 启动前要具备 openrc 环境

将矫正后的时间写入BIOS

    hwclock --systohc

# 配置locales

编辑 `/etc/locale.gen`

    en_US ISO-8859-1
    en_US.UTF-8 UTF-8

> 至少要设置一个UTF-8 locale

然后运行

    locale-gen

重新加载环境

    env-update && source /etc/profile

> 设置locale方法参考 [Localization/Guide](https://wiki.gentoo.org/wiki/Localization/Guide)

选择默认locale

    eselect locale list

然后 `eselect locale set 4` 设置`en_US.utf8`

> 其实就是创建了 `/etc/env.d/02locale` 配置文件 

＃ 安装源代码

Gentoo提供了几种内核源代码，对于amd64-based系统，建议使用`sys-kernel/gentoo-sources`

    emerge --ask sys-kernel/gentoo-sources

编译内核源代码有两个方式

* 手工配置并编译
* 使用`genkernel`工具自动编译和安装Linux内核

为方便编辑文件，安装vim

    emerge --ask vim

emerge一个`sys-apps/pciutils`来使用`lspci`获取主机的硬件信息

    emerge --ask sys-apps/pciutils

检查系统硬件

    lspci

可以看到2011年版MacBook Air 11 硬件配置如下

    00:00.0 Host bridge: NVIDIA Corporation MCP89 HOST Bridge (rev a1)
    00:00.1 RAM memory: NVIDIA Corporation MCP89 Memory Controller (rev a1)
    00:01.0 RAM memory: NVIDIA Corporation Device 0d6d (rev a1)
    00:01.1 RAM memory: NVIDIA Corporation Device 0d6e (rev a1)
    00:01.2 RAM memory: NVIDIA Corporation Device 0d6f (rev a1)
    00:01.3 RAM memory: NVIDIA Corporation Device 0d70 (rev a1)
    00:02.0 RAM memory: NVIDIA Corporation Device 0d71 (rev a1)
    00:02.1 RAM memory: NVIDIA Corporation Device 0d72 (rev a1)
    00:03.0 ISA bridge: NVIDIA Corporation MCP89 LPC Bridge (rev a2)
    00:03.1 RAM memory: NVIDIA Corporation MCP89 Memory Controller (rev a1)
    00:03.2 SMBus: NVIDIA Corporation MCP89 SMBus (rev a1)
    00:03.3 RAM memory: NVIDIA Corporation MCP89 Memory Controller (rev a1)
    00:03.4 Co-processor: NVIDIA Corporation MCP89 Co-Processor (rev a1)
    00:04.0 USB controller: NVIDIA Corporation MCP89 OHCI USB 1.1 Controller (rev a1)
    00:04.1 USB controller: NVIDIA Corporation MCP89 EHCI USB 2.0 Controller (rev a2)
    00:06.0 USB controller: NVIDIA Corporation MCP89 OHCI USB 1.1 Controller (rev a1)
    00:06.1 USB controller: NVIDIA Corporation MCP89 EHCI USB 2.0 Controller (rev a2)
    00:08.0 Audio device: NVIDIA Corporation MCP89 High Definition Audio (rev a2)
    00:0a.0 SATA controller: NVIDIA Corporation MCP89 SATA Controller (AHCI mode) (rev a2)
    00:0b.0 RAM memory: NVIDIA Corporation Device 0d75 (rev a1)
    00:15.0 PCI bridge: NVIDIA Corporation Device 0d9b (rev a1)
    00:17.0 PCI bridge: NVIDIA Corporation MCP89 PCI Express Bridge (rev a1)
    01:00.0 Network controller: Broadcom Corporation BCM43224 802.11a/b/g/n (rev 01)
    02:00.0 VGA compatible controller: NVIDIA Corporation MCP89 [GeForce 320M] (rev a2)

2014年版MacBook Air 13

	00:00.0 Host bridge: Intel Corporation Haswell-ULT DRAM Controller (rev 09)
	00:02.0 VGA compatible controller: Intel Corporation Haswell-ULT Integrated Graphics Controller (rev 09)
	00:03.0 Audio device: Intel Corporation Haswell-ULT HD Audio Controller (rev 09)
	00:14.0 USB controller: Intel Corporation 8 Series USB xHCI HC (rev 04)
	00:16.0 Communication controller: Intel Corporation 8 Series HECI #0 (rev 04)
	00:1b.0 Audio device: Intel Corporation 8 Series HD Audio Controller (rev 04)
	00:1c.0 PCI bridge: Intel Corporation 8 Series PCI Express Root Port 1 (rev e4)
	00:1c.1 PCI bridge: Intel Corporation 8 Series PCI Express Root Port 2 (rev e4)
	00:1c.2 PCI bridge: Intel Corporation 8 Series PCI Express Root Port 3 (rev e4)
	00:1c.4 PCI bridge: Intel Corporation 8 Series PCI Express Root Port 5 (rev e4)
	00:1c.5 PCI bridge: Intel Corporation 8 Series PCI Express Root Port 6 (rev e4)
	00:1f.0 ISA bridge: Intel Corporation 8 Series LPC Controller (rev 04)
	00:1f.3 SMBus: Intel Corporation 8 Series SMBus Controller (rev 04)
	02:00.0 Multimedia controller: Broadcom Corporation 720p FaceTime HD Camera
	03:00.0 Network controller: Broadcom Corporation BCM4360 802.11ac Wireless Network Adapter (rev 03)
	04:00.0 SATA controller: Marvell Technology Group Ltd. 88SS9183 PCIe SSD Controller (rev 14)

> 注意：2011年MacBook Air的USB是2.0版本，使用的是`EHCI`和`OHCI`驱动，而2014年MacBook Air是USB 3.0版本，使用的是`xHCI`驱动。我最初编译内核是在2014年的MacBook Air 13上，同样的配置在2011年MacBook Air 11上需要修改USB驱动选项（或者都编译成模块方式），否则会导致键盘无法使用（键盘是通过USB驱动）。

> MacBook Air 11的无线网卡 `Broadcom Corporation BCM43224 802.11a/b/g/n (rev 01)` 可以使用开源驱动`b43`（参考[Broadcom 43xx](http://gentoo-en.vfose.ru/wiki/Broadcom_43xx)），但是MacBook Air 13的无线网卡`Broadcom Corporation BCM4360 802.11ac Wireless Network Adapter (rev 03)`无法使用开源驱动，需要使用闭源的`net-wireless/broadcom-sta`来驱动。

配置内核

    cd /usr/src/linux
    make menuconfig

编译

    make && make modules_install
    make install

> 有关无线网络设备，参考 [Wifi](https://wiki.gentoo.org/wiki/Wifi)

MacBook Air 11使用的无线网卡是Broadcom  b43，需要安装 [sys-firmware/b43-firmware](http://packages.gentoo.org/package/sys-firmware/b43-firmware)

    echo "sys-firmware/b43-firmware" >> /etc/portage/package.accept_keywords
    echo "sys-firmware/b43-firmware Broadcom" >> /etc/portage/package.license
    emerge --ask b43-firmware

还需要安装需要的 [sys-kernel/linux-firmware](http://packages.gentoo.org/package/sys-kernel/linux-firmware)

    emerge --ask sys-kernel/linux-firmware

> 内核配置参考 [Apple Macbook Pro Retina](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina)，我遇到过编译后内核启动无法使用键盘和声卡问题

# 配置rEFInd

参考 [Apple_Macbook_Pro_Retina Bootloader](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina#Bootloader)

挂载EFI分区

    mount /dev/sda1 /mnt

> 可以看到这个分区有`EFI`目录，我们需要将编译好的内核存放到这个分区

    mkdir /mnt/EFI/gentoo
    cd /mnt/EFI/gentoo
    cp /boot/vmlinuz-4.3.2-gentoo-vms ./

每次编译内核需要，需要编辑 `/Volumes/efi/refind/refind.conf`来添加内核，就如同使用GRUB的方式。在最后添加一段（不需要的内容清理掉）

    menuentry Gentoo-VMS 4.3.2 {
        icon EFI/refind/icons/os_gentoo.png
        loader EFI/gentoo/vmlinuz-4.3.2-gentoo-vms
        #options "ro root=UUID=f99cd3be-245e-4dcb-8594-ac21d1fe3d83"
        options "ro root=PARTUUID=ce1d1c89-8ca1-48b0-b4ef-5a312ae8c710"
    }

> **`这里PARTUUID是分区UUID，需要使用blkid命令获得`** （参考[Why can't I specify my root fs with a UUID?](http://unix.stackexchange.com/questions/93767/why-cant-i-specify-my-root-fs-with-a-uuid)）
>
> 使用命令

    lsblk -f

可以看到如下输出

    NAME   FSTYPE   LABEL        UUID                                 MOUNTPOINT
    sda
    ├─sda1 vfat     EFI          67E3-17ED                            /mnt
    ├─sda2 ext2                  ac441c57-adaf-4df2-b1ee-03dd00b99060
    └─sda3 ext4                  f99cd3be-245e-4dcb-8594-ac21d1fe3d83
    sdb    iso9660  Gentoo-amd64 2014-08-25-05-56-52-00
    ├─sdb1 iso9660  Gentoo-amd64 2014-08-25-05-56-52-00
    ├─sdb2 vfat                  4B33-A38B
    └─sdb3 hfsplus  Gentoo Linux

其中 `f99cd3be-245e-4dcb-8594-ac21d1fe3d83` 就是`UUID`，需要输出`PARTUUID`则使用`blkid`命令（这个命令更完整输出`UUID`和`PARTUUID`）

```bash
blkid /dev/sda3
```

输出内容类似如下：

```bash
/dev/sda4: LABEL="Gentoo" UUID="f99cd3be-245e-4dcb-8594-ac21d1fe3d83" TYPE="ext4" PARTLABEL="Gentoo" PARTUUID="ce1d1c89-8ca1-48b0-b4ef-5a312ae8c710"
```


> 有关通过UUID方式持久化块设备名字，参考 [Arch Linux文档：Persistent block device naming (简体中文)](https://wiki.archlinux.org/index.php/Persistent_block_device_naming_(简体中文))

## 内核模块

需要自动加载到内核模块配置在 `/etc/conf.d/modules`，并且可以按照需要添加内核参数

要查找所有可用模块，运行`find`命令

    find /lib/modules/<kernel version>/ -type f -iname '*.o' -or -iname '*.ko' | less

## 安装firmware

一些驱动需要在工作前加载firmware，通常是网卡，特别是无线网卡

    emerge --ask sys-kernel/linux-firmware

# 文件系统

创建 `/etc/fstab` 内容

    UUID=ac441c57-adaf-4df2-b1ee-03dd00b99060   /boot        ext2    defaults,noatime     0 2
    UUID=f99cd3be-245e-4dcb-8594-ac21d1fe3d83   /            ext4    noatime              0 1

> 有关fstab使用UUID参考 [Arch Linux文档：fstab (简体中文)](https://wiki.archlinux.org/index.php/Fstab_(简体中文))
>
> 使用UUID是为了避免系统启动时因为磁盘设备识别变化而导致无法挂载文件系统

# 网络信息

编辑 `/etc/conf.d/hostname`

    hostname='vms'

配置网络 `/etc/conf.d/net` - 所有的网络信息都在这个配置文件，有关不同配置案例解释位于 `/usr/share/doc/netifrc-*/net.example.bz2` ，可以通过`net-misc/netifrc`获得

    emerge --ask --noreplace net-misc/netifrc

配置静态IP的案例`/etc/conf.d/net`

    config_eth0="192.168.0.2 netmask 255.255.255.0 brd 192.168.0.255"
    routes_eth0="default via 192.168.0.1"

配置动态HDCP案例

    config_eth0="dhcp"

设置启动时自动启动网络

    cd /etc/init.d
    ln -s net.lo net.eth0
    rc-update add net.eth0 default

`hosts`文件 － `/etc/hosts`

    # This defines the current system and must be set
    127.0.0.1     vms.homenetwork vms localhost

# 系统信息

设置root密码

    passwd

Init和启动配置

Gentoo可使用 OpenRC ，这样就使用 `/etc/rc.conf` 来配置启动服务

# 系统日志服务

> 采用systemd可以不需要

    emerge --ask app-admin/rsyslog
    rc-update add rsyslog default

# Cron服务

    emerge --ask sys-process/cronie
    rc-update add cronie default

# 文件索引

    emerge --ask sys-apps/mlocate

# 远程访问

    rc-update add sshd default

# 文件系统工具

    emerge --ask sys-fs/dosfstools

> 默认已经安装了ext文件系统工具 `e2fsprogs`

# 网络工具

安装dhcp客户端

    emerge --ask net-misc/dhcpcd

安装bind（DNS）客户端工具

    emerge --ask bind-tools

# 无线

参考 [Wifi](https://wiki.gentoo.org/wiki/Wifi)

安装b43（仅适用于MacBook Air 11 2011版）

    echo "sys-firmware/b43-firmware" >> /etc/portage/package.accept_keywords
    echo "sys-firmware/b43-firmware Broadcom" >> /etc/portage/package.license
    emerge --ask b43-firmware

> 注意：需要加载私有firmware的b43驱动需要编译成模块，不能直接编译进内核。
>
> 不过，重启以后依然无法识别无线网卡，最后还是参考 [Apple Macbook Pro Retina - Closed source Broadcom driver](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina#Closed_source_Broadcom_driver)，但是这个驱动 **不支持** 802.11n

MacBook Air 13的Broadcom BCM4360不能使用开源的b43驱动 － 参考[Linux wireless b43文档](https://wireless.wiki.kernel.org/en/users/drivers/b43)可以看到b43不支持BCM4360，建议使用wl。所以还是参考[Apple Macbook Pro Retina - Closed source Broadcom driver](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina#Closed_source_Broadcom_driver)和[Gentoo无线网卡安装之broadcom-sta（wl）篇](http://blog.csdn.net/beijing2008lm/article/details/18980097)使用闭源驱动。

内核配置

    Device Drivers
    -> Network device support
        -> Wireless LAN
            -> <*>   Intel PRO/Wireless 2100 Network Connection

然后执行

    echo "net-wireless/broadcom-sta" >> /etc/portage/package.keywords
    emerge --ask broadcom-sta

> 注意：每次升级内核都需要重新编译`broadcom-sta`驱动

上述安装 `broadcom-sta` 提示内核配置需要屏蔽掉 `BCMA`，`SSB`，`MAC80211`，`PREEMPT_RCU`（不要设置Preemption Model成"Preemptible Kernel"，应该选择其他选项），不能设置`CONFIG_PREEMPT`

    Device Drivers --> Broadcom specific AMBA （这个就是BCMA）
    Device Drivers --> Sonics Silicon Backplane support （这个是SSB）
    Process type and features -> Preemption Model (Voluntary Kernel Preemption (Desktop)) （这个就是不能选择"Preemptible Kernel (Low-latency Desktop)"）

上述安装完成后会在 /lib/modules/`uname–r`/net/wireless/ 目录下产生`wl.ko`驱动文件。重启操作系统后，使用`ifconfig`可以看到新的无线网络设备名字`wlp3s0`。

安装linux-firmware

    emerge --ask linux-firmware

参考 [wpa_supplicant](https://wiki.gentoo.org/wiki/Wpa_supplicant)

    emerge --ask wpa_supplicant

* 配置802.1q认证

公司内部网络环境使用了802.1q认证。另外，Linux平台公司尚未提供"阿里郎"，所以需要申请设备白名单（MAC地址）之后才能通过设置`wpa_supplicant`配置来实现802.1q认证后使用网络。

配置`/etc/wpa_supplicant/wpa_supplicant.conf`

	ctrl_interface=/var/run/wpa_supplicant
	ctrl_interface_group=root
	network={
	  ssid="alibaba-inc"
	  key_mgmt=WPA-EAP
	  eap=PEAP
	  phase1="peaplabel=0"
	  phase2="auth=MSCHAPV2"
	  identity="域帐号名"
	  password="域帐号密码"
	}

启动`wpa_supplicant`服务和`dhcpcd`服务，就可以获得网络分配ip并连接上网络

    /etc/init.d/wpa_supplicant start
    /etc/init.d/dhcpcd start

有线网络连接配置类似，配置一个`/etc/wpa_supplicant/wpa_supplicant_lan.conf`，内容如下

	ctrl_interface=/var/run/wpa_supplicant
	ctrl_interface_group=root
	network={
	  ssid="alibaba-inc"
	  key_mgmt=WPA-EAP
	  eap=PEAP
	  phase1="peaplabel=0"
	  phase2="auth=MSCHAPV2"
	  identity="域帐号名"
	  password="域帐号密码"
	}

然后使用一个`start_lan.sh`脚本来连接启动`wpa_supplicant_lan.conf`认证（dhcpcd已经启动），同样也能通过有线访问公司网络

	#!/bin/bash

	net=enp0s20u1

	ifconfig $net up
	ifconfig $net promisc
	wpa_supplicant -i $net -B -Dwired -c /etc/wpa_supplicant/wpa_supplicant_lan.conf

# 选择boot loader （仅供参考，实际MacBook Air使用UEFI不需要grub）

默认使用GRUB2

    emerge --ask sys-boot/grub

配置GRUB2

    grub2-install /dev/sda

创建配置

    grub2-mkconfig -o /boot/grub/grub.cfg

# 内核配置参考

参考 [Apple Macbook Pro Retina Kernel Configuration](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina#Kernel_Configuration) 配置内核

	Processor type and features  --->
	  [*] EFI runtime service support 
	  [*] EFI stub support
	Device Drivers  --->
	  Input device support  --->
	    [*] Mice  --->
	    # For trackpad support
	    <*> Apple USB BCM5974 Multitouch trackpad support
	  Hardware Monitoring support  --->
	    # Motion, light sensor, keyboard backlight
	    <*> Apple SMC (Motion sensor, light sensor, keyboard backlight)
	  Graphics support  --->
	    <*> Intel 8xx/9xx/G3x/G4x/HD Graphics
	    Backlight & LCD device support  --->
	      # Screen backlight
	      <*>     Apple Backlight Driver
	  X86 Platform Specific Device Drivers  --->
	    <*>   Apple Gmux Driver
	  Multimedia support  --->
	    Media USB Adapters  --->
	      # Webcam
	      <M>   USB Video Class (UVC)
	  Sound card support  --->
	    Advanced Linux Sound Architecture  --->
	      PCI sound devices  --->
	        <M>   Intel HD Audio  --->
	          [*]   Build HDMI/DisplayPort HD-audio codec support
	          [*]   Build Cirrus Logic codec support
	  USB support  --->
	    # USB 3.0 (for integrated keyboard/trackpad)
	    <*>  xHCI HCD (USB 3.0) support
	Power management and ACPI options --->
	  ACPI (Advanced Configuration and Power Interface) Support  --->
	    <*>   Smart Battery System


# 驱动

使用Apple USB以太网卡是AXIS网卡，需要编译支持

# 重启系统

    exit
    cd
    umount -l /mnt/gentoo/dev{/shm,/pts,}
    umount /mnt/gentoo{/boot,/sys,/proc,}
    reboot

# 触摸板

MacBook的触摸板非常灵敏，并且支持`tap to click`（也就是轻触等同于点击），非常方便使用。不过，默认在X Window下没有启用这个功能，导致非常不习惯。

参考 [Tuning the Macbook touchpad in Linux](http://uselessuseofcat.com/?p=74)，可以使用如下脚本命令实现

    synclient TapButton1=1
    synclient TapButton2=2
    synclient TapButton3=3
    synclient TapAndDragGesture=0

> 解释：参考 [Tap-to-click not working in Ubuntu 12.04](http://askubuntu.com/questions/263020/tap-to-click-not-working-in-ubuntu-12-04)
>
> TapButton(number) sets the mouse event to trigger when you tap your trackpad with (number)fingers. "0" means disabled, "1" means left-click, "2" means middle-click, "3" means right-click.
>
> 即，单指轻触是左键，双指轻触是中键，三指轻触是右键

另外，发现键盘输入的时候，手掌很容易碰到触摸板导致鼠标漂移输入混乱。
 
[Touchpad Synaptics](https://wiki.archlinux.org/index.php/Touchpad_Synaptics)提供了详细的触摸板配置说明，可以参考

# 中文设置

* 安装ibus

        emerge app-i18n/ibus-qt app-i18n/ibus-pinyin

> 我使用KDE桌面，所以安装`app-i18n/ibus-qt`，对于Gnome环境，安装`app-i18n/ibus` （[Gentoo IBus](https://wiki.gentoo.org/wiki/IBus)）

遇到编译报错

    keybindingmanager.c:15:22: fatal error: gdk/gdkx.h: No such file or directory

* 安装后在普通用户环境下设置

        ibus-setup

只要基本设置就可以

* 在用户目录 `~/.xinitrc` 中添加

        # iBus Setting ------------------
        export GTK_IM_MODULE=ibus
        export XMODIFIERS=@im=ibus
        export QT_IM_MODULE=ibus
        ibus-daemon -d -x

然后重新登录就可以使用。

# gentoo升级经验

如果只是常规更新和升级软件包，使用如下命令

    emerge -avtuDN world

如果想完全重新编译整个系统

    emerge -avte world

> 在编译过程中如果有某个软件包失败，可以采用暂时跳过 `emerge --resume --skipfirst -avte world` ，等整个系统基本完成后，再单独解决个别软件包编译安装问题。

删除软件包以及无用的依赖软件包 （参考 [Safely uninstall a package in Gentoo](http://unix.stackexchange.com/questions/42783/safely-uninstall-a-package-in-gentoo)）

    emerge --unmerge ibus
    emerge --depclean

# 参考

* [Apple MacBook](http://www.gentoo-wiki.info/Apple_MacBook) - 早期版本MacBook的安装
* [ArchLinux MacBook](https://wiki.archlinux.org/index.php/MacBook#MacBook_Pro_with_Retina_display) - 在MacBook上运行Arch Linux，文档较为全面
* [Apple Macbook Pro Retina](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina) - 在Retina版本的MacBook Pro上安装Gentoo
* [Install Gentoo Prefix on MacBook Pro](http://pjq.me/wiki/doku.php?id=linux:gentoo-prefix) - 在OS X系统中运行Gentoo Prefix获得Gentoo Linux体验
