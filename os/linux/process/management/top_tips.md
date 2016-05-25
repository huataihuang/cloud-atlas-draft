`top`是Linux/Unix中最常用的观察性能的工具之一，但是有很多使用技巧和观察原理值得仔细研究。

# `batch mode`

`batch mode`是指[批量处理](https://en.wikipedia.org/wiki/Batch_processing)无需人工交互的模式，适合脚本调用以及将输出记录到日志文件或通过其他工具进一步处理。

```bash
top -b -n 5 > top.log
```

不过，上述`top`命令输出5次显示的是所有进程的性能，有可能只需要统计前10项，所以采用`head -17`过滤输出（`top`命令的前7行是性嫩统计摘要，所以`10+7`取了前17行）

```bash
top -b -n 5 | head -17 > top.log
```

# 参考

* [What does “batch mode” mean for the top command?](http://unix.stackexchange.com/questions/138484/what-does-batch-mode-mean-for-the-top-command)
* [Linux and Unix top command](http://www.computerhope.com/unix/top.htm)