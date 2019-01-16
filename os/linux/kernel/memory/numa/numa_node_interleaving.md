
# NUMA BIOS

在BIOS中有关NUMA设置容易出现一些困扰：是否要enable或disable Node interleaving。

通常情况下，应该 disable 掉 Node interleaving，因为交叉访问会降低NUMA性能。

Intel和AMD都支持NUMA架构，在NUMA架构中存在多个节点，每个节点包含一个CPU和通过NUMA内部连接的内存。

# 测试不同策略性能

`numademo`工具可以测试不同numa策略的性能差距

执行以下命令（采用4g数据内存复制）可以对比不同NUMA策略的性能

```
numademo 4g memset
```

输出可以看到性能最好的是local本地访问，其次是interleaving策略，最差是没有策略

```
2 nodes available
memory with no policy memset              Avg 8992.57 MB/s Max 9671.56 MB/s Min 8283.53 MB/s
local memory memset                       Avg 10036.57 MB/s Max 10042.67 MB/s Min 10031.62 MB/s
memory interleaved on all nodes memset    Avg 9800.85 MB/s Max 9806.96 MB/s Min 9795.98 MB/s
Killed
```

# 参考

* [Node Interleaving: Enable or Disable?](http://frankdenneman.nl/2010/12/28/node-interleaving-enable-or-disable/)
* [Performance implications of NUMA](https://www.cmg.org/wp-content/uploads/2015/10/numa.pdf)