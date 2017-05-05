# 问题

线上有部分服务器上执行 `ntpq -np` 提示错误：

```
localhost: timed out, nothing received
***Request timed out
```

> 注意：如果提示`ntpq: read: Connection refused`则表明服务器没有启动`ntpd`服务

仔细对比了正常服务器和异常服务器，差异如下：

| 软件版本 | 正常服务器 | 异常服务器 |
| ---- | ---- | ---- |
| 操作系统 | RHEL 5.7 | RHEL 6.2 |
| ntp版本 | ntp-4.2.2p1-18.1 | ntp-4.2.4p8-2.1 |

## `ntpd.conf`配置

* `/etc/ntpd.conf`配置文件

```
# For more information about this file, see the man pages
# ntp.conf(5), ntp_acc(5), ntp_auth(5), ntp_clock(5), ntp_misc(5), ntp_mon(5).
 
driftfile /var/lib/ntp/drift
pidfile /var/run/ntp.pid
logfile /var/log/ntp.log
# Access Control Support
tinker panic 0
restrict default ignore
restrict -6 default ignore
restrict 59.37.9.151
restrict 59.37.9.152
restrict 127.0.0.1
 
server 59.37.9.151 iburst minpoll 4 maxpoll 6 prefer
server 59.37.9.152 iburst minpoll 4 maxpoll
 
server 127.127.1.0
fudge 127.127.1.2 stratum 10
```

## `ntpd.conf`简单解析

* `driftfile /var/lib/ntp/drift`

设置`drift`（偏移）文件位置，这个偏移文件只包含一个在每次系统或服务启动时用于调整系统时钟频率的值。这个`drift`文件是用来存储系统运行在自己名义频率（nominal frequency）和使用UTC同步保留的所需频率之间的频率偏差。如果这个文件存在，这个`drift`文件包含的值就会在系统启动时读取并用于矫正时钟源。使用`drift`文件可已降低达到稳定和精确时钟所需的时间。这个值是计算出来的，并且这个文件每个小时都会被`ntpd`所替换。由于这个`drift`文件是由`ntpd`进行更新，所以必须对`ntpd`这个目录可以读写。

* 访问控制

```
restrict default ignore
restrict -6 default ignore
restrict 59.37.9.151
restrict 59.37.9.152
restrict 127.0.0.1
```

`restrict default`表示没有明确允许则禁止访问任何内容

## `ntpd.conf`配置中`restrict default ignore`在不同版本差异

* 验证方法：

```
# ntpq
ntpq> peer
localhost: timed out, nothing received
***Request timed out
```

也输出错误显示`localhost: timed out, nothing received`

* 解析：

参考 ['ntpq> peers' gives error "Request timed out" after upgrading to ntp-4.2.6p5 package](https://access.redhat.com/solutions/625863) ：早期`ntp`软件包（例如`RHEL 5`）中 `restrict default ignore` 只限制 `IPv4`。这也是为何早期版本配置中会有两行`restrict default`和`restrict -6 default`分别用来配置IPv4和IPv6.

> 不过在CentOS 5上测试，即使操作系统没有启用IPv6，但是`restrict -6 default`依然不会产生影响。

在早期版本中 `restrict default` 只限制 IPv4，而 `restrict -6 default` 则没有生效，所以配置了这两行都没有导致`ntpd`运行异常。

----

但是升级到`RHEL 6.5`之后（ntp版本升级到 `4.2.4`），这个`restrict default`配置行将同时限制IPv4和IPv6。

对于很多部署安装，系统管理员会不经意地关闭IPv6支持，此时就会导致 `restrict default` 和 `restrict -6 default` 这样隐式和显式针对IPv6的配置出现异常查询。

解决的方法是修正`ntp.conf`配置，去除不需要且影响运行的IPv6相关配置，并显式指定只使用IPv4，即将原配置

```
restrict default ignore
restrict -6 default ignore
```

修改成

```
restrict -4 default ignore
```

然后重启`ntpd`服务

```
service ntpd restart
```

再进行NTP查询就能够正常工作

```
# ntpq -np
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 59.37.9.151     .INIT.          16 u    -   64    0    0.000    0.000   0.000
*127.127.1.0     .LOCL.           5 l    8   64  177    0.000    0.000   0.000
```

# 参考

* ['ntpq> peers' gives error "Request timed out" after upgrading to ntp-4.2.6p5 package](https://access.redhat.com/solutions/625863)
* [timed out, nothing received](https://unix.stackexchange.com/questions/118865/timed-out-nothing-received)
* [Understanding the ntpd Configuration File](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Deployment_Guide/s1-Understanding_the_ntpd_Configuration_File.html)