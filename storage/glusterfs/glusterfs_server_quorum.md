# 现状和问题

GlusterFS是基于网络的分布式文件系统，具有多副本镜像的容灾能力，并且可以实现`单个`机房网络（或服务器）故障时，不影响客户端访问。机房网络（或服务器）恢复时候，能够自动平衡恢复副本，对挂载GlusterFS的客户端（应用）是透明的容灾，无需用户干预处理。

但是，实际生产环境中，如果出现核心网络故障，会导致各个机房之间网络断开，此时所有机房都成为`孤岛`。由于分布式文件系统是需要通过心跳来判断对方节点是否正常，这种`孤岛`的网络故障会使得所有的GlusterFS认为自己节点是正常的，对方节点异常，此时继续提供存储服务的话，会导致各个机房的客户端写入冲突的数据，也就导致了`脑裂`。

在这种多机房网络故障的情况下，我们希望做到自动停止GluserFS服务，等网络恢复以后再自动恢复服务。同时，如果只是个别机房（单个机房）故障，另外2个机房网络互通正常，我们仍希望通过正常的GlusterFS服务继续提供服务，实现服务高可用。

# 解决方案

解决的方案是使用GlusterFS的`quorum`功能：原理是`服务器节点发现低于指定比率服务节点存活时停止工作`。

在3个机房部署跨机房3个副本的GlusterFS集群，并设置 quorum 为 `51%`

    gluster volume set mqha cluster.server-quorum-type server
    gluster volume set all cluster.server-quorum-ratio 51%

