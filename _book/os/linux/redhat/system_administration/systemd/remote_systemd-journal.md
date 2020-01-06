# 远程存储日志的思路

对于将本地服务器日志输出到远程集中服务器上存储，有两种思路：

* 直接使用 systemd-journal 的远程功能，将journal日志输出到远程服务器

找到有两种方式使用`systemd-journal`远程功能：[systemd-journal-remote](https://www.freedesktop.org/software/systemd/man/systemd-journal-remote.html) 和 [systemd-journal-gatewayd](https://www.freedesktop.org/software/systemd/man/systemd-journal-gatewayd.service.html)

可以参考 [How to configure systemd journal-remote?](https://serverfault.com/questions/758244/how-to-configure-systemd-journal-remote) 使用 `systemd-journal-remote` ，有详细的配置。

[Trying out systemd-journal-gatewayd](https://bneijt.nl/blog/post/trying-out-systemd-journal-gatewayd/)提供了设置`systemd-journal-gatewayd`的方法。

> [systemd/systemd-netlogd](https://github.com/systemd/systemd-netlogd) 提供了使用 syslog 协议转发日志的方法。注意：这里不是使用systemd-journal方式转发，适合结合到传统的rsyslog和syslog-ng。

* 使用第三方日志服务器，如[syslog-ng远程日志存储](syslog-ng_systemd-journal_remote_log)

`以下远程journal方法待实践`

# `systemd-journal-gateway`

# `systemd-journal-remote`