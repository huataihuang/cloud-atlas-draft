# `ps aux`输出的`STAT`字段

在使用`ps aux`命令检查进程，有一列`STAT`字段，可以看到多种状态

* `D` 不可中断睡眠状态（通常是IO）
* `R` 运行中或者可运行的（在运行队列中）状态
* `S` 可中断的睡眠状态 (等待一个事件完成后唤醒)
* `T` 停止状态，或者通过一个任务控制信号或者它正在被跟踪
* `W` 分页中状态（在2.6.xx内核以后不再使用）
* `X` 死亡状态（以后不可见）
* `Z` 不工作（"僵尸"）进程，被终止的进程但是没有被父进程回收

对于BSD格式和其他使用的状态标记，附加字符含义：

* `<` 高优先级（对其他用户不好）
* `N` 低优先级（对其他用户好）
* `L` 在内存中有锁住的页面（针对实时和定制IO）
* `s` 是一个会话领先者
* `l` 是一个多线程（使用`CLONE_THREAD`，类似`NPTL` pthreads那样)
* `+` 在前台进程组

> 在线上维护服务器的时候，经常会遇到犹豫磁盘故障导致进程进入`D`状态

> 使用`man ps`可以看到在`PROCESS STATE CODES`段落下有上述进程状态解释

# top和进程的CPU states

# 参考

* [What do the STAT column values in ps mean?](http://askubuntu.com/questions/360252/what-do-the-stat-column-values-in-ps-mean)
* [Understanding Linux CPU stats](http://blog.scoutapp.com/articles/2015/02/24/understanding-linuxs-cpu-stats)