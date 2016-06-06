
XEN物理服务器死机，从控制台看到日志都是相同的`events blocked`

```bash
2016-06-01 14:11:13	[35060910.024741] INFO: task events/4:103 blocked for more than 120 seconds.
2016-06-01 14:11:13	[35060910.024744] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
2016-06-01 14:11:13	[35060910.024748] events/4      D 0000000000000000     0   103      2 0x00000000
2016-06-01 14:11:13	[35060910.024754]  ffff88050851db10 0000000000000246 0000000000000000 0000000000000200
2016-06-01 14:11:13	[35060910.024762]  0000000000011200 0000000000016700 ffff880508517088 ffff880508516ad0
2016-06-01 14:11:13	[35060910.024771]  ffff8805088a6040 ffff880508517088 000000040851daa0 0000000929c3d2a9
2016-06-01 14:11:13	[35060910.024779] Call Trace:
2016-06-01 14:11:13	[35060910.024783]  [] ? pvclock_clocksource_read+0x4c/0xe0
2016-06-01 14:11:13	[35060910.024789]  [] ? pvclock_clocksource_read+0x4c/0xe0
2016-06-01 14:11:13	[35060910.024794]  [] ? xen_clocksource_read+0x21/0x30
2016-06-01 14:11:13	[35060910.024800]  [] ? xen_clocksource_get_cycles+0x9/0x10
2016-06-01 14:11:13	[35060910.024805]  [] ? ktime_get_ts+0xb5/0xf0
2016-06-01 14:11:13	[35060910.024810]  [] io_schedule+0x73/0xc0
2016-06-01 14:11:13	[35060910.024815]  [] get_request_wait+0x152/0x300
2016-06-01 14:11:13	[35060910.024821]  [] ? autoremove_wake_function+0x0/0x40
2016-06-01 14:11:13	[35060910.024826]  [] blk_queue_bio+0x9e/0x5f0
2016-06-01 14:11:13	[35060910.024831]  [] ? __alloc_pages_nodemask+0x12f/0x8c0
2016-06-01 14:11:13	[35060910.024840]  [] __generic_make_request+0x1a3/0x360 [bcache]
2016-06-01 14:11:13	[35060910.024846]  [] ? xen_force_evtchn_callback+0xd/0x10
2016-06-01 14:11:13	[35060910.024855]  [] bch_generic_make_request+0x4d/0x160 [bcache]
2016-06-01 14:11:13	[35060910.024865]  [] __bch_submit_bbio+0xd9/0xf0 [bcache]
2016-06-01 14:11:13	[35060910.024874]  [] bch_submit_bbio+0x35/0x40 [bcache]
2016-06-01 14:11:13	[35060910.024884]  [] __bch_btree_node_write+0x2dd/0x4c0 [bcache]
2016-06-01 14:11:13	[35060910.024899]  [] ? btree_node_write_work+0x0/0x60 [bcache]
2016-06-01 14:11:13	[35060910.024908]  [] btree_node_write_work+0x45/0x60 [bcache]
2016-06-01 14:11:13	[35060910.024914]  [] worker_thread+0x14f/0x280
2016-06-01 14:11:13	[35060910.024920]  [] ? autoremove_wake_function+0x0/0x40
2016-06-01 14:11:13	[35060910.024925]  [] ? worker_thread+0x0/0x280
2016-06-01 14:11:13	[35060910.024930]  [] kthread+0x96/0xa0
2016-06-01 14:11:13	[35060910.024935]  [] child_rip+0xa/0x20
2016-06-01 14:11:13	[35060910.024940]  [] ? int_ret_from_sys_call+0x7/0x1b
2016-06-01 14:11:13	[35060910.024945]  [] ? retint_restore_args+0x5/0x6
2016-06-01 14:11:13	[35060910.024950]  [] ? child_rip+0x0/0x20
2016-06-01 14:11:13	[35060910.024954] INFO: task events/5:104 blocked for more than 120 seconds.
2016-06-01 14:11:13	[35060910.024958] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
2016-06-01 14:11:13	[35060910.024962] events/5      D 0000000000000000     0   104      2 0x00000000
2016-06-01 14:11:13	[35060910.024969]  ffff88050851fb10 0000000000000246 0000000000000000 0000000000000010
2016-06-01 14:11:13	[35060910.024977]  0000000000000000 0000000000016700 ffff8805085165f8 ffff880508516040
2016-06-01 14:11:13	[35060910.024985]  ffff8805088b1560 ffff8805085165f8 0000000500000010 0000000929c3d28f
2016-06-01 14:11:13	[35060910.024993] Call Trace:
2016-06-01 14:11:13	[35060910.024997]  [] ? pvclock_clocksource_read+0x4c/0xe0
2016-06-01 14:11:13	[35060910.025003]  [] ? xen_clocksource_read+0x21/0x30
2016-06-01 14:11:13	[35060910.025008]  [] ? xen_clocksource_get_cycles+0x9/0x10
2016-06-01 14:11:13	[35060910.025008]  [] ? ktime_get_ts+0xb5/0xf0
2016-06-01 14:11:13	[35060910.025008]  [] io_schedule+0x73/0xc0
2016-06-01 14:11:13	[35060910.025008]  [] get_request_wait+0x152/0x300
2016-06-01 14:11:13	[35060910.025008]  [] ? autoremove_wake_function+0x0/0x40
2016-06-01 14:11:13	[35060910.025008]  [] blk_queue_bio+0x9e/0x5f0
2016-06-01 14:11:13	[35060910.025008]  [] ? __alloc_pages_nodemask+0x12f/0x8c0
2016-06-01 14:11:14	[35060910.025008]  [] __generic_make_request+0x1a3/0x360 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] ? xen_force_evtchn_callback+0xd/0x10
2016-06-01 14:11:14	[35060910.025008]  [] bch_generic_make_request+0x4d/0x160 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] __bch_submit_bbio+0xd9/0xf0 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] bch_submit_bbio+0x35/0x40 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] __bch_btree_node_write+0x2dd/0x4c0 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] ? btree_node_write_work+0x0/0x60 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] btree_node_write_work+0x45/0x60 [bcache]
2016-06-01 14:11:14	[35060910.025008]  [] worker_thread+0x14f/0x280
2016-06-01 14:11:14	[35060910.025008]  [] ? autoremove_wake_function+0x0/0x40
2016-06-01 14:11:14	[35060910.025008]  [] ? worker_thread+0x0/0x280
2016-06-01 14:11:14	[35060910.025008]  [] kthread+0x96/0xa0
2016-06-01 14:11:14	[35060910.025008]  [] child_rip+0xa/0x20
2016-06-01 14:11:14	[35060910.025008]  [] ? int_ret_from_sys_call+0x7/0x1b
2016-06-01 14:11:14	[35060910.025008]  [] ? retint_restore_args+0x5/0x6
2016-06-01 14:11:14	[35060910.025008]  [] ? child_rip+0x0/0x20
```

从系统日志来看`bch_generic_make_request`表示是`bcache`设备请求的io，此时出现了`blk_queue_bio`阻塞，导致了`get_request_wait`。长时间没有响应（超过120秒）导致系统不断阻塞最后无响应。一种可能是存储设备故障，一种可能是内核bug（可能和bcache有关）。

[Exploring the Linux Storage Path - Tracing block I/O kernel events](https://www.ibm.com/developerworks/community/blogs/58e72888-6340-46ac-b488-d31aa4058e9c/entry/exploring_the_linux_storage_path_tracing_block_i_o_kernel_events?lang=en) 这篇文档介绍了如何跟踪块设备I/O的内核事件，可以参考进行debug。