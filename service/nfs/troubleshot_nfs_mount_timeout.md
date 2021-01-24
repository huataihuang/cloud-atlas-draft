# 问题

* `/etc/fstab` 的NFS配置

```
nfs.example.com:/vol/data /mnt/data nfs     rw,soft,intr,vers=3,proto=tcp,rsize=32768,wsize=32768   0       0
```

* 挂载超时

```
#mount /mnt/data
mount.nfs: Connection timed out
```

> 对于NFS v3挂载，默认采用的是UDP协议，所以如果挂载参数中没有指定 `proto=tcp` 则客户端访问采用UDP协议。通常防火墙开启了TCP允许访问，但是UDP端口往往关闭，所以排查时候需要特别注意

# 排查

这里NFS挂载是TCP协议，所以检查端口

* 检查NFS端口

```bash
[root@nfs-client /root]
#telnet nfs.example.com 2049
Trying 192.168.1.53...
Connected to nfs.example.com.
Escape character is '^]'.

[root@nfs-client /root]
#telnet nfs.example.com 111
Trying 192.168.1.53...
Connected to nfs.example.com.
Escape character is '^]'.
```

看起来端口已经打开

* 通过verbose方式挂载存储查看:

```bash
#mount -v -o tcp,mountproto=tcp,nfsvers=3 -t nfs nfs.example.com:/vol/data /mnt/data
mount.nfs: timeout set for Mon Sep 21 11:08:44 2020
mount.nfs: trying text-based options 'tcp,vers=3,addr=192.168.1.53'
mount.nfs: prog 100003, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100003 vers 3 prot TCP port 2049
mount.nfs: prog 100005, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100005 vers 3 prot TCP port 4046
mount.nfs: mount(2): Connection timed out
mount.nfs: trying text-based options 'tcp,vers=3,addr=192.168.1.53'
mount.nfs: prog 100003, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100003 vers 3 prot TCP port 2049
mount.nfs: prog 100005, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100005 vers 3 prot TCP port 4046
mount.nfs: mount(2): Connection timed out
mount.nfs: Connection timed out
```

看起来像是端口 4096 无法打开，但是实际上检查端口也是通的

```
[root@nfs-client /root]
#telnet nfs.example.com 4046
Trying 192.168.1.53...
Connected to nfs.example.com.
Escape character is '^]'.
```

* 对比测试了正常的 nfs-client-good

```bash
[root@nfs-client-good /etc]
#cat /etc/fstab 
nfs.example.com:/vol/data /mnt/data nfs     rw,soft,intr,vers=3,proto=tcp,rsize=32768,wsize=32768   0       0

[root@nfs-client-good /etc]
#mount /mnt/data

[root@nfs-client-good /etc]
#df -h
Filesystem            Size  Used Avail Use% Mounted on
/                      50G 1002M   50G   2% /
/dev/v01d             5.0G   36K  5.0G   1% /dev/shm
/dev/v02d              50G 1002M   50G   2% /home/admin/conf
/dev/v03d              50G 1002M   50G   2% /home/admin/logs
/dev/v04d              50G 1002M   50G   2% /home/staragent/plugins
shm                   5.0G   36K  5.0G   1% /dev/shm
nfs.example.com:/vol/data
                      2.0T  1.6T  436G  79% /mnt/data
```

使用debug模式检查完全没有问题

```
[root@nfs-client-good /root]
#mount -v -o tcp,mountproto=tcp,nfsvers=3 -t nfs nfs.example.com:/vol/data /mnt/data
mount.nfs: timeout set for Mon Sep 21 03:32:11 2020
mount.nfs: trying text-based options 'tcp,mountproto=tcp,nfsvers=3,addr=192.168.1.53'
mount.nfs: prog 100003, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100003 vers 3 prot TCP port 2049
mount.nfs: prog 100005, trying vers=3, prot=6
mount.nfs: trying 192.168.1.53 prog 100005 vers 3 prot TCP port 4046

[root@nfs-client-good /root]
#df -h
Filesystem            Size  Used Avail Use% Mounted on
/                      50G 1003M   50G   2% /
/dev/v01d             5.0G   36K  5.0G   1% /dev/shm
/dev/v02d              50G 1003M   50G   2% /home/admin/conf
/dev/v03d              50G 1003M   50G   2% /home/admin/logs
/dev/v04d              50G 1003M   50G   2% /home/staragent/plugins
shm                   5.0G   36K  5.0G   1% /dev/shm
nfs.example.com:/vol/data
                      2.0T  1.6T  436G  79% /mnt/data
```

