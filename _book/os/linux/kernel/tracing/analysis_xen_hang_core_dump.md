收到告警，线上一台XEN服务器(10.152.132.121)响应缓慢，登录检查果然觉得无比缓慢，随时都可能宕机。

```
[admin@r7ae07353.cloud.cm9:/home/admin]
$top
top - 23:36:57 up 1001 days,  6:25,  1 user,  load average: 33.93, 32.14, 27.21
Tasks: 561 total,   3 running, 557 sleeping,   0 stopped,   1 zombie
Cpu0  : 33.3%us, 33.3%sy,  0.0%ni, 33.3%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu1  :  0.0%us,  0.0%sy,  0.0%ni,100.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  :  0.0%us,  0.0%sy,  0.0%ni,100.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu3  : 33.3%us, 66.7%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu4  : 75.0%us,  0.0%sy,  0.0%ni, 25.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu5  : 25.0%us, 75.0%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu6  : 14.3%us,  0.0%sy,  0.0%ni, 42.9%id, 28.6%wa,  0.0%hi, 14.3%si,  0.0%st
Cpu7  :  0.0%us,  0.0%sy,  0.0%ni, 75.0%id, 25.0%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:  16384000k total, 16195852k used,   188148k free,   187468k buffers
Swap:        0k total,        0k used,        0k free,  7379772k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
 3422 admin     20   0  145m 7304  556 R 100.0  0.0   0:00.43 me
 3038 admin     20   0 13020 1472  816 R 93.9  0.0   0:00.24 top
32463 root      20   0 43576  30m  636 R 93.9  0.2 252:51.09 xenbaked
26825 root      20   0 68752 2888  832 S 47.0  0.0 660:33.05 qemu-dm
 9255 root      20   0 2267m 319m 6696 S 23.5  2.0   7934:03 river_server
12589 root      20   0 2130m 315m 8980 S 23.5  2.0  50684:19 pangu_chunkserv
    1 root      20   0 10364  644  532 S  0.0  0.0 187:37.57 init
    2 root      20   0     0    0    0 S  0.0  0.0   0:00.08 kthreadd
 ```

 > 通过 `iostat -x 1` 检查确认没有io重负载

ipmitool sel list 没有看到明显硬件错误日志
 
大量进程D都和virsh有关
 
```
#ps aux | grep D
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root       541  0.0  0.0 107824  2660 ?        D    22:41   0:00 virsh uri
root       866  0.0  0.0 107824  2676 ?        D    22:41   0:00 /usr/local/bin/virsh list
root      2821  0.0  0.0 107824  2660 ?        D    23:36   0:00 virsh uri
root      3239  0.0  0.0 105776  2660 ?        DN   22:27   0:00 virsh uri
root      3257  0.0  0.0 107824  2680 ?        D    23:36   0:00 /usr/local/bin/virsh list
root      4480  0.0  0.0 107824  2656 ?        D    23:16   0:00 virsh uri
root      5229  0.0  0.0 107824  2676 ?        D    23:16   0:00 /usr/local/bin/virsh list
root     17854  0.0  0.0 107824  2660 ?        D    22:51   0:00 virsh uri
root     18215  0.0  0.0 107824  2680 ?        D    22:51   0:00 /usr/local/bin/virsh list
root     22132  0.0  0.0 107824  2660 ?        D    22:31   0:00 virsh uri
root     22430  0.0  0.0 107824  2680 ?        D    22:31   0:00 /usr/local/bin/virsh list
root     22507  0.0  0.0 107824  2660 ?        D    23:26   0:00 virsh uri
root     22790  0.0  0.0 107824  2680 ?        D    23:26   0:00 /usr/local/bin/virsh list
root     24081  0.0  0.0 107824  2660 ?        D    23:06   0:00 virsh uri
root     24420  0.0  0.0 107824  2680 ?        D    23:06   0:00 /usr/local/bin/virsh list
root     25778  0.0  0.0 107824  2664 ?        D    22:26   0:00 virsh uri
root     27119  0.0  0.0 107824  2660 ?        D    23:21   0:00 virsh uri
root     27389  0.0  0.0 268212  2792 ?        SNl  Dec15   0:31 logagent-collector
root     27465  0.0  0.0 107824  2680 ?        D    23:21   0:00 /usr/local/bin/virsh list
root     27646  0.1  0.1 164908 32560 ?        Dl   23:01   0:03 /opt/tdc/tdc_admin 120412 -1 --remove_snapshot /tmp/remove_snapshot-120412R1YhXZ
root     28744  0.0  0.1 362580 30032 ?        Dl   Dec14   0:31 /usr/local/python/bin/python /opt/houyi/pync/bin/pync-master --config-file=/etc/pync/pync.conf --log-config=/etc/pync/logging.conf
root     28829  0.0  0.0 107824  2676 ?        D    22:46   0:00 /usr/local/bin/virsh list
root     29088  0.0  0.0 107824  2680 ?        D    22:26   0:00 /usr/local/bin/virsh list
root     29130  0.0  0.1 362268 30840 ?        Dl   Dec14   0:27 /usr/local/python/bin/python /opt/houyi/pync/bin/pync-master --config-file=/etc/pync/pync.conf --log-config=/etc/pync/logging.conf
root     29338  0.0  0.0 107824  2660 ?        D    23:01   0:00 virsh uri
root     29650  0.0  0.0 107824  2680 ?        D    23:01   0:00 /usr/local/bin/virsh list
```

