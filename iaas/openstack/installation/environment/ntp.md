在部署OpenStack之前需要部署Chrony，一个NTP的丝线，以便能够同步所有节点的服务。建议配置controller节点引用较精确（更低层）服务器其他节点则引用controller节点。

# Controller节点

## 安装和配置组件

* 安装软件包

```
yum install chrony
```

* 编辑`/etc/chrony.conf`配置修改

```
server NTP_SERVER iburst
```

将`NTP_SERVER`替换成实际的ntp服务器名或IP，并且这个`server`配置支持多个源配置（多行）。

* 编辑`/etc/chrony.conf`配置修改允许其他节点访问这个ntp服务器

```
allow 10.0.0.0/24
```

> 这里允许访问的客户端IP地址要根据实际情况配置

* （可选）如果服务器以前配置过ntpd服务，则关闭ntpd服务

```
systemctl stop ntpd
systemctl disable ntpd
```

* 启动chronyd NTP服务

```
systemctl enable chronyd.service
systemctl start chronyd.service
```

# 其他节点

## 安装和配置组件

* 安装软件包

```
yum install chrony
```

* 编辑`/etc/chrony.conf`配置修改

```
server controller iburst
```

> 其他节点都只配置一个 NTP服务器，就是指向`controller`也就是控制节点上运行的chronyd NTP服务。

* 启动chronyd NTP服务

```
systemctl enable chronyd.service
systemctl start chronyd.service
```

# 验证操作

在近一步配置之前建议先验证NTP同步是否正常

* 在 `controller` 和 `computeX` 节点执行

```
chronyc sources
```

可以分别看到显示的NTP服务器名称或IP地址

# 参考

* [OpenStack Install Guide RDO - Environment: Network Time Protocol (NTP)](https://docs.openstack.org/ocata/install-guide-rdo/environment-ntp.html)