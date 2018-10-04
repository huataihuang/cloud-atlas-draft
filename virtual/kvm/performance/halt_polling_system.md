KVM halt polling system（暂停轮询系统）在KVM内部提供性能优化：在某些情况下，当guest被选择不再运行后的一些时钟周期，使用cedeing(放弃)方式，通过降低host主机的polling（轮询）来减轻延迟。

也就是，当一个guest vcpu ceded，即放弃控制（CPU资源），或者在powerpc中单个vcore的所有vcpu被ceded，在放弃CPU以便其他进程能够调度，host内核通过轮询来唤醒环境。

在polling间隙不唤醒资源或者不调度运行队列任务，可以最小化halt polling的时钟消耗。

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



# 参考

* [The KVM halt polling system](https://www.kernel.org/doc/Documentation/virtual/kvm/halt-polling.txt)
* [KVM performance tunning](http://events17.linuxfoundation.org/sites/events/files/slides/KVM%20performance%20tuning%20on%20Alibaba%20Cloud.pdf) - [[RFC PATCH v2 0/7] x86/idle: add halt poll support](https://lkml.org/lkml/2017/8/29/279)