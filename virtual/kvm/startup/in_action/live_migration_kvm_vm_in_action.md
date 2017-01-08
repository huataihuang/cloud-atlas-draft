KVM热迁移实现需要使用共享的存储池，最简便的方法是使用NFS共享。更为复杂且高可用、高性能的是使用共享的分布式文件系统，如Ceph。

> 本实践采用CentOS 7系统构建的NFS服务作为共享存储

# 构建NFS共享存储

> 以下操作在作为NFS服务的主机上执行

* NFS服务器上创建共享目录

```
mkdir -p /var/lib/nfs-data/images
```

* 使用以下命令安装 NFS 支持

```
yum install nfs-utils nfs-utils-lib
```

* 设置nfs相关服务在操作系统启动时启动

```
systemctl enable rpcbind
systemctl enable nfs-server
systemctl enable nfs-lock
systemctl enable nfs-idmap  
```

* 启动nfs服务

```
systemctl start rpcbind
systemctl start nfs-server
systemctl start nfs-lock
systemctl start nfs-idmap
```

* 服务器端设置NFS卷输出，即编辑 `/etc/exports` 添加：

```
/var/lib/nfs-data/images	192.168.1.0/24(rw,sync,no_root_squash,no_subtree_check)
```

* 服务器端输出NFS

```
exportfs -a
```

# NFS客户端挂载

* 编辑需要挂载共享NFS磁盘的设置`/etc/fstab`配置将共享NFS卷挂载到`/var/lib/libvirt/nfs-images`

```
192.168.1.1:/var/lib/nfs-data/images  /var/lib/libvirt/nfs-images  nfs  auto,rw,vers=3,hard,intr,tcp,rsize=32768,wsize=32768      0   0
```

* 客户端挂载

```
mkdir -p /var/lib/libvirt/nfs-images
mount /var/lib/libvirt/nfs-images
```

> 所有使用共享存储的KVM主机都挂载好这个NFS共享

# 配置libvirt的VM存储池

将默认的`/var/lib/libvirt/images`目录对应的`default`存储池修改到新的共享存储

* 先关闭运行的虚拟机

```
virsh shutdown centos7
virsh shutdown win2012
```

* 检查所有虚拟机运行状态，确保所有虚拟机都已经关闭

```
virsh list --all
```

* 检查存储池

```
virsh pool-list
```

显示输出

```
 Name                 State      Autostart
-------------------------------------------
 huatai               active     yes
 images               active     yes
 root                 active     yes
```

* 检查存储池信息 - 可以看到存储池容量

```
virsh pool-info images
```

* 检查存储池路径

```
virsh pool-dumpxml images | grep -i path
```

输出显示

```
    <path>/var/lib/libvirt/images</path>
```

* 检查有哪些VM镜像存储在这个路径中

```
virsh vol-list images
```

输出显示

```
 Name                 Path
------------------------------------------------------------------------------
 CentOS-7-x86_64-DVD-1511.iso /var/lib/libvirt/images/CentOS-7-x86_64-DVD-1511.iso
 centos7.img          /var/lib/libvirt/images/centos7.img
 win2012.img          /var/lib/libvirt/images/win2012.img
 win2012.iso          /var/lib/libvirt/images/win2012.iso
```

* 停止存储池

```
virsh pool-destroy images
```

* 编辑存储池配置

```
virsh pool-edit images
```

编辑内容，将其中的存储路径修改成新的NFS共享存储路径

```
<pool type='dir'>
  <name>images</name>
  <uuid>82b69f47-1c20-4e99-9dad-5665181c0d77</uuid>
  ...
  <target>
    <path>/var/lib/libvirt/nfs-images</path>
    ...
  </target>
</pool>
```

* 启动存储池

```
virsh pool-start images
```

* 再次检查存储路径

```
virsh pool-dumpxml images | grep -i path
```

确认修改路径正确

```
<path>/var/lib/libvirt/nfs-images</path>
```

* 将VM镜像从旧路径迁移到新路径

```
mv /var/lib/libvirt/images/* /var/lib/libvirt/nfs-images/
```

* 编辑VM配置文件更新到新的存储池路径

```
sudo virsh edit centos7
```

将存储路径修改到共享存储目录

```
<source file='/var/lib/libvirt/nfs-images/centos7.img'/>
```

* 然后启动虚拟机

```
virsh start centos7
```

# KVM热迁移

* 测试环境：将虚拟机 `centos7` 从KVM物理服务器 `test-1-3` 迁移到 `test-1-4` 上，我们要先打通`test-1-3`登录到`test-1-4`的免密码ssh，并验证ssh登录无误

```
ssh test-1-4 "virsh list"
```

显示输出

```
 Id    Name                           State
----------------------------------------------------
```

* 在虚拟机内部启动ping，验证网络是否会有影响

* 从KVM主机，`test-1-3`上发起热迁移

```
virsh migrate centos7 qemu+ssh://root@testtfs-1-4/system
```

提示信息

```
error: Unsafe migration: Migration may lead to data corruption if disks use cache != none
```

要避免这个报错，需要关闭每个VM的disk I/O cache功能，即编辑vm

```
virsh shutdown centos7
virsh edit centos7
```

在 `driver`行添加`cache='none'

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2' cache='none'/>
      <source file='/var/lib/libvirt/nfs-images/centos7.img'/>
      <target dev='vda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x06' function='0x0'/>
    </disk>
```

然后再次启动vm

```
virsh start centos7
```

然后再次迁移。

> 另外一种方法是使用 `--unsafe` ，这样对于非关键应用可以适合。

```
virsh migrate centos7 qemu+ssh://root@testtfs-1-4/system --unsafe
```

* 然后在`test-1-4`物理服务器上可以看到迁移后正常运行的虚拟机

```
[root@test-1-4 /root]
#virsh list
 Id    Name                           State
----------------------------------------------------
 1     centos7                        running
```

# 参考

* [十：更改libvirt虚拟机镜像存储路径](../change_libvirt_vm_image_store_path)
* [十一：实现Linux KVM在线迁移](../perform_live_migration_on_linux_kvm)
* [CentOS 7 NFS设置](../../../../service/nfs/setup_nfs_on_centos7)