在长时间运行的Linux操作系统中，系统日志有时会出现无法分配高阶内存的报错信息：

```
Aug  4 22:58:15 server1 kernel: : [69229257.683658] xenwatch: page allocation failure. order:4, mode:0xd0
Aug  4 22:58:15 server1 kernel: : [69229257.683665] Pid: 168, comm: xenwatch Tainted: GF          ---------------    2.6.32-358.23.2.el5.x86_64 #1
Aug  4 22:58:15 server1 kernel: : [69229257.683672] Call Trace:
Aug  4 22:58:15 server1 kernel: : [69229257.683688]  [<ffffffff8112723a>] ? __alloc_pages_nodemask+0x67a/0x8c0
Aug  4 22:58:15 server1 kernel: : [69229257.683697]  [<ffffffff8126082f>] ? number+0x2ff/0x330
Aug  4 22:58:15 server1 kernel: : [69229257.683706]  [<ffffffff81162260>] ? kmem_getpages+0x60/0x150
```

此时使用`cat /proc/buddyinfo`观察内存order分配情况，可以看到内存碎片化严重（大量的低阶内存页，但是几乎没有高阶内存页）

```
#cat /proc/buddyinfo
Node 0, zone      DMA      2      2      2      1      2      1      1      0      0      0      2
Node 0, zone    DMA32  32995   4377    762    211    157    108     68     23      3      0      0
Node 0, zone   Normal 127146  68215   1614      0      0      0      0      0      0      0      1
```

处理的方法主要采用`drop_caches`（抛弃缓存），然后使用`compact_memory`合并低阶内存页来创造出足够的高阶内存页。

# `drop_caches`

Linux Kernel 2.6.16之后的内核提供了一个设置内核抛弃 页缓存 `和/或` 目录(dentry)和索引节点（inode）缓存，这样可以释放出大量内存。

* 释放页缓存

```
echo 1 > /proc/sys/vm/drop_caches
```

* 释放目录和索引节点缓存（inode and dentry cache）

```
echo 2 > /proc/sys/vm/drop_caches
```

* 同时释放 页、目录、索引节点缓存：

```
echo 3 > /proc/sys/vm/drop_caches
```

上述操作是无害的操作，并且智慧释放完全没有使用的内存对象。脏对象（dirty objects）将继续被使用直到它们被写入到磁盘中，所以内存脏对象不会被释放。不过，如果在执行`drop_caches`之前执行`sync`指令，则会将脏对象刷新到磁盘中，这样`drop_caches`操作会释放出更多内存。

注意：`drop_caches`需要花费一些时间（在终端中可以看到大约几十秒时间），此时再次使用`cat /proc/buddyinfo`可以看到立即出现了大量高阶内存页。

但是`drop_caches`这个触发动作是一次性的，也就是说，并不因为`cat /proc/sys/vm/drop_caches`时显示输出内容是`3`就表示系统不缓存内容。相反，一旦完成`drop_caches`，系统立即自动对后续内存对象进行缓存。所以要再次触发缓存清理，需要再次执行 `echo 3 > /proc/sys/vm/drop_caches`。

> 如果重复`echo 3 > /proc/sys/vm/drop_caches`不能再次释放缓存，可以先尝试`echo 0 > /proc/sys/vm/drop_caches`然后再执行`echo 3 > /proc/sys/vm/drop_caches`。

# `compact_memory`

当内核编译参数设置了`CONFIG_COMPACTION`，就会在`/proc/sys/vm/compact_memory`有入口文件。将`1`写入到这个文件，则所有的zones就会进行压缩，以便能够尽可能地提供连续内存块。对于需要分配大页的时候这个功能非常重要，不过，进程会在需要时直接进行内存压缩（compact memory）。

# 实际操作案例

* 检查系统缺乏高阶内存

```
#cat /proc/buddyinfo
Node 0, zone      DMA      2      2      2      1      2      1      1      0      0      0      2
Node 0, zone    DMA32  32995   4377    762    211    157    108     68     23      3      0      0
Node 0, zone   Normal 127146  68215   1614      0      0      0      0      0      0      0      1
```

* 执行缓存释放

```
#echo 3 > /proc/sys/vm/drop_caches
```

* 完成后检查内存页

```
#cat /proc/buddyinfo
Node 0, zone      DMA      2      2      2      1      2      1      1      0      0      0      2
Node 0, zone    DMA32  76826  65298  43784  20780   5272    616     90     32      4      0      0
Node 0, zone   Normal 524538 365499 176074  45644   4338    140      6      0      0      0      1
```

* 然后执行内存压缩

```
#echo 1 > /proc/sys/vm/compact_memory
```

* 然后再次检查内存页分布，可以看到逐渐出现更多的高阶内存页

```
#cat /proc/buddyinfo
Node 0, zone      DMA      2      2      2      1      2      1      1      0      0      0      2
Node 0, zone    DMA32  18217  13464   8621   4666   2654   2087   1609   1040    517    130      3
Node 0, zone   Normal 145048 131183  76864  38454  20405  11854   5149   1143     96      3      1
```

# 参考

* [Drop Caches](https://linux-mm.org/Drop_Caches)
* [Documentation for /proc/sys/vm/*	kernel version 2.6.29](https://www.kernel.org/doc/Documentation/sysctl/vm.txt)