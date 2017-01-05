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



# 参考

* [十：更改libvirt虚拟机镜像存储路径](../change_libvirt_vm_image_store_path)
* [十一：实现Linux KVM在线迁移](../perform_live_migration_on_linux_kvm)
* [CentOS 7 NFS设置](../../../../service/nfs/setup_nfs_on_centos7)