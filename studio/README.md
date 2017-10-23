对于个人开发者，构建一个完整的复杂度开发环境也是一个不小的挑战 - 

# 服务器端

本章节综合虚拟化技术（KVM+Docker+OpenStack）在一台ThinkPad X220笔记本上构建开发环境，以及集群模拟。文档以实践为主，参考引用各章节的技术笔记，以求快速、准确、可重复构建环境。

* 硬件

ThinkPad X220 - Core(TM) i5-2410M CPU @ 2.30GHz 双核支持超线程，内存8G，500GB SATA磁盘

* 操作系统

CentOS 7.3.1611 最小化安装

# 桌面环境

桌面工作环境推荐采用：

* MacBook Pro + macOS - [MacBook双操作系统启动macOS+Linux](macbook_dual_boot_macos_linux) (实现笔记本电脑Linux和macOS操作系统双启动)
* MacBook Pro + Linux - [Fedora 26 Desktop (LXQt图形桌面)开发工作室](fedora_develop_studio) (主力工作平台)

> 最初我采用`MacBook Pro + macOS`作为远程开发的桌面环境，不过，实际上真正发挥 Mac 优势的地方不多，主要是有比较完善的商用软件（例如，个人购买了很多正版的软件，使用非常省心省力）。
>
> 但是太多资源消耗在构建绚丽的桌面，不如采用LXQt这样轻量级桌面能够把更多资源用于计算，还是觉得遗憾。所以最终采用的是双启动环境，在macOS和Linux之间切换工作。当需要使用Linux来进行一些特定的开发计算，例如GPU计算，则切换奥Linux平台工作。