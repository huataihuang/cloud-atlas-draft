# 问题

用户反馈线上突然有集群频繁调用接口，原先每天只调用几次接口查询的客户端，突然变成每分钟调用一次，导致服务器集群不堪重负。

> 每分钟一次的节奏，很像监控或者crontab指令执行。

> 本文案例的IP地址和主机名都mock

# 通过tcpdump和ss来找寻网络连接

由于初步的监控或者crontab检查都没有找到每分钟一次的调用，就想到通过tcpdump来找出调用网络的罪魁祸首。

然而，`tcpdump`能够提供网络通讯的分析，也能够找出调用my_server的HTTP通讯内容，但是无法简明地告诉我是哪个程序哪个命令。

```
tcpdump -i eth0 -tttt -nn host 192.168.2.12 or host 192.168.1.60 and port 80
```

以下命令通过连续`ss`试图找出连接目标服务器80端口的连接 - 然而依然只能看到端口

```
while true;do ss -ntap -o state established '( dport = :80 )'; done
```

其他还有一些可能的工具是采用 `iftop` 和 `nethogs` 这样的协议分析工具，能够提供访问端口的统计排序，对于大量的网络持续调用分析会有很大帮助。

然而不幸的是，这个案例中网络访问时间实在太短暂了。从tcpdump的抓包来看，访问my_server服务的时间只有0.1秒，网络统计分析工具很难在这么短和这么小流量的情况下找出线索。

# 通过系统审核排查

对于系统中各种纷繁复杂的调用命令，有没有方法记录下每个命令，哪怕它只执行短短的一次呢？

答案就是`安全审核`！系统的每条调用命令都会被记录，以便进行安全分析。这也提供了我们排查故障的一个利器。

实际上Linux系统默认就安装了安全审核工具，结合内核审核模块，经过简单配置就可以按照规则来记录需要监控的系统操作。

这里我们先实践，然后简单介绍一个Linux安全审核的架构。

> 有关Linux系统审核架构和部署，请参考[系统审核架构](audit_architecture)

* 启动`auditd`服务

```
service auditd start
```

* 设置对网络socket访问记录审核信息

```
auditctl -a exit,always -F arch=b64 -S connect -k MYCONNECT
```

> 注意：增加审核规则是参数`-a`，对应删除审核规则`-d`，即：`auditctl -d exit,always -F arch=b64 -S connect -k MYCONNECT`

默认情况下，在 `/var/log/audit/audit.log` 文件中的审核系统储存日志项；如果启用日志旋转，就可以旋转储存在同一目录中的 `audit.log` 文件。

我们来检查`audit.log`日志中访问my_server执行了`my_server`指令

```
type=SYSCALL msg=audit(1494266546.314:44826): arch=c000003e syscall=42 success=no exit=-115 a0=8 a1=7fffe73b7650 a2=10 a3=0 items=0 ppid=1750 pid=1751 auid=0 uid=99 gid=99 euid=99 suid=99 fsuid=99 egid=99 sgid=99 fsgid=99 tty=(none) ses=1292436 comm="my_server" exe="python2.7" key="MYCONNECT"
type=SOCKADDR msg=audit(1494266546.314:44826): saddr=0200005064436F3C0000000000000000
type=SYSCALL msg=audit(1494266546.327:44827): arch=c000003e syscall=42 success=no exit=-115 a0=9 a1=7fffe73b7060 a2=10 a3=0 items=0 ppid=1750 pid=1751 auid=0 uid=99 gid=99 euid=99 suid=99 fsuid=99 egid=99 sgid=99 fsgid=99 tty=(none) ses=1292436 comm="my_server" exe="python2.7" key="MYCONNECT"
type=SOCKADDR msg=audit(1494266546.327:44827): saddr=0200005064436F3C0000000000000000
type=SYSCALL msg=audit(1494266546.357:44828): arch=c000003e syscall=42 success=no exit=-115 a0=9 a1=7fffe73b7060 a2=10 a3=0 items=0 ppid=1750 pid=1751 auid=0 uid=99 gid=99 euid=99 suid=99 fsuid=99 egid=99 sgid=99 fsgid=99 tty=(none) ses=1292436 comm="my_server" exe="python2.7" key="MYCONNECT"
type=SOCKADDR msg=audit(1494266546.357:44828): saddr=0200005064436F3C0000000000000000
```

