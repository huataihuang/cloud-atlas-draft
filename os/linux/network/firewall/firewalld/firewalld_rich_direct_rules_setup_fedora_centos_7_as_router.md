在[树莓派快速起步](../../../../../develop/raspberry_pi/raspberry_pi_quick_start)的安装案例中，树莓派通过网线和笔记本网口直接连接，即将自己的笔记本视为一个路由器，提供NAT masquerade，提供给树莓派访问外网。

不过，随着Fedora / CentOS 7的发展，已经采用`firewalld`来替代早期的iptables工具管理防火墙。本文设置即为一个简单的路由、地址转换、端口转发案例。

* 笔记本（`ipa`）地址: 192.168.0.1 （连接树莓派的有线网卡）/ 192.168.1.5（无线网卡）
* 树莓派 (`pi`) 地址： 192.168.0.10

# 路由器服务器(ipa)网络接口

笔记本`ipa`主机有两个物理接口`enp0s20u1`(有线网卡连接树莓派)和`wlp3s0`(无线网卡连接AP局域网)

```
# nmcli d
```

```
DEVICE      TYPE      STATE      CONNECTION         
virbr0      bridge    connected  virbr0             
enp0s20u1   ethernet  connected  Wired connection 1 
tun0        tun       connected  tun0               
wlp3s0      wifi      connected  mylink             
lo          loopback  unmanaged  --                 
virbr0-nic  tun       unmanaged  --
```

在这里`wlp3s0`作为`public`网络，连接的网段是`192.168.1.0/24`；而`enp0s20u1`则连接作为`DMZ`网络，网段`192.168.0.0/24`。

* 检查网卡的IPv4地址

```
# ip -4 ad
```

```
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: wlp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.1.5/24 brd 192.168.1.255 scope global dynamic wlp3s0
       valid_lft 80648sec preferred_lft 80648sec
3: enp0s20u1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.0.1/24 brd 192.168.0.255 scope global enp0s20u1
       valid_lft forever preferred_lft forever
```

* 检查路由

```
# ip ro
```

```
192.168.0.0/24 dev enp0s20u1 proto kernel scope link src 192.168.0.1 metric 100 
192.168.1.0/24 dev wlp3s0 proto kernel scope link src 192.168.1.5 metric 600 
192.168.122.0/24 dev virbr0 proto kernel scope link src 192.168.122.1 linkdown 
```

> 最后一条是kvm的libvirt网络

* 关闭所有基于iptables的服务，即使已经启动

```
# systemctl mask iptables ip6tables ebtables
```

> 当前Fedora已经默认关闭了iptables相关服务

# Firewalld默认区域Zone

* 默认情况下连个网络接口都会被加入`public` zone:

```
# firewall-cmd --get-active-zones
```

输出

```
public
  interfaces: wlp3s0 enp0s20u1
```

* 这个`public`也是默认zone

```
# firewall-cmd --get-default-zone
```

输出

```
public
```

* 设置默认firewall zone是`public`，然后将网卡`enp0s20u1`从`public`区域删除，并加入到`dmz`区域：

```
firewall-cmd --set-default-zone=public
firewall-cmd --remove-interface=enp0s20u1 --zone=public
firewall-cmd --permanent --add-interface=enp0s20u1 --zone=dmz
```

以下是操作记录：

```
firewall-cmd --set-default-zone=public
```

```
firewall-cmd --remove-interface=enp0s20u1 --zone=public
```

在`firewall-cmd --remove-interface=enp0s20u1 --zone=public`有一个报错：

```
The interface is under control of NetworkManager and already bound to the default zone
```

