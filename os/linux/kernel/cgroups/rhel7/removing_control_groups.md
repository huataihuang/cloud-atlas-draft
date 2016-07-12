临时cgroups在其包含的进程停止的时候被自动释放。通过传递参数`--remain-after-exit`可以使得`systemd-run`在进程结束的时候依然保留运行的单元。

要优雅地停止单元，使用命令

```
systemctl stop name.service
```

将这里的`name.service`名字替换成你希望停止的服务。要停止一个或多个单元中的进程，执行：

```
systemctl kill name.service --kill-who=PID,... --signal=signal
```

这里的`name`是单元的名字，例如`httpd.serivce`。使用`--kill-who`参数来选择你希望停止的cgroup中断进程。要同时终止多个进程，则使用`,`逗号分隔的`PID`。将`signal`替换成你希望发送给指定进程的POSIX信号。默认信号是`SIGTERM`。

例如参考上例中的启动的`toptest.serivce`（见[RHEL7 使用控制组](using_control_groups.md)）

```
systemctl kill toptest.service
```

持久化的cgroup将在`disabled`单元的时候被释放，并且配置文件被删除：

```
systemctl disable name.service
```

# 参考

* [2.2. REMOVING CONTROL GROUPS](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Resource_Management_Guide/sec-Removing_Cgroups.html)