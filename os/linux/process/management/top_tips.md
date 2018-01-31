`top`是Linux/Unix中最常用的观察性能的工具之一，但是有很多使用技巧和观察原理值得仔细研究。

# `top`解读

一个简单的案例

```
top - 22:48:55 up 51 days,  8:47,  1 user,  load average: 10.79, 10.45, 16.44
Tasks: 5971 total,  20 running, 5948 sleeping,   0 stopped,   3 zombie
Cpu(s):  8.8%us,  7.4%sy,  0.0%ni, 82.9%id,  0.3%wa,  0.0%hi,  0.6%si,  0.0%st
Mem:  263819896k total, 100621984k used, 163197912k free,  1986536k buffers
Swap:        0k total,        0k used,        0k free, 30298168k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
20855 root      20   0 1308m 1.1g 6276 S 100.6  0.4 852:57.14 qemu-kvm
 9830 root      20   0 8770m 8.3g 5544 S 58.3  3.3   2471:14 qemu-kvm
 2955 root      20   0 1321m 1.1g 5340 S 42.0  0.4   5627:29 qemu-kvm
```

* 第一行
  * 显示当前时间(`22:48:55`)，系统启动时间（`up 51 days, 8:47`），当前用户数量（`1 user`），以及1分钟，5分钟和15分钟的平均负载`10.79, 10.45, 16.44`

> 有关平均负载的详细解释见 [系统负载Load Averages的含义](../../kernel/cpu/system_load_averages)

* 第3行
  * `us`
  * `sy`
  * `ni` - `nice` 表示CPU调度优先级，数值越高（+19）表示的优先级越低，而数值越低（-20）则表示优先级越高。可以通过`nice`命令来启动一个进程或者在进程运行时通过`renice`命令来调整。只有`root`用户可以增加一个进程的优先级。

# `batch mode`

`batch mode`是指[批量处理](https://en.wikipedia.org/wiki/Batch_processing)无需人工交互的模式，适合脚本调用以及将输出记录到日志文件或通过其他工具进一步处理。

```bash
top -b -n 5 > top.log
```

不过，上述`top`命令输出5次显示的是所有进程的性能，有可能只需要统计前10项，所以采用`head -17`过滤输出（`top`命令的前7行是性嫩统计摘要，所以`10+7`取了前17行）

```bash
top -b -n 5 | head -17 > top.log
```

> `-n 5`表示采样5次

# 指定进程号采样top

以下命令指定对进程`7890`进行20次采样，采样间隔时间是`0.5`秒

```
top -d 0.5 -b -n 20 -p 7890
```

> `-d 0.5`表示采样间隔`0.5`秒

# 找出最消耗系统CPU的进程

找出最消耗CPU资源的5个进程：

```
ps aux | sort -nrk 3,3 | head -n 5
```

或者

```
ps -Ao user,uid,comm,pid,pcpu,tty --sort=-pcpu | head -n 6
```

> 参考 [Show top five CPU consuming processes with `ps`](http://unix.stackexchange.com/questions/13968/show-top-five-cpu-consuming-processes-with-ps)

# `top`字段排序

在`top`中，可以通过`<`和`>`来使用不同的列进行排序。不过不是很直观操作。

可以按下`shift+O`来进入排序的子菜单，然后按下`k`表示按照`%CPU`排序，然后打一下`Enter`回车退出菜单。

按下`f`来进行字段添加或删除

# 显示指定用户进程

使用`-u`参数显示特定用户进程

```
top -u tecmint
```

# 显示运行中的进程

在`top`中，按下`z`，则会高亮显示正在运行的进程

# 显示线程

启动`top -H`，则显示完整线程。如果要观察指定进程的线程，则使用`top -H -p <pid>`

> 参考[How to view threads of a process on Linux](http://ask.xmodulo.com/view-threads-process-linux.html)

# 显示完整的进程路径

默认启动只显示一个短命令作为进程展示，要显示完整的路径命令，只要按下`c`

# 更改采样延迟时间

默认top采样延迟时间是3秒，可以按下`d`键来指定采样延迟时间

# 杀死进程

使用`k`来杀死指定进程

# 按CPU使用率排序

按下`Shift+P`按照 **每个** CPU 使用率来排序进程

# 按内存使用率排序

按下`Shift+M`按照内存使用率来排序进程

# renice进程

使用`r`可以更改进程的优先级，也称为`renice`

# 保存top命令的配置

按下`Shift+W`可以保当前的top配置

# 切换SMP模式以及图形化显示CPU繁忙程度

`t`按键可以切换top的多处理器显示方式，按一次`t`切换到多处理器SMP显示模式，再按一次`t`会以柱状图显示CPU的繁忙程度

# 参考

* [What does “batch mode” mean for the top command?](http://unix.stackexchange.com/questions/138484/what-does-batch-mode-mean-for-the-top-command)
* [Linux and Unix top command](http://www.computerhope.com/unix/top.htm)
* [Change top's sorting back to CPU](http://unix.stackexchange.com/questions/158584/change-tops-sorting-back-to-cpu)
* [12 TOP Command Examples in Linux](http://www.tecmint.com/12-top-command-examples-in-linux/)
* [Can You Top This? 15 Practical Linux Top Command Examples](http://www.thegeekstuff.com/2010/01/15-practical-unix-linux-top-command-examples)