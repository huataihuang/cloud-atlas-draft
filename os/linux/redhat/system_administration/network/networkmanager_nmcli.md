在ThinkPadX220笔记本上安装CentSO 7操作系统，系统安装过程自动配置了wifi。然而，和原先[Mac上安装Gentoo Linux](../../../gentoo/install_gentoo_on_macbook)不同，当前RHEL/CentOS 7采用NetworkManager来管理网络，虽然也使用了`wpa_supplicent`程序，但是配置文件做了很大调整。既熟悉又陌生的配置方法，让我很是迷惑了一阵。

本文是采用NetworkManager命令行操作的经验总结，也是适应开源技术发展的学习实践。

> `nmcli`是NetworkManager命令行管理工具。

# NetworkManager状态

* 显示NetworkManager状态

```
nmcli general status
```

如果已经有网络连接，则显示类似如下

```
STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled
```

* 显示激活的连接

```
nmcli connection show --active
```

显示网络连接概要

```
NAME    UUID                                  TYPE             DEVICE
mylink  cc54be34-0ad5-4bc7-ad76-f7f33ef8bc2c  802-11-wireless  wlp3s0
```

* 显示所有已经配置的连接

```
nmcli connection show
```

该命令会显示目前已经配置的所有配置名列表：

```
NAME         UUID                                  TYPE             DEVICE
mylink       cc54be34-0ad5-4bc7-ad76-f7f33ef8bc2c  802-11-wireless  wlp3s0
comlink      f771d330-1639-40a7-a705-842ebbc59939  802-11-wireless  --
enp0s25      4ac9284e-d7e0-49e6-9f58-a9530cd5d36f  802-3-ethernet   --
```

如果要详细显示某个配置，例如，我配置了`mylink`，需要详细查看：

```
nmcli connection show mylink
```

# 连接或者断开已经已经配置的连接

通过名字来连接一个已经配置的连接

```
nmcli connection up id <connection name>
```

通过名字断开连接

```
nmcli connection down id <connection name>
```

# Wifi

* 获取wifi状态

```
nmcli radio wifi
```

如果wifi是激活状态的会显示`enabled`

* 开启或关闭wifi

```
nmcli radio wifi <on|off>
```

* 显示所有可以连接的访问热点（AP）:

```
nmcli device wifi list
```

显示输出

```
*  SSID           MODE   CHAN  RATE       SIGNAL  BARS  SECURITY
   Xiaomi_9DE8    Infra  4     54 Mbit/s  59      ▂▄▆_  WPA1 WPA2
*  mylink         Infra  11    54 Mbit/s  58      ▂▄▆_  WPA2
   ChinaNet-An3r  Infra  11    54 Mbit/s  52      ▂▄__  WPA1 WPA2
```

* 刷新AP

```
nmcli device wifi rescan
```

* 创建一个连接到开放AP的新连接：

```
nmcli device wifi connect <SSID|BSSID>
```

* 创建一个连接到有密码保护的AP

```
nmcli device wifi connect <SSID|BSSID> password <password>
```

# 网络接口

* 列出可用接口和它们的状态

```
nmcli device status
```

显示如下

```
DEVICE   TYPE      STATE        CONNECTION
wlp3s0   wifi      connected    mylink
enp0s25  ethernet  unavailable  --
lo       loopback  unmanaged    --
```

* 断开一个接口

```
nmcli device disconnect iface <interface>
```

* 创建或修改一个连接

* 使用交互编辑方式创建一个连接

```
nmcli conncection edit con-name <name of new connection>
```

要编辑一个已经存在的连接：

```
nmcli connection edit <connection name>
```

> 不过交互界面很繁琐，实际还是以命令行来设置较为方便

# 实践笔记

* 新增加一个wifi类型连接，连接到名为`mylink`的AP上

```
nmcli con add con-name mylink ifname wlp3s0 type wifi ssid mylink
```

提示信息：

