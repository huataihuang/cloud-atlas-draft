通常可以使用`netstat`命令来获取Linux服务器的TCP连接数量

```
netstat -tan | grep ESTABLISHED | wc -l
```

然而，在非常繁忙的高负载服务器上，上述`netstat`命令执行非常缓慢并且消耗服务器资源。

解决的方法是使用`ss`命令，因为`ss`命令是直接读取`/proc`中数据来展示，所以消耗资源很少

```
ss -neopt state established
```

输入显示如下

```
Recv-Q Send-Q             Local Address:Port               Peer Address:Port
0      0                  10.145.130.40:10261            10.145.129.170:33728  ino:3046071811 sk:0d8f1800ffff8800
0      0                  10.145.130.40:10261             10.145.129.43:54499  ino:3045520986 sk:5a9f4200ffff8800
0      0                  10.145.130.40:58483            10.145.128.146:10261  ino:3045819769 sk:4f185a00ffff8800
0      0                  10.145.130.40:55188            10.145.129.111:10261  ino:3043161699 sk:57912400ffff8800
0      0                  10.145.130.40:60173            10.145.130.178:10261  ino:2984377591 sk:a5b29800ffff8801
0      0                  10.145.130.40:10261             10.145.128.79:45885  ino:3045756624 sk:49e59200ffff8801
0      0                  10.145.130.40:58858              10.145.130.8:10261  ino:3023808248 sk:cf60f800ffff8801
0      0                  10.145.130.40:46841              10.145.128.8:10261  ino:3021588042 sk:6091ec00ffff8800
0      0                  10.145.130.40:2908              10.145.129.18:2909   timer:(keepalive,29sec,0) ino:143071699 sk:7b11b000ffff8
800
```

> 这里`Recv-Q`和`Send-Q`表示数据包收发队列，正常情况下数值应该是0，如果数值较高，表明队列堆积，就是接收方存在速度问题或者发送方发送频率太快导致堆积。可接受短暂的非0情况。

参考 [Netstat 中 Recv-Q和Send-Q状态](http://www.code521.com/index.php/archives/993)

> recv-Q 表示网络接收队列：表示收到的数据已经在本地接收缓冲，但是还有多少没有被进程取走，recv()如果接收队列Recv-Q一直处于阻塞状态，可能是遭受了拒绝服务 `denial-of-service` 攻击。
>
> send-Q 表示网路发送队列：对方没有收到的数据或者说没有Ack的,还是本地缓冲区。如果发送队列Send-Q不能很快的清零，可能是有应用向外发送数据包过快，或者是对方接收数据包不够快。

如果要获取一个比较简单的连接统计，可以使用

```
ss -s
```

可以以最快的速度获得统计结果

```
Total: 15490 (kernel 15579)
TCP:   15131 (estab 14972, closed 82, orphaned 0, synrecv 0, timewait 68/256), ports 0

Transport Total     IP        IPv6
*	  15579     -         -
RAW	  0         0         0
UDP	  29        28        1
TCP	  15049     15022     27
INET	  15078     15050     28
FRAG	  0         0         0
```

在`/proc`文件系统中，有一个和网络相关的`snmp`统计数据，即`/proc/net/snmp`，这个节点不需要安装任何snmp软件也可使用，其内容类似如下

```
Tcp: RtoAlgorithm RtoMin RtoMax MaxConn ActiveOpens PassiveOpens AttemptFails EstabResets CurrEstab InSegs OutSegs RetransSegs InErrs OutRsts
Tcp: 1 200 120000 -1 673265820 787678764 16507566 4017787 15052 122312668093 111482757452 34445044 0 3043752
```

其中第10列数据就是当前Tcp连接的数值，所以可以使用如下命令获取

```
cat /proc/net/snmp | grep Tcp | awk '{print $10}'
```

输出就是

```
CurrEstab
14738
```

# 参考

* [Get number of TCP established connections](http://serverfault.com/questions/646729/get-number-of-tcp-established-connections)