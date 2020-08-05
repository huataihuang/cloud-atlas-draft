在ThinkPadX220笔记本上安装CentSO 7操作系统，系统安装过程自动配置了wifi。然而，和原先[Mac上安装Gentoo Linux](../../../gentoo/install_gentoo_on_macbook)不同，当前RHEL/CentOS 7采用NetworkManager来管理网络，虽然也使用了`wpa_supplicent`程序，但是配置文件做了很大调整。既熟悉又陌生的配置方法，让我很是迷惑了一阵。

> 强烈推荐使用NetworkManager，因为我发现，最新的操作系统发行版，不论是 CentOS 7 还是 Ubuntu 18.0.4，默认都采用了NetworkManager来管理网络，配置方法已经不同。
>
> 实际上使用 `nmcli` 配置也不复杂，只需要一条命令就可以生成配置文件，重启NetworkManager就可以正常工作。

本文是采用NetworkManager命令行操作的经验总结，也是适应开源技术发展的学习实践。

> `nmcli`是NetworkManager命令行管理工具。

# NetworkManager

* 首先检查NetworkManager服务

```bash
systemctl status NetworkManager
```

如果系统已经启动了NetworkManager服务，输出类似:

```bash
● NetworkManager.service - Network Manager
   Loaded: loaded (/usr/lib/systemd/system/NetworkManager.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2020-07-30 15:14:18 CST; 5 days ago
     Docs: man:NetworkManager(8)
 Main PID: 837 (NetworkManager)
    Tasks: 3 (limit: 204604)
   Memory: 15.3M
   CGroup: /system.slice/NetworkManager.service
           └─837 /usr/sbin/NetworkManager --no-daemon

Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.5698] device (br-bec47196ffd1): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.6066] device (veth72816e3): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.6439] device (vethf619d54): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.7125] device (vethdbd0a11): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.7469] device (veth34c8246): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.8019] device (veth01d22c7): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.8689] device (veth82295b4): carrier: link connected
Jul 30 15:14:22 server-1.example NetworkManager[837]: <info>  [1596093262.9016] device (veth350c4f2): carrier: link connected
Jul 30 15:15:05 worker7 NetworkManager[837]: <info>  [1596093305.5271] hostname: hostname changed from "server-1.example" to "worker7"
Jul 30 15:15:05 worker7 NetworkManager[837]: <info>  [1596093305.5272] policy: set-hostname: current hostname was changed outside NetworkManager: 'worker7'
```

> 请注意：显示服务器的名字最初是 `server-1.example` ，但是最后改成了 `worker7` ，这是因为我使用了 `hostnamctl set-hostname worker` 修改了主机名。在NetworkManager启动时主机名是 `server-1.example` ，服务提示在NetworkManager管控之外主机名被修改。
>
> 在 `/etc/NetworkManager` 目录下搜索可以看到有一个配置文件 `/etc/Networker/dispatcher.d/11-dhclient` 内容有：

```bash
[ -f /etc/sysconfig/network ] && . /etc/sysconfig/network

[ -f /etc/sysconfig/network-scripts/ifcfg-"${interface}" ] && \
    . /etc/sysconfig/network-scripts/ifcfg-"${interface}"

if [ -d $ETCDIR/dhclient.d ]; then
...
fi
```

你就可以理解NetworkManager兼容了很多传统的配置方式，例如以前 `network` 服务使用 `/etc/sysconfig/network-scripts/ifcfg-"${interface}"` 配置也可以由NetworkManager管理。

检查 `/etc/sysconfig/network` 配置就可以看到原来NetworkManager是读取 `/etc/sysconfig/network` 来获取主机名配置的:

```bash
NETWORKING_IPV6=no
PEERNTP=no
HOSTNAME=server-1.example
```

上述主机名被 `hostnamectl set-hostname worker7` 命令的配置文件 `/etc/hostname` 覆盖，在 `/etc/hostname` 中内容是生效的主机名:

