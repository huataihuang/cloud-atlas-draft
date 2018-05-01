MySQL从5.6版本开始引入多线程复制，可以在重负载集群环境下通过并发复制解决延迟问题。从5.7版本开始，多线程复制(MTR)得到了增强，但是依然需要非常小心监控和排查，避免出现主从不同步现象。

# 参考
 
* [How to Fix a Lagging MySQL Replication](https://thoughts.t37.net/fixing-a-very-lagging-mysql-replication-db6eb5a6e15d)
* [Solving MySQL Replication Lag with LOGICAL_CLOCK and Calibrated Delay](https://www.vividcortex.com/blog/solving-mysql-replication-lag-with-logical_clock-and-calibrated-delay)