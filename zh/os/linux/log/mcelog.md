# 发现`mcelog`

在维护Linux服务器时，有时候你会看到系统cron定时执行了一个名为`mcelog`的程序。

默认配置 `/etc/cron.hourly/mcelog.cron` 每小时执行一次。

在RHEL 5.x平台：

```bash
#!/bin/bash

if [ -e /proc/xen ] && [ `cat /sys/hypervisor/uuid` != "00000000-0000-0000-0000-000000000000" ]; then
	# this is a PV Xen guest.  Do not run mcelog.
	exit 1;
else
	/usr/sbin/mcelog --ignorenodev --filter >> /var/log/mcelog
fi
```

在RHEL 6.x平台：

```bash
#!/bin/bash

# is this Xen?
if [ -e /proc/xen/capabilities ]; then
	# xen
	grep control_d /proc/xen/capabilities >& /dev/null
	if [ $? -ne 0 ]; then
	# domU -- do not run on xen PV guest
	exit 1;
	fi
fi

# is this CPU supported?
/usr/sbin/mcelog --supported >& /dev/null
if [ $? -eq 1 ]; then
	exit 1;
fi

# Now safe to run mcelog
/usr/sbin/mcelog --ignorenodev --filter >> /var/log/mcelog
```

这个定时脚本是软件包 `mcelog`安装的，这个工具[mcelog](http://www.mcelog.org/)目前仍在持续开发维护，可以从[内核工具](http://git.kernel.org/cgit/utils/cpu/mce/mcelog.git) 或[GitHub andikleen/mcelog](https://github.com/andikleen/mcelog) 获得。

在RHEL 7.x平台，已经舍弃了使用cron方式运行`mcelog`程序的方法，而改为系统启动时运行`mcelog.service`服务进程。使用`ps`命令可以检查到系统运行了如下`mcelog`服务

```bash
/usr/sbin/mcelog --ignorenodev --daemon --syslog
```

# `mcelog`简介

`mcelog`记录了在现代x86 Linxu系统上的`主机检查`（主要是内存，IO和CPU的硬件错误）记录。

32位x86 Linux内核（从2.6.30开始）和64位 Linux内核（2.6内核系统的早期开始）都需要mcelog来记录主机检查和运行在所有需要错误处理的Linux主机上。

mcelog服务记录[内存](http://www.mcelog.org/memory.html)和[各种途径](http://www.mcelog.org/error-flow.png)搜集的其它错误。`mcelog --client`命令可以用来查询一个运行的`mcelog`服务。这个服务也可以在可配置的阀值到达时[触发一些动作](http://www.mcelog.org/triggers.html)。这对于一些自动化[预测故障分析](http://www.mcelog.org/glossary.html#pfa)算法：包括[坏页下线](http://www.mcelog.org/badpageofflining.html)和自动化的[缓存错误处理](http://www.mcelog.org/cache.html)。用户也可以[配置](http://www.mcelog.org/config.html)自己定义的[动作](http://www.mcelog.org/triggers.html)。

所有的错误都被记录到`/var/log/mcelog`或`syslog`或`journal`中。

> 这里`主机检查`是指通过硬件自己检查出来的硬件故障并通过软件报告出来。

# 参考

* [mcelog官方网站](http://www.mcelog.org)
