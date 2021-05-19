# load average的值从哪里来

在使用`top`命令检查系统负载的时候，可以看到`Load averages`字段，但是这个字段并不是表示CPU的繁忙程度，而是度量系统整体负载。

`Load averages`采样是从`/proc/loadavg`中获取的:

```bash
2.72 3.03 3.10 7/2241 16303
```

前3个字段表示1分钟，5分钟和15分钟内在运行队列（状态`R`）或者等待磁盘I/O（状态`D`）的任务数量的平均值。这个数值和`uptime`命令显示的平均负载是一样的。

第4个字段包含两个通过`/`分隔的数值，前一个数值是当前可运行的内核调度对象（进程，线程），后一个数值是当前存在系统中的内核可调度对象的数量。

第5个字段是系统最近创建的进程的PID。

如果你看到load average数值是20，则表明平均有20个进程在运行或等待状态。有可能系统有很高的负载但是CPU使用率却很低，或者负载很低而CPU利用率很高，因为这两者没有直接关系。

如果你看到`%wa`数值很高泽表明一些进程在异常地使用磁盘，这导致系统非常缓慢。需要找出这个异常状态是`D`的进程（其进程发起磁盘io并等待磁盘IO返回所以进入D状态）。这里有一个比较简单的找出 `D` 进程方法，就是使用命令:

```bash
ps r -A
```

可以看到所有运行的进程：

```
    PID TTY      STAT   TIME COMMAND
2648425 ?        D      0:00 [kworker/1:4+events_freezable]
2660146 pts/0    R+     0:00 ps r -A
```

上述 `STAT` 是 `D` 就是进入D状态进程，如果不是非常高负载磁盘IO，就有可能是磁盘IO异常(无法读写)。这样就可以进一步排查。

# 参考

* [Very high CPU load, but nothing significant in top](http://unix.stackexchange.com/questions/134381/very-high-cpu-load-but-nothing-significant-in-top)