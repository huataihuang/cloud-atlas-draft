# 为什么guest虚拟机需要精确的时钟

虚拟化涉及到guest虚拟机时钟精度的多项挑战：

* 中断不能始终同时和即时发送给所有guest虚拟机。这就导致在虚拟机中的中断不是真实的中断。相反，虚拟机的中断是通过host主机注入到虚拟机中的。
* host主机可能在运行其他虚拟机，或者其他进程。精确的时钟通常依赖中断，就不能始终保证。

guest虚拟机失去精确的时钟可能会导致网络应用和进程，会话校验，迁移，以及其他依赖时间戳的网络活动出现异常。

KVM通过为guest虚拟机提供一个paravirtual时钟（`kvm-clock`）来避免上述问题。然而，在影响时钟精度的操作，例如guest虚拟机迁移，需要非常仔细测试时间。

> `重要！！！`
>
> 为避免上述问题，在host主机和guest虚拟机上，都要运行网络时钟协议（NTP）服务。在RHEL 6和早期版本，NTP是通过`ntpd`服务来是实现的。在最新的RHEL 7系统，时钟同步服务由`ntpd`或者`chronyd`服务实现。
>
> 注意：在虚拟机中，`chrony`有一些优势，详细可参考「Red Hat Enterprise Linux 7 System Administrator's Guide」章节[Configuring NTP Using the chrony Suite](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/ch-Configuring_NTP_Using_the_chrony_Suite.html)和[Configuring NTP Using ntpd](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/ch-Configuring_NTP_Using_ntpd.html)。

> `chronyd`比`ntpd`具有优势的方便包括：
>
> * 只需要间歇性访问时钟源
> * 适合拥塞的网络而工作良好
> * 通常同步时钟更快更精确
> * 比`ntpd`可以更快调整主机时间
> * `chronyd`可以在Linux主机中以一个较大范围来调整时钟频率，也就是允许在主机时钟中断或不稳定时工作。例如，适合在虚拟机中
>
> 不过，`ntpd`在标准协议以及支持更多的时钟参考源上比`chronyd`具有优势。

# guest虚拟机时间同步的机制

默认情况下，guest使用以下方式和hypervisor之间进行时间同步：

* guest系统启动时，会从模拟的实时时钟（emulated Real Time Clock, RTC）读取时间
* 当NTP西诶初始化之后，它将自动同步guest时钟。之后，随着常规的guest操作，NTP在guest内部执行时钟校准
* 当guest在暂停（pause）或者还原进程之后继续，通过管理软件（例如[virt-manager](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-Managing_guests_with_the_Virtual_Machine_Manager_virt_manager)）发出一个同步guest时钟到指定值的指令。这个同步工作值在[QEMU guest agent](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-QEMU_Guest_Agent)安装在guest系统中并且支持这个功能的时候才会工作。这个guest时钟同步的值通常就是host主机的时钟值。

# 稳定时间戳计数器（Constant Time Stamp Counter, TSC）

现代Intel和AMD处理器提供了一个稳定时间戳计数器（Constant Time Stamp Counter, TSC）。这个稳定的TSC的计数频率不会随着CPU核心更改频率而改变，例如，节电策略导致的cpu主频降低`不会`影响TSC计数。一个CPU具有稳定的TSC频率对于使用TSC作为KVM guest的时钟源时非常重要的。

要查看CPU是否具有稳定的时间戳计数器（constant TSC）需要检查`cpuinfo`中是否有`constant_tsc`标志：

```
cat /proc/cpuinfo | grep constant_tsc
```

如果上述命令没有任何输出，则表明cpu缺少稳定的TSC特性，需要采用其他时钟源。详见下文。

> windows虚拟机同时使用Real-Time Clock(RTC)和Time Stamp Counter(TSC)。对于Windows guest，Real-Time Clock可以用于取代TSC作为所有的时钟源来解决guest时间问题。详细设置和介绍见[Red Hat Enterprise Linux 5 Virtualization Guide: Chapter 17. KVM guest timing management](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/5/html/Virtualization/chap-Virtualization-KVM_guest_timing_management.html)

