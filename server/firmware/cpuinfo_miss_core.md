# 问题

昨天遇到一个奇怪的问题：多台测试服务器中，有一台服务器虽然CPU型号相同

```
cpu family	: 6
model		: 79
model name	: Intel(R) Xeon(R) CPU E5-2667 v4 @ 3.20GHz
```

但是`cat /proc/cpuinfo`显示CPU数量和其他服务器不同，缺少8个core，即最高显示24个CPU core

> 参考[Intel® Xeon® Processor E5-2667 v3](http://ark.intel.com/products/83361/Intel-Xeon-Processor-E5-2667-v3-20M-Cache-3_20-GHz)说明文档，可以看到这款CPU是8核16HT，也就是对于双处理器的服务器 `cat /proc/cpuinfo`应该能够看到`32个processor`。

但是这台故障服务器最高的CPU id只显示`23`，并且不论怎么重启操作系统，只能显示24个CPU。

```
processor	: 23
vendor_id	: GenuineIntel
cpu family	: 6
model		: 79
model name	: Intel(R) Xeon(R) CPU E5-2667 v4 @ 3.20GHz
stepping	: 1
microcode	: 0xb00001b
cpu MHz		: 3344.875
cache size	: 25600 KB
physical id	: 1
siblings	: 12
core id		: 7
cpu cores	: 6
apicid		: 47
initial apicid	: 47
fpu		: yes
fpu_exception	: yes
cpuid level	: 20
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc aperfmperf eagerfpu pni pclmulqdq dtes64 ds_cpl vmx smx est tm2 ssse3 fma cx16 xtpr pdcm pcid dca sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch ida arat epb pln pts dtherm tpr_shadow vnmi flexpriority ept vpid fsgsbase tsc_adjust bmi1 hle avx2 smep bmi2 erms invpcid rtm cqm rdseed adx smap xsaveopt cqm_llc cqm_occup_llc
bogomips	: 6391.30
clflush size	: 64
cache_alignment	: 64
address sizes	: 46 bits physical, 48 bits virtual
power management:
```

# 排查故障

* 检查dmesg显示操作系统只检测到24核

```
[    0.000000] smpboot: Allowing 24 CPUs, 0 hotplug CPUs
[    0.000000] setup_percpu: NR_CPUS:5120 nr_cpumask_bits:24 nr_cpu_ids:24 nr_node_ids:1
[    0.000000] PERCPU: Embedded 31 pages/cpu @ffff881fff200000 s87296 r8192 d31488 u131072
[    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=24, Nodes=1
[    0.000000] 	RCU restricting CPUs from NR_CPUS=5120 to nr_cpu_ids=24.
[    0.000000] 	Offload RCU callbacks from all CPUs
[    0.000000] 	Offload RCU callbacks from CPUs: 0-23.
[    0.114834] CPU: Physical Processor ID: 0
[    0.119060] CPU: Processor Core ID: 0
[    0.123648] mce: CPU supports 22 MCE banks
[    0.127986] CPU0: Thermal monitoring enabled (TM1)
[    0.337538] smpboot: CPU0: Intel(R) Xeon(R) CPU E5-2667 v4 @ 3.20GHz (fam: 06, model: 4f, stepping: 01)
[    0.413021] NMI watchdog: enabled on all CPUs, permanently consumes one hw-PMU counter.
[    0.817090] Brought up 24 CPUs
```

而正常的32核服务器则启动信息显示如下：

```
[    0.000000] smpboot: Allowing 32 CPUs, 0 hotplug CPUs
[    0.000000] setup_percpu: NR_CPUS:5120 nr_cpumask_bits:32 nr_cpu_ids:32 nr_node_ids:1
[    0.000000] PERCPU: Embedded 31 pages/cpu @ffff881fff200000 s87296 r8192 d31488 u131072
[    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=32, Nodes=1
[    0.000000] 	RCU restricting CPUs from NR_CPUS=5120 to nr_cpu_ids=32.
[    0.000000] 	Offload RCU callbacks from all CPUs
[    0.000000] 	Offload RCU callbacks from CPUs: 0-31.
[    0.114882] CPU: Physical Processor ID: 0
[    0.119105] CPU: Processor Core ID: 0
[    0.123693] mce: CPU supports 22 MCE banks
[    0.128031] CPU0: Thermal monitoring enabled (TM1)
[    0.337575] smpboot: CPU0: Intel(R) Xeon(R) CPU E5-2667 v4 @ 3.20GHz (fam: 06, model: 4f, stepping: 01)
[    0.413354] NMI watchdog: enabled on all CPUs, permanently consumes one hw-PMU counter.
[    0.932902] Brought up 32 CPUs
```

**对比可以看到，主要的差别是`cpu cores`**

通过参考AMI BIOS操作手册，显示BIOS是可以通过设置`Active Processor Cores`来开启或者关闭部分核心。

AMD的官方手册[BIOS and Kernel Developer's Guide (BKDG) For AMD Family 10h Processors](http://support.amd.com/TechDocs/31116.pdf) 提供了一些参考资料。

[Fitlet BIOS guide](http://www.fit-pc.com/wiki/index.php/Fitlet_BIOS_guide#CPU_Settings) 介绍了基于AMI BIOS的配置方法，可以看到有一个[CPU Settings](http://www.fit-pc.com/wiki/index.php/Fitlet_BIOS_guide#CPU_Settings)提供了`CPU Settings => Core Leveling Mode: Change the number of Cores in the system.`

果然，故障服务器从`dmidecode`检查却看到处理器是激活了所有6个核心（以下输入内容中` Core Enabled`项）

```
        Version: Intel(R) Xeon(R) CPU E5-2667 v4 @ 3.20GHz
        Voltage: 1.8 V
        External Clock: 100 MHz
        Max Speed: 4000 MHz
        Current Speed: 3200 MHz
        Status: Populated, Enabled
        Upgrade: Socket LGA2011-3
        L1 Cache Handle: 0x0088
        L2 Cache Handle: 0x0089
        L3 Cache Handle: 0x008A
        Serial Number: Not Specified
        Asset Tag: Not Specified
        Part Number: Not Specified
        Core Count: 8
        Core Enabled: 6
        Thread Count: 16
```

> 还需要检查一下操作系统是否有禁止CPU的情况（Linux支持offline某个CPU核心）

```
#lscpu --extended -b
CPU NODE SOCKET CORE L1d:L1i:L2:L3 ONLINE
0   0    0      0    0:0:0:0       yes
1   0    0      1    1:1:1:0       yes
2   0    0      2    2:2:2:0       yes
3   0    0      3    3:3:3:0       yes
4   0    0      4    4:4:4:0       yes
5   0    0      5    5:5:5:0       yes
6   0    1      6    6:6:6:1       yes
7   0    1      7    7:7:7:1       yes
8   0    1      8    8:8:8:1       yes
9   0    1      9    9:9:9:1       yes
10  0    1      10   10:10:10:1    yes
11  0    1      11   11:11:11:1    yes
12  0    0      0    0:0:0:0       yes
13  0    0      1    1:1:1:0       yes
14  0    0      2    2:2:2:0       yes
15  0    0      3    3:3:3:0       yes
16  0    0      4    4:4:4:0       yes
17  0    0      5    5:5:5:0       yes
18  0    1      6    6:6:6:1       yes
19  0    1      7    7:7:7:1       yes
20  0    1      8    8:8:8:1       yes
21  0    1      9    9:9:9:1       yes
22  0    1      10   10:10:10:1    yes
23  0    1      11   11:11:11:1    yes
```

检查是否有offline的CPU - 显示没有输出

```
lscpu --extended -c
```

# 故障解决

## AMI BIOS配置修订方法

使用AMI的`SCELNX_64`工具命令输出当前BIOS配置

```
sudo SCELNX_64 /o /s /tmp/bios.config
```

如果要修改BIOS，则修改输出的`/tmp/bios.config`配置文件，然后刷回去

```
sudo  SCELNX_64 /i /s /tmp/bios.config
```

## 对比并修正BIOS配置

对比了正常服务器的`BIOS`输出信息，发现异常服务器的配置主要是因为`Setup Question  = Cores Enabled`段落的差异，每段都没有激活`[00]ALL`(需要将`*`移动到激活选项上)，并且有部分`Cores Enabled`被设置成了`6`个core激活

```
Setup Question  = Cores Enabled
Token   =C00    // Do NOT change this line
Offset  =73
Width   =01
BIOS Default    =[00]ALL
Options =[00]ALL    // Move "*" to the desired Option

...

Setup Question  = Cores Enabled
Token   =C03    // Do NOT change this line
Offset  =73
Width   =01
BIOS Default    =[00]ALL
Options =[00]ALL    // Move "*" to the desired Option
         [01]1
         [02]2
         [03]3
         [04]4
         [05]5
         *[06]6
         [07]7

Setup Question  = Cores Enabled
Token   =C04    // Do NOT change this line
Offset  =73
Width   =01
BIOS Default    =[00]ALL
Options =[00]ALL    // Move "*" to the desired Option
         [01]1
         [02]2
         [03]3
         [04]4
         [05]5
         *[06]6
         [07]7
         [08]8
         [09]9
...
```

正常服务器则是

```
Setup Question  = Cores Enabled
Token   =C00    // Do NOT change this line
Offset  =73
Width   =01
BIOS Default    =[00]ALL
Options =*[00]ALL   // Move "*" to the desired Option

...
Setup Question  = Cores Enabled
Token   =C04    // Do NOT change this line
Offset  =73
Width   =01
BIOS Default    =[00]ALL
Options =*[00]ALL   // Move "*" to the desired Option
         [01]1
         [02]2
         [03]3
         [04]4
         [05]5
         [06]6
         [07]7
         [08]8
         [09]9
...
```

编辑BIOS文件，将`*`移动到`[00]ALL`，然后执行刷入BIOS，再重启服务器就可以看到正常的32个CPU核心了。

# 参考

* [Configuring the HX Series appliance](http://systemx.lenovofiles.com/help/index.jsp?topic=%2Fcom.lenovo.conv.8689.doc%2Ft_configuring_hx_appliance.html)
* [Use AMISCE tool to update BIOS configuration under linux](http://lisoulin.blogspot.com/2014/07/use-amisce-tool-to-update-bios.html)