# 检查网卡接口和IP

默认系统安装的工具`ip`：

```
ip addr list
```

也可以使用 `ip a` 可以显示网卡信息

# 配置地址

网卡配置信息位于 `/etc/sysconfig/network-scripts/` 目录下的 `ifcfg-INTERFACENAME` ，这个`INTERFACENAME`就是接口命名，例如网卡接口 `ens33` 则配置文件就是 `ifcfg-ens33`。

当系统默认安装时，采用的是DHCP协议，即配置内容：

```
BOOTPROTO=dhcp
```

当配置静态IP时，需要将这行配置修改成如下

```
BOOTPROTO=static
```

然后添加设置静态IP内容如下：

```
IPADDR=192.168.161.3
NETMASK=255.255.255.0
GATEWAY=192.168.161.2
DNS1=192.168.161.2
#DNS2=1.1.1.1
#DNS3=8.8.8.8
```

注意：这里的案例是在VMware的虚拟机中运行，采用了NAT模式。在VMware的NAT环境中，位于host端的IP地址是`192.168.161.1`，而在虚拟机端的默认网关IP地址是`192.168.161.2`。这里就给虚拟机配置`192.168.161.3`，并指向默认网关的DNS。

* 重启网络服务生效：

```
sudo systemctl restart network
```

# 参考

* [How to configure a static IP address in CentOS 7](https://www.techrepublic.com/article/how-to-configure-a-static-ip-address-in-centos-7/)