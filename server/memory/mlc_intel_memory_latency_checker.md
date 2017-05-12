# 介绍

影响应用程序性能的一个重要因素是应用程序从处理器缓存和从内存子系统获取数据所消耗的时间。在激活了非统一内存访问架构（Non-Uniform Memory Access, NUMA）的多插槽系统（multi-socket system）中，本地内存延迟和交叉插槽内存延迟(cross-socket memory latencies)之间差别非常明显。

除了延迟，带宽（bandwidth, b/w）也在决定性能时扮演重要角色。

所以，检测这些延迟和带宽就是建立系统测试基线和性能分析非常重要的因素。

Intel Memory Latency Checker(Intel MLC)是一个测试内存延迟和带宽的工具，并且可以测试延迟和带宽随着系统负载增加的变化。这个工具也提供了一些选项用于更好细粒度调查从特定处理器核心到缓存或内存的一系列选项的测试。

# 安装

Intel MLC支持Linux和Windows:

* Linux
  * 复制`mlc`执行程序到任意目录
  * MLC动态链接了GNU C库(glibc/lpthread)，所以需要确保系统中安装了对应库
  * 使用MLC需要root权限，因为这个工具修改H/W prefetch control MSR（硬件预取控制寄存器）来 `激活/禁用` 预取器 用于延迟和带宽测试。（在虚拟机测试中需要使用`-e`参数关闭此功能）
  * 系统需要加载MSR驱动（不在安装包中），通常可以使用`modprobe msr`命令完成。

> 在RHEL/CentOS 7系统中，无需使用`modprobe msr`，因为内核编译时已经built-in了MSR支持。通过以下命令可以检查使用内核是否支持MSR

```
grep -i msr /boot/config-`uname -r`
```

> `/dev/cpu/CPUNUM/msr`提供了读写x86处理器的model-specific registers (MSRs) （型号特定寄存器）的接口。
>
> 通过打开这个`msr`文件并寻找MSR编号位移，然后读或者写这个8字节块来实现寄存器访问。超过8字节的I/O传输则表示多次读或者写相同的寄存器。

* Windows
  * 将`mle.exe`和`mlcdrv.sys`驱动复制到相同目录。这个`mlcdrv.sys`驱动用于修改硬件预取器设置。

有两个执行程序（`mlc`和`mlc_avx512`）。`mlc`则支持`SSE2`和`AVX2`指令。`mlc_avx512`使用支持`AVX512`指令的较新工具链编译，是支持`SSE2/AVX2`的超集。所以，`mlc_avx512`也可以运行在不支持`AVX512`的处理器。

不管处理器是否支持`AVX512`，默认情况下，`mlc_avx512`都不会使用`AVX512`指令，除非在命令行参数使用了`-Z`参数。

建议先使用`mlc_avx512`，如果你的系统没有较新版本的glibc，则可以回退使用`mlc`。

# H/W 预取器控制

