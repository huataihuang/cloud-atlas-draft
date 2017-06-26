遇到一个测试服务器上，升级操作系统（从alios7转换到centos7）后，发现`libvirtd`启动后并没有正确启动`virbr0`，并且长时间出现`ip6talbes -n -L FORWARD`指令`D`住问题

```
$ps r -A
  PID TTY      STAT   TIME COMMAND
 2131 ?        D      0:00 /usr/sbin/iptables -w --table filter --insert FORWARD --destination 192.168.122.0/24 --out-interface virbr0
49444 pts/0    R+     0:00 ps r -A
```

将alios 7的iptables软件包强制切换成CentOS7的iptables。但是重启后依然出现`iptables`指令`D`住问题。

* 检查`D`住的进程

```
2131 ?        D      0:03 /usr/sbin/iptables -w --table filter --insert FORWARD --destination 192.168.122.0/24 --out-interface virbr0
```

这个`iptables`指令显示是需要在`virbr0`上插入转发规则。

```
#ifconfig
...
virbr0-nic: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 52:54:00:1f:48:0c  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

```
#brctl show
bridge name	bridge id		STP enabled	interfaces
virbr0		8000.5254001f480c	yes		virbr0-nic
```

* 检查启动dmesg显示

```
[   21.328152] ip6_tables: (C) 2000-2006 Netfilter Core Team
[   21.342781] Ebtables v2.0 registered
[   21.463834] bridge: automatic filtering via arp/ip/ip6tables has been deprecated. Update your scripts to load br_netfilter if you need this.
```

不过，这个报错信息在另外一台测试服务器上也有，但是另外一台测试服务器没有这个无法启动

* 检查`D`住进程的堆栈

```
#cat /proc/2131/stack
[<ffffffff810a44e8>] call_usermodehelper_exec+0x108/0x1a0
[<ffffffff810a497b>] __request_module+0x18b/0x2b0
[<ffffffffa047ea55>] nf_ct_l3proto_try_module_get+0x25/0x50 [nf_conntrack]
[<ffffffffa046b678>] conntrack_mt_check+0x18/0x3c [xt_conntrack]
[<ffffffff815aab85>] xt_check_match+0xa5/0x1f0
[<ffffffffa00f2077>] translate_table+0x587/0x950 [ip_tables]
[<ffffffffa00f310b>] do_ipt_set_ctl+0x10b/0x1c9 [ip_tables]
[<ffffffff815a8ac5>] nf_setsockopt+0x65/0x90
[<ffffffff815ba4bf>] ip_setsockopt+0x7f/0xa0
[<ffffffff815ddab6>] raw_setsockopt+0x16/0x60
[<ffffffff81557bd4>] sock_common_setsockopt+0x14/0x20
[<ffffffff81556d60>] SyS_setsockopt+0x80/0xf0
[<ffffffff81697749>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

* 检查libvirtd日志

```
#systemctl status libvirtd
● libvirtd.service - Virtualization daemon
   Loaded: loaded (/usr/lib/systemd/system/libvirtd.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2017-06-21 21:01:29 CST; 19min ago
     Docs: man:libvirtd(8)
           http://libvirt.org
 Main PID: 1568 (libvirtd)
   Memory: 25.3M
   CGroup: /system.slice/libvirtd.service
           ├─1568 /usr/sbin/libvirtd
           └─2139 /usr/sbin/iptables -w --table filter --insert FORWARD --destination 192.168.122.0/24 --out-interface virbr0 --matc...

Jun 21 21:01:29 server.example.com systemd[1]: Starting Virtualization daemon...
Jun 21 21:01:29 server.example.com systemd[1]: Started Virtualization daemon.
```

可以看到`systemd`其启动中，有一个执行`iptables`不步骤。

但是对比了正常的服务器，发现在虚拟交换机`virbr0`对应的接口命名上有所不同。

虽然正常和异常的服务器，`brctl show`显示相同

```
#brctl show
bridge name	bridge id		STP enabled	interfaces
virbr0		8000.5254001f480c	yes		virbr0-nic
```

但是比较奇怪的是，在`正常`服务器上，`ifconfig -a`输出显示的接口：

```
virbr0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.122.1  netmask 255.255.255.0  broadcast 192.168.122.255
        ether 52:54:00:fa:6c:fe  txqueuelen 1000  (Ethernet)
        RX packets 3270  bytes 636884 (621.9 KiB)
        RX errors 0  dropped 279  overruns 0  frame 0
        TX packets 2173  bytes 3985870 (3.8 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

而`异常`服务器则是`virbr0-inc`

```
virbr0-nic: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 52:54:00:1f:48:0c  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

怀疑正常服务器虚拟接口`virbr0-nic`有别名`virbr0`

* 进制`libvirtd`在操作系统启动时启动，然后重启操作系统，手工执行`systemctl start libvirtd`，可以看到操作系统日志显示

```
Jun 21 21:52:33 server.example.com dbus[1232]: [system] Activating via systemd: service name='org.freedesktop.PolicyKit1' unit='polkit.service'
Jun 21 21:52:33 server.example.com dbus-daemon[1232]: dbus[1232]: [system] Activating via systemd: service name='org.freedesktop.PolicyKit1' unit='polkit.service'
Jun 21 21:52:33 server.example.com systemd[1]: Starting Authorization Manager...
Jun 21 21:52:33 server.example.com polkitd[11378]: Started polkitd version 0.112
Jun 21 21:52:33 server.example.com polkitd[11378]: Loading rules from directory /etc/polkit-1/rules.d
Jun 21 21:52:33 server.example.com polkitd[11378]: Loading rules from directory /usr/share/polkit-1/rules.d
Jun 21 21:52:33 server.example.com polkitd[11378]: Finished loading, compiling and executing 3 rules
Jun 21 21:52:33 server.example.com dbus[1232]: [system] Successfully activated service 'org.freedesktop.PolicyKit1'
Jun 21 21:52:33 server.example.com dbus-daemon[1232]: dbus[1232]: [system] Successfully activated service 'org.freedesktop.PolicyKit1'
Jun 21 21:52:33 server.example.com systemd[1]: Started Authorization Manager.
Jun 21 21:52:33 server.example.com polkitd[11378]: Acquired the name org.freedesktop.PolicyKit1 on the system bus
Jun 21 21:52:33 server.example.com polkitd[11378]: Registered Authentication Agent for unix-process:11373:12356 (system bus name :1.105 [/usr/bin/pkttyagent --notify-fd 5 --fallback], object path /org/freedesktop/PolicyKit1/AuthenticationAgent, locale en_US.UTF-8)
Jun 21 21:52:33 server.example.com systemd[1]: Listening on Virtual machine log manager socket.
Jun 21 21:52:33 server.example.com systemd[1]: Starting Virtual machine log manager socket.
Jun 21 21:52:33 server.example.com systemd[1]: Starting Virtualization daemon...
Jun 21 21:52:33 server.example.com systemd[1]: Started Virtualization daemon.
Jun 21 21:52:33 server.example.com polkitd[11378]: Unregistered Authentication Agent for unix-process:11373:12356 (system bus name :1.105, object path /org/freedesktop/PolicyKit1/AuthenticationAgent, locale en_US.UTF-8) (disconnected from bus)
Jun 21 21:52:33 server.example.com admin[11411]: alicmd:root:systemctl start libvirtd:admin pts/0 2017-06-21 21:50 (10.101.76.56)
Jun 21 21:52:33 server.example.com kernel: ip6_tables: (C) 2000-2006 Netfilter Core Team
Jun 21 21:52:33 server.example.com kernel: Ebtables v2.0 registered
Jun 21 21:52:33 server.example.com kernel: bridge: automatic filtering via arp/ip/ip6tables has been deprecated. Update your scripts to load br_netfilter if you need this.
Jun 21 21:52:33 server.example.com kernel: tun: Universal TUN/TAP device driver, 1.6
Jun 21 21:52:33 server.example.com kernel: tun: (C) 1999-2004 Max Krasnyansky <maxk@qualcomm.com>
Jun 21 21:52:33 server.example.com kernel: device virbr0-nic entered promiscuous mode
Jun 21 21:52:33 server.example.com kernel: nf_conntrack version 0.5.0 (65536 buckets, 262144 max)
```

参考 [bridge: automatic filtering via arp/ip/ip6tables has been deprecated](https://forums.opensuse.org/showthread.php/520215-bridge-automatic-filtering-via-arp-ip-ip6tables-has-been-deprecated)

尝试检查内核设置中和bridge相关参数

```
sysctl -a | grep bridge
```

发现异常服务器没有任何输出。

而正常服务器则输出

```
net.bridge.bridge-nf-call-arptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-filter-pppoe-tagged = 0
net.bridge.bridge-nf-filter-vlan-tagged = 0
net.bridge.bridge-nf-pass-vlan-input-dev = 0
```

是不是内核参数设置导致的问题？

检查对比发现，异常服务器在 `/etc/sysctl.d` 目录下增加了2个配置文件，主要是服务器针对虚拟化优化，但是移除了配置文件还是没有解决。

参考 [CentOS 6 ELRepo kernel bridge issues](https://serverfault.com/questions/697942/centos-6-elrepo-kernel-bridge-issues) ，运来最新内核使用`br_netfilter`模块来提供`/proc/sys/net/bridge`，如果看到

```
bridge: automatic filtering via arp/ip/ip6tables has been deprecated. 
Update your scripts to load br_netfilter if you need this.
```

则需要先加载`br_netfilter`模块

```
# ls /proc/sys/net/bridge
ls: cannot access /proc/sys/net/bridge: No such file or directory
# modprobe br_netfilter
# ls /proc/sys/net/bridge
bridge-nf-call-arptables  bridge-nf-filter-pppoe-tagged
bridge-nf-call-ip6tables  bridge-nf-filter-vlan-tagged
bridge-nf-call-iptables   bridge-nf-pass-vlan-input-dev
```

不过，我还是没有解决这个`iptables`指令`D`住问题。不过，加载了`br_netfilter`模块之后，日志确实不再报`load br_netfilter`错误提示。

Openstack提供了一个[Disable libvirt networking](https://docs.openstack.org/mitaka/networking-guide/misc-libvirt.html)，但是存在的问题是，依然需要通过`virsh`命令来执行，所以没有完成。

# iptables排查

由于iptables进程D住，尝试

```
#iptables -L -w
Another app is currently holding the xtables lock; waiting (1s) for it to exit..
```

这里出现了一个`xtables lock`，看来是这个问题导致.

参考 [Firewall and network filtering in libvirt](https://libvirt.org/firewall.html) ，原来所有防火墙设置都位于 `/etc/libvirt/nwfilter` 。不过，文档中不建议直接编辑，而是通过`virsh nwfilter-define`来更新。

重启操作系统，发现在没有启动libvirtd之前，单纯操作`iptables`也是存在问题的，使用和NAT有关的的指令会D住：

```
#iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination


#iptables -t nat -L
```

即`iptables -t nat -L`无任何输出，hang住。

使用`ps r -A`指令检查，可以看到加载`iptable_nat`模块存在问题

```
$ps r -A
  PID TTY      STAT   TIME COMMAND
 5210 pts/0    D+     0:00 iptables -t nat -L
 5212 ?        D      0:01 /sbin/modprobe -q -- iptable_nat
50877 pts/1    R+     0:00 ps r -A
 ```

 检查`modprobe`进程堆栈

 ```
 #cat /proc/5212/stack
[<ffffffff810a44e8>] call_usermodehelper_exec+0x108/0x1a0
[<ffffffff810a497b>] __request_module+0x18b/0x2b0
[<ffffffffa044ea55>] nf_ct_l3proto_try_module_get+0x25/0x50 [nf_conntrack]
[<ffffffffa0465995>] nf_nat_l3proto_register+0x15/0x70 [nf_nat]
[<ffffffffa0411026>] nf_nat_l3proto_ipv4_init+0x26/0x1000 [nf_nat_ipv4]
[<ffffffff810020e8>] do_one_initcall+0xb8/0x230
[<ffffffff81100918>] load_module+0x22c8/0x2930
[<ffffffff81101136>] SyS_finit_module+0xa6/0xd0
[<ffffffff81697749>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

操作系统内核日志显示

```
Jun 22 15:51:02 server.example.com kernel: nf_conntrack version 0.5.0 (65536 buckets, 262144 max)
```

由于系统日志里提到了`nf_conntrack`，所以怀疑这个`netfilter`模块存在问题。

参考 [how do I disable the nf_conntrack kernel module in CentOS 5.3 without recompiling the kernel](https://serverfault.com/questions/72366/how-do-i-disable-the-nf-conntrack-kernel-module-in-centos-5-3-without-recompilin) (原文是为了提高网络性能，所以要关闭`nf_conntrack`)，发现系统确实加载了`nf_XXXX`模块

```
#lsmod | grep nf_
nf_nat_ipv4            14115  1
nf_nat                 26147  1 nf_nat_ipv4
nf_conntrack          111302  2 nf_nat,nf_nat_ipv4
```

回答中提到了`What about adding the module to /etc/modprobe.d/blacklist.conf?`，我也检查了一下 `/etc/modprobe.d/blacklist.conf?`，发现其中有禁用`nf_conntrack_ipv4`:

```
blacklist edac_core
blacklist sb_edac
blacklist liquidio_vf
blacklist nf_conntrack_ipv4
blacklist edac_core
blacklist sb_edac
blacklist nouveau
```

> `liquidio_vf`是`Cavium LiquidIO VF support`

尝试编辑 `/etc/modprobe.d/blacklist.conf` ，删除掉 `blacklist nf_conntrack_ipv4` 然后保存文件。

立即发现原先`D`住的`/sbin/modprobe -q -- iptable_nat`进程立即消失了。而且再使用`iptables -t nat -L`指令也没有任何问题。

再次检查`lsmod | grep nf_`，发现原来修改`/etc/modprobe.d/blacklist.conf`不需要重启任何服务，是立即生效（`modprobe`会读取这个配置）：

```
#lsmod | grep nf_
nf_conntrack_ipv4      19108  1
nf_defrag_ipv4         12729  1 nf_conntrack_ipv4
nf_nat_ipv4            14115  1 iptable_nat
nf_nat                 26147  1 nf_nat_ipv4
nf_conntrack          111302  3 nf_nat,nf_nat_ipv4,nf_conntrack_ipv4
```

可以看到 `nf_conntrack_ipv4` 解除黑名单之后，就能够被`nf_conntrack`所引用加载

* 问题解决

上述`iptables -t nat`问题解决之后，再执行`systemctl start libvirtd`就可以正常运行没有任何问题，不再出现`/usr/sbin/iptables -w --table filter --insert FORWARD --destination 192.168.122.0/24 --out-interface virbr0`指令`D`住问题。

# 经验总结

* iptables命令执行`D`住时，要检查该指令加载的内核模块是否能够加载，如果模块无法加载，会导致`iptables`命令无法执行。
* 内核模块之间有依赖关系，有可能`iptables`加载的内核模块所依赖的模块无法加载，就会层层影响，导致程序`D`住。
* 一定要检查`/etc/modprobe.d/blacklist.conf`配置，该配置文件影响内核模块加载，会导致依赖程序无法运行。