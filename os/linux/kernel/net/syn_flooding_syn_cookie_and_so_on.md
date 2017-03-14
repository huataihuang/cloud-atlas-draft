# 问题

当发生SYN洪水攻击时候，有以下一些特征：

* 系统日志中有类似

```
kernel: possible SYN flooding on port X.
kernel: possible SYN flooding on port X. Sending cookies.
kernel: Possible SYN flooding on port X. Check SNMP counters.
kernel: Possible SYN flooding on port X. Sending cookies. Check SNMP counters.
kernel: TCPv6: Possible SYN flooding on port X.
```

* 服务器会对外发送SYN cookies
* 客户端应用会有非常高的负载并且有很多快速的TCP连接，显示大量的SYN连接到服务器，但是几乎没有或很少建立起连接（`EST`状态很少）
* 在 `/proc/net/netstat` 中 `ListenOverflows` 或者 `ListenDrops` 值不断增长。
* 由于`LISTEN` sockets 缓存溢出导致内核不断抛弃TCP连接
* 周期性出现drop TCP SYN包，因为内核缓存或`LISTEN` sockets 溢出。

# 参考

* ["kernel: Possible SYN flooding on port X. Sending cookies" is logged](https://access.redhat.com/solutions/30453)