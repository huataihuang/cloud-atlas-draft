> 如果网络排查故障的时候确定是由于IPv6引发，而Linux主机只使用IPv4协议时，可以尝试关闭IPv6协议来避免触发内核Bug。

由于一些硬件不能很好使用IPv6（大多数系统管理员依然在使用IPv4），一种临时并且简单的措施时禁用IPv6；并且这个IPv6协议可以在任何需要使用并且潜在问题解决的时候随时激活。

# 命令行关闭和开启IPv6

* 关闭IPv6

```
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1
```

* 重新激活IPv6

```
sysctl -w net.ipv6.conf.all.disable_ipv6=0
sysctl -w net.ipv6.conf.default.disable_ipv6=0
```

* 持久化配置则修改`/etc/sysctl.conf`配置文件添加

```
net.ipv6.conf.all.disable_ipv6 = 1 
net.ipv6.conf.default.disable_ipv6 = 1 
net.ipv6.conf.lo.disable_ipv6 = 1
```

保存配置文件，然后执行 `sysctl -p` 从配置文件加载并刷新配置，也可以重启生效。

# 关闭IPv6的影响

* 关闭IPv6对sshd的影响

如果在ssh中使用`X Forwarding`，则关闭`IPv6`回影响这个功能。要修复，则需要修改`/etc/ssh/sshd_config`配置，将

```
#AddressFamily any
```

修改成

```
AddressFamily inet
```

保存配置，然后重启sshd生效

* 关闭IPv6对Postfix程序影响

关闭IPv6会导致Postfix无法启动，此时修复方法是使用 IPv4 loopbak回环地址。编辑`/etc/postfix/main.cf`配置文件，注释掉`localhost`行，然后添加IPv4 loopbak类似如下：

```
#inet_interfaces = localhost
inet_interfaces = 127.0.0.1
```

> **关闭IPv6并不是一个很好的解决方案，但是有时候为了故障排查不得不这样操作。**

# 参考

* [How to disable IPv6 on linux](http://www.techrepublic.com/article/how-to-disable-ipv6-on-linux/)