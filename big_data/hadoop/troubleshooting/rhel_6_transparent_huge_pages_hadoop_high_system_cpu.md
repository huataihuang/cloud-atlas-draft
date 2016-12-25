同学反馈hadoop运行在虚拟机中，出现非常异常的负载过高问题。一旦任务开始运行，系统立即卡得无法操作。

登录检查top，发现任务运行时，CPU主要消耗在`system`而不是计算的`use`，这说明存在什么程序异常，导致不断在内核态消耗系统资源，并没有正常在工作计算。

```
top - 15:52:28 up 1 day,  5:05,  7 users,  load average: 16.69, 5.96, 2.19
Tasks: 181 total,  16 running, 165 sleeping,   0 stopped,   0 zombie
Cpu0  :  5.9%us, 93.8%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.3%hi,  0.0%si,  0.0%st
Cpu1  :  3.6%us, 96.4%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  :  4.6%us, 95.4%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu3  :  0.3%us, 99.7%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:   8058056k total,  7476536k used,   581520k free,    37996k buffers
Swap:        0k total,        0k used,        0k free,  3225056k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  GROUP    P   TIME COMMAND
 2570 hadoop    20   0 4453m 648m  25m S  0.3  8.2  53:12.97 hadoop   2  53:12 java
 1843 hdfs      20   0 2767m 435m  28m S  0.0  5.5  16:52.01 hadoop   0  16:52 java
 2514 hadoop    20   0 2357m 424m  51m S  0.0  5.4   2:08.02 hadoop   3   2:08 java
 1748 hdfs      20   0 3899m 421m  28m S 18.7  5.4  89:12.91 hadoop   0  89:12 java
 2707 root      20   0 4603m 398m  52m S  0.6  5.1   2:51.18 root     1   2:51 java
 2490 hadoop    20   0 2261m 359m  50m S  0.0  4.6   2:37.18 hadoop   3   2:37 java
 1942 hadoop    20   0 4141m 344m  28m S  0.6  4.4  14:30.26 hadoop   3  14:30 java
 2940 hadoop    20   0 2819m 282m  28m S  0.3  3.6   7:10.89 hadoop   3   7:10 java
 4966 root      20   0 3686m 219m  14m S 14.1  2.8   0:51.95 root     1   0:51 java
19706 root      20   0 3027m 164m  13m S  0.3  2.1   2:09.46 root     1   2:09 java
 3097 hadoop    20   0 2746m 156m  27m S  0.0  2.0   1:27.23 hadoop   3   1:27 java
 5830 hadoop    20   0 2198m 107m  27m S 33.7  1.4   1:09.69 hadoop   0   1:09 java
27060 root      20   0  303m  75m 5200 S 18.4  1.0   7:05.99 root     3   7:05 ilogtail
 3043 hue       20   0 2710m  73m 5664 S  0.0  0.9   0:14.46 hue      1   0:14 hue
26082 ganglia   20   0  286m  37m 2556 R 17.8  0.5  68:19.41 ganglia  2  68:19 gmond
 1364 mysql     20   0  626m  28m 4344 S  0.0  0.4   0:31.21 mysql    3   0:31 mysqld
 2688 root      20   0  352m  14m 3440 S  0.3  0.2   0:51.18 root     0   0:51 supervisor
 3268 root      20   0  276m 9716 4940 S  0.0  0.1   0:03.76 root     3   0:03 httpd
 3170 ganglia   20   0  227m 9260 1348 S 19.3  0.1  41:04.32 ganglia  2  41:04 gmetad
 1438 root      20   0 81940 8952 5288 S  0.3  0.1   7:22.85 root     0   7:22 AliHids
27105 root      20   0  172m 7052 3084 S  0.0  0.1   5:01.65 root     0   5:01 python
```

上述任务运行起来时候，发现系统执行任何检查内存状态命令都很缓慢。例如`vmstat`时候，卡了好一会才开始有输出。但是`vmstat`输出可以看到，并没有很高的上下文切换

