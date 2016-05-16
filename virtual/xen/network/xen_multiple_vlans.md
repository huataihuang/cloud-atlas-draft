# 设置交换接口

使用 `brctl addbr <brname>` 来创建交换接口

```bash
brctl addbr xenbr2
brctl addbr xenbr10
brctl addbr xenbr20
brctl addbr xenbr100
brctl addbr xenbr200
```

上述命令也可以通过启动脚本来创建，脚本名字为 `/etc/sysconfig/network-script/ifcfg-<brname>`。例如`/etc/sysconfig/network-scripts/ifcfg-xenbr2`对应创建VLAN2:

```bash
DEVICE=xenbr2
BOOTPROTO=static
IPADDR=192.168.0.10
NETMASK=255.255.0.0
ONBOOT=yes
TYPE=Bridge
```

# 设置VLAN接口并添加到已经存在的交换接口上

通过`vconfig add <ifname> <vlan>`可以使用802.1q标记的接口配置VLAN。此时会激活虚拟接口名字 `<ifname>.<vlan>`

* 所有发送到这个接口的流量将添加VLAN标记
* 所有从接口`<ifname>`接收的流量将带有一个`802.1q`VLAN标记，然后被`untagged`并由这个接口接收

> 上述描述即表示在VLAN网络中，VLAN接口外部的网络流量必须是带有VLAN tag的，经过VLAN接口会进行tag（外出离开物理服务器）和untag（进入vm）

```bash
vconfig add eth0 2
vconfig add eth0 10
vconfig add eth0 20
vconfig add eth0 100
vconfig add eth0 200
```

一旦VLAN接口就绪，就可以将VLAN接口添加到相应的虚拟交换机接口，使用命令`brctl addif <brname> <ifname>.<vlan>`

```bash
brctl addif xenbr2 eth0.2
brctl addif xenbr10 eth0.10
brctl addif xenbr20 eth0.20
brctl addif xenbr100 eth0.100
brctl addif xenbr200 eth0.200
```

上述将新建的VLAN接口添加到现有的网桥接口也可以通过一个名为`ifcfg-<ifname>.<vlan>`配置来完成，例如`/etc/sysconfig/network-scripts/ifcfg-eth0.2`

```bash
DEVICE=eth0.2
BOOTPROTO=none
ONBOOT=yes
TYPE=Ethernet
VLAN=yes
BRIDGE=xenbr2
```

# 避免Xen重新配置网络

由于上述已经手工配置了网络（或者通过系统配置完成网络配置），所以还需要避免Xen重新配置网络。也就是在`/etc/xen/xend-config.sxp`中注释掉以下配置行，配置类似如下

```bash
#(network-script network-bridge)
#(network-script network-route)
#(network-script network-nat)
```

# 参考

* [Xen network configuration and multiple VLANs](https://blog.felipe-alfaro.com/2006/07/21/xen-network-configuration-and-multiple-vlans/)
* [Using VLANS with XEN](http://wuerlim.wustl.edu/documents/xen-vlan.txt)