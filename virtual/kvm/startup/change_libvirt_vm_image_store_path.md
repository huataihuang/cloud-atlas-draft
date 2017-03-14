在KVM中，默认VM镜像是存储在`/var/lib/libvirt/images`目录。有可能由于根卷空间有限`/var`目录下的空间也有限。在KVM虚拟化中，人们倾向于将VM镜像存储在集中仓库中以便实现不同hypervisor之间迁移虚拟机。这种情况下，需要更改默认的libvirt镜像目录或者你需要将卷或者NFS共享挂载到`/var/lib/libvirt/images`目录下。在嗯问，我们将看到如何修改默认的libvirt镜像路径来指定它。在KVM术语中，我们称之为"存储池"。

注意：这篇文档是在`non-selinux`节点执行的。所以如果激活了SELinux，你需要修改关闭SELinux以便能够正确修改存储路径。

```
[root@UA-HA ~]# getenforce
Disabled
[root@UA-HA ~]#
```

* 登录到KVM hypervisor主机，并关闭所有运行的VM

```
[root@UA-HA kvmpool]# virsh shutdown UAKVM2
[root@UA-HA kvmpool]#
[root@UA-HA ~]# virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     UAKVM2                         shut off

[root@UA-HA ~]#
```

* 检查存储池

```
[root@UA-HA ~]# virsh pool-list
 Name                 State      Autostart
-------------------------------------------
 default              active     yes

[root@UA-HA ~]#
```

* 检查存储池信息

```
[root@UA-HA ~]# virsh pool-info default
Name:           default
UUID:           3599dd8a-edef-4c00-9ff5-6d880f1ecb8b
State:          running
Persistent:     yes
Autostart:      yes
Capacity:       17.50 GiB
Allocation:     7.67 GiB
Available:      9.82 GiB

[root@UA-HA ~]#
```

* 检查现有存储池路径

```
[root@UA-HA ~]# virsh pool-dumpxml default |grep -i path
    path-/var/lib/libvirt/images-/path
[root@UA-HA ~]#
```

* 验证哪些VM镜像存储在默认路径

```
[root@UA-HA ~]# virsh vol-list default |grep "/var/lib/libvirt/images"
 UAKVM2.qcow2         /var/lib/libvirt/images/UAKVM2.qcow2
[root@UA-HA ~]#
[root@UA-HA ~]# virsh vol-list default
 Name                 Path
------------------------------------------------------------------------------
 UAKVM2.qcow2         /var/lib/libvirt/images/UAKVM2.qcow2

[root@UA-HA ~]#
```

* 停止存储池

```
[root@UA-HA ~]# virsh pool-destroy default
Pool default destroyed

[root@UA-HA ~]#
```

* 编辑存储池配置

[KVM存储池](/img/virtual/kvm/startup/KVM-storage-pool-Linux.jpg)

* 启动存储池

```
[root@UA-HA ~]# virsh pool-start default
Pool default started

[root@UA-HA ~]#
```

* 验证存储池路径

```
[root@UA-HA ~]# virsh pool-dumpxml default |grep -i path
    path  /kvmpool path
[root@UA-HA ~]#
```

* 将VM镜像从旧路径移动到新路径

```
[root@UA-HA ~]# mv /var/lib/libvirt/images/UAKVM2.qcow2 /kvmpool/
[root@UA-HA ~]#
```

* 编辑VM配置更新成新的存储池

```
 source file='/kvmpool/UAKVM2.qcow2'
```

* 启动KVM虚拟机

```
[root@UA-HA kvmpool]# virsh start UAKVM2
Domain UAKVM2 started

[root@UA-HA kvmpool]#
```

如果看到以下报错

```
” error: Failed to start domain XXXXX
error: unsupported configuration: Unable to find security driver for model selinux ”
```

则编辑VM配置文件，去除XML文件中（在底部）的`selinux`行并尝试启动VM

```
# virsh edit UAKVM2
...................

seclabel type='dynamic' model='selinux' relabel='yes';/seclabel   ----> Remove this line
```

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