```
[root@emr-header-1 ~]# vmstat 1 10
procs -----------memory---------- ---swap-- -----io---- --system-- -----cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
13  0      0 587056  37908 3225036    0    0    30    36   57    7  2 25 73  0  0
12  0      0 587056  37908 3225036    0    0     0     0 6229 2902  4 96  0  0  0
12  0      0 586932  37908 3225036    0    0     0     0 4666 2147  5 95  0  0  0
14  0      0 587064  37916 3225028    0    0     0    32 4696 2225  4 96  0  0  0
13  0      0 587064  37916 3225036    0    0     0    92 4700 2252  4 96  0  0  0
13  0      0 586940  37916 3225036    0    0     0     0 4639 2158  4 97  0  0  0
14  0      0 586924  37916 3225036    0    0     0     0 4656 2221  2 99  0  0  0
17  0      0 586924  37916 3225036    0    0     0     0 4578 2216  4 96  0  0  0
18  0      0 586800  37916 3225036    0    0     0     4 4592 2229  4 96  0  0  0
18  0      0 586800  37920 3225036    0    0     0    40 4621 2237  5 95  0  0  0
```

尝试用`ps`抓运行在队列中任务也不行，卡住没有任何输出。检查发现ps命令无法使用

```
[root@emr-header-1 ~]# ps -o comm,pid,ppid,user,time,etime,start,pcpu,state --sort=comm aH | grep '^COMMAND\|R$'
```

原因是`procfs`无法访问，尝试`cd`到`proc`中检查进程状态，发现也不能进入，长时间无输出。

```
[root@emr-header-1 ~]# cd /proc/2570
```

