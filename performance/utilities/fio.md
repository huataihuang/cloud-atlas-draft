# `hdparm`和`fio`简介

要了解Linux磁盘性能的基本特性，可以使用`hdparm`的`-T`和`-t`参数：

* `-T` 使用Linux磁盘缓存来测试磁盘读取性能，表示的是如果磁盘足够快速并始终运行时的读取性能
* `-t` 虽然也使用缓存，但是不会预先缓存结果，表示的是磁盘顺序存储信息的吞吐量。

不过，`hdparm`不是真实性能的测试工具，由于它执行的是非常底层的操作，所以一旦你在磁盘上创建了文件系统，测试结果会完全不同。并且对于顺序访问和随机访问，性能有巨大差异。

[fio](http://freecode.com/projects/fio)是创建特定磁盘IO负载的benchmark工具，它的IO请求是使用很多异步和同步的IO API，也可以使用不同的API来针对制定单一API待用请求。并且可以调整fio使用的文件大小，以及文件IO的偏移量，以及每个IO请求间的延迟、文件系统同步调用问题。

一个同步调用告诉操作系统确保在内存中的任何信息被保存到磁盘，此时会看到明显的延迟。

# 安装fio

* 安装编译环境

```
yum install libaio* gcc wget make
```

* 下载软件包

```
wget http://brick.kernel.dk/snaps/fio-git-latest.tar.gz
```

* 编译安装

```
tar xfz fio-git-latest.tar.gz
cd fio
./configure
make
sudo make install
```

# 随机读IO性能

真实的磁盘读取往往是随机IO，可以使用ini格式的配置文件来设置`fio`使用的参数。开始时候，可以只用简单的`rw=randread`告诉fio使用随机读，而`size=128m`者指定调用测试完成前传输总共128MB数据，而`directory`参数告知fio所使用的文件系统：

* `random-read-test.fio`

```
; random read of 128mb of data

[random-read]
rw=randread
size=128m
directory=/tmp/fio-testing/data
```

* 执行测试

```
fio random-read-test.fio
```

报错

```
fio: /tmp/fio-testing/data is not a directory
fio: failed parsing directory=/tmp/fio-testing/data
fio: job random-read dropped
fio: file:options.c:1268, func=lstat, error=No such file or directory
```

> 先创建测试目录才能测试`mkdir -p /tmp/fio-testing/data`，然后再次测试

输出结果中，`bandwidth`值越高，延迟越低越好：

```
random-read: (g=0): rw=randread, bs=4096B-4096B,4096B-4096B,4096B-4096B, ioengine=psync, iodepth=1
fio-2.18
Starting 1 process
random-read: Laying out IO file(s) (1 file(s) / 128MiB)
Jobs: 1 (f=1): [r(1)][100.0%][r=1984KiB/s,w=0KiB/s][r=496,w=0 IOPS][eta 00m:00s]
random-read: (groupid=0, jobs=1): err= 0: pid=7660: Tue Mar 14 18:09:42 2017
   read: IOPS=498, BW=1996KiB/s (2044kB/s)(128MiB/65672msec)
    clat (usec): min=759, max=53500, avg=1998.52, stdev=4944.85
     lat (usec): min=760, max=53500, avg=1999.07, stdev=4944.85
    clat percentiles (usec):
     |  1.00th=[  860],  5.00th=[  908], 10.00th=[  948], 20.00th=[  996],
     | 30.00th=[ 1032], 40.00th=[ 1080], 50.00th=[ 1144], 60.00th=[ 1208],
     | 70.00th=[ 1304], 80.00th=[ 1480], 90.00th=[ 1976], 95.00th=[ 2928],
     | 99.00th=[37120], 99.50th=[42240], 99.90th=[47360], 99.95th=[48384],
     | 99.99th=[50944]
    lat (usec) : 1000=21.36%
    lat (msec) : 2=68.84%, 4=6.69%, 10=1.10%, 20=0.19%, 50=1.81%
    lat (msec) : 100=0.02%
  cpu          : usr=0.46%, sys=1.40%, ctx=32957, majf=0, minf=30
  IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwt: total=32768,0,0, short=0,0,0, dropped=0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=1

Run status group 0 (all jobs):
   READ: bw=1996KiB/s (2044kB/s), 1996KiB/s-1996KiB/s (2044kB/s-2044kB/s), io=128MiB (134MB), run=65672-65672msec

Disk stats (read/write):
  xvda: ios=32759/147, merge=0/11, ticks=64596/1002, in_queue=65542, util=98.14%
```

* 输出结果分析
  * `bw` 表示测试中达到的平均带宽
  * `clat` 表示完成延迟（completion latency） - 完成延迟是提交请求和请求完成之间的时间。统计值分别是最小、最大、平均和标准方差。
  * `CPU` 行数据显示IO负载对CPU的影响
  * `IO depths` 段落对于测试多请求的IO负载非常有意义 - 由于上述测试所有测试是单IO请求，所以IO depths始终100%是1
  * 三行 `lat` 显示了每个IO请求完成的概况，例如，上述延迟在2ms的占68.84%，1ms（1000us）占21.36%
  * `READ` 行显示了读取速率

# aio读取性能

* `random-read-test-aio.fio` 增加设置io引擎和iodepth

```
[random-read]
rw=randread
size=128m
directory=/tmp/fio-testing/data
ioengine=libaio
iodepth=8
direct=1
invalidate=1
```

执行测试

```
fio random-read-test-aio.fio
```

随机读取通常会受到磁头寻道时间（seek time)限制。由于异步IO假设在任何请求完成前同时有8个IO请求，这样就会在同时完成前在同一个磁盘有更多读取，这样可以完全充分利用IO带宽。

