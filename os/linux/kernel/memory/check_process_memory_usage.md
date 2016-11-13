在系统问题排查时，需要检查进程的内存使用情况，通过 `top` 和 `ps aux` 命令可以看到有两个有关进程内存使用的情况：

* `VIRT`(top)和`VSZ`(ps) 表示进程的虚拟内存占用
* `RES`(top)和`RSS`(ps) 表示进程的实际内存占用

`ps` 命令提供了一个非常好的排序功能 `--sort spec`，可以根据cpu，内存进行排序，并且还支持正向(+)和反向(-)排序

```
ps jax --sort=uid,-ppid,+pid
```

如果要检查内存排序

```
ps aux --sort -rss
```

在 `/proc/$pid/status` 文件中提供了进程的详细信息，其中`VmSize`是重要的参考

```
Name:	zfs-fuse
State:	S (sleeping)
Tgid:	22900
Pid:	22900
PPid:	1
TracerPid:	0
Uid:	0	0	0	0
Gid:	0	0	0	0
Utrace:	0
FDSize:	64
Groups:	0 1 2 3 4 6 10
VmPeak:	  757464 kB
VmSize:	  730728 kB		<= VSZ
VmLck:	       0 kB
VmHWM:	  559416 kB
VmRSS:	  559320 kB		<= RSS
VmData:	  705768 kB
VmStk:	      88 kB
VmExe:	    1080 kB
VmLib:	    3116 kB
VmPTE:	    1452 kB
VmSwap:	       0 kB
Threads:	54
......
```

# 参考

* [Linux process memory usage - how to sort the ps command](http://alvinalexander.com/linux/unix-linux-process-memory-sort-ps-command-cpu)
* [How to measure actual memory usage of an application or process?](http://stackoverflow.com/questions/131303/how-to-measure-actual-memory-usage-of-an-application-or-process)