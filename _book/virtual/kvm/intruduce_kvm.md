`KVM`（Kernel-based Virtual Machine）是AMD64和Intel 64硬件平台的完全虚拟化解决方案，是构建Red Hat Enterprise Linux 6虚拟化的基础。KVM可以运行多个，不需要修改虚拟主机操作系统。在Red Hat中KVM hypervisor是通过`libvirt` API和基于`libvirt`的工具来管理的（如`virt-manager`和`virsh`）。

KVM hypervisor支持系统资源超分配，也就是超出系统的虚拟CPU和内存分配资源。一个单一虚拟机不能使用超过物理提供的CPU和内存，不过`overcommitting`（超分配）可以支持多于CPU数量的多个虚拟机运行，虽然这存在稳定性风险。

KSM（Kernel SamePage Merging）是通过KVM hypervisor允许KVM虚拟机共享同等内存页。这些共享内存也通常使用共有的库或其他共同的高使用率数据。KVM允许大量虚拟操作系统共用内存以避免内存重复分配。

# libvirt和libvirt工具

Libvirt是hypervisor无关的虚拟化API用于和操作系统虚拟功能进行交互，提供：

* 共有的通用的和稳定的管理虚拟化层
* 公用的管理本地系统和网络主机接口
* 只要虚拟操作系统hypervisor支持则可以创建、修改、监控、迁移和停止虚拟操作系统。虽然多个主机可以使用libvirt同时访问，但是API仅限于单节点操作。Libvirt是Red Hat Enterprise Linux 6默认的虚拟管理方式。

* `virsh`

`virsh`命令行工具是内建在`libvirt`管理 API 上的，并作为图形化`virt-manager`应用程序的一个替代软件，常用于脚本方式的虚拟化管理。该`virsh`工具被包含在`libvirt-client`软件包中。

* `virt-manager`

图形化管理工具

* `RHEV-M`

Red Hat Enterprise Virtualization Manager (`RHEV-M`)提供虚拟环境构架的图形化还礼，用于管理分配、连接协议、用户会话、虚拟主机池、映像和高可用集群，此构架可用于替换`virsh`和`virt-manager`工具。该工具运行在Windows Server 2008 R2集群模式，使用主备配置。

# 虚拟硬件设备

在Red Hat Linux 6中虚拟化会模拟三种类型系统设备给虚拟操作系统：

* 模拟软件设备
* 半虚拟化设备（Para-virtualized devices）
* 物理共享设备

这些硬件设备对于虚拟操作系统显示为物理连接设备，但实际工作在不同方式。

# 虚拟化的和模拟的设备

QEMU/KVM以软件方式模拟实现了很多核心设备给虚拟操作系统，这些模拟硬件设备对于虚拟操作系统非常重要。模拟设备是完全用软件实现的，并不要求在后端有真实的物理设备。模拟设备可以使用一个物理设备或一个虚拟软件设备，模拟的驱动是一个在guest操作系统和Linux内核（该内核管理源设备）之间的一个转换层。这个设备层通过KVM hypervisor提供一个完整的转换。任何相同类型的设备，只要能够被Linux内核使用则可以作为模拟驱动的后端源设备。

* 虚拟CPU（vCPUs）

虚拟CPU是用于guest操作系统的，数量由物理主机的实际物理处理器内核数量决定。

* 虚拟图形设备 - 提供两种模拟图形设备，可以使用SPICE协议或VNC连接
  * Cirrus CLGD 5446 PCI VGA card（使用cirrus设备）
  * 标准VGA显卡支持Bochs VESA扩展
* 虚拟系统部件
  * Intel i440FX PCI bridge
  * PIIX3 PCI to ISA bridge.
  * A PS/2 mouse and keyboard.
  * An EvTouch USB Graphics Tablet.
  * A PCI UHCI USB controller and a virtualized USB hub.
  * PCI network adapters.
  * Emulated serial ports.
* 虚拟声卡：RHEL 6.1可以虚拟 Intel HDA声卡 `intel-hda`（推荐），以前版本则虚拟 `ac97` 和 `es1370`
* 虚拟网络设备
  * `e1000`驱动虚拟一个Intel E1000网卡（Intel 82540EM, 82573L, 82544GC）
  * `rt18139`驱动虚拟一个Realtek 8139网卡
* 虚拟存储驱动器：存储设备和存储池可以使用虚拟驱动器连接到实际的物理存储设备。

# 半虚拟化驱动（Para-virtualized drivers）

半虚拟化驱动（Para-virtualized drivers）可以提高虚拟操作系统的I/O性能。

半虚拟化驱动减少了I/O延迟并增强了I/O通过，这样可以得到接近物理设备的性能。对于I/O敏感的应用，建议使用para-virtualized drivers。

