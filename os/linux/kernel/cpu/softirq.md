# 软件中断上下文：softirq和tasklet

当一个系统调用准备返回到用户空间，或者一个硬件中断处理退出，任何被标记为`pending`(等待)状态的`软件中断`就会运行（通常软件中断是被硬件中断标记为等待执行状态的）。

`include/linux/interrupts.h`列出了不同的软中断。其中一个重要的软中断是计时器软中断（`include/linux/timer.h`）：你可以用它来设置给定时间内调用功能。

软中断通常很难处理，因为一些软中断可以在多个CPU上并行运行。由于这个原因，tasklets（`include/linux/interrupt.h`）经常使用：tasklets可以动态注册（意味着你想要多少就有多少），并且tasklet可以保证任何tasklet在任何时候只在一个CPU上运行，于此同时不同的tasklets可以并行。

# ksoftirqd - softirq daemon

`ksoftirqd`是一个在主机处于沉重的软中断负载情况下运行的针对每个cpu的内核线程。软中断通常服务于一个硬件中断的返回，但是有可能软中断会比它们所服务的对象更快地触发。如果一个软中断正在被处理时候又一次触发，则`ksoftirq`服务就被触发在进程的上下文中处理这个软中断。如果`ksoftirqd`占用了超出了CPU时间中少量百分比，就表明主机处于严重的软中断负载中。

# 将软中断分布到多个cpu核



# 参考

* [Software Interrupt Context: Softirqs and Tasklets](https://www.kernel.org/doc/htmldocs/kernel-hacking/basics-softirqs.html)
* [ksoftirqd — Softirq daemon](http://www.ms.sapientia.ro/~lszabo/unix_linux_hejprogramozas/man_en/htmlman9/ksoftirqd.9.html)
* [Linux: scaling softirq among many CPU cores](http://natsys-lab.blogspot.com/2012/09/linux-scaling-softirq-among-many-cpu.html)