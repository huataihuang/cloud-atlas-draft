有时候我们需要知道一个文件系统最后的挂载时间，为什么呢？

因为我最近遇到一个问题，阿里云的虚拟机挂载的大容量数据盘，初始化时间被系统盘要慢很多。为了能够把kdump的转储文件存放到数据盘上，我需要等待数据盘就绪并被挂载到 `/home` 目录之后再启动kdump。这就需要检查数据盘 `vdb` 和系统盘 `vda` 初始化的时间间隔，以便能够有一个等待时间。

> 实际上更好的推迟kdump的方式不是估算等待时间，而是有一个循环的检查文件系统是否挂载好的脚本，这个后续我再补充。

- 简单获取文件系统挂载的时间戳是使用 `tune2fs` 命令:

```bash
sudo tune2fs -l /dev/sda1
```

可以看到类似如下输出

```
tune2fs 1.41.11 (14-Mar-2010)
Last mounted on:          /
Filesystem magic number:  0xEF53
Filesystem revision #:    1 (dynamic)
Filesystem state:         clean
Errors behavior:          Continue
Filesystem OS type:       Linux
Inode count:              7028736
Filesystem created:       Sat Nov 14 20:49:49 2009
Last mount time:          Wed Jun  9 18:19:42 2010
Last write time:          Thu Jun  3 09:38:18 2010
Mount count:              20
Maximum mount count:      32
```

# 参考

* [Finding out the time a filesystem was last mounted](https://superuser.com/questions/152640/finding-out-the-time-a-filesystem-was-last-mounted)