para-virtualized驱动必须在guest操作系统中安装。默认，para-virtualized驱动已经包含再Red Hat Enterprise Linux 4.7及以上版本，Red Hat Enterprise Linux 5.4及以上版本，Red Hat Enterprise Linux 6.0及以上版本。不过，在Windows guests中，需要手工安装`para-virtualized`驱动。

* Para-virtualized network driver (`virtio-net`)
* Para-virtualized block driver (`virtio-blk`)
* Para-virtualized clock
* Para-virtualized serial driver(`virtio-serial`)
* Balloon driver (`virtio-balloon`) - 对于guest没有使用到的内存可以返回给host主机，而在guest需要内存的时候再提供个guest，动态分配内存。	

# 物理主机设备

一些硬件设备可以允许虚拟机直接访问，这种虚拟化访问称为`device assignment`，也称为`passthrough`。

* `PCI device assignment` - KVM hypervisor支持将PCI设备连接到虚拟操作系统，这样guest操作系统可以独占PCI设备来完成一系列工作，这种方式就好像PCI设备真的连接在虚拟操作系统中一样。`device assignment`也支持PCI Express设备，但是不支持显卡，并行PCI设备也可能支持，但是存在安全和系统配置冲突。
* `SR-IOV` (Single Root I/O Virtualization) 是一种PCI Express标准，扩展一个物理PCI功能将其PCI资源分别共享，虚拟化功能。每个不同的功能可以作为PCI device assignment提供给不同的guest操作系统。
* `NPIV`(N_Port ID Virtualization, NPIV)是一些光纤通道设备提供的功能，将一个物理N_Port作为多N_Port ID共享。通过NPIV，虚拟操作提供可以使用一个虚拟Fibre Channel来访问SAN存储。

# 存储

提供给虚拟操作系统的存储是物理存储的抽象，使用`para-virtualized`或模拟块设备驱动器。

* 存储池：存储池是一个通过libvirt管理提供给虚拟guest操作的文件，目录或存储设备。
  * 本地存储池 - 本地存储池是直接连接到host服务器的，包括本地目录，直接连接磁盘，物理分区和本地设备上上的LVM卷。通常本地存储池可用于开发、测试和小型部署，或者是用于不需要迁移或不需要大量运行虚拟机的环境。
  * 网络（共享的）存储池 - 网络存储池是通过标准协议在网络中共享使用的存储。对于在主机间迁移虚拟机的环境需要使用共享网络存储。
* 存储卷：存储卷是物理分区，LVM逻辑卷，基于文件的磁盘映像和其他由libvirt处理的存储类型。存储卷对虚拟操作系统表现为本地磁盘设备而不会在意其底层真实硬件。

# 迁移

迁移只移动虚拟主机的内存。而虚拟主机的存储是位于网络存储中，并且在源主机和目的主机间共享。没有共享存储，则迁移无法完成，建议使用libvirt来管理共享存储池。

* offline migration

离线迁移是指先挂起（suspend）guest操作系统，然后将虚拟机内存的映像移动到目的主机上。然后继续再目的主机上运行虚拟机，之后源主机的使用内存可以释放。

* Live migration

Live迁移是从一个物理主机将运行的guest操作系统迁移到另外一个物理主机。

# 虚拟到虚拟迁移(V2V)

支持从XEN，其他版本KVM和Vmware ESX迁移主机到Red Hat KVM

# 虚拟限制

虚拟硬件限制：

* 每个guest最多64个虚拟处理器
* 内存超分配：注意当使用swap时guest将缓慢。在使用KSM时确保swap大小相当于overcommit量。
* CPU超分配：每个物理处理器内核不建议超过10个虚拟CPU分配
* 虚拟SCSI设备：KVM不支持SCSI模拟
* 虚拟IDE设备：每个guest主机最多支持4个虚拟IDE设备
* `Para-virtual`设备：使用`virtio`驱动作为PCI设备，最多支持32个PCI设备。一些PCI设备是必须的：host bridge/ISA bridge/usb bridge/显卡/memory balloon设备

迁移限制：

只有相同厂商的CPU之间才能实现Live migration，需要设置No eXecution（NX）位on或off才能实现live migration。

存储限制：

* SR-IOV限制：SR-IOV只在部分设备上测试可使用。

PCI设备分配限制：

* PCI设备分配（连接到guest操作系统的PCI设备）要求主机系统具有AMD IOMMU或Intel VT-d支持来激活设备分配PCI-e设备。

# 参考

* [KVM and virtualization in Red Hat Enterprise Linux](http://docs.redhat.com/docs/en-US/Red_Hat_Enterprise_Linux/6/html/Virtualization/ch01s02.html)