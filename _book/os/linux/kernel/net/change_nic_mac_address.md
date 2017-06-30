在Linux平台，有多种方法可以修改网卡的Mac地址

# 手工方式

## 使用`iproute2`

首先显示网卡的Mac地址

```
ip link show <interface>
```

然后先停止网卡

```
ip link set dev <interface> down
```

然后更改网卡MAC地址

```
ip link set dev <interface> address XX:XX:XX:XX:XX:XX
```

最后启动网卡就可以看到以指定MAC地址工作

```
ip link set dev interface up
```

# 自动方式

## 使用`systemd-networkd`

[systemd-networkd](https://wiki.archlinux.org/index.php/Systemd-networkd)支持通过链接文件（参考`man systemd.link`）来设置MAC：

* /etc/systemd/network/00-default.link

```
[Match]
MACAddress=original MAC

[Link]
MACAddress=spoofed MAC
NamePolicy=kernel database onboard slot path
```

如果要每次启动使用随机MAC地址，可以将`MACAddress=spoofed MAC`修改成`MACAddressPolicy=random`

## 使用`systemd-udevd`

udev支持通过规则来实现MAC地址修改，通过`address`属性匹配初始的MAC地址并通过`ip`命令修改：

* /etc/udev/rules.d/75-mac-spoof.rules

```
ACTION=="add", SUBSYSTEM=="net", ATTR{address}=="XX:XX:XX:XX:XX:XX", RUN+="/usr/bin/ip link set dev %k address YY:YY:YY:YY:YY:YY"
```

# Red Hat/CentOS更改网卡MAC地址

在Red Hat/CentOS 4/5/6/7支持配置文件`/etc/sysconfig/network-scripts/ifcfg-ethX`的`MACADDR=`设置来修改MAC地址。

> 网卡的实际MAC地址是`HWADDR=`，是为了标识具体网卡的；而`MACADDR=`则是为了设置网卡MAC地址。

```
# cat /etc/sysconfig/network-scripts/ifcfg-eth1  
DEVICE=eth1  
BOOTPROTO=dhcp  
HWADDR=00:17:a4:77:09:20  
ONBOOT=yes  
TYPE=Ethernet  
USERCTL=no  
IPV6INIT=no  
PEERDNS=yes
NM_CONTROLLED=no
```

以上方法也适合bonding网卡设备：

```
#  cat /etc/sysconfig/network-scripts/ifcfg-eno1
DEVICE=eno1
NAME=eno1
TYPE=Ethernet
BOOTPROTO=none
ONBOOT=yes
MASTER=bond0
SLAVE=yes
NM_CONTROLLED=no

# cat /etc/sysconfig/network-scripts/ifcfg-eno2
DEVICE=eno2
NAME=eno2
TYPE=Ethernet
BOOTPROTO=none
ONBOOT=yes
MASTER=bond0
SLAVE=yes
NM_CONTROLLED=no

# cat /etc/sysconfig/network-scripts/ifcfg-bond0
DEVICE=bond0
NAME=bond0
TYPE=Bond
MACADDR=a0:36:9f:0f:b1:70
ONBOOT=yes
BOOTPROTO=dhcp
NM_CONTROLLED=no
BONDING_OPTS="mode=active-backup primary=eno1 miimon=100"
```

# 无线网卡MAC地址

前述方法都可以设置有线网卡的MAC地址，但是在CentOS 7上，尝试设置无线网卡却失败。systemd每次启动`network`服务，都会随机设置WIFI设备的MAC地址，导致`MACADDR=`设置无效。

使用的无线网卡设备是`Intel Centrino Advanced-N 6205`，内核驱动是`iwlwifi`

参考 [Add second method for MAC randomisation #166](https://github.com/QubesOS/qubes-doc/pull/166)

* 使用`udevadm`指令检查`udev`设备情况可以获得设备的`udev`参数

```
udevadm info -q all /sys/class/net/wlp3s0
```

* 配置`/etc/udev/rules.d/75-mac-spoof.rules`

```
ACTION=="add", SUBSYSTEM=="net", INTERFACE=="wlp3s0", RUN+="/sbin/ip link set dev %k address YY:YY:YY:YY:YY:YY"
```

这个测试依然没有成功 ^_^

# 参考

* [Changing Your MAC Address/Linux](https://en.wikibooks.org/wiki/Changing_Your_MAC_Address/Linux)
* [MAC address spoofing](https://wiki.archlinux.org/index.php/MAC_address_spoofing)
* [How to fix changing MAC address for a network interface or for a bonding interface after each reboot? ](https://access.redhat.com/solutions/70215)
* [ARGH udev won't stop renaming my interfaces!](https://askubuntu.com/questions/590029/argh-udev-wont-stop-renaming-my-interfaces) 提供了通过udev方式设置网卡命名的方法。