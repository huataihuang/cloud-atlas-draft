# 架构

在Linux平台，NFS共享是内置且使用非常方便的共享文件模式，但是NFS v3也存在安全权限设置简单（仅通过gid/uid区分权限，仅通过IP地址安全限制），无法满足动态IP客户端访问。

所以结合sshfs和NFS以及NAT模式的kvm虚拟化环境，构建以下

* 远程开发的桌面系统由于DHCP获得的IP地址不固定，所以较难实现通过IP来认证和限制安全访问。所以远程开发桌面系统采用sshfs来访问物理服务器上共享目录，通过ssh认证实现安全。
* 采用libvirt的NAT模式，虚拟机访问物理服务器NFS共享目录是可以固定IP地址，并且NAT模式也确保了虚拟机不会被物理网络中非授权客户端访问，在物理服务器上设置共享目录的NFS只对NAT网段开放。

# NFS设置

* 物理服务器设置 `/etc/exports` 配置如下

```
/var/lib/nfs-data/dev-7    192.168.122.0/24(rw,sync,no_root_squash,no_subtree_check)
```

> 这里网段`192.168.122.0/24`是libvirt默认的NAT网段，只有该物理服务器上的虚拟机能够访问，屏蔽了外部物理网络访问，所以可以保证NFS访问安全性。

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

# NFS挂载（虚拟机访问物理服务器上NFS共享）

* 在[开发环境kvm虚拟机](kvm)上，编辑 `/etc/fstab` 配置挂载NFS共享目录（即挂载这个虚拟机所在物理服务器的共享目录）

```
192.168.122.1:/var/lib/nfs-data/dev-7 /nfs-data/dev-7  nfs auto,rw,vers=3,hard,intr,tcp,rsize=32768,wsize=32768      0   0
```

* 执行挂载

```
mkdir -p /nfs-data/dev-7
mount /nfs-data/dev-7
```

* 在个人目录下创建软链接，链接到共享目录下子目录，以便后续使用

```
mkdir -p /nfs-data/dev-7/huatai/works
ln -s /nfs-data/dev-7/huatai/works ~/works
```

这样`huatai`用户登录系统后，只需要简单访问`~/works`目录，就可以将该目录作为开发目录使用，并且与其他虚拟机共享，也可以通过sshfs访问这个物理服务器共享目录。

# 参考

* [CentOS 7 NFS设置](../service/nfs/setup_nfs_on_centos7)