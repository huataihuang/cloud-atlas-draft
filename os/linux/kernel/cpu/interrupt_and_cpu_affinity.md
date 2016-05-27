中断是通过硬件或软件发出的信号，允许设备如键盘，串口卡和并口等请求CPU处理资源。一旦CPU接收到中断请求，CPU就会临时停止运行程序的执行并调用一个称为中断处理的特殊程序，也称为ISR(中断服务程序，Interrupt Service Routine)。

中断服务或中断处理程序可以在一个中断向量表中找到定位到内存的固定地址中。在CPU处理完中断之后，CPU就会继续运行前面被中断的程序。

在启动时，系统将标记所有的设备，以及相应的中断处理被加载到内存的中断表中。

有两种获得CPU资源的方式：

* 基于中断
* 基于轮询

Linux是中断驱动的操作系统。当我们按下键盘的按键，键盘就会告知CPU某个按键已经触动。但是CPU可能正在忙于处理内存中的一些数据，系统时钟，网卡，或者视频或者PCI总线。这个例子中，键盘会在分配给硬件的IRQ流水线上放置一个电压标识事件。这个从设备的电压差的更改表示一个请求，告知CPU该设备需要处理请求。

# `/proc/interrupts`文件

```bash
cat /proc/interrupts
```

显示输出

```bash
           CPU0       CPU1       CPU2       CPU3       CPU4       CPU5       CPU6       CPU7       
  0:         17          0          0          0          0          0          0          0   IO-APIC   2-edge      timer
  8:          0          0          0          0          0          1          0          0   IO-APIC   8-edge      rtc0
  9:       4058        258        157         14        464        454         34        134   IO-APIC   9-fasteoi   acpi
 16:     137153      19574      11430      10138      47072      27502      15934      10113   IO-APIC  16-fasteoi   ahci[0000:05:00.0], xhci-hcd:usb1, nvkm
 17:         16          3          1          9         35          2          2          1   IO-APIC  17-fasteoi   snd_hda_intel:card1
 18:      88952       2170       1592       1253       4255       5430       1790       1738   IO-APIC  18-fasteoi   wlp3s0
 22:     172111       2954       2515       1897       5000       3684       2479       2513   IO-APIC  22-fasteoi   snd_hda_intel:card0
NMI:          0          0          0          0          0          0          0          0   Non-maskable interrupts
LOC:     395090     279787     239243     235695     233918      90471      94234      90479   Local timer interrupts
SPU:          0          0          0          0          0          0          0          0   Spurious interrupts
PMI:          0          0          0          0          0          0          0          0   Performance monitoring interrupts
IWI:          0          0          0          1          1          1          0          3   IRQ work interrupts
RTR:          6          0          0          0          0          0          0          0   APIC ICR read retries
RES:       7425       5663       4375       3801       3051       2825       1963       1787   Rescheduling interrupts
CAL:         31         29         24         22         36         28         34         31   Function call interrupts
TLB:      10387      11374      10758      11769       7566       8508       8799       7195   TLB shootdowns
TRM:          2          2          2          2          2          2          2          2   Thermal event interrupts
THR:          0          0          0          0          0          0          0          0   Threshold APIC interrupts
MCE:          0          0          0          0          0          0          0          0   Machine check exceptions
MCP:         17         17         17         17         17         17         17         17   Machine check polls
ERR:          0
MIS:          0
PIN:          0          0          0          0          0          0          0          0   Posted-interrupt notification event
PIW:          0          0          0          0          0          0          0          0   Posted-interrupt wakeup event
```

* 第一列是IRQ号
* 第二列表示这个CPU内核被多少次中断。上例中，`[System clock]`系统时钟（名字是`timer`）在CPU0上发生中断17次。
* `rtc`（`[Real time clock]`）实时时钟是不能被中断的，这个设备是表示电子设备跟踪时间的。
* `NMI`和`LOC` 是系统使用的驱动，用户不能访问和配置。

IRQ号表示CPU处理中断的请求的优先级，IRQ编号越小表示优先级越高。

例如，CPU同时接收到键盘和系统时钟发出的中断请求，则CPU会首先处理系统时钟，因为系统时钟的IRQ编号是0。

