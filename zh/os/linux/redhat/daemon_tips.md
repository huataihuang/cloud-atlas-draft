建议安装完CentOS/RHEL启动以下服务（默认系统已经安装软件包，但是没有启动和激活服务）

```bash
systemctl start postfix
systemctl enable postfix

systemctl start rsyslog
systemctl enable rsyslog
```

> 激活`postfix`可以使得系统定时执行的cron任务能够有一个输出结果，特别是一些cron执行失败或异常，俄可以通过邮件发现
>
> 激活`rsyslog`是为了生成`/var/log/messages`，虽然现在`systemctl`已经可以使用jounal来管理日志，但是传统的系统日志文件还是方便我们系统管理员检查维护。