Data Plane Development Kit(`DPDK`)是数据平面软件库和快速数据包处理网络接口控制器驱动的集合。DPDK提供了针对Intel x86处理器的编程框架并且为高速数据包网络应用激活了更快的开发框架。DPDK适合从Intel Atom处理器到Intel Xeon处理器，采用了开源的BSD授权。

# 概述

DPDK框架通过创建一个环境抽象层（Environment Abstraction Layer, EAL）提供了特定的硬件/软件环境的库。EAL隐藏了特殊环境的差异并提供了标准的编程接口库，提供硬件加速和其他硬件和操作系统（Linux, FreeBSD）要素。一旦在指定环境创建了EAL，开发者可以连接这个库来创建应用程序。

EAL也提供了附加的服务，包括，时间参考，PCIe总线访问，跟踪、调试和告警操作功能。

DPDK

Data Plane Development Kit(`DPDK`)**数据平面开发套件**是并非是一个全新的技术，而是充分利用了Linux自身提供的特性来提升网络数据的处理性能:

* `UIO` 用户空间下驱动程序的支持机制。DPDK使用`UIO`机制使用网卡驱动程序（主要是Intel的千兆`igb`和万兆`ixgbe`驱动程序）运行在用户态，并采用轮询和零拷贝方式从网卡收取报文，提高收发报文的性能。
* `HUGEPAGE` 是通过大内存页提高内存的使用效率，`DPDK`在`HUGEPAGE`机制上构建内存管理系统，提高应用程序处理报文的性能。
* `CPU Affinity` 通过将进程和线程绑定到不同的CPU核，使各个CPU专注于处理专项任务，节省了反复调度的性能消耗。例如，两个网卡`eth0`和`eth1`都收包，可以让`cpu0`专注处理`eth0`，`cpu1`专注处理`eth1`，避免`cpu0`一会处理`eth0`一会处理`eth1`，就提高了多核CPU的使用效率。

通过DPDK，开发人员可以避免使用专用处理器，例如网络处理器（NPU）、协同处理器、应用程序专用集成电路（ASIC）和现场可编程逻辑门阵列（FPGA）。DPDK在软件定义网络（`SDN`）和网络功能虚拟化(`NFV`)起到重要作用。

Intel提供了有关DPDK[Data Plane Development Kit(DPDK)](http://www.intel.com/content/www/us/en/communications/data-plane-development-kit.html)的技术文档，也可以从[DPDK.org](http://dpdk.org)获取[DPDK documentation](http://dpdk.org/doc/guides/)。（实际相同，dpdk.org提供的文档是sphinx方式的web文档，方便在线阅读）

# 参考

* [Data Plane Development Kit](https://en.wikipedia.org/wiki/Data_Plane_Development_Kit)
* [Packet Processing on Intel® Architecture](http://www.intel.com/content/www/us/en/intelligent-systems/intel-technology/packet-processing-is-enhanced-with-software-from-intel-dpdk.html)
* [Data Plane Development Kit(DPDK)](http://www.intel.com/content/www/us/en/communications/data-plane-development-kit.html) - 完整的Intel DPDK技术文档
* [DPDK技术论述](http://hong.hjh.blog.163.com/blog/static/130639069201511392524153/)
* [DPDK编程开发](http://cjhust.blog.163.com/blog/#m=0&t=1&c=fks_084075081094080075085086086095085081084075086081087070083) - 阿里巴巴upyun开发cjhust的博客