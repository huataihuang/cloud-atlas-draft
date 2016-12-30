虚拟机克隆（vm clone）是快速根据已有虚拟机批量创建相同OS和配置虚拟机的最佳方法。

> 本文案例是在CentOS 7物理服务器上对CentOS 7虚拟机和Windows 2012虚拟机的clone操作实践

# 克隆虚拟机

* 登陆到KVM物理服务器

* 检查当前运行的虚拟机

```
virsh list
```

显示输出

```
 Id    Name                           State
----------------------------------------------------
 2     centos7                        running
 3     win2012                        running
```

> 克隆虚拟机之前，被克隆的虚拟机需要处于停机状态或者暂停状态（`pause`）

* 暂停虚拟机

```
virsh suspend centos7
virsh suspend win2012
```

然后检查虚拟机状态，可以看到虚拟机已经处于`paused`状态，如果此时你有远程登陆在上述2个虚拟机操作系统中，也会发现没有响应

```
virsh list
```

显示虚拟机处于暂停状态

```
 Id    Name                           State
----------------------------------------------------
 2     centos7                        paused
 3     win2012                        paused
```

* 克隆centos7虚拟机，这里我们要构建一个用于OpenStack开发环境的`devstack`，所以采用如下命令

```
virt-clone --connect qemu:///system --original centos7 --name devstack --file /var/lib/libvirt/images/devstack.img
```

可以看到极快的速度完成clone，并提示输出

```
WARNING  Setting the graphics device port to autoport, in order to avoid conflicting.
Allocating 'devstack.img'                                |  10 GB     00:04

Clone 'devstack' created successfully.
```

此时检查`/var/lib/libvirt/images/`目录可以看到复制出的虚拟机镜像

```
-rw------- 1 qemu qemu  11G Nov 27 15:29 centos7.img
-rw-r--r-- 1 root root 1.6G Nov 27 15:48 devstack.img
```

* 克隆windows 2012虚拟机，这里我们要构建日常工作的名为`windev`的虚拟机

```
virt-clone --connect qemu:///system --original win2012 --name windev --file /var/lib/libvirt/images/windev.img
```

* 此时使用`virsh list --all`检查所有的虚拟机，可以看到克隆出的虚拟机处于关机状态

```
 Id    Name                           State
----------------------------------------------------
 2     centos7                        paused
 3     win2012                        paused
 -     devstack                       shut off
 -     windev                         shut off
```

* 恢复源虚拟机`centos7`和`win2012`的运行

```
virsh resume centos7
virsh resume win2012
```

现在已经成功克隆了虚拟机，我们需要进一步将新克隆的虚拟机中原配置清除掉（例如主机名）

# `virt-sysprep`：准备虚拟机

`virt-sysprep`命令行工具用于reset或unconfigure虚拟机。这个过程包括移除SSH host keys，移除持久化的网络MAC地址配置，以及清楚用户账号。`virt-sysprep`

> 参考 [virt-sysprep: command not found](http://pkgs.loginroot.com/errors/notFound/virt-sysprep) 在RHEL/CentOS中，`virt-sysprep`工具位于`libguestfs-tool-c`软件包中，在Debian/Ubuntu则位于`libguestfs-tools`软件包中。

> 参考 [Create a CentOS Virtual Machine Image from Scratch](https://platform9.com/support/create-a-centos-virtual-machine-image-from-scratch/) : `cloud-init`是包含在OpenStack中的一个流行的在虚拟机首次启动时配置虚拟机器操作系统的工具。如果部署OpenStack则可以使用这个工具来做系统初始化。

现在我们使用`virt-sysprep`工具重置刚才克隆出来的`devstack`和`windev`这两个虚拟机：

* 处理`devstack`虚拟机

```
virt-sysprep -d devstack --hostname devstack --root-password password:CHANGE_ME
```

> `-d`参数等同于`--domain`，表示处理的虚拟机
>
> `--hostname` 表示将初始化的虚拟机主机名设置成`devstack`
>
> `--root-password password:CHANGE_ME` 表示将初始化主机的root用户密码设置成 `CHANGE_ME`
>
> 详细的`virt-sysprep`参考[virt-sysprep man手册](http://libguestfs.org/virt-sysprep.1.html)

* 修订 `devstack` 虚拟机的定义，调整虚拟机最大可分配vCPU和内存，以便后期根据系统负载[动态调整KVM虚拟机内存和vcpu实战](add_remove_vcpu_memory_to_guest_on_fly)

配置修改如下

```
sudo virsh setmaxmem devstack 32G
```

通过`virsh edit devstack`修改vCPU配置

```
  <vcpu placement='static' current='1'>12</vcpu>
```

* 启动虚拟机`devstack`虚拟机

```
virsh start devstack
```

> **`virt-sysprep`初始化说明**
>
> 检查发现Linux系统中每个用户目录下`.ssh`子目录都会被删除，所以如果原先是通过ssh登陆账号，克隆以后将不能使用这种方法，需要重新设置
>
> 源虚拟机中开设的账号在克隆后的虚拟机中依然存在，并且`/etc/sudoers`不变，所以原有账号的sudo方式依然存在

* 处理windows虚拟机`windev`

```
virt-sysprep -d windev --hostname windev --root-password password:CHANGE_ME
```

这里出现报错

```
[   0.0] Examining the guest ...
virt-sysprep: error: no operating systems were found in the guest image

If reporting bugs, run virt-sysprep with debugging enabled and include the
complete output:

  virt-sysprep -v -x [...]
```

难道是windows虚拟机初始化不是采用如同linux虚拟机的方法？

# 参考

* [How to clone a KVM virtual Machines and reset the VM – Part 6](http://www.unixarena.com/2015/12/how-to-clone-a-kvm-virtual-machines-and-reset-the-vm.html)
* [How to clone virtual machines in KVM - tutorial](http://www.dedoimedo.com/computers/kvm-clone.html) - 这篇博客更趋向于底层命令操作，可以作为clone vm的原理借鉴
* [virt-sysprep: Resetting Virtual Machine Settings](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/sect-Guest_virtual_machine_disk_access_with_offline_tools-Using_virt_sysprep.html)