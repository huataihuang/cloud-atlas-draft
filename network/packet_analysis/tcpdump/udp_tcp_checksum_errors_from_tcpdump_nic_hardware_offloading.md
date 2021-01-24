# `tcpdump`在启用了Checksum Offloading的网卡上抓包提示`cksum incorrect`

在使用`tcpdump`对网卡进行抓包的时，很多时候会发现有`cksum incorrect`错误：

```
sudo tcpdump -i eth0 -nn -vv -e
```

转包显示有很多`incorrect`数据包

```
11:54:08.747448 00:16:3e:0f:02:76 > 3c:8c:40:4e:dd:46, ethertype IPv4 (0x0800), length 70: (tos 0x0, ttl 128, id 12416, offset 0, flags [DF], proto: TCP (6), length: 56) 69.172.201.153.20648 > 218.92.186.154.32233: P, cksum 0xeace (incorrect (-> 0xd8b6), 649:665(16) ack 0 win 511
11:54:08.747631 3c:8c:40:01:87:f5 > 00:16:3e:0f:02:76, ethertype IPv4 (0x0800), length 60: (tos 0x0, ttl  54, id 43880, offset 0, flags [DF], proto: TCP (6), length: 40) 49.80.162.95.25453 > 69.172.201.153.20648: ., cksum 0x08de (correct), 0:0(0) ack 643 win 64379
11:54:08.747673 3c:8c:40:02:72:68 > 00:16:3e:0f:02:76, ethertype IPv4 (0x0800), length 86: (tos 0x0, ttl  51, id 26279, offset 0, flags [DF], proto: TCP (6), length: 72) 49.81.57.179.18212 > 69.172.201.153.5110: P, cksum 0xfc9e (correct), 1:33(32) ack 1 win 63939
11:54:08.747685 3c:8c:40:01:87:f5 > 00:16:3e:0f:02:76, ethertype IPv4 (0x0800), length 60: (tos 0x0, ttl  51, id 16050, offset 0, flags [DF], proto: TCP (6), length: 40) 219.139.32.98.13599 > 69.172.201.153.20648: ., cksum 0xc58e (correct), 4:4(0) ack 643 win 64523
11:54:08.747777 00:16:3e:0f:02:76 > 3c:8c:40:4e:dd:46, ethertype IPv4 (0x0800), length 62: (tos 0x0, ttl 128, id 6219, offset 0, flags [DF], proto: TCP (6), length: 48) 69.172.201.153.20648 > 219.139.32.98.13599: P, cksum 0x51bd (incorrect (-> 0x5783), 643:651(8) ack 4 win 511
11:54:08.748145 3c:8c:40:02:79:e8 > 00:16:3e:0f:02:76, ethertype IPv4 (0x0800), length 60: (tos 0x0, ttl  54, id 16715, offset 0, flags [DF], proto: TCP (6), length: 40) 221.231.4.18.4134 > 69.172.201.153.20648: ., cksum 0x78e2 (correct), 0:0(0) ack 643 win 65519
```

> 上述案例中IP地址是伪造的，仅做示例

