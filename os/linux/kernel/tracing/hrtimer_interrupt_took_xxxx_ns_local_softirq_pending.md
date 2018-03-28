在KVM平台运行的虚拟机，有时候突然有出现访问数据库的创建连接超时（500ms以上），但是从物理服务器看，系统负载并没有达到很高的程度。通过cgroup资源隔离，将底层vhost、存储以及vm所使用的CPU隔离及资源平衡后，确实得到了很大的改善。

但是，偶尔还是有个别vm出现抖动，看起来还有尚未彻底解决的因素影响了系统的稳定性。

# 排查

* 虚拟机日志检查

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
Mar  7 22:38:41 exampleserver-1 kernel: NOHZ: local_softirq_pending 100
Mar 22 08:38:31 exampleserver-1 kernel: NOHZ: local_softirq_pending 100
Mar 25 09:22:12 exampleserver-1 kernel: NOHZ: local_softirq_pending 100
```

## 内核相关

[NOHZ: local_softirq_pending 100](https://forum.proxmox.com/threads/nohz-local_softirq_pending-100.11855/)提到了 `NOHZ: local_softirq_pending 100` 有可能是Red Hat Kernel 6.2.32 分支的bug。

在 http://www.kubuntuforums.net/showthread.php?49223-Kernel-error-messsage-NOHZ-local_softirq_pending-100 有一个解释：

`NOHZ`补丁包含了一个检查"处理器进入idle时候softirqs pending"的功能。这个BUG和`NOHZ`无关，只不过通过`NOHZ`补丁能够观察到这个现象：

* `t1`线程在CPU#0上运行softirq disabled代码，中断发生，出现了softirq，但是被推迟（deferred）(因为softirqs disabled)
* `t1`线程调用`cond_resched_softirq()`，通过`_local_bh_enable()`调用`schedule()`再次激活so
* 

> `NOHZ`是只是显示了系统存在的问题，具体原因还是要进一步分析

----

在Red Hat官方文档中有一个 [VMware guest hangup and "NOHZ: local_softirq_pending 100" logged](https://access.redhat.com/solutions/1157563) 提示了类似情况