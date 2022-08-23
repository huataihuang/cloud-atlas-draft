> 在[为什么会发生segfault](why_segfault_occur)我们介绍了strace工具，这是一个轻量级的debug工具，特别适合用来在线排查系统故障。

# 排查进程

`strace` 命令提供 `-p` 参数可以附加到指定进程上进行跟踪，这也是常用方法:

```bash
sudo strae -p 14299
```

`strace` 命令 `-c` 参数可以进行统计 `-c` 

```bash
strace -c ls -R
```

# strace输出到日志

在使用 strace 跟踪程序时，输出内容都显示在屏幕上，如果你使用 `| tee` 重定向到磁盘日志文件，会发现日志文件是空的。解决方法是使用 `2&>1`

```
strace example_app 2>&1 | tee example_app.log
```

# 参考

* [strace Wow Much Syscall](http://www.brendangregg.com/blog/2014-05-11/strace-wow-much-syscall.html)
* [10 Strace Commands for Troubleshooting and Debugging Linux Processes](https://www.tecmint.com/strace-commands-for-troubleshooting-and-debugging-linux/)
* [8 Options to Trace/Debug Programs using Linux strace Command ](https://linoxide.com/linux-command/linux-strace-command-examples/)
* [5 simple ways to troubleshoot using Strace](http://hokstad.com/5-simple-ways-to-troubleshoot-using-strace)
* [Debugging Stuck PHP-FPM Process With Strace - Coffee Coder](http://coffeecoder.net/blog/debugging-stuck-php-fpm-process-with-strace/)
* [Why you should be using strace – Brandon Wamboldt](https://brandonwamboldt.ca/why-you-should-be-using-strace-1457/)
* [Linux application/script debugging with 'strace'](https://ma.ttias.be/linux-application-script-debugging-with-strace/)
* [markus-perl/php-strace · GitHub](https://github.com/markus-perl/php-strace)
* [Linux application/script debugging with ‘strace’](https://ma.ttias.be/linux-application-script-debugging-with-strace/)
* [The Magic of strace](http://chadfowler.com/2014/01/26/the-magic-of-strace.html)
* [Using strace and lsof to track down process hangs](http://mharrytemp.blogspot.com/2011/10/using-strace-and-lsof-to-track-down.html)
* [how to strace a process](https://docs.cilium.io/en/v1.12/concepts/terminology/)