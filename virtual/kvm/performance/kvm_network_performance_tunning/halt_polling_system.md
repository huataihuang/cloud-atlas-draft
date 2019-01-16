KVM halt polling system（暂停轮询系统）在KVM内部提供性能优化：在某些情况下，当guest被选择不再运行后的一些时钟周期，使用cedeing(放弃)方式，通过降低host主机的polling（轮询）来减轻延迟。

也就是，当一个guest vcpu ceded，即放弃控制（CPU资源），或者在powerpc中单个vcore的所有vcpu被ceded，在放弃CPU以便其他进程能够调度，host内核通过轮询来唤醒环境。

**在polling间隙不唤醒资源或者不调度运行队列任务，可以最小化halt polling的时钟消耗。**

通用的halt polling代码在以下函数实现：

```c
virt/kvm/kvm_main.c: kvm_vcpu_block()
```

powerpc kvm-hv 特殊代码：

```c
arch/powerpc/kvm/book3s_hv.c: kvmppc_vcore_blocked()
```

# Halt Polling Interval

在唤起调度器之前poll的最大时间，被称为 halt polling interval，可以基于观察有效性（perceived effectiveness）限制无意义轮询（limit pointless polling）来增加或降低。这个值保存在以下vcpu struct：

```
kvm_vcpu->halt_poll_ns
```

或者在powerpc kvm-hv，则为vcore struct:

```
kvmppc_vcore->halt_poll_ns
```

这个值是每个vcpu单独设置值。

## `halt_poll_ns`

KVM 模块参数 `/sys/module/kvm/parameters/halt_poll_ns` 用于修改 idle 状态的KVM guest虚拟CPU（vcpus）如何处理的特性。

当KVM guest的vcpu没有工作需要运行（没有线程在等待运行），QEMI传统上会挂起（halts）这个idle的vcpus。这个`halt_poll_ns`设置了一个时间周期（单位是纳秒）来使得vcpu等待并在被挂起前轮询是否有新的负载需要运行。

如果在polling周期内有一个新的任务到达（也就是vcpu被挂起前），这个vcpu就会立即就绪来执行这个任务。而如果vcpu在新任务到达之前已经挂起，则vcpu必须从halt状态恢复到运行状态才能够执行新的任务。这个从halt状态转换到运行状态会引入延迟，也就影响了延迟敏感的负载的性能。

通过引入polling period（轮询周期）可以提高小负载传输网络负载的响应能力。

总的来说设置一个轮询时间会潜在影响到CPU的使用率。虽然不再挂起vcpu，但是现在vcpu会不断轮询（looping）来等待新的工作负载。这个附加的poll时间将增加CPU使用率。

所以这个设置需要平衡潜在的CPU消耗增长以便能够提供更好的响应以及降低延迟来提高流量和每秒操作量。这个polling time的值所处理的网络负载是可以调整的。用户需要针对自己的网络负载积累经验找到适合的设置值。

* 关闭`halt_poll`

```
echo 0 > /sys/module/kvm/parameters/halt_poll_ns
```

* `halt_poll`是通过上述内核参数设置某个值来实现启用

```
echo 80000 > /sys/module/kvm/parameters/halt_poll_ns
```


# 参考

* [The KVM halt polling system](https://www.kernel.org/doc/Documentation/virtual/kvm/halt-polling.txt)
* [KVM performance tunning](http://events17.linuxfoundation.org/sites/events/files/slides/KVM%20performance%20tuning%20on%20Alibaba%20Cloud.pdf) - [[RFC PATCH v2 0/7] x86/idle: add halt poll support](https://lkml.org/lkml/2017/8/29/279)
* [Network Performance Tuning > KVM  settings > halt_poll_ns](https://www.ibm.com/support/knowledgecenter/en/linuxonibm/liaag/wkvm/wkvm_c_tune_kvm.htm)