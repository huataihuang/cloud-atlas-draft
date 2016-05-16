# XenServer网络术语

* `PIF`

`PIF`表示物理网卡，XenServer基于Linux，意味着每个物理网卡通常使用Linux的命名`ethX`。XenServer为每个`ethX`设备创建并指定一个`PIF`对象。每个`PIF`有自己唯一的ID，`uuid`来标识。

* `VIF`

虚拟机使用虚拟NIC连接网络，也就是虚拟网卡。虚拟网卡使得虚拟机能够发送和接收网络流量，并且虚拟网卡有自己的IP地址和MAC地址。

* `Network`

在Xen虚拟环境，网络通常是一个具有交换功能的虚拟以太网交换机，这个虚拟交换机有自己唯一的`uuid`和名字。在XenServer标准安装过程中通常会设置一个虚拟交换机以便虚拟机通过它们的`VIF`连接。虚拟交换机可以通过`PIF`提供一个连接外部网络的上联。

```bash
brctl show
```

显示输出虚拟交换机以及

```bash
bridge name		bridge id			STP enabled	interfaces
xenbr0			8000.d89d6724d840	no			eth0	
												vif10.0
												vif8.0
												vif7.0
												vif2.0
												vif1.0										
```

* `Single-Server Private networks` （单服务器私有网络）

单服务器私有网络不需要连接到物理网卡，用于在独立的host主机上提供虚拟机之间通讯，但不提供访问外部网络。也就是常说的`host`网络。

* `Cross-Server Private networks` （跨服务器私有网络）

跨服务器私有网络扩展了单个服务器的私有网络，允许通过`vSwitch`连接不同host主机上的虚拟机。

* `Extenal networks` （扩展网络）

扩展网络通过物理网卡提供连接，并提供虚拟机之间和物理网卡接口之间的网桥，以连接虚拟机到外部真实网络。

* `Bonded networks` （多网卡捆绑网络）

在多个网卡上创建一个bond提供单一的，高性能通道连接虚拟机和外部网路。

# VIF和扩展网桥

使用`brctl show`命令可以显示虚拟网桥`xenbr0`提供了物理网卡`eth0`连接物理服务器，以及多个虚拟网卡`vif`连接到这个虚拟网桥`xenbr0`，这样提供了虚拟机访问外部网络的功能

```bash
bridge name		bridge id			STP enabled	interfaces
xenbr0			8000.d89d6724d840	no			eth0	
												vif10.0
												vif8.0
												vif7.0
												vif2.0
												vif1.0										
```

# XenServer如何处理VM流量


![xen处理vm网络流量](/img/virtual/xen/architecture/xen_handle_vm_traffic.png)

* 物理网卡`PIF`进入混杂模式（`promiscuous mode`），即所有通过网络的数据包都接受
* 数据包被转发给虚拟交换机`xenbr0`
* 虚拟交换机将查看目标MAC地址并找出连接在虚拟交换机上的`VIF`
* 一旦找到了对应的VIF，Xen就会吧数据包传递给虚拟机

# Bonds和VLANs

Bonding提供了多块网卡配置成逻辑网卡的功能，提供了冗余和通道聚合，主要分为：`Active-backup`和`Balance-slb (active-active)`

VLANs提供了流量隔离功能，每个VLAN需要创建独立的虚拟网桥。VLAN配置对于guest vm是透明的，VLAN的taging/untagging是由内核完成的。

在Xen中使用VLAN需要配置虚拟网卡加上特定的VLAN tag，并且对应的（物理）网络交换机需要符合以下要求：

* 连接Xen的交换机端口必须配置成trunk port
* 交换机端口必须配置成 `802.1q`
* trunk端口不能配置Port security
* 作为trunk的端口必须设置成原生VLAN：默认使用1

详细配置参考 [Xen多个VLANs的网络配置](../network/xen_multiple_vlans.md)

# 参考

* [XenServer Networking](http://www.slideshare.net/asrarkadri/networking-in-xenserver-24691440)
* [XenServer VLAN Networking](http://support.citrix.com/article/CTX123489)
* [Xen Networking](http://wiki.xenproject.org/wiki/Xen_Networking) - 这篇是Xen开源官方网站wiki，非常详尽的解释了Xen网络的工作原理