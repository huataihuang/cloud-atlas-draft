x86系统中所有内存都可以通过CPU同等访问，被称为"统一内存访问"（UMA）。而近期的x86处理器已改为采用NUMA（Non-Uniform Memory Access），系统内存被划分到NUMA节点（node），并与socket对应，或者与特定某一组与本地系统内存子集具有相同访问延迟到CPU相对应。

# NUMA内存分配策略

* `strict`

目标节点中不能分配内存时，分配将被默认操作转进至其他节点。严格的策略意味着，当目标节点中不能分配内存时，分配将会失效。

* `interleave`

内存页面将被分配至一项节点掩码指定的节点，但将以轮循机制的方式分布。

* `preferred`

内存将从单一最优内存节点分配。如果内存并不充足，内存可以从其他节点分配。

XML 配置启用所需策略：

```xml
<numatune>
        <memory mode='preferred' nodeset='0'>
</numatune>
```

# 自动化 NUMA 平衡

自动化 NUMA 平衡改进了 NUMA 硬件系统中运行应用的性能。它在 Red Hat Enterprise Linux 7 系统中被默认启用。

自动化 NUMA 平衡会把任务（任务可能是线程或进程）移到与它们需要访问的内存更近的地方，同时也会移动内存应用程序数据，使其更靠近参考这一数据的任务。以上均在自动化 NUMA 平衡启用时由内核自动完成。

自动化 NUMA 平衡启用时需满足以下两个条件：

* `numactl --hardware` 显示多个节点
* `cat /sys/kernel/debug/sched_features` 在标识中显示`NUMA`



# 参考

* [虚拟化调试和优化指南：NUMA](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/7/html/virtualization_tuning_and_optimization_guide/chap-virtualization_tuning_optimization_guide-numa)