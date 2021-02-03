`iotop`十一个类似`top`命令的查看磁盘I/O的工具，这个工具通过Linux内核（需要2.6.20以上版本）的输出信息来查看`I/O`并显示当前系统中使用IO的进程或线程。

安装（RedHat/CentOS）

```bash
yum install iotop -y
```

# 使用`iotop`

`iotop`显示采样周期内每个读写的进程/线程的I/O带宽，以及它们等待I/O的交换时间花费百分比。对于每个进程，它的I/O优先级（class/level）也显示出来。此外，I/O读写的带宽总和显示在最上方。

执行命令

```bash
sudo iotop
```

建议在启动`iotop`的时候带上`--only`参数，这样就只会显示实际有I/O的进程而不是所有的进程（后面会提到如何动态使用键盘来切换）

```bash
sudo iotop --only
```

以下显示同时启动3个`fio`压测进程时候使用`iotop`查看的情况

```bash
Total DISK READ :      15.48 M/s | Total DISK WRITE :	   15.61 M/s
Actual DISK READ:      15.50 M/s | Actual DISK WRITE:	   15.62 M/s
  TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN     IO>    COMMAND
11496 be/4 root        0.00 B/s    0.00 B/s  0.00 %  0.02 % [kworker/0:2]
11472 be/4 admin       5.11 M/s    5.33 M/s  0.00 %  0.00 % fio --filename=fio.testfile --name=fi~--direct=1 --time_based --runtime=36h
  383 be/4 root        0.00 B/s    3.91 K/s  0.00 %  0.00 % syslog-ng -F -p /var/run/syslog-ng.pid
11659 be/4 admin       5.18 M/s    5.28 M/s  0.00 %  0.00 % fio --filename=fio.testfile --name=fi~--direct=1 --time_based --runtime=36h
11675 be/4 admin       5.19 M/s    4.99 M/s  0.00 %  0.00 % fio --filename=fio.testfile --name=fi~--direct=1 --time_based --runtime=36h
````

`iotop`的一些有用选项：

* `-o, --only` - 只显示有实际读写I/O的进程或线程，而不是显示所有进程或线程，在交互的时候，可以按下`o`来切换显示模式
* `-b, --batch` - 非交互模式，通常用于记录I/O使用的脚本中
* `-n NUM, --iter=NUM` - 设置退出前执行的次数，通常在非交互的脚本中使用
* `-d SEC, --delay=SEC` - 刷新间隔时间，默认一秒。也可以使用小数点，例如 1.1秒
* `-p PID, --pid=PID` - 列出要监控的一组进程/线程（默认是所有）
* `-u USER, --user=USER` - 监控的用户列表（默认是所有）
* `-P, --processes` - 只显示进程。
* `-a, --accumulated` - 显示积累的（accumulated）I/O代替带宽。在这个模式下，iotop显示从iotop启动依赖已经完成的I/O进程数量
* `-k, --kilobytes` - 使用KB来显示而不是使用人容易理解的计算单位。这个模式比较适合在脚本中使用iotop。
* `-t, --time` - 在每一行添加一个时间戳
* `-q, --quiet`- 去除头部一些行：这个参数可以设置最多3次来移除头部行：`-q`列头部只在最初交互显示一次；`-qq`列头部不显示；`-qqq`，I/O的总结不显示。

我比较推荐使用:

```bash
iotop -o

iotop -ao
```

通过 `iotop -ao` 可以找出不断读写磁盘的进程，累积起来最大的进程，比较容易找到活跃的读写进程。这样找到可以的进程以后，在使用 `iotop -P xxx` 单独观察。

对于进程到底在读写什么文件，可能也会比较容易排查出问题。你要定位某个进程在读写什么文件，可以采用 [找出瞬间消失的TCP网络连接进程](../../security/audit/find_short_lived_tcp_connections_owner_process) 中采用的方法，即使用 [系统审核架构](../../security/audit/audit_architecture) 来定位。

# 参考

* [Linux iotop: Check What’s Stressing And Increasing Load On Your Hard Disks](http://www.cyberciti.biz/hardware/linux-iotop-simple-top-like-io-monitor/)