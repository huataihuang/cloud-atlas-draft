服务器负载极高

```
top - 10:53:03 up 316 days, 22 min, 13 users,  load average: 6061.49, 5981.81, 5771.33
Tasks: 7810 total,   2 running, 7551 sleeping,   0 stopped, 257 zombie
Cpu0  : 16.9%us, 17.3%sy,  0.7%ni, 64.8%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu1  :  0.3%us,  1.0%sy,  0.0%ni, 98.3%id,  0.0%wa,  0.0%hi,  0.0%si,  0.3%st
Cpu2  :  8.4%us, 17.7%sy,  0.3%ni, 72.7%id,  0.0%wa,  0.0%hi,  0.6%si,  0.3%st
Cpu3  : 19.9%us, 14.0%sy,  0.0%ni, 65.1%id,  0.3%wa,  0.0%hi,  0.3%si,  0.3%st
Cpu4  :  5.2%us,  8.8%sy,  0.0%ni, 85.0%id,  0.3%wa,  0.0%hi,  0.0%si,  0.7%st
Cpu5  : 11.6%us, 14.7%sy,  0.3%ni, 72.4%id,  0.6%wa,  0.0%hi,  0.0%si,  0.3%st
Cpu6  : 11.1%us, 15.0%sy,  0.0%ni, 73.2%id,  0.0%wa,  0.0%hi,  0.3%si,  0.3%st
Cpu7  : 10.2%us,  6.6%sy,  0.0%ni, 82.6%id,  0.0%wa,  0.0%hi,  0.3%si,  0.3%st
Mem:  19456000k total, 18993544k used,   462456k free,    30484k buffers
Swap:        0k total,        0k used,        0k free,   549500k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
10720 root      20   0 11460 3964  484 S 16.2  0.0  57867:27 xenstored
20967 root      20   0  668m  26m 1716 S 12.4  0.1  11031:25 xend
 6180 admin     20   0 18512 7072  932 R 11.2  0.0   0:02.33 top
```

检查系统进程有大量D

```
ps r -A
```

输出显示

```
  PID TTY      STAT   TIME COMMAND
  316 ?        D      0:00 /bin/ps axwo stat uid pid ppid vsz rss pcpu comm args
  325 ?        D      0:00 ps -eo pid,ppid,command
  326 ?        D      0:00 ps aux
  332 ?        D      0:00 ps aux
...
```

服务进程`12566`也是`D`住，检查这个进程的堆栈

```
$sudo cat /proc/12566/stack
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff81140fe2>] __access_remote_vm+0x42/0x1d0
[<ffffffff811411cb>] access_process_vm+0x5b/0x80
[<ffffffff811e32d0>] proc_pid_cmdline+0x90/0x110
[<ffffffff811e45ca>] proc_info_read+0xaa/0xf0
[<ffffffff8117ab39>] vfs_read+0xc9/0x1a0
[<ffffffff8117be45>] sys_read+0x55/0x90
[<ffffffff8100cf72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

```
sudo ls -l /proc/12566
```

显示这个杀进程的命令

```
lrwxrwxrwx  1 nobody nobody 0 Apr 12 10:55 exe -> /sbin/killall5
```

检查这个进程`处理`对应的cmdline

```
sudo ls -l /proc/12566/fd | grep cmdline
```

输出显示

```
lr-x------ 1 nobody nobody 64 Apr 12 10:58 4 -> /proc/16653/cmdline
```

一般就是某个进程的mmap_sem被写锁lock了，ps都会被D住

* 这个`16653`进程就是杀不死的死锁进程，看看这个进程对应的线程的情况

```
sudo cat /proc/16653/task/*/stack
```

显示大量的`mmap_sem`死锁

```
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff814ed543>] do_page_fault+0x1f3/0x550
[<ffffffff814ea845>] page_fault+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff814ed543>] do_page_fault+0x1f3/0x550
[<ffffffff814ea845>] page_fault+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff81140fe2>] __access_remote_vm+0x42/0x1d0
[<ffffffff811411cb>] access_process_vm+0x5b/0x80
[<ffffffff811e32d0>] proc_pid_cmdline+0x90/0x110
[<ffffffff811e45ca>] proc_info_read+0xaa/0xf0
[<ffffffff8117ab39>] vfs_read+0xc9/0x1a0
[<ffffffff8117be45>] sys_read+0x55/0x90
[<ffffffff8100cf72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff814ed543>] do_page_fault+0x1f3/0x550
[<ffffffff814ea845>] page_fault+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
...
```

这个`16653`进程下有很多线程

```
$ls -lh /proc/16653/task
total 0
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16653
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16657
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16658
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16672
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16673
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16674
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16675
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16676
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16677
dr-xr-xr-x 5 root root 0 Apr 12 10:45 16678
```

例如这些线程的堆栈都显示内存页分配失败

```
$sudo cat /proc/16653/task/16653/stack
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff814ed543>] do_page_fault+0x1f3/0x550
[<ffffffff814ea845>] page_fault+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff

$sudo cat /proc/16653/task/16657/stack
[<ffffffff81264a14>] call_rwsem_down_read_failed+0x14/0x30
[<ffffffff814ed543>] do_page_fault+0x1f3/0x550
[<ffffffff814ea845>] page_fault+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
```

* 检查内存

```
$sudo cat /proc/meminfo
MemTotal:       19456000 kB
MemFree:          479248 kB
Buffers:           61308 kB
Cached:           775192 kB
SwapCached:            0 kB
Active:         13455392 kB
Inactive:         542032 kB
Active(anon):   13167380 kB
Inactive(anon):    88712 kB
Active(file):     288012 kB
Inactive(file):   453320 kB
Unevictable:        5016 kB
Mlocked:            5024 kB
SwapTotal:             0 kB
SwapFree:              0 kB
Dirty:              1088 kB
Writeback:             0 kB
AnonPages:      13166156 kB
Mapped:           131036 kB
Shmem:             91336 kB
Slab:            1244404 kB
SReclaimable:     260156 kB
SUnreclaim:       984248 kB
KernelStack:       75712 kB
PageTables:       410712 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:     9728000 kB
Committed_AS:   122654448 kB
VmallocTotal:   34359738367 kB
VmallocUsed:     1516940 kB
VmallocChunk:   34358137816 kB
HardwareCorrupted:     0 kB
AnonHugePages:         0 kB
HugePages_Total:       0
HugePages_Free:        0
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
DirectMap4k:    21591300 kB
DirectMap2M:           0 kB
```

```
$sudo cat /proc/buddyinfo
Node 0, zone      DMA      2      1      1      2      2      1      1      0      0      0      2
Node 0, zone    DMA32  45679  15072    181     12      0      1      1      2      1      0      0
Node 0, zone   Normal  17465   7982      0      0      0      0      0      0      0      0      1
```

从`buddyinfo`查看，显示缺少高阶内存。

