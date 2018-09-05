
# TCPDUMP过滤

使用tcpdump命令可以过滤指定TCP协议和rst标准位，这样可以检查出哪些IP访问存在网络重传

```
tcpdump -n -v 'tcp[tcpflags] & (tcp-rst) != 0'
```

> `-n`表示不解析IP地址到主机名，可以加快tcpdump处理效率，避免丢包

输出结果类似

```
17:37:49.579533 IP (tos 0x0, ttl  63, id 0, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.9.77.19313 > 192.168.1.47.38143: R, cksum 0x9799 (correct), 0:0(0) ack 198481846 win 0
17:37:49.584932 IP (tos 0x0, ttl  63, id 0, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.8.206.19313 > 192.168.1.47.33568: R, cksum 0x2891 (correct), 0:0(0) ack 120462787 win 0
17:37:49.585830 IP (tos 0x0, ttl  63, id 0, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.8.209.19311 > 192.168.1.47.57579: R, cksum 0x0bbe (correct), 0:0(0) ack 1813084134 win 0
17:37:49.587327 IP (tos 0x0, ttl  63, id 0, offset 0, flags [DF], proto: TCP (6), length: 40) 192.168.9.164.19312 > 192.168.1.47.52457: R, cksum 0x26c0 (correct), 0:0(0) ack 3267631455 win 0
```

这里的案例发现到 `> 192.168.1.xx` 重传很高，所以通过如下命令检查：

```
cat retrans.txt | awk '{print $20}' | awk -F. '{print $1"."$2"."$3"."$4}' | sort | uniq -c
```

则会排序后显示和本地IP通讯存在较多重传的IP：

```
     93 192.168.1.39
     72 192.168.1.47
     70 192.168.5.146
     94 192.168.5.186
```

# wireshark统计方法

wireshark的字符终端程序`tshark`提供了统计功能：

```
tshark -Y "tcp.analysis.retransmission" -Tfields -e ip.src -e ip.dst
```

# 排查案例

* [排查ZooKeeper客户端TCP reset问题](../../big_data/zookeeper/before_zk_3.5_client_tcp_reset)是一个通过tcpdump发现客户端reset异常的案例。

# 参考

* [Tracking Down Failed TCP Connections and RST Packets](https://www.logicmonitor.com/blog/2014/03/13/tracking-down-failed-tcp-connections-and-rst-packets/)
* [Tracking Down Failed TCP Connections and RST Packets](https://www.logicmonitor.com/blog/tracking-down-failed-tcp-connections-and-rst-packets/)