* 参数解析：
  * `rw`参数，可以设置随机结合的读写。
  * `ioengine`参数设置内核选择的IO请求。
  * `invalidate`选项使得内核在开始压测前废除文件的buffer和page cache
  * `runtime` 设置测试运行一段时间然后考虑结束。
  * `thinktime` 参数模拟实际的应用，也就是通常读取磁盘文件后执行一段数据处理（相当于不是连续读写磁盘，而是读写一部分数据然后模拟程序计算时暂停读写磁盘）
  * `fsync=n` 用于确保每完成n个写之后调用一次sync（将缓存数据刷入磁盘）
  * `write_iolog` 和 `read_iolog` 使得fio读或者写一个日志记录所有IO请求

# 模拟服务器

可以设置多个线程或进程同时提交IO工作，类似文件系统交互。以下案例设置4个不同进程，每个进程有自己独立的IO负载，同时运行。这个案例模拟2个内存映射查询引擎（memory-mapped query engine），1个后台更新线程(background updater thread)，一个后台写线程(backgroud writer thread)。这里两个写线程的差异是background writer thread模拟写一个日志，而background updater 则必须同时读写（update）数据。此外，bgupdater有一个40毫秒的思考时间，使得每个完成IO后进程睡眠一小会。

* `four-threads-randio.fio`

```
; Four threads, two query, two writers.

[global]
rw=randread
size=256m
directory=/tmp/fio-testing/data
ioengine=libaio
iodepth=4
invalidate=1
direct=1

[bgwriter]
rw=randwrite
iodepth=32

[queryA]
iodepth=1
ioengine=mmap
direct=0
thinktime=3

[queryB]
iodepth=1
ioengine=mmap
direct=0
thinktime=5

[bgupdater]
rw=randrw
iodepth=16
thinktime=40
size=32m
```

* 执行测试

```
fio four-threads-randio.fio
```

# 测试SSD案例

本案例测试将花费6~24小时来验证SSD设备特性。在测试SSD之前首先通过dd命令预热

```
dd if=/dev/zero of=/dev/xvdb bs=1M &
```