参考 [UDP / TCP Checksum errors from tcpdump & NIC Hardware Offloading](https://sokratisg.net/2012/04/01/udp-tcp-checksum-errors-from-tcpdump-nic-hardware-offloading/)

当是使用`tcpdump`跟踪`UDP`或`TCP`数据流的时候，会看到大多数数据包显示`checksum`错误，这是因为网卡(NIC)启用了`checksum offloading`而`tcpdump`是从内核读取IP数据包，比NIC网卡芯片执行checksum要早。检查命令的方法是（假设检查DNS查询的数据包）

```
sudo tcpdump -i eth0 -vvv -nn udp dst port 53
```

我模仿使用如下命令检查虚拟机`69.172.201.153.123`的UDP包，可以看到发出的UDP包的`checksum`都是错误的，从外面返回的UDP包则显示`checksum`正常

```
sudo tcpdump -i eth0 -vvv -nn udp and host 69.172.201.153
```

可以看到

```
tcpdump: WARNING: eth0: no IPv4 address assigned
tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 96 bytes
12:25:26.388718 IP (tos 0xc0, ttl  64, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 69.172.201.153.123 > 58.216.105.122: [bad udp cksum 559b!] NTPv4, length 48
	Client, Leap indicator:  (0), Stratum 3, poll 7s, precision -22
	Root Delay: 0.030166, Root dispersion: 0.024185, Reference-ID: 110.75.186.249
	  Reference Timestamp:  3677372472.395108491 (2016/07/13 12:21:12)
	  Originator Timestamp: 3677372596.423037379 (2016/07/13 12:23:16)
	  Receive Timestamp:    3677372596.434980779 (2016/07/13 12:23:16)
	  Transmit Timestamp:   3677372726.389321297 (2016/07/13 12:25:26)
	    Originator - Receive Timestamp:  +0.011943411
	    Originator - Transmit Timestamp: +129.966283917
12:25:26.412829 IP (tos 0x0, ttl  57, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 58.216.105.122 > 69.172.201.153.123: [udp sum ok] NTPv4, length 48
	Server, Leap indicator:  (0), Stratum 2, poll 7s, precision -24
	Root Delay: 0.000106, Root dispersion: 0.001434, Reference-ID: 10.137.38.86
	  Reference Timestamp:  3677372712.335200518 (2016/07/13 12:25:12)
	  Originator Timestamp: 3677372726.389321297 (2016/07/13 12:25:26)
	  Receive Timestamp:    3677372726.401639968 (2016/07/13 12:25:26)
	  Transmit Timestamp:   3677372726.401653856 (2016/07/13 12:25:26)
	    Originator - Receive Timestamp:  +0.012318663
	    Originator - Transmit Timestamp: +0.012332545
12:25:30.386709 IP (tos 0xc0, ttl  64, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 69.172.201.153.123 > 110.75.186.248.123: [bad udp cksum 8059!] NTPv4, length 48
	Client, Leap indicator:  (0), Stratum 3, poll 10s, precision -22
	Root Delay: 0.030166, Root dispersion: 0.024246, Reference-ID: 110.75.186.249
	  Reference Timestamp:  3677372472.395108491 (2016/07/13 12:21:12)
	  Originator Timestamp: 0.000000000
	  Receive Timestamp:    0.000000000
	  Transmit Timestamp:   3677372730.387331545 (2016/07/13 12:25:30)
	    Originator - Receive Timestamp:  0.000000000
	    Originator - Transmit Timestamp: 3677372730.387331545 (2016/07/13 12:25:30)
12:25:32.387721 IP (tos 0xc0, ttl  64, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 69.172.201.153.123 > 115.28.122.198.123: [bad udp cksum 4b0a!] NTPv4, length 48
	Client, Leap indicator:  (0), Stratum 3, poll 7s, precision -22
	Root Delay: 0.030166, Root dispersion: 0.024276, Reference-ID: 110.75.186.249
	  Reference Timestamp:  3677372472.395108491 (2016/07/13 12:21:12)
	  Originator Timestamp: 3677372601.409083545 (2016/07/13 12:23:21)
	  Receive Timestamp:    3677372601.422362774 (2016/07/13 12:23:21)
	  Transmit Timestamp:   3677372732.388339668 (2016/07/13 12:25:32)
	    Originator - Receive Timestamp:  +0.013279223
	    Originator - Transmit Timestamp: +130.979256153
12:25:32.419074 IP (tos 0x0, ttl  54, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 115.28.122.198.123 > 69.172.201.153.123: [udp sum ok] NTPv4, length 48
	Server, Leap indicator:  (0), Stratum 2, poll 7s, precision -24
	Root Delay: 0.041046, Root dispersion: 0.002349, Reference-ID: 10.137.38.86
	  Reference Timestamp:  3677372656.633167505 (2016/07/13 12:24:16)
	  Originator Timestamp: 3677372732.388339668 (2016/07/13 12:25:32)
	  Receive Timestamp:    3677372732.406500339 (2016/07/13 12:25:32)
	  Transmit Timestamp:   3677372732.406535744 (2016/07/13 12:25:32)
	    Originator - Receive Timestamp:  +0.018160656
	    Originator - Transmit Timestamp: +0.018196072
```

检查 `eth0`，发现原来`tx-checksumming`是开启的，而`rx-checksumming`则是关闭的

```
sudo ethtool -k eth0
```

输出

```
Offload parameters for eth0:
rx-checksumming: off
tx-checksumming: on
scatter-gather: on
tcp segmentation offload: on
udp fragmentation offload: off
generic segmentation offload: on
generic-receive-offload: off
```

这台物理服务器上运行了虚拟化，在虚拟机中测试了`dig @8.8.8.8 www.sina.com.cn`，可以在物理服务器上抓包显示

```
13:09:49.944926 IP (tos 0x0, ttl  64, id 48092, offset 0, flags [none], proto: UDP (17), length: 61) 69.172.201.153.37421 > 8.8.8.8.53: [bad udp cksum b1aa!]  12774+ A? www.sina.com.cn. (33)
13:09:50.945615 IP (tos 0x0, ttl  64, id 48093, offset 0, flags [none], proto: UDP (17), length: 61) 69.172.201.153.37421 > 8.8.8.8.53: [bad udp cksum b1aa!]  12774+ A? www.sina.com.cn. (33)
13:09:51.018821 IP (tos 0x0, ttl  42, id 23786, offset 0, flags [none], proto: UDP (17), length: 183) 8.8.8.8.53 > 69.172.201.153.37421:  12774 q: A? www.sina.com.cn. 5/0/0 www.sina.com.cn. CNAME[|domain]
13:09:51.092146 IP (tos 0x0, ttl  42, id 51428, offset 0, flags [none], proto: UDP (17), length: 183) 8.8.8.8.53 > 69.172.201.153.37421:  12774 q: A? www.sina.com.cn. 5/0/0 www.sina.com.cn. CNAME[|domain]
```

尝试在虚拟机中关闭`TCO`(注意，`ethtool`检查的时候参数是小写的`-k`，当`ethtool`设置参数的时候是大写的`-K`)

```
ethtool -K eth1 tx off
```

```
Actual changes:
rx-checksumming: off
tx-checksumming: off
scatter-gather: off
tcp-segmentation-offload: off
udp-fragmentation-offload: off
```

再次检查，发现`rx`和`tx`的`checksum`被同时关闭了

```
ethtool -k eth1
Features for eth1:
rx-checksumming: off
tx-checksumming: off
scatter-gather: off
tcp-segmentation-offload: off
udp-fragmentation-offload: off
generic-segmentation-offload: on
generic-receive-offload: off
large-receive-offload: off
ntuple-filters: off
receive-hashing: off
```

> 奇怪：怎么`tx off`设置会同时关闭`tx`和`rx`的checksum?

不过，验证下来发现，在虚拟机中关闭`TCO`（`tx-checksumming`和`rx-checksumming`）后，在NC上抓包显示，已经不再出现数据包发送的时候的`checksum`错误

```
13:14:54.749620 IP (tos 0x0, ttl  64, id 48095, offset 0, flags [none], proto: UDP (17), length: 61) 69.172.201.153.53614 > 8.8.8.8.53: [udp sum ok]  4027+ A? www.sina.com.cn. (33)
13:14:54.964426 IP (tos 0x0, ttl  42, id 19522, offset 0, flags [none], proto: UDP (17), length: 183) 8.8.8.8.53 > 69.172.201.153.53614:  4027 q: A? www.sina.com.cn. 5/0/0 www.sina.com.cn. CNAME[|domain]

13:16:12.388133 IP (tos 0xc0, ttl  64, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 69.172.201.153.123 > 58.216.105.122: [udp sum ok] NTPv4, length 48
	Client, Leap indicator:  (0), Stratum 3, poll 9s, precision -22
	Root Delay: 0.030258, Root dispersion: 0.028045, Reference-ID: 10.143.33.50
	  Reference Timestamp:  3677375656.402239203 (2016/07/13 13:14:16)
	  Originator Timestamp: 3677375243.399526447 (2016/07/13 13:07:23)
	  Receive Timestamp:    3677375243.411563843 (2016/07/13 13:07:23)
	  Transmit Timestamp:   3677375772.388326644 (2016/07/13 13:16:12)
	    Originator - Receive Timestamp:  +0.012037376
	    Originator - Transmit Timestamp: +528.988800168
13:16:12.412254 IP (tos 0x0, ttl  57, id 0, offset 0, flags [DF], proto: UDP (17), length: 76) 58.216.105.122 > 69.172.201.153.123: [udp sum ok] NTPv4, length 48
	Server, Leap indicator:  (0), Stratum 2, poll 9s, precision -24
	Root Delay: 0.000106, Root dispersion: 0.002014, Reference-ID: 10.137.38.86
	  Reference Timestamp:  3677375704.335250139 (2016/07/13 13:15:04)
	  Originator Timestamp: 3677375772.388326644 (2016/07/13 13:16:12)
	  Receive Timestamp:    3677375772.400358736 (2016/07/13 13:16:12)
	  Transmit Timestamp:   3677375772.400375515 (2016/07/13 13:16:12)
	    Originator - Receive Timestamp:  +0.012032079
	    Originator - Transmit Timestamp: +0.012048868
```

再次恢复虚拟机的`TCO`

```
[root@houyiecsayZ14464544641Z ~]# ethtool -K eth1 tx on
Actual changes:
rx-checksumming: on
tx-checksumming: on
```

可以看到抓包显示依然出现了UDP发送包的chksum错误

```
13:18:47.851459 IP (tos 0x0, ttl  64, id 48096, offset 0, flags [none], proto: UDP (17), length: 61) 69.172.201.153.51360 > 8.8.8.8.53: [bad udp cksum 256e!]  14335+ A? www.sina.com.cn. (33)
13:18:47.983450 IP (tos 0x0, ttl  42, id 47800, offset 0, flags [none], proto: UDP (17), length: 183) 8.8.8.8.53 > 69.172.201.153.51360:  14335 q: A? www.sina.com.cn. 5/0/0 www.sina.com.cn. CNAME[|domain]
```

**注意：为了避免性能问题，完成测试后需要恢复开启`TCO`功能**

# 开关tso的方法推荐

`ethtool` 大写参数 `-K` 可以用来切换，而消协参数 `-k` 则用来显示

```bash
ethtool -K eth0 tso on

ethtool -K eth0 tso off
```

上述命令可以组合参数，举例

```
ethtool -K eth0 tso on sg on tx on

ethtool -K eth0 tso off sg off tx off
```

然后检查：

```
ethtool -k eth0
```

可以看到修改后的参数

[Disable TCP-Offloading {completely, generically and easily}](https://serverfault.com/questions/421995/disable-tcp-offloading-completely-generically-and-easily) 有一些设置脚本案例

```bash
#!/bin/bash

RUN=true
case "${IF_NO_TOE,,}" in
    no|off|false|disable|disabled)
        RUN=false
    ;;
esac

if [ "$MODE" = start -a "$RUN" = true ]; then
  TOE_OPTIONS="rx tx sg tso ufo gso gro lro rxvlan txvlan rxhash"
  for TOE_OPTION in $TOE_OPTIONS; do
    /sbin/ethtool --offload "$IFACE" "$TOE_OPTION" off &>/dev/null || true
  done
fi
```

此外，debian的配置文件 `/etc/network/interfaces` 提供了接口设置offload:

```bash
auto eth0
iface eth0 inet static
    address 10.0.3.1/255.255.248.0
    gateway 10.0.2.10
    offload-tx  off
    offload-sg  off
    offload-tso off
```

# 原理

## 原理简述

[Too many incorrect checksum errors in TCPDUMP](Too many incorrect checksum errors in TCPDUMP)提供了明确的解释：

> 这个`incorrect` checksum是一个称为TCP checksum offloading的功能，这个发出的TCP数据包的checksum字段在通过操作系统时是没有预先计算但被设置成`0`，然后留给通过NIC网卡处理器的时候进行校验计算。

在[Wireshark FAQ](http://www.wireshark.org/faq.html#q10.1)提供了对数据包分析工具角度说明：

> 如果发送给运行Wireshrk服务器的数据包显示有TCP checksum错误，可能是因为使用的网卡配置了TCP checksum offloading功能。这意味着TCP checksum功能通过网卡添加到了数据包中，而不是通过操作系统的TCP/IP堆栈来添加。当在网卡接口上进行数据包捕捉时，通过主机发送的数据包是直接由操作系统在数据包捕捉接口上处理的，意味着此时数据包还没有添加一个TCP checksum。
>
> 解决的唯一方法是禁止TCP checksum offloading，但是在一些操作系统不允许这么操作，并且会导致明显的网络性能下降。然而，可以关闭Wireshark的TCP checksum error报告功能，这样它就不会在数据包有错误TCP checksum时拒绝执行TCP重组。设置方法是在WireShark的`Perferences`中，在`Protocols`列表中选择`TCP` ，然后关闭`Check the validity of the TCP checksum when possible`。也可以在命令行使用参数`-o tcp.check_checksum:false`

## 原理详解

大多数现代操作系统都支持网络卸载（network offloading）功能，即部分网络处理由网卡完成而不是由CPU处理。这样可以释放系统资源以便能够处理更多的连接。不过对于数据包捕捉分析会带来一些较为奇怪的结果或者丢失一些流量。

**`Checksum Offloading`**

在支持checksum offloading的系统中，IP,TCP和UDP checksum可以在传输到网线之前由网卡NIC来完成。此时在Wirshark中会提示数据包错误`[incorrect, should be xxxx (maybe caused by "TCP checksum offload"?)].`（tcpdump也有同样提示`cksum xxxx incorrect`）。抓包工具Wireshark/Tcpdump是在数据包被发送给网卡之前捕捉数据包的，此时它不会看到正确的checksum，因为此时尚未进行计算（因为checksum已经卸载到网卡，此时这个checksum字段会被填写为0）。这也就导致了抓包工具提示checksum错误的原因。

要通过抓包工具来观察数据包是否真的存在checksum错误，可以暂时关闭网卡的`checksum offload`功能，验证完成后再恢复网卡的`checksum offload`（关闭TCO会有性能问题）

**`Segmentation Offloading`**

以下图示显示了TCP/IP堆栈没有卸载的时候数据包，假设应用数据包(Application data)是7300字节，此时TCP将把应用数据包切分成5个分片（segments），这是因为以太网的最大传输单元（Maximum Transmission Unit, MTU）是`1500字节`，此外我们还要减去`20字节的IP头部`以及`20字节的TCP头部`，实际能够用于数据传输的TCP分片只有`1460字节`(也就是TCP最大分片大小，TCP Maximum Segment Size, MSS)。

![Wireshrk抓包](/img/network/packet_analysis/wireshark-capture-1.png)

当使用了网卡提供的`segmentation offloading`功能，操作系统就不会对应用数据（application data）进行分片，而是直接将一个大的TCP/IP包发送给驱动程序。此时TCP和IP头部实际上是一个临时头部。驱动程序会创建一个单一的巨大的以太网帧，此时这个巨大的以太网帧会被包捕捉工具（如Wireshark）捕捉到，然后再发送给物理网卡。最后，网卡才执行提以太网帧分片，此时网卡会把使用这个临时头部来创建真实的TCP/IP以太网头部并生成5个以太网帧，最后这5个以太网帧才发送到网络中。

![Wireshrk抓包](/img/network/packet_analysis/wireshark-capture-2.png)

上述过程，如果启用了`segmentation offloading`，则抓包工具wireshark只能捕捉到一个巨大的以太网帧（包含7300字节数据）

* Linux操作系统

检查`checksum offload`

```bash
ethtool --show-offload ethX
```

关闭`checksum offload`

```
ethtool --offload ethX rx off tx off
```

或者使用命令

```
ethtool -K ethX rx off tx off
```

在[When is full packet capture NOT full packet capture?](http://blog.securityonion.net/2011/10/when-is-full-packet-capture-not-full.html)中整理提供了非常好的说明

| NIC offload功能列表 | 说明 |
| ---- | --- |
| `tso` | [tcp-segmentation-offload](http://en.wikipedia.org/wiki/Large_segment_offload) TCP分片卸载 |
| `gso` | [genteric-segmentation-offload](http://lwn.net/Articles/188489/) 通用分片卸载 |
| `gro` | [generic-receive-offload](http://lwn.net/Articles/358910/) 通用接收卸载 |

例如使用`ethtool -k eth0`可能可以看到如下输出

```
Offload parameters for eth0:
rx-checksumming: on
tx-checksumming: on
scatter-gather: on
tcp-segmentation-offload: on
udp-fragmentation-offload: off
generic-segmentation-offload: on
generic-receive-offload: on
large-receive-offload: off
```

关闭`offload`设置的方法案例

```
ethtool -K eth0 rx off
ethtool -K eth0 tx off
ethtool -K eth0 sg off
ethtool -K eth0 tso off
ethtool -K eth0 ufo off
ethtool -K eth0 gso off
ethtool -K eth0 gro off
ethtool -K eth0 lro off
```

> 注意，上述设置是`flying`的，不是持久化设置。要持久化设置，需要修改网卡配置，例如RedHat操作系统的`/etc/sysconfig/network-scripts/ifcfg-eth0`配置

> Broadcom 早期的`tg3`的驱动可能在启用`tso`的时候会导致数据包不正确 - [Take care if using an older Broadcom tg3 driver + TSO enabled at your ESXi host](http://www.running-system.com/take-care-if-using-an-older-broadcom-tg3-driver-tso-enabled-at-your-esxi-host/)，在生产环境中也遇到过`tg3`启用`tso`之后导致内存分配错误

* Windows操作系统

在虚拟化环境中，Windows虚拟机启用TCP Offloading可能会存在一些问题，可以通过下面的方法来禁用Windows虚拟机TCP Offloading（物理服务器设置方法相同）

在Windows操作系统的控制面板（`Control Pannel`）中选择**`Network Settings > Change Adapter Settings`**，然后鼠标右击每个网卡，选择**`Networking`**菜单的**`Configure`**，然后点击**`Advanced`**面板，此时可以看到`TCP offload`相关设置（下图是Citrix adapter虚拟网卡）

![Windows中网卡TCP offloading](/img/network/packet_analysis/tcp_offloading_in_windows.png)

关闭TCP offload相关的以下选项，然后点击**`ok`**

```
IPv4 Checksum Offload
Large Receive Offload
Large Send Offload
TCP Checksum Offload
```

* Windows操作系统`Chimney Offload`操作方法

在Windows操作系统中检查tcp设置

```
netsh int tcp show global
```

关闭`chimney offload`

```
netsh int tcp set global chimney=disabled
```

开启`chimney offload`

```
netsh int tcp set global chimney=enabled
```

**`Chimney offloading`是一种通过网卡NIC卸载处理TCP连接的技术**，在启用了`chimney offloading`的Windows操作系统，可以通过命令

```
netstat -t
```

观察到如下输出

```
Active Connections

  Proto  Local Address          Foreign Address        State           Offload State

  TCP    127.0.0.1:52613        computer_name:52614       ESTABLISHED     InHost
  TCP    192.168.1.103:52614        computer_name:52613       ESTABLISHED     Offloaded
```

其中，第二行标记了`Offloaded`就是表示这个连接已经被网卡的Chimney offloading卸载了，这样系统可以承受更多的TCP连接。

# 参考

* [UDP / TCP Checksum errors from tcpdump & NIC Hardware Offloading](https://sokratisg.net/2012/04/01/udp-tcp-checksum-errors-from-tcpdump-nic-hardware-offloading/)
* [Segmentation and Checksum Offloading: Turning Off with ethtool](http://sandilands.info/sgordon/segmentation-offloading-with-wireshark-and-ethtool)
* [WireShark: CaptureSetup/Offloading](https://wiki.wireshark.org/CaptureSetup/Offloading)
* [When is full packet capture NOT full packet capture?](http://blog.securityonion.net/2011/10/when-is-full-packet-capture-not-full.html)
* [Disable TCP Offloading in Windows Server 2012](https://support.rackspace.com/how-to/disabling-tcp-offloading-in-windows-server-2012/)
* [Information about the TCP Chimney Offload, Receive Side Scaling, and Network Direct Memory Access features in Windows Server 2008](https://support.microsoft.com/en-us/kb/951037) 微软官方文档，提供了TCP Chimney Offload（也就是TCP连接的卸载功能）以及接收滑动窗口，网络直接内存访问的相关设置，对于Windows Server 2008操作系统的参考非常详尽

