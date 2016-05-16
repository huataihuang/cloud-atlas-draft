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


![xen处理vm网络流量](img/virtual/xen/architecture/xen_handle_vm_traffic.png)

# 参考

* [XenServer Networking](http://www.slideshare.net/asrarkadri/networking-in-xenserver-24691440)