在升级到使用RHEL/CentOS 7操作系统，或者使用Fedora这样比较前沿的社区版本，都采用了`systemd`作为服务管理和系统底层配置的基础服务。`systemd`所使用的`systemd-journald`是一个全新的日志管理系统，和以往传统的第三方日志程序，如`syslog-ng`，`rsyslog`不同，`systemd-journald`没有采用直接可以查看的文本日志，一切都需要通过特定的`journalctl`命令来管理。

对于传统系统管理员来说，升级系统后，突然消失的`/var/log/xxx`是非常诧异的，特别是`/var/log/messages`日志始终是空的，更觉得难以接受。

为了兼容以往的系统管理方式，可以在运行`systemd`的系统中安装第三方日志管理程序`syslog-ng`或者`rsyslog`，然后配置`systemd-journald`来转发日志，实现和以往完全相同的日志管理方式。

从`man journald.conf`中可以看到：

> ForwardToSyslog=, ForwardToKMsg=, ForwardToConsole=, ForwardToWall=
>
>           Control whether log messages received by the journal daemon shall be forwarded to a traditional syslog daemon, to the kernel log buffer (kmsg), to the system console, or sent as wall messages to all logged-in users. These options take boolean arguments. If forwarding to syslog is enabled but nothing reads messages from the socket, forwarding to syslog has no effect. By default, only forwarding to wall is enabled. These settings may be overridden at boot time with the kernel command line options "systemd.journald.forward_to_syslog=", "systemd.journald.forward_to_kmsg=", "systemd.journald.forward_to_console=", and "systemd.journald.forward_to_wall=". When forwarding to the console, the TTY to log to can be changed with TTYPath=, described below
>
>FORWARDING TO TRADITIONAL SYSLOG DAEMONS
>
>       Journal events can be transferred to a different logging daemon in two different ways. In the first method, messages are immediately forwarded to a socket (/run/systemd/journal/syslog), where the traditional syslog daemon can read them. This method is controlled by ForwardToSyslog= option. In a second method, a syslog daemon behaves like a normal journal client, and reads messages from the journal files, similarly to journalctl(1). In this method, messages do not have to be read immediately, which allows a logging daemon which is only started late in boot to access all messages since the start of the system. In addition, full structured meta-data is available to it. This method of course is available only if the messages are stored in a journal file at all. So it will not work if Storage=none is set. It should be noted that usually the second method is used by syslog daemons, so the Storage= option, and not the ForwardToSyslog= option, is relevant for them.

# 配置

编辑`/etc/systemd/journald.conf`

```
[Journal]
Storage=auto
#Compress=yes
#Seal=yes
#SplitMode=uid
#SyncIntervalSec=5m
#RateLimitInterval=30s
#RateLimitBurst=1000
#SystemMaxUse=
#SystemKeepFree=
#SystemMaxFileSize=
#RuntimeMaxUse=
#RuntimeKeepFree=
#RuntimeMaxFileSize=
#MaxRetentionSec=
#MaxFileSec=1month
ForwardToSyslog=yes
ForwardToKMsg=no   #其实这个转发是转发到/dev/kmsg,然后dimes命令从这里读日志，所以，这个参数打开，dmesg中将看到auth，su等用户态日志！
ForwardToConsole=no  #这个关闭，conman登陆后，console上打印kernel日志是正常的表现，如果，这个参数设置为yes，console上有个各种sudo日志，影响操作
#ForwardToWall=yes
#TTYPath=/dev/console
MaxLevelStore=debug
MaxLevelSyslog=debug
MaxLevelKMsg=notice
MaxLevelConsole=info
#MaxLevelWall=emerg
```

说明：

* `ForwardToConsole=no` 这个参数建议设置为`no`，因为一旦开启，将会把系统日志全部打印到控制台，实际上很多系统日志，如`sudo`日志不需要在串口控制台记录。

# 参考

* [Forwarding the Journal to Syslog Facility](https://doc.opensuse.org/documentation/leap/reference/html/book.opensuse.reference/cha.journalctl.html#sec.journalctl.config.forwardtosyslog)