# NFS服务器

* 服务器端安装NFS服务：

```
sudo apt install nfs-kernel-server
```

* 配置`/etc/exports`文件

> 这里案例是共享docker存储卷，方便远程访问虚拟机的home目录，挂载磁盘进行远程开发

```
/var/lib/docker/volumes/share-data/_data    *(rw,sync,no_root_squash,no_subtree_check)
```

* 启动服务

```
sudo systemctl start nfs-kernel-server.service
```

# 防火墙设置

在ubuntu上如果启动了ufw防火墙[使用ufw配置NAT masquerade](../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw)，还需要做如下设置：

* 编辑`/etc/default/nfs-kernel-server`修改如下行：

```
RPCMOUNTDOPTS=--manage-gids
```

修改成：

```
RPCMOUNTDOPTS="--manage-gids -p 2000"
```

* 重启nfs服务

```
sudo /etc/init.d/nfs-kernel-server restart
```

但是，发现重启了nfs服务哦之后，依然没有监听2000端口。使用命令`rpcinfo -p <server_ip>`显示`mountd`服务并没有监听在`2000`端口上，还是分散在不同的端口

```
# rpcinfo -p air
   program vers proto   port  service
    100000    4   tcp    111  portmapper
    100000    3   tcp    111  portmapper
    100000    2   tcp    111  portmapper
    100000    4   udp    111  portmapper
    100000    3   udp    111  portmapper
    100000    2   udp    111  portmapper
    100005    1   udp  47706  mountd
    100005    1   tcp  47954  mountd
    100005    2   udp  41211  mountd
    100005    2   tcp  57893  mountd
    100005    3   udp  33743  mountd
    100005    3   tcp  38744  mountd
    100003    2   tcp   2049  nfs
    100003    3   tcp   2049  nfs
    100003    4   tcp   2049  nfs
    100227    2   tcp   2049
    100227    3   tcp   2049
    100003    2   udp   2049  nfs
    100003    3   udp   2049  nfs
    100003    4   udp   2049  nfs
    100227    2   udp   2049
    100227    3   udp   2049
    100021    1   udp   2002  nlockmgr
    100021    3   udp   2002  nlockmgr
    100021    4   udp   2002  nlockmgr
    100021    1   tcp   2001  nlockmgr
    100021    3   tcp   2001  nlockmgr
    100021    4   tcp   2001  nlockmgr
```

仔细看了`systemctl`输出，原来`mountd`是独立的服务`nfs-mountd.service`，显示如下：

```
nfs-config.service                                      loaded active exited    Preprocess NFS configuration
nfs-idmapd.service                                      loaded active running   NFSv4 ID-name mapping service
nfs-mountd.service                                      loaded active running   NFS Mount Daemon
nfs-server.service                                      loaded active exited    NFS server and services
```

但是，直接重启`nfs-mountd.service`依然无法使得`mountd`监听端口修正到`2000`上。最后参考[How to restart mountd without rebooting the machine?](https://askubuntu.com/questions/944054/how-to-restart-mountd-without-rebooting-the-machine/1017531#1017531) 按照指定顺序重启服务才生效：

> 原因是需要首先重启`nfs-config.service`

```
sudo systemctl try-restart nfs-config.service \
                           rpcbind.service \
                           rpc-statd.service \
                           nfs-server.service
```

`systemd`提供了重新配置`nlockmgr`而无需重启的方法。配置`/etc/sysctl.d/30-nfs-ports.conf`内容如下：

```
fs.nfs.nlm_tcpport = 2001
fs.nfs.nlm_udpport = 2002
```

以上设置`nlockmgr`监听端口`2001`(TCP)和`2002`(UDP)

执行以下命令重新加载配置

```
sysctl --system
```

* 现在配置UFW接受进入服务端口

```
ufw allow from 192.168.1.0/24 to any port 111
ufw allow from 192.168.1.0/24 to any port 2049
ufw allow from 192.168.1.0/24 to any port 2000
ufw allow from 192.168.1.0/24 to any port 2001
ufw allow from 192.168.1.0/24 to any port 2002
```

> 在 [使用ufw配置NAT masquerade](../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw) 设置了NAT masquerade网络，所以在网关防火墙上执行

```
ufw allow 111
ufw allow 2049
ufw allow 13025
```

* (可选)如果NFS服务在另外一台服务器上，则作为网关的防火墙还需要设置IP转发和端口映射 - 这里对外网卡接口是无线网卡`wlp3s0`，内部网络是`192.168.0.0/24`。详细见[使用ufw配置NAT masquerade](../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw)

```bash
# nat Table rules
*nat
:PREROUTING ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]

# Port Forwardings
-A PREROUTING -i wlp3s0 -p tcp --dport 111 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p udp --dport 111 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p tcp --dport 2049 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p udp --dport 2049 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p tcp --dport 2000 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p udp --dport 2000 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p tcp --dport 2001 -j DNAT --to-destination 192.168.0.2
-A PREROUTING -i wlp3s0 -p udp --dport 2002 -j DNAT --to-destination 192.168.0.2

# Forward traffic from eth1 through eth0.
#-A POSTROUTING -s 192.168.0.0/24 -o enp0s25 -j MASQUERADE
-A POSTROUTING -s 192.168.0.0/24 -o wlp3s0 -j MASQUERADE

# don't delete the 'COMMIT' line or these nat table rules won't be processed
COMMIT
```

# 服务器用户目录uid和客户端不一致的处理方法

Linux上用户目录的`uid/gid`是`505`（admin），而本地Mac上的用户`uid/gid`是`501`，使用NFS认证的时候采用的是`uid`对应授权。强制去修改用户`uid`和`gid`会带来其他应用风险。

由于NFS服务器可以管理，所以修改服务器NFS输出，将服务器上账号`admin`的`uid`和`gid`映射成`anonuid`和`anongid`，

实际操作如下：

* 修改服务器上的`/etc/exports`

```
/var/lib/docker/volumes/share-data/_data *(rw,async,insecure,all_squash,no_subtree_check,anonuid=505,anongid=505)
```

> 注意：这是将服务器上用户目录的`uid`和`gid`映射成匿名id，会带来安全风险，所以务必做好安全控制。

# 参考

* [How To Set Up an NFS Mount on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nfs-mount-on-ubuntu-16-04)
* [Ubuntu Network File System (NFS)](https://help.ubuntu.com/lts/serverguide/network-file-system.html)
* [Setting Up iptables for NFS on Ubuntu](https://www.peterbeard.co/blog/post/setting-up-iptables-for-nfs-on-ubuntu/)
* [nfs is blocked by ufw even though ports are opened](https://askubuntu.com/questions/103910/nfs-is-blocked-by-ufw-even-though-ports-are-opened)
* [Using NFS to Share Data Between UNIX and Mac OS X](http://blog.fosketts.net/2015/03/20/using-nfs-to-share-data-between-unix-and-mac-os-x/)