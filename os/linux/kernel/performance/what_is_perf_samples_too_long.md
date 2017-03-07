Linux操作系统启动有时候在系统日志中有如下有关perf的记录

```
perf samples too long (2506 > 2500), lowering kernel.perf_event_max_sample_rate to 50000
```

这个信息是什么意思呢？

在 Documentation/sysctl/kernel.txt 中有如下解释：

 perf_cpu_time_max_percent:

 Hints to the kernel how much CPU time it should be allowed to
 use to handle perf sampling events.  If the perf subsystem
 is informed that its samples are exceeding this limit, it
 will drop its sampling frequency to attempt to reduce its CPU
 usage.

 Some perf sampling happens in NMIs.  If these samples
 unexpectedly take too long to execute, the NMIs can become
 stacked up next to each other so much that nothing else is
 allowed to execute.

 0: disable the mechanism.  Do not monitor or correct perf's
    sampling rate no matter how CPU time it takes.

 1-100: attempt to throttle perf's sample rate to this
    percentage of CPU.  Note: the kernel calculates an
    "expected" length of each sample event.  100 here means
    100% of that expected length.  Even if this is set to
    100, you may still see sample throttling if this
    length is exceeded.  Set to 0 if you truly do not care
    how much CPU is consumed.

# perf Examples

Kernel的wiki有关Perf提供了3个参考文档值得学习：

* [Brendan Gregg's perf examples](http://www.brendangregg.com/perf.html)是非常详细的案例解析
* [CppCon 2015: Chandler Carruth "Tuning C++: Benchmarks, and CPUs, and Compilers! Oh My!"](https://www.youtube.com/watch?v=nXaxk27zwlk&feature=youtu.be)
* [Roberto Vitillo's presentation on Perf events](http://indico.cern.ch/event/141309/contributions/1369454/attachments/126021/)

# 参考

* [How to disable perf subsystem in Linux kernel?](http://serverfault.com/questions/714648/how-to-disable-perf-subsystem-in-linux-kernel)