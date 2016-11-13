> **`更改系统的时钟源会影响系统性能，所以需要谨慎使用，实际解决方法建议排查影响系统稳定性的根本原因，避免修改虚拟机时钟源!`**

# `Clocksource tsc unstable (delta = xxxxxxxx ns)`

近期在线维护KVM服务器，发现在虚拟机创建的过程中，会出现物理服务器上正在运行的虚拟机时间短暂偏移数秒到10秒左右，虽然虚拟机的`ntp`服务能够最终纠正，但是对运行的业务系统造成了困扰。

排查发现虚拟机创建的时候，在物理服务器的`messages`日志中显示PassThrough模式的ixgbe网卡的VF驱动会做一次`Reload the VF driver to make this change effective`。此时，运行的虚拟机的`messages`日志显示虚拟时钟源不稳定：

```
[2423264.824259] Clocksource tsc unstable (delta = 6824818792 ns).  Enable clocksource failover by adding clocksource_failover kernel parameter.
```

检查kvm虚拟机时钟源

```
# cat /sys/devices/system/clocksource/clocksource0/available_clocksource
kvm-clock tsc acpi_pm

#cat /sys/devices/system/clocksource/clocksource0/current_clocksource
kvm-clock
```

参考 [[Howto] Fixing unstable clocksource in virtualised CentOS](https://liquidat.wordpress.com/2013/04/02/howto-fixing-unstable-clocksource-in-virtualised-centos/)

在虚拟化之前的计算机时期是通过tick计数来测量时间的：操作系统初始化一个设备来发送终端 - 称为ticks - 作为一个持久的固定的频率。操作系统通过计算这个中断，例如每秒100次，来知晓经过了多少时间。

然而，在运行的虚拟机中，就不能保证虚拟机能够获得足够资源来保证固定的tick（滴答）速率。假设一个物理服务器运行了大量的虚拟机，就有可能在某个瞬间某些虚拟机不能活的足够资源来产生tick（滴答）。如果物理服务器的负载非常搞，则ticks的一个backlog(后台日志)就会建立，并且可能不断增长。这就导致vm虚拟机的时钟延后。如果backlog过大，则这个ticks（滴答）甚至可能被抛弃，这样虚拟机的时钟源就会不稳定并且vm虚拟机时间就会落后。

当时钟源不稳定的时候，Linux就会尝试找出并报告这个现象，此时在日志中就会出现如下事件：

```
Clocksource tsc unstable (delta = -102057770 ns).  Enable clocksource failover by adding clocksource_failover kernel parameter.
```

要解决这个问题，我们需要首先找出哪些是可用的时钟源，以及当前使用的时钟源：

```
$ cat /sys/devices/system/clocksource/clocksource0/available_clocksource
kvm-clock tsc hpet acpi_pm
$ cat /sys/devices/system/clocksource/clocksource0/current_clocksource
kvm-clock
```

解决这个时钟源的问题通常是添加另外一个时钟源，也就是`failover clock source`，例如`hpet`或`acpi_pm`（这里可以看到报错显示是`tsc unstable`，所以接下来优选的顺序是`hpet`和`acpi_pm`）。[详细的时钟源解释](http://www.makelinux.net/books/ulk3/understandlk-CHP-6-SECT-1)见"Understanding the Linux Kernel, 3rd Edition" by Daniel P. Bovet, Marco Cesati。

* 具体解决步骤 - 在KVM虚拟机的启动内核参数中添加`failover clock source`如下

```
kernel /vmlinuz-2.6.32-358.18.1.el6.x86_64 ro root=UUID=a4eea0d1-3150-4b3f-bc4b-204413280ac7 <其他内核参数> clocksource_failover=acpi_pm
```

然后重启虚拟机。

如果对虚拟机的时钟保持问题想进一步了解，可参考vmware的文档[Timekeeping in VMware Virtual Machines](http://www.vmware.com/pdf/vmware_timekeeping.pdf)



# 参考

* [CHAPTER 9. KVM GUEST TIMING MANAGEMENT](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/chap-KVM_guest_timing_management.html)
* [Timekeeping Virtualization for X86-Based Architectures](https://www.kernel.org/doc/Documentation/virtual/kvm/timekeeping.txt) 内核文档中Red Hat撰写的针对KVM的timekeeping.txt，提供了详尽的底层资料
* [[Howto] Fixing unstable clocksource in virtualised CentOS](https://liquidat.wordpress.com/2013/04/02/howto-fixing-unstable-clocksource-in-virtualised-centos/)
* [How to fix Clocksource tsc unstable](https://blog.laimbock.com/2013/09/12/how-to-fix-clocksource-tsc-unstable/)