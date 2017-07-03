线程是进程中用于多并发执行的共享资源（内存地址空间，打开的文件）执行，线程降低了fork的开销以及昂贵的进程间通许开销。在Linux上，线程thread也称为轻量级进程（Lightweight Processes(LWP)），是在进程中创建的，所以会和进程具有相同的进程ID（PID）。对于Linux内核调度器来说，线程和标准进程除了共享一些资源外没有差异。

默认情况下，`ps`和`top`命令都只线程进程级别的信息。

# 通过`ps`检查线程

`ps`命令的`-T`参数可以激活线程视图，以下命令显示`<pid>`创建的所有线程：

```bash
ps -T -p <pid>
```

![ps_thread.jpg](/img/os/linux/process/thread/ps_thread.jpg)

在显示输出中，`PID`列就是进程，`SPID`列就是线程

如果只需要获取线程tid，可以使用

```
ps -o ppid=<pid>
```

例如`ps -o ppid=768`就可以输出进程pid是768的所有进程和线程id。

还有一个神奇的`-o ppid= `使用方法，如果`-o ppid= `没有带参数，则会输出指定进程的父进程pid

```
ps -o ppid= 768
```

显示进程`768`的父进程pid，或者使用`ps -f 768`则可以完整显示进程命令，其中也包含了父进程PPID字段，则通过脚本可以截取字段。

> 参考 [How do I get the parent process ID of a given child process?](https://askubuntu.com/questions/153976/how-do-i-get-the-parent-process-id-of-a-given-child-process)

* 显示所有线程方法：

```
ps -efj
```

```
ps xao pid,ppid,pgid,sid,comm 
```


# 通过`top`检查线程

`top`命令启动的时候，参数`-H`可以显示线程输出。在`top`的交互界面中，`H`按键可以切换`线程`或`进程`视图。

> 当`H`按键切换进程视图到线程视图时，可以看到`top`显示左上角`Tasks`（表示进程）转换成显示`Threads`（表示线程），并且数量倍数增加。

![ps_thread.jpg](/img/os/linux/process/thread/top_thread.jpg)

要检查某个进程`<pid>`对应的线程，可以使用

```bash
top -H -p <pid>
```

![ps_thread.jpg](/img/os/linux/process/thread/top_thread_for_process.jpg)

# 通过`htop`

[htop](http://ask.xmodulo.com/install-htop-centos-rhel.html)是一个加强的进程观察工具。进入`htop`之后，按下`<F2>`可以进入设置菜单，选择`Display option`，并选择`Three View`和`Show custom thread names`选项，然后按下`<F10>`推出设置。

![ps_thread.jpg](/img/os/linux/process/thread/htop_setup.jpg)

然后就可以观察每个进程的线程

![ps_thread.jpg](/img/os/linux/process/thread/htop_thread.jpg)

# 参考

* [Linux中查看进程的多线程](http://os.51cto.com/art/201312/420289.htm)
* [Is there a way to see details of all the threads that a process has in Linux?](http://unix.stackexchange.com/questions/892/is-there-a-way-to-see-details-of-all-the-threads-that-a-process-has-in-linux)
* [How to view threads of a process on Linux](http://ask.xmodulo.com/view-threads-process-linux.html)