但是`my_server`就是一个python脚本，如何定位是谁调用?

修改审核方式，增加`-S execve`就可以看到详细的对应执行命令：

```
auditctl -a exit,always -F arch=b64 -S connect -S execve -k MYCONNECT
```

此时可以看到增加了进程调用的脚本：这里根据`my_server`关键字找到`pid=31938`，同时也看到`ppid=31937`。这个`ppid=31937`就是调用my_server的父进程id，可以看到是一个`comm="sh" exe="/bin/bash"`

```
type=SYSCALL msg=audit(1494313944.985:1408395): arch=c000003e syscall=59 success=yes exit=0 a0=7f7d2bd19673 a1=7ffff2aec690 a2=7ffff2aef4b8 a3=7f7d2c7f1220 items=2 ppid=31837 pid=31937 auid=0 uid=99 gid=99 euid=99 suid=99 fsuid=99 egid=99 sgid=99 fsgid=99 tty=(none) ses=1292436 comm="sh" exe="/bin/bash" key="MYCONNECT"
type=EXECVE msg=audit(1494313944.985:1408395): argc=3 a0="sh" a1="-c" a2=7B2061726D6F7279202D65692031302E3135332E3136342E313939202D2D6669656C6420736D5F6E616D65202D6C3B207D20323E2631
type=CWD msg=audit(1494313944.985:1408395):  cwd="/"
type=PATH msg=audit(1494313944.985:1408395): item=0 name="/bin/sh" inode=1908822 dev=08:02 mode=0100755 ouid=0 ogid=0 rdev=00:00
type=PATH msg=audit(1494313944.985:1408395): item=1 name=(null) inode=270363 dev=08:02 mode=0100755 ouid=0 ogid=0 rdev=00:00
type=SYSCALL msg=audit(1494313944.990:1408396): arch=c000003e syscall=59 success=yes exit=0 a0=6c8030 a1=6c7200 a2=6c68a0 a3=0 items=3 ppid=31937 pid=31938 auid=0 uid=99 gid=99 euid=99 suid=99 fsuid=99 egid=99 sgid=99 fsgid=99 tty=(none) ses=1292436 comm="my_server" exe="python2.7" key="MYCONNECT"
type=EXECVE msg=audit(1494313944.990:1408396): argc=7 a0="python" a1="/usr/local/bin/my_server" a2="-ei" a3="192.168.4.199" a4="--field" a5="sm_name" a6="-l"
type=EXECVE msg=audit(1494313944.990:1408396): argc=6 a0="python" a1="/usr/local/bin/my_server" a2="-ei" a3="192.168.4.199" a4="--field" a5="sm_name"
type=CWD msg=audit(1494313944.990:1408396):  cwd="/"
type=PATH msg=audit(1494313944.990:1408396): item=0 name="/usr/local/bin/my_server" inode=2973712 dev=08:02 mode=0100755 ouid=0 ogid=0 rdev=00:00
type=PATH msg=audit(1494313944.990:1408396): item=1 name=(null) inode=2973718 dev=08:02 mode=0100755 ouid=0 ogid=0 rdev=00:00
type=PATH msg=audit(1494313944.990:1408396): item=2 name=(null) inode=270363 dev=08:02 mode=0100755 ouid=0 ogid=0 rdev=00:00
```

从上述日志中拼接`a0`,`a1`,...`a6`等命令参数，可以获得完整的命令调用

```
/usr/local/bin/my_server -ei 192.168.4.199 --field sm_name -l
/usr/local/bin/my_server -ei 192.168.4.199 --field sm_name
```

在`my_client`的脚本目录下执行`grep sm_name *`检查所有涉及到查询`sm_name`的`my_server`指令的脚本，可以找到到调用脚本。对比脚本时间戳，可以看到和`my_client`调用暴增时间吻合。

# 参考 

* [Best way to follow a log and execute a command when some text appears in the log](https://unix.stackexchange.com/questions/12075/best-way-to-follow-a-log-and-execute-a-command-when-some-text-appears-in-the-log)