在新型的Intel处理器上精确测试内存延迟是非常困难的，因为它有复杂的硬件预取器。Intel MLC在测试延迟时会自动禁用这些预取器，并且在测试完成后自动恢复预期器原状态。预期器控制是通过修改MSR实现（[Disclosure of H/W prefetcher control on some Intel processors](https://software.intel.com/en-us/articles/disclosure-of-hw-prefetcher-control-on-some-intel-processors)），所以在Linux上需要root权限。在Windows平台，提供了签名的驱动用于访问MSR。

# MLC测试内容

当Intel MLC没有使用任何参数来运行时，它会自动检测系统拓扑并按照以下步骤测试：

* 从每个socket发出到每个可用socket的对空闲内存延迟测试

```
Measuring idle latencies (in ns)...
	Memory node
Socket	     0	     1
     0	 113.6	 113.5
     1	 113.9	 113.7
```

* 峰值内存带宽测试（假设所有访问都是本地内存）来请求不同数量的读和写

```
Measuring Peak Memory Bandwidths for the system
Bandwidths are in MB/sec (1 MB/sec = 1,000,000 Bytes/sec)
Using all the threads from each core if Hyper-threading is enabled
Using traffic with the following read-write ratios
ALL Reads        :	49427.4
3:1 Reads-Writes :	48099.8
2:1 Reads-Writes :	47599.2
1:1 Reads-Writes :	48736.5
Stream-triad like:	44099.2
```

* 从每个socket发出到每个可用socket的请求（交叉）测试内存带宽值

```
Measuring Memory Bandwidths between nodes within system
Bandwidths are in MB/sec (1 MB/sec = 1,000,000 Bytes/sec)
Using all the threads from each core if Hyper-threading is enabled
Using Read-only traffic type
	Memory node
 Socket	     0	     1
     0	30868.4	30913.3
     1	30871.5	30884.5
```

* 不同带宽情况下的延迟

```
Measuring Loaded Latencies for the system
Using all the threads from each core if Hyper-threading is enabled
Using Read-only traffic type
Inject	Latency	Bandwidth
Delay	(ns)	MB/sec
==========================
 00000	237.29	  49291.5
 00002	222.39	  49451.9
 00008	218.89	  49796.8
 00015	241.57	  49820.1
 00050	203.76	  48921.6
 00100	170.44	  43593.5
 00200	142.50	  27591.0
 00300	130.09	  19372.4
 00400	129.61	  15195.1
 00500	134.97	  12503.9
 00700	123.92	   9237.3
 01000	122.25	   6695.4
 01300	133.43	   5239.8
 01700	118.24	   4187.4
 02500	123.92	   3032.3
 03500	118.24	   2338.8
 05000	117.27	   1801.3
 09000	117.89	   1245.1
 20000	115.75	    869.2
```

* 处理器缓存间的延迟

```
Measuring cache-to-cache transfer latency (in ns)...
Local Socket L2->L2 HIT  latency	38.6
Local Socket L2->L2 HITM latency	43.6
Remote Socket L2->L2 HITM latency (data address homed in writer socket)
		Reader Socket
Writer Socket	     0	     1
            0	     -	 133.4
            1	 133.7	     -
Remote Socket L2->L2 HITM latency (data address homed in reader socket)
		Reader Socket
Writer Socket	     0	     1
            0	     -	 133.5
            1	 133.7	     -
```

Intel MLC也提供了命令行参数来调整控制延迟和带宽的测量。

# 透明大页（Transparent Huge Pages）的影响

一些Linux发行版支持透明大页（Transparent Huge Pages, THP）提供了高级内存管理支持。这个功能自动合并小(4KB)内存页成为大（2MB）内存页，并且可能将内存迁移到一个单一节点。

然而，Intel MLC依赖内存保留在本地已确保精确测试本地内存延迟和带宽。所以，需要禁用这个功能：

```
echo never > /sys/kernel/mm/transparent_hugepage/defrag
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

# 生成延迟 vs. 带宽数据

Intel MLC的一个主要功能是测量带宽需求增加时的延迟。为了加快实现，MLC创建了多个线程，线程数等于主机逻辑处理器数量减 1。这些线程用户生成负载（以下，这些线程被引用为负载生成线程或者带宽生成线程）。这个负载生成线程的主要功能是尽可能生成更多的内存引用。此时系统负载类似，剩下的一个CPU（也就是没有用于产生负载的CPU）运行了一个用于测量延迟的线程。这个线程通常运行在`cpu#0`，被称为延迟线程（latency thread）和分发依赖的读。基本上，这个线程穿过点阵，这个点阵的每个点指向下一个，这样创建读的依赖。每个读取所花费的平均时间提供了延迟度量。

基于通过负载生成线程产生的负载，这个延迟是变化的。一旦每个短暂的时间负载生成线程通过注入延迟来自动限流负载的产生，这样就可以在不同的负载下测试延迟。默认，运行延迟线程的处理器核心会禁用硬件预取器，这样延迟线程就是顺序访问方式。

默认情况下，每个负载生成线程会pin在一个逻辑cpu上。例如，在激活了超线程的10核系统上，MLC创建18个负载生成线程并保留物理核0来运行延迟线程。每个负载生成线程可以配置成生成对缓存层级（cache hierarchy）生成不同程度的读和写。每个线程分配一个buffer用于读并且一个独立的buffer用于写（任何线程之间没有共享数据）。通过相应的不同大小缓存，可以确保引用满足任何缓存级别或者由内存提供服务。

有一些选项可以控制负载生成线程数量，每个线程使用的缓存大小，在哪里分配它们的内存，读写的比例以及顺序存取或随机存取。

# 缓存到缓存（cache-to-cache）传输延迟

MLC v3.0增加了支持缓存到缓存传输延迟度量。这个测量方法的思路是在L1/L2/L3缓存填充数据（bring in lines into L1/L2/L3）然后将控制传给另外一个线程（这个线程运行在相同socket或不同socket的另外一个CPU核心上）。这个线程然后读取相同的数据以强制已经具有这些数据的缓存实现缓存到缓存的数据传输。

这样通过操作初始化线程要么只读取数据到干净状态、要么修改数据使之进入M转台，就可以同时测量Hit（命中干净的行）和HitM（命中修改状态的行）的延迟。

# 命令行参数

不使用任何参数调用Intel MLC会测量一系列内容。使用参数则可以指定特定任务：

* `mlc --latency_matrix`

输出本地和交叉socket内存延迟

```
Using buffer size of 200.000MB
Measuring idle latencies (in ns)...
	Memory node
Socket	     0	     1
     0	 113.3	 113.4
     1	 113.8	 113.6
```

* `mlc --bandwidth_matrix`

输出本地和交叉socket的内存带宽

```
Using buffer size of 100.000MB/thread for reads and an additional 100.000MB/thread for writes
Measuring Memory Bandwidths between nodes within system
Bandwidths are in MB/sec (1 MB/sec = 1,000,000 Bytes/sec)
Using all the threads from each core if Hyper-threading is enabled
Using Read-only traffic type
	Memory node
 Socket	     0	     1
     0	30970.2	31014.1
     1	30930.5	30984.9
```

* `mlc --peak_bandwidth`

输出在不同读写速率下本地内存访问的尖峰内存带宽

```
Using buffer size of 100.000MB/thread for reads and an additional 100.000MB/thread for writes

Measuring Peak Memory Bandwidths for the system
Bandwidths are in MB/sec (1 MB/sec = 1,000,000 Bytes/sec)
Using all the threads from each core if Hyper-threading is enabled
Using traffic with the following read-write ratios
ALL Reads        :	50035.2
3:1 Reads-Writes :	48119.3
2:1 Reads-Writes :	47434.3
1:1 Reads-Writes :	48325.5
Stream-triad like:	44029.0
```

* `mlc --idle_latency`

输出平台的空闲内存延迟

```
Using buffer size of 200.000MB
Each iteration took 260.5 core clocks (	113.3	ns)
```

* `mlc --loaded_latency`

输出平台有负载的内存延迟

```
Using buffer size of 100.000MB/thread for reads and an additional 100.000MB/thread for writes

Measuring Loaded Latencies for the system
Using all the threads from each core if Hyper-threading is enabled
Using Read-only traffic type
Inject	Latency	Bandwidth
Delay	(ns)	MB/sec
==========================
 00000	217.32	  49703.4
 00002	258.98	  49482.4
 00008	217.48	  49908.1
 00015	220.12	  49973.7
 00050	206.33	  49185.7
 00100	174.02	  43811.8
 00200	141.63	  27651.1
 00300	130.65	  19614.6
 00400	126.05	  15217.0
 00500	122.70	  12506.0
 00700	121.46	   9253.0
 01000	120.55	   6690.6
 01300	118.75	   5314.9
 01700	120.18	   4148.7
 02500	119.53	   3055.7
 03500	119.60	   2349.4
 05000	116.60	   1816.9
 09000	116.17	   1257.8
 20000	116.87	    867.6
```

* `mlc --c2c_latency`

输出平台 hit/hitm 延迟

```
Measuring cache-to-cache transfer latency (in ns)...
Local Socket L2->L2 HIT  latency	38.5
Local Socket L2->L2 HITM latency	43.6
Remote Socket L2->L2 HITM latency (data address homed in writer socket)
		Reader Socket
Writer Socket	     0	     1
            0	     -	 133.5
            1	 133.7	     -
Remote Socket L2->L2 HITM latency (data address homed in reader socket)
		Reader Socket
Writer Socket	     0	     1
            0	     -	 133.5
            1	 133.4	     -
```

* `mlc -e`

输出不修改预取器设置的测试结果

> 当使用`-e`参数时，MLC在所有测量中都不会修改硬件预取器。这个参数适合在虚拟机内部测试（无法修改MSR）

* `mlc -X`

> 当使用`-X`参数时，每个core只有一个超线程（hyperthread）用于所有的带宽测试。否则这个核的所有线程都会被用于带宽测试。

## 详细参数摘选

* `-a` 测试所有可用CPU的idle延迟
* `-b` 设置每个CPU的分配缓存大小（KB），默认是200MB延迟测试，100MB带宽测试
* `-c` 将延迟测试的线程pin到指定CPU。所有内存访问都将从这个特定的CPU发出
* `-d` 设置特定的负载注入延迟

# 使用案例

# 采集所有延迟和带宽数据

* 默认使用不需要任何参数

```
mlc
```

* 没有root权限情况下使用`-e`参数

```
mlc -e
```

不修改任何预取器MSR设置。

```
mlc --bandwidth_matrix –e
mlc --peak_bandwidth –e
```

然而，在启动测试前关闭所有硬件预取器是非常必要的。否则，默认情况下，MLC会报告非常低的延迟，因为只有顺序步幅被用于延迟测试。

为了能够在没有修改预取器设置情况下尽可能精确测量，以下命令通过增加`-r`和`–l128`参数来强制随机存取以beat可能激活的预取器。

```
mlc --latency_matrix –e –l128 –r
mlc --idle_latency –c2 –i2 –e –l128 –r
```

> 不过，我测试`mlc --bandwidth_matrix –e`和`mlc --bandwidth_matrix –e –l128 –r`结果似乎没啥差别。

# 参考

* [Intel® Memory Latency Checker v3.3](https://software.intel.com/en-us/articles/intelr-memory-latency-checker)