# 针对没有稳定时间戳计数器（constant tsc）的主机配置

对于没有constant TSC主频的系统不能使用TSC作为虚拟机的时钟源，并且需要附加的配置。对于guest虚拟机，带有精确时间保持功能的电源管理功能接口必须被禁用，以在KVM中精确维持时间。

> `重要`：这部分介绍只针对AMD revision F CPU

如果CPU缺少`constant_tsc`标志位，则需要关闭所有的电源管理功能。（电源管理会导致主频变化，如果CPU没有tsc会导致计时不准确）。

如果主机上TSC不稳定，深度的C状态或者迁移到其他具有更快TSC的主机就有可能会导致`cpufreq`变化。为了避免内核进入深度C状态（也就是深度节电状态），需要在内核启动参数加上`processor.max_cstate=1`。

举例：

```
term Red Hat Enterprise Linux Server (2.6.18-159.el5)
        root (hd0,0)
	kernel /vmlinuz-2.6.18-159.el5 ro root=/dev/VolGroup00/LogVol00 rhgb quiet processor.max_cstate=1
```

要持久化这个修改，则编辑`/etc/default/grub`文件中`GRUB_CMDLINE_LINUX`配置。例如希望更改成激活`emergency`模式：

```
GRUB_CMDLINE_LINUX="emergency"
```

要禁用`cpufeq`（注意：只对**没有**`constant_tsc`的主机需要这样设置），安装`kernel-tools`然后激活`cpupower.service`（`systemctl enable cpupower.service`）。如果想要在每次guest虚拟机启动时禁止这个服务，修改`/etc/sysconfig/cpupower`配置文件，修改`CPUPOWER_START_OPTS`和`CPUPOWER_STOP_OPTS`两个参数。有关限制值可以在`/sys/devices/system/cpu/<cpuid>/cpufreq/scaling_available_governors`文件可以查看。详细信息参考[Red Hat Enterprise Linux 7 Power Management Guide](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Power_Management_Guide/index.html)

# Red Hat Enterprise Linux Guest所需的时间管理参数

对于不同的Red Hat Enterprise Linux guest虚拟机，需要设置对应的内核参数以确保时间正确同步。这些参数可以设置在guest虚拟机的`/etc/grub2.cfg`配置的`/kernel`行。

> **注意**
>
> Red Hat Enterprise Linux 5.5及以后版本，Red Hat Enterprise Linux 6.0及以后版本，以及Red Hat Enterprise Linux 7默认使用`kvm-clock`作为guest系统的时钟源。运行`kvm-clock`避免了附加的内核参数，所以Red Hat推荐使用`kvm-clock`。

详细的不同guest操作系统设置内核参数见[Chapter 8. KVM Guest Timing Management](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-kvm_guest_timing_management)。当前大多数新操作系统版本默认使用`kvm-clock`就可以了，避免繁琐的内核参数设置。

----

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

然而，在运行的虚拟机中，就不能保证虚拟机能够获得足够资源来保证固定的tick（滴答）速率。假设一个物理服务器运行了大量的虚拟机，就有可能在某个瞬间某些虚拟机不能活的足够资源来产生tick（滴答）。如果物理服务器的负载非常高，则ticks的一个backlog(后台日志)就会建立，并且可能不断增长。这就导致vm虚拟机的时钟延后。如果backlog过大，则这个ticks（滴答）甚至可能被抛弃，这样虚拟机的时钟源就会不稳定并且vm虚拟机时间就会落后。

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

> **`警告！`**
> 
> 使用`hpet`和`acpi_pm`时钟源会导致虚拟机性能下降；使用`tsc`作为时钟源能够提高guest虚拟机性能，但是带来的缺点是guest虚拟机时钟会偏移，所以务必要在guest虚拟机中运行`ntpd`服务，确保虚拟机时间精准。

# guest虚拟机采用不同时钟源的性能测试

* 可用guest时钟源及默认时钟源`kvm-clock`

```
# cat /sys/devices/system/clocksource/clocksource0/available_clocksource
kvm-clock tsc acpi_pm
# cat /sys/devices/system/clocksource/clocksource0/current_clocksource
kvm-clock
```