```
Connection 'mylink' (cc54be34-0ad5-4bc7-ad76-f7f33ef8bc2c) successfully added.
```

如果要配置静态IP地址，可以使用

```
nmcli con add con-name mylink ifname wlp3s0 type wifi ssid mylink \
ip4 192.168.1.101/24 gw 192.168.1.1
```

NetworkManager设置了内部参数`connection.autoconnect`是`yes`，并且在`/etc/sysconfig/network-scripts/ifcfg-mylink`配置中设置`ONBOOT=yes`以便启动时连接。

* 修改`mylink`配置，增加wifi密码管理方式`wpa-psk`

```
nmcli con modify mylink wifi-sec.key-mgmt wpa-psk
```

* 为`mylink`配置添加访问密码：

```
nmcli con modify mylink wifi-sec.psk MYPASSWORD
```

* 指定设备连接

```
nmcli dev connect wlp3s0
```

连接命令也可以通过指定配置方式：

```
nmcli con up mylink
```

> 这里`wlp3s0`是已经配置过的无线网卡设备，会根据这个接口上配置过的多个config选择最合适的AP进行连接。

连接成功提示无线ESSID对应的`UUID`

```
Device 'wlp3s0' successfully activated with 'cc54be34-0ad5-4bc7-ad76-f7f33ef8bc2c'
```

## 配置文件解析

`nmcli con add con-name mylink ifname wlp3s0 type wifi ssid mylink`和`nmcli con modify mylink wifi-sec.key-mgmt wpa-psk`指令生成了对应配置文件：

* `/etc/sysconfig/network-scripts/ifcfg-mylink`

```
ESSID="mylink"
MODE=Managed
TYPE=Wireless
BOOTPROTO=dhcp
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=mylink
UUID=cc54be34-0ad5-4bc7-ad76-f7f33ef8bc2c
DEVICE=wlp3s0
ONBOOT=yes
KEY_MGMT=WPA-PSK
MAC_ADDRESS_RANDOMIZATION=default
PEERDNS=yes
PEERROUTES=yes
IPV6_PEERDNS=yes
IPV6_PEERROUTES=yes
```

`nmcli con modify mylink wifi-sec.psk MYPASSWORD`指令生成了对应密码配置文件

* `/etc/sysconfig/network-scripts/keys-mylink` - 文件权限是`600`只对root用户可读写

```
WPA_PSK='MYPASSWORD'
```

## wifi接口静态MAC地址

默认情况下，wifi接口的MAC地址是随机生成的，在网卡接口配置`/etc/sysconfig/network-scripts/ifcfg-mylink`中有如下配置

```
MAC_ADDRESS_RANDOMIZATION=default
```

该配置导致每次网卡启动后MAC地址随机生成。

