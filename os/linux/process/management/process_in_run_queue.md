在使用`top`命令检查系统负载的时候，有时候你会惊讶地发现，明明`cpu`使用率很低的情况下，却显示出非常高的`load average`，甚至远远超过服务器的CPU数量，显示出系统负载很高。

> `Load Average`的定义见[系统负载Load Averages的含义](../../kernel/cpu/system_load_averages): `load average`并不是表示CPU的繁忙程度，而是度量系统整体负载。这个数值是是运行队列（状态R）和等待磁盘I/O（状态D）的任务数的分钟级平均值。

想要找出哪些在运行队列中的进程，可以采用

```
ps r -A
```

列出所有在运行队列中的进程

# 参考

* [How do I see what's in the run queue on GNU/Linux?](http://serverfault.com/questions/147333/how-do-i-see-whats-in-the-run-queue-on-gnu-linux)