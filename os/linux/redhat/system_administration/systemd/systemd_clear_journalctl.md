在CentOS 7开始使用的systemd使用了journal日志，这个日志的管理方式和以往使用syslog的方式不同，可以通过管理工具维护。

使用`df -h`检查磁盘文件，可以看到`/run`目录下有日志目录`/run/log/journal`，占用了数G空间

```
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/centos-root  8.5G  4.2G  4.4G  49% /
tmpfs                     16G  1.6G   15G  11% /run
```

在日志目录下有很多历史累积的日志。

检查当前journal使用磁盘量

```
journalctl --disk-usage
```

清理方法可以采用按照日期清理，或者按照允许保留的容量清理

```
journalctl --vacuum-time=2d
journalctl --vacuum-size=500M
```

如果要手工删除日志文件，则在删除前需要先轮转一次journal日志

```
systemctl kill --kill-who=main --signal=SIGUSR2 systemd-journald.service
```

要启用日志限制持久化配置，可以修改 `/etc/systemd/journald.conf`

```
SystemMaxUse=16M
ForwardToSyslog=no
```

然后重启

```
systemctl restart systemd-journald.service
```

检查journal是否运行正常以及日志文件是否完整无损坏

```
journalctl --verify
```

# 参考

* [How to clear journalctl](http://unix.stackexchange.com/questions/139513/how-to-clear-journalctl)
* [Is it safe to delete /var/log/journal log files?](https://bbs.archlinux.org/viewtopic.php?id=158510)