在Ubuntu上获取IP地址，例如静态IP地址：

```
ifconfig -a
```

或者使用`ip`命令

```
ip addr
```

基本的网络配置使用以下3个配置文件

* /etc/network/interfaces 网络接口描述文件
* /etc/hostname 主机名配置文件
* /etc/hosts 解析IP地址到主机名

# 修改网络配置

* 静态IP地址配置 `/etc/network/interfaces`

```
# interfaces(5) file used by ifup(8) and ifdown(8)
auto lo
iface lo inet loopback

auto enx7cc3a1872c5c
iface enx7cc3a1872c5c inet static
    address 192.168.0.3
    netmask 255.255.255.0
    network 192.168.0.0
    broadcast 192.168.0.255
    gateway 192.168.0.1
    dns-nameservers 192.168.0.1
    dns-domain huatai.me
    dns-search huatai.me
```

> 这里网络接口是USB网卡 `enx7cc3a1872c5c` 

配置生效

```
ifdown enx7cc3a1872c5c; ifup enx7cc3a1872c5c
```

* 修改主机名 `/etc/hostname`

```
myhost
```

为了确保服务器正确路由，需要设置服务器的完全域名（Fully Qualified Domain Name, FQDN），这个配置在 `/etc/hosts` 

```
192.168.0.3  myhost.x.net myhost
```

# 参考

* [Configure Networking on Ubuntu](https://www.swiftstack.com/docs/install/configure_networking.html)