* 测试性能指令：`sysbench cpu --threads=8 --time=300 --cpu-max-prime=100000 run`

* 设置时钟源为`kvm-clock`，性能测试输出如下：

```
echo "kvm-clock" > /sys/devices/system/clocksource/clocksource0/current_clocksource
```

`top`输出：

```
top - 11:39:53 up 23:27,  3 users,  load average: 6.74, 2.48, 0.94
Tasks: 192 total,   1 running, 191 sleeping,   0 stopped,   0 zombie
Cpu0  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu1  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu3  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu4  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu5  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu6  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu7  :100.0%us,  0.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:  32880448k total,   854516k used, 32025932k free,    67620k buffers
Swap:        0k total,        0k used,        0k free,   475092k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND                                                                                                                                                                                                                         
25089 root      20   0 88160 2476 1416 S 799.7  0.0  14:38.32 sysbench
```

`sysbench`输出

```
CPU speed:
    events per second:   278.78

General statistics:
    total time:                          300.0210s
    total number of events:              83639

Latency (ms):
         min:                                 27.98
         avg:                                 28.69
         max:                                126.48
         95th percentile:                     33.12
         sum:                            2399991.83

Threads fairness:
    events (avg/stddev):           10454.8750/37.61
    execution time (avg/stddev):   299.9990/0.01
```

* 设置时钟源为`tsc`，性能测试输出如下：

```
echo "tsc" > /sys/devices/system/clocksource/clocksource0/current_clocksource
```

```
CPU speed:
    events per second:   279.16

General statistics:
    total time:                          300.0256s
    total number of events:              83756

Latency (ms):
         min:                                 27.98
         avg:                                 28.65
         max:                                 43.79
         95th percentile:                     31.94
         sum:                            2399975.15

Threads fairness:
    events (avg/stddev):           10469.5000/37.98
    execution time (avg/stddev):   299.9969/0.01
```

* 设置时钟源为`acpi_pm`，性能测试输出如下：

```
echo "acpi_pmtsc" > /sys/devices/system/clocksource/clocksource0/current_clocksource
```

```
CPU speed:
    events per second:   272.72

General statistics:
    total time:                          300.0241s
    total number of events:              81824

Latency (ms):
         min:                                 28.57
         avg:                                 29.32
         max:                                 43.81
         95th percentile:                     31.94
         sum:                            2398952.96

Threads fairness:
    events (avg/stddev):           10228.0000/29.83
    execution time (avg/stddev):   299.8691/0.01
```

上述性能测试可以看到，300秒内完成测试性能显示： `tsc > kvm-clock > acpi_pm`

| guest时钟源 | kvm-clock | tsc | acpi_pm |
| 300秒完成event | 83639 | 83756 | 81824 |
| 性能 | `基准` | +0.14% | -2.17% |

> 注意：这个测试只是一个举例，实际上性能对比需要`case by case`，针对某些特定不断访问时钟的应用，上述调整guest虚拟机时钟源会有比较大的差异，普通应用则可能差距不大或不明显。

# 参考

* [Red Hat Enterprise Linux 7 Virtualization Deployment and Administration Guide: Chapter 8. KVM Guest Timing Management](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-kvm_guest_timing_management)
* [Red Hat Enterprise Linux 5 Virtualization Guide: Chapter 17. KVM guest timing management](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/5/html/Virtualization/chap-Virtualization-KVM_guest_timing_management.html)
* [Timekeeping Virtualization for X86-Based Architectures](https://www.kernel.org/doc/Documentation/virtual/kvm/timekeeping.txt) 内核文档中Red Hat撰写的针对KVM的timekeeping.txt，提供了详尽的底层资料
* [[Howto] Fixing unstable clocksource in virtualised CentOS](https://liquidat.wordpress.com/2013/04/02/howto-fixing-unstable-clocksource-in-virtualised-centos/)
* [How to fix Clocksource tsc unstable](https://blog.laimbock.com/2013/09/12/how-to-fix-clocksource-tsc-unstable/)