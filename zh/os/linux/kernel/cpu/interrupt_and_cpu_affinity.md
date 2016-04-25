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

表示中断将分布到`8`个内核上（每个`f`代表了4个核，也就是`1111`）

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

**原因是因为没有启用`irqbalance`服务**

# IRQ Balance

`irqbalance`是一个Linux工具用来将中断分散到主机的多个处理器核上帮助提高性能。

`irqbalance`目标是在节能和性能优化之间找到一个平衡。

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
 101:   93571571          0          0          0          0          0          0          0          0      33484          0         61         83        155         69          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix0
 102:   27360106          0          0          0          0         24          0          0      34881          0        487          0         59          0          0          0          0          0          0         38          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix1
 103:   26262780          0          0          0          0          0          0      35722          0          0          0         55          0         91         59          0          0          0          0        387          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix2
 104:   47063144          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0       2776          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix3
 105:   46148644          0          0          0          0          0          0          0          0          0          0          0          0          0          0      19290          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix4
 106:   46304729          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0       9608          0          0  IR-PCI-MSI-edge      mpt2sas0-msix5
 107:   10791269          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0        729          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix6
 108:    8256517          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0       5342          0  IR-PCI-MSI-edge      mpt2sas0-msix7
 109:    8885189          0          0          0          0          0          0          0          0          0          0       1812          0          0          0          0          0       1976          0          0          0       2241          0          0  IR-PCI-MSI-edge      mpt2sas0-msix8
 110:   23529234          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0        398  IR-PCI-MSI-edge      mpt2sas0-msix9
 111:   29429844          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix10
 112:   23132297          0          0          0          0          0         50          0          0          0          0          0          0         16       4572          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix11
 113:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix12
 114:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix13
 115:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix14
 116:          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0          0  IR-PCI-MSI-edge      mpt2sas0-msix15
```

# 参考

* [Introduction to Linux Interrupts and CPU SMP Affinity](http://www.thegeekstuff.com/2014/01/linux-interrupts/)