> 一个Java服务的异常负载排查，从`top`来看，系统大多数进程是sleep状态的，但是在`top`中显示CPU消耗很大。

```
#jstack 21284
21284: Unable to open socket file: target process not responding or HotSpot VM not loaded
The -F option can be used when the target process is not responding

#jstack -F 21284
Attaching to process ID 21284, please wait...
Exception in thread "main" java.lang.reflect.InvocationTargetException
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:616)
	at sun.tools.jstack.JStack.runJStackTool(JStack.java:136)
	at sun.tools.jstack.JStack.main(JStack.java:102)
Caused by: java.lang.RuntimeException: Type "Klass*", referenced in VMStructs::localHotSpotVMStructs in the remote VM, was not present in the remote VMStructs::localHotSpotVMTypes table (should have been caught in the debug build of that VM). Can not continue.
	at sun.jvm.hotspot.HotSpotTypeDataBase.lookupOrFail(HotSpotTypeDataBase.java:362)
	at sun.jvm.hotspot.HotSpotTypeDataBase.readVMStructs(HotSpotTypeDataBase.java:253)
	at sun.jvm.hotspot.HotSpotTypeDataBase.<init>(HotSpotTypeDataBase.java:87)
	at sun.jvm.hotspot.bugspot.BugSpotAgent.setupVM(BugSpotAgent.java:568)
	at sun.jvm.hotspot.bugspot.BugSpotAgent.go(BugSpotAgent.java:494)
	at sun.jvm.hotspot.bugspot.BugSpotAgent.attach(BugSpotAgent.java:332)
	at sun.jvm.hotspot.tools.Tool.start(Tool.java:163)
	at sun.jvm.hotspot.tools.JStack.main(JStack.java:86)
	... 6 more
```

尝试使用 strace 排查

```
strace -f -p 21284
```

发现大量的

```
[pid 27630] gettimeofday( <unfinished ...>
[pid 21438] fcntl(107, F_SETFL, O_RDWR <unfinished ...>
[pid 27630] <... gettimeofday resumed> {1491808183, 346978}, NULL) = 0
[pid 27628] gettimeofday( <unfinished ...>
[pid 21438] <... fcntl resumed> )       = 0
[pid 27630] write(87, "101.70.152.60,124.160.213.237\t11"..., 935 <unfinished ...>
```

例如

```
[pid 13603] gettimeofday( <unfinished ...>
[pid 24983] gettimeofday( <unfinished ...>
[pid 21676] gettimeofday( <unfinished ...>
[pid 21612] <... getsockname resumed> {sa_family=AF_INET, sin_port=htons(7001), sin_addr=inet_addr("127.0.0.1")}, [16]) = 0
[pid 21607] gettimeofday( <unfinished ...>
[pid 21604] <... clock_gettime resumed> {21604853, 242074015}) = 0
[pid 21438] clock_gettime(CLOCK_MONOTONIC,  <unfinished ...>
[pid 21342] gettimeofday( <unfinished ...>
[pid 21312] <... futex resumed> )       = -1 ETIMEDOUT (Connection timed out)
[pid 13603] <... gettimeofday resumed> {1491808188, 869597}, NULL) = 0
[pid 24983] <... gettimeofday resumed> {1491808188, 869607}, NULL) = 0
[pid 21676] <... gettimeofday resumed> {1491808188, 869615}, NULL) = 0
[pid 21612] gettimeofday( <unfinished ...>
[pid 21607] <... gettimeofday resumed> {1491808188, 869642}, NULL) = 0
[pid 21604] futex(0x7f9d06053934, FUTEX_WAIT_BITSET_PRIVATE, 27671, {21604912, 973581151}, ffffffff <unfinished ...>
[pid 21438] <... clock_gettime resumed> {21604853, 242218291}) = 0
[pid 21342] <... gettimeofday resumed> {1491808188, 869676}, NULL) = 0
[pid 21700] gettimeofday( <unfinished ...>
[pid 21312] futex(0x7f9d073ddf28, FUTEX_WAKE_PRIVATE, 1 <unfinished ...>
[pid 13603] gettimeofday( <unfinished ...>
[pid 24983] dup2(44, 155 <unfinished ...>
[pid 21700] <... gettimeofday resumed> {1491808188, 869851}, NULL) = 0
[pid 21676] gettimeofday( <unfinished ...>
[pid 21612] <... gettimeofday resumed> {1491808188, 869796}, NULL) = 0
[pid 21607] gettimeofday( <unfinished ...>
[pid 21438] setsockopt(139, SOL_SOCKET, SO_LINGER, {onoff=0, linger=0}, 8 <unfinished ...>
[pid 21342] gettimeofday( <unfinished ...>
[pid 21312] <... futex resumed> )       = 0
[pid 13603] <... gettimeofday resumed> {1491808188, 869891}, NULL) = 0
[pid 24983] <... dup2 resumed> )        = 155
```

