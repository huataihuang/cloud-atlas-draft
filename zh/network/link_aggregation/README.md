# 链路聚合

链路聚合`link aggregation`是通过多种方式捆绑（聚合）多条网络链来增加比单条链路更大带宽，并且在某条链路故障时提供冗余。`LAG`(Link Aggregation Group)结合了多条物理端口来实现一个高带宽数据路基近南个，通过流量分布到组中多个成员端口来增加链接可靠性。

网络架构上可以在OSI模型的最低的三层的任意层来实现聚合：

* 物理层包括了电线、无线网络设备可以结合多个基带
* 数据链路层（如局域网的以太网帧或者广域网的多链路PPP，以太网MAC地址）通常可以在交换端口上聚合，可以是物理端口，也可以是操作系统的虚拟端口。
* OSI模型的网络层（第3层）可以使用[round-robin调度](https://en.wikipedia.org/wiki/Round-robin_scheduling#Data_packet_scheduling)，以及在数据包头部的字段上进行哈希值计算，或者同时结合两种方式。

捆绑多个接口的方式会共享一个逻辑地址（如IP）或者一个物理地址（如MAC地址），或者允许每个接口有自己的地址。这种方式要求链路的两头都使用相同的聚合方法。

## 链路聚合控制协议（Link Aggregation Control Protocol, LACP）

在IEEE标准中，链路聚合控制协议（Link Aggregation Control Protocol, LACP）提供了一种控制多个物理接口聚合成一个单一逻辑通道的方式。LACP通过发送LACP数据包给对端（直接连接的设备也实现LACP）允许网络设备协商出一个自动聚合的链路。

LACP功能和案例：
* 端口通道允许的最大聚合端口数：数值通常是1到8。一些设备的取值范围是1到4。（如Cisco 10000系列路由器）
* LACP数据包是在多播组MAC地址`01:80:c2:00:00:02`（`01-80-c2-00-00-02`）上发送
* 在LACP检测时：
  * LACP数据包每秒发送一次
  * 对于链路成员保持存活到机制（默认：慢速=30s，快速=1s）
* LACP可以具有端口负载均衡模式：
  * 链路(`link-id`)整数是在负载均衡中标记链路成员所使用的，取值范围是1到8
* LACP模式：
  * 主动端口：必须无条件激活LACP
  * 被动端口：在监测到LACP设备时必须激活LACP(这是默认状态)

## 经验

LACP工作的方式是通过在激活协议的所有链路中发送`LACPDUs`数据帧实现。如果它发现在另外一端的设备也激活了LACP，它就会在同一个链路中独立地发送`LACPDUs`数据帧来确保链路两头的设备检测到它们之间的多条链路，并且将这些链路聚合成一个单一的逻辑链路。

LACP可以通过两种方式配置：主动或者被动。在主动模式中，它将在配置好的链路中始终发送`LACPDUs`数据帧。然而在被动模式，它就表现为"只在被联系的时候通讯"，这种方式可以控制偶然发生的回环（例如其他设备处于激活模式）。

# Linux bonding驱动

Linux bonding驱动提供了将多个网络接口控制器（network interface controllers, NICs）聚合成单一逻辑绑定接口聚合2个货多个称为slave的NIC。现在主流发行版本使用模块方式集成bonding，并使用一个`ifenslave`的用户级别控制软件来实现管理。

## 驱动模式（Driver modes）

Linux bonding驱动的模式（网络接口聚合模式）是在bonding模块加载的时候传递的内核参数。可以通过`ismod`或`modprobe`命令的参数来传递，不过在Linux发行版中通常是通过配置文件。单个逻辑绑定的网卡接口特性依赖特定的bongding驱动模式。 **默认的bonding参数是`balance-rr`**

* Round-robin (balance-rr)

传输的数据包顺序从第一个可用NIC到最后一个。这个模式提供负载均衡和故障切换。

* Active-backup (active-backup)

在主备模式下，只有一块 NIC slave 是激活的。slave接口只在主接口故障时激活。单个逻辑bonding接口的MAC地址只在一个NIC接口上，这样可以避免网络交换机搞混。这个active-backup模式只提供故障切换。

* XOR (balance-xor)

传输的数据包基于源MAC地址和目的MAC地址的异或结果。这个XOR的负载均衡会使通讯两端的数据流始终选择相同的NIC。该模式提供负载均衡和故障切换。

* Broadcast (broadcast)

传输的网络数据包通过所有的网络接口。

* IEEE 802.3ad Dynamic link aggregation (802.3ad)(LACP)

创建共享相同速率和双工设置的聚合组。在符合802.3ad标准的激活聚合组中使用所有的slave网络接口。

* Adaptive transmit load balance (balance-tlb) 可变传输负载均衡

Linux bonding驱动模式不需要指定任何网络交换机支持。发出的网络数据包流量分布到当前负载（根据速率计算）所有的网络slave接口。进入的流量通过当前指定的slave网络接口。如果用于接收的接口故障，则其他slave接口接管故障接口的MAC地址。

* Adaptive load balancing (balance-alb)

针对IPv4流量在内包括传输负载均衡`balance-tlb`和接收负载均衡（`receive load balancing`，`rlb`），都不需要任何特殊的网络交换机。接收负载均衡是通过ARP协商来实现的。bonding驱动在接口拦截了外出的ARP响应数据包，并以逻辑接口中某个NIC slave的唯一硬件地址重写了源硬件地址。

# 一些概念

## 帧顺序

当负载均衡网络流量时，网络管理员通常希望避免以太网帧重排序。例如，TCP需要承受更高负载来处理乱序的数据包。避免乱序的目标可以通过将一个会话中所有数据帧都从相同的链路中发送。最常用的避免乱序的方法是采用三层哈希（L3 hashes），例如，基于IP地址，这样可以确保相同的流量总是从相同的物理连接中传输。然而，根据数据流不同，可能不能实现trunk上的平均分布。

## 最大吞吐量

在一个多网络交换拓扑中，多台交换机可能针对最大吞吐量优化，此时交换机配置成并行作为两个或多个系统之间的一个孤立网络。

## 厂商相关

微软的Windows从Windows 2012开始支持原生的网络聚合。对于之前的旧版本Windows Server，有些网卡厂商在设备驱动层提供了自己的多NIC聚合。例如，Intel提供了高级网络服务（Advanced Network Services, ANS）来绑定多个Intel百兆以太网千兆以太网。

Nvidia也支自家的Nvidia Network Access Manager。HP则允许bonding非以太网或者支持802.3ad with LACP的多重模式端口聚合。另外，在Windows XP SP3提供弄个了一个基础的3层聚合。

Broadcom通过BASP（Broadcom AdvancedServer 　Program）提供了Broadcom高级控制组件（Broadcom Advanced Control Suite, BACS），也提供了802.3ad静态LAGs。

Citrix XenServer和VMware ESX也原生支持链路聚合。XenServer在交换机不仅支持static-LAG也支持LACP。


# 参考

* [Link aggregation](https://en.wikipedia.org/wiki/Link_aggregation)
* [LAG (Link Aggregation Group) & LACP (Link Aggregation Control Protocol) – An Intro](http://www.excitingip.com/3015/lag-link-aggregation-group-lacp-link-aggregation-control-protocol-an-intro/)
* [Link Aggregation and LACP basics](https://www.thomas-krenn.com/en/wiki/Link_Aggregation_and_LACP_basics)
* [IEEE802:Link Aggregation Control Protocol](http://www.ieee802.org/3/ad/public/mar99/seaman_1_0399.pdf)
* [Configuring an LACP EtherChannel](https://www.freeccnaworkbook.com/workbooks/ccna/configuring-etherchannel-utilizing-lacp)
* [Cisco:Link Aggregation Control Protocol (LACP) (802.3ad) for Gigabit Interfaces](http://www.cisco.com/c/en/us/td/docs/ios/12_2sb/feature/guide/gigeth.html)
* [Juniper:Understanding Link Aggregation Control Protocol](http://www.juniper.net/documentation/en_US/junos12.1/topics/concept/layer-2-lacp-security-understanding.html#jd0e57)
