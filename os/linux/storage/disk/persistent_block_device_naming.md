# 持久化命名方式

有4种不同的方式可以持久化命名设备：

* `by-label`
* `by-uuid`
* `by-id`
* `by-path`

对于使用GPT(GUID Partition Table)，另外增加了2种命名方式：

* `by-partlabel`
* `by-partuuid`

> ??? 如果磁盘通过`parted`工具划分分区，并且将分区表设置为`GPT`的时候，才能使用`PARTUUID`来标识磁盘分区。难怪我使用fdisk将划分成dos分区，`mkfs.ext4`之后只看到`UUID`，没有看到`PARTUUID`

> 注意：使用[Disk cloning](https://wiki.archlinux.org/index.php/Disk_cloning)创建2块不同的数据盘会使用相同的命名。

* `lsblk -f`命令显示

```
$ lsblk -f
NAME   FSTYPE LABEL  UUID                                 MOUNTPOINT
sda
├─sda1 vfat          D37E-2016                            /boot/efi
└─sda2 ext4   rootfs bb6a7d65-996d-4883-98d3-eef82f836edd /
```

对于使用`GPT`分区表的磁盘，则应该使用`blkid`（可以显示`PARTUUID`）:

```
$ blkid
/dev/sda1: UUID="D37E-2016" TYPE="vfat" PARTUUID="d89e3f09-b4d2-48e2-9d7a-291e65368d8c"
/dev/sda2: LABEL="rootfs" UUID="bb6a7d65-996d-4883-98d3-eef82f836edd" TYPE="ext4" PARTLABEL="rootfs" PARTUUID="dd121a11-7454-4e71-abdc-397f08f515f6"
```

# `by-label`

虽然每个文件系统类型都可以具有一个label。所有的分区都在`/dev/disk/by-label`目录下有一个分区入口。这个目录是动态创建和销毁的，依赖于是否使用了label来创建分区

```
$ ls -l /dev/disk/by-label/
total 0
lrwxrwxrwx 1 root root 10 Mar 24 23:35 rootfs -> ../../sda2
```

注意：文件系统的label可以修改。以下是一些在常见文件系统修改label方法：

* `swap`（使用`util-linux`工具包）:

```
swaplabel -L <label> /dev/XXX
```

* `ext2/3/4`（使用`e2fsprogs`工具）：

```
e2label /dev/XXX <label>
```

* `btrfs`

```
btrfs filesystem label /dev/XXX <label>
```

* `reiserfs`

```
reiserfstune -l <label> /dev/XXX
```

* `jfs`

```
jfs_tune -L <label> /dev/XXX
```

* `xfs`

```
xfs_admin -L <label> /dev/XXX
```

* `fat/vfat`

```
fatlabel /dev/XXX <label>
mlabel -i /dev/XXX ::<label>
```

* `exfat`

```
exfatlabel /dev/XXX <label>
```

* `ntfs`

```
ntfslabel /dev/XXX <label>
```

* `zfs`

不支持`/dev/disk/by-label`

# `by-uuid`



# 参考

* [Persistent block device naming](https://wiki.archlinux.org/index.php/persistent_block_device_naming)