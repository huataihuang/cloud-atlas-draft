# 架构案例

> 本架构案例采用至少2个nodes(hosts)来启用一个基本的虚拟机。可选的块存储服务或对象存储需要更多的节点。
>
> 本架构案例是为了体验OpenStack功能的最小配置，不适合生产环境。详细架构设计参考[Architecture Design Guide](https://docs.openstack.org/arch-design/)

在最小化的生产架构中使用如下方式：

* 网络agent位于controller节点，替代一个或多个分离的网络节点
* overlay(tunnel)流量的自服务网络穿过管理网络替代了分离的网络

![RHEL OpenStack Network Archecture](../../../../img/iaas/openstack/redhat/architecture/hwreqs.png)

* Controller

controller节点运行 身份服务（identity service），镜像服务（image service）,管理计算节点，管理网络，以及不同网络代理和仪表盘（Dashboard）。它以运行了包括SQL数据库，消息队列和NTP。

可选方式下，控制器节点也可以运行块存储，对象存储，编排器(Orchestration)，以及遥测（Telemetry）服务

控制节点至少要求2个网卡。

* Compute

计算节点运行hypervisor管理实例。默认，Compute节点使用KVM hypervisor。计算节点也运行一个网络服务代理来连接实例道虚拟网络病提供通过安全组为实例提供防火墙。

你可以部署多个计算节点，每个节点需要至少2个网卡接口。

* 块存储

可选的块存储节点包含磁盘用于块存储和共享的文件系统服务提供给实例使用。

本案例为了简化，在计算节点间服务数据流并且节点使用管理的网络。在生产环境中仄部署独立的存储网络来提高性能和安全性。

可以部署多个块存储节点。每个节点至少要求一个网络接口。

* 对象存储

可选的对象存储节点包含了对象存储用于存储账号，容器和对象的磁盘。

本案例为了简化，在计算节点间服务数据流并且节点使用管理的网络。在生产环境中仄部署独立的存储网络来提高性能和安全性。

可以部署多个块存储节点。每个节点至少要求一个网络接口。

# 网络

请使用以下虚拟网络方案中的一个

## 网络可选方案一：提供方网络（provider networks）

provider networks选项部署OpenStack网络服务作为最简单的方式：以二层网络（交换网络）服务以及VLAN网络分段。本质上，provider networks是将虚拟网络桥接到物理网络，并依赖物理网络的三层路由服务。另外，一个DHCP服务提供了实例的IP地址信息。

> **`警告`**
>
> provider network缺乏自服务（私有）网络和三层（路由）服务以及高级的类似[LBaaS](https://docs.openstack.org/ocata/install-guide-rdo/common/glossary.html#term-load-balancer-as-a-service-lbaas)和[FWaaS](https://docs.openstack.org/ocata/install-guide-rdo/common/glossary.html#term-firewall-as-a-service-fwaas)高级服务。

![RHEL OpenStack Network Archecture](../../../../img/iaas/openstack/redhat/architecture/network1-services.png)

## 网络可选方案二：自服务网络（self-service networks）

self-service网络方案在provider network基础上增加了三层（路由）服务以激活[self-service](https://docs.openstack.org/ocata/install-guide-rdo/common/glossary.html#term-self-service)使用类似[VXLAN](https://docs.openstack.org/ocata/install-guide-rdo/common/glossary.html#term-virtual-extensible-lan-vxlan) overlay segmentation方式。本质上，self-service网络通过NAT提供了虚拟网络到物理网络的访问。此外，self-service网络害提供了高级服务，如LBaaS和FWaaS。

![RHEL OpenStack Network Archecture](../../../../img/iaas/openstack/redhat/architecture/network2-services.png)

# 参考

* [OpenStack Doc: Example architecture](https://docs.openstack.org/ocata/install-guide-rdo/overview.html#example-architecture)