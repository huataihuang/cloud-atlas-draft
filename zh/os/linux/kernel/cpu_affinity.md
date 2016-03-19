CPU 亲和性（affinity） 就是进程要在某个给定的 CPU 上尽量长时间地运行而不被迁移到其他处理器的倾向性。Linux 内核进程调度器天生就具有被称为`软` CPU 亲和性（affinity） 的特性，这意味着进程通常不会在处理器之间频繁迁移。这种状态正是我们希望的，因为进程迁移的频率小就意味着产生的负载小。

2.6 版本的 Linux 内核还包含了一种机制，它让开发人员可以编程实现`硬`CPU 亲和性（affinity）。这意味着应用程序可以显式地指定进程在哪个（或哪些）处理器上运行。

# Linux 内核硬亲和性（affinity）

在 Linux 内核中，所有的进程都有一个相关的数据结构，称为 `task_struct`。这个结构非常重要，原因有很多；其中与 亲和性（affinity）相关度最高的是 `cpus_allowed` 位掩码。这个位掩码由 `n` 位组成，与系统中的 `n` 个逻辑处理器一一对应。 具有 4 个物理 CPU 的系统可以有 4 位。如果这些 CPU 都启用了超线程，那么这个系统就有一个 8 位的位掩码。

如果为给定的进程设置了给定的位，那么这个进程就可以在相关的 CPU 上运行。因此，如果一个进程可以在任何 CPU 上运行，并且能够根据需要在处理器之间进行迁移，那么位掩码就全是 `1`。实际上，这就是 Linux 中进程的缺省状态。

Linux 内核 API 提供了一些方法，让用户可以修改位掩码或查看当前的位掩码：

* `sched_set_affinity()` （用来修改位掩码）
* `sched_get_affinity()` （用来查看当前的位掩码）

注意，`cpu_affinity` 会被传递给子线程，因此应该适当地调用 `sched_set_affinity`。

# 使用硬亲和性（affinity） 的 3 个原因

* 有大量计算要做

基于大量计算的情形通常出现在科学和理论计算中，但是通用领域的计算也可能出现这种情况。一个常见的标志是应用程序要在多处理器的机器上花费大量的计算时间。

* 测试复杂的应用程序

如果应用程序随着 CPU 的增加可以线性地伸缩，那么每秒事务数和 CPU 个数之间应该会是线性的关系。这样建模可以确定应用程序是否可以有效地使用底层硬件。

Amdahl 法则说明这种加速比在现实中可能并不会发生，但是可以非常接近于该值。对于通常情况来说，我们可以推论出每个程序都有一些串行的组件。

**Amdahl 法则在希望保持高 CPU 缓存命中率时尤其重要。如果一个给定的进程迁移到其他地方去了，那么它就失去了利用 CPU 缓存的优势。** 如果有多个线程都需要相同的数据，那么将这些线程绑定到一个特定的 CPU 上是非常有意义的，这样就确保它们可以访问相同的缓存数据（或者至少可以提高缓存的命中率）。否则，这些线程可能会在不同的 CPU 上执行，这样会频繁地使其他缓存项失效。

> **Amdahl 法则**
>
> Amdahl 法则是有关使用并行处理器来解决问题相对于只使用一个串行处理器来解决问题的加速比的法则。加速比（Speedup） 等于串行执行（只使用一个处理器）的时间除以程序并行执行（使用多个处理器）的时间：`S =T(1)/I(j)` 其中 T(j) 是在使用 j 个处理器执行程序时所花费的时间。

* 运行时间敏感的、决定性的进程

实时（对时间敏感的）进程可能会希望使用硬亲和性（affinity）来指定某个处理器，而同时允许其他 个处理器处理所有普通的系统调度。这种做法确保长时间运行、对时间敏感的应用程序可以得到运行，同时可以允许其他应用程序独占其余的计算资源。



# 参考

* [Managing Process Affinity in Linux](http://www.glennklockwood.com/hpc-howtos/process-affinity.html)
* [Chapter 6. Affinity](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_MRG/1.3/html/Realtime_Reference_Guide/chap-Realtime_Reference_Guide-Affinity.html)
* 一年前自己写的"Linux irqbalance、中断和进程绑定CPU"
* [Linux CPU affinity](http://blog.csdn.net/yfkiss/article/details/7464968)
* [管理处理器的亲和性（affinity）](http://www.ibm.com/developerworks/cn/linux/l-affinity.html)
