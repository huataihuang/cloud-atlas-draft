# 网络性能测量的五项指标

* 可用性（availability）

测试网络性能的第一步是确定网络是否正常工作，最简单的方法是使用 ping 命令。通过向远端的机器发送 `icmp echo request`，并等待接收 `icmp echo reply` 来判断远端的机器是否连通，网络是否正常工作。

网络设备内部一般有多个缓冲池，不同的缓冲池使用不同的缓冲区大小，分别用来处理不同大小的分组（packet）。例如交换机中通常具有三种类型的包缓冲：一类针对小的分组，一类针对中等大小的分组，还有一类针对大的分组。为了测试这样的网络设备，测试工具必须要具有发送不同大小分组的能力。Ping 命令的 `-s` 可以指定每次发送的 ping 包大小适合这种场合测试。

* 响应时间（response time）

Ping 命令的 `echo request/reply` 一次往返所花费时间就是响应时间。有很多因素会影响到响应时间，如网段的负荷，网络主机的负荷，广播风暴，工作不正常的网络设备等等。

* 网络利用率（network utilization）

网络利用率是指网络被使用的时间占总时间（即被使用的时间+空闲的时间）的比例。网络测试工具一般使用网络吞吐量和网络带宽容量来确定网络中两个节点之间的性能。

* 网络吞吐量（network throughput）

网络吞吐量是指在某个时刻，在网络中的两个节点之间，提供给网络应用的剩余带宽。有些网络应用程序在开发过程的测试中能够正常运行，但是到实际的网络环境中却无法正常工作（由于没有足够的网络吞吐量）。这是因为测试只是在空闲的网络环境中，没有考虑到实际的网络环境中还存在着其它的各种网络流量。所以，网络吞吐量定义为剩余带宽是有实际意义的。

* 网络带宽容量（network bandwidth capacity）

与网络吞吐量不同，网络带宽容量指的是在网络的两个节点之间的最大可用带宽。这是由组成网络的设备的能力所决定的。
测试网络带宽容量有两个困难之处：在网络存在其它网络流量的时候，如何得知网络的最大可用带宽；在测试过程中，如何对现有的网络流量不造成影响。网络测试工具一般采用 `packet pairs` 和 `packet trains` 技术来克服这样的困难。

# 收集网络性能数据的方式

当确定了网络性能的测试指标以后，就需要使用网络测试工具收集相应的性能数据，分别有三种从网络获取数据的方式：

* 通过snmp协议直接到网络设备中获取，如`net-snmp`工具
* 侦听相关的网络性能数据，典型的工具是`tcpdump`
* 自行产生相应的测试数据，如`netperf`工具


