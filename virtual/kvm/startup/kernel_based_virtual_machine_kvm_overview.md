# 引言

KVM是针对x86硬件平台上Linux的自由开源完全虚拟化解决方案。经过了云计算革命，KVM(Kernel Based Virtual Machine)虚拟化已经成为行业的热门话题。大多数云计算技术因为KVM技术的简明特性倾向于使用KVM hypervisors来取代XEN。Redhat和Ubuntu的默认hypervisor就是KVM。而和这些发行版不同的是，Oracle Linux则使用了XEN虚拟化。大多数有关KVM的信息可以从[linux-kvm.org](http://www.linux-kvm.org/)获取。

KVM包括了一个可加载的内核模块，`kvm.ko`，提供了核心虚拟化框架以及一个处理器相关模块，`kvm-intel.ko`（intel）或`kvm-amd.ko`（AMD）。这些模块使得内核变成了一个hypervisor。`kvm.ko`内核模块负责将`/dev/kvm`暴露给其他程序使用，如`libvirt`。

KVM最初由Qumranet开发，该公司于2008年被Red Hat收购。

# KVM准备

* 支持虚拟化技术的处理器 - 用语加速虚拟化guest操作系统
    * Intel - `Intel-VT`
    * AMD - `AMD-V(SVM)`
* 在BIOS中激活CPU VT技术
* Linux内核要求`2.6.20`以上版本
* 访问软件仓库安装必要的KVM软件包
* 共享存储（NFS, SAN, NAS）

# KVM支持的Guest操作系统

* Linux - 大多数Linux发行版都很好地支持KVM Guest
* Windows - 大多数Windows guests都支持，包括桌面和服务器
* Unix - BSD, Solaris

# 支持架构

KVM同时支持32位和64位操作系统。要运行64位guest操作系统，host系统需要是64位并且激活了VT技术。

# KVM最大支持(Red Hat licence列表)

> 原文这段是有关Red Hat Licence的规格说明以及无限虚拟licence的价格表，没有参考价值，所以没有翻译

# KVM新功能

* [QMP](http://wiki.qemu.org/QMP) – Qemu Monitor Protocol

> **译注**

# 系列教程编译

本系列教程根据 [UnixArena Linux KVM](http://www.unixarena.com/category/redhat-linux/linux-kvm) 系列教程编译，共分以下文章：

* [一：基于内核的虚拟机（KVM）概览](kernel_based_virtual_machine_kvm_overview)
* [二：Redhat企业Linux安装KVM](redhat_enterprise_linux_kvm_installation)
* [三：RHEL 7.2 配置KVM主机](rhel_7_2_configuring_kvm_hosts)
* [四：使用命令行启动第一个KVM实例](launch_the_first_kvm_instance_using_cli)
* [五：使用Virt-Manger(VMM)部署KVM实例](deploy_kvm_instance_using_virt_manger_vmm_gui)
* [六：如何克隆一个KVM虚拟机并重置该虚拟机](how_to_clone_a_kvm_virtual_machines_and_reset_the_vm)
* [七：如何在线添加/更改虚拟磁盘](how_to_add_resize_virtual_disk_on_fly)
* [八：如何在线添加/移除虚拟机的内存](how_to_add_remove_memory_to_guest_on_fly)
* [九：如何在线添加/移除虚拟机的vCPU](how_to_add_remove_vcpu_to_guest_on_fly)
* [十：更改libvirt虚拟机镜像存储路径](change_libvirt_vm_image_store_path)
* [十一：实现Linux KVM在线迁移](perform_live_migration_on_linux_kvm)
* [十二：RHEL7 Pacemaker - 配置高可用KVM虚拟机](rhel_7_pacemaker_configuring_ha_kvm_guest)