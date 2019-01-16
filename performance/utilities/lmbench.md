# 简介

[LMbench](http://www.bitmover.com/lmbench/)是一个简单且可移植的benchmark工具（C语言编写），可以用于比较不同的Unix系统性能。不同的Unix厂商都有测试结果。

LMbench主要用于测试带宽和延迟：

* 带宽测评工具
  * 读取缓存文件
  * 拷贝内存
  * 读内存
  * 写内存
  * 管道
  * TCP
* 反应时间测评工具
  * 上下文切换
  * 网络： 连接的建立，管道，TCP，UDP和RPC hot potato
  * 文件系统的建立和删除
  * 进程创建
  * 信号处理
  * 上层的系统调用
  * 内存读入反应时间
* 其他
  * 处理器时钟比率计算

LMbench的主要特性:

* 对于操作系统的可移植性测试
* 自适应调整 ?
* 数据库计算结果 - 数据库的计算结果包括了从大多数主流的计算机工作站制造商上的运行结果。
* 存储器延迟计算结果 - 存储器延迟测试展示了所有系统（数据）的缓存延迟，例如一级，二级和三级缓存，还有内存和TLB表的未命中延迟。另外，缓存的大小可以被正确划分成一些结果集并被读出。硬件族与上面的描述相象。这种测评工具已经找到了操作系统分页策略的中的一些错误。
* 上下文转换计算结果 - 测评工具并不是特别注重仅仅引用“在缓存中”的数量。它时常在进程数量和大小间进行变化，并且在当前内容不在缓存中的时候，将结果以一种对用户可见的方式进行划分。可以得到冷缓存上下文切换的实际开销。
* 回归测试 - Sun公司和SGI公司已经使用这种测评工具以寻找和补救存在于性能上的问题； Intel公司在开发P6的过程中，使用了它们；Linux在Linux的性能调整中使用了它们

> 默认情况下会使用内存的80%进行测试，所以如果内存很大规格则测试时间非常长，此时建议限制使用内存。

# 安装

* 下载

* 编译 lmbench 3.0

```
cd lmbench3/src
make
```

编译错误

```
gmake[1]: *** No rule to make target `../SCCS/s.ChangeSet', needed by `bk.ver'.  Stop.
gmake[1]: Leaving directory `/root/lmbench/lmbench3/src'
make: *** [lmbench] Error 2
```

参考 https://github.com/zhanglongqi/linux-tips/blob/master/tools/benchmark.md

在src的上级目录 lmbench3 中执行如下命令

```
mkdir ./SCCS
touch ./SCCS/s.ChangeSet
```

然后再次编译就可以。

* 如果要编译ARM版本，使用（具体我没有实践，也许以后会在ARM平台上尝试）

```
make CC=arm-linu-gcc OS=arm-linux
```

则编译后，会在

# 测试

* 测试

```
cd src
make results
```

> 默认选项，不过其中`Mail results`改为`no`（发送邮件失败）

* 测试完成后，使用以下命令输出报告

```
cd ../results/
make summary
```

> 也可以在上级目录下执行 `make see` 查看输出结果，实际输出相同


另外，比较好的方法是反复测试

```
make results
make rerun
make rerun
make rerun
cd Results && make LIST=<your OS>/*
```

* 如果要单项测试，例如测试内存 `lat_mem_rd`

```
cd ../bin/x86_64-linux-gnu
./lat_mem_rd 1M
```

# 案例

```
cd src
make results

cd ../results/
make summary
```

测试结果位于results 目录下的 summary.out 文件。

```
x86_64-linux-gnu: no data for Memory load parallelism
x86_64-linux-gnu: lat_mem_rand = 164.481

                 L M B E N C H  3 . 0   S U M M A R Y
                 ------------------------------------
		 (Alpha software, do not distribute)

Argument "" isn't numeric in numeric gt (>) at ../scripts/getsummary line 944, <FD> line 1914.

Processor, Processes - times in microseconds - smaller is better
------------------------------------------------------------------------------
Host                 OS  Mhz null null      open slct sig  sig  fork exec sh
                             call  I/O stat clos TCP  inst hndl proc proc proc
--------- ------------- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
example-vm Linux 3.10.0- 2881 0.08 0.12 0.70 1.51 2.45 0.18 1.12 117. 341. 1183

Basic integer operations - times in nanoseconds - smaller is better
-------------------------------------------------------------------
Host                 OS  intgr intgr  intgr  intgr  intgr
                          bit   add    mul    div    mod
--------- ------------- ------ ------ ------ ------ ------
example-vm Linux 3.10.0- 0.3500 0.0400 1.0700 9.4000 9.8200

Basic float operations - times in nanoseconds - smaller is better
-----------------------------------------------------------------
Host                 OS  float  float  float  float
                         add    mul    div    bogo
--------- ------------- ------ ------ ------ ------
example-vm Linux 3.10.0- 1.3800 1.3900 3.9800 1.0400

Basic double operations - times in nanoseconds - smaller is better
------------------------------------------------------------------
Host                 OS  double double double double
                         add    mul    div    bogo
--------- ------------- ------  ------ ------ ------
example-vm Linux 3.10.0- 1.3900 1.3900 5.0200 1.3900

Context switching - times in microseconds - smaller is better
-------------------------------------------------------------------------
Host                 OS  2p/0K 2p/16K 2p/64K 8p/16K 8p/64K 16p/16K 16p/64K
                         ctxsw  ctxsw  ctxsw ctxsw  ctxsw   ctxsw   ctxsw
--------- ------------- ------ ------ ------ ------ ------ ------- -------
example-vm Linux 3.10.0- 6.0200 6.1100 7.8400 7.4600 7.8000 7.23000 8.39000

*Local* Communication latencies in microseconds - smaller is better
---------------------------------------------------------------------
Host                 OS 2p/0K  Pipe AF     UDP  RPC/   TCP  RPC/ TCP
                        ctxsw       UNIX         UDP         TCP conn
--------- ------------- ----- ----- ---- ----- ----- ----- ----- ----
example-vm Linux 3.10.0- 6.020  16.2 12.4  16.2        17.3        14.

File & VM system latencies in microseconds - smaller is better
-------------------------------------------------------------------------------
Host                 OS   0K File      10K File     Mmap    Prot   Page   100fd
                        Create Delete Create Delete Latency Fault  Fault  selct
--------- ------------- ------ ------ ------ ------ ------- ----- ------- -----
example-vm Linux 3.10.0- 6.4025 5.3920   12.4 7.7405   26.9K 0.334 0.23490 0.870

*Local* Communication bandwidths in MB/s - bigger is better
-----------------------------------------------------------------------------
Host                OS  Pipe AF    TCP  File   Mmap  Bcopy  Bcopy  Mem   Mem
                             UNIX      reread reread (libc) (hand) read write
--------- ------------- ---- ---- ---- ------ ------ ------ ------ ---- -----
example-vm Linux 3.10.0- 3496 6863 6034 5110.0 6483.0 5583.7 4041.4 6381 6075.

Memory latencies in nanoseconds - smaller is better
    (WARNING - may not be correct, check graphs)
------------------------------------------------------------------------------
Host                 OS   Mhz   L1 $   L2 $    Main mem    Rand mem    Guesses
--------- -------------   ---   ----   ----    --------    --------    -------
example-vm Linux 3.10.0-  2881 1.3880 4.8630   48.0       164.5
```

# 


# 参考

* [linux-tips/tools/benchmark.md](https://github.com/zhanglongqi/linux-tips/blob/master/tools/benchmark.md)
* [lmbench的使用方法](https://blog.csdn.net/dianhuiren/article/details/7331777)
* [百度百科：lmbench](https://baike.baidu.com/item/lmbench)
* [Lmbench](http://processors.wiki.ti.com/index.php/Lmbench)
* [lmbench](https://github.com/intel/lmbench)