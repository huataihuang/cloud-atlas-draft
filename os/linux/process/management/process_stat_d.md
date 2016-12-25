线上服务器出现`[xenwatch]`进程状态进入`D`状态，通常这个问题是由于磁盘（包括虚拟机磁盘）故障导致进程进入不可中断的睡眠状态。

```
$ps aux | grep D
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root        39  0.0  0.0      0     0 ?        D     2015   1:22 [xenwatch]
root        83  0.2  0.0      0     0 ?        D     2015 2161:41 [kswapd0]
root       132  0.0  0.0      0     0 ?        D     2015   0:00 [fw_event0]
```

检查这3个`D`状态进程的堆栈：

```
$sudo cat /proc/39/stack
[<ffffffff810d237c>] sync_page+0x49/0x4d
[<ffffffff810d2518>] wait_on_page_bit+0x74/0x7b
[<ffffffff810dc03a>] wait_on_page_writeback+0x27/0x2c
[<ffffffff810dc86b>] shrink_page_list+0x125/0x598
[<ffffffff810dd137>] shrink_list+0x459/0x5f5
[<ffffffff810dd598>] shrink_zone+0x2c5/0x374
[<ffffffff810dda13>] do_try_to_free_pages+0x18d/0x310
[<ffffffff810ddcba>] try_to_free_pages+0x89/0x98
[<ffffffff810d7677>] __alloc_pages_nodemask+0x371/0x5b0
[<ffffffff810d78d2>] __get_free_pages+0x1c/0x64
[<ffffffff81102aaa>] __kmalloc+0x3c/0x130
[<ffffffff813a0ea4>] kzalloc+0x14/0x16
[<ffffffff813a505f>] alloc_netdev_mq+0x60/0x1d0
[<ffffffffa03eaa61>] xenvif_alloc+0x66/0x295 [xen_netback]
[<ffffffffa03e94f4>] backend_create_xenvif+0x5a/0x9c [xen_netback]
[<ffffffffa03e9f3c>] netback_probe+0x176/0x1e7 [xen_netback]
[<ffffffff8129cfad>] xenbus_dev_probe+0x85/0xff
[<ffffffff812daca0>] driver_probe_device+0xb7/0x13b
[<ffffffff812dadc8>] __device_attach+0x28/0x31
[<ffffffff812d9f8c>] bus_for_each_drv+0x4f/0x82
[<ffffffff812dae5c>] device_attach+0x62/0x79
[<ffffffff812d9f26>] bus_probe_device+0x24/0x3b
[<ffffffff812d87b5>] device_add+0x421/0x5a3
[<ffffffff812d8955>] device_register+0x1e/0x22
[<ffffffff8129c8a3>] xenbus_probe_node+0x131/0x1ba
[<ffffffff8129ca79>] xenbus_dev_changed+0x14d/0x16b
[<ffffffff8129d0f0>] backend_changed+0x1b/0x1d
[<ffffffff8129c40c>] xenwatch_thread+0xef/0x11b
[<ffffffff810755db>] kthread+0x6e/0x76
[<ffffffff81013daa>] child_rip+0xa/0x20
[<ffffffffffffffff>] 0xffffffffffffffff
```

```
$sudo cat /proc/83/stack
[<ffffffff81212c0c>] get_request_wait+0xe4/0x156
[<ffffffff81216a0f>] __make_request+0x2f2/0x3b3
[<ffffffff812118c8>] generic_make_request+0x1e8/0x284
[<ffffffff81212e20>] submit_bio+0xbf/0xc8
[<ffffffff81132894>] submit_bh+0x120/0x143
[<ffffffff8113501e>] __block_write_full_page+0x216/0x31b
[<ffffffff811351a9>] block_write_full_page_endio+0x86/0x93
[<ffffffff811351cb>] block_write_full_page+0x15/0x17
[<ffffffff8118d164>] ext4_writepage+0x217/0x224
[<ffffffff810dca56>] shrink_page_list+0x310/0x598
[<ffffffff810dd0bf>] shrink_list+0x3e1/0x5f5
[<ffffffff810dd598>] shrink_zone+0x2c5/0x374
[<ffffffff810de0ef>] kswapd+0x39e/0x4fb
[<ffffffff810755db>] kthread+0x6e/0x76
[<ffffffff81013daa>] child_rip+0xa/0x20
[<ffffffffffffffff>] 0xffffffffffffffff
```

