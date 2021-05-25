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

* `server` 配置

在 `ntp.conf` 配置中，最基本有2行 `server` 的配置，其中一个 `server` 是本地的 `pseudo IP` 地址，也就是回环地址 `127.127.1.0` ，这个伪IP是为了确保ntpd服务在远程NTP服务器宕机情况下，NTP能够和自己进行同步，直到远程服务器恢复服务就可以开始再次和远程服务器进行同步。

建议至少确保配置两台远程服务器进行同步，以便能够在其中某台服务器宕机情况下依然能够继续和backup服务器同步。不过，实际生产环境，强烈建议至少配置4台NTP服务器，原因见 [Upstream Time Server Quantity](http://support.ntp.org/bin/view/Support/SelectingOffsiteNTPServers#Section_5.3.3.):

  * 采用4台NTP服务器的好处是：当一台NTP服务器宕机情况下，剩余3台服务器依然能够提供冗余，并且如果3台服务器之间时钟不一致，依然能够按照`少数服从多数`方式计算判断出哪些NTP服务器时间是较为准确的，以便能够进行同步。
  * 如果采用3台NTP服务器，则宕机1台就会只有2台NTP服务器，而2台NTP服务器是无法判断选择哪个NTP服务器时间更为准确
  * 如果只使用2台NTP服务器，即使没有服务器宕机，也可能无法判断哪个NTP服务器时间更准确
  * 如果使用1台NTP服务器，没有冗余是不能接受的

* `restrict` 配置

`restrict` 配置限制了访问你配置的NTP服务器的客户端，提供了一定的安全保护

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
* [Best practices for NTP](https://access.redhat.com/solutions/778603)