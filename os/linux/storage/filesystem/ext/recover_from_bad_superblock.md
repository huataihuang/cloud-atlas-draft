以前曾经使用[Arch Linux ARM](https://archlinuxarm.org/)[安装在Seagate GoFlex Home NAS设备](https://archlinuxarm.org/platforms/armv5/seagate-goflex-home#installation)上。但是因为硬件故障，最近发现磁盘的数据分区无法访问。以下是将磁盘通过外接SATA控制器连接到另外一台GoFlex Home上到输出：

```
# mount /dev/sdb3 /mnt
mount: /mnt: wrong fs type, bad option, bad superblock on /dev/sdb3, missing codepage or helper program, or other error.
```

出现超级块错误导致无法挂载分区，该如何恢复呢？

尝试fsck不能修复，显示在超级块中显示的文件系统大小和设备的物理大小不一致。

```
# fsck /dev/sdb3
fsck from util-linux 2.31.1
e2fsck 1.44.0 (7-Mar-2018)
The filesystem size (according to the superblock) is 483230486 blocks
The physical size of the device is 483230485 blocks
Either the superblock or the partition table is likely to be corrupt!
Abort<y>?
```

这个问题见[EXT3文件系统报错"block bitmap and bg descriptor inconsistent"](block_bitmap_and_bg_descriptor_inconsistent)

# 参考

* [How to recover from a bad superblock](https://ubuntuforums.org/showthread.php?t=1245536&p=7822694#post7822694)