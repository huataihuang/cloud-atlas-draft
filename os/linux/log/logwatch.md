[Logwatch](http://www.logwatch.org/)是一个日志分析和处理工具，用于统一报告服务器的活动，可以通过命令或者email发送报告。

# 配置

logwatch是层次化配置，相应的配置位于：

* /usr/share/logwatch/default.conf/*
* /etc/logwatch/conf/dist.conf/*
* /etc/logwatch/conf/*
* The script / command line arguments

`/usr/share/logwatch/default.conf/logwatch.conf`是默认所有配置，自定义配置则位于 `/etc/logwatch/conf/logwatch.conf`。

`Logwatch 7.4.3-3`开始支持通过journalctl查询systemd journal日志，请参考 [Logwatch dist.conf files for Arch Linux](https://bbs.archlinux.org/viewtopic.php?id=227516)。

> [Get rid of syslog (or a journald log filter in ~100 lines of Python)](https://tim.siosm.fr/blog/2014/02/24/journald-log-scanner-python/) 提供了一个方法来分析journal日志并发送邮件，可以参考。

# 参考

* [archlinux: Logwatch](https://wiki.archlinux.org/index.php/Logwatch)