在KVM中，你可以从一台主机迁移一个KVM虚拟机到另外一台主机而无须宕机。如果两个KVM物理服务器访问共享的存储池，KVM在线迁移可以完美运行。要在两个KVM主机上访问共享的存储池，你需要使用NFS或者GFS2文件系统（集群文件系统）。在这个案例中，我使用NFS文件系统来存储VM镜像。在迁移过程中，VM的"内存"内容将复制到目标KVM物理主机，并且在某个时间点相同内容时切换来迁移VM。注意，当在KVM主机间使用共享文件系统，VM的磁盘镜像不在通过网络复制，这样两个KVM物理主机将访问相同的存储池。

![KVM热迁移](/img/virtual/kvm/startup/KVM-Live-VM-Migration.jpg)

# 环境

* KVM物理主机 – UA-HA 和 UA-HA2
* VM名字 – UAKVM2

存储池：

```
[root@UA-HA ~]# df -h /kvmpool/
Filesystem                 Size  Used Avail Use% Mounted on
192.168.203.134:/kvmstore  1.8G  1.7G   88M  96% /kvmpool
[root@UA-HA ~]# ssh UA-HA2 df -h /kvmpool/
Filesystem                 Size  Used Avail Use% Mounted on
192.168.203.134:/kvmstore  1.8G  1.7G   88M  96% /kvmpool
[root@UA-HA ~]# ls -lrt /kvmpool
total 1710924
-rw------- 1 root root 4295884800 Dec 22 18:07 UAKVM2.qcow2
[root@UA-HA ~]#
```

> 你必须在KVM主机之间配置`无须密码的root登录ssh`来立即启动迁移以避免root用户密码提示。

* 当

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