参考 [Configuring MAC Address Randomization](https://wiki.archlinux.org/index.php/NetworkManager#Configuring_MAC_Address_Randomization) 

在NetworkManager 1.4.0，支持两种随机MAC地址方式：在扫描时随机生成，和 固定随机生成。这两种方式可以通过 `/etc/NetworkManager/NetworkManager.conf` 配置。

从 NetworkManager 1.2.0开始默认激活了Wifi扫描时随机生成MAC地址，可以通过添加以下行配置禁止：

```
[device]
wifi.scan-rand-mac-address=no
```

相反，固定随机生成则在每个不同连接时生成一个不同的MAC地址。这对于一些环境，如基于你的MAC地址的登录系统。要使用这种固定随机生成，则使用配置

```
[connection]
wifi.cloned-mac-address=random
```

或

```
[connection]
ethernet.cloned-mac-address=random
```

### 关闭随机生成MAC地址，并设置固定MAC地址

#### WPA认证

* 配置 `/etc/NetworkManager/NetworkManager.conf` 添加

```
[device]
wifi.mac-address-randomization=1
```

> 这里值`1`表示`never`

参考 [Re: How to activate MAC address randomization?](https://mail.gnome.org/archives/networkmanager-list/2016-May/msg00058.html)

```
typedef enum {
»···NM_SETTING_MAC_RANDOMIZATION_DEFAULT = 0,
»···NM_SETTING_MAC_RANDOMIZATION_NEVER = 1,
»···NM_SETTING_MAC_RANDOMIZATION_ALWAYS = 2,
} NMSettingMacRandomization;
```

然后重启主机，就会看到WIFI网络接口的MAC地址始终保持不变。

> 实践发现，WPA认证仅设置`wifi.mac-address-randomization=1`就能够保持MAC不变，只使用网卡实际MAC地址。但是，在802.1X认证中发现，需要同时设置`wifi.scan-rand-mac-address=no`才能使用MAC地址保持不变。

* 接下来我们需要设置一个固定MAC地址，编辑 `/etc/sysconfig/network-scripts/ifcfg-mylink`

参考 [Changing Your MAC Address/Linux](https://en.wikibooks.org/wiki/Changing_Your_MAC_Address/Linux)

添加如下配置

```
MACADDR=12:34:56:78:90:ab
```

> 注意`MACADDR=`配置和`HWADDR=`配置不同，前者是设置接口MAC地址，后者是根据接口MAC地址标识。

重启主机，就可以看到每次无线网卡的MAC地址都是指定设置的 `12:34:56:78:90:ab`

注意：配置文件修改也可以通过 `nmcli` 命令进行(实际也是设置相同的配置)：

```
nmcli connection modify mylink wifi.cloned-mac-address 12:34:56:78:90:ab
```

> 为什么是`wifi.cloned-mac-address`？这是参考[MAC Address Spoofing in NetworkManager 1.4.0](https://blogs.gnome.org/thaller/2016/08/26/mac-address-spoofing-in-networkmanager-1-4-0/)，NetworkManager一直提供了这个参数来设置指定MAC。对应在Dbus中，这个参数是`assinged-mac-address`。

#### 802.1X认证

参考 [What’s new with NetworkManager?](https://www.certdepot.net/whats-new-networkmanager/) 提到了Wi-Fi增强中，从 NetworkManager 1.4.0开始，支持指定MAC地址，使用的是 `802-11-wireless.cloned-mac-address`属性：

* MAC地址
* permanent - 使用设备的永久MAC地址
* preserve - 激活时不更改设备MAC
* random - 每次链接生成一个随机MAC地址
* stable - 生成一个固定的哈希的MAC地址

> 详细参考 [MAC Address Spoofing in NetworkManager 1.4.0](https://blogs.gnome.org/thaller/2016/08/26/mac-address-spoofing-in-networkmanager-1-4-0/)

* 配置 `/etc/NetworkManager/NetworkManager.conf` 添加

```
[device-mac-randomization]
wifi.scan-rand-mac-address=no
wifi.cloned-mac-address=12:34:56:78:90:ab
```

> `wifi.scan-rand-mac-address=no`似乎和`wifi.mac-address-randomization=1`起的是相同作用？

> 添加`wifi.cloned-mac-address`没有生效，而`nmcli connection modify comlink wifi.cloned-mac-address 12:34:56:78:90:ab`是修改了`/etc/sysconfig/network-scripts/ifcfg-comlink`配置，添加了`MACADDR=12:34:56:78:90:AB`

* 配置`/etc/sysconfig/network-scripts/ifcfg-comlink`

假设802.1X认证的AP名字是`comlink`，使用以下命令设置（可选），也可以直接修改配置文件

```
nmcli connection modify comlink wifi.cloned-mac-address 12:34:56:78:90:ab
```

# 参考

* [Networking/CLI](https://fedoraproject.org/wiki/Networking/CLI)
* [2.4.2. Connecting to a Network Using nmcli](https://docs.fedoraproject.org/en-US/Fedora/25/html/Networking_Guide/sec-Connecting_to_a_Network_Using_nmcli.html)