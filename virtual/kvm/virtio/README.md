[OS Dev](https://wiki.osdev.org/)提供了[Virtio](https://wiki.osdev.org/Virtio)定义：

VirtIO是允许虚拟机访问简单的虚拟设备的标准接口，如块设备，网卡和控制台。在guest VM中通过VirtIO访问设备比传统的"模拟"设备性能要好，因为VirtIO设备这要求最小的设置和配置发送和接收数据，此时host主机处理主要的物理硬件的设置和维护。

VirtIO开发主要可参考如下文档：

* [VirtIO specifications](http://docs.oasis-open.org/virtio/virtio/v1.0/virtio-v1.0.html)
* [VirtIO Driver Example](http://www.dumaisnet.ca/index.php?article=aca38a9a2b065b24dfa1dee728062a12)