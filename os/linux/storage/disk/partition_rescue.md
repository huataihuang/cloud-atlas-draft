服务器误操作，删除了系统盘 `/dev/sda` 上的分区，误操作步骤如下：

```bash
fdisk /dev/sda
```

然后执行了 `g` 命令 - `g   create a new empty GPT partition table`

此时服务器还没有重启，使用 `fdisk -l` 可以看到sda磁盘分区没有了

```
# fdisk -l
Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 3F269632-A490-4E27-87D3-3677667E3C6C
```

不过，系统还没有重启，当前磁盘还挂载:

```bash
# df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs        126G     0  126G   0% /dev
tmpfs           126G   76K  126G   1% /dev/shm
tmpfs           126G   11M  126G   1% /run
tmpfs           126G     0  126G   0% /sys/fs/cgroup
/dev/sda1        50G  7.2G   41G  15% /
/dev/sda2       296G   63M  295G   1% /home
tmpfs            26G   16K   26G   1% /run/user/0
```

* 挂载情况

```bash
# mount | grep sda
/dev/sda1 on / type ext4 (rw,relatime,data=ordered)
/dev/sda2 on /home type ext4 (rw,relatime,data=ordered)
```

* 内核中显示分区信息还在

```bash
# cat /proc/partitions 
major minor  #blocks  name

   8        0  781412184 sda
   8        1   52426752 sda1
   8        2  314576896 sda2
   8        3    3148800 sda3
```

* 检查 `/etc/fstab` 内容如下

```bash
# cat /etc/fstab 
UUID=54815b4a-7f4d-452e-982b-c3e897965b3d swap                 swap       defaults              0 0
UUID=a7675869-731f-4e3b-9629-58016cfa70cd /                    ext4       acl,user_xattr        1 1
UUID=540db1f0-0242-4b49-b4b5-8d1637036b5e /home                ext4       acl,user_xattr        1 2
```

* 检查uuid

```bash
# ls -lh /dev/disk/by-uuid/
total 0
lrwxrwxrwx 1 root root 10 Jul 20 16:36 540db1f0-0242-4b49-b4b5-8d1637036b5e -> ../../sda2
lrwxrwxrwx 1 root root 10 Jul 20 16:36 54815b4a-7f4d-452e-982b-c3e897965b3d -> ../../sda3
lrwxrwxrwx 1 root root 10 Jul 20 16:36 a7675869-731f-4e3b-9629-58016cfa70cd -> ../../sda1
```

* 通过blkid可以得知原先的分区表是msdos

```bash
# blkid /dev/sda1
/dev/sda1: UUID="a7675869-731f-4e3b-9629-58016cfa70cd" TYPE="ext4" PTTYPE="dos"

# blkid /dev/sda2
/dev/sda2: UUID="540db1f0-0242-4b49-b4b5-8d1637036b5e" TYPE="ext4"

# blkid /dev/sda3
/dev/sda3: UUID="54815b4a-7f4d-452e-982b-c3e897965b3d" TYPE="swap"
```

通过lsblk也可以直接获得所有分区的uuid

```bash
# lsblk -f
NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
sda                                                      
├─sda1 ext4         a7675869-731f-4e3b-9629-58016cfa70cd /
├─sda2 ext4         540db1f0-0242-4b49-b4b5-8d1637036b5e /home
└─sda3 swap         54815b4a-7f4d-452e-982b-c3e897965b3d [SWAP]
```

但是需要注意 `/dev/sda` 被覆盖成GPT了

```bash
# blkid /dev/sda
/dev/sda: PTUUID="3f269632-a490-4e27-87d3-3677667e3c6c" PTTYPE="gpt"
```

* 内核中磁盘分区信息

```
# lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0 745.2G  0 disk 
├─sda1   8:1    0    50G  0 part /
├─sda2   8:2    0   300G  0 part /home
└─sda3   8:3    0     3G  0 part [SWAP]
```

关键是如何恢复磁盘中的分区表，在操作系统还没有重启之前，恢复预先正确的分区信息。

