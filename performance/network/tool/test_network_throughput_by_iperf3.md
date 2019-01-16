> 本文是一个简短的快速测试方法，详细测试原理和使用，需要参考iperf3官方指南。

# 服务器端设置

iperf3采用客户服务器体系，在测试时需要先启动一个iperf3服务器，参数是`-s`，默认监听在`5201`端口。

可以指定服务器端报告的网速格式（k,m,g表示Kbits, Mbits, Gbits；或者使用K,M,G表示KBytes，Mbytes，Gbytes），参数`-f`用于切换报告格式：

```
iperf3 -s -f K
```

如果要监听不同端口，则使用`-p`参数：

```
iperf3 -s -p 3000
```

此外，`-D`参数可以作为daemon启动，并且可以将服务器消息写入到日志文件：

```
iperf3 -s -D > iperf3log
```

# 客户端

```
iperf3 -c 192.168.10.1 -f K
```

大约18～20秒后，终端输出测试结果，显示测试出的带宽。

# 测试参数

* 重要参数：TCP窗口大小（TCP window size），这个参数是TCP连接的重要优化参数。可以通过`-w`参数设置 窗口/socket缓存 大小：

```
iperf3 -c 192.168.10.1 -f K -w 500k
```

默认的TCP window size是 85KB

```
TCP window size: 85.0 KByte (default)
```

* 反向模式可以调转服务端发送和客户端接收（默认是客户端发送服务端接收），使用参数 `-R`

```
ipef3 -c 192.168.100.1 -f -K -w 500K -R
```

* 双向模式测试，也就是同时进行收发测试带宽，使用参数是`-d`

```
iperf3 -c 192.168.0.1 -f K -w 500K -d
```

* 如果希望服务端的测试数据在客户端输出，则使用`--get-server-output`参数

```
iperf3 -c 192.168.10.1 -f K -w 500K -R --get-server-output
```

* 并发客户端流，使用参数`-P`，例如 `-P 2`表示同时启动2个客户端流。不过，需要注意的是，iperf3是单线程程序，增加多个客户端并不能充分利用CPU资源，所以在测试40G这种高速网络时，需要启动多个iperf3客户端和服务器端，充分利用CPU资源来实现网络并发性能测试才能测试出高速网络的性能。详细请参考 []()

# 参考

* [How to Test Network Throughput Using iperf3 Tool in Linux](https://www.tecmint.com/test-network-throughput-in-linux/)