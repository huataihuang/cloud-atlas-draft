在某些情况下，你可能需要删除掉一个错误的KVM虚拟机，并且清理掉无用的配置和磁盘数据以便能够重新开设虚拟机。

要删除掉一个运行的KVM虚拟机，需要完成以下步骤

> `virsh`命令执行需要`root`权限，这里采用的是`sudo`方式执行需要`root`权限的命令。

* 首先使用`virsh list`命令列出所有KVM虚拟机

```
sudo virsh list
```

显示输出

```
 Id    Name                           State
----------------------------------------------------
 6     centos7                        running
 8     win2012                        running
 9     windev                         running
 11    devstack                       running
```

> 对于没有在运行状态的虚拟机，需要使用 `virsh list --all` 才能看到。

> 这里操作的案例是`devstack`，将完整展示如何销毁一个虚拟机。

* 检查`devstack`虚拟机的配置

```
sudo virsh dumpxml devstack
```

> 注意：最后需要清理磁盘文件，所以这里我们要找出这个虚拟机使用了哪些磁盘文件

```
sudo virsh dumpxml devstack | grep 'source file'
```

可以看到磁盘文件位于`/var/lib/libvirt/images`目录下的`devstack.img`文件（最后需要清理）

```
<source file='/var/lib/libvirt/images/devstack.img'/>
```

* 关闭虚拟机

```
sudo virsh shutdown devstack
```

* 如果虚拟机由于某些原因无法正常`优雅地`关闭，我们可以使用`destroy`指令来强制关闭虚拟机（相当于虚拟机"断电"）

```
sudo virsh destroy devstack
```

* 检查虚拟机是否做过快照，如果有快照，则先删除快照

```
sudo virsh snapshot-list --domain devstack
```

假设有快照 `3sep2016u1` ，则先删除

```
sudo virsh snapshot-delete --domain devstack --snapshotname 3sep2016u1
```

* 删除虚拟机

在KVM虚拟化中，所谓删除虚拟机指的是将虚拟机`undefine`，此时虚拟机的磁盘文件依然存在，但是对于hypervisor，这个虚拟机已经清理了配置，不能再直接启动了。

```
sudo virsh undefine devstack
```

* 然后删除磁盘文件

```
sudo rm -f /var/lib/libvirt/images/devstack.img
```

# 参考

* [How to delete KVM VM guest using virsh command](https://www.cyberciti.biz/faq/howto-linux-delete-a-running-vm-guest-on-kvm/)