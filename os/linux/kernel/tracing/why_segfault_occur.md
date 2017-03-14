# 什么情况下会出现段错误（Sementation Fault）

> 当一个程序试图访问不允许它访问的内存区域，或者试图以某种不允许的方式访问内存区域（例如，试图对只读内存区域写入数据，或者试图覆盖操作系统的部分内存），就会触发segmentation fault。

通常信号#`11`(`SIGSEGV`)在`signal.h`文件中做了定义。程序在接收到`SIGSEGV`信号的默认动作是异常退出。这个动作将终止进程，但是可能会生成一个core文件（也就是众所周知的`core dump`）用于debugging，或者执行一些特定平台相关的动作。一个core dump文件记录了计算机程序在特定事件的工作内存的状态，也就是当程序异常退出时内存中的信息。

Segmentation fault在以下情况发生：

* 存在bug的程序/命令，只能通过补丁来修复
* 在C程序中，当你尝试访问一个数组时候超出了数组的最后边界时候会出现SegFault
* 在chrooted jail环境中，当关键的共享库，配置文件或者`/dev/`对象缺失时候会发生SegFault
* 有时候硬件或者故障的内存或者驱动也会导致SegFault

# debug Segmentation Fault错误的建议

要调试Segmentation Fault可以尝试如下技术：

* 使用gdb来跟踪问题的准确来源
* 确保正确的硬件安装和配置
* 已经安装了所有补丁以及更新好系统
* 确保在[jail](https://www.cyberciti.biz/tips/lighttpd-php-segfault-at-0000000000000040-rip-error.html)内部已经安装了所有依赖
* 对于支持core dump的程序，如Apache已经[开启Apache core dump配置](https://www.cyberciti.biz/tips/configure-apache-web-server-for-core-dump.html)
* 使用[strace](https://www.cyberciti.biz/tips/linux-strace-command-examples.html)来诊断
* 使用Google查找解决方法
* 修复C程序中的逻辑错误，例如指针，空指针，数组等等
* 使用gdb来分析core dump文件

> 这里有一个[获取MySQL core文件](mysql_core)的案例

# 延伸阅读

> [PHP-FPM: SegFault every few seconds](https://community.centminmod.com/threads/segfault-every-few-seconds.5762/) 提供了有关SegFault的一些很好的文档介绍：

* [PHP-FPM - WARNING: failed processes threshold (10 in 60 sec) is reached, initiating reload Errors](https://community.centminmod.com/threads/warning-failed-processes-threshold-10-in-60-sec-is-reached-initiating-reload-errors.5742/)
* [Why Does The Segmentation Fault Occur on Linux / UNIX Systems?](https://www.cyberciti.biz/tips/segmentation-fault-on-linux-unix.html)
* strace知识：
  * [Debugging Stuck PHP-FPM Process With Strace - Coffee Coder](http://coffeecoder.net/blog/debugging-stuck-php-fpm-process-with-strace/)
  * [Why you should be using strace – Brandon Wamboldt](https://brandonwamboldt.ca/why-you-should-be-using-strace-1457/)
  * [Linux application/script debugging with 'strace'](https://ma.ttias.be/linux-application-script-debugging-with-strace/)
  * [markus-perl/php-strace · GitHub](https://github.com/markus-perl/php-strace)
* gdb
  * [PHP :: Generating a gdb backtrace](https://bugs.php.net/bugs-generating-backtrace.php)
  * [PHP-FPM - CentminMod.com LEMP Nginx web stack for CentOS](http://centminmod.com/phpfpm.html#browserstatus)
  * [PHP-FPM - pm.max_children | Centmin Mod Community](https://community.centminmod.com/threads/pm-max_children.479/)

With gdb backtrace and PHP debug compiled mode where centmin.sh has a PHPDEBUGMODE variable which you can set to PHPDEBUGMODE=y and recompile php via centmin.sh menu option 5 to enable debug mode for PHP-FPM. After troubleshooting set PHPDEBUGMODE=n and recompile php via centmin.sh menu option 5 again to disable debug mode.

```
PHPDEBUGMODE=n # --enable-debug PHP compile flag
```

# 参考

* [Why Does The Segmentation Fault Occur on Linux / UNIX Systems?](https://www.cyberciti.biz/tips/segmentation-fault-on-linux-unix.html)