在KVM服务器串口控制台大量输出以下日志

```
017-02-15 14:31:43	[1874892.533634] kvm [47367]: vcpu3 kvm_set_msr_common: MSR_IA32_DEBUGCTLMSR 0x1, nop
```

由于`printk`串口大量的日志输出，导致系统hang机。

检查`printk`配置，可以看到是限制了秒级5条相同日志输出

```
$cat /proc/sys/kernel/printk_ratelimit
5

$cat /proc/sys/kernel/printk_ratelimit_burst
10
```

但是从串口日志来看，这个`ratelimit`有时候生效，有时候又没有效果：有时候可以看到日志中显示

```

```