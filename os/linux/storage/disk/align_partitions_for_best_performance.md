当使用`fdisk`和`parted`对磁盘分区，如果没有做好4k分区对齐，则会提示：

```
Warning: The resulting partition is not properly aligned for best performance.
Ignore/Cancel?
```

该如何正确设置分区，简单步骤就是查看块设备队列的参数：

```
# cat /sys/block/sdb/queue/optimal_io_size
1048576
# cat /sys/block/sdb/queue/minimum_io_size
262144
# cat /sys/block/sdb/alignment_offset
0
# cat /sys/block/sdb/queue/physical_block_size
512
```

然后将`optimal_io_size`加上`alignment_offset`然后除以`physical_block_size`：

(1048576 + 0) / 512 = `2048`

所以分区的起始扇区就是：

```
mkpart primary 2048s 100%
```

然后可以检查是否对齐：

```
(parted) align-check optimal 1                                            
1 aligned
```

# 参考

* [How to align partitions for best performance using parted](https://rainbow.chard.org/2013/01/30/how-to-align-partitions-for-best-performance-using-parted/)
* [GPT 分区 4k 扇区对齐和 UEFI 引导](http://lvii.github.io/system/2013/10/26/parted-gpt-4k-sector-align-and-uefi/)
* [Align GPT partitions on 4K sector disks](http://blog.kihltech.com/2014/02/align-gpt-partitions-on-4k-sector-disks/)