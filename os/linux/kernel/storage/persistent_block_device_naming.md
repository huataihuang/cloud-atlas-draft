服务器上不止一个 SATA, SCSI 或 IDE 磁盘控制器，那么它们所对应的设备节点将会依随机次序添加。这样就可能导致每次引导时设备的名字如 /dev/sda 与 /dev/sdb 互换了，最终导致系统不可引导、kernel panic、或者设备不可见。持久化命名法可以解决这些问题。 

块设备持久化命名在集群共享存储块设备（例如 Oralce RAC）以及RAID或者替换磁盘设备时非常重要。

# 持久化命名的方法

有四种持久化命名方案：
* by-label
* by-uuid
* by-id
* by-path

对于那些使用GUID 分区表(GPT)的磁盘，还有额外的两种方案：
* by-partlabel
* by-partuuid



# 参考

* [Persistent block device naming (简体中文)](https://wiki.archlinux.org/index.php/Persistent_block_device_naming_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [How do I find the UUID of a filesystem](https://serverfault.com/questions/3132/how-do-i-find-the-uuid-of-a-filesystem)