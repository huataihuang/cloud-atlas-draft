> 这是一个比较特殊的案例

在测试环境中，服务器是通过DHCP分配IP地址的，这对于我部署Kubernetes集群带来一些困扰：

* 分配给容器使用的IP地址不能和DHCP分配的IP地址冲突
* 要模拟规模化的集群，容器需要使用大量IP地址

解决思路：

* 考虑到我不能控制DHCP分配的IP段，所以我准备在测试服务器上独立分配一个不会冲突的网段： `192.168.122.x` ，这样可以任意分配IP地址
* 虽然上述IP网段无法路由，但是我准备将这个网段模拟成数据中心网段，模拟成公司的内部私有网络，对外部是隔离的
* 当需要访问Kubernetes集群时，采用VPN方式(模拟真实世界中企业内网都是通过VPN访问的)，只要VPN能构建起来，即使是内部局域网不可路由网段也可以访问到

# 部署

* 首先，服务器的网络是通过 [NetworkManager](networkmanager_nmcli) 管理的，检查如下：

```bash
nmcli connection show --active
```

输出

```
NAME             UUID                                  TYPE      DEVICE
System eth0      5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03  ethernet  eth0
br-bec47196ffd1  12d4c311-642e-4440-9847-3177d3cddbdc  bridge    br-bec47196ffd1
docker0          ab97d267-8b64-4acf-b6d5-0ff6d6cb489e  bridge    docker0
```

* 检查 `System eth0` 配置

```
nmcli connection show "System eth0"
```

可以看到是dhcp分配地址

```
...
ipv4.method:                            auto
ipv4.dns:                               --
ipv4.dns-search:                        --
ipv4.dns-options:                       --
ipv4.dns-priority:                      0
ipv4.addresses:                         --
ipv4.gateway:                           --
ipv4.routes:                            --
...
```

* 检查 `/etc/sysconfig/network-scripts/ifcfg-eth0` 内容就可以看到

```
DEVICE=eth0
BOOTPROTO=dhcp
ONBOOT=yes
```

* 现在我们通过nmcli命令行编辑修改配置

```
nmcli con edit "System eth0"
```

 提示

 ```

===| nmcli interactive connection editor |===

Editing existing '802-3-ethernet' connection: 'System eth0'

Type 'help' or '?' for available commands.
Type 'print' to show all the connection properties.
Type 'describe [<setting>.<prop>]' for detailed property description.

You may edit the following settings: connection, 802-3-ethernet (ethernet), 802-1x, dcb, sriov, ethtool, match, ipv4, ipv6, tc, proxy
nmcli>
```

* 显示当前配置命令如下：

```
print ipv4
```

* 我们现在来设置固定IP地址:

```bash
nmcli> set ipv4.address 192.168.122.17/24
Do you also want to set 'ipv4.method' to 'manual'? [yes]: no
```

注意：上述设置IP地址非常简单，就是命令 `set ipv4.address 192.168.122.17/24`

但是有一个诀窍，就是系统提示问题 `Do you also want to set 'ipv4.method' to 'manual'? [yes]:` 一定要回答 **`no`** ，这是因为我们希望保留原来的dhcp分配IP地址方式。

* 然后保存配置，并打印检查

```bash
nmcli> save
Connection 'System eth0' (5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03) successfully updated.
nmcli> print ipv4
```

此时可以看到IPv4输出部分如下

```
...
ipv4.method:                            auto
ipv4.dns:                               --
ipv4.dns-search:                        --
ipv4.dns-options:                       --
ipv4.dns-priority:                      0
ipv4.addresses:                         192.168.122.17/24
ipv4.gateway:                           --
ipv4.routes:                            --
...
```

`nmcli` 不仅可以通过交互命令设置，也可以直接命令行设置，上述交互设置可以通过一条命令:

```bash
nmcli con mod "System eth0" ipv4.address "192.168.122.17/24" ipv4.method "auto"
```

> 对于常规设置静态IP地址，在 [How to setup a static IP for network-manager in Virtual Box on Ubuntu Server](https://askubuntu.com/questions/246077/how-to-setup-a-static-ip-for-network-manager-in-virtual-box-on-ubuntu-server) 有一个案例非常简洁：

```bash
nmcli con mod "Wired connection 1"
  ipv4.addresses "HOST_IP_ADDRESS/IP_NETMASK_BIT_COUNT"
  ipv4.gateway "IP_GATEWAY"
  ipv4.dns "PRIMARY_IP_DNS,SECONDARY_IP_DNS"
  ipv4.dns-search "DOMAIN_NAME"
  ipv4.method "manual"
```

* 此时检查 `/etc/sysconfig/network-scripts/ifcfg-eth0` 内容会看到添加了静态IP地址，但是同时保留了DHCP配置:

```bash
DEVICE=eth0
BOOTPROTO=dhcp
ONBOOT=yes
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
IPADDR=192.168.122.17
PREFIX=24
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=no
NAME="System eth0"
UUID=5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03
```

* 重启系统，可以看到 `ip addr` 输出的 `eth0` 获得了2个IP地址，一个是静态IP，一个是DHCP动态分配IP地址

```bash
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:16:3e:16:87:ea brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.17/24 brd 192.168.122.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet 10.1.121.135/16 brd 10.1.255.255 scope global dynamic noprefixroute eth0
       valid_lft 315357604sec preferred_lft 315357604sec
```

> NetworkManager也有图形交互界面命令 `nmtui` ，但是没有提供同时使用DHCP和静态指定IP地址功能，所以上述使用了命令行 `nmcli` 。
>
> 安装字符界面图形交互程序 `nmtui` 的安装命令 `dnf install NetworkManager-tui`

# 参考

* [Adding a static IP to a DHCP-enabled NetworkManager connection](http://www.szakmeister.net/blog/2017/jun/1/static-ip-nmcli/)
* [https://cloudcone.com/docs/article/how-to-configure-a-static-ip-address-on-linux/](https://cloudcone.com/docs/article/how-to-configure-a-static-ip-address-on-linux/)