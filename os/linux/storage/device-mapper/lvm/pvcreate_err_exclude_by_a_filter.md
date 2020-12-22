当在磁盘上创建LVM卷的PV时，有时候会遇到报错:

```bash
# pvcreate /dev/vdb
Device /dev/vdb excluded by a filter.
```

这种情况通常是因为这个磁盘曾经使用过，建立过磁盘分区。这时如果通过 fdisk 或者 parted命令删除掉分区，但是分区表依然存在情况下，直接使用磁盘就会报上述错误。

解决的方法是完全抹去磁盘上的分区表信息：

```
wipefs -a /dev/sdb
```

还有一种方法是修改 `/etc/lvm/lvm.conf` 将 `filter =` 和 `global_filter =` 过滤注释掉，以便绕过这个限制。

# 参考

* [Vgextend : “device excluded by a filter”](https://serverfault.com/questions/917650/vgextend-device-excluded-by-a-filter)