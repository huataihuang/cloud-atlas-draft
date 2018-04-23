# 分区

安装 LFS 通常需要专门的分区。构建 LFS 系统比较推荐的方法是使用可用的空分区，或者如果条件允许，最好是在未分区的空间里新建分区。 

最小化的系统需要大约 6 GB 的分区，这足以存储所有的源码包及满足编译的需求。但如果要将 LFS 作为主要的 Linux 系统，可能需要安装其它附加的软件，这将需要额外的空间。考虑到了日后所需的空间，一个 20 GB 的分区是比较合理的。LFS 系统本身并不会占用这么多的空间。但满足此要求的大分区将能提供足够大的临时储存空间。编译软件包可能需要较大的磁盘空间，但这些空间可以在软件包安装后回收。 

由于编译过程中所需的内存（RAM）可能不足，需要使用一个小型的磁盘分区作为 swap 分区。内核会在此分区中储存较少使用的数据，从而为活动进程提供更多的内存。LFS 系统可以与宿主系统共用 swap 分区，这样就没有必要再新建一个了。 

现代硬件的RAM通常比较充足，往往很少使用swap，对于LFS（或Gentoo）构建，在编译过程中，编译系统会将那些不总是变化的文件寄存在 swap 分区中，而为软件编译过程提供更多的内存空间。不过对于磁盘空间较小的系统，可以将swap分区设置成2G。

> 在我的实践中，我采用的是[创建具有持久化存储的Live Ubuntu U盘](../ubuntu/install/create_live_ubuntu_usb_drive_with_persistent_storage)来作为主机编译系统，默认已经加载了4G的swap空间。

## 常用分区

* `/boot` 分区 - 强烈推荐。此分区用于存储内核和其它启动信息。为了减少大容量磁盘启动时的潜在问题，尽量将该分区设为磁盘驱动器上第一个物理分区。100 MB 的空间就十分充裕了。 

> 如果要测试不同的内核切换，可以设置较大的`/boot`分区，例如256M，512M。

* `/home` 分区 - 强烈推荐。home 目录可用于跨发行版或多个 LFS 版本之间共享用户自定义内容。应该将尽量多的磁盘都分配给 home 分区。

> 用户数据应该都存放在`/home`分区，避免重装系统时破坏

* `/usr` 分区 - 独立的 /usr 分区常见于服务器或无盘工作站。LFS 通常不需要。5 GB 大小足以应付大部分安装。 

* `/opt` 分区 - 这个分区在 BLFS 中比较有用，因为像 Gnome 或 KDE 这样的大型安装包可以装在此分区中，而不需要将文件塞到 `/usr` 分区。如果使用的话，5 到 10 GB 的空间就足够了。 

* `/usr/src` 分区 - 这个分区可用于存储 BLFS 源文件并在构建不同版本的 LFS 中共享。它也可用于构建 BLFS 软件包。30 - 50 GB 的分区可以提供足够的空间。 

> 对于使用EFI启动的系统，需要在操作系统中保留一个专用于EFI启动的分区，文件系统采用VFAT

# 分区实践

在MacBook Air 11 2011的笔记本上安装LFS，笔记本内置硬盘约56GB。计划划分分区如下：

```
/dev/sda1   256M EFI System
/dev/sda2   54G Linux filesystem
/dev/sda3   2G Linux swap
```

