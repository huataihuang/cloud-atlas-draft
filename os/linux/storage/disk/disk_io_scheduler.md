# 磁盘io scheduler

IO调度器（IO Scheduler）是操作系统用来决定块设备上IO操作提交顺序的方法。存在的目的有两个，一是提高IO吞吐量，二是降低IO响应时间。然而IO吞吐量和IO响应时间往往是矛盾的，为了尽量平衡这两者，IO调度器提供了多种调度算法来适应不同的IO请求场景。其中，对数据库这种随机读写的场景最有利的算法是DEANLINE。

**4种调度算法**

* CFQ (Completely Fair Queuing 完全公平的排队)(elevator=cfq)：

CFQ是默认算法,对于通用服务器来说通常是最好的选择.它试图均匀地分布对I/O带宽的访问.在多媒体应用, 总能保证audio、video及时从磁盘读取数据.但对于其他各类应用表现也很好.每个进程一个queue,每个queue按照上述规则进行merge和sort.进程之间round robin调度,每次执行一个进程的4个请求.可以调 queued 和 quantum 来优化。

  * 优先级：进程被分成不同的类别，而且又有不同的优先级
  * 时间片：时间片是CFQ分给每个进程的基本单位，当CFQ选择了一个进程开始服务的时候，一般情况下他会给这个进程足够长的时间（`slice_sync`)发送请求，当该进程暂时没有请求的时候，会等待一段时间(`slice_idle`)，这样如果他又发送新的顺序请求，就避免了不必要的磁盘seek（其实这个对SSD恰恰是有一定的副作用的），然后再选择另外一个进程服务。当然如果有优先级高的进程，可以中断当前的进程，选择那个进程开始服务。
  * 带宽控制：可能这里的带宽的定义比较含糊，其实准确的来说，目前CFQ是通过时间片来控制的，所以通过给各个进程分配不同的时间片，CFQ期待能够尽量保持各个进程的带宽比例，并假设IOPS或者带宽能够和时间片线性相关。

* Deadline (elevator=deadline)：

Deadline算法试图把每次请求的延迟降至最低.该算法重排了请求的顺序来提高性能.可以调队列的过期的读写过程,如 `read_expire` 和 `write_expire` 二个参数来控制多久内一定要读到数据，超时就放弃排。比较合适小文件，还可以使用打开 `front_merges` 来进行合并邻近文件。

DEADLINE在CFQ的基础上，解决了IO请求饿死的极端情况。除了CFQ本身具有的IO排序队列之外，DEADLINE额外分别为读IO和写IO提供了FIFO队列。读FIFO队列的最大等待时间为500ms，写FIFO队列的最大等待时间为5s（参数都是可设置的）。

FIFO队列内的IO请求优先级要比CFQ队列中的高，，而读FIFO队列的优先级又比写FIFO队列的优先级高。优先级可以表示如下：

```bash
FIFO(Read) > FIFO(Write) > CFQ
```

* NOOP (elevator=noop):

NOOP(No Operation)算法的全写为No Operation。该算法实现了最最简单的FIFO队列，所有IO请求大致按照先来后到的顺序进行操作。之所以说“大致”，原因是NOOP在FIFO的基础上还做了简单的相邻IO请求的合并（注意只是做简单的合并，关键在于简单），并不是完完全全按照先进先出的规则满足IO请求。

 I/O请求被分配到队列,调度由硬件进行，只有当CPU时钟频率比较有限时进行。Noop对于I/O不那么操心,对所有的I/O请求都用FIFO队列形式处理，默认认为 I/O不会存在性能问题。当然对于复杂一点的应用类型使用这个调度器需要谨慎测试。
 
 Noop调度算法指的是当请求被存储到队列并交由I/O子系统处理时由磁盘硬件对其进行优化。该算法一般只对一些特定的硬件（例如`RAM disk`和`TCQ disk`等）.现代磁盘控制器都具备通过`tagged command queuing`进行优化的功能.`Tagged command queuing（TCQ）`可以通过由磁盘控制器对I/O请求进行重新排序来减少磁头的动作。
 
 通常需要进行重组的I/O请求都会带有一个标识符,这样控制器在接收到这些I/O请求的时候会按照规则进行处理。有些应用程序需要对队列长度进行限制,而现代的设备驱动都具备用于控制队列长度的TCO功能,并且该功能可以作为内核参数在系统启动的时候添加。例如要控制SCSI驱动器`Lun2`的队列长度为`64`个请求,可以修改`/etc/grub.conf`并增加下面的内核参数：`aic7xxx=tag_info:{{0,0,64,0,0,0,0}}`
 
* Anticipatory (elevator=as):

 对读操作优化服务时间,在提供一个I/O的时候进行短时间等待,使进程能够提交到另外的I/O。`Anticipatory scheduler（as) `曾经一度是Linux 2.6 Kernel的I/O scheduler.Anticipatory的中文含义是“预料的,预想的”,这个词的确揭示了这个算法的特点,简单的说有个I/O发生的时候,如果又有进程请求I/O操作,则将产生一个默认的6毫秒猜测时间,猜测下一个进程请求I/O是要干什么的。这对于随机读取会造成比较大的延时，对数据库应用很糟糕，而对于Web Server等则会表现的不错.这个算法也可以简单理解为面向低速磁盘的。因为那个“猜测”实际上的目的是为了减少磁头移动时间。因此这种算法更加适合顺序读写的应用程序，这个可以用来调整的内核参数有 `antic_expire `,`read_expire` 和 `write_expire`。
 
 # linux中IO调度方法的查看和设置的方法

