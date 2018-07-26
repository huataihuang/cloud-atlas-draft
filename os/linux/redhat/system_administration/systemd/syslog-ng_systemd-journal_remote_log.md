> 注意：对于使用systemd-journal日志系统的服务器，需要首先激活[systemd-journal日志转发syslog](systemd-journald_forwardtosyslog)设置，将journal日志转发给第三方的syslog服务，如rsyslog或syslog-ng才能实现本文中类似通过`syslog-ng`集中采集日志的功能。
>
> 本文采用 `syslog-ng` **+** `systemd-journald` 实现日志集中存储。
>
> 本文配置在KVM虚拟机环境，由于libvirtd采用的是NAT网络，所以KVM物理主机的默认IP地址`192.168.122.1`面向内部虚拟机网络，提供集中的日志采集服务。

# 配置`syslog-ng`服务器

在很多早期发行版本都采用了`syslog-ng`，例如SUSE，debian系列。

* 编辑 `/etc/syslog-ng/syslog-ng.conf` 添加

```
source s_net { udp(); };
destination d_remote { file("/var/log/remote/${FULLHOST}"); };
log { source(s_net); destination(d_remote); };
```

或者将上述配置独立成一个配置文件存放到 `/etc/syslog-ng/conf.d/` ，例如命名成 `/etc/syslog-ng/conf.d/center_syslog.conf`

* 过滤规则

`syslog-ng`支持复杂的过滤规则，例如可以通过主机IP地址过滤

```
source s_net { udp(); };
filter f_vm1 { host("192.168.122.2"); };
destination d_remote_vm1 { file("/var/log/remote/vm1"); };
log { source(s_net); filter(f_vm1); destination(d_remote_vm1); };
```

* 重启syslog-ng服务

```
service syslog-ng restart
```

* iptables配置：

> 注意：syslog服务器需要允许通过防火墙访问，通常需要配置`/etc/sysconfig/iptalbes`添加：

```
-A INPUT -p tcp -s <IP Address> --dport 514 -j ACCEPT
-A INPUT -p udp -s <IP Address> --dport 514 -j ACCEPT
```

然后重启iptables

# 配置`syslog-ng`客户端

上述IP地址 `192.168.122.1` 是提供日志服务的服务器IP地址，也就集中管理日志服务器的监听IP地址。请替换成你实际网络服务器的IP地址。

编辑 `/etc/syslog-ng/syslog-ng.conf`

```
destination remote { network("192.168.122.1" transport("udp") port(514)); };
```

也可以独立配置一个 `/etc/syslog-ng/conf.d/client_syslog.conf`添加上述内容。

> 非常悲剧，上述测试还没有成功。时间有限，暂时改成NFS共享方式。即请参考

> [Remote Logging with SSH and Syslog-NG](http://www.deer-run.com/~hal/sysadmin/SSH-SyslogNG.html) 介绍了通过ssh加密通道实现syslog-ng的远程日志采集，是跨因特网的一个加密解决方案，我准备做一次实践。或许可以结合systemd+ssh+rsyslog来实现。

# 参考

* [Syslog configuration for remote logservers for syslog-ng and rsyslog, both client and server](https://raymii.org/s/tutorials/Syslog_config_for_remote_logservers_for_syslog-ng_and_rsyslog_client_server.html)
* [Remote logging to syslog-ng](https://stijn.tintel.eu/blog/2009/12/15/remote-logging-to-syslog-ng)