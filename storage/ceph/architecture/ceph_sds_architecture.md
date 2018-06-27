# Ceph架构简介

Ceph是一个真正对统一存储解决方案：从单一统一软件层提供对象、块和文件存储。

Ceph底层并不存在块和文件对管理，而是管理对象并且在对象只支持基于块和文件的存储。Ceph中的对象通过唯一对标识符进行寻址，并且存储在一个扁平对寻址空间。由于剔除了传统文件系统中的元数据操作，对象存储提供了无限对规模扩展和性能提升。

> 传统存储系统每次读写操作都需要查询巨大的元数据表，这对于海量文件存储会导致性能瓶颈，也会限制系统对扩展性。
>
> 传统存储的另一个局限是由RAID所引入的，当前容量极大的企业级磁盘（例如4TB甚至更高容量）已经使得磁盘故障时RAID需要花费数个小时甚至数天时间来修复单个磁盘故障。如果再多磁盘故障甚至导致数据无法恢复。此外RAID要求磁盘规格相同，且要求多个备用磁盘，都使得TCO（总拥有成本）极高。

Ceph通过CRUSH算法来动态计算存储和获取某个对象对位置。CRUSH即 Controlled Replication Under Scalable Hashing的缩写。通过动态计算元数据，Ceph不需要管理一个集中式元数据表，同时通过分布式存储功能可以将CRUSH计算负载分布到集群的多个节点。

> https://ceph.com/publications/ 提供了相关公开的资料

CRUSH有一个独特的基础设施感知能力，可以了解基础设施中不同组件之间关系：系统磁盘、池、节点、机架、电源插板、交换机、数据中心以及数据中心房间等。CRUSH会以多副本方式存储数据，以保证在故障区域中某些组件出现故障时数据依然可用。

用户可以在Ceph的CRUSH map中自由定义其基础设置的故障区域，上线高效管理数据。

Ceph采用数据副本方式，而不使用RAID，这样能够客服基于RAID带来的很多问题。数据副本可以通过命令高度定制化，并且磁盘故障时，数据恢复的初始副本和复制副本可以分布到集群所有磁盘上，是的不会存在初始副本和复制副本位于同一个磁盘情况，所有磁盘都参与数据恢复，使得恢复操作非常快速且没有性能瓶颈。

Ceph采用加权机制选择磁盘，所以不同容量的磁盘不会造成问题。

# Ceph组件

* Monitor - `ceph-mon`
* Manager - `ceph-mgr`
* `OSD` - `ceph-osd` Ceph对象存储服务(object storage daemon)
* `MDS` - `ceph-mds` Ceph存储元数据(stores metadata)，用于实现POSIX文件系统


## Ceph块存储

## `新`存储后端引擎 - BlueStore

2017年，Ceph引入了[新的存储后端BlueStore](https://ceph.com/community/new-luminous-bluestore/)。BlueStore存储引擎提供了更好的性能（写入性能2x），完全的数据校验，和内建的压缩功能。

从Ceph Luminous v12.2.z开始，Ceph OSD使用BlueStore作为默认存储后端，并且在ceph-disk, ceph-deploy和ceph-ansible时默认使用。

# 参考

* 「Ceph分布式存储学习指南」
* [Ceph Document](http://docs.ceph.com/)