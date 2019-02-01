# `警告`

本案例能够直接不卸载根文件系统，直接通过fdisk命令修改`/dev/vda3`分区大小，然后`resize2fs`修改EXT4文件系统大小，原因是因为该磁盘恰好只分配了`/dev/sda3`，磁盘后续都是连续空白。

通常情况下，对于EXT4文件系统的底层分区，最好是建立在LVM上，这样才能灵活调整磁盘分区大小。请参考 [扩展LVM](../../storage/device-mapper/lvm/extend_lvm)。

**如果没有使用LVM，直接通过 fdisk 修改磁盘分区大小，务必要确保分区起始扇区和原先一致，且扩展后的扇区范围没有覆盖其他分区，否则会导致数据丢失。**

```
#fdisk -l /dev/vda

Disk /dev/vda: 128.8 GB, 128849018880 bytes, 251658240 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x000cb9dd

   Device Boot      Start         End      Blocks   Id  System
/dev/vda1   *        2048     2099199     1048576   83  Linux
/dev/vda2         2099200     6293503     2097152   82  Linux swap / Solaris
/dev/vda3         6293504   125829119    59767808   83  Linux  <= 注意：这里vda3没有完全分配完磁盘空间，并且没有后续的vda4，所以才能通过fdisk修改分区大小
```

# 操作

* 先删除分许`vda3`然后重新添加`vda3`分区，注意分区起始扇区和原先相同，结束扇区则增大，以便能够使用更多磁盘空间：

```
#fdisk /dev/vda
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): p   <= 打印当前磁盘分区

Disk /dev/vda: 128.8 GB, 128849018880 bytes, 251658240 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x000cb9dd

   Device Boot      Start         End      Blocks   Id  System
/dev/vda1   *        2048     2099199     1048576   83  Linux
/dev/vda2         2099200     6293503     2097152   82  Linux swap / Solaris
/dev/vda3         6293504   125829119    59767808   83  Linux   <= 这个是需要扩展的分区3

Command (m for help): d   <= 删除分区
Partition number (1-3, default 3): 3   <= 选择分区3，即删除
Partition 3 is deleted

Command (m for help): p   <= 再次打印当前磁盘分区

Disk /dev/vda: 128.8 GB, 128849018880 bytes, 251658240 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x000cb9dd

   Device Boot      Start         End      Blocks   Id  System
/dev/vda1   *        2048     2099199     1048576   83  Linux
/dev/vda2         2099200     6293503     2097152   82  Linux swap / Solaris  <= 可以看到分区3已经消失

Command (m for help): n     <= 添加新分析，也就是再次添加分区3
Partition type:
   p   primary (2 primary, 0 extended, 2 free)
   e   extended
Select (default p): p     <= 设置新增加的分区是主分区
Partition number (3,4, default 3): 3     <= 分区3
First sector (6293504-251658239, default 6293504): 6293504  <= 关键点：重建的分区3起始扇区必需和原先删除的分区3完全一致
Last sector, +sectors or +size{K,M,G} (6293504-251658239, default 251658239):  <= 关键点：重建的分区3的结束扇区值扩大了，完整占据磁盘剩余空间
Using default value 251658239
Partition 3 of type Linux and of size 117 GiB is set

Command (m for help): p   <= 再次打印当前磁盘分区

Disk /dev/vda: 128.8 GB, 128849018880 bytes, 251658240 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x000cb9dd

   Device Boot      Start         End      Blocks   Id  System
/dev/vda1   *        2048     2099199     1048576   83  Linux
/dev/vda2         2099200     6293503     2097152   82  Linux swap / Solaris
/dev/vda3         6293504   251658239   122682368   83  Linux   <= 确认重建的分区3正确

Command (m for help): w   <= 将分区表信息写回磁盘保存
The partition table has been altered!

Calling ioctl() to re-read partition table.

WARNING: Re-reading the partition table failed with error 16: Device or resource busy.
The kernel still uses the old table. The new table will be used at
the next reboot or after you run partprobe(8) or kpartx(8)
Syncing disks.
```

* 刷新内核对磁盘分区的识别

注意，由于是修改正挂载的磁盘分区，所以需要通过 `partprobe` 或者 `kpartx` 来通知重新识别。

不过，`partprobe`方式并不能使得内核识别正在使用的根磁盘分区：

```
#partprobe
Error: Partition(s) 3 on /dev/vda have been written, but we have been unable to inform the kernel of the change, probably because it/they are in use.  As a result, the old partition(s) will remain in use.  You should reboot now before making further changes.
```

检查磁盘分区在内核中信息

```
cat /proc/partitions | grep vd
```

显示如下

```
 253        0  125829120 vda
 253        1    1048576 vda1
 253        2    2097152 vda2
 253        3   59767808 vda3
```

可以看到并没有更新成最新的vda3磁盘分区扇区信息。

而`kpartx`是针对Multipath设备，不能使用：

```
#kpartx -v -a /dev/vda
device-mapper: reload ioctl on vda1 failed: Invalid argument
create/reload failed on vda1
add map vda1 (0:0): 0 2097152 linear /dev/vda 2048
device-mapper: reload ioctl on vda2 failed: Invalid argument
create/reload failed on vda2
add map vda2 (0:0): 0 4194304 linear /dev/vda 2099200
device-mapper: reload ioctl on vda3 failed: Invalid argument
create/reload failed on vda3
add map vda3 (0:0): 0 245364736 linear /dev/vda 6293504
```

`partx`设备是针对local设备，注意，不要使用`-v -a`参数，因为不是添加磁盘分区：