[netperf](http://www.netperf.org/netperf/NetperfPage.html)是一种网络性能的测量工具，主要针对基于TCP或UDP的传输。Netperf根据应用的不同，可以进行不同模式的网络性能测试，即批量数据传输（`bulk data transfer`）模式和请求/应答（`request/reponse`）模式。Netperf测试结果所反映的是一个系统能够以多快的速度向另外一个系统发送数据，以及另外一个系统能够以多块的速度接收数据。

# TCP网络性能

由于TCP协议能够提供端到端的可靠传输，因此被大量的网络应用程序使用。但是，可靠性的建立是要付出代价的。TCP协议保证可靠性的措施，如建立并维护连接、控制数据有序的传递等都会消耗一定的网络带宽。

Netperf可以模拟三种不同的TCP流量模式：

* 单个TCP连接，批量（`bulk`）传输大量数据
* 单个TCP连接，client请求/server应答的交易（`transaction`）方式
* 多个TCP连接，每个连接中一对请求/应答的交易方式

# UDP网络性能

UDP没有建立连接的负担，但是UDP不能保证传输的可靠性，所以使用UDP的应用程序需要自行跟踪每个发出的分组，并重发丢失的分组。

Netperf可以模拟两种UDP的流量模式：

* 从client到server的单向批量传输
* 请求/应答的交易方式

**由于UDP传输的不可靠性，在使用netperf时要确保发送的缓冲区大小不大于接收缓冲区大小，否则数据会丢失，netperf将给出错误的结果。** 因此，对于接收到分组的统计不一定准确，需要结合发送分组的统计综合得出结论。

# Netperf的命令行参数

分服务端程序`netserver`和客户端程序`netperf`，首先在服务器段启动`netserver`监听(也可以让inetd或xinetd来自动启动`netserver`)，然后就可以在客户端启动`netperf`对服务器进行网路流量压测，可以非常方便得到性能指标。

根据作用范围的不同，netperf的命令行参数可以分为两大类：全局命令行参数、测试相关的局部参数，两者之间使用`--`分隔：

```bash
netperf [global options] -- [test-specific options]
````

命令行参数，其它的参数读者可以查询netperf的man手册。

* `-H host` ：指定远端运行netserver的server IP地址。
* `-l testlen`：指定测试的时间长度（秒）
* `-t testname`：指定进行的测试类型，包括`TCP_STREAM`，`UDP_STREAM`，`TCP_RR`，`TCP_CRR`，`UDP_RR`

# Netperf测试网络性能

## 测试批量（`bulk`）网络流量的性能

批量数据传输典型的例子有ftp和其它类似的网络应用（即一次传输整个文件）。根据使用传输协议的不同，批量数据传输又分为TCP批量传输和UDP批量传输。

* `TCP_STREAM`

Netperf缺省情况下进行TCP批量传输，即`-t TCP_STREAM`。测试过程中，netperf向netserver发送批量的TCP数据分组，以确定数据传输过程中的吞吐量：

```bash
netperf -H 192.168.0.28 -l 60
```

输出显示案例

```
TCP STREAM TEST to 192.168.0.28
Recv   Send    Send
Socket Socket  Message  Elapsed
Size   Size    Size     Time     Throughput
bytes  bytes   bytes    secs.    10^6bits/sec
 
 87380  16384  16384    60.00      88.00
```

上述输出的解释：

* 远端系统（即server）使用大小为87380字节的socket接收缓冲
* 本地系统（即client）使用大小为16384字节的socket发送缓冲
* 向远端系统发送的测试分组大小为16384字节
* 测试经历的时间为60秒
* 吞吐量的测试结果为88Mbits/秒

> 在缺省情况下，netperf向发送的测试分组大小设置为本地系统所使用的socket发送缓冲大小。

TCP_STREAM方式下与测试相关的局部参数如下表所示：

| 参数 | 说明 |
| ---- | ---- |
| `-s size` | 设置本地系统的socket发送与接收缓冲大小 |
| `-S size` | 设置远端系统的socket发送与接收缓冲大小 |
| `-m size`	| 设置本地系统发送测试分组的大小 |
| `-M size`	| 设置远端系统接收测试分组的大小 |
| `-D` | 对本地与远端系统的socket设置TCP_NODELAY选项 |

> 在测试中，应该通过调整不同的测试分组(`-m`)来观察什么因素影响了连接的吞吐量。例如，如果怀疑路由器由于缺乏足够的缓冲区看空间，使得转发大的分组时存在问题，就可以增加测试分组大小观察吞吐量的变化。如果较小的分组吞吐量较高，提高分组大小吞吐量反而降低（假设还没有达到带宽上限），则可能是网络中的网络设备或者服务器端存在缓冲区问题。

* `UDP_STREAM`

`UDP_STREAM`用来测试进行UDP批量传输时的网络性能。需要特别注意的是，此时测试分组的大小不得大于`socket`的发送与接收缓冲大小，否则`netperf`会报出错提示

```
./netperf -t UDP_STREAM -H 192.168.0.28 -l 60
UDP UNIDIRECTIONAL SEND TEST to 192.168.0.28
udp_send: data send error: Message too long
```

为了避免这样的情况，可以通过命令行参数限定测试分组的大小，或者增加socket的发送/接收缓冲大小。

```
./netperf -t UDP_STREAM -H 192.168.0.28 -- -m 1024
UDP UNIDIRECTIONAL SEND TEST to 192.168.0.28
Socket  Message  Elapsed      Messages
Size    Size     Time         Okay Errors   Throughput
bytes   bytes    secs            #      #   10^6bits/sec

 65535    1024   9.99       114127      0      93.55
 65535           9.99       114122             93.54
```

`UDP_STREAM`方式的结果中有**两行测试数据**，第一行显示的是本地系统的发送统计，这里的吞吐量表示`netperf`向本地socket发送分组的能力。但是，我们知道，UDP是不可靠的传输协议，发送出去的分组数量不一定等于接收到的分组数量。第二行显示的就是远端系统接收的情况，由于client与server直接连接在一起，而且网络中没有其它的流量，所以本地系统发送过去的分组几乎都被远端系统正确的接收了，远端系统的吞吐量也几乎等于本地系统的发送吞吐量。但是，在实际环境中，一般远端系统的socket缓冲大小不同于本地系统的socket缓冲区大小，而且由于UDP协议的不可靠性，远端系统的接收吞吐量要远远小于发送出去的吞吐量。

## 测试请求/应答（request/response）网络流量的性能

另一类常见的网络流量类型是应用在`client/server`结构中的`request/response`模式。在每次交易（`transaction`）中，client向server**发出小的查询分组**，server接收到请求，经处理后**返回大的结果数据**。如下图所示：

![测试请求/应答（request/response）网络流量的性能](/img/performance/network/netperf_rr.gif)

* `TCP_RR`

TCP_RR方式的测试对象是多次TCP request和response的交易过程，但是它们发生在同一个TCP连接中，这种模式常常出现在数据库应用中。数据库的client程序与server程序建立一个TCP连接以后，就在这个连接中传送数据库的多次交易过程。

# 测试案例

* 测试TCP带宽

```bash
/usr/local/bin/netperf -H 192.168.1.1 -t TCP_RR -l 360000000 -- -m 1501
```

> `-H` 远程服务器IP
>
> `-l` 持续时间，单位秒
>
> `-m` 分组大小

* 测试UCP带宽

```bash
/usr/local/bin/netperf -H 192.168.1.1 -t UDP_STREAM -l 360000000 -- -m 200
```

> `-t UDP_STREAM` 可以测试UDP批量传输时的网络性能

# 问题排查

* `UDP_STREAM`测试时候报错`netperf: send_omni: send_data failed: Network is unreachable`

测试环境如下：

服务器A的IP地址是 `192.168.1.1` ，服务器B的IP地址是 `10.1.1.1`，两个服务器通过三层路由交换机连接，已设置路由规则，所以两个服务器之间`ping`检查网络是完全通的。但是，执行如下命令出现问题

```bash
netperf -H 10.1.1.1 -t UDP_STREAM -l 360000000 -- -m 200
```

提示信息

```
MIGRATED UDP STREAM TEST from 0.0.0.0 (0.0.0.0) port 0 AF_INET to 10.1.1.1 () port 0 AF_INET
send_data: data send error: errno 101
netperf: send_omni: send_data failed: Network is unreachable
```

参考[Error in running netperf udp stream over openvpn](http://stackoverflow.com/questions/11981480/error-in-running-netperf-udp-stream-over-openvpn)，原来`netperf`在`UDP_STREAM`测试时，默认是禁止IP路由的，所以只能在同一个网段测试`UDP_STREAM`。如果要在不同网段测试`UDP_STREAM`，则要使用`-R 1`参数来启用路由，上述命令需要修改成：

```bash
netperf -H 10.1.1.1 -t UDP_STREAM -l 360000000 -- -m 200 -R 1
```

# 参考

* [netperf 与网络性能测量](https://www.ibm.com/developerworks/cn/linux/l-netperf/)
* [Error in running netperf udp stream over openvpn](http://stackoverflow.com/questions/11981480/error-in-running-netperf-udp-stream-over-openvpn)