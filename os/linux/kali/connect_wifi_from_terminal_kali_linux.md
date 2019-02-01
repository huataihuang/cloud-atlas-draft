当前无线网络已经越来越普遍，并且802.11工作组已经推出了802.11i作为网络安全标准的最新改进，取代了古老的WEP技术。

# 配置

* 首先使用以下命令查找可用的无线网络设备：

```
iw dev
```

可以看到输出

```
phy#0
	Interface wlan0
		ifindex 3
		wdev 0x1
		addr 94:eb:cd:8e:eb:3f
		type managed
```

> `iw`是一个新型的`nl80211`无线网络设备命令行配置工具，支持所有最新加入到内核的设备驱动。以前使用的`iwconfig`工具，也就是用于配置无线扩展接口的工具，已经停止开发并且推荐切换到`iw`和`nl80211`。

以上命令输出可以看到，系统中只有一块无线网卡，接口命名是`wlan0`并且被设置成`phy#0`，类型是`managed`（也就是该设备是Wi-Fi状态或者客户端已经连接打一个访问点AP），硬件地址（Mac Address）是`94:eb:cd:8e:eb:3f`。

当然，也可以使用旧命令`iwconfig`查看所有设备。

```
wlan0     IEEE 802.11bgn  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:on
```

* 检查设备状态是UP还是DOWN

```
ip link show wlan0
```

输出显示

```
3: wlan0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether 94:eb:cd:8e:eb:3f brd ff:ff:ff:ff:ff:ff
```

上述ip命令用于显示路由，设备，策略路由和隧道（tunnels），也可以用于激活或禁用设备，并且可以用来查找常规的网络信息。

* 激活wifi接口：

```
ip link set wlan0 up
```

然后再次使用`ip link show wlan0`可以看到如下输出

```
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether 94:eb:cd:8e:eb:3f brd ff:ff:ff:ff:ff:ff
```

* 现在可以检查WiFi网络是否连接

```
iw wlan0 link
```

显示输出没有连接

```
Not connected.
```

* 扫描所有附近无线网络：

```
iw wlan0 scan
```

显示输出

```
BSS c8:3a:35:27:0d:f0(on wlan0)
	TSF: 0 usec (0d, 00:00:00)
	freq: 2442
	beacon interval: 100 TUs
	capability: ESS Privacy ShortSlotTime (0x0411)
	signal: -31.00 dBm
	last seen: 0 ms ago
	SSID: 1702
	Supported rates: 1.0* 2.0* 5.5 11.0 18.0 24.0 36.0 54.0
	DS Parameter set: channel 7
	ERP: <no flags>
	ERP D4.0: <no flags>
	Extended supported rates: 6.0 9.0 12.0 48.0
	HT capabilities:
		Capabilities: 0x187e
			HT20/HT40
			SM Power Save disabled
			RX Greenfield
			RX HT20 SGI
			RX HT40 SGI
			No RX STBC
			Max AMSDU length: 7935 bytes
			DSSS/CCK HT40
		Maximum RX AMPDU length 65535 bytes (exponent: 0x003)
		Minimum RX AMPDU time spacing: 8 usec (0x06)
		HT RX MCS rate indexes supported: 0-7
		HT TX MCS rate indexes are undefined
	HT operation:
		 * primary channel: 7
		 * secondary channel offset: below
		 * STA channel width: any
		 * RIFS: 1
		 * HT protection: no
		 * non-GF present: 1
		 * OBSS non-GF present: 0
		 * dual beacon: 0
		 * dual CTS protection: 0
		 * STBC beacon: 0
		 * L-SIG TXOP Prot: 0
		 * PCO active: 0
		 * PCO phase: 0
	WPA:	 * Version: 1
		 * Group cipher: CCMP
		 * Pairwise ciphers: CCMP
		 * Authentication suites: PSK
		 * Capabilities: 16-PTKSA-RC 1-GTKSA-RC (0x000c)
	WMM:	 * Parameter version 1
		 * BE: CW 15-1023, AIFSN 3
		 * BK: CW 15-1023, AIFSN 7
		 * VI: CW 7-15, AIFSN 2, TXOP 3008 usec
		 * VO: CW 3-7, AIFSN 2, TXOP 1504 usec
```

可以看到，这里的SSID名字是 `1702` 也就是我们要连接的无线AP，这里的安全协议是`WPA`。

* 使用`wpa_supplicant`工具生成一个配置文件，包含无线网络的预先共享密钥（也就是密码）：

> `wpa_passphrase [ ssid ]  [ passphrase ]`

