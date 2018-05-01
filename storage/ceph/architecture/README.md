传统的存储服务商如EMC, NetApp提供了基于专用硬件的存储设备，虽然通过不断改进也能够集成到云计算中。但是随着开源云计算迅速发展，捆绑到单一专有供应商对方案已经逐渐被淘汰，主流云服务厂商都基于通用硬件，通过软件定义存储来实现海量数据存储。

开源云计算的主流平台OpenStack，Cloudstack和OpenNebula都支持Ceph实现后端分布式、可靠、可扩展存储集成。

主流的OpenStack项目其内部核心组件Swift（对象存储）和Cinder（块存储）可以替换成Ceph，这样可以通过Ceph单一存储实现统一的块存储、文件存储和对象存储。从OpenStack的第6个版本Folsom开始，Ceph已经完全和OpenStack集成，并能够确保Ceph适用于OpenStack所有最新版本。

Dell，SUSE和Canonical（即Ubuntu母公司）为OpenStack云解决方案提供支持Ceph部署和配置管理工具，例如Dell Crowbar和Canonical Juju可以自动部署Ceph存储。并且流行的开源配置管理工具，如Puppet，Chef，SaltStack和Ansible都有各自Ceph模块用于自动部署Ceph。

> 在云计算中，对于每个分布式组件都必须能够扩展以及自动完成部署。Ceph通过和这些配置管理工具兼容，实现了云计算的集成。

# 思考

作为SDS（软件定义存储），Ceph的灵活性和扩展性极佳。但是，要实现企业级的产品化，依然需要精心布局：

* 单节点的硬件组合：如何合理分配处理器和存储硬盘数量是经济且高性能的方式
* 节点的硬件监控，故障诊断
* 怎样实现跨机架、房间、IDC机房、全球化部署，实现对应用无感知的容灾
* 在节点综合网络卸载，计算卸载，综合DPDK，FPGA实现性能提升
* 热点数据高速缓存
* 底层文件系统优化（用更专用的存储系统[BlusFS](https://ceph.com/community/new-luminous-bluestore/)替代传统的XFS，Btrfs文件系统）