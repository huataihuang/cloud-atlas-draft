
> 以下这段翻译自[Does using TSC as clock source improve timer and scheduling granularity?](https://stackoverflow.com/questions/13950264/does-using-tsc-as-clock-source-improve-timer-and-scheduling-granularity)

在默认的Linux 2.6内核，可编程中断控制器（Programmable Interrupt Controller, PIT）（在所有PC上都提供）是作为系统时钟的。PIT正如其名字，是可以编程的（通常，内核启动是）用于以一个预先确定的频率中断CPU。这个预先确定的频率就是常说的HZ值，恒定的呢关于内核编译时设置的`CONFIG_HZ`。所以可以在编译时候修改`CONFIG_HZ`并且PIT将以指定的频率来发起中断。然而，这个PIT时通过类似1.193 MHz时钟来设置的，所以设置`CONGIG_HZ`大于这个值不推荐。

> 本地APIC（Advanced Programmable Interrupt Controller，高级可编程中断控制器）在多处理器系统用于处理器之间同步。

以上，PIT（和非本地APIC）时HZ值绑定的（至少在2.6内核）

现代的CPU已经能够更改CPU时钟频率以便节约电能消耗，这样就会影响Time-stamp counter存储的值。


# KVM和Xen

[KVM Guest时间管理](../../../../virtual/kvm/deployment_and_administration/kvm_guest_timing_management.md)介绍了如何在虚拟机中保持时间同步 - 从RHEL 5.5开始以及更新版本，RHEK 6以及更新版本，RHEL 7都使用`kvm-clock`作为自己默认的时钟源。如果不使用`kvm-clock`，则需要特殊的配置，并且不推荐使用非`kvm-clock`其他时钟源。

# 参考

* [Pitfalls of TSC usage](http://oliveryang.net/2015/09/pitfalls-of-TSC-usage/) EMC开发工程师Oliver(Yong) Yang撰写的x86平台使用TSC存在的坑，是非常好的经验参考
* [Timekeeping in VMware Virtual Machines](http://www.vmware.com/files/pdf/Timekeeping-In-VirtualMachines.pdf) VMware提供的技术文档
* [Linux 时钟管理](https://www.ibm.com/developerworks/cn/linux/l-cn-timerm/) - IBM developWorks网站提供的技术文档
* [Does using TSC as clock source improve timer and scheduling granularity?](https://stackoverflow.com/questions/13950264/does-using-tsc-as-clock-source-improve-timer-and-scheduling-granularity)