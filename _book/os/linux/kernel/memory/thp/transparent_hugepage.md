# 透明大页的内核支持

## 目标

高性能计算应用程序基于`libhugetlbfs`并使用`hugetlbfs`来处理大量的内存工作集。`透明大页`支持是一个可选项，意味着使用支持自动提升和降级内存页大小而不受到大页带来的弊端。

当前透明大页只能工作在匿名内存映射和`tmpfs/shmem`，但是今后将扩展到其他文件系统。

应用程序运行更快的原因有两个：

* 

# 参考

* [Transparent Hugepage Support](https://www.kernel.org/doc/Documentation/vm/transhuge.txt)
* [How to use, monitor, and disable transparent hugepages in Red Hat Enterprise Linux 6 and 7? ](https://access.redhat.com/solutions/46111)
* [RHEL 6 Performance Tuning Guide: Huge Pages and Transparent Huge Pages](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/performance_tuning_guide/s-memory-transhuge)