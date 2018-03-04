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