* IRQ 0 -- 系统时钟（不能修改中断编号）
* IRQ 1 -- 键盘控制器（不能修改中断编号）
* IRQ 3 -- 串口2的串口控制器（和串口4共享中断）
* IRQ 4 -- 串口1的串口控制器（和串口3共享中断）
* IRQ 5 -- 并口2和并口3或者是声卡
* IRQ 6 -- 软盘控制器
* IRQ 7 -- 并口1，用于打印机

# 硬件中断

硬件中断分为 两大类：

* 不可屏蔽中断（Non-maskable interrupts, `[NMI]`）：对于不可屏蔽中断CPU是不能忽略或抑制的。NMI是通过独立的中断线路发送并且NMI通常用于紧急的硬件错误，例如内存错误，风扇故障触发的硬件通知，温度传感器故障等。
* 可屏蔽中断（Maskable interrupts）：可屏蔽中断是指可以被CPU忽略或者延迟处理的中断。中断屏蔽寄存器在缓存控制器的扩展引脚上被触发屏蔽。通过写入0到一个寄存位，可以禁止这个引脚上触发中断。

# 软件中断

软件中断是在CPU执行一个可以在CPU `[ALU unit]` 自身上导致异常环境的指令所产生的中断信号。

例如，用0来除一个数是不可能的，这就会导致被0除异常，这引发计算机放弃计算或显示一个错误消息。

文件 `/proc/stat` 就是用来显示系统内核状态信息，也包含了一些中断信息。

```bash
cat /proc/stat
```

显示输出

```bash
cpu  45328 9 13736 5379262 16683 0 971 0 0 0
cpu0 7569 2 3842 660736 6338 0 609 0 0 0
cpu1 8028 1 2507 666702 2966 0 227 0 0 0
cpu2 7472 1 2046 671270 1795 0 61 0 0 0
cpu3 7768 3 2007 671623 1218 0 16 0 0 0
cpu4 4156 0 1219 675798 1515 0 28 0 0 0
cpu5 3459 0 713 676794 908 0 12 0 0 0
cpu6 3466 0 706 677984 1027 0 11 0 0 0
cpu7 3408 0 692 678352 914 0 5 0 0 0
intr 3483175 17 0 0 0 0 0 0 0 1 8100 0 0 0 0 0 0 426348 69 161565 0 0 0 297315 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
ctxt 10100736
btime 1461590436
processes 3761
procs_running 1
procs_blocked 0
softirq 3410507 0 1134191 4 54518 66785 0 176019 1082572 0 896418
```

注意，这里`intr`行就是每个中断号的中断发生次数（是所有cpu核处理的该中断号的次数总和）。可以对比前面`cat /proc/interrupts`，例如，中断`9`的总次数是`8100`，在`/proc/interrupts`中累加各个cpu的该中断号的中断次数就可以看到`6534+259+158+14+501+39+136` = `8100` 。

# `SMP_AFFINITY`

 对称多处理器（`symmetric multiprocessing`）是通过多个处理器处理程序的方式。`smp_affinity`文件处理一个IRQ号的中断亲和性。在`smp_affinity`文件结合每个IRQ号存储在`/proc/irq/IRQ_NUMBER/smp_affinity`文件。这个文件中的值是一个16进制位掩码表示系统的所有CPU核。`smp_affinity`在激活`IO-APIC`设备驱动的设备上工作。
 
例如，我的笔记本使用的无线网卡设备是`wlp3s0`，其中断如下

```bash
grep wlp3s0 /proc/interrupts
```

输入如下

```bash
18:     153111       3033       2255       1848       6972       8963       2788       2556   IO-APIC  18-fasteoi   wlp3s0
```

这里`wlp3s0`设备的IRQ 号是`18`，相应的`smp_affinity`是

```bash
cat /proc/irq/18/smp_affinity
```

显示输出

```
ff
```

`smp_affinity`是16进制表示，f就是二进制的`1111` ，表示4个cpu都会参与处理中断。这里`ff`表示有8个cpu核心同时处理中断（实际我的笔记本是i7，双核，每个核有4个超线程）

