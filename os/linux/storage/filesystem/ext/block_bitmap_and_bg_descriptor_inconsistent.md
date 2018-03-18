一台Arch Linux的微型NAS，由于经常直接断电，现在发现系统后`dmesg`显示如下信息

```
[   26.603426] EXT4-fs error (device sda1): ext4_mb_generate_buddy:758: group 0, block bitmap and bg descriptor inconsistent: 21751 vs 21765 free clusters
[   26.621088] JBD2: Spotted dirty metadata buffer (dev = sda1, blocknr = 0). There's a risk of filesystem corruption in case of system crash.
```

> 注意：根据Red Hat的[ext4 file system corrupted with ext4_mb_generate_buddy messages seen in the logs](https://access.redhat.com/solutions/155873)说明，以下解决方案并不是绝对验证的，仅参考。

上述`ext4`文件系统的`ext4_mb_generate_buddy`包胥哦信息可能意味着以下错误：

* 存在问题的SAN firmware。可以通过升级firmware来修复。
* 存储硬件的故障。建议做硬件诊断
* 在Red Hat Enterprise Linux 6中，在消耗了所有保留的GBT块之后执行一个offline resize会导致这个问题。建议参考[Consumption of reserved GDT blocks during an online resize results in corruption following the offline resize to an ext4 filesystem](https://access.redhat.com/solutions/1164083)解决方案。

# 排查

由于`ext4_mb_generate_buddy`的信息不是清晰，根源需要进一步排查。通常这个问题是硬件导致的：

* 需要整个`dmesg`输出
* 需要整个`/var/log/messages`
* 使用以下命令诊断文件系统镜像：

```
e2image -r /dev/<device> - | bzip2 > <device>.e2i.bz2
```

* 负载描述

# 文件修复

尝试`fsck`

```
e2fsck -fp /dev/<device>
```

# 根本原因

错误消息是因为ext4文件系统检测到在ext4 buddy分配bitmaps和在group descriptor中记录的空闲块数量不一致。这种不一致的情况，代码会根据bitmaps计算出的值来更新group descriptor记录的空闲块数量。

导致这个问题的根本原因依然没有调查明确，不过如果是远程存储环境，主要显示原因是硬件/firmware相关故障导致。

# 参考

* [ext4 file system corrupted with ext4_mb_generate_buddy messages seen in the logs](https://access.redhat.com/solutions/155873)