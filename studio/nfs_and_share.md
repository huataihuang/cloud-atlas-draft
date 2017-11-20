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

# Docker共享目录

```
docker volume create share-data

docker run -it -p 22 --memory=2048M --cpus=2 \
--hostname dev5 --name dev5 \
-v share-data:/data local:dev5_django /bin/bash
```

> 如果原先的docker容器已经在运行，则可以先制作镜像，然后通过镜像再次启动容器以便能够共享存储

> 详细的[Docker卷](../virtual/docker/using_docker/docker_volume)
>
> Docker容器的外部TCP访问通过host主机[HAProxy](../service/proxy/mysql_load_balancing_haproxy)实现，这样可以不必依赖复杂的[Docker端口映射](../virtual/docker/using_docker/mapping_docker_container_port)。

# sshfs

* 桌面电脑的用户账号是`huatai`(uid=1000,gid=1000)，远程服务器的用户账号是`admin`(uid=505,gid=505)；所有容器中用户账号都是`admin`(uid=505,gid=505)
* 桌面通过`ssh admin@server_ip`访问服务器，挂载sshfs，这样就可以统一访问所有的虚拟机的数据目录

> 远程服务器运行Docker环境，所有容器共享卷位于 `/var/lib/docker/volumes/share-data/_data` - 参考 [Docker卷](../virtual/docker/using_docker/docker_volume)

* 远程服务器目录权限设置

> 远程docker需要配合设置：首先将`admin`用户加入到`root`用户组，然后修改docker目录使得`root`组用户能够访问 - 这是因为Docker目录的安全设置，默认只有root用户可以访问俄，root组则只能只读访问，修改以后，则root组用户可以在其中子目录中读写文件，方便远程共享访问。

```
chmod 751 /var/lib/docker
chmod 750 /var/lib/docker/volumes
```

* 执行sshfs挂载

```
sshfs admin@192.168.1.12:/var/lib/docker/volumes/share-data/_data /home/huatai/Documents/devstack/share-data -C
```

> 如果远程主机的ssh端口是9876，则`sshfs`命令还可以加上参数`-p 9876`

* 卸载sshfs挂载

```
fusermount -u /home/huatai/Documents/devstack/share-data
```

# 参考

* [CentOS 7 NFS设置](../service/nfs/setup_nfs_on_centos7)