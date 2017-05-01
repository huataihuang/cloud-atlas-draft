# 异常问题

线上反馈集群虚拟机服务器，有部分vm的nginx的RT监控显示间歇性毛刺。从监控观察比较有规律，大约每个小时出现一次，RT值从个位数突然飙升到100+，然后又恢复正常。

运维的同学最初怀疑是定时任务影响，但是对比了正常的vm和异常的vm，其定时任务是一致的。并且反馈最近也没有做过什么变更。所以想从虚拟化底层排查，看看是否存在底层定时任务影响。

不过，在检查了物理服务器的性能负载、定时任务以及迁移掉其他vm排除影响之后，异常vm依然存在RT周期性毛刺。

# TCP Retransmission

在网络环境中，数据包丢失是非常常见的事情。TCP协议有内建的处理机制来确保网络数据传输正确。但是，如果看到大量的TCP重传（TCP Retransmission），则往往表示存在异常。

> 当数据发送方没有接收到接收方的ACK，就会`TCP Retransmission`。
>
> 虽然很多时候是由于网络链路问题，但是也有可能是服务器压力过大或者服务器端网卡、驱动等主机故障导致。所以，在监控中出现`tcp retry`告警时，不要轻易判断是网络故障，一定要对全链路进行分析。
>
> 作为起步，可以先通过分析应用日志（包含和哪些IP的RT时间变长）以及网络抓包（分析和哪些IP存在`Retransmission`），这样可以缩小排查范围，逐步定位故障根源。

# TCP Restransmission类型

在Wireshark中，根据特性有几种TCP重传的分类。以下是几种TCP重传的分类以及原理简述：

* `TCP Retransmission` - 这是一种单纯的重传（`plain-Jane retransmission`）。Wireshark注意到在TCP会话中一个数据包的序列数值和数据，然后又注意到另外一个数据包具有相同的序列号和数据。这就是在发送端一个重传时间到期的典型发送。
* `TCP Fast Retransmission` - 主机在检测到原始数据包丢失以后立即重新发送数据包，而不是等待完整的重传计时器到期。通常，这是通过发送方从接收方收到3个相同序列号的重复ACK就会触发TCP Fast Retransmission。你可能会看到在较差的SPAN配置中 我ireshark接收到重复数据包。
* `TCP Spurious Retransmission`（虚假重传） - 从Wireshark 1.12开始，可以识别出TCP虚假重传事件。 这标志着发送端发出一个数据重传，实际上已经被接受者声明过（ACK, acknowledged）。由于一些原因，发送方认为一个数据包已经丢失，所以重新发送。

注意：实际上网络中随时都可能在发生TCP Restransmission，TCP协议通常会处理一些数据包丢失。但是大量和频繁的TCP重传可能是网络链路、服务器负载性能、网卡故障等等的影响。出现影响应用服务时需要具体分析和排查。

# TCP Retransmission案例分析

异常虚拟机`192.168.1.134`抓包显示TCP Restransmission一直存在，即使监控只显示偶然出现0.1%的TCP重传。

> 这里案例假设异常虚拟机IP地址 `192.168.1.134`

通过tcpdump可以将虚拟机素有数据包保存下来，再通过wireshark的export模式查找TCP Retransmission来找出TCP重传的根源：

```
sudo tcpdump -i eth0 -s 0 -xX -n -w 192.168.1.134.pcap host 192.168.1.134
```

# Wireshark分析

## Wireshark专家模式

Wireshark有一个非常有用的功能是"Display Filter Expression"，其中的`tcp.analysis.retransmission - Expert Info`对于TCP网络重传分析功能：

点击`display filter`过滤设置的`Expression...`按钮，选择

![TCP重传分析](../../../img/network/packet_analysis/wireshark/wireshark_tcp_analysis_retransmission.png)

然后点击执行按钮，wireshark就会根据显示规则来过滤数据包显示。

![TCP重传分析](../../../img/network/packet_analysis/wireshark/tcp_retransmission.png)

## wireshark数据包输出保存

wireshark提供了将过滤分析的数据包按照一定条件过滤（切片）输出保存，方便以后的分析：

* 按照过滤选择出的数据包输出保存（例如过滤TCP重传包）
* 按照时间范围选择的数据包输出保存（例如故障前后数分钟范围内数据包）

选择菜单 `File -> Export Specificed Packets...`

![输出指定数据包](../../../img/network/packet_analysis/wireshark/export_specificed_packets.png)

## wireshark IP列表输出保存

对于抓取的数据包，可以使用`tshark`命令把IP列表输出成文本，以便分析：

```
tshark -r vm_192.168.1.134_tcp_restransmission.pcap -T fields -e ip.src -e ip.dst > vm_192.168.1.134_tcp_restransmission_ip_list.txt
```

这样在输出文本中得到IP列表，进行滤重计数检查确定ip。

> 案例中出现重传的IP列表中排除了日志服务器（日志服务器非常繁忙，容易出现响应缓慢引起TCP重传，但不影响服务），最后对比多个异常vm共同出现TCP重传的对端IP地址是LVS负载均衡的VIP(对应WEB服务)。后续则通过排查LVS负载均衡和后端real server情况来进一步定位故障原因。

# 参考

* [The TCP Retransmission Flavors of Wireshark](http://www.lovemytool.com/blog/2014/09/the-tcp-retransmission-flavors-of-wireshark-by-chris-greer.html)
* [Dump list of unique IP's](https://ask.wireshark.org/questions/12963/dump-list-of-unique-ips)