预热之后，使用`fio`命令测试SSD磁盘

```
fio --filename=/dev/xvdf --direct=1 --rw=randwrite --refill_buffers --norandommap \
--randrepeat=0 --ioengine=libaio --bs=128k --rate_iops=1280  --iodepth=16 --numjobs=1 \
--time_based --runtime=86400 --group_reporting –-name=benchtest
```

上述命令采用最大1280 IOPS写入128K数据块，测试24小时。案例中使用了1个IO队列深度16的单一进程。

也可以指定每秒多少字节通过的速率来代替IOPS，即使用`rate`选项，例如：

```
--rate=167772160
```

以下是可用的`rw`选项：

```
--rw=randread
--rw=randrw   
--rw=randwrite
```

还可以设置随机读写比例（`randrw`），选项类似如下

```
--rwmixwrite=50      Add this if randrw.  This is a 50/50 

or

--rwmixread=80      This is an 80/20 read/write.
```

以下是两个案例：

* 50/50 Reads/Writes

```
fio --filename=/dev/xvdf --direct=1 --rw=randrw –rwmixwrite=50 --refill_buffers \
--norandommap --randrepeat=0 --ioengine=libaio --bs=128k --rate_iops=1280  --iodepth=16 \
--numjobs=1 --time_based --runtime=86400 --group_reporting –-name=benchtest
```

* 95/5 Reads/Writes

```
fio --filename=/dev/xvdf --direct=1 --rw=randrw –rwmixwrite=5 --refill_buffers \
--norandommap --randrepeat=0 --ioengine=libaio --bs=128k --rate_iops=1280  --iodepth=16 \
--numjobs=1 --time_based --runtime=86400 --group_reporting –-name=benchtest
```

# fio输出解释

```
read : io=10240MB, bw=63317KB/s, iops=15829, runt=165607msec
```

一共10GB磁盘IO，总共15829 IOPS ，63.317MB/s ，总共运行了2分45秒

----

```
slat (usec): min=3, max=335, avg= 9.73, stdev= 5.76
```

`slat`表示submission latency，也就是发送这个IO给内核处理的提交时间花费

不要以为`slat`对测试无意义，实际上 1/4 ms 的提交时间就会被感知

常见设备的`slat`

```
    slat (usec): min=3, max=335, avg= 9.73, stdev= 5.76 (SATA SSD)
    slat (usec): min=5, max=68,  avg=26.21, stdev= 5.97 (SAS 7200)
    slat (usec): min=5, max=63,  avg=25.86, stdev= 6.12 (SATA 7200)
    slat (usec): min=3, max=269, avg= 9.78, stdev= 2.85 (SATA SSD)
    slat (usec): min=6, max=66,  avg=27.74, stdev= 6.12 (MDRAID0/SAS)

    clat (usec): min=1, max=18600, avg=51.29, stdev=16.79
```

`clat`是提交IO请求给内核之后到IO完成之间的时间，不包括submission latency

在早期fio版本，使用应用层延迟评估较好

```
lat (usec): min=44, max=18627, avg=61.33, stdev=17.91
```

----

```
cpu          : usr=5.32%, sys=21.95%, ctx=2829095, majf=0, minf=21
```