再次尝试
 
```
#/opt/taobao/java/bin/jstack 21284 > /var/tmp/jstack.out

21284: Unable to open socket file: target process not responding or HotSpot VM not loaded
The -F option can be used when the target process is not responding
```

抓几次对比

```
/opt/taobao/java/bin/jstack -F 21284 > /var/tmp/jstack.out
/opt/taobao/java/bin/jstack -F 21284 > /var/tmp/jstack2.out
/opt/taobao/java/bin/jstack -F 21284 > /var/tmp/jstack3.out
```

在 `/var/tmp/jstack.out`显示大量的线程阻塞

```
Thread 22306: (state = BLOCKED)
 - sun.misc.Unsafe.park(boolean, long) @bci=0 (Compiled frame; information may be imprecise)
 - java.util.concurrent.locks.LockSupport.parkNanos(java.lang.Object, long) @bci=20, line=215 (Compiled frame)
 - java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(long) @bci=78, line=2078 (Compiled frame)
 - java.util.concurrent.LinkedBlockingQueue.poll(long, java.util.concurrent.TimeUnit) @bci=62, line=467 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=86 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=32 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.getTask() @bci=134, line=1066 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.runWorker(java.util.concurrent.ThreadPoolExecutor$Worker) @bci=26, line=1127 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor$Worker.run() @bci=5, line=617 (Interpreted frame)
 - org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run() @bci=4, line=61 (Interpreted frame)
 - java.lang.Thread.run() @bci=11, line=766 (Interpreted frame)


Thread 22304: (state = BLOCKED)
 - sun.misc.Unsafe.park(boolean, long) @bci=0 (Compiled frame; information may be imprecise)
 - java.util.concurrent.locks.LockSupport.parkNanos(java.lang.Object, long) @bci=20, line=215 (Compiled frame)
 - java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(long) @bci=78, line=2078 (Compiled frame)
 - java.util.concurrent.LinkedBlockingQueue.poll(long, java.util.concurrent.TimeUnit) @bci=62, line=467 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=86 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=32 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.getTask() @bci=134, line=1066 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.runWorker(java.util.concurrent.ThreadPoolExecutor$Worker) @bci=26, line=1127 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor$Worker.run() @bci=5, line=617 (Interpreted frame)
 - org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run() @bci=4, line=61 (Interpreted frame)
 - java.lang.Thread.run() @bci=11, line=766 (Interpreted frame)
```

参考 [High CPU Utilization in java application - why?](High CPU Utilization in java application - why?)

先使用 `top` 然后使用`H`来获得线程编号

