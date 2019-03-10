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

# 采用netplan配置静态IP地址

Ubuntu 18系列的静态IP地址配置>方法和以前传统配置方法不同，采用了 `.yaml` 配置文件，通过 `netplan` 网络配置工具来修改。

> 根据Ubuntu的安装不同，有可能你的安装并没有包含Netplan，则依然可以采用传统的Debian/Ubuntu配置静态IP的方法，即直接修>改 `/etc/network/interfaces` 来实现。不过，从Ubuntu 17.10 开始，已经引入了 Netplan 网络配置工具。

Netplan允许通过YAML抽象来配置网络接口，在 `NetworkManager` 和 `systemd-networkd` 网络服务（引用为 `renderers` )结合共同工作。

Netplan会读取 `/etc/netplan/*.yaml` 配置文件来设置所有的网络接口。

## 列出所有激活的网络接口

* 使用 `ifconfig` 命令列出所有网络接口

```
ifconfig -a
```

例如，看到的输出数据（DHCP）

```
   ens2: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
           inet 192.168.122.61  netmask 255.255.255.0  broadcast 192.168.122.255
           inet6 fe80::5054:ff:fe97:c338  prefixlen 64  scopeid 0x20<link>
           ether 52:54:00:97:c3:38  txqueuelen 1000  (Ethernet)
           RX packets 382  bytes 45170 (45.1 KB)
           RX errors 0  dropped 84  overruns 0  frame 0
           TX packets 165  bytes 22890 (22.8 KB)
           TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

* 默认在 `/etc/netplan` 目录下有一个 `01-netcfg.yaml` 内容如下

```
   # This file describes the network interfaces available on your system
   # For more information, see netplan(5).
   network:
     version: 2
     renderer: networkd
     ethernets:
       ens2:
         dhcp4: yes
```

如果安装操作系统的时耦没有自动创建一个 `YAML` 配置文件，可以通过以下命令先生成一个

```
sudo netplan generate
```

不过，对于Ubuntu的desktop, server, cloud版本，自动生成的配置文件会采用不同的名字，例如 `01-network-manager-all.yaml` 或 `01-netcfg.yaml` 。

编辑 `/etc/netplan/01-netcfg.yaml`

```
   network:
     version: 2
     renderer: networkd
     ethernets:
       ens2:
         dhcp4: no
         dhcp6: no
         addresses: [192.168.122.11/24, ]
         gateway4: 192.168.122.1
         nameservers:
            addresses: [192.168.122.1, ]
```

* 执行以下命令生效（注意在控制台执行，否则网络会断开）

```
sudo netplan apply
```

* 验证检查 `ifconfig -a` 可以看到IP地址已经修改成静态配置IP地址

# 参考

* [Configure Networking on Ubuntu](https://www.swiftstack.com/docs/install/configure_networking.html)
* [How to Configure Network Static IP Address in Ubuntu 18.04](https://www.tecmint.com/configure-network-static-ip-address-in-ubuntu/)