用户反馈虚拟机性能不佳，应用RT偏高。检查虚拟机的vnc控制台，两行输出提示

```
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
```

参考 [What does "NOHZ: local_softirq_pending XXX" mean?](https://kb.plesk.com/en/119599)

在内核日志`dmesg`输出中可以看到

```
dmesg | grep -i nohz
```

输出有

```
[ 9607.993815] NOHZ: local_softirq_pending 100
[16056.268035] NOHZ: local_softirq_pending 100
```

上述输出标志着系统将系统的CPU设置成睡眠状态来替代处理一些软件终端。

这个信息末尾的数字是十六进制格式并且它表示中断的类型，所有已知中断都在内核源代码`include/linux/interrupt.h`中位掩码：

```
enum
{
    HI_SOFTIRQ=0,
    TIMER_SOFTIRQ,
    NET_TX_SOFTIRQ,
    NET_RX_SOFTIRQ,
    BLOCK_SOFTIRQ,
    BLOCK_IOPOLL_SOFTIRQ,
    TASKLET_SOFTIRQ,
    SCHED_SOFTIRQ,
    HRTIMER_SOFTIRQ,
    RCU_SOFTIRQ,    /* Preferable RCU should always be the last softirq */

    NR_SOFTIRQS
};
```

数字`100`表示`HRTIMER_SOFTIRQ`，高精度计时器的软件终端，这个中断时可以忽略的，如果上一个invocation(周期？)尚未结束的话。

参考 [local_softirq_pending???](https://bbs.archlinux.org/viewtopic.php?id=143460) ，这个信息表示内核编译使用了 `Accelerate last non-dyntick-idle CPU's grace periods (RCU_FAST_NO_HZ)` 选项：

```
内核源码解释：

这个RCU_FAST_NO_HZ使得RCU尝试加速平滑的周期以便允许CPU能够更快地进入动态ticks-idle状态。
另一方面来说，这个选项增加了动态ticks-idle检查的负载，特别是系统具有大量的CPU数量时。
```

如果在内核启动grub参数增加了 `nohz=off` 则这个消息将不再显示。