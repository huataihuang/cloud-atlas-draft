

# ksoftirqd - softirq daemon

`ksoftirqd`是一个在主机处于沉重的软中断负载情况下运行的针对每个cpu的内核线程。软中断通常服务于一个硬件中断的返回，但是有可能软中断会比它们所服务的对象更快地触发。如果一个软中断正在被处理时候又一次触发，则`ksoftirq`服务就被触发在进程的上下文中处理这个软中断。如果`ksoftirqd`占用了超出了CPU时间中少量百分比，就表明主机处于严重的软中断负载中。

# 参考

* [ksoftirqd — Softirq daemon](http://www.ms.sapientia.ro/~lszabo/unix_linux_hejprogramozas/man_en/htmlman9/ksoftirqd.9.html)