被D住进程显示和srcu有关
 
```
#cat /proc/28829/stack
[<ffffffff810795df>] synchronize_srcu+0x23/0x75
[<ffffffff8113d3af>] fsnotify_put_group+0x45/0x6a
[<ffffffff811400cb>] inotify_release+0x2a/0x37
[<ffffffff8110ec5f>] __fput+0x112/0x1b6
[<ffffffff8110f119>] fput+0x1a/0x1c
[<ffffffff8110a1a5>] filp_close+0x6c/0x77
[<ffffffff8110c7e8>] sys_close+0x7d/0xba
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
 

#cat /proc/541/stack
[<ffffffff810795df>] synchronize_srcu+0x23/0x75
[<ffffffff8113d3af>] fsnotify_put_group+0x45/0x6a
[<ffffffff811400cb>] inotify_release+0x2a/0x37
[<ffffffff8110ec5f>] __fput+0x112/0x1b6
[<ffffffff8110f119>] fput+0x1a/0x1c
[<ffffffff8110a1a5>] filp_close+0x6c/0x77
[<ffffffff8110c7e8>] sys_close+0x7d/0xba
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
 

#cat /proc/22507/stack
[<ffffffff810795df>] synchronize_srcu+0x23/0x75
[<ffffffff8113d3af>] fsnotify_put_group+0x45/0x6a
[<ffffffff811400cb>] inotify_release+0x2a/0x37
[<ffffffff8110ec5f>] __fput+0x112/0x1b6
[<ffffffff8110f119>] fput+0x1a/0x1c
[<ffffffff8110a1a5>] filp_close+0x6c/0x77
[<ffffffff8110c7e8>] sys_close+0x7d/0xba
[<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

检查系统messages日志 显示Call Track 和 内核页面请求有关
 
```
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : BUG: unable to handle kernel paging request at ffff880338b65000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : IP: [<ffffffff8113cd8c>] fsnotify_create_event+0x90/0x133
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : PGD 1002067 PUD 4fda067 PMD 51a0067 PTE 0
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Oops: 0000 [#1] SMP
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : last sysfs file: /sys/devices/vbd-774-768/statistics/wr_sect
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : CPU 3
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Modules linked in: bonding_bug_hotfix xen_blkback_28 havs xen_blkfront patch_cksum xen_blkback_14 slb_ctk_proxy avs_hotfix classic_traceroute flow_ctk vpc_session slb_ctk_session ebtable_broute bridge skb_copy xen_blkback_2677805 turbo_proxy hotfixes act_police cls_u32 sch_ingress ipt_REJECT dodiv_hotfix hotfix_info(P) pre_hotfix sch_sfq flow_mark xt_mac xt_CLASSIFY xt_physdev iptable_mangle tcp_diag inet_diag xt_state iptable_filter ip_tables 8021q garp mptctl mptbase nfnetlink_queue nfnetlink arpt_nfqueue cls_fw sch_htb ebt_mark ebt_arp arptable_filter arp_tables autofs4 ipmi_devintf ipmi_si ipmi_msghandler ebtable_filter ebtable_nat stp llc ebtables bonding ipv6 fuse xen_netback xen_blkback blktap blkback_pagemap loop xenfs dm_multipath video output sbs sbshc parport_pc lp parport ruleset nf_conntrack_ipv4 nf_defrag_ipv4 nf_conntrack ebt_fnat wmi igb ses enclosure dca serio_raw snd_seq_dummy snd_seq_oss snd_seq_midi_event snd_seq snd_seq_device snd_pcm_oss snd_mixer_oss snd_pcm snd_timer snd soundcore snd_page_alloc shpchp pcspkr ahci virtio_pci virtio_ring virtio_blk virtio raid456 async_raid6_recov async_pq raid6_pq async_xor xor async_memcpy async_tx raid10 raid1 raid0 mpt2sas raid_class cciss [last unloaded: bonding_lacp_upgrade_hotfix]
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Pid: 17118, comm: tdc_admin Tainted: P        W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen #1 Tecal RH2288 V2-12L
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RIP: e030:[<ffffffff8113cd8c>]  [<ffffffff8113cd8c>] fsnotify_create_event+0x90/0x133
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RSP: e02b:ffff88021ec11dc8  EFLAGS: 00010246
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RAX: 0000000000000000 RBX: ffff88018444a000 RCX: ffffffffffffffef
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RDX: ffff880338b64ff0 RSI: ffff880264f4fd6e RDI: ffff880338b65000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RBP: ffff88021ec11e08 R08: ffffffff8113cd5f R09: ffff8800280a2d00
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : R10: ffff880124b9fdd8 R11: ffff8803bcee5e80 R12: ffff8800126793c0
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : R13: 0000000000000002 R14: ffff88018444a000 R15: ffff880264f4fd60
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : FS:  00002b8cce826440(0000) GS:ffff880028093000(0000) knlGS:0000000000000000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : CS:  e033 DS: 0000 ES: 0000 CR0: 000000008005003b
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : CR2: ffff880338b65000 CR3: 000000021ec52000 CR4: 0000000000002660
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : DR3: 0000000000000000 DR6: 00000000ffff0ff0 DR7: 0000000000000400
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Process tdc_admin (pid: 17118, threadinfo ffff88021ec10000, task ffff880078b4c4a0)
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Stack:
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : ffff88021ec11f48 0800000200000000 ffff8801882ed098 ffff8804335c6c00
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : <0> 0000000000000000 0000000000000002 0000000008000002 ffff8801882ed098
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : <0> ffff88021ec11e78 ffffffff8113c9f2 00000000000000d0 0000000000000000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Call Trace:
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8113c9f2>] fsnotify+0xba/0x11d
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8113cbf0>] __fsnotify_parent+0xa3/0xcd
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8110cf28>] fsnotify_parent+0x17/0x2d
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8110cf92>] fsnotify_modify+0x54/0x75
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff81042e8f>] ? need_resched+0x23/0x2d
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8110dae8>] vfs_write+0xd5/0x10a
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff8110e7fd>] sys_write+0x4c/0x72
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : [<ffffffff81012d72>] system_call_fastpath+0x16/0x1b
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : Code: c2 49 89 46 48 48 85 c0 75 17 48 8b 3d 76 4d 71 00 48 89 de 45 31 f6 e8 f0 4f fc ff e9 9b 00 00 00 fc 48 83 c9 ff 31 c0 48 89 d7 <f2> ae 48 f7 d1 48 ff c9 48 89 4b 50 8b 45 c8 41 83 fd 01 89 43
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RIP  [<ffffffff8113cd8c>] fsnotify_create_event+0x90/0x133
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : RSP <ffff88021ec11dc8>
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : CR2: ffff880338b65000
Dec 16 22:26:02 r7ae07353.cloud.cm9 kernel: : ---[ end trace d095cf305a651089 ]---
```

所以马上尝试触发一次core dump，期望能够在后续作出内核分析

```
echo '/apsara/dump/core_%e.%p' | sudo tee /proc/sys/kernel/core_pattern
echo 1 | sudo tee /proc/sys/kernel/unknown_nmi_panic
echo 1 | sudo tee /proc/sys/kernel/sysrq
echo c | sudo tee /proc/sysrq-trigger
```

带外显示输出

```
2016-12-17 00:21:07	SysRq : Trigger a crash
2016-12-17 00:21:07	BUG: unable to handle kernel NULL pointer dereference at (null)
2016-12-17 00:21:07	IP: [] sysrq_handle_crash+0x16/0x20
2016-12-17 00:21:07	PGD 3a4a44067 PUD 45c06e067 PMD 0 
2016-12-17 00:21:07	Oops: 0002 [#2] SMP 
2016-12-17 00:21:07	last sysfs file: /sys/devices/vbd-774-768/statistics/wr_sect
2016-12-17 00:21:07	CPU 6 
2016-12-17 00:21:07	Modules linked in: bonding_bug_hotfix xen_blkback_28 havs xen_blkfront patch_cksum xen_blkback_14 slb_ctk_proxy avs_hotfix classic_traceroute flow_ctk vpc_session slb_ctk_session ebtable_broute bridge skb_copy xen_blkback_2677805 turbo_proxy hotfixes act_police cls_u32 sch_ingress ipt_REJECT dodiv_hotfix hotfix_info(P) pre_hotfix sch_sfq flow_mark xt_mac xt_CLASSIFY xt_physdev iptable_mangle tcp_diag inet_diag xt_state iptable_filter ip_tables 8021q garp mptctl mptbase nfnetlink_queue nfnetlink arpt_nfqueue cls_fw sch_htb ebt_mark ebt_arp arptable_filter arp_tables autofs4 ipmi_devintf ipmi_si ipmi_msghandler ebtable_filter ebtable_nat stp llc ebtables bonding ipv6 fuse xen_netback xen_blkback blktap blkback_pagemap loop xenfs dm_multipath video output sbs sbshc parport_pc lp parport ruleset nf_conntrack_ipv4 nf_defrag_ipv4 nf_conntrack ebt_fnat wmi igb ses enclosure dca serio_raw snd_seq_dummy snd_seq_oss snd_seq_midi_event snd_seq snd_seq_device snd_pcm_oss snd_mixer_oss snd_pcm snd_timer snd soundcore snd_page_alloc shpchp pcspkr ahci virtio_pci virtio_ring virtio_blk virtio raid456 async_raid6_recov async_pq raid6_pq async_xor xor async_memcpy async_tx raid10 raid1 raid0 mpt2sas raid_class cciss [last unloaded: bonding_lacp_upgrade_hotfix]
2016-12-17 00:21:07	Pid: 25052, comm: tee Tainted: P      D W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen#1 Tecal RH2288 V2-12L
2016-12-17 00:21:07	RIP: e030:[]  [] sysrq_handle_crash+0x16/0x20
2016-12-17 00:21:07	RSP: e02b:ffff8803ac07de68  EFLAGS: 00010096
2016-12-17 00:21:07	RAX: 0000000000000010 RBX: ffffffff816a5620 RCX: 00000000ffff00e5
2016-12-17 00:21:07	RDX: ffff8800280ed000 RSI: 0000000000000000 RDI: 0000000000000063
2016-12-17 00:21:07	RBP: ffff8803ac07de68 R08: 0000000000000001 R09: ffffffff812c0d3e
2016-12-17 00:21:07	R10: 00000000ffff00f5 R11: 0000000000000246 R12: 0000000000000000
2016-12-17 00:21:07	R13: 0000000000000063 R14: 0000000000000000 R15: 000000000000000f
2016-12-17 00:21:07	FS:  00007fbae045e6e0(0000) GS:ffff8800280ed000(0000) knlGS:0000000000000000
2016-12-17 00:21:07	CS:  e033 DS: 0000 ES: 0000 CR0: 000000008005003b
2016-12-17 00:21:07	CR2: 0000000000000000 CR3: 000000020bbf8000 CR4: 0000000000002660
2016-12-17 00:21:07	DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
2016-12-17 00:21:07	DR3: 0000000000000000 DR6: 00000000ffff0ff0 DR7: 0000000000000400
2016-12-17 00:21:07	Process tee (pid: 25052, threadinfo ffff8803ac07c000, task ffff8802048944a0)
2016-12-17 00:21:07	Stack:
2016-12-17 00:21:07	ffff8803ac07dea8 ffffffff812bfde8 0000000000000200 00007fffff5e1020
2016-12-17 00:21:08	<0> 0000000000000002 ffff880233864b40 ffff8803ac07df48 0000000000000002
2016-12-17 00:21:08	<0> ffff8803ac07dec8 ffffffff812bfeb5 ffff8803ca5de900 fffffffffffffffb
2016-12-17 00:21:08	Call Trace:
2016-12-17 00:21:08	[] __handle_sysrq+0xa3/0x135
2016-12-17 00:21:08	[] write_sysrq_trigger+0x3b/0x46
2016-12-17 00:21:08	[] proc_reg_write+0x74/0x8f
2016-12-17 00:21:08	[] vfs_write+0xb0/0x10a
2016-12-17 00:21:08	[] sys_write+0x4c/0x72
2016-12-17 00:21:08	[] system_call_fastpath+0x16/0x1b
2016-12-17 00:21:08	Code: 83 e2 cf f7 d0 83 e0 03 c1 e0 04 09 c2 88 91 e3 35 86 81 c9 c3 55 48 89 e5 0f 1f 44 00 00 c7 05 01 12 51 00 01 00 00 00 0f ae f8  04 25 00 00 00 00 01 c9 c3 55 48 89 e5 0f 1f 44 00 00 8d 47 
2016-12-17 00:21:08	RIP  [] sysrq_handle_crash+0x16/0x20
2016-12-17 00:21:08	RSP 
2016-12-17 00:21:08	CR2: 0000000000000000
2016-12-17 00:21:08	---[ end trace d095cf305a65108a ]---
2016-12-17 00:21:08	Kernel panic - not syncing: Fatal exception
2016-12-17 00:21:08	Pid: 25052, comm: tee Tainted: P      D W  2.6.32.36-houyi.0.2.0.8.release2629463.el5xen#1
2016-12-17 00:21:08	Call Trace:
2016-12-17 00:21:08	[] ? send_prio_char+0x1c/0x9b
2016-12-17 00:21:08	[] panic+0xe0/0x19f
2016-12-17 00:21:08	[] ? mce_cpu_callback+0x181/0x18e
2016-12-17 00:21:08	[] ? xen_force_evtchn_callback+0xd/0xf
2016-12-17 00:21:08	[] ? check_events+0x12/0x20
2016-12-17 00:21:08	[] ? xen_restore_fl_direct_end+0x0/0x1
2016-12-17 00:21:08	[] ? send_prio_char+0x1c/0x9b
2016-12-17 00:21:08	[] ? print_oops_end_marker+0x23/0x25
2016-12-17 00:21:08	[] ? send_prio_char+0x1c/0x9b
2016-12-17 00:21:08	[] oops_end+0xb6/0xc6
2016-12-17 00:21:08	[] no_context+0x205/0x214
2016-12-17 00:21:08	[] ? send_prio_char+0x1c/0x9b
2016-12-17 00:21:08	[] ? check_events+0x12/0x20
2016-12-17 00:21:08	[] __bad_area_nosemaphore+0x183/0x1a6
2016-12-17 00:21:08	[] ? xen_restore_fl_direct_end+0x0/0x1
2016-12-17 00:21:08	[] __bad_area+0x44/0x4d
2016-12-17 00:21:08	[] bad_area+0x13/0x15
2016-12-17 00:21:08	[] do_page_fault+0x1cb/0x288
2016-12-17 00:21:08	[] page_fault+0x25/0x30
2016-12-17 00:21:08	[] ? dom0_write_console+0x18/0x27
2016-12-17 00:21:08	[] ? sysrq_handle_crash+0x16/0x20
2016-12-17 00:21:08	[] ? __sysrq_get_key_op+0xe/0x24
2016-12-17 00:21:08	[] __handle_sysrq+0xa3/0x135
2016-12-17 00:21:08	[] write_sysrq_trigger+0x3b/0x46
2016-12-17 00:21:08	[] proc_reg_write+0x74/0x8f
2016-12-17 00:21:08	[] vfs_write+0xb0/0x10a
2016-12-17 00:21:08	[] sys_write+0x4c/0x72
2016-12-17 00:21:08	[] system_call_fastpath+0x16/0x1b
2016-12-17 00:21:08	(XEN) Domain 0 crashed: 'noreboot' set - not rebooting.
```

这里服务器一直没有重启，所以过一段时间，通过带外reset重启服务器。但是，发现在`/apsara/dump`目录下没有生成core dump
