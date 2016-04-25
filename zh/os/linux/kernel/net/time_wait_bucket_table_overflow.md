系统`kern`日志不断重复输出：

```bash
...
... kernel: : __ratelimit: 133 callbacks suppressed
... kernel: : TCP: time wait bucket table overflow
... kernel: : TCP: time wait bucket table overflow
...
... kernel: : __ratelimit: 107 callbacks suppressed
... kernel: : TCP: time wait bucket table overflow
...
```

系统日志中如果有大量的`kernel: : TCP: time wait bucket table overflow`，则表明系统连接中有很多`TIME_WAIT`状态，一种可能是受到了DDOS攻击（如果连接是从大量IP访问，并且出现大量的`SYN`状态）。

> `__ratelimit: 133 callbacks suppressed` 日志原因参考 [__ratelimit解释](../log/ratelimit.md)

参考 [kernel: TCP: time wait bucket table overflow 解决方法](http://www.oschina.net/question/54100_143972) 来看看系统有多少连接

```bash
netstat -an | awk '{print $6}' | sort | uniq -c | sort -rn
```

显示输出

```bash
   7450 TIME_WAIT
     56 ESTABLISHED
     56 CONNECTED
	 13 LISTEN
	  9 STREAM
	  7 FIN_WAIT
	  4
	  1 I-Node
	  1 Foreign
	  1 FIN_WAIT2
      1 FIN_WAIT1
     81 LAST_ACK
...
```

检查`tcp_max_tw_buckets`

```bash
cat /proc/sys/net/ipv4/tcp_max_tw_buckets
```

输出显示

```bash
10000
```

原来设置值还是相对较大的。我检查了用户的`/etc/sysctl.conf`看到如下设置

```bash
#net.ipv4.tcp_max_tw_buckets=5000
net.ipv4.tcp_max_tw_buckets=10000
```

并且`/etc/sysctl.conf`修改时间戳是`Mar  9 18:23`，检查`/var/log/kern`日志中这个报错日志最后出现时间就是这个时间戳之后

```bash
Mar  9 18:23:35 kernel: : TCP: time wait bucket table overflow
```

说明用户已经发现了这个问题，并通过扩大`TIME_WAIT` bucket table解决了这个问题。

不过，为何会导致出现大量的`TIME_WAIT`呢？

参考 [Too many TIME_WAIT connections inside container: time wait bucket table overflow](https://kb.plesk.com/en/118693)

`TCP: time wait bucket table overflow`日志表明TCP sockets的`TIME_WAIT`状态，即TW buckets已经达到了内核中分配的内存上限。

可以通过以下命令检查`TIME_WAIT`数量

```bash
netstat -antp | grep TIME_WAIT | wc -l
```

可以通过以下命令检查 `max_tw_buckets` 设置

```bash
sysctl -a | grep tcp_max_tw_buckets
```

这个内核参数 `tcp_max_tw_buckets` 在 `proc` 中是 `/proc/sys/net/ipv4/tcp_max_tw_buckets` ，是一个全局设置。对于`OpenVZ`这样的容器虚拟化，还有一个针对每个容器设置的`/proc/sys/net/ipv4/tcp_max_tw_buckets_ub`是针对每个容器的。

# 参考

* [kernel: TCP: time wait bucket table overflow 解决方法](http://www.oschina.net/question/54100_143972)
* [Too many TIME_WAIT connections inside container: time wait bucket table overflow](https://kb.plesk.com/en/118693)