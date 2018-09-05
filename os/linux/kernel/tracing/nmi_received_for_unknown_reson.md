# NMI watchdog 和 NMI Panic

* `nmi_watchdog`

NMI watchdog见识系统中断并在系统hung时候发起重启。在一个常规系统中数百个设备，每秒钟都会接收到时间中断。如果在5秒钟间隔没有收到任何中断，NMI watchdog就假设系统已经hung并会发起系统重启。

要理解NMI watchdog工作原理，首先需要理解APIC。APIC，也成为高级可编程中断控制器（Advanced Programmable Interrupt Controller），从Pentium Pro开始的处理器都包含了这个功能。内建的APIC也成为本地APIC。APIC在多处理器系统中用于感知其他CPU的中断，但是在单处理器中也使用--例如NMI watchdog功能。

IO-APIC是另一个主板APIC。IO-APIC收集不同I/O设备的中断并发送给处理器内建的本地APIC。IO-APIC是替代传统的8259可编程中断控制器（Programmalbe Interrupt Controllers, PIC）

# 问题

在[获取内核core dump](get_kernel_core_dump)的方法介绍中，提到了通过向服务器发送NMI信号来触发kernel panic，以获得内核core dump。这种方法在服务器出现hang死，无法远程ssh登陆处理时候特别有用。当然，也不能随便激活内核的`unknown_nmi_panic`设置，否则任何一个NMI信号都会导致服务器crash core dump，无法保证服务器稳定运行。这种特殊手段仅适合特殊情况下的故障排查。

在服务器集群的多个服务器上看到如下控制台信息

```
2018 Aug  7 21:18:37 example-server.x.com [2786215.132782] Uhhuh. NMI received for unknown reason 00 on CPU 10.
2018 Aug  7 21:18:37 example-server.x.com [2786215.139024] Do you have a strange power saving mode enabled?
2018 Aug  7 21:18:37 example-server.x.com [2786215.144914] Dazed and confused, but trying to continue
```

很有规律的是，多个服务器都是同一时间（连秒都相同）出现上述系统信息，这说明不是某个服务器的本地硬件故障，而是通过网络接收到的类似定时监控扫描触发的异常记录。

虽然这个NMI信号不影响服务器运行，但是为了避免隐患，避免今后排查NMI相关问题时混淆，需要找出这个根源。

# 排查

检查了两台同一时间出现NMI的服务器的系统日志`journalctl`但是没有找到NMI关键字，不过，在集群的5U7服务器上发现同一时间messages日志中有记录：

```
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.132782] Uhhuh. NMI received for unknown reason 00 on CPU 10.
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.139024] Do you have a strange power saving mode enabled?
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.144914] Dazed and confused, but trying to continue
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.132782] Uhhuh. NMI received for unknown reason 00 on CPU 10.
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.139024] Do you have a strange power saving mode enabled?
Aug  7 21:18:37 gateway-server.x.com kernel: : [2786215.144914] Dazed and confused, but trying to continue
```

线索在哪里？难道需要启用 `unknown_nmi_panic` 设置，来出发一个kernel core dump进行分析么？

有建议说这是因为使用了高精度事件计数器（High Precision Event Timer, hpet），不是严重bug，但是会导致一些系统挂起重启或在高负载下crash。

Redhat建议在内核中去除 hpet ，或者关闭 NMI watchdog，也就是在 `/boot/grub/grub.conf` 中设置`nohpet`：

```
title CentOS (2.6.18-308.4.1.el5)
        root (hd0,0)
        kernel /vmlinuz-2.6.18-308.4.1.el5 ro nohpet root=/dev/VolGroup00/LogVol00 rhgb quiet
        initrd /initrd-2.6.18-308.4.1.el5.img
```

或者在`/etc/modprobe.d/blacklist.conf`中添加

```
blacklist hpet
```

# 参考

* [NMI Watchdogs and NMI Panics](http://slacksite.com/slackware/nmi.html)
* [Kernel errors and NMI](http://www.beetlebrow.co.uk/what-do-you-need/help-and-documentation/unix-tricks-and-information/kernel-errors-and-nmi)
* [Linux kernel: Uhhuh. NMI received for unknown reason 30](http://yangl.net/2018/03/02/linux-kernel-warning/)