*  检查从客户端访问服务器的mountpoint

```
#showmount -e nfs.example.com
Export list for nfs.example.com:
...
/vol/data         192.0.0.0/8,10.0.0.0/8
...
```

对比检查，我们的异常服务器IP地址是 `192.168.1.187/20` 已经包含在 `/vol/data` 的访问允许IP地址段 `192.0.0.0/8`

* 检查服务器上的服务:

```bash
[root@nfs-client /root]
#rpcinfo -p nfs.example.com
   program vers proto   port  service
    100011    1   udp   4049  rquotad
    100024    1   tcp   4047  status
    100024    1   udp   4047  status
    100021    4   tcp   4045  nlockmgr
    100021    3   tcp   4045  nlockmgr
    100021    1   tcp   4045  nlockmgr
    100021    4   udp   4045  nlockmgr
    100021    3   udp   4045  nlockmgr
    100021    1   udp   4045  nlockmgr
    100005    3   tcp   4046  mountd
    100003    3   tcp   2049  nfs
    100005    2   tcp   4046  mountd
    100005    1   tcp   4046  mountd
    100003    2   tcp   2049  nfs
    100005    3   udp   4046  mountd
    100003    3   udp   2049  nfs
    100005    2   udp   4046  mountd
    100005    1   udp   4046  mountd
    100003    2   udp   2049  nfs
    100000    2   tcp    111  portmapper
    100000    2   udp    111  portmapper
```

* 换一种挂载协议尝试:

```
mount -v -o udp,mountproto=udp,nfsvers=3 -t nfs nfs.example.com:/vol/data /mnt/data
```

同样也出现访问 4046 端口超时

```
mount.nfs: timeout set for Mon Sep 21 11:27:27 2020
mount.nfs: trying text-based options 'udp,mountproto=udp,nfsvers=3,addr=192.168.1.53'
mount.nfs: prog 100003, trying vers=3, prot=17
mount.nfs: trying 192.168.1.53 prog 100003 vers 3 prot UDP port 2049
mount.nfs: prog 100005, trying vers=3, prot=17
mount.nfs: trying 192.168.1.53 prog 100005 vers 3 prot UDP port 4046
mount.nfs: mount(2): Connection timed out
...
```

不过，根据 `telnet 192.168.1.53 4046` 可以看到NAS服务器端口是可以访问的，后来根据tcpdump查看，客户端发出端口4046的SYN请求后，NAS服务器端没有返回对应的ACK。

> 实际上这个抓包对比过程比较曲折，我花费了几天时间才找出导致这个NFS无法挂载的真正原因，涉及的问题和内核相关，使我对NFS以及网络问题排查有了一些心得，我会重新写几篇文档来总结。

# tcpdump抓包

* 使用以下命令抓包

```
tcpdump -i eth0 -n host 192.168.1.53

tcpdump -i eth0 -nn -vv -e host 192.168.1.53
```

显示信息

```
16:03:24.164520 IP 192.168.0.187.33763 > 192.168.1.53.acp-proto: Flags [.], ack 30, win 502, options [nop,nop,TS val 1341343592 ecr 766772696], length 0
16:03:24.164838 IP 192.168.0.187.1020 > 192.168.1.53.acp-proto: Flags [S], seq 2722685289, win 64240, options [mss 1460,sackOK,TS val 1341343592 ecr 0,nop,wscale 7], length 0
16:03:25.184372 IP 192.168.0.187.1020 > 192.168.1.53.acp-proto: Flags [S], seq 2722685289, win 64240, options [mss 1460,sackOK,TS val 1341344612 ecr 0,nop,wscale 7], length 0
16:03:27.232376 IP 192.168.0.187.1020 > 192.168.1.53.acp-proto: Flags [S], seq 2722685289, win 64240, options [mss 1460,sackOK,TS val 1341346660 ecr 0,nop,wscale 7], length 0
...
```

* 抓包对比

```
tcpdump -w /tmp/nfs.pcap -nni eth0 host 192.168.1.53
```

在wireshark中查看，可以看到 `192.168.0.187.33763 > 192.168.1.53.acp-proto` 第一次发出 `[S](Syn)` 之后，NAS服务器端没有任何ACK包，所以后面都是重复的 `[S](Syn)` 



# 参考

* [How to troubleshoot an NFS mount timeout?](https://access.redhat.com/solutions/1751813)