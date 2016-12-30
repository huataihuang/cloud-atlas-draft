默认安装的CentOS/RHEL 7启用了IPv6，对于一些只使用IPv4环境，可以通过以下两种方式关闭IPv6:

* 在内核模块禁用IPv6（需要重启）
* 使用`sysctl`设置禁用IPv6（不需要重启）

检查系统是否启用了IPv6：

```
ifconfig -a | grep inet6
```

如果启用了IPv6会看到如下信息

```
        inet6 fe80::5054:ff:fe6d:119b  prefixlen 64  scopeid 0x20<link>
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
```

# 通过内核模块关闭IPv6（需要重启）

* 编辑 `/etc/default/grub`，在`GRUB_CMDLINE_LINUX`行添加 `ipv6.disable=1`

```
GRUB_TIMEOUT=5
GRUB_DEFAULT=saved
GRUB_DISABLE_SUBMENU=true
GRUB_TERMINAL_OUTPUT="console"
GRUB_CMDLINE_LINUX="ipv6.disable=1 crashkernel=auto rhgb quiet"
GRUB_DISABLE_RECOVERY="true"
```

* 重新生成GRUB配置

``` 
grub2-mkconfig -o /boot/grub2/grub.cfg
```

* 然后重启

```
shutdown -r now
```

# 使用sysctl设置关闭IPv6（无需重启）

* 编辑 `/etc/sysctl.conf` 添加：

```
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
```

* 然后激活

```
sysctl -p
```

# 参考

* [CentOS / RHEL 7 : How to disable IPv6](http://thegeekdiary.com/centos-rhel-7-how-to-disable-ipv6/)