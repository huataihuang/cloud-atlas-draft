[KVM](http://www.linux-kvm.org)（Kernel-based Virtual Machine）是支持虚拟化扩展（Intel VT 或 AMD-V技术）x86硬件的Linux完全虚拟化解决方案。它包括了一个可加载的内核模块`kvm.ko`，提供了核心的虚拟化架构以及一个处理器特定模块（`kvm-intel.ko`或`kvm-amd.ko`）。

使用KVM，用户可以运行多个无需修改的Linux或Windows虚拟机。每个虚拟机有自己私有的虚拟硬件：网卡、磁盘、显卡等等。

从Linux内核2.6.20开始，KVM就作为主线内核，KVM用户空间的组件包括在主线QEMU中。

活跃的KVM相关虚拟化开发请参考[Virt Tools Blog Planet](http://planet.virt-tools.org)

# 参考

* [kvm官方网站](http://www.linux-kvm.org/page/Main_Page)