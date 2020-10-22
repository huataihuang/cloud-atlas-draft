在Linux中，很多情况下要求存储访问方式固定不变，不能因为系统重启或者磁盘插拔导致磁盘命名修改。特别是对于集群，例如部署Oralce RAC这样需要访问共享存储的环境，一定要确保存储设备名不能变化。

通常我们格式化磁盘时会自动创建唯一的 `PARTUUID` ，访问磁盘设备也可以通过唯一的 `DISKUUID` ，但是这样的随机字符串不容易被人读懂识别，所以我们需要通过给磁盘做label来方便管理。

对分区或卷添加标签是文件系统对一个功能，有两个主要对工具来完成分区标签对命名和重命名：

* `tune2fs`
* `e2label`

这两个工具都是 `e2fsprogs` 软件包的组成部分，可以用来处理EXT文件系统(ext2/ext3/ext4)。

* 显示分区标签:

```bash
e2label /dev/sda2
```

例如，我的树莓派操作系统根分区显示输出:

```
writable
```

* 如果需要将分区 `/dev/sda1` 标记加上 `Boot` 表示启动分区，可以使用以下任一命令:

```bash
e2label /dev/sda1 Boot
# 或者
tune2fs -L Boot /dev/sda1 
```

> 注意，标签最长16个字符

然后检查:

```
e2label /dev/sda1
```

* 要检查所有分区和卷的label，最好使用 `blkid` 命令：

```bash
# blkid
/dev/mmcblk0p1: LABEL_FATBOOT="system-boot" LABEL="system-boot" UUID="B726-57E2" TYPE="vfat" PARTUUID="ab86aefd-01"
/dev/mmcblk0p2: LABEL="writable" UUID="483efb12-d682-4daf-9b34-6e2f774b56f7" TYPE="ext4" PARTUUID="ab86aefd-02"
```

# 格式化

分区格式化时候，`mkfs`支持直接添加分区label

```bash
mkfs.ext4 /dev/sda2 -L ROOT
```

# FAT文件系统卷名

在Linux中通过 `dosfstools` 工具提供的 `mkfs.vfat` 以及 `fatlabel` 可以修订FAT文件系统的disk label：

```bash
mkfs.vfat /dev/sda1
fatlabel /dev/sda1 NEW_LABEL
```

# 参考

* [How to name/label a partition or volume on Linux](https://linuxconfig.org/how-to-name-label-a-partition-or-volume-on-linux)
* [How to change the volume name of a FAT32 filesystem?](https://unix.stackexchange.com/questions/44095/how-to-change-the-volume-name-of-a-fat32-filesystem)