> 参考[Features/Server-quorum](http://www.gluster.org/community/documentation/index.php/Features/Server-quorum)，默认并没有开启`cluster.server-quorum-type server`，**只有开启了这个参数设置才能使得Quorum生效。**

当一个机房和其他机房断开连接时，这个机房的服务器会判断自己机房的服务器节点数量只有`1/3`，低于quorum阀值，就会停止工作。而另外两个机房相互之间通讯的节点`2/3`，大于 `51%`，可以继续提供服务。

如果3个机房同时出现通讯中断，则整个集群停止服务。

# 实验室验证

线下测试环境部署了3个节点

    192.168.1.55
    192.168.2.55
    192.168.3.55

## 3节点测试卷的创建

> 这里建立的卷名称是`mqha`，是一个共享队列

在3个节点上准备好brick

    mv /home/mqha /home/mqha.bak
    mkdir /home/mqha

在一个节点上重建卷

    gluster volume create mqha replica 3 transport tcp \
    192.168.1.55:/home/mqha \
    192.168.2.55:/home/mqha \
    192.168.3.55:/home/mqha

    gluster volume set mqha cluster.server-quorum-type server
    gluster volume set all cluster.server-quorum-ratio 51%

> 注意：设置`cluster.server-quorum-ratio`需要全局，对`all`设置，而设置`cluster.server-quorum-type`需要对单个卷设置

启动卷

    gluster volume start mqha

在3个节点上添加挂载配置`/etc/fstab`

    192.168.1.55:/home/mqha    /mqha    glusterfs    defaults,_netdev,direct-io-mode=enable,backupvolfile-server=192.168.2.55    0    0

在3个节点挂载

    mount /mqha

在其中一个节点上设置好目录权限

    chown mqm:mqm /mqha

## 测试一：3个机房全部互相断开

用iptables禁掉了两两之间的连接

    192.168.1.55:
    iptables -I INPUT -s 192.168.2.55 -j DROP
    iptables -I INPUT -s 192.168.3.55 -j DROP

    192.168.2.55：
    iptables -I INPUT -s 192.168.1.55 -j DROP
    iptables -I INPUT -s 192.168.3.55 -j DROP

    192.168.3.55：
    iptables -I INPUT -s 192.168.1.55 -j DROP
    iptables -I INPUT -s 192.168.2.55 -j DROP

此时在所有节点上使用 `df -h` 都会卡住，然后过一会，再使用`df -h`，可以看到glusterfs的卷`mqha`已经消失了

    [2016-01-28 07:55:00.656830] I [client.c:2229:client_rpc_notify] 0-mqha-client-2: disconnected from 192.168.3.55:49153. Client process will keep trying to connect to glusterd until brick's port is available
    [2016-01-28 07:55:00.656846] W [socket.c:589:__socket_rwv] 0-mqha-client-1: readv on 192.168.2.55:49153 failed (Connection timed out)
    [2016-01-28 07:55:00.656863] I [client.c:2229:client_rpc_notify] 0-mqha-client-1: disconnected from 192.168.2.55:49153. Client process will keep trying to connect to glusterd until brick's port is available
    [2016-01-28 07:55:00.656872] E [afr-common.c:4304:afr_notify] 0-mqha-replicate-0: All subvolumes are down. Going offline until atleast one of them comes back up.
    [2016-01-28 07:55:03.073755] E [client-handshake.c:1760:client_query_portmap_cbk] 0-mqha-client-0: failed to get the port number for remote subvolume. Please run 'gluster volume status' on server to see if brick process is running.
    [2016-01-28 07:55:03.073796] I [client.c:2229:client_rpc_notify] 0-mqha-client-0: disconnected from 192.168.1.55:24007. Client process will keep trying to connect to glusterd until brick's port is available
    [2016-01-28 07:58:20.540796] E [socket.c:2244:socket_connect_finish] 0-mqha-client-2: connection to 192.168.3.55:24007 failed (Connection timed out)

注意：这里可以看到一句日志

    E [afr-common.c:4304:afr_notify] 0-mqha-replicate-0: All subvolumes are down. Going offline until atleast one of them comes back up.

## 测试二：恢复2个机房互联

清除掉 192.168.2.55 和 192.168.3.55 上的iptables，模拟这两个机房恢复网络

    iptables -F

此时观察这两个恢复节点的日志，可以看到

    [2016-01-28 08:04:36.214768] I [client-handshake.c:1677:select_server_supported_programs] 0-mqha-client-1: Using Program GlusterFS 3.3, Num (1298437), Version (330)
    [2016-01-28 08:04:36.214988] I [client-handshake.c:1462:client_setvolume_cbk] 0-mqha-client-1: Connected to 192.168.2.55:49153, attached to remote volume '/home/mqha'.
    [2016-01-28 08:04:36.215002] I [client-handshake.c:1474:client_setvolume_cbk] 0-mqha-client-1: Server and Client lk-version numbers are not same, reopening the fds
    [2016-01-28 08:04:36.215039] I [afr-common.c:4267:afr_notify] 0-mqha-replicate-0: Subvolume 'mqha-client-1' came back up; going online.
    [2016-01-28 08:04:36.215741] I [client-handshake.c:450:client_set_lk_version_cbk] 0-mqha-client-1: Server lk version = 1
    [2016-01-28 08:04:51.214373] I [rpc-clnt.c:1729:rpc_clnt_reconfig] 0-mqha-client-2: changing port to 49153 (from 0)
    [2016-01-28 08:04:51.214731] I [client-handshake.c:1677:select_server_supported_programs] 0-mqha-client-2: Using Program GlusterFS 3.3, Num (1298437), Version (330)
    [2016-01-28 08:04:51.214935] I [client-handshake.c:1462:client_setvolume_cbk] 0-mqha-client-2: Connected to 192.168.3.55:49153, attached to remote volume '/home/mqha'.
    [2016-01-28 08:04:51.214950] I [client-handshake.c:1474:client_setvolume_cbk] 0-mqha-client-2: Server and Client lk-version numbers are not same, reopening the fds
    [2016-01-28 08:04:51.216591] I [client-handshake.c:450:client_set_lk_version_cbk] 0-mqha-client-2: Server lk version = 1

注意其中：有恢复卷的日志

    [afr-common.c:4267:afr_notify] 0-mqha-replicate-0: Subvolume 'mqha-client-1' came back up; going online.

此时，在这两个节点上，会自动重新挂载卷，用 `df -h` 可以看到

    127.0.0.1:/mqha             922G   65G  857G   7% /mqha

注意，这时候 192.168.1.55 网络尚未恢复，所以在这个节点还看不到挂载的卷

## 测试三：恢复最后一个机房互联

再在 192.168.1.55 清除掉iptables模拟最后一个机房恢复

    iptables -F

很快这个节点也重新挂载上了卷 mqha，并且可以看到，在192.168.2.55 和 192.168.3.55前面恢复后，192.168.1.55恢复之前的文件也被同步回来。

# 小结

上述实验验证了GlusterFS的Quorum设置：

* 单机房故障，正常工作的两个机房可以继续提供GlusterFS服务，对应用无影响（会有短暂的hang，默认最长41秒，可缩短时间）。当单机房故障恢复后，无需人工干预，自动平衡数据恢复到3个副本。这种故障情况下能够保持高可用。
* 当发生两两不能互通情况（所有3个机房成为孤岛），则glusterfs自动停止服务，避免脏数据影响产生脑裂。当机房恢复服务，GlusterFS也能自动恢复服务，无需人工干预。这种故障情况下，保证数据安全。

# 参考

* [Configuring Server-Side Quorum](https://access.redhat.com/documentation/en-US/Red_Hat_Storage/2.0/html/Administration_Guide/sect-User_Guide-Managing_Volumes-Quorum.html)
* [Features/Server-quorum](http://www.gluster.org/community/documentation/index.php/Features/Server-quorum)
* [Server Quorum](http://gluster.readthedocs.org/en/release-3.7.0/Features/server-quorum/)