* 查看当前IO

```bash
cat /sys/block/{DEVICE-NAME}/queue/scheduler
cat /sys/block/sd*/queue/scheduler
```

例:输出结果如下

```bash
noop anticipatory deadline [cfq]
```

设置当前IO

```bash
echo {SCHEDULER-NAME} > /sys/block/{DEVICE-NAME}/queue/scheduler
echo noop > /sys/block/hda/queue/scheduler
```

# 对IO调度使用的建议

* Deadline I/O scheduler 

`deadline` 调度算法通过降低性能而获得更短的等待时间,它使用轮询的调度器,简洁小巧,提供了最小的读取延迟和尚佳的吞吐量,特别适合于读取较多的环境(比如数据库,Oracle 10G 之类).
 
* Anticipatory I/O scheduler
 
 `anticipatory` 算法通过增加等待时间来获得更高的性能,假设一个块设备只有一个物理查找磁头(例如一个单独的SATA硬盘),将多个随机的小写入流合并成一个大写入流(相当于给随机读写变顺序读写)。使用这个原理来使用读取写入的延时换取最大的读取写入吞吐量.适用于大多数环，特别是读取写入较多的环境，比如文件服务器,Web 应用App等应用。
 
* CFQ I/O scheduler

`CFQ`是 对所有因素也都做了折中而尽量获得公平性，使用QoS策略为所有任务分配等量的带宽,避免进程被饿死并实现了较低的延迟,可以认为是上述两种调度器的折中，适用于有大量进程的多用户系统。

# Anticipatory 调节

* 磁盘队列长度

`/sys/block/sda/queue/nr_requests` 默认只有 128 个队列,可以提高到 512 个.会更加占用内存,但能更加多的合并读写操作,速度变慢,但能读写更加多的。

* 等待时间

`/sys/block/sda/queue/iosched/antic_expire` 读取附近产生的新请时等待多长时间

* 读优化的参数

`/sys/block/sda/queue/read_ahead_kb` 这个参数对顺序读非常有用，表示一次提前读多少内容。无论实际需要多少.默认一次读 `128kb` 远小于要读的,设置大些对读大文件非常有用，可以有效的减少读 `seek` 的次数。这个参数可以使用 `blockdev –setra` 来设置。`setra` 设置的是多少个扇区，所以实际的字节是除以`2`，比如设置 `512` ,实际是读 `256` 个字节。

# IO 调度调节的内核参数

* `/proc/sys/vm/dirty_ratio`

 这个参数控制文件系统的文件系统写缓冲区的大小，单位是百分比，表示系统内存的百分比。表示当写缓冲使用到系统内存多少的时候，开始向磁盘写出数据。增大之会使用更多系统内存用于磁盘写缓冲，也可以极大提高系统的写性能。但是,当你需要持续、恒定的写入场合时，应该降低其数值。一般启动上缺省是 `10`（实际哥各个版本此参数都不同，线上环境更有不同差异）。
 
 下面是增大的方法： 
 
 ```bash
 echo ’40’> /proc/sys/vm/dirty_ratio
```

* `/proc/sys/vm/dirty_background_ratio`

  这个参数控制文件系统的`pdflush`进程，在何时刷新磁盘，单位是百分比，表示系统内存的百分比。意思是当写缓冲使用到系统内存多少的时候, `pdflush`开始向磁盘写出数据。增大之会使用更多系统内存用于磁盘写缓冲，也可以极大提高系统的写性能。但是,当你需要持续、恒定的写入场合时，应该降低其数值。一般启动上缺省是 `5`。
  
下面是增大的方法： 

```bash
echo ’20’ > /proc/sys/vm/dirty_background_ratio
```

* `/proc/sys/vm/dirty_writeback_centisecs`

这个参数控制内核的脏数据刷新进程`pdflush`的运行间隔，单位是 `1/100` 秒。缺省数值是`500`，也就是 `5` 秒。如果你的系统是持续地写入动作，那么实际上还是降低这个数值比较好，这样可以把尖峰的写操作削平成多次写操作。

设置方法如下： 

```bash
echo '200' > /proc/sys/vm/dirty_writeback_centisecs
```

如果你的系统是短期地尖峰式的写操作，并且写入数据不大（几十M/次）且内存有比较多富裕，那么应该增大此数值： 

```bash
echo '1000' > /proc/sys/vm/dirty_writeback_centisecs
```

* `/proc/sys/vm/dirty_expire_centisecs`

这个参数声明Linux内核写缓冲区里面的数据多`旧`了之后，`pdflush`进程就开始考虑写到磁盘中去.单位是 `1/100`秒.缺省是 `3000`,也就是 `30` 秒的数据就算旧了，将会刷新磁盘。对于特别重载的写操作来说，这个值适当缩小也是好的，但也不能缩小太多。因为缩小太多也会导致IO提高太快，建议设置为 1500，也就是15秒算旧。

```bash
echo '1500' > /proc/sys/vm/dirty_expire_centisecs
```

如果你的系统内存比较大,并且写入模式是间歇式的,并且每次写入的数据不大（比如几十M），可以将这个数值调大。

# 参考

* [在linux系统中I/O 调度的选择](http://www.php-oa.com/2010/01/03/linux-io-elevator.html) - 这篇文章非常详尽，推荐阅读
* [IO调度器原理介绍](http://blog.csdn.net/younger_china/article/details/9749393)