RADOS - 可靠、自动、分布式对象存储（Reliable Autonomic Distributed Object Store）是Ceph存储系统的核心和基础，所有的优秀特性都由RADOS提供：

* 分布式对象存储
* 高可用性
* 高可靠性
* 没有单点故障
* 自我修复
* 自我管理

> Ceph的数据访问方法，RBD、CephFS、RADOSGW和librados，的所有操作都是在RADOS层上构建的。

当Ceph集群接收到客户端写请求时，CRUSH算法首先计算出存储位置决定将该数据写入什么地方，然后将信息床底到RADOS层进行进一步处理。基于CRUSH规则集，RADOS以小对象的形式将数据分发到集群内的所有节点。最后将这些对象存储在OSD中。

当配置的副本数大于1的时候，RADOS负责数据的可靠性，即对象复制、创建副本并存储在不同的故障区域。对于有gege

# 参考

* 「Ceph分布式存储学习指南」
* [Ceph Document](http://docs.ceph.com/)