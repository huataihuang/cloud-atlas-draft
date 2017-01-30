# x86和x86-64架构提供了NMI watchdog

如果你的系统不稳定（莫名其妙的宕机），系统没有键盘连接，也没有办法在系统hung机时候通过人工去触发Kernel core dump，此时你需要使用NMI watchdog！！！

在很多x86/x86-64类型的硬件中提供了一个功能可以激活`watchdog NMI interrupts`（NMI：不可屏蔽中断在系统非常困难时依然可以执行）。这个功能可以用来debug内核异常。通过周期性执行MNI中断，内核可以见识任何CPU思索并且打印出相应的debug信息。

为了使用NMI watchdog，你需要在内核激活APIC支持。对于SMP内核，APIC支持已经自动编译进内核。即在内核配置中：

```
CONFIG_X86_UP_APIC (Processor type and features -> Local APIC support on uniprocessors) 
```

或

```
CONFIG_X86_UP_IOAPIC (Processor type and features -> IO-APIC support on uniprocessors) 
```

> `CONFIG_X86_UP_APIC`是针对没有IO-APIC的单处理器（uniprocessor）
>
> `CONFIG_X86_UP_IOAPIC`是针对支持IO-APIC的单处理器。

注意：一些内核debug选线，例如Kernel Stack Meter或Kernel Tracer可能会隐含地禁用NMI watchdog

对于x86-64，所需的APIC已经编译。

使用本地APIC（`nmi_watchdog=2`）需要第一性能寄存器（the first performance register），所以你不能将其用于其他目的（例如高精度性能采样，high precision performance profiling）。然而，至少[oprofile](http://oprofile.sourceforge.net/about/)和[perfctr](http://user.it.uu.se/~mikpe/linux/perfctr/)驱动会自动禁用本地APIC NMI watchdog。

要激活NMI watchdog，在启动参数中添加`nmi_watchdog=N`，例如`lilo.conf`配置：

```
append="nmi_watchdog=1"
```

对于SMP主机和使用IO-APIC的主机使用 `nmi_watchdog=1`。对于没有IO-APIC的主机，则使用`nmi_watchdog=2`，该选项只适用于一些处理器。如果你不确定，则先设置`nmi_watchdog=1`然后检查`/proc/interrupts`；如果计数始终是0，则将参数修改成`nmi_watchdog=2`再重启检查NMI计数。如果NMI计数依然是0并且日志有报错，则你可能使用了一种需要添加nmi代码的处理器。

`lockup`是指以下场景：

如果系统的任何处理器不能执行周期性的本地始终中断超过`5秒钟`，则NMI处理器就产生一个oops并杀死这个进程。这个`被控制的crash`（以及相应的内核日志）可以用于debug这个排查。当lookup发生，等待5秒钟则oops就会自动出现。如果内核没有任何信息输出，则系统已经完全crash（例如，硬件故障）这样它不能接收NMI中断，或者crash已经使得内核无法打印消息。

注意，当时用local APIC时，它生成NMI中断的频率依赖于系统负载。本地APIC NMI watchdog缺乏较好的源头，使用的是"cycles unhalted"事件（"循环不可挂起"事件）。正如你所猜测的，当CPU处理挂起状态时将没有tick（当系统idle时会发生这种情况），但是如果你的系统在任何情况下死锁，但是`hlt`处理器引入，在每个时钟滴答周期，watchdog将触发`cycles unhalted`事件。如果它死锁在`hlt`，也就是你倒霉的时候 -- 不过这个事件并不是每次都发生，所以watchdog有可能并没有触发。这个也是本地APIC watchdog的一个缺点 -- 不幸的是并不是每次都能发生`clock ticks`事件。I/O APIC watchdog是外部驱动的，所以没有这个缺点。但是I/O APIC watchdog的NMI频率太高，这导致明显影响了系统的性能。

在 x86 平台，`nmi_watchdog`默认是关闭的，你需要在启动参数中激活它。

也可以通过对`/proc/sys/kernel/nmi_watchdog`写入`0`来在运行时关闭NMI watchdog。而写入`1`这个文件则可以重新激活NMI watchdog。**注意你依然需要在启动时使用`nmi_watchdog=X`参数来激活NMI watchdog，否则无法动态修改。**

如果`没有`在内核启动参数中传递`nmi_watchdog=1`参数，则启动后无法动态激活NMI watchdog，即使执行`echo 1 > /proc/sys/kernel/nmi_watchdog`也会出现报错

```
-bash: echo: write error: Input/output error
```

> 启动参数`nmi_watchdog=0`则会禁用NMI watchdog

注意：在内核`2.4.2-ac18`之前的内核`NMI-oopser`在x86 SMP主机上是无条件激活。

## XEN内核激活NMI watchdog

如果执行 `echo 1 > /proc/sys/kernel/nmi_watchdog` 出现以下报错

```
-bash: echo: write error: Input/output error
```

则需要检查`/proc/cmdling`看启动参数中是否激活了NMI watchdog


在XEN启动参数中，我不小心将`nmi_watchdog=1`配置到了`kernel`行（实际这行是`hypervisor`），导致NMI watchdog反而被禁止，`dmesg`就显示如下

```
ACPI: X2APIC_NMI (uid[0xffffffff] high edge lint[0x1])
ACPI: LAPIC_NMI (acpi_id[0xff] high edge lint[0x1])
NMI watchdog is permanently disabled
NMI watchdog is permanently disabled
NMI watchdog is permanently disabled
```

将`nmi_watchdog=1`修改正确配置到`module`行（实际这行是`vmlinuz`)

