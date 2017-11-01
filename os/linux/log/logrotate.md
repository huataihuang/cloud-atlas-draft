# 验证logrotate

* 手工执行

```
sudo logrotate -f /etc/logrotate.conf
```

如果出现报错

```
error: line 2 too long in state file /var/lib/logrotate.status
```

则删除掉`/var/lib/logrotate.status`再次执行

# debug logrotate

如果系统messages日志出现`logrotate: ALERT exited abnormally with [1]`则表明logrotate在执行日志轮转时候出现异常，有可能是部分logrotate配置错误导致报错。

这个消息的来源是`/etc/cron.daily/logrotate`，在这个每日执行的定时脚本中有如下内容

```bash
#!/bin/sh

/usr/sbin/logrotate /etc/logrotate.conf
EXITVALUE=$?
if [ $EXITVALUE != 0 ]; then
    /usr/bin/logger -t logrotate "ALERT exited abnormally with [$EXITVALUE]"
fi
exit $EXITVALUE
```

## 注意：默认SELinux安全设置不允许logrotate轮转`/var/log`目录之外的文件

如果使用logrotate来轮转非`/var/log`目录下日志文件，则会失败。

## 诊断logrotate

* 首先检查`logrotate.status`文件

```
cat /var/lib/logrotate.status
```

`logrotate.status`文件记录了需要轮转监控的所有文件

* 通过debug模式运行logrotate

```
/usr/sbin/logrotate -d /etc/logrotate.conf
```

或者通过以下命令记录debug的信息

```
/usr/sbin/logrotate -d /etc/logrotate.conf 2 > /tmp/logrotate.debug
```

> 如果logrotate配置的轮转日志目标文件不存在，则会提示` ALERT exited abnormally with [1]`错误。

# 参考

* [I am getting 'logrotate: ALERT exited abnormally with [1]' messages in logs when SELinux is in the Enforcing mode](https://access.redhat.com/solutions/39006)
* [How to debug logrotate warnings or errors when logrotate is not running correctly ](https://access.redhat.com/solutions/32831)