```
$sudo cat /proc/132/stack
[<ffffffff812194c0>] blk_execute_rq+0xad/0xd1
[<ffffffff812e7b76>] scsi_execute+0xde/0x12e
[<ffffffff812e7c93>] scsi_execute_req+0xcd/0xf2
[<ffffffff812f2169>] sd_sync_cache+0x7f/0xc4
[<ffffffff812f2246>] sd_shutdown+0x98/0x11d
[<ffffffff812f2324>] sd_remove+0x59/0x8d
[<ffffffff812daa5a>] __device_release_driver+0x66/0xac
[<ffffffff812daac3>] device_release_driver+0x23/0x30
[<ffffffff812da6eb>] bus_remove_device+0x88/0x97
[<ffffffff812d829c>] device_del+0x133/0x176
[<ffffffff812ec07e>] __scsi_remove_device+0x52/0x9d
[<ffffffff812ec0ef>] scsi_remove_device+0x26/0x33
[<ffffffff812ec186>] __scsi_remove_target+0x8a/0xd5
[<ffffffff812ec241>] __remove_child+0x23/0x2a
[<ffffffff812d7943>] device_for_each_child+0x37/0x6a
[<ffffffff812ec211>] scsi_remove_target+0x40/0x4d
[<ffffffff812eff9a>] sas_rphy_remove+0x2b/0x53
[<ffffffff812effd8>] sas_rphy_delete+0x16/0x23
[<ffffffff812f000f>] sas_port_delete+0x2a/0xfe
[<ffffffffa00519e2>] mpt2sas_transport_port_remove+0x1a2/0x1c0 [mpt2sas]
[<ffffffffa00484f0>] _scsih_remove_device+0xf0/0x120 [mpt2sas]
[<ffffffffa0050e0e>] _firmware_event_work+0xfde/0x1510 [mpt2sas]
[<ffffffff8107167e>] worker_thread+0x14c/0x1eb
[<ffffffff810755db>] kthread+0x6e/0x76
[<ffffffff81013daa>] child_rip+0xa/0x20
[<ffffffffffffffff>] 0xffffffffffffffff
```

检查`/var/log/messages` 显示虚拟磁盘变化时候xenwatch分配内存出现问题

