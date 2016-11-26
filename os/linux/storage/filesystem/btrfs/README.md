# Btrfs功能

Btrfs 或 B-tree filesystem是一个GPL开源的写时复制（copy-on-write, COW）并且由多家公司（Oracle, RedHat, Fujitsu, Intel, Facebook, Linux Foundation, Suse等）共同开发等文件系统。Btrfs是支持最高16EB且最大8EB文件（理论文件大小支持16EB但受限于Linux VFS实际只能最大8EB）的文件系统。

Btrfs具有自愈功能，并且可以跨多个卷，且支持在线的文件系统伸缩功能。

Btrfs提供了卷管理功能，支持多个设备的条带化（strip）RAID0 和镜像（mirror）RAID1，以及 RAID10（strip+mirror），并且**实验性**支持单数据校验盘(RAID5)和双数据校验盘（RAID6）。

Btrfs可以创建子卷快照，并且快照支持只读或者多的。子卷支持quota。

支持基于zlib和LZO的文件系统压缩。

Btrfs支持SSD（TRIM/Discard）并且做到了优化（避免无效的seek）。

Btrfs支持**在线**文件系统碎片整理以及**离线**文件系统检查。

# Btrfs的现状（2016年）

Btrfs从2007年开始开发，至今已经有9年历史。2015年被Suse Linux Enterprise Server 12发行版作为默认文件系统，并且在RedHat Enterprise Linux 7作为技术Preview（估计下一个版本会作为生产型文件系统）。

> Btrfs需要做好数据备份，并且其运行需要充足的内存支持（缺乏内存btrfs check会crash）

# Btrfs是否适合生产？

这个问题需要视具体应用场景来看，需要平衡风险和收益！！！

* 如果没有完善的数据备份和恢复机制，以及健壮的故障切换保障，不建议在生产环境中使用Btrfs。
* 需要对开源技术持续且快速的跟进，具有不断维护升级内核的技术和投入。
* 对性能和功能有强烈的追求和驱动力。

> 可以看到FaceBook在生产环境中使用了Btrfs，但这是基于Facebook有强大的技术人才储备（雇佣了Btrfs核心开发）且有完善且经过考验的故障切换集群、多数据中心等容灾等保障措施。

> 以上仅供参考，开源软件是 **NO WARRANTY** 的，一切需要自己承担

# 参考

* [Btrfs wiki](https://btrfs.wiki.kernel.org/index.php/Main_Page)
* [It’s 2016: and BTRFS could really be your next filesystem](http://www.virtualtothecore.com/en/2016-btrfs-really-next-filesystem/)