这个中断分布的cpu核也可以从 `smp_affinity_list` 看到（是数字表示）

```bash
cat /proc/irq/18/smp_affinity_list
```

显示输出

```
0-7
```

不过，从上述`/proc/interrupts`观察，虽然无线网卡中断是`smp_affinity`到所有cpu核上，但是`cpu0`明显分担的中断要高于其他核。

我也在线上观察了`mpt2sas0`存储控制器中断  (` mpt2sas0-msix0`到`mpt2sas0-msix15`)，发现即使`smp_affinity`默认配置是`ffffffff`，也就是`smp_affinity_list`是`0-31`，但是，从`/proc/interrupts`观察，所有中断都落在`cpu0`上了:

```bash
 102:  625138460          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix0
 103:  325547647          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix1
 104:  453336548          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix2
 105:  521814590          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix3
 106:  513404541          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix4
 107:  501082698          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix5
 108:   98390223          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix6
 109:  124038594          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix7
 110:  190363522          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix8
 111:  190036640          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix9
 112:  195942839          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix10
 113:  205279075          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix11
 114:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix12
 115:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix13
 116:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix14
 117:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix15
```

**原因是没有启用`irqbalance`服务**，默认的的`mpt2sas0-msix`队列中断都被绑定到`cpu0`。后文中启动了`irqbalance`服务，设置了每个`mpt2sas0-msix`的中断到不同的cpu上，实现了中断分散。

