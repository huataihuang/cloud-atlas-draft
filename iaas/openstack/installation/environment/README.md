本章节讨论如何按照案例架构配置控制节点和一个计算节点。

虽然大多数环境包含了身份标示（identity），映像服务（image service），计算（Compute）以及至少一个网络服务，以及Dashboard，而对象存储服务是可以独立操作的。

你必须使用一个管理员权限的账号来配置每个节点，也就是作为`root`用户或者配置`sudo`工具。

为了最好的性能，寂那一参考[Hardware requirements](https://docs.openstack.org/ocata/install-guide-rdo/overview.html#figure-hwreqs)来配置硬件。

以下最小化硬件需求将支持验证概念环境的核心服务以及一些[CirrOS](https://docs.openstack.org/ocata/install-guide-rdo/common/glossary.html#term-cirros)实例：

* 控制节点：1 核处理器，4 GB内存，和 5 GB存储
* 计算节点：1 核处理器，2 GB内存，和 10 GB存储

 随着OpenStack服务数量和虚拟机实例数量增加，要获得更好的性能需要增加硬件配置。

 要最小化集群并提供更多资源用于OpenStack，建议最小化安装64位Linux发行版。

 每个节点的单个磁盘只能满足最基本的安装，可以考虑逻辑卷管理LVM作为可选的安装服务以作为块存储。

 对于首次安装和测试目的，很多用户选择每个主机作为虚拟机（VM），主要优点包括：

 * 一个物理服务器可以支持多个节点，每个几乎可以使用任意数量网络接口
 * 可以通过安装过程获得周期性快照以及在出现问题时回滚一个工作配置。

 但是，VM将消耗实例的性能，特别是你的hypervisor或者处理器缺少硬件加速VM的支持的话。

 > 注意：如果选择安装VM，需要确保hypervisor提供了一个方法在provider网卡接口上关闭MAC地址过滤的功能。