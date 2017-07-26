在为选择部署的架构安装了每个节点的操作系统之后，需要配置网络接口。建议禁止所有自动网络管理工具并手工编辑发行版本（[文档](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Networking_Guide/sec-Using_the_Command_Line_Interface.html)）相应的配置文件。

所有节点需要Internet访问用于管理软件包安装，如安全更新，DNS以及NTP。大多数情况，节点需要通过管理网络接口访问Internet。为强调网络隔离的重要性，案例架构中使用私有地址空间用于管理网络，并架设物理网络架构通过NAT或其他方式提供Internet访问。案例架构使用可路由IP地址空间用于provider（外部）网络病假设物理网卡接口提供直接Internet访问。

在provider网络架构，所有实例是直接连接到provider网络。而在self-service（私有）网络架构，实际是连接到一个self-service活着provider网络。self-service网络可以完整属于OpenStack或者使用NAT通过provider网络部分使用外部网络。

![RHEL OpenStack Network Layout](../../../../img/iaas/openstack/redhat/environment/networklayout.png)

以上案例中假设使用如下网络：

* 管理网络使用 10.0.0.0/24 并使用网关 10.0.0.1

这个网络需要使用网关来提供Internet访问以用语所有节点的管理工作，例如软件包安装，安全更新，NDS和NTP

* provider网络使用203.0.113.0/24 并使用网关 203.0.113.1

这个网络使用网关来提供Internet访问用于OpenStack环境中的实例

> 实际网络架构需要修改这些网段和网关。

> 注意：发行版默认激活了防火墙限制网络，在安装过程中，一些步骤需要关闭或者修改防火墙，否则会失败。

# 控制节点

## 配置网络接口

* 配置第一个接口作为管理接口

IP address: 10.0.0.11

Network mask: 255.255.255.0 (or /24)

Default gateway: 10.0.0.1

* provider接口使用一个特定配置不需要指定IP地址，配置第2个接口作为provider接口：

替换`INTERFACE_NAME`成实际网络接口名字，例如`eth1`或`ens224`：

编辑 `/etc/sysconfig/network-scripts/ifcfg-INTERFACE_NAME` 包含以下配置，注意不要修改`HWADDR`和`UUID`值：

```
DEVICE=INTERFACE_NAME
TYPE=Ethernet
ONBOOT="yes"
BOOTPROTO="none"
```

重启系统（或者`systemctl restart network`，不过需要带外访问避免网络断开）激活配置修改

## 配置名字解析

* 设置主机名`controller`

```
hostnamctl set-hostname controller
```

* 编辑`/etc/hosts`文件包含以下配置

```
# controller
10.0.0.11       controller

# compute1
10.0.0.31       compute1

# block1
10.0.0.41       block1

# object1
10.0.0.51       object1

# object2
10.0.0.52       object2
```

> **`警告`**
>
> 一些发行版本在`/etc/hosts`文件中加入了一个扩展的解析实际主机名到回环地址如`127.0.0.1`上，需要去除或者移除这个解析。但是**`不要删除掉127.0.0.1这个配置项`**。

# 计算节点

## 配置网络接口

* 配置第一个网络接口作为管理接口

IP address: 10.0.0.31

Network mask: 255.255.255.0 (or /24)

Default gateway: 10.0.0.1

> 其余计算节点将使用 10.0.0.32, 10.0.0.33 以此类推。

* provider接口使用特定配置所以不需要指定IP地址，替换`INTERFACE_NAME`成实际网络接口名字，例如`eth1`或`ens224`：

编辑 `/etc/sysconfig/network-scripts/ifcfg-INTERFACE_NAME` 包含以下配置，注意不要修改`HWADDR`和`UUID`值：

```
DEVICE=INTERFACE_NAME
TYPE=Ethernet
ONBOOT="yes"
BOOTPROTO="none"
```

重启系统激活配置修改。

## 配置名字解析

* 设置主机名`compute1`

```
hostnamctl set-hostname compute1
```

* 编辑`/etc/hosts`文件包含以下配置

```
# controller
10.0.0.11       controller

# compute1
10.0.0.31       compute1

# block1
10.0.0.41       block1

# object1
10.0.0.51       object1

# object2
10.0.0.52       object2
```

# 设置存储节点（可选）

设置方法同上

# 验证网络连接



# 参考

* [OpenStack Install Guide RDO - Environment: Host networking](https://docs.openstack.org/ocata/install-guide-rdo/environment-networking.html)