居然有[一种将sas控制器中断绑定到cpu的自动化方法](http://www.google.com/patents/CN104572282A?cl=zh)的专利申请，实在有些无语。

# IRQ Balance

`irqbalance`是一个Linux工具用来将中断分散到主机的多个处理器核上帮助提高性能。`irqbalance`避免所有的IRQ请求都由单一的CPU负担。很多4核以上CPU系统缓慢有时是因为都在等待`CPU 0`处理网络或者存储的IRQ请求。此时CPU 0非常繁忙，而其他CPU则非常空闲。应用缓慢是因为它们在等待从CPU 0返回请求。

`irqbalance`尝试一种智能方法使中断分布到所有的CPU，如果可能，将IRQ处理和处理器尽可能接近。这可能是相同的内核，和相同缓存共享的内核，或相同NUMA区域的内核。`irqbalance`目标是在节能和性能优化之间找到一个平衡。

**除了**以下情况，你都 **应该使用** irqbalance：

* 由于非常特殊原因需要人工设置应用/IRQ集中到特定内核（例如，更小的延迟，实时请求等）
* 虚拟机：虚拟机不能实际获得性能提高，因为除非你将guest绑定到特定的CPU和IRQ并且隔离网络/存储硬件，否则你看不到任何性能提高。但是你的KVM/RHEV在主机**需要**使用irqbalance和numa并且调优。

Numad是类似irqbalance的机制并且它将处理器和内存限定在相同的numa区域。在多核系统中，可以看到在重负载下明显降低延迟平滑的可靠的性能。

如果维护人员有很好的技术以及经常监控或者具有非常规则的负载，则可能通过人工绑定进程和IRQ到特定处理器。即使这种情况，irqbalance和numad也能达到近似的效果。所以，如果不能确定或者负载不是规律的，还是建议使用irqbalance和numad 

> 参考 [Is there still a use for irqbalance on modern hardware?](http://serverfault.com/questions/513807/is-there-still-a-use-for-irqbalance-on-modern-hardware)

如果系统没有安装`irqbalance`，可以通过以下命令安装

```bash
yum install irqbalance -y
```

安装后可以启动服务

```bash
service irqbalance start
```

经过一些磁盘文件操作后，可以看到前面案例中`mpt2sas0`的中断开始分散到各个处理器上

```bash
            CPU0       CPU1       CPU2       CPU3       CPU4       CPU5       CPU6       CPU7       CPU8       CPU9       CPU10      CPU11      CPU12      CPU13      CPU14      CPU15      CPU16      CPU17      CPU18      CPU19      CPU20      CPU21      CPU22      CPU23      

 101:   93571571          0          0          0          0          0          0          0          0     150968          0         61         83        155         69          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix0
 102:   27360106          0          0          0          0         24          0          0     130209          0        487          0         59          0          0          0          0          0          0         38          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix1
 103:   26262780          0          0          0          0          0          0     132902          0          0          0         55          0         91         59          0          0          0          0        387          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix2
 104:   47063144          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0      67648          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix3
 105:   46148644          0          0          0          0          0          0          0          0          0          0          0          0          0          0     125707          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix4
 106:   46304729          0          0          0          0          0        123          0          0          0          0          0          0          0      86076       5361          0        181          0          0          0      33378          0          0  IR-PCI-MSI-edge      mpt2sas0-msix5
 107:   10791398          0          0          0          0          0        322          0          0          0          0      10795          0          0       1286          0       3381         86          0         49          0         98      31043          0  IR-PCI-MSI-edge      mpt2sas0-msix6
 108:    8258858          0          0          0          0          0       2770          0          0          0          0          0          0         39      21046          0       7394       1037          0        427          0       9797       8637          0  IR-PCI-MSI-edge      mpt2sas0-msix7
 109:    8885189          0          0          0          0          0          0          0          0          0          0      63530          0          0          0          0      11010       2050          0          0          0       2241          0          0  IR-PCI-MSI-edge      mpt2sas0-msix8
 110:   23529234          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0      25187  IR-PCI-MSI-edge      mpt2sas0-msix9
 111:   29442882          0          0          0          0          0        231          0          0          0          0          0          0          0          0          0      56418          0          0          0          0      77554          0          0  IR-PCI-MSI-edge      mpt2sas0-msix10
```

检查`mpt2sas0`的中断`smp_affinity`:

```bash
#for i in {101..111};do cat /proc/irq/$i/smp_affinity;done
000200
000100
000080
100000
008000
008000
400000
200000
000800
800000
010000
```

可以看到`irqbalance`启动后，调整了每个中断的`smp_affinity`设置，我们可以核对一下是设置`smp_affinity`是否和`/proc/interrupts`观察是否一致。

举例:

| 中断 | smp_affinity | cpu |
| :----: | :----: | :----: |
| `101` | `000200` | `0000 0000 0000 0010 0000 0000` |
| `102` | `000100` | `0000 0000 0000 0001 0000 0000` |
| `103` | `000080` | `0000 0000 0000 0000 1000 0000` |
| `104` | `100000` | `0001 0000 0000 0000 0000 0000` |
| `105` | `008000` | `0000 0000 1000 0000 0000 0000` |
| `106` | `008000` | `0000 0000 1000 0000 0000 0000` |
| `107` | `400000` | `0100 0000 0000 0000 0000 0000` |
| `108` | `200000` | `0010 0000 0000 0000 0000 0000` |
| `109` | `000080` | `0000 0000 0000 0000 1000 0000` |
| `110` | `000800` | `0000 0000 0000 1000 0000 0000` |
| `111` | `010000` | `0000 0001 0000 0000 0000 0000` |

对于32核以上系统，用逗号分隔不连续的32核。例如，对于64核系统中IRQ 40

```bash
# cat /proc/irq/40/smp_affinity
ffffffff,ffffffff
```

 如果要在上述64核系统的后32核上提供IRQ 40，执行
 
 ```bash
# echo 0xffffffff,00000000 > /proc/irq/40/smp_affinity
# cat /proc/irq/40/smp_affinity
ffffffff,00000000
```

# 针对消息服务器的调优 - 中断和处理进程绑定

[Red Hat Entreprise MRG](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_MRG/) 是集成了消息（Messaging），实时（Realtime）和网格（Grid）服务器，其中[Interrupt and process binding](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_MRG/2/html/Realtime_Tuning_Guide/sect-Realtime_Tuning_Guide-General_System_Tuning-Interrupt_and_Process_Binding.html)对中断和处理进程绑定到不同隔离的CPU以提供更好的实时响应提供了借鉴。

> MRG的Messageing部分是基于[Apache Qpid开源项目](http://qpid.apache.org)

以下是文档摘录翻译：

实时环境需要在响应不同的事件时最小化和消除延迟。理想情况下，中断（IRQs）和用户处理进程可以相互隔离在不同的分离的CPU上。

中断是常见的在多个CPU之间共享事件。通过写入新数据和指令缓存可以延迟中断处理，并且通常导致和其他进程争夺CPU资源。为了解决这个问题，时间敏感中断和处理进程可以分离到不同CPU或者一组CPU。这样，代码和数据结构需要处理这个具有高可能性位于处理器数据和指令缓存的中断。这个隔离的进程就可以运行得尽可能快速，而其他非时间敏感的进程可以运行在其他剩余的CPU上。这个处理在一些有些内存和总线带宽的涉及速度的环境下非常重要，此时，任何等待内存返回数据到处理器缓存的等待都会影响处理时间。

例如，在不同环境下调优程序，优化的方式完全不同。有些环境下，可能需要隔离2到4个CPU用于应用程序；另一些情况，将网络相关的应用程序处理进程绑定到CPU来处理网络驱动中断的优化。极端情况下，优化是通过尝试不同设置来发现适合工作的最优设置。

> 对于多处理器环境，需要了解 `CPU mask`如何作用于给定CPU或一系列CPU。`CPU mask`通常表述未一个32位的位掩码（bitmask）。`CPU mask`可以表述为10进制或者16进制数字，取决于你使用的命令。例如，CPU `0`的`CPU mask`的位图表述是`00000000000000000000000000000001`，10进制表述就是`1`，而16进制表述就是`0x00000001`。同时使用CPU `0`和`1`的位图表述是`00000000000000000000000000000011`，10进制表述就是`3`，而16进制表述就是`0x00000003`。

默认情况下系统会启动 `irqbalance` 服务用于周期性处理CPU事件，公平方式。然而在实时环境的部署中，应用程序通常是绑定到特定的CPU上，所以不需要`irqbalance`。此时，应该关闭`irqbalance`

    service irqbalance stop
    chkconfig irqbalance off

另外一种方式是只在使用隔离功能的CPU上禁用`irqbalance`，而在其余的CPU上继续使用`irqbalance`。这个设置可以通过 `/etc/sysconfig/irqbalance`来实现，即编辑 `FOLLOW_ISOLCPUS` 部分：

    FOLLOW_ISOLCPUS=yes

这个设置使 `irqbalance` 只在没有设置隔离的CPU上生效。这个设置对于只有两个处理器的主机是没有效果的，但都与双核主机是有效的。

# 使用`taskset`工具将进程绑定处理器

`taskset`工具可以使用进程ID（PID）来查看或设置关联，或者可以用于选择一个CPU关联的方式来运行一个命令。要设置关联，`taskset`需要将`CPU mask`表述为10进制或者16进制数字。这个mask参数是一个指定哪个CPU内核是合法的被修改的命令或PID。

要设置当前没有运行的进程，使用 `taskset` 和指定`CPU mask`和进程。例如，`my_embedded_process`是设置只使用CPU `3`：

    taskset 8 /usr/local/bin/my_embedded_process

可以使用位图指定一系列CPU，例如这里指定 `4 5 6 7`用于运行 `my_embedded_process`

    taskset 0xF0 /usr/local/bin/my_embedded_process

也可以对已经运行的进程设置CPU关联，此时需要使用 `-p`或者`--pid`参数来指定特定PID的进程使用，例如，这里指定PID为7013的进程只运行在CPU `0`上：

    taskset -p 1 7013

> **注意** `taskset`工具只能用于没有激活系统NUMA（非统一内存访问）的环境（在NUMA环境中，使用`numactl`命令来替代`taskset`）

# 软中断

参考 [softirq](softirq.md)

# 参考

* [Introduction to Linux Interrupts and CPU SMP Affinity](http://www.thegeekstuff.com/2014/01/linux-interrupts/)
* [中断和 IRQ 调节](https://access.redhat.com/documentation/zh-CN/Red_Hat_Enterprise_Linux/6/html/Performance_Tuning_Guide/s-cpu-irq.html)