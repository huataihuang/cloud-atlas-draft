# 发现`mcelog`

在维护Linux服务器时，有时候你会看到系统cron定时执行了一个名为`mcelog`的程序。

默认配置 `/etc/cron.hourly/mcelog.cron` 每小时执行一次。

这个定时脚本是软件包 `mcelog`安装的，这个工具[mcelog](http://www.mcelog.org/)目前仍在持续开发维护，可以从[内核工具](http://git.kernel.org/cgit/utils/cpu/mce/mcelog.git) 或[GitHub andikleen/mcelog](https://github.com/andikleen/mcelog) 获得。

# `mcelog`简介

`mcelog`记录了在现代x86 Linxu系统上的硬件的`主机检查`（主要是内存，IO和CPU的硬件错误）日志。当硬件报告了主机自检错误，内核会立即执行操作（例如杀死进程等）然后mcelog就会解码这些错误并且进行一些高级的错误响应，例如屏蔽故障的内存、CPU，或者触发事件。另外，mcelog也能够通过记录日志来处理修正后的错误。

mcelog主要用来处理主机自检和温控事件（温控事件由CPU监测并报告错误）。

32位x86 Linux内核（从2.6.30开始）和64位 Linux内核（2.6内核系统的早期开始）都需要mcelog来记录主机检查和运行在所有需要错误处理的Linux主机上。

mcelog服务记录[内存](http://www.mcelog.org/memory.html)和[各种途径](http://www.mcelog.org/error-flow.png)搜集的其它错误。`mcelog --client`命令可以用来查询一个运行的`mcelog`服务。这个服务也可以在可配置的阀值到达时[触发一些动作](http://www.mcelog.org/triggers.html)。这对于一些自动化[预测故障分析](http://www.mcelog.org/glossary.html#pfa)算法：包括[坏页下线](http://www.mcelog.org/badpageofflining.html)和自动化的[缓存错误处理](http://www.mcelog.org/cache.html)。用户也可以[配置](http://www.mcelog.org/config.html)自己定义的[动作](http://www.mcelog.org/triggers.html)。

所有的错误都被记录到`/var/log/mcelog`或`syslog`或`journal`中。

> 这里`主机检查`是指通过硬件自己检查出来的硬件故障并通过软件报告出来。

对于内存错误，mclog支持x86系统的集成的内存控制器；也支持所有现代的x86系统的cpu错误。

传统上`mcelog`是通过`cron`定时任务运行，但是这种方式现在已经不再适用。现在运行`mcelog`的方法是在启动操作系统时作为daemon运行。另外，`mcelog`也用于在命令行解码故障主机检查，不过，通常并不需要，因为现在内核可以在重启后自动完成日志记录。

当`mcelog`运行在daemon模式，它就可以持续在后台监视和等待错误发生，这是最快发现故障也是功能最全的运行方式。建议使用daemon模式运行`mcelog`，因为一些新功能（如内存页错误的预测故障分析）需要持续运行在daemon模式。

触发器（`trigger`）是内核在一个错误发生时运行`mcelog`的一种新的方式。这个配置是通过 `echo /usr/sbin/mcelog > /sys/devices/system/machinecheck/machinecheck0/trigger` 来配置的。

> 默认没有配置`/sys/devices/system/machinecheck/machinecheck0/trigger`，这时这个内容是空的。当将`/usr/sbin/mcelog`添加到这个proc文件中，就会在内核错误发生时触发运行`/usr/sbin/mcelog`来处理解码错误日志，方便排查故障。

> 内核编译配置`CONFIG_XEN_MCE_LOG`允许内核从Xen平台获取MCE错误并转换成Linux mcelog格式用于mcelog工具。

`mcelog`操作需要`/dev/mcelog`设备，这个设备通常自动由`udev`创建，也可以通过手工命令创建`mknod /dev/mcelog c 10 227`。设备创建后剋通过`ls -lh /dev/mcelog`检查：

```bash
crw------- 1 root root 10, 227 Jan 27 00:59 /dev/mcelog
```

# 安全

`mcelog`需要使用`root`身份运行，因为它需要出发动作，如`page-offlining`，这要求`CAP_SYS_ADMIN`。并且它需要打开设备`/dev/mcelog`和一个用于支持客户端的unix socket。

当`mcelog`运行在daemon模式，它会监听在一个unix socket上并处理`mcelog --client`的请求。默认会检查请求的`uid/gid`并且默认是`0/0`，可配置。客户端处理和相应是由daemon的完整的特权处理的。

# `mcelog.conf`

`/etc/mcelog/mcelog.conf`是`mcelog`配置文件

# CentOS 7上的`mcelog`

在RHEL 7.x平台，已经舍弃了使用cron方式运行`mcelog`程序的方法，而改为系统启动时运行`mcelog.service`服务进程。使用`ps`命令可以检查到系统运行了如下`mcelog`服务

```bash
/usr/sbin/mcelog --ignorenodev --daemon --syslog
```

```
--ignorenodev       Exit silently when the device cannot be opened
--daemon            Run in background waiting for events (needs newer kernel)
--syslog            Log decoded machine checks in syslog (default stdout or syslog for daemon)
```

# 案例

通常检查系统硬件故障，可以直接使用`mcelog`客户端

```bash
sudo mcelog
```

例如下面案例输出显示系统内存故障

```bash
MCE 0
HARDWARE ERROR. This is *NOT* a software problem!
Please contact your hardware vendor
Thu Mar 24 16:15:20 2016
CPU 15 BANK 7 MISC 5262be86 ADDR 7f594d80
STATUS cc1f1dc000010091 MCGSTATUS 0
CPUID Vendor Intel Family 6 Model 62
WARNING: SMBIOS data is often unreliable. Take with a grain of salt!
<24> DIMM 1600 Mhz Res13 Width 72 Data Width 64 Size 16 GB
Device Locator: CPU0_A0
Bank Locator: CPU0_Bank0
Manufacturer: Samsung
Serial Number: 1331F1A9
Asset Tag: Dimm0_AssetTag
Part Number: M393B2G70QH0-YK0
MCE 1
HARDWARE ERROR. This is *NOT* a software problem!
Please contact your hardware vendor
Thu Mar 24 16:15:20 2016
CPU 15 BANK 9 MISC 90840000000208c ADDR 4863b580
STATUS cc000150000800c0 MCGSTATUS 0
CPUID Vendor Intel Family 6 Model 62
<24> DIMM 1600 Mhz Res13 Width 72 Data Width 64 Size 16 GB
Device Locator: CPU0_A0
Bank Locator: CPU0_Bank0
Manufacturer: Samsung
Serial Number: 1331F1A9
Asset Tag: Dimm0_AssetTag
Part Number: M393B2G70QH0-YK0
```

# `only decoding architectural errors`错误提示

使用比较新型的处理器的环境，执行`mcelog`可能会有如下报错

```
mcelog: Family 6 Model 4f CPU: only decoding architectural errors
```

上述硬件平台使用

```
cpu family	: 6
model		: 79
model name	: Intel(R) Xeon(R) CPU E5-2682 v4 @ 2.50GHz
```

上述报错`only decoding architectural errors`表明mcelog不知道你的CPU，不能够解码该型号的特定错误，但是mcelog仍然能够将错误记录成raw（hex）格式。重要的错误通常是结构相关的，但是有些时候新的结构相关错误加入后，可能就不能看到它被解码。

可以尝试升级到最新的`mcelog`版本，通常可以支持新的硬件架构。

> 参考 [I get a "only decoding architectural errors" message. Does mcelog log all errors? ](http://www.mcelog.org/faq.html#17)

# 参考

* [mcelog官方网站](http://www.mcelog.org)
* [Linux x86_64: Detecting Hardware Errors](http://www.cyberciti.biz/tips/linux-server-predicting-hardware-failure.html)
* [mcelog: memory error handling in user space](http://www.halobates.de/lk10-mcelog.pdf)