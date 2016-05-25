oVirt是由Red Hat创建的虚拟化、存储、网络管理平台，官方发布仅支持x86_64平台的KVM管理，但也被移植到PPC和ARM架构。

oVirt包含2个基本组件：oVirt engine和oVirt node

oVirt engine是使用Java开发，前端使用[GWT](http://www.gwtproject.org/)(Google Web Toolkit) web toolkit，并运行在[WildFly](http://www.wildfly.org/)（从JBoss衍生）应用服务器。用户管理支持oVirt with LADP或AD服务，后端存储数据库使用PostgreSQL。提供了RESTful API用于定制或增加功能。

oVirt node是一个运行在RHEL，CentOS，Fedora或Debian（实验性），使用了KVM hypervisor和用Python编写的VDSM（Virtual Desktop and Server Manager）的管理服务。VDSM包含了所有在节点上运行的资源（计算，存储，网络），并提供运行虚拟机的响应给engine。

支持多种存储用于domain：
* NFS
* iSCSI
* Fibre Channel
* POSIX兼容文件系统
* GlusterFS

网络管理支持多VLAN的网桥，支持bond接口，以及通过web管理平台配置SR-IOV等硬件配置。

计算资源管理包括支持CPU pinning，定义NUMA拓扑，内核同页合并（kernel same-page merging），内存超配（memory over-provisioning）。

虚拟机管理支持高可用特性：在线迁移，在线快照，从快照clone迅即，创建虚拟机模板等。

# 参考

* [oVirt](https://en.wikipedia.org/wiki/OVirt)