EXT4文件系统性能比较中庸，如果出于稳定性和兼容性考虑选择了EXT4文件系统，可以尝试使用如下方法做一些优化

```
#increase number of requests:
echo 4096 > /sys/block/sdb/queue/nr_requests
#use aggressive mount options:
mount  -oremount,noatime,nodiratime,logbufs=8,logbsize=256k,largeio,inode64,swalloc,allocsize=131072k,nobarrier /dev/sdb /data
```

上述命令重新使用新的优化参数挂载了EXT4文件系统。

对于数据库+SSD存储，建议使用XFS文件系统。

# 参考

* [High load average, but low CPU/IO figures - how to diagnose? ](http://serverfault.com/questions/757546/high-load-average-but-low-cpu-io-figures-how-to-diagnose-dmesg-output-inclu)