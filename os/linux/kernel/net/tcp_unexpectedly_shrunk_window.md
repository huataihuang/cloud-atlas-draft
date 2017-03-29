在Linux系统的`dmesg`中，有时候会看到有关TCP窗口大小非预期改变的信息，例如

```
TCP: Peer xxx.xxx.xxx.xxx:58185/8080 unexpectedly shrunk window 4035330574:4035330575 (repaired)
TCP: Peer xxx.xxx.xxx.xxx:49419/8080 unexpectedly shrunk window 1326931253:1326932773 (repaired)
TCP: Peer xxx.xxx.xxx.xxx:53603/8080 unexpectedly shrunk window 3900191630:3900191956 (repaired)
```

这个消息通常发生在客户端决定降低TCP窗口大小，而服务器没有预期到这个TCP window size。例如当发生TCP分片，或者客户端是一个嵌入式设备所以网卡缓存内存非常小的情况。

一般情况下，这是完全正常的特性，会在日志中少量出现。这只是一个通知消息，用于debug网络问题。

不过，如果在日志中看到成千上万的这类数据包，则可能是影响数据包分片和小窗口大小的网络攻击，也可能在internet连接网络中出现的"噪音"。实际上，日志中显示"repaired"表示网络驱动已经修复了这个问题，通常这个工作时通过将两个分片的数据包再次连接起来实现的。

> 在[Debian Squeeze: TCP stops working, UDP doesn't, with "unexpectedly shrunk window"](http://www.linuxquestions.org/questions/linux-networking-3/debian-squeeze-tcp-stops-working-udp-doesn%27t-with-unexpectedly-shrunk-window-936620/)案例中，提到了使用BT客户端出现"TCP: Peer ... unexpectedly shrunk window"情况。用户使用的是无线网络，出现的现象是TCP网络不通，但是UDP可以联通的情况。
>
> 请参考[TCP拥塞控制](tcp_congestion_control)

# 参考

* [TCP Peer unexpectedly shrunk window messages in dmesg log](https://security.stackexchange.com/questions/24410/tcp-peer-unexpectedly-shrunk-window-messages-in-dmesg-log)
* [Debian Squeeze: TCP stops working, UDP doesn't, with "unexpectedly shrunk window"](http://www.linuxquestions.org/questions/linux-networking-3/debian-squeeze-tcp-stops-working-udp-doesn%27t-with-unexpectedly-shrunk-window-936620/)