```
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8802c8ea26c0 248:1 w], state=Closing
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : blkback.1192.xv[31462] blkif_schedule: blkback.1192.xv: exiting, blkif=ffff8801aadc81c0
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8802c8ea26c0 248:1 w], state=Closed
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8804d9950b00 248:0 w], state=Closing
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : blkback.1192.hd[31452] blkif_schedule: blkback.1192.hd: exiting, blkif=ffff8801aadc9c00
Dec 12 04:00:11 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8804d9950b00 248:0 w], state=Closed
Dec 12 04:00:13 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8804d9950b00 248:0 w], state=Unknown
Dec 12 04:00:13 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff8802c8ea26c0 248:1 w], state=Unknown
Dec 12 04:00:13 nu8a10533.cloud.nu16 kernel: : kxenbus-dc-1192[29955] blkback_remove: blkback_remove, be=[ffff8804d9950b00 248:0 w]
Dec 12 04:00:13 nu8a10533.cloud.nu16 kernel: : kxenbus-dc-1192[29956] blkback_remove: blkback_remove, be=[ffff8802c8ea26c0 248:1 w]
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_device_destroy: 28: destroy device, users=0, tap=[ffff88005e83f800 storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10958923.conf} 248:0 inuse=11e]
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_ring_destroy: sending tapdisk close message.
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_control_destroy_device: blktap_control_destroy_device: inuse: 0x10e, dev_inuse: 0x10e
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_ring_vm_close: 28: unmapping ring 0
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_ring_destroy: sending tapdisk close message.
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_ring_release: 28: freeing device 0
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_control_destroy_device: blktap_control_destroy_device: inuse: 0x106, dev_inuse: 0x106
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30263] blktap_sysfs_destroy: tap=[ffff88005e83f800 storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10958923.conf} 0:0 inuse=102]
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30278] blktap_device_destroy: 28: destroy device, users=0, tap=[ffff88003f8f6800 storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10907147.conf} 248:1 inuse=11e]
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30278] blktap_ring_destroy: sending tapdisk close message.
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30278] blktap_control_destroy_device: blktap_control_destroy_device: inuse: 0x10e, dev_inuse: 0x10e
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_ring_vm_close: 28: unmapping ring 1
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_ring_release: 28: freeing device 1
Dec 12 04:00:14 nu8a10533.cloud.nu16 kernel: : xend[30278] blktap_sysfs_destroy: tap=[ffff88003f8f6800 storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10907147.conf} 0:1 inuse=102]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29932] blktap_sysfs_create: adding attributes for dev ffff88042587f200, tap=[ffff88005e83f800  0:0 inuse=2]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29932] blktap_control_allocate_tap: 28: allocated tap ffff88005e83f800
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_ring_open: 28: opening device blktap0
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_ring_open: 28: opened device 0
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_ring_mmap: 28: blktap: mapping pid is 29937
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_validate_params: storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10958923.conf}: capacity: 41943040, sector-size: 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_validate_params: storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10958923.conf}: capacity: 41943040, sector-size: 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_device_create: 28: minor 0 sectors 41943040 sector-size 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29937] blktap_device_create: 28: creation of 248:0: 0
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] blkback_probe: blkback_probe ok, be=[ffff88031e1d6900 0:0 <NULL>]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, be=[ffff88031e1d6900 0:0 <NULL>]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff88031e1d6900 0:0 <NULL>], state=Initialising
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29934] blktap_sysfs_create: adding attributes for dev ffff88004a883c00, tap=[ffff88003f8f6800  0:1 inuse=2]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29934] blktap_control_allocate_tap: 28: allocated tap ffff88003f8f6800
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_ring_open: 28: opening device blktap1
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_ring_open: 28: opened device 1
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_ring_mmap: 28: blktap: mapping pid is 29938
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_validate_params: storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10907147.conf}: capacity: 419430400, sector-size: 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_validate_params: storage_vhd:{conf:/guest/i-25p34ix9r/conf/2019-10907147.conf}: capacity: 419430400, sector-size: 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_device_create: 28: minor 1 sectors 419430400 sector-size 512
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : td_connector[29938] blktap_device_create: 28: creation of 248:1: 0
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] blkback_probe: blkback_probe ok, be=[ffff880001ff01c0 0:0 <NULL>]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, be=[ffff880001ff01c0 0:0 <NULL>]
Dec 12 04:00:16 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff880001ff01c0 0:0 <NULL>], state=Initialising
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch: page allocation failure. order:4, mode:0xc0d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Pid: 39, comm: xenwatch Tainted: P        W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen #1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Call Trace:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d782e>] __alloc_pages_nodemask+0x528/0x5b0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d78d2>] __get_free_pages+0x1c/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81102aaa>] __kmalloc+0x3c/0x130
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a0ea4>] kzalloc+0x14/0x16
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a505f>] alloc_netdev_mq+0x60/0x1d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813b5bdc>] ? ether_setup+0x0/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8100f8ef>] ? xen_restore_fl_direct_end+0x0/0x1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81101f08>] ? kfree+0xe0/0xe8
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03eaa61>] xenvif_alloc+0x66/0x295 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e94f4>] backend_create_xenvif+0x5a/0x9c [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e9f3c>] netback_probe+0x176/0x1e7 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d445>] ? read_frontend_details+0x1c/0x1e
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129cfad>] xenbus_dev_probe+0x85/0xff
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812daca0>] driver_probe_device+0xb7/0x13b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dadc8>] __device_attach+0x28/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dada0>] ? __device_attach+0x0/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f8c>] bus_for_each_drv+0x4f/0x82
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dae5c>] device_attach+0x62/0x79
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f26>] bus_probe_device+0x24/0x3b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d87b5>] device_add+0x421/0x5a3
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81227660>] ? kobject_init+0x42/0x6a
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d8955>] device_register+0x1e/0x22
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c8a3>] xenbus_probe_node+0x131/0x1ba
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129ca79>] xenbus_dev_changed+0x14d/0x16b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042e8f>] ? need_resched+0x23/0x2d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042ea7>] ? should_resched+0xe/0x2f
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d0f0>] backend_changed+0x1b/0x1d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c40c>] xenwatch_thread+0xef/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810759aa>] ? autoremove_wake_function+0x0/0x3d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810755db>] kthread+0x6e/0x76
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013daa>] child_rip+0xa/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81012f91>] ? int_ret_from_sys_call+0x7/0x1b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8101371d>] ? retint_restore_args+0x5/0x6
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013da0>] ? child_rip+0x0/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Mem-Info:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  60
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  50
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:  28
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_anon:936473 inactive_anon:118697 isolated_anon:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_file:1179881 inactive_file:1241320 isolated_file:32
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : unevictable:3899 dirty:22279 writeback:233 unstable:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : free:44898 slab_reclaimable:200508 slab_unreclaimable:76976
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : mapped:30578 shmem:5559 pagetables:10342 bounce:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA free:11980kB min:44kB low:52kB high:64kB active_anon:0kB inactive_anon:0kB active_file:0kB inactive_file:0kB unevictable:0kB isolated(anon):0kB isolated(file):0kB present:11760kB mlocked:0kB dirty:0kB writeback:0kB mapped:0kB shmem:0kB slab_reclaimable:0kB slab_unreclaimable:0kB kernel_stack:0kB pagetables:0kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 1947 20757 20757
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 free:84732kB min:7680kB low:9600kB high:11520kB active_anon:231692kB inactive_anon:122548kB active_file:325680kB inactive_file:346728kB unevictable:4kB isolated(anon):0kB isolated(file):0kB present:1993872kB mlocked:4kB dirty:23180kB writeback:568kB mapped:4416kB shmem:308kB slab_reclaimable:305200kB slab_unreclaimable:113456kB kernel_stack:3976kB pagetables:2624kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 18810 18810
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal free:82880kB min:74192kB low:92740kB high:111288kB active_anon:3514200kB inactive_anon:352240kB active_file:4393844kB inactive_file:4618552kB unevictable:15592kB isolated(anon):0kB isolated(file):128kB present:19261708kB mlocked:15592kB dirty:65936kB writeback:364kB mapped:117896kB shmem:21928kB slab_reclaimable:496832kB slab_unreclaimable:194448kB kernel_stack:16856kB pagetables:38744kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 0 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA: 1*4kB 1*8kB 2*16kB 3*32kB 1*64kB 2*128kB 1*256kB 0*512kB 1*1024kB 1*2048kB 2*4096kB = 11980kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32: 3714*4kB 5129*8kB 1732*16kB 28*32kB 5*64kB 0*128kB 0*256kB 0*512kB 0*1024kB 0*2048kB 0*4096kB = 84816kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal: 19173*4kB 239*8kB 23*16kB 17*32kB 5*64kB 0*128kB 1*256kB 1*512kB 0*1024kB 1*2048kB 0*4096kB = 82652kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 2428175 total pagecache pages
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 0 pages in swap cache
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Swap cache stats: add 0, delete 0, find 0/0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Free swap  = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Total swap = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 5406448 pages RAM
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 681724 pages reserved
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 1345603 pages shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 3374453 pages non-shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : alloc_netdev: Unable to allocate device.
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Could not allocate netdev for vif1194.0 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch: page allocation failure. order:4, mode:0xc0d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Pid: 39, comm: xenwatch Tainted: P        W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen #1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Call Trace:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d782e>] __alloc_pages_nodemask+0x528/0x5b0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d78d2>] __get_free_pages+0x1c/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81102aaa>] __kmalloc+0x3c/0x130
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a0ea4>] kzalloc+0x14/0x16
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a505f>] alloc_netdev_mq+0x60/0x1d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813b5bdc>] ? ether_setup+0x0/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8100f8ef>] ? xen_restore_fl_direct_end+0x0/0x1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81101f08>] ? kfree+0xe0/0xe8
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03eaa61>] xenvif_alloc+0x66/0x295 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e94f4>] backend_create_xenvif+0x5a/0x9c [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e9f3c>] netback_probe+0x176/0x1e7 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d445>] ? read_frontend_details+0x1c/0x1e
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129cfad>] xenbus_dev_probe+0x85/0xff
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812daca0>] driver_probe_device+0xb7/0x13b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dadc8>] __device_attach+0x28/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dada0>] ? __device_attach+0x0/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f8c>] bus_for_each_drv+0x4f/0x82
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dae5c>] device_attach+0x62/0x79
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f26>] bus_probe_device+0x24/0x3b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d87b5>] device_add+0x421/0x5a3
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81227660>] ? kobject_init+0x42/0x6a
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d8955>] device_register+0x1e/0x22
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c8a3>] xenbus_probe_node+0x131/0x1ba
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129ca79>] xenbus_dev_changed+0x14d/0x16b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042e8f>] ? need_resched+0x23/0x2d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042ea7>] ? should_resched+0xe/0x2f
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d0f0>] backend_changed+0x1b/0x1d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c40c>] xenwatch_thread+0xef/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810759aa>] ? autoremove_wake_function+0x0/0x3d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810755db>] kthread+0x6e/0x76
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013daa>] child_rip+0xa/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81012f91>] ? int_ret_from_sys_call+0x7/0x1b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8101371d>] ? retint_restore_args+0x5/0x6
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013da0>] ? child_rip+0x0/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Mem-Info:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  60
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:  31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:  30
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_anon:937018 inactive_anon:118915 isolated_anon:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_file:1179727 inactive_file:1241142 isolated_file:32
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : unevictable:3899 dirty:22279 writeback:233 unstable:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : free:44583 slab_reclaimable:200508 slab_unreclaimable:76976
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : mapped:30578 shmem:5886 pagetables:10233 bounce:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA free:11980kB min:44kB low:52kB high:64kB active_anon:0kB inactive_anon:0kB active_file:0kB inactive_file:0kB unevictable:0kB isolated(anon):0kB isolated(file):0kB present:11760kB mlocked:0kB dirty:0kB writeback:0kB mapped:0kB shmem:0kB slab_reclaimable:0kB slab_unreclaimable:0kB kernel_stack:0kB pagetables:0kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 1947 20757 20757
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 free:84776kB min:7680kB low:9600kB high:11520kB active_anon:231692kB inactive_anon:122548kB active_file:325680kB inactive_file:346728kB unevictable:4kB isolated(anon):0kB isolated(file):0kB present:1993872kB mlocked:4kB dirty:23180kB writeback:568kB mapped:4416kB shmem:308kB slab_reclaimable:305200kB slab_unreclaimable:113456kB kernel_stack:3976kB pagetables:2624kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 18810 18810
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal free:81576kB min:74192kB low:92740kB high:111288kB active_anon:3516380kB inactive_anon:353112kB active_file:4393228kB inactive_file:4617840kB unevictable:15592kB isolated(anon):0kB isolated(file):128kB present:19261708kB mlocked:15592kB dirty:65936kB writeback:364kB mapped:117896kB shmem:23236kB slab_reclaimable:496832kB slab_unreclaimable:194448kB kernel_stack:16856kB pagetables:38308kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 0 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA: 1*4kB 1*8kB 2*16kB 3*32kB 1*64kB 2*128kB 1*256kB 0*512kB 1*1024kB 1*2048kB 2*4096kB = 11980kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32: 3698*4kB 5148*8kB 1735*16kB 29*32kB 5*64kB 0*128kB 0*256kB 0*512kB 0*1024kB 0*2048kB 0*4096kB = 84984kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal: 19225*4kB 54*8kB 15*16kB 13*32kB 5*64kB 0*128kB 1*256kB 1*512kB 0*1024kB 1*2048kB 0*4096kB = 81124kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 2427896 total pagecache pages
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 0 pages in swap cache
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Swap cache stats: add 0, delete 0, find 0/0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Free swap  = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Total swap = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 5406448 pages RAM
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 681724 pages reserved
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 1342121 pages shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 3378104 pages non-shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : alloc_netdev: Unable to allocate device.
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Could not allocate netdev for vif1194.0 1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch: page allocation failure. order:4, mode:0xc0d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Pid: 39, comm: xenwatch Tainted: P        W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen #1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Call Trace:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d782e>] __alloc_pages_nodemask+0x528/0x5b0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d78d2>] __get_free_pages+0x1c/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81102aaa>] __kmalloc+0x3c/0x130
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a0ea4>] kzalloc+0x14/0x16
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a505f>] alloc_netdev_mq+0x60/0x1d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813b5bdc>] ? ether_setup+0x0/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8100f8ef>] ? xen_restore_fl_direct_end+0x0/0x1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81101f08>] ? kfree+0xe0/0xe8
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03eaa61>] xenvif_alloc+0x66/0x295 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e94f4>] backend_create_xenvif+0x5a/0x9c [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e9f3c>] netback_probe+0x176/0x1e7 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d445>] ? read_frontend_details+0x1c/0x1e
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129cfad>] xenbus_dev_probe+0x85/0xff
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812daca0>] driver_probe_device+0xb7/0x13b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dadc8>] __device_attach+0x28/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dada0>] ? __device_attach+0x0/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f8c>] bus_for_each_drv+0x4f/0x82
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dae5c>] device_attach+0x62/0x79
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f26>] bus_probe_device+0x24/0x3b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d87b5>] device_add+0x421/0x5a3
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81227660>] ? kobject_init+0x42/0x6a
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d8955>] device_register+0x1e/0x22
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c8a3>] xenbus_probe_node+0x131/0x1ba
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129ca79>] xenbus_dev_changed+0x14d/0x16b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042e8f>] ? need_resched+0x23/0x2d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042ea7>] ? should_resched+0xe/0x2f
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d0f0>] backend_changed+0x1b/0x1d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c40c>] xenwatch_thread+0xef/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810759aa>] ? autoremove_wake_function+0x0/0x3d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810755db>] kthread+0x6e/0x76
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013daa>] child_rip+0xa/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81012f91>] ? int_ret_from_sys_call+0x7/0x1b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8101371d>] ? retint_restore_args+0x5/0x6
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013da0>] ? child_rip+0x0/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Mem-Info:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  30
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:  30
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:  59
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:  29
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  25
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:  19
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:  58
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:  30
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_anon:937018 inactive_anon:118867 isolated_anon:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_file:1179572 inactive_file:1241207 isolated_file:32
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : unevictable:3899 dirty:22279 writeback:233 unstable:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : free:44491 slab_reclaimable:200508 slab_unreclaimable:76976
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : mapped:30578 shmem:6165 pagetables:10233 bounce:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA free:11980kB min:44kB low:52kB high:64kB active_anon:0kB inactive_anon:0kB active_file:0kB inactive_file:0kB unevictable:0kB isolated(anon):0kB isolated(file):0kB present:11760kB mlocked:0kB dirty:0kB writeback:0kB mapped:0kB shmem:0kB slab_reclaimable:0kB slab_unreclaimable:0kB kernel_stack:0kB pagetables:0kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 1947 20757 20757
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 free:84744kB min:7680kB low:9600kB high:11520kB active_anon:231692kB inactive_anon:122792kB active_file:325680kB inactive_file:346728kB unevictable:4kB isolated(anon):0kB isolated(file):0kB present:1993872kB mlocked:4kB dirty:23180kB writeback:568kB mapped:4416kB shmem:552kB slab_reclaimable:305200kB slab_unreclaimable:113456kB kernel_stack:3976kB pagetables:2624kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 18810 18810
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal free:81240kB min:74192kB low:92740kB high:111288kB active_anon:3516380kB inactive_anon:352676kB active_file:4392608kB inactive_file:4618100kB unevictable:15592kB isolated(anon):0kB isolated(file):128kB present:19261708kB mlocked:15592kB dirty:65936kB writeback:364kB mapped:117896kB shmem:24108kB slab_reclaimable:496832kB slab_unreclaimable:194448kB kernel_stack:16856kB pagetables:38308kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 0 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA: 1*4kB 1*8kB 2*16kB 3*32kB 1*64kB 2*128kB 1*256kB 0*512kB 1*1024kB 1*2048kB 2*4096kB = 11980kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32: 3603*4kB 5147*8kB 1735*16kB 29*32kB 5*64kB 0*128kB 0*256kB 0*512kB 0*1024kB 0*2048kB 0*4096kB = 84596kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal: 18797*4kB 135*8kB 35*16kB 13*32kB 5*64kB 0*128kB 1*256kB 1*512kB 0*1024kB 1*2048kB 0*4096kB = 80380kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 2428175 total pagecache pages
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 0 pages in swap cache
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Swap cache stats: add 0, delete 0, find 0/0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Free swap  = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Total swap = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 5406448 pages RAM
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 681724 pages reserved
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 1342524 pages shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 3378107 pages non-shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : alloc_netdev: Unable to allocate device.
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Could not allocate netdev for vif1194.0 2
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, be=[ffff88031e1d6900 0:0 <NULL>]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, after read from xenbus, be=[ffff88031e1d6900 0:0 w]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] vbd_create: Successful creation of handle=0300 (dom=1194)
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] update_blkif_status: Not ready to connect, blkif=ffff8801aadc9180
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch: page allocation failure. order:4, mode:0xc0d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Pid: 39, comm: xenwatch Tainted: P        W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen #1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Call Trace:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d782e>] __alloc_pages_nodemask+0x528/0x5b0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810d78d2>] __get_free_pages+0x1c/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81102aaa>] __kmalloc+0x3c/0x130
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a0ea4>] kzalloc+0x14/0x16
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813a505f>] alloc_netdev_mq+0x60/0x1d0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff813b5bdc>] ? ether_setup+0x0/0x64
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8100f8ef>] ? xen_restore_fl_direct_end+0x0/0x1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81101f08>] ? kfree+0xe0/0xe8
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03eaa61>] xenvif_alloc+0x66/0x295 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e94f4>] backend_create_xenvif+0x5a/0x9c [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffffa03e9f3c>] netback_probe+0x176/0x1e7 [xen_netback]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d445>] ? read_frontend_details+0x1c/0x1e
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129cfad>] xenbus_dev_probe+0x85/0xff
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812daca0>] driver_probe_device+0xb7/0x13b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dadc8>] __device_attach+0x28/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dada0>] ? __device_attach+0x0/0x31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f8c>] bus_for_each_drv+0x4f/0x82
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812dae5c>] device_attach+0x62/0x79
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d9f26>] bus_probe_device+0x24/0x3b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d87b5>] device_add+0x421/0x5a3
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81227660>] ? kobject_init+0x42/0x6a
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff812d8955>] device_register+0x1e/0x22
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c8a3>] xenbus_probe_node+0x131/0x1ba
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129ca79>] xenbus_dev_changed+0x14d/0x16b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042e8f>] ? need_resched+0x23/0x2d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81042ea7>] ? should_resched+0xe/0x2f
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129d0f0>] backend_changed+0x1b/0x1d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c40c>] xenwatch_thread+0xef/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810759aa>] ? autoremove_wake_function+0x0/0x3d
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8129c31d>] ? xenwatch_thread+0x0/0x11b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff810755db>] kthread+0x6e/0x76
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013daa>] child_rip+0xa/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81012f91>] ? int_ret_from_sys_call+0x7/0x1b
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff8101371d>] ? retint_restore_args+0x5/0x6
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : [<ffffffff81013da0>] ? child_rip+0x0/0x20
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Mem-Info:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:    0, btch:   1 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:  31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:  31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:  31
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:  22
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:  52
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal per-cpu:
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    0: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    1: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    2: hi:  186, btch:  31 usd:   2
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    3: hi:  186, btch:  31 usd:   5
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    4: hi:  186, btch:  31 usd:  30
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    5: hi:  186, btch:  31 usd:   0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    6: hi:  186, btch:  31 usd:   5
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : CPU    7: hi:  186, btch:  31 usd:   1
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_anon:936701 inactive_anon:118932 isolated_anon:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : active_file:1179470 inactive_file:1239414 isolated_file:32
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : unevictable:3901 dirty:22372 writeback:233 unstable:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : free:46744 slab_reclaimable:200506 slab_unreclaimable:76974
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : mapped:30655 shmem:5886 pagetables:10239 bounce:0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA free:11980kB min:44kB low:52kB high:64kB active_anon:0kB inactive_anon:0kB active_file:0kB inactive_file:0kB unevictable:0kB isolated(anon):0kB isolated(file):0kB present:11760kB mlocked:0kB dirty:0kB writeback:0kB mapped:0kB shmem:0kB slab_reclaimable:0kB slab_unreclaimable:0kB kernel_stack:0kB pagetables:0kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 1947 20757 20757
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32 free:85968kB min:7680kB low:9600kB high:11520kB active_anon:231676kB inactive_anon:122604kB active_file:325524kB inactive_file:345904kB unevictable:4kB isolated(anon):0kB isolated(file):0kB present:1993872kB mlocked:4kB dirty:22968kB writeback:568kB mapped:4416kB shmem:364kB slab_reclaimable:305200kB slab_unreclaimable:113448kB kernel_stack:3992kB pagetables:2632kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 18810 18810
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal free:89028kB min:74192kB low:92740kB high:111288kB active_anon:3515128kB inactive_anon:353124kB active_file:4392356kB inactive_file:4611752kB unevictable:15600kB isolated(anon):0kB isolated(file):128kB present:19261708kB mlocked:15600kB dirty:66520kB writeback:364kB mapped:118204kB shmem:23180kB slab_reclaimable:496824kB slab_unreclaimable:194448kB kernel_stack:16856kB pagetables:38324kB unstable:0kB bounce:0kB writeback_tmp:0kB pages_scanned:0 all_unreclaimable? no
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : lowmem_reserve[]: 0 0 0 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA: 1*4kB 1*8kB 2*16kB 3*32kB 1*64kB 2*128kB 1*256kB 0*512kB 1*1024kB 1*2048kB 2*4096kB = 11980kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : DMA32: 3736*4kB 5187*8kB 1738*16kB 30*32kB 4*64kB 0*128kB 0*256kB 0*512kB 0*1024kB 0*2048kB 0*4096kB = 85464kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Normal: 20213*4kB 465*8kB 54*16kB 13*32kB 6*64kB 0*128kB 1*256kB 1*512kB 0*1024kB 1*2048kB 0*4096kB = 89052kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 2425900 total pagecache pages
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 0 pages in swap cache
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Swap cache stats: add 0, delete 0, find 0/0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Free swap  = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Total swap = 0kB
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : device 000620 entered promiscuous mode
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : ADDRCONF(NETDEV_UP): 000620: link is not ready
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 5406448 pages RAM
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 681724 pages reserved
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 1341623 pages shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : 3376438 pages non-shared
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : alloc_netdev: Unable to allocate device.
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : Could not allocate netdev for vif1194.1 0
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, be=[ffff880001ff01c0 0:0 <NULL>]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] backend_changed: backend_changed, after read from xenbus, be=[ffff880001ff01c0 0:0 w]
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] vbd_create: Successful creation of handle=ca10 (dom=1194)
Dec 12 04:00:17 nu8a10533.cloud.nu16 kernel: : xenwatch[39] update_blkif_status: Not ready to connect, blkif=ffff8801aadc8380
Dec 12 04:00:18 nu8a10533.cloud.nu16 kernel: : 2016-12-12 04:00:18 ERROR  vport (vport_open_netdev:1555) open vport havs.vp.vlan700 failed: -114
Dec 12 04:00:18 nu8a10533.cloud.nu16 kernel: : device 00109c-I entered promiscuous mode
Dec 12 04:00:18 nu8a10533.cloud.nu16 kernel: : ADDRCONF(NETDEV_UP): 00109c-I: link is not ready
Dec 12 04:00:18 nu8a10533.cloud.nu16 kernel: : 2016-12-12 04:00:18 ERROR  vport (vport_open_netdev:1555) open vport havs.vp.vlan800 failed: -114
Dec 12 04:00:29 nu8a10533.cloud.nu16 kernel: : qemu-dm[30850] blktap_device_ioctl: ioctl 00001261 not supported by Xen blkdev.
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff88031e1d6900 248:0 w], state=Initialised
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect_ring: connect ring, be=[ffff88031e1d6900 248:0 w], otherend=/local/domain/1194/device/vbd/768
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect_ring: 28: ring-ref 8, event-channel 7, protocol 1 (x86_64-abi).
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect: connect, be=[ffff88031e1d6900 248:0 w], otherend=/local/domain/1194/device/vbd/768
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : blkback.1194.hd[32058] blkif_schedule: blkback.1194.hd: started, blkif=ffff8801aadc9180
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff880001ff01c0 248:1 w], state=Initialised
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect_ring: connect ring, be=[ffff880001ff01c0 248:1 w], otherend=/local/domain/1194/device/vbd/51728
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect_ring: 28: ring-ref 9, event-channel 8, protocol 1 (x86_64-abi).
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] connect: connect, be=[ffff880001ff01c0 248:1 w], otherend=/local/domain/1194/device/vbd/51728
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : blkback.1194.xv[32061] blkif_schedule: blkback.1194.xv: started, blkif=ffff8801aadc8380
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff88031e1d6900 248:0 w], state=Connected
Dec 12 04:00:31 nu8a10533.cloud.nu16 kernel: : xenwatch[39] frontend_changed: frontend_changed, be=[ffff880001ff01c0 248:1 w], state=Connected
```