```
title Example Enterprise Linux Server (2.6.32.36.xen)
    root (hd0,0)
    kernel /xen-4.gz ....
    module /vmlinuz-2.6.32.36.xen ro root=LABEL=/ ... nmi_watchdog=1
    module /initrd-2.6.32.36.xen.img
```

则检查内核启动参数才能看到`nmi_watchdog=1`

```
cat /proc/cmdline
```

类似如下启动参数

```
ro root=LABEL=/ biosdevname=0 console=hvc0 mem=18171M scsi_mod.scan=sync nmi_watchdog=1
```

不过，虽然内核参数配置了`nmi_watchdog=1`，并且也能够通过 `echo 1 > /proc/sys/kernel/nmi_watchdog` 来启用，但是 `grep NMI /proc/interrupts` 始终显示

```
NMI:          0          0          0          0          0          0          0          0   Non-maskable interrupts
```

参考 [Xen Hypervisor Command Line Options](https://xenbits.xen.org/docs/4.2-testing/misc/xen-command-line.html) ，XEN 设置 NMI 的参数传递给 Xen Hypervisor 是通过如下

```
nmi

    = ignore | dom0 | fatal

    Default: nmi=fatal

Specify what Xen should do in the event of an NMI parity or I/O error. ignore discards the error; dom0 causes Xen to report the error to dom0, while 'fatal' causes Xen to print diagnostics and then hang.
```

参考 [The Xen Hypervisor](http://www.informit.com/articles/article.aspx?p=1187966&seqNum=4) ，XEN hypervisor中激活 `Non-Maskable Interrupt (NMI) watchdog timer` 需要使用 `watchdog` 的这个hypervisor参数

所以修改

```
title Example Enterprise Linux Server (2.6.32.36.xen)
    root (hd0,0)
    kernel /xen-4.gz .... watch nmi=fatal
    module /vmlinuz-2.6.32.xen ro root=LABEL=/ ... nmi_watchdog=1
    module /initrd-2.6.32.xen.img
```

> 如果在`module /vmlinuz ...`这行添加`nmi_watchdog=1`内核参数，XEN服务器启动以后可以看到`/proc/cmdline`显示内核参数带了`nmi_watchdog=1`，如果没有内核参数 `nmi_watchdog=1` 则不能通过`echo 1 > /proc/sys/kernel/nmi_watchdog`来激活NMI watchdog

* `Unable to locate IOAPIC for GSI`

发现始终不能检查到`/proc/interrupts`中NMI的计数增长，而且我已经核对过内核编译参数已经开启了APIC

```
CONFIG_X86_LOCAL_APIC=y
CONFIG_X86_IO_APIC=y
```

检查启动日志

```
dmesg | grep -i IOAPIC
```

显示输出

```
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
 [<ffffffff810291fd>] ? enable_ioapic_nmi_watchdog_single+0x0/0x2f
 [<ffffffff8102922a>] enable_ioapic_nmi_watchdog_single+0x2d/0x2f
```

检查启动日志，发现其中有两行`Unable to locate IOAPIC for GSI`记录

```
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: X2APIC_NMI (uid[0xffffffff] high edge lint[0x1])
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: LAPIC_NMI (acpi_id[0xff] high edge lint[0x1])
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: IOAPIC (id[0x08] address[0xfec00000] gsi_base[0])
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : IOAPIC[0]: apic_id 8, version 0, address 0xfec00000, GSI 0-0
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: IOAPIC (id[0x09] address[0xfec01000] gsi_base[24])
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : IOAPIC[1]: apic_id 9, version 0, address 0xfec01000, GSI 24-24
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: IOAPIC (id[0x0a] address[0xfec40000] gsi_base[48])
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : IOAPIC[2]: apic_id 10, version 0, address 0xfec40000, GSI 48-48
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: INT_SRC_OVR (bus 0 bus_irq 0 global_irq 2 dfl dfl)
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ERROR: Unable to locate IOAPIC for GSI 2
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: INT_SRC_OVR (bus 0 bus_irq 9 global_irq 9 high level)
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ERROR: Unable to locate IOAPIC for GSI 9
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : Using ACPI (MADT) for SMP configuration information
Jan 18 01:29:08 r10h04256.sqa.zmf kernel: : ACPI: HPET id: 0x8086a701 base: 0xfed00000
```

# 使用NMI在没有响应的系统上触发crash dump

当系统挂起并且通常中断都被禁止的故障时，可以通过不可屏蔽中断（non maskable interrupt, NMI）来触发一个panic以及获得crash dump。有两种方式来触发一个NMI，不过这两个方法不能同时使用。

## 使用NMI Watchdog来检测系统挂起

> 当NMI watchdog被激活时，系统硬件被设置成周期性产生一个NMI。每个NMI在Linux内核中唤醒一个处理机(handler)来检查一系列中断的计数。如果处理机检查到一定周期时间内计数不再增长，它就假设系统已经夯住（hung）。它就会发起一个内核错误规则（panic routine）。如果激活了kdump，这个规则也会保存一个crash dump。

* 检查是否激活了NMI watchdog

```
grep NMI /proc/interrupts
```

如果始终显示`0`输出

```
 NMI:          0          0          0          0          0          0          0          0   Non-maskable interrupts
```

上述表示没有激活NMI watchdog，则添加`nmi_watchdog=1`或`nmi_watchdog=2`在启动参数。

测试： r10h04256.sqa.zmf  e18d10400.et15sqa

* 激活NMI watchdog

> 不是所有硬件都支持 `nmi_watchdog=1` 启动参数，有些硬件支持`nmi_watchdog=2`参数，一些硬件则两种参数都不支持。

编辑 `/boot/grub/menu.lst`文件添加 `nmi_watchdog=1` 或 `nmi_watchdog=2` 到启动选项，以下是一个简单的案例

```
title Red Hat Enterprise Linux Server (2.6.18-128.el5) 
        root (hd0,0) 
        kernel /vmlinuz-2.6.18-128.el5 ro root=/dev/sda nmi_watchdog=1 
        initrd /initrd-2.6.18-128.el5.img 
```

重启主机，再次通过`grep NMI /proc/interrupts`命令查看NMI计数，可以看到不断增加的计数。

```
NMI:    2123797    2123681    2123608    2123535
```

此时系统在出现不稳定的时候就会生成一个crash dump

## 手工生成一个NMI

> 另一种替代NMI watchdog的方法是手工生成NMI，可以配置内核在接收到一个未知代码的NMI时候触发panic routine。在很多情况下有可能在一个挂起的系统上生成一个NMI来调用panic routine并触发core dump

### 配置Linxu在接收到未知NMI时候调用panic routine

在手工生成NMI来触发crash dump之前，必须配置内核在接收到未知NMI时候调用panic routine

* 如果已经激活了NMI watchdog，则通过在启动参数中移除`nmi_watchdog`启动参数并重启系统来关闭NMI watchdog

> 注意：在SLES 10上同时设置`unknown_nmi_panic`内核启动参数和`nmi_watchdog`内核启动参数可能会触发panic routine。在Red Hat Enterprise Linux 5.3，使用`unknown_nmi_panic`内核启动参数可能会禁止掉`nmi_watchdog`内核启动参数。

* 使用以下命令来检查系统是否设置了在接收到未知NMI的时候触发panic规则

```
sysctl kernel.unknown_nmi_panic
```

如果系统没有配置接收到未知NMI时候触发panic的规则，则上述命令输出就是

```
kernel.unknown_nmi_panic = 0
```

当使用默认的内核设置，Linux内核日志将未知NMI信息记录到`/var/log/messages`，但是系统是不会调用panic routine的。以下是一个没有配置好接收未知NMI触发panic的系统的`/var/log/messages`日志案例：

```
Jun 11 10:26:46 testsystem kernel: Uhhuh. NMI received for unknown reason 30. 
Jun 11 10:26:46 testsystem kernel: Do you have a strange power saving mode enabled? 
Jun 11 10:26:46 testsystem kernel: Dazed and confused, but trying to continue
```

* 要激活内核在接收到未知NMI时候触发panic routine，编辑`/etc/sysctl.conf`配置如下

```
kernel.unknown_nmi_panic = 1
```

* 输入以下命令重新加载设置，可以看到输出中包括了新的`unknown_nmi_panic`配置

```
sysctl -p
```

输出中包括了

```
kernel.unknown_nmi_panic = 1
```

此时系统就已经设置好了检测NMI触发panic routine的功能。

如果只是临时启用unknown nmi panic，可以直接使用如下命令

```
echo 1 | sudo tee /proc/sys/kernel/unknown_nmi_panic
```

### 通过IPMI生成一个NMI

大多数服务器都配备了主板管理控制器（baseboard management controller, BMC），支持IPMI平台管理标准。BMC可以设置允许通过网络接口接受远程的带外管理命令。IPMI标准制定了一个命令可以使得BMC触发一个NMI发送给系统。

要通过IPMI触发NMI，使用以下命令

```
ipmitool -I lan -H <Host> -U <User ID> -a chassis power diag
```

当系统发生故障无法响应或输入，BMC依然是在工作的，并且可以从远程接收NMI。如果内核已经过配置了在接收未知NMI时候触发panic routine(即上文的`kernel.unknown_nmi_panic = 1`)，就能生成vmcore方便后续debug。


# 参考

* [Linux/Documentation/nmi_watchdog.txt](http://lxr.free-electrons.com/source/Documentation/nmi_watchdog.txt?v=2.6.32)
* [Triggering crash dumps on non-responsive systems using NMI](http://www.ibm.com/support/knowledgecenter/linuxonibm/liaai.crashdump/liaaicrashdumptrignmi.htm)