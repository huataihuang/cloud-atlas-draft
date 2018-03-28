在KVM平台运行的虚拟机，有时候突然有出现访问数据库的创建连接超时（500ms以上），但是从物理服务器看，系统负载并没有达到很高的程度。通过cgroup资源隔离，将底层vhost、存储以及vm所使用的CPU隔离及资源平衡后，确实得到了很大的改善。

但是，偶尔还是有个别vm出现抖动，看起来还有尚未彻底解决的因素影响了系统的稳定性。

# 排查

* 虚拟机`ifccustview-1-42` （10.31.109.102）

`dmesg`中可以发现有如下异常的日志：

```
NOHZ: local_softirq_pending 100
hrtimer: interrupt took 2310385 ns
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
```

检查`/var/log/messages`可以看到：

```
Mar  7 22:38:41 ifccustview-1-42 kernel: NOHZ: local_softirq_pending 100
Mar 22 08:38:31 ifccustview-1-42 kernel: NOHZ: local_softirq_pending 100
Mar 25 09:22:12 ifccustview-1-42 kernel: NOHZ: local_softirq_pending 100
```

> 更早的系统messages日志已经轮转消失了

* 虚拟机`ifccustview-1-129` (i-l5sbvnuje6ylfb8i2k72 10.31.108.88) 日志为0，不过也可以从`dmesg`中看到：

```
NOHZ: local_softirq_pending 100
hrtimer: interrupt took 1996427 ns
NOHZ: local_softirq_pending 100
```

* 虚拟机`ifccustview-1-56` (i-l5sa0ftth6wlayi7684f 10.31.109.64) 没有上述`dmesg`信息。不过，根据aone中记录，这个虚拟机的情况似乎不同，当时有staragent发布的问题。

* 虚拟机`ifccustview-1-52` (i-l5sid7ajv83iqeha77zv 10.31.109.95)有类似没有争抢，负载不高，但是依然出现连接抖动

`dmesg`信息

```
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
NOHZ: local_softirq_pending 100
hrtimer: interrupt took 856243 ns
```

对应`messages`日志

```
Mar 26 18:01:55 ifccustview-1-52 kernel: hrtimer: interrupt took 856243 ns
```

* 虚拟机`ifccustview-1-53` (10.31.109.65) 在3月5日有过抖动，发布了autocg之后没有抖动记录

从`messages`日志看3月5日以及之后都没有出现过。由于3月4日之前的messages日志没有了，只能看到dmesg中有 

```
hrtimer: interrupt took 171247 ns
NOHZ: local_softirq_pending 100
```

# 推测

推测autocg发布确实改善了上述出现`hrtimer: interrupt took xxxx ns`以及`NOHZ: local_softirq_pending 100`。但是依然有少量虚拟机在特定情况下依然会触发上述报错，当上述报错出现时，会导致虚拟机网络ping没有延迟，也没有负载变化，但是网络tcp连接出现问题。

这个问题可能需要从虚拟机内核来解决。

# 参考

[NOHZ: local_softirq_pending 100](https://forum.proxmox.com/threads/nohz-local_softirq_pending-100.11855/)提到了 `NOHZ: local_softirq_pending 100` 有可能是Red Hat Kernel 6.2.32 分支的bug。

在 http://www.kubuntuforums.net/showthread.php?49223-Kernel-error-messsage-NOHZ-local_softirq_pending-100 有一个解释：

`NOHZ`补丁包含了一个检查"处理器进入idle时候softirqs pending"的功能。这个BUG和`NOHZ`无关，只不过通过`NOHZ`补丁能够观察到这个现象：

* `t1`线程在CPU#0上运行softirq disabled代码，中断发生，出现了softirq，但是被推迟（deferred）(因为softirqs disabled)
* `t1`线程调用`cond_resched_softirq()`，通过`_local_bh_enable()`调用`schedule()`再次激活so
* 

> `NOHZ`是只是显示了系统存在的问题，具体原因还是要进一步分析

----

在Red Hat官方文档中有一个 [VMware guest hangup and "NOHZ: local_softirq_pending 100" logged](https://access.redhat.com/solutions/1157563) 提示了类似情况