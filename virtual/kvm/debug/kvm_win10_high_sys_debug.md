在KVM环境运行Windows 10，发现性能非常差，在物理主机上检查

```
top - 13:43:41 up 6 days, 22:24,  3 users,  load average: 3.15, 2.72, 2.01
Tasks: 205 total,   4 running, 201 sleeping,   0 stopped,   0 zombie
%Cpu(s): 49.8 us, 20.2 sy,  0.0 ni, 29.7 id,  0.3 wa,  0.0 hi,  0.1 si,  0.0 st
KiB Mem :  8113620 total,   132176 free,  6632048 used,  1349396 buff/cache
KiB Swap:   999420 total,       32 free,   999388 used.  1018384 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 7656 libvirt+  20   0 7248848 3.720g   2512 S 146.2 48.1 736:00.16 qemu-system-x86
21715 libvirt+  20   0 6707652 2.873g   2704 R 128.2 37.1 145:05.49 qemu-system-x86
   31 root      25   5       0      0      0 S   1.6  0.0 133:51.26 ksmd
22127 huatai    20   0   41936   3584   2972 R   1.6  0.0   0:00.30 top
```

其中，`7656`进程对应的是`win2106`虚拟机，在虚拟机内部观察cpu繁忙程度只有 80%，但是物理服务器上显示则占用cpu资源翻倍，约170%。（仅仅是更新操作系统）

`win10`虚拟机则更为夸张，没有任何程序运行，在虚拟机内部观察CPU几乎是空闲的，但是远程操作依然非常缓慢，在物理服务器上观察进程 `21715` 占用CPU资源超过130%。

此外观察可以看到，系统的`sys`占用非常严重，表明虚拟化消耗了很多系统资源

```
top - 14:07:23 up 6 days, 22:48,  3 users,  load average: 3.25, 3.05, 2.86
Tasks: 206 total,   3 running, 203 sleeping,   0 stopped,   0 zombie
%Cpu0  : 46.5 us, 14.7 sy,  0.0 ni, 38.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  : 40.8 us, 31.7 sy,  0.0 ni, 26.8 id,  0.0 wa,  0.0 hi,  0.7 si,  0.0 st
%Cpu2  : 40.1 us, 20.1 sy,  0.0 ni, 39.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu3  : 70.3 us, 20.3 sy,  0.0 ni,  9.1 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  8113620 total,   142212 free,  6650924 used,  1320484 buff/cache
KiB Swap:   999420 total,        0 free,   999420 used.   999268 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 7656 libvirt+  20   0 7248848 3.732g   2504 S 146.4 48.2 770:42.78 qemu-system-x86
21715 libvirt+  20   0 6707652 2.864g   2664 R 131.1 37.0 177:21.19 qemu-system-x86
   31 root      25   5       0      0      0 S   4.6  0.0 135:19.57 ksmd
22193 huatai    20   0   41936   3712   3016 R   0.7  0.0   0:00.19 top
   43 root      20   0       0      0      0 R   0.3  0.0   3:25.96 kswapd0
```

host主机messages日志可以观察到

```
[592420.654337] kvm [21715]: vcpu1 unhandled rdmsr: 0x611
[592427.561224] kvm [21715]: vcpu0 unhandled rdmsr: 0x606
```

升级了物理主机系统，然后重启，只运行一个win10系统，但是依然显示虚拟机占用资源很高。看上去`sys`是罪魁祸首。

```
top - 15:18:49 up 54 min,  1 user,  load average: 1.44, 0.94, 0.41
Tasks: 193 total,   1 running, 192 sleeping,   0 stopped,   0 zombie
%Cpu0  : 13.1 us, 11.4 sy,  0.0 ni, 75.4 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  : 18.9 us, 30.4 sy,  0.0 ni, 50.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu2  :  7.9 us,  5.9 sy,  0.0 ni, 86.2 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu3  : 13.1 us, 28.2 sy,  0.0 ni, 58.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  8113624 total,  3713084 free,  3862496 used,   538044 buff/cache
KiB Swap:   999420 total,   999420 free,        0 used.  3956908 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 3072 libvirt+  20   0 6321552 3.232g  22936 S 131.9 41.8   6:28.02 qemu-system-x86
   31 root      25   5       0      0      0 S   0.3  0.0   0:01.17 ksmd
 1245 root      20   0  669544  46288  32152 S   0.3  0.6   0:08.28 dockerd
 3121 huatai    20   0   41936   3896   3168 R   0.3  0.0   0:00.09 top
    1 root      20   0   38148   6232   4032 S   0.0  0.1   0:03.63 systemd
    2 root      20   0       0      0      0 S   0.0  0.0   0:00.00 kthreadd
```

# 排查

