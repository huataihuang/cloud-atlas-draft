在使用`top`命令检查系统负载的时候，可以看到`Load averages`字段，但是这个字段并不是表示CPU的繁忙程度，而是度量系统整体负载。

`Load averages`采样是从`/proc/loadavg`中获取的:

```bash
2.72 3.03 3.10 7/2241 16303
```

前3个字段表示1分钟，5分钟和15分钟内在运行队列（状态`R`）或者等待磁盘I/O（状态`D`）的任务数量的平均值。这个数值和`uptime`命令显示的平均负载是一样的。

第4个字段包含两个通过`/`分隔的数值，前一个数值是当前运行

# 参考

* [Very high CPU load, but nothing significant in top](http://unix.stackexchange.com/questions/134381/very-high-cpu-load-but-nothing-significant-in-top)