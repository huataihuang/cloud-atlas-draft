# TCP拥塞

传输控制协议（Transmission Control Protocol, TCP）使用一种包含了"和式增加，积式减少"（Additive Increase/Multiplicative Decrease, AIMD）模型的不同朝向[网络拥堵减轻](https://en.wikipedia.org/wiki/Network_congestion#Mitigation)算法。

TCP拥塞减轻算法（TCP congestion-avoidance algorithm）是冲突控制的主要基础。

为避免冲突雪崩，TCP使用了多面冲突控制策略。对于每个连接，TCP维护了一个拥塞窗口，限制端到端没有应答（unacknoledged）数据包数量。这个策略有时候也称为TCP滑动窗口，用于流控制。在连接建立以后或者在一次timout之后，TCP使用一种称为[慢速启动， slow start](https://en.wikipedia.org/wiki/TCP_congestion_control#Slow_start)来增加阻塞窗口大小。

最初TCP使用一个两杯于最大分片大小（maximum segment size, MSS）的窗口。虽然初始速率较低，但是速率的增长却非常快；对于每个数据包都确认，拥塞窗口以1 MSS大小增长，所以拥塞窗口有效地两倍于往返时间（round-trip time, RTT）。

当阻塞窗口超过`ssthreah`阀值，算法进入一个新的状态，称为冲突回避状态。在一些实现中（如Linux），初始化`ssthresh`时一个非常大的值，所以第一个慢启动通常在一个连接丢失之后发生。然而，每次慢启动之后ssthresh会更新，并且常常在慢启动被超时所触发。拥塞避免状态会持续到不再接收到重复的ACK为止，此时拥塞窗口会根据每个数据包来回时间MSS增长。当一个数据包丢失，则接收到重复的ACK可能性非常高。

> AIMD全称Additive Increase Multiplicative Decrease，是TCP/IP模型中，传输层为了解决拥塞控制的一种方法：当TCP发送端感受到端到端路径无阻塞时就线性增加其发送速度，当察觉到路径拥塞时就乘性减少其发送速度。TCP拥塞控制协议的线性增长阶段倍称为避免拥塞，即当TCP发送端收到ACK并且没有检测到丢包事件时，拥塞窗口加1；当TCP发送端检测到丢包事件后，拥塞窗口就除以2。 - [互动百科：AIMD](http://www.baike.com/wiki/AIMD)

# 拥塞窗口

在TCP中，拥塞窗口（congestion window）是一个在任意时间检测字节数量可能超出的因素。拥塞窗口是由发送端维护等。注意，congestion window不要和TCP window size概念混淆，TCP window size则是接收端维护等。拥塞窗口

在[Debian Squeeze: TCP stops working, UDP doesn't, with "unexpectedly shrunk window"](http://www.linuxquestions.org/questions/linux-networking-3/debian-squeeze-tcp-stops-working-udp-doesn%27t-with-unexpectedly-shrunk-window-936620/)案例中，提到了使用BT客户端出现"TCP: Peer ... unexpectedly shrunk window"情况。用户使用的是无线网络，出现的现象是TCP网络不通，但是UDP可以联通的情况。

这时需要考虑TCP内存池（tcp memory pool）问题：TCP内存池耗尽时内核会开始剧烈地断开TCP连接。可以小心地逐步尝试增加限制，但是需要非常小心避免超过增加超过25%。这个配置使用的是"页"作为单位，不是"字节"。

> 参考 [TCP congestion control](https://en.wikipedia.org/wiki/TCP_congestion_control) 介绍了多种TCP拥塞控制的算法，例如 [TCP Westwood+](https://en.wikipedia.org/wiki/TCP_congestion_control#TCP_Westwood.2B)

# 参考

* [TCP congestion control](https://en.wikipedia.org/wiki/TCP_congestion_control)
* [Linux Tuning: Expert Guide](https://fasterdata.es.net/host-tuning/linux/expert/)