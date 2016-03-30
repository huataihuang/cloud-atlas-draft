x86虚拟化技术指在x86架构硬件虚拟化技术，允许在安全和高效的基础上并行共享x86处理器资源给多个操作系统。

1990年代，x86虚拟化技术完全是软件实现的，然而到2006年，Intel(VT-x)和AMD(AMD-V)引入了硬件虚拟化技术简化了虚拟化软件并提供了一定的性能提升。

# 基于软件的虚拟化

* Binary translation
* shadowed
* I/O device emulation

# 硬件辅助虚拟化

在2005~2006年，Intel和AMD发布了新的x86架构处理器扩展：

* AMD虚拟化 AMD-V
* Intel虚拟化 VT-x

# 图形处理器虚拟化

Intel GVT-d, GVT-g 和 GVT-s：在Intel Iris Pro显示芯片中引入了图形处理虚拟化技术

# 芯片

内存和I/O虚拟化是通过芯片实现的，这些功能需要在BIOS中激活

## I/O MMU虚拟化（AMD-Vi 和 Intel VT-d）

输入/输出内存管理单元（input/output memory management unit, IOMMU）允许guest虚拟机通过DMA和中断映射来直接访问周边设备，例如以太网卡，加速图形卡和硬件控制器。这个技术有时也称为 PCI passthrough。

当内存地址空间小于操作系统的内存地址空间时，IOMMU通过使用内存地址转换允许操作系统不再需要在和周边设备通讯时来回缓存。同时，IOMMU也允许操作系统和hypervisor在[妥协的内存安全](https://en.wikipedia.org/wiki/DMA_attack)(DMA攻击)避免bug或恶意硬件。

AMD和Intel都发布了各自的IOMMU规范：

* AMD I/O虚拟化技术称为AMD-Vi，最初也称为IOMMU
* Intel的I/O虚拟化称为"直接I/O虚拟技术"（Virtualization Technology for Directed I/O, VT-d），目前已经在大多数高端Nehalem和最新的Intel处理器中包含了这个技术

注意：不仅CPU需要支持IOMMU，主板芯片和系统firmware(BIOS或UEFI)也需要完全支持IOMMU I/O虚拟化。只有PCI或PCI Express设备支持function level reset(FLR)才能以这种方式虚拟化，这样才能在不同的虚拟机之间重新分配请求。如果设备不支持消息信号中断（Message Signaled Interrupts，MSI），则他必须不和其他可能指定的设备共享中断线。在PCI/PCI-X-to-PCI Express桥之间路由的所有常规的PCI设备只能一次全部分配给一个guest虚拟机。但是PCI Express设备则没有这个限制。

## 网络虚拟化

Intel 连接虚拟化（Intel's Virtualization Technology for Connectivity）称为`VT-c`

## PCI-SIG Single Root I/O Virtualization (SR-IOV)

PCI-SIG Single Root I/O Virtualization (SR-IOV)基于PCI Express(PCIe)硬件提供了一系列通用的（不限于x86架构）I/O虚拟方式，这个功能是PCI-SIG的标准：

* Address translation service(ATS)通过地址转换在PCI Express上支持原生的IO虚拟化。
* Single-root IOV（SR-IOV或SRIOV）在现有的single-root complex PCI Express技术上支持原生的IO虚拟化
* Multi-root IOV (MR-IOV)在SR-IOV通过构建新拓扑（例如刀片服务器）支持原生IO虚拟化，提供了多root复杂的共享公共PCI Express结构。

当激活了SR-IOV，虚拟网络接口可以在guest上直接访问，避免了引入VMM导致的性能高损耗，例如，在NASA虚拟化数据中心和Amazon共有云，SR-IOV实现了裸物理网卡的95%以上性能。

# 参考

* [x86 virtualization](https://en.wikipedia.org/wiki/X86_virtualization)