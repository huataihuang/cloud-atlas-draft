> 本文以[Log File Management](http://swift.siphos.be/linux_sea/logfilemanagement.html)一文（案例操作系统为Gentoo Linux）为基础进行翻译整理，结合Red Hat Linux以及实践的经验记载。

# System Logger

`system logger`是一个服务，允许不同的软件工具通过一个统一标准的接口来记录程序事件。对于本地运行的程序，这些工具可以通过`/dev/log` socket。远程服务则可以童工网络发送事件。

## `/dev/log`

`/dev/log`是由系统日志程序（`system logger`）创建的可以被所有人写入的。每个工具都希望通过系统日志程序的socket来简单记录日志。这个系统日志程序在socket的`另一头`监听并处理程序发送过来的日志事件。

## 日志事件元信息（Log Event Meta Information）

当工具需要记录一个日志是，需要提供两个附加字段信息：

* 事件相关的类型（facility）

这里`facility`是指发送事件的程序类型。这样系统日志程序能够过滤消息，也可以将消息发送到不同的日志文件。例如，类型有`authpriv`（安全/认证消息），`cron`（定时执行的消息）和`kern`（内核消息）。完整的消息类型可以使用 `man 3 syslog`查询。

* 事件的重要程度

| 重要程度 | 说明 |
| ---- | ---- |
| DEBUG | 调试目的的消息 |
| INFO | 信息类的消息 |
| NOTICE | 一个常规但是比信息类更重要的消息 |
| WARNING | 需要注意的警告信息 |
| ERROR | 错误消息需要进一步干预 |
| CRIT | 当关键错误发生时，常规操作可能被中断或者运行在降级模式 |
| ALERT | 警报，需要立即采取行动 |
| EMERG | 系统不可用 |

# 系统日志配置

这里的案例是`syslog-ng`日志程序，配置文件是 `/etc/syslog-ng/syslog-ng.conf` ，这个文件的配置非常直观，以下是案例配置

```bash
@version: 3.0
options {
  stats_freq(43200);
};

source src {
  unix-stream("/dev/log" max-connections(256));
  internal();
  file("/proc/kmsg");
};

destination messages { file("/var/log/messages"); };
destination cron { file("/var/log/cron.log"); };
destination auth { file("/var/log/auth.log"); };

filter f_messages { not facility(cron, auth, authpriv); };
filter f_cron { facility(cron); };
filter f_auth { facility(auth, authpriv); };
filter f_sys_app            { facility(local0,local1,local2,local3,local4); };

filter f_warnplus { level(warn, err, crit, emerg); };

log { source(src); filter(f_cron); filter(f_warnplus); destination(cron); };
log { source(src); filter(f_auth); destination(auth); };
log { source(src); filter(f_messages); destination(messages); };
log { source(src); filter(f_sys_app);         flags(final); };
log { source(src); destination(d_sys_loghost); };
```

* `source`部分定义消息的来源，然后`filter`部分定义了过滤器，以及`destination`定义消息存储的文件位置
* `filter`部分定义了消息的过滤方式，例如`f_warnplus`指接收`warn`以及以上重要级别的信息
* `source`部分定义了系统日志管理器从哪里接收消息，这里`/dev/log` socket表示接收本地通过socket传送的消息，另外还接收内核消息接口`kmsg`和它自己的内部日志

# logger工具

`logger`是一个shell工具，可以提供脚本方式向系统日志管理程序发送日志事件进行记录，以下是一个简单案例

```bash
ping 192.168.0.1 | logger -it logger_test -p local3.notice &
```

注意，上述命令会将消息记录到 `/var/log/messages`中类似如下

```bash
Apr 27 00:39:27 example-server logger_test[27478]: PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
Apr 27 00:39:27 example-server logger_test[27478]: 64 bytes from 192.168.0.1: icmp_seq=1 ttl=255 time=1.45 ms
Apr 27 00:39:28 example-server logger_test[27478]: 64 bytes from 192.168.0.1: icmp_seq=2 ttl=255 time=1.03 ms
Apr 27 00:39:29 example-server logger_test[27478]: 64 bytes from 192.168.0.1: icmp_seq=3 ttl=255 time=1.60 ms
```

详细使用方法参考 `man logger`

# `/proc/kmsg`和`/dev/log`

内核日志（使用`printk()`功能）发送消息给内核空间的ring buffer。这些消息有两种方式可以被用户空间应用程序访问：通过`/proc/kmsg`文件（需要`/proc`已经挂载），以及通过`sys_syslog`系统调用。

有两个主要的应用程序来读取（某种程度是控制）内核的ring buffer：`dmesg`和`klogd`。前者是用户打印出ring buffer中内容，后者是一个daemon服务，用来从`/proc/kmsg`中读取消息（如果`/proc`没有挂载就调用`sys_syslog`）并发送这些消息给`syslogd`或控制台。

在用户空间，有一个`syslogd`是一个监听在Unix domain socket的服务，并且可以选择让它监听在`514`的UDP端口。这个日志服务也可以从`klogd`来接收消息（`syslogd`不使用`/proc/kmsg`），然后将这些消息写入日志文件，或者命名管道，或者发送到远程主机（通过`syslog`协议，在`514` UDP端口）。可以通过`/etc/syslog.conf`配置。

用户空间应用程序通常使用`libc`的功能`syslog`来记录消息日志。`libc`发送这些消息到Unix domain socket `/dev/log` （可以被`syslogd`读取）。不过，如果应用程序是使用`chroot`运行则消息会写入到其他socket，例如`/var/named/dev/log`。此时，要配置`syslogd`来监听这些特定位于`/dev/log`socket。

`syslog`协议只是一个电报协议（datagram protocol），没有办法阻止一个应用程序发送syslog数据给任何Unix domain socket（只要它被允许打开socket），这样就完全绕开了`libc`的`syslog`功能。如果这些数据是符合`syslogd`格式的，就会使用这些数据来记录日志。

新型的`rsyslog`和`syslog-ng`已经取代了传统的`syslogd`，并且提供了通过加密的TCP连接将消息发送给远程主机，以及提供高可靠的时间戳。此外，`systemd`也具备自己的日志机制，

# 使用Logrotate维护日志

很多工具并没有提供日志轮转功能或日志清理功能，此时可以使用`logrotate`来管理日志。这个工具通过cron定时触发，并通过独立分离的配置文件来管理配置

这里的案例是 `/etc/logrotate.d/syslog-ng`

```bash
/var/log/messages /var/log/secure /var/log/maillog /var/log/spooler /var/log/boot.log /var/log/cron /var/log/kern{
		rotate 6
		monthly
		missingok
        sharedscripts
        postrotate
                /etc/rc.d/init.d/syslog-ng reload 2>/dev/null || true
        endscript
}
```

* `rotate 6`和`monthly`表示以每月为基础轮转6次（也就是可以保留7个月历史记录），旧日志文件会添加一个时间戳到文件名
* `missingok`表示如果日志文件不存在也是ok的
* `sharescripts`表示上面这些需要处理的日志文件都完成轮转之后在执行`postrotate`部分工作
* `postrotate`表示轮转结束以后执行的命令，也就是`syslog-ng`重新加载配置和日志文件

**logrotate配置参数**

| 参数 | 功能 |
| ---- | ---- |
| compress | 通过gzip 压缩转储以后的日志 |
| nocompress | 不需要压缩时，用这个参数 |
| copytruncate | 用于还在打开中的日志文件，把当前日志备份并截断 |
| nocopytruncate | 备份日志文件但是不截断 |
| create mode owner group | 转储文件，使用指定的文件模式创建新的日志文件 |
| nocreate | 不建立新的日志文件 |
| delaycompress | 和 compress 一起使用时，转储的日志文件到下一次转储时才压缩 |
| nodelaycompress | 覆盖 delaycompress 选项，转储同时压缩。 |
| errors address | 专储时的错误信息发送到指定的Email 地址 |
| ifempty | 即使是空文件也转储，这个是 logrotate 的缺省选项。 |
| notifempty | 如果是空文件的话，不转储 |
| mail address | 把转储的日志文件发送到指定的E-mail 地址 |
| nomail | 转储时不发送日志文件 |
| olddir directory | 转储后的日志文件放入指定的目录，必须和当前日志文件在同一个文件系统 |
| noolddir | 转储后的日志文件和当前日志文件放在同一个目录下 |
| prerotate/endscript | 在转储以前需要执行的命令可以放入这个对，这两个关键字必须单独成行 |
| postrotate/endscript | 在转储以后需要执行的命令可以放入这个对，这两个关键字必须单独成行 |
| daily | 指定转储周期为每天 |
| weekly | 指定转储周期为每周 |
| monthly | 指定转储周期为每月 |
| rotate count | 指定日志文件删除之前转储的次数，0 指没有备份，5 指保留5 个备份 |
| tabootext [+] list | 不转储指定扩展名的文件，缺省的扩展名是：.rpm-orig .rpmsave |
| size size | 当日志文件到达指定的大小时才转储，可以指定bytes(缺省)以及KB(sizek)或者MB (sizem). |

在 `/etc/cron.daily/logrotate`配置了每天由cron程序调用一次logrotate

# 简单删除旧日志的方法

如果不想使用`logrotate`来管理日志，而是仅仅想简单地删除超过一个月的旧日志，可以配置一个cron定时任务。例如 `/etc/cron.weekly/elog-cleanup`

```bash
#!/bin/sh

find /var/log/portage/elog -type f -mtime +30 -exec rm '{}' \;
```

# 参考

* [Log File Management](http://swift.siphos.be/linux_sea/logfilemanagement.html)
* [Understand logging in Linux](http://unix.stackexchange.com/questions/205883/understand-logging-in-linux)
* [linux 日志logger](http://blog.csdn.net/hunanchenxingyu/article/details/21413245)