使用`parted`来划分分区，并且设置4K对齐([磁盘分区4k对齐优化性能](../storage/disk/align_partitions_for_best_performance))，这里使用的案例方法参考[archlinux: GNU Parted - UEFI/GPT examples](https://wiki.archlinux.org/index.php/GNU_Parted#UEFI.2FGPT_examples)

初始化磁盘分区表（擦除原先的所有数据）

```
parted /dev/sda mklabel gpt
```

> `警告`：上述命令将完全擦除掉磁盘上所有数据

创建第一个`sda1`分区，用于EFI启动

```
parted -a optimal /dev/sda mkpart ESP fat32 0% 256MB
parted /dev/sda set 1 esp on
```

显示刚才的分区

```
parted /dev/sda print
```

输出如下：

```
Model: ATA APPLE SSD SM064C (scsi)
Disk /dev/sda: 60.7GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End    Size   File system  Name  Flags
 1      1049kB  256MB  255MB  fat32        ESP   boot, esp
```

如果要将剩下非分区都划分为一个分区，则可以使用（不过，我没有使用这个方法，而是采用了保留2G用于Swap）

```
parted -a optimal /dev/sda mkpart primary ext4 256MB 100%
```

实际采用给主分区59G空间，剩余用于swap

```
parted -a optimal /dev/sda mkpart primary ext4 256MB 59GB
parted -a optimal /dev/sda mkpart primary linux-swap 59GB 100%
```

完成后最后检查（`parted`和`fdisk`似乎显示输出不同）

`parted /dev/sda print`

```
Model: ATA APPLE SSD SM064C (scsi)
Disk /dev/sda: 60.7GB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name     Flags
 1      1049kB  256MB   255MB   fat32        ESP      boot, esp
 2      256MB   59.0GB  58.7GB  ext4         primary
 3      59.0GB  60.7GB  1665MB               primary
```

`fdisk -l /dev/sda`：

```
Disk /dev/sda: 56.5 GiB, 60666413056 bytes, 118489088 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 25AAF5C2-70A9-4B7A-8350-C11F96658DC1

Device         Start       End   Sectors  Size Type
/dev/sda1       2048    499711    497664  243M EFI System
/dev/sda2     499712 115234815 114735104 54.7G Linux filesystem
/dev/sda3  115234816 118487039   3252224  1.6G Linux swap
```

> 似乎`parted`显示磁盘空间采用1000，而`fdisk`采用了`1024`，看到的磁盘空间大小有些不同。

# 文件系统

LFS假设根文件系统`/`使用`ext4`：

```
mkfs -v -t ext4 /dev/sda2
```

注意： ESP分区必须是FAT32，并且这个分区要挂载在`/boot/efi`上

```
mkfs.fat -F32 /dev/sda1
```

> 参考 [EFI System Partition](https://wiki.archlinux.org/index.php/EFI_System_Partition)

```
mkswap /dev/sda3
```

# 设置`$LFS`变量

`$LFS`变量表示LFS构建进程使用的环境，这里使用`/mnt/lfs`

```
export LFS=/mnt/lfs
```

这个环境参数需要加入到`/etc/profile`或者`/root/.bash_profile`

# 挂载分区

挂载主分区

```
mkdir -pv $LFS
mount -v -t ext4 /dev/sda2 $LFS
```

挂载EFI分区

```
mkdir -pv $LFS/boot/efi
mount -v -t vfat /dev/sda1 $LFS/boot/efi
```

启用swap分区

```
/sbin/swapon -v /dev/sda3
```

# 简介

下载的软件包列表，它们用来构建一个基本的 Linux 系统。所列出来的版本号对应着该软件的确定可以正常工作的版本。

> 注意LFS的软件版本是精心测试的，所以不建议使用非官方手册的更新的上游版本，以免造成编译安装问题。

下载好的软件包和补丁需要保存在某个地方，以方便在整个构建过程中都能有效访问。另外还需要一个工作目录用于解压源代码并执行编译。可以用目录 `$LFS/sources` 保存软件包和补丁，同时作为工作目录。

 在开始下载任务之前，先用 `root` 用户执行下面的命令创建这个目录：

```
mkdir -v $LFS/sources
```

设置目录的写权限和粘滞模式:

```
chmod -v a+wt $LFS/sources
```

显示输出`mode of '/mnt/lfs/sources' changed from 0755 (rwxr-xr-x) to 1777 (rwxrwxrwt)`

> “粘滞模式”意思是就算有多个用户对某个目录有写权限，仍然只有该文件的主人能删除一个粘滞目录里的文件。

下载所有软件包和补丁的一个简单方式是使用 `wget-list` 作为 wget 的输入，例如：

```
wget --input-file=wget-list --continue --directory-prefix=$LFS/sources
```

从 LFS-7.0 开始，多了一个单独的文件 md5sums ，可以在正式开始前校验所有的文件是否都正确。将这个文件拷贝到 $LFS/sources 目录里并执行：

```
pushd $LFS/sources
md5sum -c md5sums
popd
```

* [所有软件包](http://www.linuxfromscratch.org/lfs/view/systemd/chapter03/packages.html)
* [所有补丁包](http://www.linuxfromscratch.org/lfs/view/systemd/chapter03/patches.html)

# 最后准备

为构建临时系统做一些额外的准备工作。在 `$LFS` 中新建一个文件夹用于临时工具的安装，增加一个非特权用户用于降低风险，并为该用户创建合适的构建环境。

编译的工具软件都会安装到 `$LFS/tools` 文件夹，以确保和实际运行操作系统的软件相互分离。工具软件保存在单独的文件夹中，后面使用完之后就可以轻易的丢弃。这也可以防止这些程序在宿主机生成目录中突然停止工作：

```
mkdir -v $LFS/tools
```

在宿主系统中创建 `/tools` 的符号链接，将其指向 LFS 分区中新建的文件夹

```
ln -sv $LFS/tools /
```

## 添加 LFS 用户

当以 `root` 用户登录时，犯一个小错误可能会破坏或摧毁整个系统。因此，建议以非特权用户编译软件包。创建一个名为 `lfs` 的新用户作为新组（名字也是 `lfs` ）的成员，并在安装过程中使用这个用户。以 `root` 用户运行以下命令来添加新用户：

```
groupadd lfs
useradd -s /bin/bash -g lfs -m -k /dev/null lfs
```

设置lfs用户密码

```
passwd lfs
```

 通过更改文件夹所有者为 `lfs`，为用户 `lfs` 赋予了访问 `$LFS/tools` 和 `$LFS/sources`文件夹的所有权限：

```
chown -v lfs $LFS/tools
chown -v lfs $LFS/sources
```

以 lfs 用户身份登录

```
su - lfs
```

## 设置环境

```
cat > ~/.bash_profile << "EOF"
exec env -i HOME=$HOME TERM=$TERM PS1='\u:\w\$ ' /bin/bash
EOF
```

> 这里使用`exec env -i.../bin/bash`是为了构建一个干净的环境

新的 shell 实例是一个非登录 shell，不会读取 `/etc/profile` 或者 `.bash_profile` 文件，而是读取 `.bashrc` 文件。 现在创建 `.bashrc` 文件:

```
cat > ~/.bashrc << "EOF"
set +h
umask 022
LFS=/mnt/lfs
LC_ALL=POSIX
LFS_TGT=$(uname -m)-lfs-linux-gnu
PATH=/tools/bin:/bin:/usr/bin
export LFS LC_ALL LFS_TGT PATH
EOF
```

最后，启用刚才创建的用户配置文件，为编译临时工具完全准备好环境：

```
source ~/.bash_profile
```

对于大多数带有多个处理器（或内核）的现代操作系统而言，可以通过设置环境变量或者是告知  make 程序具体可用的处理器数目，通过“并行编译”来减少编译的时间。例如，对于 Core2Duo 可以通过以下参数实现两个处理器同时编译：

> 使用`cat /proc/cpuinfo`来确定自己host主机的cpu数量，例如，我的MacBook Air笔记本是core双核，所以配置参数如下

```
export MAKEFLAGS='-j 2'
```

或者直接这样编译：

```
make -j2
```

## 测试套件

很多软件包都提供相应的测试套件。在新构建的系统上运行测试套件一直都是一个很好的习惯：它可以帮助我们“检查”软件编译是否正确。

有一些测试套件要比其它的更重要。例如，核心工具链软件包 GCC、Binutils 和 Glibc，对于一个系统的正常运转起到至关重要的作用。GCC 和 Glibc 的测试套件可能要花费很长的时间才能完成，尤其对于那些硬件性能不是很好的设备来说，但是还是强烈推荐完成它们！ 