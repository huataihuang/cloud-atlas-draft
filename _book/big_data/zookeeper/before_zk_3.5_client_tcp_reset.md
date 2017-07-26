# ZooKeeper 服务器的 TCP reset

> 以下案例为在zk集群中排查client到zk服务器异常的TCP reset问题

*  A集群 `192.168.1.143` 和 `192.168.1.234` 服务器上抓包，发现总是有TCP reset数据包，并且集中指向ZooKeeper服务器 

```
tcpdump -n -i bond0 -v 'tcp[tcpflags] & (tcp-rst) != 0'
```

显示都是到 `A_zk` 服务器 `192.168.2.171` 存在TCP reset

```
16:38:33.018470 IP (tos 0x0, ttl 64, id 50689, offset 0, flags [DF], proto TCP (6), length 40)
    192.168.1.143.52574 > 192.168.2.171.10245: Flags [R], cksum 0xe56c (correct), seq 2768606052, win 0, length 0
16:40:00.630062 IP (tos 0x6a,ECT(0), ttl 53, id 2754, offset 0, flags [DF], proto TCP (6), length 40)
    10.195.88.73.http > 192.168.1.143.52089: Flags [R], cksum 0x9216 (correct), seq 401284485, win 0, length 0
```

```
16:57:52.337555 IP (tos 0x0, ttl 64, id 51388, offset 0, flags [DF], proto TCP (6), length 40)
    192.168.1.234.54419 > 192.168.2.171.10245: Flags [R], cksum 0x30dd (correct), seq 171170614, win 0, length 0
16:57:52.467600 IP (tos 0x0, ttl 64, id 51389, offset 0, flags [DF], proto TCP (6), length 40)
    192.168.1.234.54421 > 192.168.2.171.10245: Flags [R], cksum 0xa076 (correct), seq 2326391588, win 0, length 0
```

反过来在ZooKeeper服务器 `192.168.2.171` 上抓包，则发现这个ZK服务器和很多服务器都存在这样的TCP reset，大量显示

```
15:39:03.160732 IP (tos 0x0, ttl  59, id 38500, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.4.223.40460 > 192.168.2.171.10245: R, cksum 0xffb7 (correct), 450899777:450899777(0) win 0
15:39:03.190684 IP (tos 0x0, ttl  59, id 51258, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.2.173.38492 > 192.168.2.171.10245: R, cksum 0x9074 (correct), 4176333400:4176333400(0) win 0
15:39:03.260633 IP (tos 0x0, ttl  59, id 7546, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.3.46.42160 > 192.168.2.171.10245: R, cksum 0x0bd4 (correct), 4204609140:4204609140(0) win 0
```

同样的情况，在其他ZooKeeper服务器上抓包相同情况，发现这种`tcp-rst`是始终存在的。

在 [Release Notes - ZooKeeper - Version 3.5.0](https://zookeeper.apache.org/doc/r3.5.0-alpha/releasenotes.html) 提到了

[ZOOKEEPER-1702](https://issues.apache.org/jira/browse/ZOOKEEPER-1702) - ZooKeeper client may write operation packets before receiving successful response to connection request, can cause TCP RST 

如何检查ZooKeeper的版本和状态参考 [How to check if ZooKeeper is running or up from command prompt?](http://stackoverflow.com/questions/29106546/how-to-check-if-zookeeper-is-running-or-up-from-command-prompt) 所介绍的 [ZooKeeper Commands: The Four Letter Words](https://zookeeper.apache.org/doc/r3.1.2/zookeeperAdmin.html#sc_zkCommands)：

Zookeeper会对一些命令响应，每个命令是由4个字符组成的，可以通过`telnet`或`nc`在client port上向ZooKeeper发送指令，其中有关服务器运行健康状态并且无害的命令如下：

* `stat` - 列出有关性能和连接客户端的状态
* `ruok` - 检查服务是否运行在`non-error`状态。如果服务在运行，则会响应`imok`
* `envi` - 打印详细的服务环境

`client port`端口请检查 `zoo.cfg` 配置文件，例如配置成 `clientPort=2181`

举例

```
echo stat | nc 127.0.0.1 2181
echo ruok | nc 127.0.0.1 2181
```

还有就是比较危险的停机命令

* `kill` - 停止zk服务

使用`echo stat | nc 127.0.0.1 2181`可以检查出ZooKeeper服务器版本。如果检查 ZooKeeper版本低于3.5，则出现TCP RST是已知的软件Bug，否则需要仔细排查网络原因或者服务器故障。