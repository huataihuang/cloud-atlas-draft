偶然发现 [UnixArena KVM系列教程](http://www.unixarena.com/category/redhat-linux/linux-kvm) 非常简明清晰，适合有一定Linux经验和KVM虚拟化经验的系统管理员。正好我需要系统复习和准备一个完整的KVM测试环境，所以翻译和整理这个系列教程：

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

并且，作为补充，记录和整理了自己学习这个系列教程的实践：

* [kvm快速起步实战](in_action/README)
	* [Clone KVM虚拟机实战](in_action/clone_kvm_vm_in_action)
	* [Linux KVM在线迁移实战](in_action/live_migration_kvm_vm_in_action)
	* [高可用KVM虚拟机实战](in_action/ha_kvm_vm_in_action)