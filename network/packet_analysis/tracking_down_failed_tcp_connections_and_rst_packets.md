
# TCPDUMP过滤

使用tcpdump命令可以过滤指定TCP协议和rst标准位，这样可以检查出哪些IP访问存在网络重传

```
tcpdump -n -v 'tcp[tcpflags] & (tcp-rst) != 0'
```

# 排查案例

* [排查ZooKeeper客户端TCP reset问题](../../big_data/zookeeper/before_zk_3.5_client_tcp_reset)是一个通过tcpdump发现客户端reset异常的案例。

# 参考

* [Tracking Down Failed TCP Connections and RST Packets](https://www.logicmonitor.com/blog/2014/03/13/tracking-down-failed-tcp-connections-and-rst-packets/)