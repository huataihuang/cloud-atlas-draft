有不同的方法可以将虚拟连接到外部网络：

* 默认的网络配置称为`Usermode Networking`。使用NAT方式通过主机网卡连接外部网络
* 可以可以配置`Bridged Networking`来允许外部主机直接访问guest操作系统服务

> 详细可以参考 [libvirt Networking Handbook](https://jamielinux.com/docs/libvirt-networking-handbook/)



# 参考

* [Networking](https://help.ubuntu.com/community/KVM/Networking)