user/system CPU使用率、上下文切换 和 major 或 minor [page faults](http://en.wikipedia.org/wiki/Page_fault)

----

```
IO depths    : 1=100.0%, 2=0.0%, 4=0.0%, 8=0.0%, 16=0.0%, 32=0.0%, &gt;=64=0.0%
```

# fio 和 iodepth

io队列深度参考 [Fio压测工具和io队列深度理解和误区](http://blog.yufeng.info/archives/2104)

> 提高设备的iodepth, 一把喂给设备更多的IO请求，让电梯算法和设备有机会来安排合并以及内部并行处理，提高总体效率。
> 
> 应用使用IO通常有二种方式：同步和异步。 同步的IO一次只能发出一个IO请求，等待内核完成才返回，这样对于单个线程iodepth总是小于1，但是可以透过多个线程并发执行来解决，通常我们会用16-32根线程同时工作把iodepth塞满。 异步的话就是用类似libaio这样的linux native aio一次提交一批，然后等待一批的完成，减少交互的次数，会更有效率。

io队列深度通常对不同的设备很敏感，那么如何用fio来探测出合理的值呢？

> libaio引擎会用这个iodepth值来调用io_setup准备个可以一次提交iodepth个IO的上下文，同时申请个io请求队列用于保持IO。 在压测进行的时候，系统会生成特定的IO请求，往io请求队列里面扔，当队列里面的IO个数达到iodepth_batch值的时候，就调用io_submit批次提交请求，然后开始调用io_getevents开始收割已经完成的IO。 每次收割多少呢？由于收割的时候，超时时间设置为0，所以有多少已完成就算多少，最多可以收割iodepth_batch_complete值个。随着收割，IO队列里面的IO数就少了，那么需要补充新的IO。 什么时候补充呢？当IO数目降到`iodepth_low`值的时候，就重新填充，保证OS可以看到至少`iodepth_low`数目的io在电梯口排队着。 

* `nvdisk-test`

```
[global]
bs=512
ioengine=libaio
userspace_reap
rw=randrw
rwmixwrite=20
time_based
runtime=180
direct=1
group_reporting
randrepeat=0
norandommap
ramp_time=6
iodepth=16
iodepth_batch=8
iodepth_low=8
iodepth_batch_complete=8
exitall
[test]
filename=/dev/nvdisk0
numjobs=1
```

fio任务配置里面有几个点需要非常注意：

* libaio工作的时候需要文件direct方式打开。
* 块大小必须是扇区(512字节)的倍数。
* userspace_reap提高异步IO收割的速度。
* ramp_time的作用是减少日志对高速IO的影响。
* 只要开了direct,fsync就不会发生。

执行测试

```
fio nvdisk-test --debug=io
```

> 开启debug模式后可以看到详细的IO过程

另一种方法是通过`strace`来跟踪系统调用

```
pstree -p
```

输出结果

```
init(1)─┬─agent_eagleye(22296)
        ├─screen(13490)─┬─bash(18324)─┬─emacs(19429)
        │               │             ├─emacs(20365)
        │               │             ├─emacs(21268)
        │               │             ├─fio(22452)─┬─fio(22454)
        │               │             │            └─{fio}(22453)
        │               │             └─man(20385)───sh(20386)───sh(20387)───less(20391)
        ├─sshd(1834)───sshd(13115)───bash(13117)───screen(13662)
        └─udevd(705)─┬─udevd(1438)
                     └─udevd(1745
```

```
strace -p 22454
```

另外，使用 `iostat -dx 1` 来确认iodepth符合设备特性

# gfio



# 参考

* [Getting Started With Fio](https://tobert.github.io/post/2014-04-28-getting-started-with-fio.html)
* [Inspecting disk IO performance with fio](https://www.linux.com/learn/inspecting-disk-io-performance-fio)
* [Benchmarking SSDs with Flexible IO tester(fio)](https://discuss.aerospike.com/t/benchmarking-ssds-with-flexible-io-tester-fio/2788)
* [Installing Fio on CentOS 6.4 (minimal)](https://tech4research.wordpress.com/2013/03/21/installing-fio-on-centos-6-4-minimal/)
* [Fio Output Explained](https://tobert.github.io/post/2014-04-17-fio-output-explained.html) - 这篇文档详细说明了fio输出信息的解释，可供参考
* [Fio压测工具和io队列深度理解和误区](http://blog.yufeng.info/archives/2104) - 淘宝褚霸写的解析
* [fio性能测试工具新添图形前端gfio](http://blog.yufeng.info/archives/tag/fio)