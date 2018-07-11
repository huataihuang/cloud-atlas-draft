[Kworker, what is it and why is it hogging so much CPU?](https://askubuntu.com/questions/33640/kworker-what-is-it-and-why-is-it-hogging-so-much-cpu)中提到了采用perf分析kworker大量占用CPU的方法，非常实用：

# `perf record`

* 首先记录10秒钟CPU所有的backtraces

```
sudo perf record -g -a sleep 10
```

> * `-a` 表示`--all-cpus`，采集系统所有CPU
> * `-g` 表示启用`call-graph`（stack chain/backtrace）记录

* 然后分析

```
sudo perf report
```

可以通过 `←, →, ↑, ↓` 和 `Enter`键来检查各个进程的活动函数，这样就容易找到阻塞的热点和负载原因，非常实用。

# `perf top`

`perf top`可以实时检查系统调用的函数分析，并且还支持指定进程`-p <process_id>`，分析某个进程。

# 参考

* [Brendan Gregg's perf examples](http://www.brendangregg.com/perf.html)
* [Introduction to the perf-tools](http://hustcat.github.io/the-introduction-to-perf-tools/)
* [Kworker, what is it and why is it hogging so much CPU?](https://askubuntu.com/questions/33640/kworker-what-is-it-and-why-is-it-hogging-so-much-cpu)