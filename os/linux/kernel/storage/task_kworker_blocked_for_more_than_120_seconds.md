服务器系统日志连续显示

```
May  8 14:57:25 example_server kernel: INFO: task kworker/88:2:80044 blocked for more than 120 seconds.
May  8 14:57:25 example_server kernel: "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
May  8 14:57:25 example_server kernel: kworker/88:2    D ffff88019bc5e380     0 80044      2 0x00000000
May  8 14:57:25 example_server kernel:  ffff8803c5d87bf0 0000000000000046 ffff88011d666380 ffff8803c5d87fd8
May  8 14:57:25 example_server kernel:  ffff8803c5d87fd8 ffff8803c5d87fd8 ffff88011d666380 ffff8803c5d87d58
May  8 14:57:25 example_server kernel:  ffff8803c5d87d60 7fffffffffffffff ffff88011d666380 ffff8803c5d87dd8
May  8 14:57:25 example_server kernel: Call Trace:
May  8 14:57:25 example_server kernel:  [<ffffffff8163a1c9>] schedule+0x29/0x70
May  8 14:57:25 example_server kernel:  [<ffffffff81637e29>] schedule_timeout+0x209/0x2d0
May  8 14:57:25 example_server kernel:  [<ffffffff8101d165>] ? native_sched_clock+0x35/0x80
May  8 14:57:25 example_server kernel:  [<ffffffff8101d1b9>] ? sched_clock+0x9/0x10
May  8 14:57:25 example_server kernel:  [<ffffffff8163a5a6>] wait_for_completion+0x116/0x170
May  8 14:57:25 example_server kernel:  [<ffffffff810b4b00>] ? wake_up_state+0x20/0x20
May  8 14:57:25 example_server kernel:  [<ffffffff810a15e8>] kthread_create_on_node+0xa8/0x140
May  8 14:57:25 example_server kernel:  [<ffffffff81099ed0>] ? rescuer_thread+0x400/0x400
May  8 14:57:25 example_server kernel:  [<ffffffff810995fa>] create_worker+0xea/0x250
May  8 14:57:25 example_server kernel:  [<ffffffff810998f6>] manage_workers.isra.24+0xf6/0x2d0
May  8 14:57:25 example_server kernel:  [<ffffffff8109a209>] worker_thread+0x339/0x400
May  8 14:57:25 example_server kernel:  [<ffffffff81099ed0>] ? rescuer_thread+0x400/0x400
May  8 14:57:25 example_server kernel:  [<ffffffff810a174f>] kthread+0xcf/0xe0
May  8 14:57:25 example_server kernel:  [<ffffffff810a1680>] ? kthread_create_on_node+0x140/0x140
May  8 14:57:25 example_server kernel:  [<ffffffff81644fd8>] ret_from_fork+0x58/0x90
May  8 14:57:25 example_server kernel:  [<ffffffff810a1680>] ? kthread_create_on_node+0x140/0x140
```

同时在KVM虚拟机中也观察到

```
INFO: task jbd2/vdb5-8:1648 blocked for more than 120 seconds.
      Not tainted 2.6.32-696.3.2.el6.x86_64 #1
echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
INFO: task sadc:30102 blocked for more than 120 seconds.
      Not tainted 2.6.32-696.3.2.el6.x86_64 #1
echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
INFO: task jbd2/vda1-8:327 blocked for more than 120 seconds.
      Not tainted 2.6.32-696.3.2.el6.x86_64 #1
echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
```

> 这个现象和[块设备阻塞事件](task_events_blocked_by_block_device)类似，有可能存在存储异常或内核bug导致写入磁盘性能不足，影响了系统运行。

# 排查建议

* 首先检查内存使用，查看是否内存不足

```
sar -r
```

* 检查CPU使用，如果不是CPU很繁忙，需要检查磁盘使用

```
sar -u
```

* 检查是否有`ioniced`在运行，当这个进程在运行，`idle-class`意味着策略限制，也就是存在大量的IO
* 检查是否是定时任务导致的
* 检查是否内存不足 `cat /proc/buddyinfo`
* 如果使用了某些性能缓慢的存储，例如NFS，需要检查writeback cache是否已经填满导致性能下降。当写缓存满时候，NFS表现性能非常低下并且类似于文件系统故障。
* 检查负载是否过高

