# 软件中断上下文：softirq和tasklet

当一个系统调用准备返回到用户空间，或者一个硬件中断处理退出，任何被标记为`pending`(等待)状态的`软件中断`就会运行（通常软件中断是被硬件中断标记为等待执行状态的）。

`include/linux/interrupts.h`列出了不同的软中断。其中一个重要的软中断是计时器软中断（`include/linux/timer.h`）：你可以用它来设置给定时间内调用功能。

软中断通常很难处理，因为一些软中断可以在多个CPU上并行运行。由于这个原因，tasklets（`include/linux/interrupt.h`）经常使用：tasklets可以动态注册（意味着你想要多少就有多少），并且tasklet可以保证任何tasklet在任何时候只在一个CPU上运行，于此同时不同的tasklets可以并行。

# ksoftirqd - softirq daemon

`ksoftirqd`是一个在主机处于沉重的软中断负载情况下运行的针对每个cpu的内核线程。软中断通常服务于一个硬件中断的返回，但是有可能软中断会比它们所服务的对象更快地触发。如果一个软中断正在被处理时候又一次触发，则`ksoftirq`服务就被触发在进程的上下文中处理这个软中断。如果`ksoftirqd`占用了超出了CPU时间中少量百分比，就表明主机处于严重的软中断负载中。

# 检查方法

* 过查看/proc/stat文件，也可以得到中断数，及每个CPU core上的分布：

```
cat /proc/stat |grep intr |awk '{print $1" "$2" "$3" "$4" "$5" "$6" "$7" "$8}'
```

输出类似

```
intr 637112839981 290 0 0 0 1113 0
```

一般情况下，中断总数略大于软中断数。

* 通过mpstat查看每个CPU core上softirq的开销：

```
mpstat -P ALL 1
```

输出可以看到所有CPU的负载

```
11:32:50 AM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
11:32:51 AM  all    1.04    0.00    1.40    0.01    0.00    0.25    0.00    0.00    0.00   97.29
11:32:51 AM    0    2.15    0.00    4.30    1.08    0.00    0.00    0.00    0.00    0.00   92.47
11:32:51 AM    1    1.00    0.00    4.00    0.00    0.00    0.00    0.00    0.00    0.00   95.00
11:32:51 AM    2    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00  100.00
11:32:51 AM    3    0.00    0.00    1.02    0.00    0.00    0.00    0.00    0.00    0.00   98.98
11:32:51 AM    4    2.13    0.00    6.38    0.00    0.00    2.13    0.00    0.00    0.00   89.36
11:32:51 AM    5    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00  100.00
11:32:51 AM    6    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00    0.00  100.00
11:32:51 AM    7    4.17    0.00    7.29    0.00    0.00    2.08    0.00    0.00    0.00   86.46
...
Average:     CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
Average:     all    1.24    0.01    1.34    0.00    0.00    0.27    0.00    0.00    0.00   97.15
Average:       0    2.23    0.00    2.72    0.24    0.00    0.78    0.00    0.00    0.00   94.03
Average:       1    0.45    0.00    2.15    0.06    0.00    0.23    0.00    0.00    0.00   97.12
Average:       2    0.67    0.00    0.50    0.00    0.00    0.00    0.00    0.00    0.00   98.83
Average:       3    7.05    0.00    1.29    0.00    0.00    0.06    0.00    0.00    0.00   91.61
Average:       4    2.87    0.00    6.78    0.00    0.00    2.64    0.00    0.00    0.00   87.70
Average:       5    0.56    0.00    0.67    0.00    0.00    0.06    0.00    0.00    0.00   98.72
Average:       6    0.28    0.00    0.34    0.00    0.00    0.00    0.00    0.00    0.00   99.39
Average:       7    4.70    0.00    7.67    0.00    0.00    2.06    0.00    0.00    0.00   85.57
...
```

如果有非常集中的软中断，则需要处理

# 将软中断分布到多个cpu核

# 

# 参考

* [Software Interrupt Context: Softirqs and Tasklets](https://www.kernel.org/doc/htmldocs/kernel-hacking/basics-softirqs.html)
* [ksoftirqd — Softirq daemon](http://www.ms.sapientia.ro/~lszabo/unix_linux_hejprogramozas/man_en/htmlman9/ksoftirqd.9.html)
* [Linux: scaling softirq among many CPU cores](http://natsys-lab.blogspot.com/2012/09/linux-scaling-softirq-among-many-cpu.html)