参考 [High KVM/QEMU CPU utilization when Windows 10 guest is idle](https://www.reddit.com/r/VFIO/comments/80p1q7/high_kvmqemu_cpu_utilization_when_windows_10/) 可以采用`perf`来检查qemu消耗cpu时间的原因，检查是在内核空间、用户空间还是guest空间消耗的cpu


```bash
sudo perf kvm --host top -p `pidof qemu-system-x86_64`
```

```
Samples: 304K of event 'cycles:pp', Event count (approx.): 160577711871554
Overhead  Shared Object            Symbol
  38.52%  [kernel]                 [k] poll_freewait
   5.57%  [kernel]                 [k] do_sys_poll
   4.87%  [kernel]                 [k] vmx_vcpu_run
   4.82%  [kernel]                 [k] mutex_lock_killable
   4.07%  libglib-2.0.so.0.4800.2  [.] g_main_context_check
   3.63%  libpthread-2.23.so       [.] pthread_mutex_lock
   2.89%  qemu-system-x86_64       [.] aio_notify_accept
   2.67%  [kernel]                 [k] enqueue_entity
   2.62%  qemu-system-x86_64       [.] qemu_notify_event
   2.02%  libpthread-2.23.so       [.] pthread_mutex_unlock
   1.69%  [kernel]                 [k] native_write_msr_safe
   1.65%  [kernel]                 [k] __x86_indirect_thunk_rax
   0.95%  [kernel]                 [k] kvm_get_apic_interrupt
   0.95%  [kernel]                 [k] __fget
   0.93%  [kernel]                 [k] kvm_fetch_guest_virt
```

```
Samples: 331K of event 'cycles:pp', Event count (approx.): 200290188293710
Overhead  Shared Object            Symbol
  35.14%  [kernel]                 [k] sock_poll
   8.07%  libglib-2.0.so.0.4800.2  [.] g_main_context_prepare
   7.21%  [kernel]                 [k] check_preempt_wakeup
   6.59%  libpthread-2.23.so       [.] pthread_mutex_lock
   5.53%  [kernel]                 [k] __srcu_read_lock
   4.80%  [kernel]                 [k] vmx_vcpu_run
```

```
Samples: 350K of event 'cycles:pp', Event count (approx.): 219305848967883
Overhead  Shared Object            Symbol
  18.52%  libglib-2.0.so.0.4800.2  [.] 0x00000000000473b0
  15.54%  [kernel]                 [k] update_cfs_shares
  11.52%  qemu-system-x86_64       [.] aio_pending
   9.07%  [kernel]                 [k] sock_poll
   5.88%  qemu-system-x86_64       [.] timerlistgroup_deadline_ns
   5.63%  [kernel]                 [k] vmx_vcpu_run
   2.83%  [kernel]                 [k] eventfd_poll
   2.35%  [kernel]                 [k] do_sys_poll
   2.26%  qemu-system-x86_64       [.] qemu_mutex_lock
   1.72%  libpthread-2.23.so       [.] pthread_mutex_lock
```

```
Samples: 431K of event 'cycles:pp', Event count (approx.): 200377848626454
Overhead  Shared Object            Symbol
  26.47%  qemu-system-x86_64       [.] qemu_mutex_unlock
  23.95%  qemu-system-x86_64       [.] aio_pending
   6.31%  [kernel]                 [k] vmx_vcpu_run
   4.96%  libglib-2.0.so.0.4800.2  [.] g_main_context_check
   4.75%  [kernel]                 [k] __x86_indirect_thunk_rax
   3.75%  [kernel]                 [k] entry_SYSCALL_64_fastpath
   3.45%  [kernel]                 [k] __gfn_to_hva_many
```

其中，如果是 `[k]` 开头则是kernel space，如果是 `[.]` 开头则是user space。

如果VM大量执行`VM_EXIT`则需要调查为何会如尝试

```
perf stat -e 'kvm:*' -a -- sleep 1
```

## 使用 `perf kvm --host stat live`

> `perf kvm --host stat live` 这个方式观察主机非常方便
>
> `perf kvm`是特定指令，针对kvm进行性能分析

发现一个问题，在执行 `perf kvm --host stat live` 时发现，大量都`VM-EXIT`工作都消耗在`IO_INSTRUCTION`，并且有大量的`MSR_READ`和`MSR_WRITE`

```
15:52:35.709821

Analyze events for all VMs, all VCPUs:

             VM-EXIT    Samples  Samples%     Time%    Min Time    Max Time         Avg time

      IO_INSTRUCTION      55654    78.67%    42.39%      3.54us     74.94us     13.63us ( +-   0.24% )
            MSR_READ       7114    10.06%     0.74%      1.46us     16.58us      1.87us ( +-   0.30% )
           MSR_WRITE       3781     5.34%     0.61%      2.09us      9.84us      2.88us ( +-   0.35% )
                 HLT       2933     4.15%    56.06%      1.71us  15227.79us    341.97us ( +-   8.91% )
  EXTERNAL_INTERRUPT        731     1.03%     0.11%      1.19us      7.07us      2.63us ( +-   0.95% )
   PENDING_INTERRUPT        413     0.58%     0.05%      1.32us      2.96us      2.25us ( +-   0.50% )
 TPR_BELOW_THRESHOLD         82     0.12%     0.01%      2.54us      3.69us      2.93us ( +-   1.12% )
       EPT_VIOLATION         26     0.04%     0.01%      3.81us     36.55us      8.78us ( +-  15.27% )
       EPT_MISCONFIG          7     0.01%     0.01%     12.27us     39.47us     21.80us ( +-  17.78% )
   PAUSE_INSTRUCTION          5     0.01%     0.00%      1.61us      1.99us      1.81us ( +-   4.30% )

Total Samples:70746, Total events handled time:1789115.74us.
```

在原文中建议，如果出现大量的`VM_EXIT`，则有可能是由于`APIC`时钟中断（timer interrupts）导致的`kvm_apic_accept_irq`。需要检查Windows 10是否使用APIC时钟。hyperv hypercall可以使用MSR，这样`kvm_msr`可能会被hyperv synthetic中断时钟调用 1000次/s。

有可能虚拟机在不断唤醒并执行halt polling，导致消耗了主机大量cpu。

在 [KVM: High host CPU load after upgrading VM to windows 10 1803](https://askubuntu.com/questions/1033985/kvm-high-host-cpu-load-after-upgrading-vm-to-windows-10-1803/1035089) 提到了解决方法：需要在KVM虚拟机配置中添加`hpet`时钟。

检查当前默认配置：

```xml
  <clock offset='localtime'>
    <timer name='rtc' tickpolicy='catchup'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='no'/>
    <timer name='hypervclock' present='yes'/>
  </clock>
```

修改成

```xml
  <clock offset='localtime'>
    <timer name='rtc' tickpolicy='catchup'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='yes'/>
    <timer name='hypervclock' present='yes'/>
  </clock>
```

果然修改以后再次启动windows虚拟机，可以看到sys负载已经极低，并且

```
top - 19:24:56 up  5:00,  2 users,  load average: 0.55, 0.41, 0.19
Tasks: 197 total,   1 running, 196 sleeping,   0 stopped,   0 zombie
%Cpu0  :  1.3 us,  0.7 sy,  0.0 ni, 98.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  :  1.0 us,  0.0 sy,  0.0 ni, 98.7 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu2  :  3.3 us,  0.3 sy,  0.0 ni, 96.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu3  :  0.7 us,  0.0 sy,  0.0 ni, 99.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  8113624 total,  3432512 free,  4108152 used,   572960 buff/cache
KiB Swap:   999420 total,   999420 free,        0 used.  3702616 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 3651 libvirt+  20   0 7454076 3.456g  23040 S   6.6 44.7   3:55.88 qemu-system-x86
 3663 huatai    20   0   41800   3760   3108 R   1.0  0.0   0:02.08 top
   31 root      25   5       0      0      0 S   0.3  0.0   2:53.77 ksmd
 3676 root      20   0       0      0      0 S   0.3  0.0   0:00.06 kworker/u16:0
    1 root      20   0   38148   6232   4032 S   0.0  0.1   0:03.71 systemd
```

此时使用 `perf kvm --host stat live` 可以看到几乎很少出现`IO_INSTRUCTION`

```
19:24:22.553073

Analyze events for all VMs, all VCPUs:

             VM-EXIT    Samples  Samples%     Time%    Min Time    Max Time         Avg time

            MSR_READ       1501    75.77%     0.44%      3.25us     23.38us      5.36us ( +-   0.75% )
           MSR_WRITE        192     9.69%     0.16%      5.48us     49.34us     15.46us ( +-   3.90% )
                 HLT        174     8.78%    99.27%      4.16us  15716.32us  10431.50us ( +-   4.98% )
      IO_INSTRUCTION         50     2.52%     0.09%      7.80us     83.96us     33.46us ( +-   6.40% )
  EXTERNAL_INTERRUPT         39     1.97%     0.01%      3.47us     17.31us      6.20us ( +-   7.28% )
   PENDING_INTERRUPT          7     0.35%     0.00%      4.97us      8.10us      6.39us ( +-   6.23% )
 TPR_BELOW_THRESHOLD          7     0.35%     0.00%      7.16us     10.22us      8.94us ( +-   5.35% )
       EPT_MISCONFIG          7     0.35%     0.01%     36.36us     42.87us     37.42us ( +-   2.43% )
   PAUSE_INSTRUCTION          3     0.15%     0.00%      3.39us      3.72us      3.59us ( +-   2.83% )
       EPT_VIOLATION          1     0.05%     0.00%     68.73us     68.73us     68.73us ( +-   0.00% )

Total Samples:1981, Total events handled time:1828459.05us.
```

此时NC上观察Windows虚拟机已经很少有SYS占用情况，响应也恢复正常。

# 参考

* [KVM: High host CPU load after upgrading VM to windows 10 1803](https://askubuntu.com/questions/1033985/kvm-high-host-cpu-load-after-upgrading-vm-to-windows-10-1803/1035089)
* [High KVM/QEMU CPU utilization when Windows 10 guest is idle](https://www.reddit.com/r/VFIO/comments/80p1q7/high_kvmqemu_cpu_utilization_when_windows_10/)