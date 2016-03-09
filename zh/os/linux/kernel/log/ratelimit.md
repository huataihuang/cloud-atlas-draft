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

> 其中`kernel: : TCP: time wait bucket table overflow`分析见[系统日志"TCP: time wait bucket table overflow"分析](../net/time_wait_bucket_table_overflow.md)

`__ratelimit: N callbacks suppressed`表示内核阻止了`N`条syslog消息，这是因为系统重复的日志过多（频率过高），太快输出，被内核中的`net_ratelimit()`限制了syslog消息。

源代码可以参考 [FreeBSD/Linux Kernel Cross Reference; sys/net/core/utils.c](http://fxr.watson.org/fxr/source/lib/ratelimit.c?v=linux-2.6)

> ratelimit.c - Do something with rate limit.

这个`rate limit`也是Linux为了避免DoS攻击的一种机制，避免每个消息都被记录（会导致存储空间撑爆）。当内核记录消息，使用`printk()`通过这种机制来检查是否输出日志。

这个限制可以通过`/proc/sys/kernel/printk_ratelimit`和`/proc/sys/kernel/printk_ratelimit_burst`来调优。默认配置（RHEL6）分别是`5`和`10`。也就是说，内核允许每5秒记录10条消息。超过这个限制，内核就会抛弃日志，并记录`ratelimit N: callbacks suppressed`。

然而，在内核的网络代码中有自己的限制配置（逻辑相同，但是是独立的配置） `/proc/sys/net/core/message_cost`和`/proc/sys/net/core/message_burst`，默认配置也是`5`和`10`。这里`message_cost`也是日志采样时间。

如果要关闭`ratelimit`机制，也就是允许每个消息都记录下来，则可以设置`message_cost`值为`0`

```bash
sysctl -w net.core.message_cost=0
```

不过，一旦关闭`ratelimit`，系统就可能存在被日志攻击的风险。

# 参考

* [What does “net_ratelimit: 44 callbacks suppressed” mean on a linux based router?](http://serverfault.com/questions/277009/what-does-net-ratelimit-44-callbacks-suppressed-mean-on-a-linux-based-router)
* [Linux: Getting rid of “net_ratelimit: N callbacks suppressed” messages](http://www.bani.com.br/2015/06/linux-getting-rid-of-net_ratelimit-n-callbacks-suppressed-messages/)
* [关于linux日志中存在大量martian source 日志信息的原因分析与理解](http://blog.csdn.net/u013501512/article/details/18412041) - 这篇文章分析IP源地址异常非常详细（所谓`martian source`也就是`impossible source`，也就是linux根据路由表判断，认为不合理的，不应该出现的源地址。）