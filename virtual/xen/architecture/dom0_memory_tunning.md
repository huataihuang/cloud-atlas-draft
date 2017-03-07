XEN服务器dom0内存可以在启动时限制，以便能够将更多内存保留给domU使用。

但是系统服务也可能随着负载增加而逐渐内存不足并并且存在内存碎片

以下XEN服务器dom0存在sys极高，负载远超过分配给dom0的CPU数量

```
top - 09:05:16 up 1014 days, 17:17,  2 users,  load average: 28.10, 25.35, 26.06
Tasks: 483 total,  11 running, 466 sleeping,   0 stopped,   6 zombie
Cpu0  : 21.9%us, 73.8%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  4.4%si,  0.0%st
Cpu1  : 39.2%us, 56.7%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  4.1%si,  0.0%st
Cpu2  : 51.0%us, 42.8%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  6.3%si,  0.0%st
Cpu3  : 38.9%us, 58.1%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  3.0%si,  0.0%st
Cpu4  : 40.1%us, 59.6%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu5  : 45.1%us, 50.5%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  4.4%si,  0.0%st
Cpu6  : 32.8%us, 60.4%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  6.8%si,  0.0%st
Cpu7  : 35.9%us, 60.8%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  3.3%si,  0.0%st
Mem:  16384000k total, 15644412k used,   739588k free,   185284k buffers
Swap:        0k total,        0k used,        0k free,  7101404k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
27209 root      20   0 2111m 315m 8788 S 114.0  2.0  59564:40 AAAAA
...
 3871 root      20   0 1002m  88m 5952 S 39.1  0.6 233:17.71 BBBB
...
 6637 root      20   0  9804 2084  240 R 33.2  0.0 159892:47 xenstored
27183 root      20   0 2110m 1.1g  10m S 25.2  6.9   5955:24 CCCC
```

检查服务发现除了`xenstored`在运行外，很多系统进程堆栈，显示处于`sys_nanosleep`状态

```
#cat /proc/27209/stack
[<ffffffff81078c7e>] hrtimer_nanosleep+0x6f/0xdf
[<ffffffff81078d47>] sys_nanosleep+0x59/0x6f
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff

#cat /proc/3871/stack
[<ffffffff81078c7e>] hrtimer_nanosleep+0x6f/0xdf
[<ffffffff81078d47>] sys_nanosleep+0x59/0x6f
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff

#cat /proc/6637/stack
[<ffffffff81052efd>] __cond_resched+0x2a/0x35
[<ffffffff8111ec1c>] do_select+0x3df/0x54f
[<ffffffff8111ef03>] core_sys_select+0x177/0x212
[<ffffffff8111f03a>] sys_select+0x9c/0xc4
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff

#cat /proc/27183/stack
[<ffffffff81078c7e>] hrtimer_nanosleep+0x6f/0xdf
[<ffffffff81078d47>] sys_nanosleep+0x59/0x6f
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

检查当前dom0配置内存

```
#grep MemTotal /proc/meminfo
MemTotal:       16384000 kB
```

物理服务器实际内存可以从`dmidecode`查看

> 这台服务器我尝试了 `drop_cache`方法：

```
echo 3 > /proc/sys/vm/drop_caches
```

似乎负载满满降低了下来。按照我的想法，可能需要通过扩容`dom0`来解决 （不过目前还没有测试）

```
sudo xl mem-set 0 18000m
```

# 参考