```
$top
top - 15:38:27 up 250 days,  1:49,  5 users,  load average: 5.91, 5.08, 4.64
Tasks: 1091 total,   5 running, 1086 sleeping,   0 stopped,   0 zombie
Cpu0  : 53.2%us,  3.7%sy,  0.0%ni, 33.9%id,  1.0%wa,  0.0%hi,  8.3%si,  0.0%st
Cpu1  : 43.1%us,  2.7%sy,  1.0%ni, 52.2%id,  0.0%wa,  0.0%hi,  1.0%si,  0.0%st
Cpu2  : 40.6%us,  2.3%sy,  0.0%ni, 56.4%id,  0.0%wa,  0.0%hi,  0.7%si,  0.0%st
Cpu3  : 35.5%us,  1.7%sy,  0.3%ni, 61.5%id,  0.0%wa,  0.0%hi,  1.0%si,  0.0%st
Cpu4  : 30.7%us,  2.0%sy,  0.7%ni, 66.0%id,  0.0%wa,  0.0%hi,  0.7%si,  0.0%st
Cpu5  : 24.7%us,  1.0%sy,  0.0%ni, 73.0%id,  1.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu6  : 20.6%us,  1.3%sy,  0.3%ni, 77.7%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu7  : 17.4%us,  1.0%sy,  1.0%ni, 80.6%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:  16467476k total, 16363392k used,   104084k free,    37276k buffers
Swap:        0k total,        0k used,        0k free, 12335172k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
21342 admin     20   0 6593m 2.2g  13m S 11.6 13.8   7:50.87 java
21438 admin     20   0 6593m 2.2g  13m S  3.6 13.8   2:43.62 java
21517 admin     20   0  121m  13m 2472 S  3.3  0.1   1:18.19 tengine
21511 admin     20   0  121m  13m 2472 R  3.0  0.1   1:20.82 tengine
21513 admin     20   0  121m  13m 2472 S  3.0  0.1   1:21.05 tengine
 2400 root      20   0 3159m  21m 2748 S  1.7  0.1   1025:51 staragent-core
21666 admin     20   0 6593m 2.2g  13m S  1.7 13.8   1:17.97 java
 6485 admin     20   0 6593m 2.2g  13m S  1.7 13.8   0:02.17 java
 6535 admin     20   0 6593m 2.2g  13m S  1.7 13.8   0:02.17 java
 6707 admin     20   0 6593m 2.2g  13m S  1.7 13.8   0:01.96 java
21514 admin     20   0  121m  13m 2472 S  1.7  0.1   1:19.65 tengine
 1086 agent     20   0 1890m 183m 5880 S  1.7  1.1   2:07.47 java
20691 root      39  19 6750m  42m 3128 S  1.3  0.3  74:57.33 SendMsgTP
21674 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:18.29 java
21680 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:17.81 java
21695 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:17.89 java
22299 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:15.41 java
27537 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:07.52 java
27624 admin     20   0 6593m 2.2g  13m S  1.3 13.8   1:06.57 java
```

将线程转换成16进制

```
21342 => 535E
21438 => 53BE
```

但是没有找到jstack中对应项。

