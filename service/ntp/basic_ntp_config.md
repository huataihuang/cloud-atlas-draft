# 基础的NTP配置

NTP程序是通过`/etc/ntp.conf`或`/etc/xntp.conf`配置文件配置。

选择集群系统的2台服务器作为NTP服务器，在这两台服务器上设置和Internet上的NTP时间服务器进行同步，并同时对内网系统提供NTP服务。

集群系统中所有其他服务器配置以前两台NTP服务器为基准，进行时间同步。（内网服务器通常不能直接访问Internet）

* 以下是局域网中作为NTP服务器部署的服务器上 `/etc/ntp.conf`

```
# Drift file.
driftfile /var/lib/ntp/drift
pidfile /var/run/ntp.pid
logfile /var/log/ntp.log

# Permit all access over the loopback interface.
restrict 127.0.0.1
restrict ::1

# 允许本地局域网较少限制，这样局域网服务器可以从这个NTP服务器同步时间
restrict 192.168.1.0 mask 255.255.255.0 notrust nomodify notrap
restrict 10.1.1.0 mask 255.255.255.0 notrust nomodify notrap

# 使用公共的pool.ntp.org提供的时间服务器来作为上游NTP服务器
# 这样部署的NTP服务器可以校准自己的时钟
server 0.centos.pool.ntp.org iburst
server 1.centos.pool.ntp.org iburst

# 其他有关 server 配置案例
# server 0.centos.pool.ntp.org iburst minpoll 4 maxpoll 6 prefer
# server 1.centos.pool.ntp.org iburst minpoll 4 maxpoll

server 127.127.1.0
fudge 127.127.1.0 stratum 10
``` 

## NTP配置解析

* `server`

# `restrict default ignore`的问题

* 如果设置成

1

# NTP实践问题排查

## `restrict`回环地址和IPv6

`ntp.conf`配置中必须有一个回环地址的

如果主机使用了IPv6地址，例如

```
restrict default kod nomodify notrap nopeer noquery
restrict -6 default ignore
restrict 127.0.0.1 mask 255.0.0.0
```

则会查询`IPv6`出现超时：

```
::1: timed out, nothing received
***Request timed out
```

# 参考

* [Basic NTP configuration](http://www.tldp.org/LDP/sag/html/basic-ntp-config.html)