参考 [How to recover a partition accidently deleted with fdisk (Linux)?](https://superuser.com/questions/57240/how-to-recover-a-partition-accidently-deleted-with-fdisk-linux) ，一般可以通过 [TestDisk](https://www.cgsecurity.org/wiki/TestDisk) 开源工具修复。

此外，这个案例比较简单，我感觉也可以通过手工方式修复，参考Linux文档的Partition HOWTO 章节 [Recovering a Deleted Partition Table](https://www.tldp.org/HOWTO/Partition/recovering.html) ，关键是按照原先分区信息，创建一个 **精确一致** 的分区表

```
# dumpe2fs /dev/sda1 | grep "Block count:"
dumpe2fs 1.42.11 (09-Jul-2014)
Block count:              13106688

# dumpe2fs /dev/sda2 | grep "Block count:"
dumpe2fs 1.42.11 (09-Jul-2014)
Block count:              78644224

# dumpe2fs /dev/sda3 | grep "Block count:"
dumpe2fs 1.42.11 (09-Jul-2014)
dumpe2fs: Bad magic number in super-block while trying to open /dev/sda3
```

在 [Partition-Rescue](https://www.tldp.org/HOWTO/Partition-Rescue/x122.html) 中介绍了当删除了分区表，但是还没有重启Linux情况下，可以从内核存储的信息

* 内核存储的分区信息

```bash
# cat /proc/partitions 
major minor  #blocks  name

   8        0  781412184 sda
   8        1   52426752 sda1
   8        2  314576896 sda2
   8        3    3148800 sda3
```

> 最主要是知道分区开始的位置

* 通过 `hdparm` 工具可以获得详细信息

```bash
# hdparm -g /dev/sda1

/dev/sda1:
 geometry      = 31745/255/63, sectors = 104853504, start = 2048

# hdparm -g /dev/sda2

/dev/sda2:
 geometry      = 39163/255/63, sectors = 629153792, start = 104855552

# hdparm -g /dev/sda3

/dev/sda3:
 geometry      = 31745/255/63, sectors = 6297600, start = 734009344
```

* (可选)如果知道一个分区的起始位置，但是不知道结束，仍然可以挂载它，然后了解他的结构。也就是先正确设置分区的起始位置，然后设置一个比原先分区 **更大** 的任意位置。然后使用以下命令检查推测:

```bash
e2fsck -n /dev/hd??
```

甚至可以挂载然后检查

```
mount -r /dev/hd?? /mnt
df -T
```

# 恢复

根据上述调查，我们可以了解到以下信息

* 原先的分区表是msdos，被误删除修改成了gpt分区表
* 由于操作系统还没有重启，所以内核中保留了原先分区的完整信息
  * 一共3个分区，分区信息见上述

* 再次使用 `fdisk /dev/sda` 命令，然后执行 `o` 把分区表改成DOS分区表 ，然后执行 `w` 保存

* 然后检查分区表，可以看到分区表已经修改成 `dos`

```bash
# blkid /dev/sda
/dev/sda: PTUUID="09a72274" PTTYPE="dos"

# fdisk -l /dev/sda
Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274
```

* 现在我们来恢复原先的分区表数据 - 根据之前通过 `hdparm -g /dev/sda1` 等命令获取的信息

```bash
# fdisk /dev/sda

Welcome to fdisk (util-linux 2.29.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): p                                                    <= 这里输入命令 p 查看分区信息
Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Command (m for help): n                                                    <= 这里输入命令 n 添加分区
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p                                                       <= 这里输入命令 p 表示是主分区(primary)
Partition number (1-4, default 1):                                          <= 这里输入会车，表示接受默认第一个分区
First sector (2048-1562824367, default 2048):                               <= 这里输入会车，表示接受从默认2048扇区开始（这是按照之前分区信息)
Last sector, +sectors or +size{K,M,G,T,P} (2048-1562824367, default 1562824367): +104853504  <= 这里输入 +XXXX 表示增加多少扇区，我第一次输入时候搞错了，直接输入了haparm -g /dev/sda1 输出的 sectors = 104853504 ，但是实际上包含了起始sector 2048，就导致多了一个sector，请仔细核对添加后的分区sector数量

Created a new partition 1 of type 'Linux' and of size 50 GiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o: N

Command (m for help): p

Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Device     Boot Start       End   Sectors Size Id Type
/dev/sda1        2048 104855552 104853505  50G 83 Linux  <= 请注意，这里多了一个扇区
```

注意到直接按照 `hdparm -g /dev/sda1` 输出的 `sectors = 104853504` 值添加分区会导致多一个扇区，所以我们实际添加sectors应该是输出值减1。所以按下 `ctrl-c` 终止 `fdisk` 重新添加分区

* 启动 `fdisk` 命令，对 `/dev/sda` 进行分区

```bash
# fdisk /dev/sda

Welcome to fdisk (util-linux 2.29.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help):
```

输入 `p` 打印当前分区（目前是空的）

```bash
Command (m for help): p
Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Command (m for help):
```

* 输入 `n` 命令，添加第一个分区:

```bash
Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p):
```

* 输入 `p` 命令，表示添加主分区 `primary`，然后两次回车表示默认分区1，以及默认从扇区2048开始第一个分区

```bash
Select (default p): p
Partition number (1-4, default 1): 回车
First sector (2048-1562824367, default 2048): 回车
```

* 现在需要给第一个分区设置大小，我们已经从 `hdparm -g /dev/sda1` 获得了这个分区的大小是 `104853504` 扇区。但是由于分区起始扇区是2048，也就是默认已经有了1个sector，所以我们需要添加的sectors数量是原分区sectors数量`-1`，也就是 `+104853503`

```bash
Last sector, +sectors or +size{K,M,G,T,P} (2048-1562824367, default 1562824367): +104853503
```

* 此时fdisk会检测到之前分区1上有一个ext4文件系统是我们之前已经创建过的文件系统，这个文件系统标记我们不要修改：

```
Created a new partition 1 of type 'Linux' and of size 50 GiB.
Partition #1 contains a ext4 signature.

Do you want to remove the signature? [Y]es/[N]o:
```

* 这时候提示信息显示分区1包含了ext4标记，实际上就是我们之前旧分区上已经创建过的文件系统，所以我们不需要删除这个标记，输入 `N` 命令

```bash
Do you want to remove the signature? [Y]es/[N]o: N

Command (m for help):
```

* 然后再次输入 `p` 打印添加了分区1之后的分区情况，验证我们添加的分区是否和原先完全吻合：

```bash
Command (m for help): p

Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Device     Boot Start       End   Sectors Size Id Type
/dev/sda1        2048 104855551 104853504  50G 83 Linux

Command (m for help):
```

请注意，我们输入的 `+104853503` 之后获得的分区1的扇区数是 `104853504` ，和我们从内核获得的原分区扇区数一致，这表明我们添加的分区正确。

* 重复以上步骤，添加分区2和分区3，同样需要注意sectors添加时数值需要比原分区sectors值减1，最终完成以后的分区表情况如下：

```bash
Command (m for help): p

Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Device     Boot     Start       End   Sectors  Size Id Type
/dev/sda1            2048 104855551 104853504   50G 83 Linux
/dev/sda2       104855552 734009343 629153792  300G 83 Linux
/dev/sda3       734009344 740306943   6297600    3G 83 Linux
```

上述分区数据要仔细和 `hdparm -g /dev/sdaX` 对比（对比 `start` 和 `sectors`），例如我们之前获得数据就是

```
/dev/sda1:
 geometry      = 31745/255/63, sectors = 104853504, start = 2048
/dev/sda2:
 geometry      = 39163/255/63, sectors = 629153792, start = 104855552
/dev/sda3:
 geometry      = 31745/255/63, sectors = 6297600, start = 734009344
```

确认无误以后，输入命令 `w` 保存退出 fdisk

* 保存退出时会提示信息表示分区表已经修改，但设备繁忙（因为是系统盘正挂载使用中），所以内核依然使用的是旧表。我们通过 `fdisk -l` 命令再检查一次：

```bash
# fdisk -l
Disk /dev/sda: 745.2 GiB, 800166076416 bytes, 1562824368 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x09a72274

Device     Boot     Start       End   Sectors  Size Id Type
/dev/sda1            2048 104855551 104853504   50G 83 Linux
/dev/sda2       104855552 734009343 629153792  300G 83 Linux
/dev/sda3       734009344 740306943   6297600    3G 83 Linux
```

* 由于文件系统没有重新格式化，所以uuid依然不变，这点可以再次验证

```bash
# lsblk -f
NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
sda                                                      
├─sda1 ext4         a7675869-731f-4e3b-9629-58016cfa70cd /
├─sda2 ext4         540db1f0-0242-4b49-b4b5-8d1637036b5e /home
└─sda3 swap         54815b4a-7f4d-452e-982b-c3e897965b3d [SWAP]
```

* 不过`blkid`显示分区多了一个PARTUUID:

```bash
# blkid /dev/sda
/dev/sda: PTUUID="09a72274" PTTYPE="dos"
# blkid /dev/sda1
/dev/sda1: UUID="a7675869-731f-4e3b-9629-58016cfa70cd" TYPE="ext4" PTTYPE="dos" PARTUUID="09a72274-01"
# blkid /dev/sda2
/dev/sda2: UUID="540db1f0-0242-4b49-b4b5-8d1637036b5e" TYPE="ext4" PARTUUID="09a72274-02"
# blkid /dev/sda3
/dev/sda3: UUID="54815b4a-7f4d-452e-982b-c3e897965b3d" TYPE="swap" PARTUUID="09a72274-03"
```

```bash
# ls -lh /dev/disk/by-uuid/
total 0
lrwxrwxrwx 1 root root 10 Jul 20 22:53 540db1f0-0242-4b49-b4b5-8d1637036b5e -> ../../sda2
lrwxrwxrwx 1 root root 10 Jul 20 22:53 54815b4a-7f4d-452e-982b-c3e897965b3d -> ../../sda3
lrwxrwxrwx 1 root root 10 Jul 20 22:53 a7675869-731f-4e3b-9629-58016cfa70cd -> ../../sda1
```

# 重启验证

比较不幸，重启系统以后，发现系统进入了无盘状态

```bash
[root@example-tmpfs /root]
#df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs        126G     0  126G   0% /dev
tmpfs           126G  2.0G  124G   2% /
tmpfs           126G     0  126G   0% /dev/shm
tmpfs           126G  4.6M  126G   1% /run
tmpfs           126G     0  126G   0% /sys/fs/cgroup
tmpfs            26G     0   26G   0% /run/user/0
tmpfs            26G     0   26G   0% /run/user/60162

[root@example-tmpfs /root]
#fdisk -l

Disk /dev/sda: 800.2 GB, 800166076416 bytes, 1562824368 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x09a72274

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1            2048   104855551    52426752   83  Linux
/dev/sda2       104855552   734009343   314576896   83  Linux
/dev/sda3       734009344   740306943     3148800   83  Linux
```

* 通过chroot尝试挂载物理服务器磁盘进行检查

```bash
mount /dev/sda1 /mnt
mount /dev/sda2 /mnt/home
```

挂载以后检查文件系统：

```bash
#df -h
...
/dev/sda1        50G  7.2G   41G  15% /mnt
/dev/sda2       296G   63M  295G   1% /mnt/home
```

然后检查挂载的文件系统，可以看到文件系统读写都是正常的。这说明之前修复的的磁盘分区是正确的

* 由于是系统盘，这说明之前 `fdisk` 破坏的分区表虽然修复正确，但是启动引导信息被抹除以后没有恢复，需要重新修复

* 通过chroot进入磁盘上的Linux系统

```bash
mount -t proc none /mnt/proc
mount -o bind /sys /mnt/sys 
mount -o bind /dev /mnt/dev
chroot /mnt /bin/bash
ldconfig
source /etc/profile
export PS1="(chroot) $PS1"
```

* 现在使用 `df` 查看到的操作系统就是完全和从硬盘启动的系统是一致的，除了内核使用的是我们无盘系统的操作系统内核

```bash
#df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G  7.2G   41G  15% /
/dev/sda2       296G   63M  295G   1% /home
devtmpfs        126G     0  126G   0% /dev
```

> 这里的操作系统是SUSE，可以很容易找到suse的帮助文档，例如 [Boot loader repair with grub2 (on OpenSUSE 13.1)](https://azug.minpet.unibas.ch//~lukas/linux_recipes/boot_repair.html) 和 [Re-install Grub2 from DVD Rescue](https://forums.opensuse.org/content.php/128-Re-install-Grub2-from-DVD-Rescue)

* 在我们这个案例中，`/boot/grub2/grub.cfg`不需要重新生成（因为之前安装是正确的配置），所以只需要执行 `grub2-install` 将启动信息写入磁盘就可以:

```bash
grub2-install /dev/sda
```

此时提示:

```
Installing for i386-pc platform.
Installation finished. No error reported.
```

> 实际上如果要rescue，在正确挂载了磁盘之后，可以执行2条命令来恢复（如果你安装SUSE过程中安装grub2失败）

```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
grub2-install /dev/sda
```

* 再次重启，一切正常了 ^_^