这个问题之前使用`firewall-cmd --modify-interface=enp0s20u1 --zone=dmz`也遇到过，不过，很奇怪依然生效，只是更奇怪的是，两个网卡同时被移动到`dmz`区域。重启操作系统后，似乎正确了。参考 [NetworkManager and firewalld - Zone is lost on network restart](https://access.redhat.com/discussions/2779921)有一个建议是在接口配置文件中加上`NM_CONTROLLED=no`以关闭NM的管理。但是这个方法我测试不行，会导致`systemctl restart network`无法完成，并且在Xfce的桌面使用了`Network Manager Agent`。

不过，继续使用`--add-interface`则可以显示成功

```
firewall-cmd --permanent --add-interface=enp0s20u1 --zone=dmz
```

显示

```
The interface is under control of NetworkManager, setting zone to 'dmz'.
success
```

此时重新加载`firewalld`

```
# firewall-cmd --reload
```

并检查zone情况：

```
# firewall-cmd --get-active-zones
```

输出显示网络接口已经分布在两个zone

```
dmz
  interfaces: enp0s20u1
public
  interfaces: wlp3s0
```

确保在网络脚本中正确设置了zone

```
# nmcli con mod wlp3s0 connection.zone public
# nmcli con mod enp0s20u1 connection.zone dmz
# nmcli c reload
```

这里执行 

```
# nmcli con mod wlp3s0 connection.zone public
Error: unknown connection 'wlp3s0'.
```

这是因为在Network Manager中命名不同：用`nmcli d`可以显示，所以需要修改命令

```
# nmcli d
DEVICE      TYPE      STATE      CONNECTION         
virbr0      bridge    connected  virbr0             
enp0s20u1   ethernet  connected  Wired connection 1 
wlp3s0      wifi      connected  mylink             
lo          loopback  unmanaged  --                 
virbr0-nic  tun       unmanaged  --
```

执行修改过的命令：

```
# nmcli con mod mylink connection.zone public
# nmcli con mod "Wired connection 1" connection.zone dmz
# nmcli c reload
```

此时检查`/etc/sysconfig/network-scripts`目录下的`ifcfg-mylink`配置文件可以看到增加了一行：

```
ZONE=public
```

而`ifcfg-Wired_connection_1`增加了一行：

```
ZONE=dmz
```

# 定制Firewalld服务

以下是一个在dmz创建iSCSI target服务的方法，是从SSH模板复制firewalld service配置来实现的：

```
cp /usr/lib/firewalld/services/ssh.xml /etc/firewalld/services/iscsi-target.xml
```

编辑`/etc/firewalld/services/iscsi-target.xml`如下：

```
<?xml version="1.0" encoding="utf-8"?>
<service>
 <short>iSCSI Target</short>
 <description>iSCSI target.</description>
 <port protocol="tcp" port="3260"/>
</service>
```

这个新配置的firewalld服务通过如下命令添加到`dmz`区域：

```
# firewall-cmd --permanent --zone=dmz --add-service iscsi-target
```

而常规服务则可以直接添加，例如：

```
# firewall-cmd --permanent --zone=dmz --add-service={http,https,ldap,ldaps,kerberos,dns,kpasswd,ntp,ftp}
# firewall-cmd --reload
```

最后可以检查所有添加到dmz的服务

```
# firewall-cmd --list-services --zone=dmz
dns ftp http https iscsi-target kerberos kpasswd ldap ldaps ntp ssh
```

也可以检查`public`区域：

```
# firewall-cmd --list-services --zone=public
ssh mdns dhcpv6-client synergy
```

> 所谓的`zone`区域服务，实际上就是类似iptables的INPUT链接上开启了允许的端口。

# 端口转发

为了能够实现路由，`ipa`路由器需要从一个接口到另外一个接口启用数据包转发：

* 创建`/etc/sysctl.d/ip_forward.conf`添加如下配置行：

```
net.ipv4.ip_forward=1
```

以上配置可以在服务器重启时生效，但是为了能够直接生效，执行以下命令：

```
sysctl -w net.ipv4.ip_forward=1
```

# 设置Rich Rules

* 在`public`接口启用masquerade

```
# firewall-cmd --permanent --zone=public --add-masquerade
# firewall-cmd --reload
```

> 这个宽泛的masquerade没有成功

这样就允许所有接口从public外出，如果要更加精准的masquerade，则使用：

```
# firewall-cmd --permanent --zone=public --add-rich-rule='rule family=ipv4 source address=192.168.0.0/24 masquerade'
# firewall-cmd --reload
```

> 使用精确的网段masquerade则成功添加。

* 使用以下命令检查rich rule:

```
# firewall-cmd --zone=public --list-all
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: wlp3s0
  sources: 
  services: ssh mdns dhcpv6-client synergy
  ports: 8000/tcp 8080/tcp
  protocols: 
  masquerade: yes
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: 
	rule family="ipv4" source address="192.168.0.0/24" masquerade
```

# Routing with Direct Rules

待续

# 参考

* [Firewalld Rich and Direct Rules: Setting up RHEL 7 Server as a Router](https://www.lisenet.com/2016/firewalld-rich-and-direct-rules-setup-rhel-7-server-as-a-router/)