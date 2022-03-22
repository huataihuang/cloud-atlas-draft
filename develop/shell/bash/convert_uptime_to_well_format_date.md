在很多维护工作中，我们会查看服务器稳定运行了多久，使用命令:

```bash
uptime
```

这个命令非常实用，但是输出的时间格式有点让人迷惑

```bash
14:33:30 up 24 days, 16:07, 11 users,  load average: 0.64, 0.76, 0.71
```

可以看到当前系统时间是 `14:33:30` ，系统已经运行了 `24` 天 `零` `16小时7分钟` 。不过，这个输出其实不太直观，我直到今天才看 `help` 理解这个格式。

其实， `uptime` 有更好的输出格式，其中有2个参数非常有用:

- `-p` 表示 `pretty` 格式，也就是漂亮格式， `uptime -p` 输出就是:

```bash
up 3 weeks, 3 days, 16 hours, 7 minutes
```

- `-s` 表示 `since` ，也就是从什么时间启动， `uptime -s` 输出的是系统启动的时间点:

```bash
2021-12-19 22:26:19
```

# `last` 命令

`last` 命令能够回溯搜索 `/var/log/wtmp` 文件(或 `-f` 参数指定的wtmp文件)并显示自这个文件创建以来，系统所有所有用户的登录和登出。

```bash
last
```

没有任何参数则输出所有

```
...
huatai   pts/1        192.168.6.1      Fri Oct 15 10:16 - 23:45  (13:28)
huatai   pts/1        192.168.6.1      Fri Oct 15 10:01 - 10:11  (00:10)
huatai   pts/0        192.168.6.1      Fri Oct 15 09:59 - 23:45  (13:46)
reboot   system boot  5.4.0-88-generic Fri Oct 15 09:45 - 17:49 (5+08:04)
huatai   tty1                          Fri Oct 15 09:31 - down   (00:00)
huatai   pts/7        :pts/5:S.3       Thu Oct 14 22:49 - 00:06  (01:16)
huatai   pts/6        :pts/5:S.2       Thu Oct 14 22:14 - 00:06  (01:51)
huatai   pts/1        :pts/5:S.0       Thu Oct 14 22:14 - 00:06  (01:51)
...
```

`last` 命令可以指定用户过滤，例如 `last huatai` 就只显示 `huatai` 用户的登录信息

这样，`last` 命令就可以用来查看系统重启记录( `reboot` ):

```bash
last reboot
```

可以看到类似输出

```bash
reboot   system boot  5.4.0-91-generic Sun Dec 19 22:26   still running
reboot   system boot  5.4.0-91-generic Thu Dec 16 09:20 - 22:23 (3+13:03)
reboot   system boot  5.4.0-91-generic Wed Dec 15 23:26 - 09:02  (09:35)
reboot   system boot  5.4.0-91-generic Wed Dec 15 23:12 - 23:24  (00:12)
reboot   system boot  5.4.0-90-generic Sat Nov 20 10:29 - 23:09 (25+12:40)
...
```

这也提供了一个获取最近一次启动时间的方法: `still running` 那一行

我们可以通过以下命令非常方便获得最近一次启动时间:

```bash
last reboot | grep "still running" | awk '{print $5" "$6" "$7" "$8}'
```

输出就是最近启动时间

```
Sun Dec 19 22:26
```

# 参考

* [Convert linux uptime to well format date](https://unix.stackexchange.com/questions/483061/convert-linux-uptime-to-well-format-date)