google了一下，原来这个问题是RedHat Enterprise Linux 6的透明大页的bug [Performance Issues with Transparent Huge Pages (THP) ](https://blogs.oracle.com/linux/entry/performance_issues_with_transparent_huge)。详细的排查方法，可以参考 [Linux 6 Transparent Huge Pages and Hadoop Workloads ](http://structureddata.org/2012/06/18/linux-6-transparent-huge-pages-and-hadoop-workloads/)

## 尝试关闭透明大页

检查当前`THP`状态，可以看到是始终打开的，我们现在关闭掉

```
[root@emr-header-1 proc]# cat /sys/kernel/mm/redhat_transparent_hugepage/enabled
[always] madvise never

[root@emr-header-1 proc]# echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled

[root@emr-header-1 proc]# cat /sys/kernel/mm/redhat_transparent_hugepage/enabled
always madvise [never]
```

```
[root@emr-header-1 2570]# cat /sys/kernel/mm/redhat_transparent_hugepage/defrag
[always] madvise never
```

关闭

```
[root@emr-header-1 2570]# echo never > /sys/kernel/mm/redhat_transparent_hugepage/defrag
[root@emr-header-1 2570]# cat /sys/kernel/mm/redhat_transparent_hugepage/defrag
always madvise [never]
```

然后重启`emr-agent`

```
[root@emr-header-1 2570]# service emr-agent restart
Stopping emr-agent:                                        [  OK  ]
Starting emr-agent:                                        [  OK  ]
```

此时再次观察，发现任务的还是没有解决问题

```
top - 17:47:40 up 1 day,  7:01,  8 users,  load average: 14.30, 12.24, 8.06
Tasks: 170 total,   8 running, 162 sleeping,   0 stopped,   0 zombie
Cpu0  :  0.7%us, 99.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu1  :  0.7%us, 99.3%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  :  0.3%us, 99.7%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu3  :  2.0%us, 98.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:   8058056k total,  7686156k used,   371900k free,    41568k buffers
Swap:        0k total,        0k used,        0k free,  3420192k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
26082 ganglia   20   0  288m  39m 2556 R 55.1  0.5  81:53.35 gmond
15053 hadoop    20   0 4553m 121m  24m S 53.4  1.5   6:36.45 java
20001 root      20   0  297m  70m 5184 S 31.5  0.9   6:56.79 ilogtail
15788 root      20   0 56796  520  364 R 30.9  0.0   0:09.23 rrdtool
18497 root      20   0 3695m 266m  15m S 28.9  3.4   8:45.15 java
15798 root      20   0   112    4    0 R 28.5  0.0   0:01.03 env
15768 root      20   0 15036 1176  840 R 25.6  0.0   0:23.93 top
15787 root      20   0 16924 1228  848 R 25.6  0.0   0:09.62 sampler.py
15797 root      20   0  1180   92   72 R 25.6  0.0   0:01.56 sh
15775 root      20   0  103m 1564 1120 S 21.6  0.0   0:11.87 service
 1748 hdfs      20   0 3899m 383m  28m S 20.6  4.9  96:18.13 java
11108 root      20   0  312m 4216 1660 S  6.0  0.1  20:09.36 aegis_quartz
13983 root      20   0 98328 4160 3156 S  6.0  0.1   3:57.80 sshd
  283 root      20   0     0    0    0 S  3.3  0.0   8:37.16 jbd2/xvda1-8
 2424 root      20   0 98324 4164 3156 S  3.3  0.1   1:37.10 sshd
 3170 ganglia   20   0  227m 9032 1348 S  3.0  0.1  46:59.56 gmetad
```

> 这个问题想尝试通过扩容内存和CPU来排查，采用[XEN guest操作系统动态添加／移除内存或CPU](../../../virtual/xen/startup/xen_add_remove_memory_cpu_to_guest_on_fly)为虚拟机扩容内存，从原先8G扩容到16G
>
> 不过，这个方法还没有做，先看看是哪个占用了sys

# 查找sys占用较高的进程

使用了一个比较土的方法，先把系统中所有正在运行的进程找出来

```
ps aux | awk '{print $2}' | tee run_pid
```

然后对每个进程使用`pidstat`命令，这样就可以看出是使用多少`system`

```
for i in `cat run_pid`;do pidstat -p $i;done | tee run_pid_cpu
```

此时能够得到的信息类似

```
Linux 2.6.32-431.23.3.el6.x86_64 (emr-header-1.cluster-25364)   12/19/2016      _x86_64_        (4 CPU)

04:41:59 PM       PID    %usr %system  %guest    %CPU   CPU  Command
04:41:59 PM     14541    0.66    1.87    0.00    2.53     1  java
Linux 2.6.32-431.23.3.el6.x86_64 (emr-header-1.cluster-25364)   12/19/2016      _x86_64_        (4 CPU)

04:41:59 PM       PID    %usr %system  %guest    %CPU   CPU  Command
04:41:59 PM     17981    0.15   13.68    0.00   13.83     1  gmond
```

现在按照第5列（`%system`）排序进程

```
cat run_pid_cpu | grep -v PID | grep -v 2.6.32-431.23.3.el6 | grep -v "^$" | sort -k 5
```

> 需要按照第4列（`%system`）排序就可以知道是哪个进程异常 (参考 [Sort file according to the second column?](http://stackoverflow.com/questions/4262650/sort-file-according-to-the-second-column))

```

    -k, --key=POS1[,POS2]

    start a key at POS1, end it at POS2 (origin 1)

    POS is F[.C][OPTS], where F is the field number and C the character position in the field. OPTS is one or more single-letter ordering options, which override global ordering options for that key. If no key is given, use the entire line as the key.
    -t, --field-separator=SEP

    use SEP instead of non-blank to blank transition
```

可以看到占用处理器资源的情况主要集中在如下进程（第5列最大的值在最下面），其中异常的是`gmond`，占用了大量的system，但是缺没有`us`

```
04:41:59 PM      1629    0.01    1.27    0.00    1.28     3  bash
04:41:59 PM     10114    0.03    1.31    0.00    1.34     0  aegis_quartz
04:41:59 PM      1846    0.16    1.84    0.00    2.01     0  java
04:41:59 PM     14541    0.66    1.87    0.00    2.53     1  java
04:41:59 PM      1456    0.19    3.11    0.00    3.30     2  AliYunDun
04:41:59 PM      2599   17.73    3.67    0.00   21.40     3  java
04:41:59 PM      4953    0.25    3.70    0.00    3.95     1  java
04:41:59 PM      5883    0.02    3.89    0.00    3.92     1  ilogtail
04:41:59 PM      6644    0.12    8.08    0.00    8.20     2  java
04:41:59 PM     17981    0.15   13.68    0.00   13.83     1  gmond
```

`gmond`是集群监控系统`ganglia`的监控服务，google到 [gmond occupying 100% of the CPU](https://adamo.wordpress.com/2015/05/27/gmond-occupying-100-of-the-cpu/) 在非多播环境中，`gmond`进程可能会导致系统CPU百分百占用掉。这种情况下，检查节点是否设置`deaf`（也就是节点是否接收任何节点的消息），设置

```
deaf = yes
```

> [gmond occupying 100% of the CPU](https://adamo.wordpress.com/2015/05/27/gmond-occupying-100-of-the-cpu/) 文档提到 CentOS 6.5有这个现象，ubuntu也有
>
> 这个设置貌似有效，虽然还是没有完全解决问题，因为我设置以后再采用上述方法排查

```
05:26:58 PM      1629    0.01    1.06    0.00    1.06     1  bash
05:26:58 PM     10938    0.01    1.10    0.00    1.11     2  gmond
05:26:58 PM     10114    0.03    1.31    0.00    1.34     0  aegis_quartz
05:26:58 PM     13746    0.01    1.46    0.00    1.47     3  ilogtail
05:26:58 PM     14541    0.60    1.59    0.00    2.19     1  java
05:26:58 PM      1846    0.15    1.68    0.00    1.84     0  java
05:26:58 PM     12909    0.20    2.00    0.00    2.20     1  java
05:26:58 PM      1456    0.19    3.11    0.00    3.30     0  AliYunDun
05:26:58 PM      2599   14.11    3.47    0.00   17.58     3  java
05:26:58 PM     15105    0.08    4.21    0.00    4.29     2  java
```

看上去至少进程`gmond`已经不再大量消耗`sys`

# strace

* 对`gmond`进行 strace查看系统调用

```
strace -c -p 10938
```

显示输出

```
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 99.99   13.704919       39157       350           read
  0.01    0.001210           2       628           fstat
  0.00    0.000211           1       326         1 open
  0.00    0.000192           1       314           munmap
  0.00    0.000147           0       327           close
  0.00    0.000147           0       315           mmap
  0.00    0.000087           0       274       137 write
  0.00    0.000024           0       137           sendto
  0.00    0.000000           0         6           stat
  0.00    0.000000           0       325           lstat
  0.00    0.000000           0         3         3 ioctl
  0.00    0.000000           0         1           select
  0.00    0.000000           0         3           socket
  0.00    0.000000           0         4           getdents
  0.00    0.000000           0         4           statfs
------ ----------- ----------- --------- --------- ----------------
100.00   13.706937                  3017       141 total
```

检查堆栈

```
[root@emr-header-1 ~]# cat /proc/10938/stack
[<ffffffff811a06d9>] poll_schedule_timeout+0x39/0x60
[<ffffffff811a179c>] do_select+0x57c/0x6c0
[<ffffffff811a1a6a>] core_sys_select+0x18a/0x2c0
[<ffffffff811a1df7>] sys_select+0x47/0x110
[<ffffffff8100b072>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

```
for i in `ps -AL |grep gmond |cut -c 7-12`; do \
    echo === $i ===; \
    gdb --q --n --ex bt --batch --pid $i; \
done 2>&1 |tee /tmp/stacks.txt
```

显示输出

```
=== 10938 ===
[Thread debugging using libthread_db enabled]
0x0000003bfb4e1353 in __select_nocancel () from /lib64/libc.so.6
#0  0x0000003bfb4e1353 in __select_nocancel () from /lib64/libc.so.6
#1  0x0000003c03023125 in apr_sleep () from /usr/lib64/libapr-1.so.0
#2  0x00000000004088f8 in main ()
```

* 看上去`AliYunDun` 1456 似乎也是一个问题

在没有运行java程序对时候显示如下

```
[root@emr-header-1 ~]# strace -c -p 1456
Process 1456 attached - interrupt to quit
^CProcess 1456 detached
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
100.00    0.033997         103       331           nanosleep
  0.00    0.000000           0         1           restart_syscall
------ ----------- ----------- --------- --------- ----------------
100.00    0.033997                   332           total
[root@emr-header-1 ~]# strace -c -p 1456
Process 1456 attached - interrupt to quit
^CProcess 1456 detached
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
100.00    0.021996          89       248           nanosleep
  0.00    0.000000           0         1           restart_syscall
------ ----------- ----------- --------- --------- ----------------
100.00    0.021996                   249           total
```

开始运行任务以后尝试`strace`云盾进程，发现这个进程不允许跟踪

```
[root@emr-header-1 2]# strace -c -p 1456
attach: ptrace(PTRACE_ATTACH, ...): Operation not permitted
```

开始运行任务以后显示

```
for i in `ps -AL |grep AliYunDun |cut -c 7-12`; do \
    echo === $i ===; \
    gdb --q --n --ex bt --batch --pid $i; \
done 2>&1 |tee /tmp/stacks.txt
```

显示输出

```
=== 1109 ===
[New LWP 1137]
[New LWP 1111]
[New LWP 1110]
[Thread debugging using libthread_db enabled]
0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#0  0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#1  0x0000003bfb4ac8b0 in sleep () from /lib64/libc.so.6
#2  0x0000000000441333 in ?? ()
#3  0x000000000041a7dd in ?? ()
#4  0x000000000041ada4 in ?? ()
#5  0x00000000004199ab in ?? ()
#6  0x0000000000409767 in ?? ()
#7  0x0000003bfb41ed5d in __libc_start_main () from /lib64/libc.so.6
#8  0x0000000000409629 in ?? ()
#9  0x00007fff8726fd48 in ?? ()
#10 0x000000000000001c in ?? ()
#11 0x0000000000000001 in ?? ()
#12 0x00007fff87270e99 in ?? ()
#13 0x0000000000000000 in ?? ()
=== 1110 ===

warning: process 1110 is a cloned process
[Thread debugging using libthread_db enabled]
0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#0  0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#1  0x0000003bfb4e1be4 in usleep () from /lib64/libc.so.6
#2  0x000000000044131a in ?? ()
#3  0x000000000043e650 in ?? ()
#4  0x000000000043d84f in aqs::CThreadUtil::ThreadFunc(void*) ()
#5  0x0000003bfbc079d1 in start_thread () from /lib64/libpthread.so.0
#6  0x0000003bfb4e88fd in clone () from /lib64/libc.so.6
=== 1111 ===

warning: process 1111 is a cloned process
[Thread debugging using libthread_db enabled]
0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#0  0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#1  0x0000003bfb4e1be4 in usleep () from /lib64/libc.so.6
#2  0x000000000044131a in ?? ()
#3  0x0000000000422628 in ?? ()
#4  0x000000000043d84f in aqs::CThreadUtil::ThreadFunc(void*) ()
#5  0x0000003bfbc079d1 in start_thread () from /lib64/libpthread.so.0
#6  0x0000003bfb4e88fd in clone () from /lib64/libc.so.6
=== 1137 ===

warning: process 1137 is a cloned process
[Thread debugging using libthread_db enabled]
0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#0  0x0000003bfb4aca3d in nanosleep () from /lib64/libc.so.6
#1  0x0000003bfb4ac8b0 in sleep () from /lib64/libc.so.6
#2  0x0000000000441333 in ?? ()
#3  0x0000000000417c43 in ?? ()
#4  0x0000000000417e80 in ?? ()
#5  0x000000000043d84f in aqs::CThreadUtil::ThreadFunc(void*) ()
#6  0x0000003bfbc079d1 in start_thread () from /lib64/libpthread.so.0
#7  0x0000003bfb4e88fd in clone () from /lib64/libc.so.6
=== 1456 ===
```

* 对java进程

strace对于java无效

```
[root@emr-header-1 ~]# strace -c -p 22345
Process 22345 attached - interrupt to quit
^CProcess 22345 detached
```

java

```
[root@emr-header-1 ~]# cat /proc/22345/stack
[<ffffffff810ae569>] futex_wait_queue_me+0xb9/0xf0
[<ffffffff810af678>] futex_wait+0x1f8/0x380
[<ffffffff810b0f91>] do_futex+0x121/0xb50
[<ffffffff810b1a3b>] sys_futex+0x7b/0x170
[<ffffffff8100b072>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

jps

```
[root@emr-header-1 ganglia]# cat /proc/22437/stack
[<ffffffff810ae569>] futex_wait_queue_me+0xb9/0xf0
[<ffffffff810af678>] futex_wait+0x1f8/0x380
[<ffffffff810b0f91>] do_futex+0x121/0xb50
[<ffffffff810b1a3b>] sys_futex+0x7b/0x170
[<ffffffff8100b072>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

发现多个java进程都是等待在`futex_wait_queue_me`，搜索到[App hangs on futex_wait_queue_me() every a couple of minutes](App hangs on futex_wait_queue_me() every a couple of minutes) 说明：

CentOS 6的内核在运行java和多线程的程序会存在bug，升级到 `2.6.32-504.16.2.el6.x86_64` 后可以解决，具体的bug报告在 https://bugs.centos.org/view.php?id=8703 ，详细的问题解释在 [futex: Ensure get_futex_key_refs() always implies a barrier](https://github.com/torvalds/linux/commit/76835b0ebf8a7fe85beb03c75121419a7dec52f0)

> [b0c29f7](https://github.com/torvalds/linux/commit/b0c29f79ecea0b6fbcefc999e70f2843ae8306db) 

```
Commit b0c29f7 (futexes: Avoid taking the hb->lock if there's
nothing to wake up) changes the futex code to avoid taking a lock when
there are no waiters. This code has been subsequently fixed in commit
11d4616 (futex: revert back to the explicit waiter counting code).
Both the original commit and the fix-up rely on get_futex_key_refs() to
always imply a barrier.

However, for private futexes, none of the cases in the switch statement
of get_futex_key_refs() would be hit and the function completes without
a memory barrier as required before checking the "waiters" in
futex_wake() -> hb_waiters_pending(). The consequence is a race with a
thread waiting on a futex on another CPU, allowing the waker thread to
read "waiters == 0" while the waiter thread to have read "futex_val ==
locked" (in kernel).

Without this fix, the problem (user space deadlocks) can be seen with
Android bionic's mutex implementation on an arm64 multi-cluster system.
```

升级CentOS 6内核 `2.6.32-642.11.1.el6` 升级以后同样的任务调度不再出现异常的`sys`使用率。

观察 java 进程的stack，依然是相同的函数，但是没有任何阻塞

```
# cat /proc/30964/stack
[<ffffffff810ba4ea>] futex_wait_queue_me+0xba/0xf0
[<ffffffff810bb660>] futex_wait+0x1c0/0x310
[<ffffffff810bcf61>] do_futex+0x121/0xae0
[<ffffffff810bd99b>] sys_futex+0x7b/0x170
[<ffffffff8100b0d2>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff

# cat /proc/30964/stack
[<ffffffff810ba4ea>] futex_wait_queue_me+0xba/0xf0
[<ffffffff810bb660>] futex_wait+0x1c0/0x310
[<ffffffff810bcf61>] do_futex+0x121/0xae0
[<ffffffff810bd99b>] sys_futex+0x7b/0x170
[<ffffffff8100b0d2>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```


# 参考

* [gmond occupying 100% of the CPU](https://adamo.wordpress.com/2015/05/27/gmond-occupying-100-of-the-cpu/)
* [How To Diagnose High Sys CPU On Linux](https://newspaint.wordpress.com/2013/07/24/how-to-diagnose-high-sys-cpu-on-linux/)