```
worker7
```

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

在服务器上 `worker7` 上检查，案例显示如下:

```
NAME             UUID                                  TYPE      DEVICE
System eth0      5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03  ethernet  eth0
br-bec47196ffd1  821f3b35-6528-410a-bb25-f7f065fadde2  bridge    br-bec47196ffd1
docker0          693c9269-2d26-4a6f-a005-e99fb5841246  bridge    docker0
```

可以看到上述服务器配置了docker服务，所以有一个 `docker0` 的网桥，另外一个 `br-bec47196ffd1` 网桥是安装了 `kind` 单机运行多节点kubernetes集群的网桥。

如果要详细显示某个配置，例如，我配置了`mylink`无线网卡，需要详细查看：

```
nmcli connection show mylink
```

又比如，我在 `worker7` 服务器上默认的系统`eth0`配置

```
nmcli connection show "System eth0"
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

在我的笔记本上显示如下：

```
DEVICE   TYPE      STATE        CONNECTION
wlp3s0   wifi      connected    mylink
enp0s25  ethernet  unavailable  --
lo       loopback  unmanaged    --
```

而在`worker7`服务器上显示：

```
DEVICE           TYPE      STATE      CONNECTION
eth0             ethernet  connected  System eth0
br-bec47196ffd1  bridge    connected  br-bec47196ffd1
docker0          bridge    connected  docker0
veth01d22c7      ethernet  unmanaged  --
veth34c8246      ethernet  unmanaged  --
veth350c4f2      ethernet  unmanaged  --
...
```

这里后半部分输出的 `vethXXX` 是 `kind` 单机Kubernetes实现的docker容器的虚拟网卡，不属于NetworkManager管理。

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

## wifi连接

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

## 有线网络连接

* 检查连接

```
nmcli connection show
```

显示输出中包含了无线网路和有线网络，还有虚拟化的网桥设备：

```
NAME         UUID                                  TYPE             DEVICE  
my-wifi      5da2cedb-9de5-4c4e-9234-113782cf334c  802-11-wireless  wlp3s0  
docker0      d5dfebe9-1add-44bb-878b-ca09af6765af  bridge           docker0 
virbr0       3c524f19-6e07-4345-9226-032f7391cc6f  bridge           virbr0  
enp0s25      4061cb98-e121-3caf-8936-fcd0a3d52549  802-3-ethernet   --      
```

* 显示设备状态 - 可以看到有线网络尚未配置，显示是`disconnected`状态：

```
nmcli device status
```

显示输出

```
DEVICE       TYPE      STATE         CONNECTION  
docker0      bridge    connected     docker0     
virbr0       bridge    connected     virbr0      
wlp3s0       wifi      connected     my-wifi 
enp0s25      ethernet  disconnected  --          
veth2f89e14  ethernet  unmanaged     --          
veth6b20dc6  ethernet  unmanaged     --
...
```

* 现在我们要配置`enp0s25`这个有线网卡设备：

```
nmcli con add con-name pi ifname enp0s25 type ethernet ip4 192.168.0.1/24
```

显示配置成功：

```
Connection 'pi' (20a0a86b-2a50-4bbd-aec9-c90839284b15) successfully added.
```

此时在`/etc/sysconfig/network-scripts/ifcfg-pi`下添加了设备配置：

```
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=none
IPADDR=192.168.0.1
PREFIX=24
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=pi
UUID=20a0a86b-2a50-4bbd-aec9-c90839284b15
DEVICE=enp0s25
ONBOOT=yes
```

* 网卡已经激活，可以通过`ifconfig`看到如下输出：

```
enp0s25: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.0.1  netmask 255.255.255.0  broadcast 192.168.0.255
        inet6 fe80::a274:bf98:53db:b0f4  prefixlen 64  scopeid 0x20<link>
        ether f0:de:f1:9b:0c:7b  txqueuelen 1000  (Ethernet)
        RX packets 24442  bytes 1577896 (1.5 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 7739  bytes 1372682 (1.3 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 20  memory 0xf2500000-f2520000 
```

这个有线网卡是配置是为了[树莓派快速起步](../../../../../develop/raspberry_pi/raspberry_pi_quick_start)准备的连接树莓派开发测试网段的笔记本网卡配置。然后可以参考[Firewalld丰富而直接的规则：设置Fedora/CentOS 7作为路由器](../../../network/firewall/firewalld/firewalld_rich_direct_rules_setup_fedora_centos_7_as_router)设置一个NAT masquerade，允许树莓派网段访问外网。

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

经过实践验证，`nmcli`指令可以完成802.1x配置创建和使用，但是在MAC spoof上实践没有成功生效。待进一步验证。

* 通过`nmcli`创建配置

```
nmcli con add con-name comlink ifname wlp3s0 type wifi ssid comlink \
wifi-sec.key-mgmt wpa-eap 802-1x.eap peap 802-1x.phase2-auth mschapv2 \
802-1x.identity "USERNAME" 802-1x.password "PASSWORD" wifi.cloud-mac-address 12:34:56:78:90:ab
```

上述命令就可以完整创建 `ifcfg-comlink` 配置和对应的密码配置 `keys-comlink`

> 命令案例参考 [How to connect to an 802.1x wireless network via nmcli](https://unix.stackexchange.com/questions/145366/how-to-connect-to-an-802-1x-wireless-network-via-nmcli)

* 然后执行启动

```
nmcli connection up comlink
```

在 `/var/log/wpa_supplicant.log` 有认证日志信息可以作为排查依据（从`ps  aux | grep wpa_supplicant`可以找到对应日志）：

```
EAP-TLV: TLV Result - Failure
wlp3s0: CTRL-EVENT-EAP-FAILURE EAP authentication failed
wlp3s0: CTRL-EVENT-DISCONNECTED bssid=4c:48:da:25:0a:b9 reason=23
```

---

`以下步骤是手工配置方法`，供参考。建议还是采用`nmcli`命令来创建配置（见前述）

参考 [What’s new with NetworkManager?](https://www.certdepot.net/whats-new-networkmanager/) 提到了Wi-Fi增强中，从 NetworkManager 1.4.0开始，支持指定MAC地址，使用的是 `802-11-wireless.cloned-mac-address`属性：

* MAC地址
* permanent - 使用设备的永久MAC地址
* preserve - 激活时不更改设备MAC
* random - 每次链接生成一个随机MAC地址
* stable - 生成一个固定的哈希的MAC地址

> 详细参考 [MAC Address Spoofing in NetworkManager 1.4.0](https://blogs.gnome.org/thaller/2016/08/26/mac-address-spoofing-in-networkmanager-1-4-0/)

* 配置 `/etc/NetworkManager/NetworkManager.conf` 添加(手工修改配置文件实际应该和`nmcli`指令配置方法相同)

```
[device-mac-randomization]
wifi.scan-rand-mac-address=no
wifi.cloned-mac-address=12:34:56:78:90:ab  # 这行没有生效
```

> `wifi.scan-rand-mac-address=no`似乎和`wifi.mac-address-randomization=1`起的是相同作用？

> 由于 `/etc/NetworkManager/NetworkManager.conf` 添加`wifi.cloned-mac-address`没有生效，则采用 `nmcli connection modify comlink wifi.cloned-mac-address 12:34:56:78:90:ab`。原来 `nmcli` 是修改了`/etc/sysconfig/network-scripts/ifcfg-comlink`配置，添加了`MACADDR=12:34:56:78:90:AB`

* 配置`/etc/sysconfig/network-scripts/ifcfg-comlink`(如上所述)

假设802.1X认证的AP名字是`comlink`，使用以下命令设置（可选），也可以直接修改配置文件

```
nmcli connection modify comlink wifi.cloned-mac-address 12:34:56:78:90:ab
```

但是，实际操作发现`nmcli`命令设置`wifi.cloned-mac-address`的方法虽然成功在`/etc/sysconfig/network-scripts/ifcfg-comlink`添加了`MACADDR=12:34:56:78:90:AB`，但是操作系统启动后发现，MAC地址只是恢复成了无线网卡实际的MAC地址，而没有实现MAC spoof。

#### 802.1X认证中的MAC spoof

* 虽然`ifcfg-comlink`配置中`MACADDR=12:34:56:78:90:AB`无效，但是可以手工通过`ip link set dev`指令设置无线网卡MAC地址：

```
ip link set dev wlp3s0 down
ip link set dev wlp3s0 address 12:34:56:78:90:ab
ip link set dev wlp3s0 up
```

> 验证确实能够成功更改无线网卡MAC地址

* 另外实践验证，通过udev rules设置，可以实现操作系统启动网卡时自动更改无线网卡MAC - 这个机制利用了systemd-udev机制。即参考 [MAC address spoofing](https://wiki.archlinux.org/index.php/MAC_address_spoofing) 设置 `/etc/udev/rules.d/75-mac-spoof.rules` :

```
ACTION=="add", SUBSYSTEM=="net", ATTR{address}=="物理网卡硬件MAC地址", RUN+="/sbin/ip link set dev %k address 12:34:56:78:90:ab"
```

操作系统重启就可以看到无线网卡MAC地址正确设置成了`12:34:56:78:90:ab`

* 然而，通过`nmcli`命令，没有任何参数时候查看发现，无线网卡的MAC地址立即被随机修改了

```
wlp3s0: disconnected
        "Intel Centrino Advanced-N 6205 [Taylor Peak] (Centrino Advanced-N 6205 AGN)"
        1 connection available
        wifi (iwlwifi), 94:ED:CD:8E:EB:3F, hw
```

非常奇怪，从`nmcli`命令查看无线网卡wifi(iwlwifi)设备的MAC地址依然是一个随机MAC地址。

#### 802.1X认证密码文件

在完成了MAC地址修改之后，执行链接AP

```
nmcli connection up comlink
```

此时提示错误

```
Passwords or encryption keys are required to access the wireless network 'comlink'.
Warnging: password for '802-1x.identity' not given in 'passwd-file' and nmcli cannot ask without '--ask' option.
Error: Connection activation failed.
```

这个问题比较奇怪，实际上前述`nmcli con add con-name comlink`实际上已经在配置文件中存储了认证帐号名字和密码。

参考 [802.1x with NetworkManager using nmcli](https://major.io/2016/05/03/802-1x-networkmanager-using-nmcli/) 提供了一种设置帐号密码的方法，就是在`/etc/NetworkManager/system-connections/CONNECTION_NAME`保存密码，即编辑`/etc/NetworkManager/system-connections/comlink`

```
[connection]
id=comlink

[802-1x]
password=YOUR_8021X_PASSWORD
```

# 参考

* [Networking/CLI](https://fedoraproject.org/wiki/Networking/CLI)
* [2.4.2. Connecting to a Network Using nmcli](https://docs.fedoraproject.org/en-US/Fedora/25/html/Networking_Guide/sec-Connecting_to_a_Network_Using_nmcli.html)
* [How To Configure A Static IP On Linux](https://cloudcone.com/docs/article/how-to-configure-a-static-ip-address-on-linux/)
* [Adding a static IP to a DHCP-enabled NetworkManager connection](http://www.szakmeister.net/blog/2017/jun/1/static-ip-nmcli/)
* [How to setup a static IP for network-manager in Virtual Box on Ubuntu Server](https://askubuntu.com/questions/246077/how-to-setup-a-static-ip-for-network-manager-in-virtual-box-on-ubuntu-server)