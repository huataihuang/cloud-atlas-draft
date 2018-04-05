[进程状态标志的含义](process_stat_indicates)中`D`状态会导致应用响应缓慢以及服务器的低性能。

进程处于`D`状态或者不可中断的睡眠状态通常是在等待I/O。使用`ps`命令显示处于不可中断睡眠状态的`D`进程。`vmstat`

# 案例

线上服务器出现`[xenwatch]`进程状态进入`D`状态，通常这个问题是由于磁盘（包括虚拟机磁盘）故障导致进程进入不可中断的睡眠状态。

```
$ps aux | grep D
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root        39  0.0  0.0      0     0 ?        D     2015   1:22 [xenwatch]
root        83  0.2  0.0      0     0 ?        D     2015 2161:41 [kswapd0]
root       132  0.0  0.0      0     0 ?        D     2015   0:00 [fw_event0]
```

检查D进程的方法

```
ps r -A
```


# 参考

* [Processes in an Uninterruptible Sleep (D) State](https://www.novell.com/support/kb/doc.php?id=7002725)