# 架构

结合本地硬件模拟开发中心和云计算厂商提供基础平台实现在线网站，从本地开发、持续集成到推送到云计算平台的线上系统，实现完整的软件生命周期。

* 本地2~3个主机搭建私有云，作为本地开发平台，预发平台、内部管理平台
* 采用云厂商的3个kvm实例搭建的k8s，实现SaaS，发布程序开发
* 本地私有云和远程公有云的数据流同步、推送、数据分析
* 完整的企业级环境构建

# 服务器端

本章节综合虚拟化技术（KVM+Docker+OpenStack）在一台ThinkPad X220笔记本上构建开发环境，以及集群模拟。文档以实践为主，参考引用各章节的技术笔记，以求快速、准确、可重复构建环境。

* 本地开发平台
  * MacBook Pro 2018 - 本地开发笔记本平台

* 本地私有云
  * ThinkPad X220 - Core(TM) i5-2410M CPU @ 2.30GHz 双核支持超线程，内存8G，500GB SATA磁盘
  * MacBook Pro 2013 later

* 远程公有云
  * Vultr的3个KVM实例

* 操作系统

CentOS 7.3.1611 最小化安装

# 桌面环境

桌面工作环境推荐采用：

* MacBook Pro + macOS - [MacBook双操作系统启动macOS+Linux](macbook_dual_boot_macos_linux) (实现笔记本电脑Linux和macOS操作系统双启动)
* MacBook Pro + Linux - [Fedora 26 Desktop (LXQt图形桌面)开发工作室](fedora_develop_studio) (主力工作平台)

> 最初我采用`MacBook Pro + macOS`作为远程开发的桌面环境，不过，实际上真正发挥 Mac 优势的地方不多，主要是有比较完善的商用软件（例如，个人购买了很多正版的软件，使用非常省心省力）。
>
> 但是太多资源消耗在构建绚丽的桌面，不如采用LXQt这样轻量级桌面能够把更多资源用于计算，还是觉得遗憾。所以最终采用的是双启动环境，在macOS和Linux之间切换工作。当需要使用Linux来进行一些特定的开发计算，例如GPU计算，则切换奥Linux平台工作。