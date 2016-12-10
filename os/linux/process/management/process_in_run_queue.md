在使用`top`命令检查系统负载的时候，有时候你会惊讶地发现，明明`cpu`使用率很低的情况下，却显示出非常高的`load average`，甚至远远超过服务器的CPU数量，显示出系统负载很高。

> `Load Average`的定义见[系统负载Load Averages的含义](../../kernel/cpu/system_load_averages): `load average`并不是表示CPU的繁忙程度，而是度量系统整体负载。这个数值是是运行队列（状态R）和等待磁盘I/O（状态D）的任务数的分钟级平均值。

想要找出哪些在运行队列中的进程，可以采用

```
ps r -A
```

列出所有在运行队列中的进程

以下命令列出所有在运行状态的进程和线程

```
ps -o comm,pid,ppid,user,time,etime,start,pcpu,state --sort=comm aH | grep '^COMMAND\|R$'
```

* 按虚拟内存大小排序进程

```
ps awwlx --sort=vsz
```

显示输出

```
F   UID   PID  PPID PRI  NI    VSZ   RSS WCHAN  STAT TTY        TIME COMMAND
1     0     2     0  20   0      0     0 kthrea S    ?          0:00 [kthreadd]
1     0     3     2 -100  -      0     0 migrat S    ?          0:02 [migration/0]
1     0     4     2  20   0      0     0 ksofti S    ?          0:48 [ksoftirqd/0]
1     0     5     2 -100  -      0     0 cpu_st S    ?          0:00 [migration/0]
...
```

# 参考

* [How do I see what's in the run queue on GNU/Linux?](http://serverfault.com/questions/147333/how-do-i-see-whats-in-the-run-queue-on-gnu-linux)
* [Huge CPU load due to high system usage](http://unix.stackexchange.com/questions/153466/huge-cpu-load-due-to-high-system-usage)
* [Isolating Linux High System Load](https://www.tummy.com/articles/isolating-heavy-load/)