# 处理IO缓慢

很多时候，在磁盘或文件系统出现异常时，会出现`task XXXX blocked for more than 120 seconds.`，这种现象在系统负载极高或者IO负载极高时候出现，原因是默认情况下Linux使用40%的可用内存作为文件系统缓存。当达到这个阀值之后，就会将缓存内容刷新到磁盘以实现IO同步。对于刷新数据到磁盘默认设置了120秒作为时间限制。如果IO系统不是足够快速，不能在120秒内完成数据刷新就会出现上述报警。

例如IO子系统响应缓慢，或者有太多的请求需要服务，系统内存就会填满导致上述错误。

可以通过以下内核配置降低刷新脏页阀值版本比，以便能够降低批量刷新数据量，避免120秒无法完成触发上述异常：

```bash
sudo sysctl -w vm.dirty_ratio=10
sudo sysctl -w vm.dirty_background_ratio=5

sudo sysctl -p
```

持久化配置`/etc/sysctl.conf`

```
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10
```

# 背景知识：`kworker`

`kworker`即kernel worker processes，通常执行很多内核任务，例如：

* 缓存回写
* 处理硬件事件(中断、记时器、I/O)
* 很多，很多其他系统任务

要了解某个`kworker`在执行什么工作，可以打印该`kworker`堆栈：

```
sudo cat /proc/<kworker_pid>/stack
```

例如输出：

```
$ cat /proc/$(pgrep -of kworker)/stack
[<ffffffff85c0c705>] acpi_ns_evaluate+0x1bc/0x23a
[<ffffffff85bffe09>] acpi_ev_asynch_execute_gpe_method+0x98/0xff
[<ffffffff85be4e30>] acpi_os_execute_deferred+0x10/0x20
[<ffffffff8588dc21>] process_one_work+0x181/0x370
[<ffffffff8588de5d>] worker_thread+0x4d/0x3a0
[<ffffffff85893f1c>] kthread+0xfc/0x130
[<ffffffff8588de10>] process_one_work+0x370/0x370
[<ffffffff85893e20>] kthread_create_on_node+0x70/0x70
[<ffffffff858791ba>] do_group_exit+0x3a/0xa0
[<ffffffff85e6a2b5>] ret_from_fork+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
```

上述堆栈表明这个`kworker`正在处理ACPI事件，其中关键字`process_one_work`表明正在处理中，处理的是`acpi_os_execute_deferred`事件。

如果显示堆栈如下：

```
[<ffffffff9409a37d>] worker_thread+0xbd/0x400
[<ffffffff940a0355>] kthread+0x125/0x140
[<ffffffff946780c5>] ret_from_fork+0x25/0x30
[<ffffffffffffffff>] 0xffffffffffffffff
```

则表明该`kworker`正在等待工作。

如果kwoker大量消耗了CPU资源，可以通过`echo l > /proc/sysrq-trigger`创建一个backtrace，这样就能够在系统日志中观察问题来源：

```
sysctl -w kernel.sysrq=1
echo l > /proc/sysrq-trigger
```

> 需要先设置`kernel.sysrq=1`以便激活sysrq功能

此外，可以通过 Perf 来统计所有CPU的backtrace:

```
sudo perf record -g -a sleep 10
```

然后分析：

```
sudo perf report
```

# 参考

* [Linux Kernel panic issue: How to fix hung_task_timeout_secs and blocked for more than 120 seconds problem](https://www.blackmoreops.com/2014/09/22/linux-kernel-panic-issue-fix-hung_task_timeout_secs-blocked-120-seconds-problem/)
* [INFO: task blocked for more than 120 seconds.](https://helpful.knobs-dials.com/index.php/INFO:_task_blocked_for_more_than_120_seconds.)
* [kworker blocked for more than 120s - heavy load on SSD](http://lists.infradead.org/pipermail/linux-nvme/2016-July/005524.html)
* [0010451: Crash/Hang after task blocked for more than 120 seconds.](https://bugs.centos.org/view.php?id=10451)
* [Linux keep forking “kworker”](https://unix.stackexchange.com/questions/406305/linux-keep-forking-kworker)