```
wpa_passphrase 1702 PASSWORD >> /etc/wpa_supplicant.conf
```

工具命令 `wpa_passphrase` 会自动根据扫描获得的WiFi SSID对应的信息生成配置文件。

* 现在我们具备了配置文件，包含了SSID，就可以使用`wpa_supplicant`命令连接无线网络了：

```
wpa_supplicant -B -D wext -i wlan0 -c /etc/wpa_supplicant.conf
```

> `-B` 参数表示将`wpa_supplicant`运行在后台
>
> `-D` 表示指定无线网络驱动，`wext`是通用驱动
>
> `-c` 指定配置文件

这里有一个错误输出，可能和后续使用systemctl来运行wpa_supplicant失败相关（systemd发现返回失败）

```
Successfully initialized wpa_supplicant
ioctl[SIOCSIWENCODEEXT]: Invalid argument
ioctl[SIOCSIWENCODEEXT]: Invalid argument
```


* 此时再次使用`iw`命令应征连接SSID

```
iw wlan0 link
```

显示输出

```
Connected to c8:3a:35:27:0d:f0 (on wlan0)
	SSID: 1702
	freq: 2442
	RX: 983 bytes (9 packets)
	TX: 387 bytes (3 packets)
	signal: -35 dBm
	tx bitrate: 1.0 MBit/s

	bss flags:	short-slot-time
	dtim period:	3
	beacon int:	100
```

> 注意：此时还没有获得IP地址

* 通过DHCP获取地址

```
dhclient wlan0
```

* 再次检查IP地址

```
ip addr show wlan0
```

显示输出已经获得地址

```
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 94:eb:cd:8e:eb:3f brd ff:ff:ff:ff:ff:ff
    inet 192.168.9.88/24 brd 192.168.9.255 scope global dynamic wlan0
       valid_lft 1775sec preferred_lft 1775sec
    inet6 fe80::96eb:cdff:fe8e:eb3f/64 scope link
       valid_lft forever preferred_lft forever
```

* 检查路由：

> 我这里使用的是通过USB接口连接笔记本电脑的树莓派Zero，所以默认的时候路由是通过USB接口，这里需要修改 `/etc/network/interfaces`

```
auto wlan0
iface wlan0 inet dhcp
```

* 注意：要激活`wpa_supplicant`，这样下次启动才会自动运行

```
systemctl enable wpa_supplicant
```

显示输出

```
Created symlink /etc/systemd/system/dbus-fi.w1.wpa_supplicant1.service → /lib/systemd/system/wpa_supplicant.service.
Created symlink /etc/systemd/system/multi-user.target.wants/wpa_supplicant.service → /lib/systemd/system/wpa_supplicant.service.
```

这表明需要修改 `/lib/systemd/system/wpa_supplicant.service` 配置文件：

```ini
[Unit]
Description=WPA supplicant
Before=network.target
After=dbus.service
Wants=network.target

[Service]
Type=dbus
BusName=fi.w1.wpa_supplicant1
#ExecStart=/sbin/wpa_supplicant -u -s -O /run/wpa_supplicant
ExecStart=/sbin/wpa_supplicant -B -D wext -i wlan0 -c /etc/wpa_supplicant.conf

[Install]
WantedBy=multi-user.target
Alias=dbus-fi.w1.wpa_supplicant1.service
```

修改配置文件后，再次执行`systemctl restart wpa_supplicant`

不过，我还是遇到问题显示

```
● wpa_supplicant.service - WPA supplicant
   Loaded: loaded (/lib/systemd/system/wpa_supplicant.service; enabled; vendor p
   Active: inactive (dead) since Wed 2019-01-23 00:13:03 CST; 1min 23s ago
  Process: 786 ExecStart=/sbin/wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant
 Main PID: 786 (code=exited, status=0/SUCCESS)

Jan 23 00:13:03 kali systemd[1]: Starting WPA supplicant...
Jan 23 00:13:03 kali wpa_supplicant[786]: Successfully initialized wpa_supplican
Jan 23 00:13:03 kali wpa_supplicant[786]: Failed to create interface p2p-dev-wla
Jan 23 00:13:03 kali wpa_supplicant[786]: nl80211: Failed to create a P2P Device
Jan 23 00:13:03 kali wpa_supplicant[786]: P2P: Failed to enable P2P Device inter
Jan 23 00:13:03 kali systemd[1]: Started WPA supplicant.
```

显示初始化设备失败。

当前还是通过命令脚本启动

```

```

# 参考

* [Connect Wi-Fi Network From Terminal - Kali Linux](https://www.yeahhub.com/connect-wifi-network-terminal-kali-linux/)