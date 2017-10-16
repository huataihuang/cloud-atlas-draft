在单台物理主机（X220笔记本）上构建开发、测试、模拟环境，需要使用虚拟化技术

# 安装KVM

* 安装纯字符终端管理工具

```
sudo yum install libvirt virt-install qemu-kvm
```

> 默认安装会启用一个`NAT`模式的bridge`virbr0`

启动激活`libvirtd`服务

```
systemctl enable libvirtd && systemctl start libvirtd
```

> 由于安装操作系统时，给`/hom`目录分配了最大的空见，所以这里创建一个images软链接到`/home/libvirt/images`，以便有足够空见存放镜像：

```
mkdir -p /home/libvirt/images
rm -f /var/lib/libvirt/images
ln -s /home/libvirt/images /var/lib/libvirt/images

```

# 安装Guest OS

* 安装CentOS 7 

```
virt-install \
  --network bridge:virbr0 \
  --name centos7 \
  --ram=2048 \
  --vcpus=1 \
  --disk path=/var/lib/libvirt/images/centos7.img,size=10 \
  --graphics vnc \
  --cdrom=/var/lib/libvirt/images/CentOS-7-x86_64-Minimal-1708.iso
```

以上安装程序启动了vnc访问接口，所以客户端先通过ssh端口转发方式创建访问vnc的端口映射，即在本地客户端电脑执行以下命令

```
ssh -L 5900:127.0.0.1:5900 -N -f <SERVER_IP>
```

> 这里`<SERVER_IP>`是运行KVM的服务器，端口`5900`是VNC访问端口，默认从5900开始，每个新增qemu进程开启的vnc端口依次增减，如5900,5901,5902。

# 虚拟机网络

为了能够模拟部署集群，并且采用固定的虚拟机ip地址，参考 [KVM libvirt静态IP地址和端口映射](../virtual/kvm/startup/in_action/kvm_libvirt_static_ip_for_dhcp_and_port_forwarding)设置静态虚拟机IP（虚拟化使用dnsmasq使用静态IP）

在NAT模式下，libvirt使用了内建的`dnsmasq`来提供DHCP和DNS解析，可以通过在virsh中设置固定的DHCP IP地址和虚拟机MAC地址绑定来确保每次分配给vm相同的IP地址。

```bash
virsh dumpxml centos7 | grep 'mac address'
```

显示输出：

```xml
<mac address='52:54:00:82:87:0e'/>
```

* 编辑网络

```bash
virsh net-list
```

显示输出网络如下：

```
 Name                 State      Autostart     Persistent
----------------------------------------------------------
 default              active     yes           yes
```

```
virsh net-edit default
```

编辑`<dhcp>`段落

```
<dhcp>
  <range start='192.168.122.100' end='192.168.122.254'/>
  <host mac='52:54:00:82:87:0e' name='centos7' ip='192.168.122.11'/>
</dhcp>
```

> 默认dhcp范围是`<range start='192.168.122.2' end='192.168.122.254'/>`，这里修订从100开始，前面的ip地址段保留为静态分配。

配置修改生效：

```
virsh net-destroy default
virsh net-start default
```

注意：重建`default`网络会导致虚拟机网路不通，这是因为这些虚拟机的虚拟网卡没有连接到重建的虚拟网桥上，需要重新链接虚拟网卡到网桥：

`brctl show`检查网桥名字，可以看到是`virbr0`

```
#brctl show
bridge name	bridge id		STP enabled	interfaces
virbr0		8000.525400fa6cfe	yes		virbr0-nic
```

物理服务器上通过`ifconfig -a`可以看到所有的虚拟机的虚拟机网卡，例如`vnet0`、`vnet1`...，执行以下命令添加连接

```
brctl addif virbr0 vnet0
brctl addif virbr0 vnet1
...
```

注意：上述重建网桥并重连虚拟网卡后，已经生效了dnsmasq静态分配IP的方式，但是虚拟机内部还是需要重启网卡或重启虚拟机。

> 另外一种比较简单的方法是，定制虚拟机`virsh edit centos7`，修订虚拟机的mac地址。在dnsmasq中可以批量顺序设置好mac地址配置。这样可以避免多次重启虚拟网络。

# 虚拟机内部配置

由于默认的网络是NAT模式，所以ssh登录虚拟机要么在物理服务器上做端口映射，要么通过物理服务器转跳。不管怎样，为方便管理，登录端的主机（我选择物理服务器作为转跳服务器，类似于整个虚拟机集群的管理机）的公钥需要分发到虚拟机内部。

帐号设置方法同[ssh帐号和sudo设置](account_ssh_and_sudo)，完成初始帐号设置。

# clone虚拟机

在完成了初始模板虚拟机之后，并不建议直接使用，而是采用clone方法来完成后续虚拟机的创建，这样可以保持最初的纯净版本，以便构建不同的开发环境。

> 实际开发环境采用KVM虚拟机内部嵌套Docker，采用Docker来快速部署大量的不同操作系统环境，实现开发环境切换。

# 参考

* [在CentOS上部署kvm](../virtual/kvm/startup/in_action/deploy_kvm_on_centos)
* [KVM libvirt静态IP地址和端口映射](../virtual/kvm/startup/in_action/kvm_libvirt_static_ip_for_dhcp_and_port_forwarding)
* [Clone KVM虚拟机实战](../virtual/kvm/startup/in_action/clone_kvm_vm_in_action)