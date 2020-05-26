# 静态IP配置

在Arch Linux上配置静态IP有两种方式

## netctl配置静态IP

netctl是命令行工具，可以控制systemd的network profile manager。

* 在arch linux的 `/etc/netctl/examples/` 目录下存储了配置案例，可以复制出来作为修改的起始基础

```
sudo cp /etc/netctl/examples/ethernet-static /etc/netctl/enp0s3
```

* 修改配置 `/etc/netctl/enp0s3`

```
Description='A basic static ethernet connection'
Interface=enp0s3
Connection=ethernet
IP=static
Address=('192.168.1.102/24')
Gateway=('192.168.1.1')
DNS=('8.8.8.8' '8.8.4.4')
```

* 激活网卡以便每次启动系统时激活

```
sudo netctl enable enp0s3
```

* 启动网卡接口

```
sudo netctl start enp0s3
```

* 停止dhcp服务

```
sudo systemctl stop dhcpcd
sudo systemctl disable dhcpcd
```

* 重启系统后通过以下命令检查

```
ip addr
```

## 使用systemd配置静态IP

也可以通过systemd配置金泰IP地址

* 编辑 `/etc/systemd/network/enp0s3.network`

```
[Match]
Name=enp0s3

[Network]
Address=192.168.1.102/24
Gateway=192.168.1.1
DNS=8.8.8.8
DNS=8.8.4.4
```

* 然后需要关闭netctl，需要找到和netctl相关的激活配置，执行以下命令

```
sudo systemctl list-unit-files
```

例如

```
sudo systemctl disable netctl@enp0s3.service
```

* 删除netctl软件包

```
sudo pacman -Rns netctl
```

* 停止dhcp服务

```
sudo systemctl stop dhcpcd
sudo systemctl disable dhcpcd
```

* 然后激活systemd-networkd服务

```
sudo systemctl enable systemd-networkd
sudo systemctl start systemd-networkd
```

# 使用netctl配置动态IP地址

* 首先安装netctl

```
sudo pacman -S netctl
```

* 复制配置案例

```
sudo cp /etc/netctl/examples/ethernet-dhcp /etc/netctl/enp0s3
```

* 然后修订配置 `/etc/netctl/enp0s3`

```
Description='A basic dhcp ethernet connection'
Interface=enps03
Connection=ethernet
IP=dhcp
#DHCPClient=dhcpcd
#DHCPReleaseOnStop=no
## for DHCPv6
#IP6=dhcp
#DHCP6Client=dhclient
## for IPv6 autoconfiguration
#IP6=stateless
```

* 启动dhcpcd服务

```
sudo systemctl enable dhcpcd
sudo systemctl start dhcpcd                                                           
```

# 参考

* [How To Configure Static And Dynamic IP Address In Arch Linux](https://www.ostechnix.com/configure-static-dynamic-ip-address-arch-linux/)