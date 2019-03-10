> 如果网络排查故障的时候确定是由于IPv6引发，而Linux主机只使用IPv4协议时，可以尝试关闭IPv6协议来避免触发内核Bug。

由于一些硬件不能很好使用IPv6（大多数系统管理员依然在使用IPv4），一种临时并且简单的措施时禁用IPv6；并且这个IPv6协议可以在任何需要使用并且潜在问题解决的时候随时激活。

> [Bug 641836 - (ipv6) disabling ipv6 gives me selinux errors ](https://bugzilla.redhat.com/show_bug.cgi?id=641836)中不建议关闭IPv6模块，因为可能导致SELinux和其他模块问题。

# 禁用IPv6 built-in 内核模块

## RHEL 7 / CentOS 7 禁用IPv6内核模块

* 编辑 `/etc/default/grub` 在 `GRUB_CMDLINE_LINUX` 行添加 `ipv6.disable=1` ，类似：

```
GRUB_CMDLINE_LINUX="rd.lvm.lv=rhel/swap crashkernel=auto rd.lvm.lv=rhel/root ipv6.disable=1"
```

* 运行`grub2-mkconfig`命令重新生成`grub.cfg`文件：

```
grub2-mkconfig -o /boot/grub2/grub.cfg
``` 

如果是UEFI系统，则执行：

```
grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg
```

重启操作系统来禁用IPv6支持

> 注意以上方法关闭IPv6，会在 `audit.log` 日志文件中看到Selinux denied 消息，例如 `avc: denied (module_request)` 则在`/etc/sysctl.d/ipv6.conf`配置中禁用ipv6（即下文通过`sysctl.conf`设置）

**也可以选择** 通过`sysctl`设置来完成禁用IPv6。不过要注意，`sysctl`设置方式会影响SSH Xforwarding功能，除非`sshd_config`中设置了 `AddressFamily inet`。

**`注意`**

如果在内核启动参数中设置了 `ipv6.disable=1` 则操作系统重启后 `/proc/sys/net/ipv6` 目录将消失，并且不会加载任何 IPv6 内核模块（使用`lsmod | grep ipv6`不会输入任何信息）。如果此时设置 `/etc/sysctl.conf` 配置 `net.ipv6.conf.all.disable_ipv6=1` 并执行 `sysctl -p` 则提示 `sysctl: cannot stat /proc/sys/net/ipv6/conf/all/disable_ipv6: No such file or directory` 。

# 命令行关闭和开启IPv6

## 命令行刷新

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

## 持久化`sysctl`

* 持久化配置则修改`/etc/sysctl.conf`配置文件添加

```
net.ipv6.conf.all.disable_ipv6 = 1 
# net.ipv6.conf.default.disable_ipv6 = 1 
# net.ipv6.conf.lo.disable_ipv6 = 1
```

> 只需要 `net.ipv6.conf.all.disable_ipv6 = 1` 就可以完全关闭所有接口的IPv6支持
>
> `sysctl`方式也支持针对单独的网络接口设置关闭IPv6，例如 `net.ipv6.conf.eth0.disable_ipv6 = 1`

保存配置文件，然后执行 `sysctl -p` 从配置文件加载并刷新配置，也可以重启生效。

完成后检查

```
cat /proc/sys/net/ipv6/conf/all/disable_ipv6
```

可以看到输出内容是`1`表示已经禁用

* 也可以独立设置在 `/etc/sysctl.d/ipv6.conf`

```
net.ipv6.conf.all.disable_ipv6 = 1
```

* 然后重新加载

```
sysctl -p /etc/sysctl.d/ipv6.conf
```

* 然后重建 initial RAM磁盘映像：

```
dracut -f
```

# 在Ubuntu 18.10上实践

在Ubuntu 18上实践采用 sysctl 配置可行

* 编辑 `/etc/sysctl.d/10-ipv6-disalbe.conf` 内容如下

```
net.ipv6.conf.all.disable_ipv6 = 1
```

然后执行

```
sudo sysctl -p /etc/sysctl.d/10-ipv6-disalbe.conf
```

此时所有接口的IPv6地址都消失。

但是我发现重启系统后依然恢复了IPv6，所以改为使用

# 其他配置

* 如果禁用IPv6，则修改`/etc/hosts`注释掉

```
::1    localhost  localhost.localdomain localhost6 localhost6.localdomain6
```

# Red Hat Enterprise Linux 和 `error: "net.ipv6.conf.all.disable_ipv6" is an unknown key`

在Red Hat Enterprise Linux平台，如果配置了`/etc/sysctl.conf`配置

```
net.ipv6.conf.all.disable_ipv6 = 1 
net.ipv6.conf.default.disable_ipv6 = 1 
net.ipv6.conf.lo.disable_ipv6 = 1
```

执行`sysctl -p`时候会提示

```
error: "net.ipv6.conf.all.disable_ipv6" is an unknown key
error: "net.ipv6.conf.default.disable_ipv6" is an unknown key
error: "net.ipv6.conf.lo.disable_ipv6" is an unknown key
```

并且系统启动日志中显示有无法识别的内核参数`net.ipv6.conf.all.disable_ipv6`

```
2017-05-03 16:52:19	Applying ktune sysctl settings:
2017-05-03 16:52:19	/etc/sysctl.ktune: [FAILED]
2017-05-03 16:52:19	error: "vm.pagecache" is an unknown key
2017-05-03 16:52:19	 
2017-05-03 16:52:19	Applying sysctl settings from /etc/sysctl.conf: [FAILED]
2017-05-03 16:52:19	error: "net.netfilter.nf_conntrack_tcp_timeout_established" is an unknown key
2017-05-03 16:52:19	error: "net.ipv6.conf.all.disable_ipv6" is an unknown key
```

参考 [Whats the best way to block ipv6?](https://bbs.archlinux.org/viewtopic.php?id=106814) 和 [Disable IPv6 in Alpine Linux](http://www.linuxquestions.org/questions/linux-networking-3/disable-ipv6-in-alpine-linux-925858/) 提到了只有在`/etc/modules`文件中加载了`ipv6`才会有这个内核选项，所以如果没有配置`ipv6`内核模块，则出现上述`error: "net.ipv6.conf.all.disable_ipv6" is an unknown key`是正常的。

* 举例 CentOS 7 服务器

```
#lsmod | grep ipv6
ipv6                  318858  201 bonding
```

则`/etc/sysctl.conf`中配置

```
net.ipv6.conf.all.disable_ipv6 = 1
```

就 **`不会`** 导致启动时候提示`error: "net.ipv6.conf.all.disable_ipv6" is an unknown key`

# 关闭IPv6的影响

* 关闭IPv6对sshd的影响

如果在ssh中使用`X Forwarding`，则关闭`IPv6`会影响这个功能。要修复，则需要修改`/etc/ssh/sshd_config`配置，将

```
#AddressFamily any
```

修改成

```
AddressFamily inet
```

或者移除`#ListenAddress 0.0.0.0`行前面的`#`使之生效。

保存配置，然后重启sshd生效

* 关闭IPv6对Postfix程序影响

关闭IPv6会导致Postfix无法启动，此时修复方法是使用 IPv4 loopbak回环地址。编辑`/etc/postfix/main.cf`配置文件，注释掉`localhost`行，然后添加IPv4 loopbak类似如下：

```
#inet_interfaces = localhost
inet_interfaces = 127.0.0.1
```

* 此外要关闭RPCBIND ipv6（rpcbind, rpc.mountd, prc.statd），需要注释掉`/etc/netconfig`中：

```
udp        tpi_clts      v     inet     udp     -       -
tcp        tpi_cots_ord  v     inet     tcp     -       -
#udp6       tpi_clts      v     inet6    udp     -       -
#tcp6       tpi_cots_ord  v     inet6    tcp     -       -
rawip      tpi_raw       -     inet      -      -       -
local      tpi_cots_ord  -     loopback  -      -       -
unix       tpi_cots_ord  -     loopback  -      -       -
```

> **关闭IPv6并不是一个很好的解决方案，但是有时候为了故障排查不得不这样操作。**

# 参考

* [How to disable IPv6 on linux](http://www.techrepublic.com/article/how-to-disable-ipv6-on-linux/)
* [How do I disable IPv6?](https://wiki.centos.org/FAQ/CentOS6#head-d47139912868bcb9d754441ecb6a8a10d41781df)
* [How do I disable or enable the IPv6 protocol in Red Hat Enterprise Linux?](https://access.redhat.com/solutions/8709)
