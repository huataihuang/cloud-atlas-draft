[nice](https://en.wikipedia.org/wiki/Nice_(Unix))是Unix/Linux中一个直接映射到内核`nice`调用的程序。`nice`工具可以进程运行的优先级，这样就可以给予进程相比较其他进程更多或更少的CPU时间。

进程的优先级数值从`-20`到`19`范围，数值越小优先级越高。默认的进程优先级是从该进程的父进程继承的，通常是`0`。

只有超级用户`root`可以设置更小的（更高的）优先级值，其他用户只能设置较大的（更低的）优先级值。

# `nice`

实际作用于进程的优先级数值依赖Unix操作系统设计的调度方式。特定的操作系统的调度方式有许多启发式的机制（例如，对于优先进程由于CPU时间片较多相应会获得更多的I/O）。

举个简单的例子，当两个捆绑CPU的进程同时在一个CPU上并发运行的时候，每个进程分到的CPU时间是`20-p`，这个`p`就是进程的优先级数值。这样一个`nic`数值是`+15`的进程就会得到普通优先级进程的分配的25%的CPU时间：`(20-15)/(20-0)=0.25`。

# 检查进程的Nice值

使用`ps`命令可以看到进程的nice值（也就是优先级）

```
ps -elf
```

输出显示

```
F S UID        PID  PPID  C PRI  NI ADDR SZ WCHAN  STIME TTY          TIME CMD
4 S root         1     0  0  75   0 -  2592 ?       2014 ?        00:05:02 init [3]
1 S root         2     1  0 -40   - -     0 migrat  2014 ?        00:02:48 [migration/0]
1 S root         3     1  0  94  19 -     0 ksofti  2014 ?        00:01:09 [ksoftirqd/0]
5 S root         4     1  0 -40   - -     0 watchd  2014 ?        00:00:00 [watchdog/0]
1 S root         5     1  0  70  -5 -     0 worker  2014 ?        00:01:13 [events/0]
1 S root         6     1  0  70  -5 -     0 worker  2014 ?        00:00:20 [khelper]
...
1 S root       131     7  0  80  -5 -     0 worker  2014 ?        00:00:00 [aio/0]
1 S root       132     7  0  80  -5 -     0 worker  2014 ?        00:00:00 [aio/1]
1 S root       133     7  0  80  -5 -     0 worker  2014 ?        00:00:00 [aio/2]
1 S root       134     7  0  80  -5 -     0 worker  2014 ?        00:00:00 [aio/3]
1 S root       264     7  0  71  -5 -     0 worker  2014 ?        00:00:00 [kpsmoused]
5 S 53312      300 32766  0  75   0 - 22028 ?       2015 ?        00:00:00 sshd: xuangao.djj@pts/911
4 S admin      301   300  0  75   0 - 14084 -       2015 pts/911  00:00:00 ssh localhost
...
0 S admin      328 20578  0  75   0 - 16646 -      Jun12 pts/1450 00:00:00 /bin/bash
1 S root       341     7  0  73  -5 -     0 worker  2014 ?        00:00:00 [kstriped]
1 S root       362     7  0  70  -5 -     0 kjourn  2014 ?        00:01:43 [kjournald]
1 S root       384     7  0  71  -5 -     0 kaudit  2014 ?        00:00:00 [kauditd]
```

> 可以看到`init`初始进程的`NI`（`nice`值）是`0`，一些系统关键进程的`nice`值优先级较高是`-5`，用户进程继承了`init`的优先级，通常`nice`是`0`

也可以使用`top`命令，其中有一列`NI`值就是进程运行的`nice`值。

# 设置进程nice值

启动程序的时候设置`nice`优先级。`负`的`nice`值将增加进程的优先级。注意，由于需要`-`表示是一个参数，所以设置高优先级的的`负`值的时候，需要使用两个`-`，例如`--10`表示设置`nice`值是`-10`

```
nice --10 top -b
```

检查优先级

```
ps -elf | grep -e "top -b" -e "NI" | grep -v "grep"
```

可以看到

```
F S UID        PID  PPID  C PRI  NI ADDR SZ WCHAN  STIME TTY          TIME CMD
4 S root     31971 28317  1  70 -10 -  3495 poll_s 12:06 pts/1    00:01:24 top -b
```

上述可以看到进程的优先级值是`-10`

# 使用`-n`参数修改运行进程的优先级

`nice`命令的`-n`参数可以修改进程的优先级，表示在`nice`上加上一个数值。

```
       -n, --adjustment=N
              add integer N to the niceness (default 10)
```

我们来测试一下命令

```
sudo nice -n 10 top -b
```

然后检查

```
ps -elf | grep -e "top -b" -e "NI" | grep -v "grep"
```

可以看到输出的进程的`nice`值为`10`（0+10=10）

```
F S UID        PID  PPID  C PRI  NI ADDR SZ WCHAN  STIME TTY          TIME CMD
4 R root      3128 28317  3  90  10 -  3494 -      13:47 pts/1    00:00:00 top -b
```

* 举例：对大文件归档，降低归档命令优先级，可以用`-n 19`使得这个命令的`nice`值为`19`（实际是`0+19=19`）


```
nice -n 19 tar cfzf archive.tgz largefile
```

> 在生产环境中，经常需要定时清理系统过期的日志。如果直接使用`rm`命令脚本，对于海量文件或者非常巨大的日志文件，会导致系统响应缓慢影响业务（甚至系统低峰时期操作也会有影响）。此时应该在脚本中通过`nice -n`命令，降低日志处理脚本的运行优先级。

> `-n 19`也可以写成`-19`，注意，这里`-19`的`-`是参数的意思，设置的是正值。如果要设置`-5`这个高优先级的`nice`值，应该使用`-n -5`或者`--5`来表示（由于默认`init`的nice值是0，所以进程启动默认的nice值都是以0为基线，这样`--5`和`-n -5`就恰好是相同的结果）

# `limits.conf`配置用户启动进程的默认nice值

在Linux中，可以通过修改`/etc/security/limits.conf`的配置来设置：

```
log    *    nice     19
```

> 设置`log`用户进程的执行优先级数值为`19`，这样`log`用户执行的脚本（如清理和归档）的优先级就很低，不会抢占业务系统的CPU时间
>
> `limits.conf`的语法是`<domain><type><item><value>`，其中`item`可以是`nice`，就可以调整进程的优先级数值
>
> `domain`是`username`,`@groupname`,`*`,`%`（maxlogins限制）

# 修改已经运行的进程的优先级

`renice`命令是修改已经在运行的进程的优先级。参考`man renice`，这个命令是直接设置优先级数值（没有`-n`参数）

```
renice -13 -p 4751
```

显示提示信息


```
4751: old priority 10, new priority -13
```

`renice`命令还有两个非常有用的参数

* `-u user`：调整指定用户的所有进程的优先级

```
renice 10 -u user1
```

则调整`user1`用户所有的进程的nice值为`10`，这样这个用户的进程的优先级别就降低了。

* `-g group`：通过组名或组id来设置其所有的进程的优先级

```
renice 10 -g group1
```

> Linux还有一个`ionice`的命令，针对的是I/O调度而不是CPU时间。

# 参考

* [nice (Unix)](https://en.wikipedia.org/wiki/Nice_(Unix))
* [How to Change Process Priority using Linux Nice and Renice Examples](http://www.thegeekstuff.com/2013/08/nice-renice-command-examples/)