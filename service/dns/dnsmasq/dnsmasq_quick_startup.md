> 以下实践在Fedora 27上完成，除安装包可能和debian系列不同，其他配置方法应该通用。

# 安装

```
sudo dnf install dnsmasq
```

# 配置

> 笔记本电脑上已经安装了`libvirt`服务，启用了kvm虚拟化，此时会有一个监听在虚拟网卡`virbr0`上的专用于虚拟网桥的DHCP和DNS服务的`dnsmasq`服务，类似如下进程：

```
/usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/default.conf --leasefile-ro --dhcp-script=/usr/libexec/libvirt_leaseshelper
```

> 注意`dnsmasq`默认激活DNS服务，如果不需要它，则需要明确设置DNS端口为`0`就可以避免启动DNS服务：

```
port=0
```

为避免影响kvm libvirt包含的dnsmasq服务，需要设置主机启动的`dnsmasq`监听在特定的网卡上，编辑`/etc/dnsmasq.conf`:

```
interface=enp0s20u1

bind-interfaces
```

> 注意：根据注释可以知道，dnsmasq虽然可以通过`interface`来处理特定网卡的请求（即`interface`参数），但是默认启动会绑定所有网卡的端口。所以仅仅使用`interface`参数是不够的，还需要同时启用`bind-interfaces`，这样才会在特定端口上启动绑定以及提供服务。

如果要监听多个接口，则类似设置

```
interface=eth1
interface=eth2
```

> dnsmasq默认关闭dhcp服务，要激活dhcp服务需要将dhcp相关行注释去除。 （[Disable dhcp service in dnsmasq](https://serverfault.com/questions/351962/disable-dhcp-service-in-dnsmasq)）

# 设置DNS解析

对于局域网内服务器DNS解析，DNSmasq提供了非常简单明了的配置方法：`/etc/hosts`和`/etc/resolv.conf`。

`/etc/hosts`是主机静态解析配置文件，DNSmasq通过读取这个配置文件，将解析配置加载后提供网络服务，这样就可以对整个局域网提供DNS解析，也就不再需要将相同的`/etc/hosts`配置文件复制到各个主机上（同步配置）：

```
127.0.0.1	localhost
192.168.0.100	devstack.huatai.me	devstack

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters

192.168.0.11  pi1.huatai.me pi1
192.168.0.12  pi1.huatai.me pi2
192.168.0.13  pi1.huatai.me pi3
```

`/etc/resolv.conf`是解析器配置文件，DNSmasq根据这个配置文件可以找到转发DNS，以便解析非本域的主机名，例如，www.baidu.com 或者 www.apple.com等等。

```
nameserver 127.0.0.1
search huatai.me
```

> 注意：在Debian中，不建议直接修改`/etc/resolv.conf`，而是修改`/etc/network/interfaces`配置文件，其中配置项会在系统启动时对应修改`/etc/resolv.conf`:

```
# The primary network interface
auto enp0s25
iface enp0s25 inet static
        address 192.168.0.1
        netmask 255.255.255.0
        network 192.168.0.0
        broadcast 192.168.0.255
        #gateway 192.168.0.1
        # dns-* options are implemented by the resolvconf package, if installed
        dns-nameservers 202.96.209.133
        dns-search huatai.me
```

这样启动后`/etc/resolv.conf`就会修改成：

```
nameserver 202.96.209.133
search huatai.me
```

# 启动

* 激活系统启动时启动

```
sudo systemctl enable dnsmasq
```

* 启动dnsmasq

```
sudo systemctl start dnsmasq
```

# 参考

* [archlinux: dnsmasq](https://wiki.archlinux.org/index.php/dnsmasq)
* [Dnsmasq setup](http://www.thekelleys.org.uk/dnsmasq/docs/setup.html)