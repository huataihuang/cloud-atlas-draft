> 本章节根据 Red Hat产品手册 [Director Installation and Usage](https://access.redhat.com/documentation/en/red-hat-openstack-platform/10/paged/director-installation-and-usage/) 翻译整理

Red Hat OpenStack Platform director是一个安装和管理完整的OpenStack环境的工具集。它主要基于OpenStack TripleO项目，即"OpenStack-On-OpenStack"。这个项目充分利用了OpnStack组件的优点来安装一个完整的OpenStack环境。其包括提供和控制基本系统（control bare metal systems）来作为OpenStack节点的新型OpenStack组件。它提供了一个简单安装完整Red Hat OpenStack平台环境的简洁和鲁棒的方法。

Red Hat OpenStack Platform director使用两个主要概念：底层云安装和配置上层云。

* undercloud(底层云)
* overcloud(上层云)

![Red Hat OpenStack Platform director概念](../../../../img/iaas/openstack/redhat/architecture/undercloud_overcloud.png)

# 底层云（undercloud）

底层云是主要的director节点。它是一个单一系统的OpenStack安装，包含了提供和管理OpenStack节点来构建OpenStack环境（上层云）组件的安装。这些涌来构建底层云的组件提供了多个功能：

* 环境计划

底层云为用户提供了创建和设置一系列节点角色的规划功能。底层云包括了诸如计算节点，控制器以及不同的存储角色的默认节点集合，不过也提供了用户自定义角色的功能。实际上，你可以选择每个节点角色的OpenStack平台服务，因为director提供了一种模型化新节点类型或隔离各自煮鸡蛋系列组件的方法。

* 裸金属系统(Bare Metal System)控制

底层云使用带外管理接口（out-of-band management interface），即IPMI（智能平台管理接口，Intelligent Platform Management Interface），用于管理每个节点的电源和一个基于PXE基础服务来发现硬件属性并安装OpenStack到每个节点。这为OpenStack节点提供了一个bare metal systems。完整的电源管理驱动支持列表参考 [Appendix B, Power Management Drivers](https://access.redhat.com/documentation/en/red-hat-openstack-platform/10/paged/director-installation-and-usage/appendix-b-power-management-drivers)

* 编排（Orchestration）

底层云提供了一系列作为环境设置计划的YAML模版。底层云导入这些计划并按照这些指示来完成创建OpenStack环境。这个计划也包括了在环境创建过程中定制的交互设置（意译，原文为"The plans also include hooks that allow you to incorporate your own customizations as certain points in the environment creation process." ）

* 命令行工具和Web UI

Red Hat OpenStack Platform director通过一个终端命令接口或web用户接口来执行底层云功能。

* 底层云组件

底层云使用OpenStack组件来作为基本工具集，包括以下组件：

* OpenStack Identity (keystone) - 提供director组件的验证和授权
* OpenStack Bare Metal (ironic) 和 OpenStack Compute (nva) - 管理bare metal节点
* OpenStack镜像服务 (glance) - 存储镜像用于写入到原始服务器
* OpenStack编排(Orchestration)服务 (heat) 和 Puppet - 在 director 完成了上层云镜像写入到磁盘后提供了节点编排和配置节点
* OpenStack远程监控 (ceilometer) - 执行监控和数据搜集，包括：
  * OpenStack Telemetry Metrics (gnocchi) - 为metrics提供一个时间序列数据库
  * OpenStack Telemetry Alarming (aodh) - 为监控提供一个告警组件
* OpenStack工作流服务 (mistral) - 为一系列director指定活动设置工作流，例如导入和部署计划
* OpenStack消息服务 (zaqar) - 提供OpenStack工作流服务的消息服务
* OpenStack对象存储 (swift) - 为系列OpenStack平台组件提供对象存储：
  * OpenStack镜像服务的镜像存储
  * OpenStack裸系统的数据
  * OpenStack工作流的部署计划

# 上层云(overcloud)

上层云是底层云创建的OpenStack平台环境。这包括基于你想要创建的OpenStack平台环境所定义的不同节点角色。底层云可以创建不同的上层云节点角色包括：

## 控制器节点

控制器节点提供了管理，网络和高可用的功能。一个理想的OpenStack环境至少需要3个节点来实现高可用；

一个默认控制节点包括以下组件：

* OpenStack Dashboard (horizon)
* OpenStack Identity (keystone)
* OpenStack Compute (nova) API
* OpenStack Networking (neutron)
* OpenStack Image Service (glance)
* OpenStack Block Storage (cinder)
* OpenStack Object Storage (swift)
* OpenStack Orchestration (heat)
* OpenStack Telemetry (ceilometer)
* OpenStack Telemetry Metrics (gnocchi)
* OpenStack Telemetry Alarming (aodh)
* OpenStack Clustering (sahara)
* OpenStack Shared File Systems (manila)
* OpenStack Bare Metal (ironic)
* MariaDB
* Open vSwitch
* Pacemaker and Galera for high availability services.

## 计算节点

计算节点提供计算资源，并且可以通过增加更多的计算节点来随时扩展环境。默认计算节点包括以下组件：

* OpenStack Compute (nova)
* KVM
* OpenStack Telemetry (ceilometer) agent
* Open vSwitch

## 存储节点

OpenStack环境的存储节点包括：

* Ceph存储节点 - 用于构建存储集群。每个存储节点运行一个Ceph对象存储服务（Object Storage Daemon, OSD）。并且，director在部署Ceph存储节点的时候会安装Ceph监控到控制器节点。
* 块存储(cinder) - 用于作为HA控制器节点的扩展块存储。这个节点包含了以下组件：
  * OpenStack块存储(cinder)卷
  * OpenStack Telemetry(ceilometer)代理
  * Open vSwitch
* 对象存储(swift) - 对象存储提供扩展存储层给OpenStack Swift。控制节点通过Swift proxy来访问这些对象存储节点。对象存储节点包含以下组件：
  * OpenStack对象conch(swift)
  * OpenStack Telemetry(ceilometer)代理
  * Open vSwitch

# 高可用

Red Hat OpenStack Platform director使用一个控制节点集群来为OpenStack平台环境提供高可用服务。director安装冗余的组件到每个控制节点并将它们作为一个单一服务来管理。这个集群配置的类型提供了在单个控制器节点故障时候的failback功能。

OpenStack Platform director使用一些关键的软件来管理控制节点的软件：

* Pacemaker - Pacemaker是一个集群资源管理器。Pacemaker管理和监控Openstack组件的可用性实现在集群所有节点间高可用。
* HAProxy - 为集群提供了负载均衡和代理服务。
* Galera - 为OpenStack平台数据库提供了集群范围数据库复制
* Memcached - 提供数据库缓存

# Ceph存储

在使用OpenStack的大型组织中，通常会有数千个客户端。每个OpenStack客户端访问块存储资源的时候有自己独特的需求。部署glance（镜像），cinder（卷）或者nova（计算）在单个服务器节点可以扩展成数以千计的客户端。通过OpenStack扩展解决这个挑战。

在虚拟化存储层可以使用Red Hat Ceph Storage来实现海量的存储，提供了高可用和高性能。Ceph将块设备镜像条带化转化成对象访问集群，这意味着大型Ceph块设备镜像可以比独立磁盘获得更好的性能。Ceph块设备还支持缓存、写时复制克隆（copy-on-write cloning）以及读时复制克隆（copy-on-read cloning）来提高性能。

> [Red Hat Ceph Storage](https://access.redhat.com/products/red-hat-ceph-storage) 提供了有关Ceph的详细信息。