参考 [High CPU Utilization Finding Cause?](http://middlewaremagic.com/weblogic/?p=4884)

```
top -H -b -p 21284
```

显示输出

```
top - 15:54:36 up 250 days,  2:05,  4 users,  load average: 4.59, 4.63, 4.34
Tasks: 407 total,   1 running, 406 sleeping,   0 stopped,   0 zombie
Cpu(s): 23.0%us,  1.5%sy,  0.6%ni, 73.2%id,  0.0%wa,  0.0%hi,  1.5%si,  0.0%st
Mem:  16467476k total, 16374668k used,    92808k free,    35980k buffers
Swap:        0k total,        0k used,        0k free, 12314192k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
21342 admin     20   0 6597m 2.2g  13m S  7.0 14.0  10:04.07 java
21438 admin     20   0 6597m 2.2g  13m S  4.0 14.0   3:19.73 java
 6477 admin     20   0 6597m 2.2g  13m S  1.3 14.0   0:09.41 java
 6533 admin     20   0 6597m 2.2g  13m S  1.3 14.0   0:09.42 java
21666 admin     20   0 6597m 2.2g  13m S  1.0 14.0   1:25.30 java
21680 admin     20   0 6597m 2.2g  13m S  1.0 14.0   1:25.41 java
21721 admin     20   0 6597m 2.2g  13m S  1.0 14.0   1:24.45 java
24983 admin     20   0 6597m 2.2g  13m S  1.0 14.0   1:19.34 java
24988 admin     20   0 6597m 2.2g  13m S  1.0 14.0   1:19.77 java
22284 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:31.79 java
22312 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:31.20 java
 2140 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:14.60 java
 2155 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:15.03 java
 2163 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:14.08 java
 2164 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:14.07 java
 2179 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:14.63 java
 2190 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:13.74 java
...
top - 15:54:39 up 250 days,  2:05,  4 users,  load average: 4.59, 4.63, 4.34
Tasks: 407 total,   1 running, 406 sleeping,   0 stopped,   0 zombie
Cpu(s): 28.2%us,  1.8%sy,  0.3%ni, 67.8%id,  0.3%wa,  0.0%hi,  1.5%si,  0.0%st
Mem:  16467476k total, 16374164k used,    93312k free,    35972k buffers
Swap:        0k total,        0k used,        0k free, 12311292k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
21342 admin     20   0 6597m 2.2g  13m S  9.6 14.0  10:04.36 java
21438 admin     20   0 6597m 2.2g  13m S  3.6 14.0   3:19.84 java
 6536 admin     20   0 6597m 2.2g  13m S  2.0 14.0   0:09.53 java
21700 admin     20   0 6597m 2.2g  13m S  1.7 14.0   1:25.40 java
21797 admin     20   0 6597m 2.2g  13m S  1.7 14.0   1:24.73 java
23676 admin     20   0 6597m 2.2g  13m S  1.7 14.0   1:22.26 java
27570 admin     20   0 6597m 2.2g  13m S  1.7 14.0   1:15.07 java
 5166 admin     20   0 6597m 2.2g  13m S  1.7 14.0   0:10.88 java
 6487 admin     20   0 6597m 2.2g  13m S  1.7 14.0   0:09.49 java
21520 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:26.83 java
21693 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:25.55 java
21701 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:25.41 java
21792 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:25.40 java
21793 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:25.22 java
22297 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:23.30 java
22301 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:24.24 java
27537 admin     20   0 6597m 2.2g  13m S  1.3 14.0   1:15.04 java
```

可以看到，最消耗cpu资源是 `21342` `21438` `21666`

将这个线程转换成HEX

```
21342 => 535E
21438 => 53BE
```

不过我没有找到HEX格式的线程号，在 `jstack.out` 中却可以找到10进制的线程

```
Attaching to process ID 21284, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.102-b46
Deadlock Detection:

No deadlocks found.

Thread 6190: (state = BLOCKED)
 - sun.misc.Unsafe.park(boolean, long) @bci=0 (Compiled frame; information may be imprecise)
 - java.util.concurrent.locks.LockSupport.parkNanos(java.lang.Object, long) @bci=20, line=215 (Compiled frame)
 - java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(long) @bci=78, line=2078 (Compiled frame)
 - java.util.concurrent.LinkedBlockingQueue.poll(long, java.util.concurrent.TimeUnit) @bci=62, line=467 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=86 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=32 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.getTask() @bci=134, line=1066 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.runWorker(java.util.concurrent.ThreadPoolExecutor$Worker) @bci=26, line=1127 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor$Worker.run() @bci=5, line=617 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run() @bci=4, line=61 (Compiled frame)
 - java.lang.Thread.run() @bci=11, line=766 (Compiled frame)


Thread 6189: (state = BLOCKED)
 - sun.misc.Unsafe.park(boolean, long) @bci=0 (Compiled frame; information may be imprecise)
 - java.util.concurrent.locks.LockSupport.parkNanos(java.lang.Object, long) @bci=20, line=215 (Compiled frame)
 - java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(long) @bci=78, line=2078 (Compiled frame)
 - java.util.concurrent.LinkedBlockingQueue.poll(long, java.util.concurrent.TimeUnit) @bci=62, line=467 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=86 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskQueue.poll(long, java.util.concurrent.TimeUnit) @bci=3, line=32 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.getTask() @bci=134, line=1066 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor.runWorker(java.util.concurrent.ThreadPoolExecutor$Worker) @bci=26, line=1127 (Compiled frame)
 - java.util.concurrent.ThreadPoolExecutor$Worker.run() @bci=5, line=617 (Compiled frame)
 - org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run() @bci=4, line=61 (Compiled frame)
 - java.lang.Thread.run() @bci=11, line=766 (Compiled frame)
```

对应 `top -H -b -p 21284` 中的

```
...
 6190 admin     20   0 6597m 2.2g  13m S  0.7 14.0   0:09.97 java
...
 6189 admin     20   0 6597m 2.2g  13m S  1.0 14.0   0:09.78 java
```

参考 [WAITING at sun.misc.Unsafe.park(Native Method)](http://stackoverflow.com/questions/24241335/waiting-at-sun-misc-unsafe-parknative-method) 

`unsafe.park`非常类似`thread.wait`，除非是使用架构特殊代码（这也就是称为`unsafe`的原因）。unsafe不是用于公开的，但是它用于java内部库实现(x86或arm)架构特定代码以提供明显的优化特性。它将使用大量的线程池。由于上述情况，大量的线程在等待，它们并没有实际使用CPU。

不过，我这个案例中`jstack`分析显示没有死锁

[Hundreds of threads stuck in state BLOCKED #9215](https://github.com/hazelcast/hazelcast/issues/9215) 提供了一个debug的方法，就是java启动时候增加

```
Can you enable diagnostics. This is meant to run in production, so it has a very low performance impact (we even have it enabled while doing benchmarking).

-Dhazelcast.diagnostics.enabled=true
-Dhazelcast.diagnostics.metric.level=info
-Dhazelcast.diagnostics.invocation.sample.period.seconds=30
-Dhazelcast.diagnostics.pending.invocations.period.seconds=30
-Dhazelcast.diagnostics.slowoperations.period.seconds=30

On the client side the following parameters need to be added

-Dhazelcast.diagnostics.enabled=true
-Dhazelcast.diagnostics.metric.level=info
```

检查 `tomcat_stdout.log`日志，发现了一个线索，`sun.misc.Unsafe.park(Native Method)`是等待在 `EagleEye-StatLogController-writer-thread-1`

```
"EagleEye-StatLogController-writer-thread-1" #23 daemon prio=5 os_prio=0 tid=0x00007f9cf5e31000 nid=0x5364 waiting on condition [0x00007f9cf5bfc000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
```

开发给了一个转换hex的方法很好：

```
printf "%x\n" 14197
```

输出就是HEX格式，可以看到对应是

```
3775
```

然后就可以在 `tomcat_stdout.log`中搜索 `0x3775` 对应的线程的问题，非常赞

较为完整的案例如下

```
...

"EagleEye-StatLogController-writer-thread-1" #23 daemon prio=5 os_prio=0 tid=0x00007f9cf5e31000 nid=0x5364 waiting on condition [0x00007f9cf5bfc000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x0000000740248bb8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1081)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1067)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1127)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:766)

"EagleEye-AsyncAppender-Thread-TraceLog-atp" #22 daemon prio=5 os_prio=0 tid=0x00007f9cf6230000 nid=0x5363 waiting on condition [0x00007f9cf5cfd000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x0000000740248cf0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2163)
	at com.taobao.eagleeye.AsyncAppender$AsyncRunnable.run(AsyncAppender.java:324)
	at java.lang.Thread.run(Thread.java:766)
```