```
#partx -v -a /dev/vda
partition: none, disk: /dev/vda, lower: 0, upper: 0
/dev/vda: partition table type 'dos' detected
partx: /dev/vda: adding partition #1 failed: Device or resource busy
partx: /dev/vda: adding partition #2 failed: Device or resource busy
partx: /dev/vda: adding partition #3 failed: Device or resource busy
partx: /dev/vda: error adding partitions 1-3
```

而是应该参考 [Does RHEL 7 support online resize of disk partitions?](https://access.redhat.com/solutions/199573) 使用 `partx` 的 `-u` 参数表示更新：

```
partx -u /dev/vda
```

此时没有任何输出信息，实际已经更新完成。

再次检查分区大小信息，可以看到已经更新：

```
#cat /proc/partitions | grep vd
 253        0  125829120 vda
 253        1    1048576 vda1
 253        2    2097152 vda2
 253        3  122682368 vda3
```

* `原因解释`
  * RHEL7内核包含了从[block: add partition resize function to blkpg ioctl](http://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/commit/?id=c83f6bf98dc1f1a194118b3830706cebbebda8c4)的BLKPG ioctl的修改来支持`BLKPG_RESIZE_PARTITION`操作。
  * 当前RHEL7的`util-linux`工具包包含的`partx`和`resizepart`程序是唯一支持`BLKPG_RESIZE_PARTITION`的BLKPG ioctl操作的用户端命令。

* 检查磁盘

```
tune2fs -l /dev/vda3
```

* 扩展EXT4文件系统

`resize2fs`命令支持ext2/ext3/ext4文件系统重定义大小。如果文件系统是umount状态，则可以通过`resize2fs`工具扩展或收缩文件系统。如果文件系统是mount状态，则只支持扩展文件系统。注意：要在线扩展文件系统，需要内核和文件系统都支持on-line resize。（现代Linux发行版使用的内核 2.6 可以支持在线resize挂载状态的ext3和ext4；其中，ext3文件系统需要使用`resize_inode`特性）

```
resize2fs [ -fFpPMbs ] [ -d debug-flags ] [ -S RAID-stride ] [ -z undo_file ] device [ size ]
```

现在我们检查一下当前挂载的`/dev/vda3`磁盘文件系统，挂载为`/`分区，当前大小是`56G`:

```
#df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda3        56G  2.4G   51G   5% /
...
```

执行以下命令扩展文件系统(默认扩展成分区大小，也可以指定文件系统大小)

```
resize2fs /dev/vda3
```

显示输出

```
resize2fs 1.43.5 (04-Aug-2017)
Filesystem at /dev/vda3 is mounted on /; on-line resizing required
old_desc_blocks = 4, new_desc_blocks = 8
The filesystem on /dev/vda3 is now 30670592 (4k) blocks long.
```

再次检查挂载的`/`分区，可以看到空间已经扩展到`116G`

```
#df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda3       116G  2.4G  108G   3% /
...
```

此时就可以毫无障碍地使用扩展过的根文件系统。

* 强制系统重启进行fsck

RHEL 6等早期使用SysVinit和Debian使用Upstart早期版本，都支持在根分区的文件系统上`/forcefsck`文件来激活强制对根文件系统进行fsck，这是通过`/etc/rc.sysinit`脚本来实现的

```
touch /forcefsck
```

这样系统重启会强制进行fack

不过，在systemd系统中，需要通过`systemd-fsck` 服务来设置 [systemd-fsck@.service](https://www.freedesktop.org/software/systemd/man/systemd-fsck@.service.html)

参考 [archliux - fsck](https://wiki.archlinux.org/index.php/fsck) 使用以下命令检查分区设置的fsck检查频率（默认是每30次启动会做一次fsck，不过，当前文件系统设置了 `-1` 强制不检查，或者设置`0`也是不检查）

```
#dumpe2fs -h /dev/vda3 | grep -i "mount count"
dumpe2fs 1.43.5 (04-Aug-2017)
Mount count:              6
Maximum mount count:      -1
```

修改检查`/dev/vda3`频率，设置成`1`，则每次重启都会检查：

```
tune2fs -c 1 /dev/vda3
```

显示

```
tune2fs 1.43.5 (04-Aug-2017)
Setting maximal mount count to 1
```

此时验证文件系统可以看到

```
#dumpe2fs -h /dev/vda3 | grep -i "mount count"
dumpe2fs 1.43.5 (04-Aug-2017)
Mount count:              6
Maximum mount count:      1
```

现在我们重启操作系统，从VNC终端检查虚拟机可以看到虚拟机启动时进行了文件系统fsck。

既然已经做过fsck了，我们现在恢复原先默认关闭fsck的设置

```
tune2fs -c -1 /dev/vda3
```

# 参考

* [Does RHEL 7 support online resize of disk partitions?](https://access.redhat.com/solutions/199573) - 主要参考
* [Resize a Linux Root Partition Without Rebooting](https://devops.profitbricks.com/tutorials/increase-the-size-of-a-linux-root-partition-without-rebooting/)
* [How to resize ext4 root partition live without umount on Linux](https://linuxconfig.org/how-to-resize-ext4-root-partition-live-without-umount)
* [6.3. RESIZING AN EXT4 FILE SYSTEM](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/storage_administration_guide/ext4grow) - resize2fs命令参考
* [Reload Partition Table Without Reboot In Linux](https://www.teimouri.net/reload-partition-table-without-reboot-linux/#.XEbJLy2B3RY)