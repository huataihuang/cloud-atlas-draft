# 概述

Intel虚拟化技术（VT）采用基于硬件的虚拟化集合虚拟化软件，由两不同类型软件构成：

* Virtual-Machine Monitor (VMM)

VMM类似一个主机，完全控制处理器和其他平台硬件。VMM以一个抽象的虚拟处理器来运行guest软件，以允许guest系统直接在一个逻辑处理器上执行。VMM可以选择保留控制处理器资源，物理内存，中断管理，以及I/O。

* Guest Software

每个虚拟机就是一个支持一个由操作系统和应用软件组成的guest软件环境堆栈。每个操作不依赖其他虚拟机并使用由一个物理主机提供相同的处理器接口，内存，存储，显卡以及I/O。软件在虚拟机内于行必须使用限制权限这样VMM可以保留平台资源控制。

VMM是虚拟化平台架构中关键组成部分。

## 硬件支持处理器虚拟化

硬件支持的处理器虚拟化是的VMM软件简化、鲁棒性和高可靠。基于硬件支持的VMM软件可以处理虚拟机的事件、异常和资源分配。

Intel VT提供处理器虚拟化的硬件支持，在64位处理器，通过virtual-machine extension(VMX)指令集来支持虚拟机所使用的多个软件环境的处理器虚拟化。

## I/O 虚拟化

VMM必须支持guest软件的I/O虚拟化，主要通过以下方法：

* 模拟：VMM通过模拟一个现有（陈旧的）I/O设备来输出一个虚拟机设备给guest软件。VMM在软件上模拟硬件设备提供给硬件平台的I/O功能。I/O虚拟化通过模拟方式可以完全兼容（只需要在guest中运行现有设备驱动），但是性能和功能受到限制。

* 新的软件接口：这个模式也是I/O模拟，但是不是模拟传统设备，VMM软件输出一个虚假设备接口给guest软件。这个虚假设备是按照虚拟化优化的方式来定义的，以便能够有效克服I/O模拟带来的开销。这种模式提供了比完全模拟更好的性能，但是降低了兼容性（也就是需要对guest软件进行定制或者新的软件接口的驱动）。

* 分配：VMM直接分配物理I/O设备给虚拟机。这个模式下，分配的I/O设备的驱动直接运行在VM内部，所以允许直接操作，使得VMM开销最小化或者没有开销。健壮的I/O指定要求增加硬件支持来确保指定设备访问是完全隔离并被指定分区限制使用。这个I/O指定模式可以用于创建一个或更多I/O容器分区来支持模拟或者用于其他guest的虚拟化I/O请求的接口。这个基于I/O容器近似作为VMM特权软件去除了需要运行物理设备驱动。

* I/O设备共享：在I/O设备共享模式，扩展了I/O分配模式，一个I/O设备支持多个功能接口，每个接口可以独立分配给一个VM。设备硬件可以接收从这些功能接口发出的多个I/O请求并处理请求使用设备的硬件资源。

## Intel Directed I/O虚拟化技术概览



# 参考

* [Intel SR-IOV Driver Companion Guide](http://www.intel.com/content/dam/doc/design-guide/82599-sr-iov-driver-companion-guide.pdf)
* [Intel Virtualization Technology for Directed I/O](http://www.intel.com/content/dam/www/public/us/en/documents/product-specifications/vt-directed-io-spec.pdf)
* [Implementing SR-IOV for Linux on HP Proliant servers](https://h20195.www2.hpe.com/v2/getpdf.aspx/4AA5-7050ENW.pdf?ver=1.0)
* [SR-IOV ixgbe driver limitations and improvement](http://events.linuxfoundation.org/sites/events/files/slides/20160715_LinuxCon_sriov_final.pdf)