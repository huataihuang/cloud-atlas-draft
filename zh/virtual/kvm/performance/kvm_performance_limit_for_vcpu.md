> 本文为翻译摘要，具体性能待实践验证

在一个物理服务器上可以运行的KVM虚拟的最大数量并没有一个明确的权威说明，以下内容综合一些文档来提供一个感性认识，具体情况请以实践为准。

# 每个VM的虚拟内核数量

KVM允许用户为每个虚拟机设置多个虚拟内核，从实践来看每个虚拟机的虚拟核建议如下：

* 每个VM建议只使用一个核：请参考[kvm性能优化](kvm_performance_tunning.md)，对于多核要考虑到数据缓存命中率，建议使用cpu绑定，并且不能跨cpu，否则会导致缓存效率降低并且跨CPU节点访问缓存的开销。
* 每个VM的虚拟cpu核数量不要高于物理服务器可提供的真实cpu核数量：如果超配了cpu核，会导致持续的cpu切换，性能降低明显。

# 每个物理主机的KVM虚拟机数量

大多数笔记本和台式机的处理器都支持硬件虚拟化，但是如果分配了超过硬件支持的虚拟机数量，（[根据RedHat Eduardo Habkost说明](http://www.brianlinkletter.com/kvm-performance-limits-for-virtual-cpu-cores/#fn1-2617)）虽然配置VM使用KVM来实现CPU虚拟化，就不会再使用QEMU CPU模拟模式（TCG）)，应该会出现CPU资源竞争。

在[KVM Performance Limits for virtual CPU cores](http://www.brianlinkletter.com/kvm-performance-limits-for-virtual-cpu-cores/)一文中个提供了一个经验数据： **每个物理服务器cpu核支持8个虚拟机cpu核** 。即，物理服务器是2个cpu核的环境，可以运行16个单vcpu的虚拟机，或者8个使用双vcpu的虚拟机。

# 内存限制

启动KVM虚拟机时候，可以定义VM使用的内存大小。所有运行在主机上的虚拟机的内存总量有可能可以超配（`overbooked`）。

有关KVM内存限制的大多数信息汇总得到的经验是：**可以最多超配到物理服务器的150%** (包括物理主机使用的内存)。例如，你的笔记本有8GB内存，则可以运行10个1GB内存的虚拟机，这样加上物理服务器操作系统运行需要的2GB内存，就可以实现实际物理内存的150%超配。

然而，上述配置是假设所有guest虚拟机并**不是**同时使用分配给它们的所有内存。如果运行的应用程序消耗了每个虚拟机的所有内存，就会导致极差的性能。（此时会导致大量的内存交换）

详细的KVM内存限制，网络接口和其他资源，在[Fedora projet](https://docs.fedoraproject.org/en-US/Fedora/13/html/Virtualization_Guide/sect-Virtualization-Virtualization_limitations-KVM_limitations.html)和[SUSE Linux Enterprise Server 11 SP4 Virtualization with KVM:Performance Limitations](https://www.suse.com/documentation/sles11/singlehtml/book_kvm/book_kvm.html#cha.kvm.limits)详细列出了KVM的限制，特别是有关硬件和性能的限制：

| 虚拟硬件 | 最大限制 |
| ----- | ----- |
| Guest最大支持虚拟内存 | 4 TB |
| Guest最大支持vcpu数量 | 256 |
| 每个Guest支持最大虚拟网络设备数量 | 8 |
| 每个Guest支持最大块设备数量 | 4个模拟设备（IDE），通过`virtio-blk`支持20个para-virtual设备 |
| 每个Host物理服务器支持最大VM数量 | 所有guest虚拟机的vcpu数量总和不能大于物理服务器CPU核数的`8`倍 |

> SUSE测试过上述虚拟硬件的限制，报告说VM安装和工作正常，并且在达到上限时没有出现明显的性能恶化（CPU，内存，磁盘，网络）。

| 分类 | 完全虚拟化(Fully Virtualized) | 半虚拟化(paravirtualized) | 主机传递(Host Pass-through) |
| ---- | ---- | ---- | ---- |
| CPU,MMU(内存管理单元) | 7% | 不适用 | 在使用EPT(intel)或NPT(AMD)的硬件虚拟化时 97% / 在使用[SPT](What exactly do shadow page tables (for VMMs) do?)的硬件虚拟化时 85% |
| Network I/O (1GB LAN) | 60% (e1000虚拟网卡) | 75% (`virtio-net`) | 95% |
| Disk I/O | 40% (IDE虚拟设备) | 85%(`virtio-blk`) | 95% |
| Graphics(非加速) | 50% (虚拟VGA或Cirrus) | 不适用 | 不适用 |
| 时间精度(没有使用NTP) | 95%-105%（100%表示完全准确） | 100%(`kvm-clock`) | 不适用 |

> 请参考[]
>
> CPU `host-passthrough` 模式表示将物理CPU的一些特性传给虚拟机使用，虚拟机里看到和物理CPU一模一样的CPU品牌型号，但不同型号CPU的宿主机之间虚拟机不能迁移。

# Fedora虚拟化手册

[Fedora projet文档](https://docs.fedoraproject.org/)陆续发布了几本有关虚拟化的手册

* [Fedora 13: Virtualization Guide - The definitive guide for virtualization on Fedora (Edition 0)](https://docs.fedoraproject.org/en-US/Fedora/13/html/Virtualization_Guide/index.html)
* [Fedora 18: Virtualization Administration Guide - Virtualization Documentation (Edition 1.0)](https://docs.fedoraproject.org/en-US/Fedora/18/html/Virtualization_Administration_Guide/index.html)
* [Fedora 19: Virtualization Security Guide - Virtualization Documentation (Edition 0.2)](https://docs.fedoraproject.org/en-US/Fedora/19/html/Virtualization_Security_Guide/index.html)
* [Fedora 23: Virtualization Getting Started Guide - Virtualization Documentation (Edition 01)](https://docs.fedoraproject.org/en-US/Fedora/23/html/Virtualization_Getting_Started_Guide/index.html)

# 参考

* [KVM Performance Limits for virtual CPU cores](http://www.brianlinkletter.com/kvm-performance-limits-for-virtual-cpu-cores/)