在系统维护中，很多时候需要删除大量的日志文件或者极大的日志，此时如果直接使用`rm`命令会导致大量的磁盘io，并引发系统负载过高，影响业务。

解决的方法是引入`ionice`指令，这个指令和`nice`类似：`nice`是为了对进程的CPU利用率进行限制，而`ionice`则针对磁盘IO进行限制。

# `ionice`简介

`ionice`设置或读取应用程序的I/O调度分类和优先级。如果没有参数或者只使用`-p`参数，`ionice`将查询当前进程I/O调度分类和优先级。

如果没有指定分类，默认使用`best-effort`调度分类，默认的优先级是`4`。

```
ionice [-c class] [-n level] [-t] -p PID...
```

进程会属于以下3中调度分类：

* `Idle` - 程序只在没有其他程序在给定周期内请求磁盘I/O的时候才偶的磁盘访问时间，即运行在idle I/O优先级。这种调度分类是的对于常规的系统活动影响为0.这种调度分类没有优先级参数。从内核2.6.25开始，这个调度分类可以被常规用户所使用。
* `Best-effort` - 这是对于任何没有要求特定I/O优先级的进程的高效率调度算法。这里分类可以使用参数`0-7`，数值越小优先级越高。程序运行在相同的`best-effort`优先级会按照roud-robin方式运行。

> 内核2.6.26之后采用CFQ I/O调度器，进程不会要求继承CPU调度分类的I/O优先级。I/O优先级起源于进程的CPU nice级别。

* `Realtime` - RT调度列别是首先满足磁盘访问，而不管系统其他的进程。这个RT调度类别需要非常小心使用，因为它会使得其他进程"饿死"。类似`best-effort`调度分类，在每个调度窗口进程给定的时间片有8种优先级。这个调度分裂不允许普通用户（非root用户）使用。

# `ionice`参数

* `-c, --class class`

通过调度分裂的名字或者名字对应的数字来指定调度分类： `0` 表示 `none`， `1` 表示`realtime`，`2` 表示 `best-effort`，`3` 表示 `idle`

* `-n, --classdata level`

设置调度分类的级别。这个参数只在分类参数使用时生效。对于`realtime` 和 `best-effort` ，`0-7`是可以使用的参数值。

* `-p, --pid PID..`

指定运行的进程的pid

* `-P, --pgid PGID...`

指定运行进程的组gid

* `-t, --ignore`

忽略设置优先级的错误。对于老的内核或者不支持优先级的情况，使用这个参数即使不支持指定的调度优先级。

# 脚本案例

```
/bin/rm -f /var/log/nginx.log[.-]*
/bin/find /var/log/ -name my_server.log[.-]* -type f -mtime +30 -exec ionice -c 3 rm -f {} ;
/bin/find /var/log/ -name tsar.data.* -type f -mtime +90 -exec ionice -c 3 rm -f {} ;
/bin/find /opt/my_app/log -name access.log -type f -size +100M -exec ionice -c 3 sh -c > {} ;
```

