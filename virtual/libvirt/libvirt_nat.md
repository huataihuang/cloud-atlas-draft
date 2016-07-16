默认安装`libvirt`的时候，启动了NAT网络网桥`virtbr0`，并相应启动了dnsmasq服务。不过，对于线上生产环境，不需要使用NAT的话，可以删除掉这个无用网桥。

```
$ifconfig
...

virbr0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 192.168.122.1  netmask 255.255.255.0  broadcast 192.168.122.255
        ether 82:6e:11:03:1f:62  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

$brctl show
bridge name	bridge id		STP enabled	interfaces
virbr0		8000.000000000000	yes
```

参考[Linux KVM: Disable virbr0 NAT Interface](http://www.cyberciti.biz/faq/linux-kvm-disable-virbr0-nat-interface/) 关闭

* 销毁默认网络`virtbr0`

```
sudo virsh net-destroy default
```

显示输出

```
Network default destroyed
```

> 此时再使用 `ifconfig` 查看，可以看到 `virbr0` 已经销毁

* 持久化关闭`virtbr0`

```
sudo virsh net-undefine default
```

显示输出

```
Network default has been undefined
```

* 重启`libvirt`服务

```
sudo systemctl restart libvirtd.service
```

> 完成后检查一下`libvirtd`，可以看到进程启动时间已经是当前时间，并使用`systemctl status`确认一下启动日志

```
sudo systemctl status libvirtd.service
```

# 修改`virbr0`的网段

如果需要修改`virbr0`的IP地址，可以采用如下方法：

```
sudo cp /var/lib/libvirt/network/default.xml /tmp/default.xml
sudo vi /tmp/default.xml # edit the ip address
sudo virsh net-destroy default
sudo virsh net-define /tmp/default.xml
sudo virsh net-start default
```

# 参考

* [What is the virbr0 interface used for?](http://askubuntu.com/questions/246343/what-is-the-virbr0-interface-used-for)