CentOS 7使用`systemctl`管理和设置NFS，以下按照服务端和客户端设置分别介绍。

# 设置Linux服务端

将移动硬盘挂载到 `/data` 目录

```
mount /dev/sdb1 /data
```

使用以下命令安装 NFS 支持

```
yum install nfs-utils nfs-utils-lib
```

设置nfs相关服务在操作系统启动时启动

```
systemctl enable rpcbind
systemctl enable nfs-server
systemctl enable nfs-lock
systemctl enable nfs-idmap  
```

启动nfs服务

```
systemctl start rpcbind
systemctl start nfs-server
systemctl start nfs-lock
systemctl start nfs-idmap
```

服务器端设置NFS卷输出，即编辑 `/etc/exports` 添加：

```
/data	10.211.55.0/24(rw,sync,no_root_squash,no_subtree_check)
```

> /data – 共享目录
> 
> 10.211.55.0/24 – 允许访问NFS的客户端IP地址段
>
> rw – 允许对共享目录进行读写
>
> sync – 实时同步共享目录
>
> no_root_squash – 允许root访问
> 
> no_all_squash - 允许用户授权
>
> no_subtree_check - 如果卷的一部分被输出，从客户端发出请求文件的一个常规的调用子目录检查验证卷的相应部分。如果是整个卷输出，禁止这个检查可以加速传输。 
> 
> no_subtree_check - If only part of a volume is exported, a routine called subtree checking verifies that a file that is requested from the client is in the appropriate part of the volume. If the entire volume is exported, disabling this check will speed up transfers.  [Setting Up an NFS Server](http://nfs.sourceforge.net/nfs-howto/ar01s03.html)

## NFS服务器排查

启动 `nfs-server` 时候报错

```
# systemctl start nfs-server
Job for nfs-server.service failed. See 'systemctl status nfs-server.service' and 'journalctl -xn' for details.

# systemctl status nfs-server.service
nfs-server.service - NFS server and services
Loaded: loaded (/usr/lib/systemd/system/nfs-server.service; enabled)
Active: failed (Result: exit-code) since Wed 2015-09-16 16:54:14 CST; 51s ago
Process: 17476 ExecStartPre=/usr/sbin/exportfs -r (code=exited, status=1/FAILURE)

Sep 16 16:54:14 ats-30-1 systemd[1]: Starting NFS server and services...
Sep 16 16:54:14 ats-30-1 exportfs[17476]: exportfs: /iso requires fsid= for NFS export
Sep 16 16:54:14 ats-30-1 systemd[1]: nfs-server.service: control process exited, code=exited status=1
Sep 16 16:54:14 ats-30-1 systemd[1]: Failed to start NFS server and services.
Sep 16 16:54:14 ats-30-1 systemd[1]: Unit nfs-server.service entered failed state.
Hint: Some lines were ellipsized, use -l to show in full.
```

参考 [Using exportfs with NFSv4](https://www.centos.org/docs/5/html/Deployment_Guide-en-US/s1-nfs-server-config-exports.html)

> An NFSv4 client now has the ability to see all of the exports served by the NFSv4 server as a single file system, called the NFSv4 pseudo-file system. On Red Hat Enterprise Linux, the pseudo-file system is identified as a single, real file system, identified at export with the fsid=0 option.

修改 `/etc/exportfs`，添加 `fsid=0`

```
/iso	*(fsid=0,rw,sync,no_subtree_check,all_squash,anonuid=36,anongid=36)
```

# NFS客户端挂载

Linux挂载NFS的客户端非常简单的命令，先创建挂载目录，然后用 `-t nfs` 参数挂载就可以了

```
mount -t nfs  10.211.55.9:/data /data
```

如果要设置客户端启动时候就挂载NFS，可以配置 `/etc/fstab` 添加以下内容

```
10.211.55.9:/data    /data  nfs auto,rw,vers=3,hard,intr,tcp,rsize=32768,wsize=32768      0   0
```

然后在客户端简单使用以下命令就可以挂载

```
mount /data
```

如果出现以下类似报错，则检查一下系统是否缺少`mount.nfs`程序，如果缺少，则表明尚未安装`nfs-utils`工具包，需要补充安装后才能作为客户端挂载NFS

```
mount: wrong fs type, bad option, bad superblock on 10.211.55.9:/data,
       missing codepage or helper program, or other error
       (for several filesystems (e.g. nfs, cifs) you might
       need a /sbin/mount.<type> helper program)

       In some cases useful info is found in syslog - try
       dmesg | tail or so.
```

# 通过防火墙挂载NFS服务

在生产环境，可能会因为安全需求在NFS服务器和客户端之间部署防火墙。此时，NFS客户端挂载的时候会有如下输出报错

```
mount.nfs: Connection timed out
```

参考 [Running NFS Behind a Firewall](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Storage_Administration_Guide/nfs-serverconfig.html#s2-nfs-nfs-firewall-config) 设置防火墙允许访问NFS服务器的服务端口，注意，需要配置NFS服务使用固定端口。

```
MOUNTD_PORT=port
# Controls which TCP and UDP port mountd (rpc.mountd) uses.

STATD_PORT=port
# Controls which TCP and UDP port status (rpc.statd) uses.

LOCKD_TCPPORT=port
# Controls which TCP port nlockmgr (lockd) uses.

LOCKD_UDPPORT=port
# Controls which UDP port nlockmgr (lockd) uses.
```

编辑 `/etc/sysconfig/nfs` 配置文件

```
# TCP port rpc.lockd should listen on.
LOCKD_TCPPORT=32803
# UDP port rpc.lockd should listen on.
LOCKD_UDPPORT=32769

MOUNTD_PORT=892
STATD_PORT=662
```

可以在Linux NFS服务器上执行以下命令获得NFS端口信息

```
rpcinfo -p
```

需要允许以下端口

> NFS的TCP和UDP端口2049
>
> rpcbind/sunrpc的TCP和UDP端口111
>
> 设置 `MOUNTD_PORT` 的TCP和UDP端口
>
> 设置 `STATD_PORT` 的TCP和UDP端口
>
> 设置 `LOCKD_TCPPORT` 的TCP端口
>
> 设置 `LOCKD_UDPPORT` 的UDP端口

```
program vers proto   port  service
100000    4   tcp    111  portmapper
100000    3   tcp    111  portmapper
100000    2   tcp    111  portmapper
100000    4   udp    111  portmapper
100000    3   udp    111  portmapper
100000    2   udp    111  portmapper
100024    1   udp  54305  status
100024    1   tcp  55604  status
100005    1   udp  20048  mountd
100005    1   tcp  20048  mountd
100005    2   udp  20048  mountd
100005    2   tcp  20048  mountd
100005    3   udp  20048  mountd
100005    3   tcp  20048  mountd
100003    3   tcp   2049  nfs
100003    4   tcp   2049  nfs
100227    3   tcp   2049  nfs_acl
100003    3   udp   2049  nfs
100003    4   udp   2049  nfs
100227    3   udp   2049  nfs_acl
100021    1   udp  32769  nlockmgr
100021    3   udp  32769  nlockmgr
100021    4   udp  32769  nlockmgr
100021    1   tcp  32803  nlockmgr
100021    3   tcp  32803  nlockmgr
100021    4   tcp  32803  nlockmgr
100011    1   udp    875  rquotad
100011    2   udp    875  rquotad
100011    1   tcp    875  rquotad
100011    2   tcp    875  rquotad
```

在 Linux NFS 服务器上使用以下命令开启iptables防火墙允许访问以上端口

```
firewall-cmd --permanent --add-port=2049/tcp
firewall-cmd --permanent --add-port=2049/udp
firewall-cmd --permanent --add-port=111/tcp
firewall-cmd --permanent --add-port=111/udp
firewall-cmd --permanent --add-port=892/tcp
firewall-cmd --permanent --add-port=892/udp
firewall-cmd --permanent --add-port=662/tcp
firewall-cmd --permanent --add-port=662/udp
firewall-cmd --permanent --add-port=32803/tcp
firewall-cmd --permanent --add-port=32769/udp
```

在 Linux NFS 服务器上使用以下命令重新加载防火墙规则

```
firewall-cmd --reload
```

> 不过，我实测还是存在访问问题，以后再验证

# 参考

* [Setting Up NFS Server And Client On CentOS 7](http://www.unixmen.com/setting-nfs-server-client-centos-7/)