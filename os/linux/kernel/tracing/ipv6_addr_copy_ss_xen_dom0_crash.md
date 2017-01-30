XEN服务器宕机带外日志

```
2017-01-14 01:04:26	BUG: unable to handle kernel paging request at ffff8802ea75bb00
2017-01-14 01:04:26	IP: [] ipv6_addr_copy+0x9/0x19 [inet_diag]
2017-01-14 01:04:26	PGD 1002067 PUD 53b5067 PMD 5509067 PTE 0
2017-01-14 01:04:26	Oops: 0000 [#1] SMP 
2017-01-14 01:04:26	last sysfs file: /sys/bus/pci/slots/1/address
2017-01-14 01:04:26	CPU 0 
2017-01-14 01:04:26	Modules linked in: xen_blkback_28 havs xen_blkfront xen_blkback_14 hpilo micro_hotfix microcode hotfixes avs_hotfix classic_traceroute xt_CLASSIFY iptable_mangle sch_sfq act_police cls_u32 sch_ingress 8021q garp xt_mac xt_state xt_physdev iptable_filter ip_tables mptctl mptbase tcp_diag inet_diag xen_blkback_2677805 nfnetlink_queue nfnetlink arpt_nfqueue cls_fw sch_htb ebt_mark ebt_arp arptable_filter arp_tables autofs4 ipmi_devintf ipmi_si ipmi_msghandler ebtable_filter ebtable_nat bonding ipv6 fuse xen_netback xen_blkback blktap blkback_pagemap loop xenfs dm_multipath video output sbs sbshc parport_pc lp parport turbo_proxy slb_ctk_proxy ruleset patch_cksum nf_conntrack_ipv4 nf_defrag_ipv4 nf_conntrack flow_mark flow_ctk vpc_session dodiv_hotfix pre_hotfix hotfix_info(P) ebt_fnat ebtable_broute ebtables bridge stp llc slb_ctk_session igb hpwdt ses serio_raw enclosure dca snd_seq_dummy snd_seq_oss snd_seq_midi_event snd_seq snd_seq_device ahci snd_pcm_oss snd_mixer_oss snd_pcm snd_timer snd soundcore snd_page_alloc pcspkr shpchp virtio_pci virtio_ring virtio_blk virtio raid456 async_raid6_recov async_pq raid6_pq async_xor xor async_memcpy async_tx raid10 raid1 raid0 mpt2sas raid_class hpsa cciss [last unloaded: khotfix_q4wi5m8m]
2017-01-14 01:04:26	Pid: 29755, comm: ss Tainted: P        W  2.6.32.36-xen #1 ProLiant DL380p Gen8
2017-01-14 01:04:26	RIP: e030:[]  [] ipv6_addr_copy+0x9/0x19 [inet_diag]
2017-01-14 01:04:27	RSP: e02b:ffff88005b77d8e8  EFLAGS: 00010246
2017-01-14 01:04:27	RAX: 0000000000000000 RBX: ffff88000f2eab68 RCX: 0000000e43924da9
2017-01-14 01:04:27	RDX: ffff88047f036ec0 RSI: ffff8802ea75bb00 RDI: ffff88000f2eab70
2017-01-14 01:04:27	RBP: ffff88005b77d8e8 R08: 0000000000000000 R09: 0000000000000000
2017-01-14 01:04:27	R10: 000000000001e240 R11: 000000000000743b R12: ffff8802ea74d480
2017-01-14 01:04:27	R13: ffff88000f2eab58 R14: ffff880281382a20 R15: ffff88044cc58000
2017-01-14 01:04:27	FS:  00007f3d9d0c86e0(0000) GS:ffff880028039000(0000) knlGS:0000000000000000
2017-01-14 01:04:27	CS:  e033 DS: 0000 ES: 0000 CR0: 000000008005003b
2017-01-14 01:04:27	CR2: ffff8802ea75bb00 CR3: 00000004568ae000 CR4: 0000000000002660
2017-01-14 01:04:27	DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
2017-01-14 01:04:27	DR3: 0000000000000000 DR6: 00000000ffff0ff0 DR7: 0000000000000400
2017-01-14 01:04:27	Process ss (pid: 29755, threadinfo ffff88005b77c000, task ffff880436e2c4a0)
2017-01-14 01:04:27	Stack:
2017-01-14 01:04:27	ffff88005b77d9e8 ffffffffa00741fa ffffffff81396824 0000000000000200
2017-01-14 01:04:27	<0> ffff88000f2ea000 ffff88047ae08700 000000040000000b 0000000000000000
2017-01-14 01:04:27	<0> ffff8800a7a1ac10 ffffffffa00e6070 ffffffff8188fe40 ffffffff8188ff30
2017-01-14 01:04:27	Call Trace:
2017-01-14 01:04:27	[] inet_diag_dump+0x3c8/0x7ca [inet_diag]
2017-01-14 01:04:27	[] ? alloc_skb+0x13/0x15
2017-01-14 01:04:27	[] ? __alloc_skb+0xb4/0x171
2017-01-14 01:04:27	[] ? need_resched+0x23/0x2d
2017-01-14 01:04:27	[] ? should_resched+0xe/0x2f
2017-01-14 01:04:27	[] netlink_dump+0x60/0x1a3
2017-01-14 01:04:27	[] ? _cond_resched+0xe/0x22
2017-01-14 01:04:27	[] ? inet_diag_dump+0x0/0x7ca [inet_diag]
2017-01-14 01:04:27	[] netlink_dump_start+0xd8/0xf1
2017-01-14 01:04:27	[] ? inet_diag_rcv_msg+0x0/0x393 [inet_diag]
2017-01-14 01:04:27	[] inet_diag_rcv_msg+0x164/0x393 [inet_diag]
2017-01-14 01:04:27	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:27	[] ? alloc_skb+0x13/0x15
2017-01-14 01:04:27	[] ? inet_diag_rcv_msg+0x0/0x393 [inet_diag]
2017-01-14 01:04:27	[] netlink_rcv_skb+0x43/0x93
2017-01-14 01:04:27	[] inet_diag_rcv+0x2c/0x3c [inet_diag]
2017-01-14 01:04:27	[] netlink_unicast+0xef/0x156
2017-01-14 01:04:27	[] netlink_sendmsg+0x24a/0x25d
2017-01-14 01:04:27	[] ? xen_restore_fl_direct_end+0x0/0x1
2017-01-14 01:04:27	[] __sock_sendmsg+0x5e/0x67
2017-01-14 01:04:27	[] sock_sendmsg+0xcc/0xe5
2017-01-14 01:04:27	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:28	[] ? autoremove_wake_function+0x0/0x3d
2017-01-14 01:04:28	[] ? get_phys_to_machine+0x32/0x4e
2017-01-14 01:04:28	[] ? pfn_to_mfn+0x17/0x34
2017-01-14 01:04:28	[] ? pte_pfn_to_mfn+0x29/0x55
2017-01-14 01:04:28	[] ? xen_make_pte+0x88/0x92
2017-01-14 01:04:28	[] ? move_addr_to_kernel+0x45/0x4e
2017-01-14 01:04:28	[] ? verify_iovec+0x54/0x9f
2017-01-14 01:04:28	[] sys_sendmsg+0x1e6/0x255
2017-01-14 01:04:28	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:28	[] ? check_events+0x12/0x20
2017-01-14 01:04:28	[] ? inotify_d_instantiate+0x20/0x4b
2017-01-14 01:04:28	[] ? __d_instantiate+0x66/0x6b
2017-01-14 01:04:28	[] ? security_d_instantiate+0x24/0x26
2017-01-14 01:04:28	[] ? d_instantiate+0x48/0x4d
2017-01-14 01:04:28	[] ? sock_attach_fd+0x9d/0xc8
2017-01-14 01:04:28	[] ? sock_map_fd+0x62/0x70
2017-01-14 01:04:28	[] system_call_fastpath+0x16/0x1b
2017-01-14 01:04:28	Code: 46 08 88 d0 44 8b 45 c8 45 29 e0 49 63 c8 f3 aa 48 83 c4 18 48 89 f0 5b 41 5c 41 5d 41 5e 41 5f c9 c3 55 48 89 e5 0f 1f 44 00 00 <48> 8b 06 48 89 07 48 8b 46 08 48 89 47 08 c9 c3 55 48 89 e5 0f 
2017-01-14 01:04:28	RIP  [] ipv6_addr_copy+0x9/0x19 [inet_diag]
2017-01-14 01:04:28	RSP 
2017-01-14 01:04:28	CR2: ffff8802ea75bb00
2017-01-14 01:04:28	---[ end trace 45abe39fa9297c06 ]---
2017-01-14 01:04:28	Kernel panic - not syncing: Fatal exception in interrupt
2017-01-14 01:04:28	Pid: 29755, comm: ss Tainted: P      D W  2.6.32.36-xen #1
2017-01-14 01:04:28	Call Trace:
2017-01-14 01:04:28	[] panic+0xe0/0x19f
2017-01-14 01:04:28	[] ? mce_cpu_callback+0x181/0x18e
2017-01-14 01:04:28	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:28	[] ? check_events+0x12/0x20
2017-01-14 01:04:28	[] ? xen_restore_fl_direct_end+0x0/0x1
2017-01-14 01:04:28	[] ? print_oops_end_marker+0x23/0x25
2017-01-14 01:04:28	[] oops_end+0xb6/0xc6
2017-01-14 01:04:28	[] no_context+0x205/0x214
2017-01-14 01:04:28	[] ? xen_pte_val+0x69/0x73
2017-01-14 01:04:28	[] __bad_area_nosemaphore+0x183/0x1a6
2017-01-14 01:04:28	[] bad_area_nosemaphore+0x13/0x15
2017-01-14 01:04:28	[] do_page_fault+0x163/0x288
2017-01-14 01:04:28	[] page_fault+0x25/0x30
2017-01-14 01:04:28	[] ? ipv6_addr_copy+0x9/0x19 [inet_diag]
2017-01-14 01:04:28	[] inet_diag_dump+0x3c8/0x7ca [inet_diag]
2017-01-14 01:04:29	[] ? alloc_skb+0x13/0x15
2017-01-14 01:04:29	[] ? __alloc_skb+0xb4/0x171
2017-01-14 01:04:29	[] ? need_resched+0x23/0x2d
2017-01-14 01:04:29	[] ? should_resched+0xe/0x2f
2017-01-14 01:04:29	[] netlink_dump+0x60/0x1a3
2017-01-14 01:04:29	[] ? _cond_resched+0xe/0x22
2017-01-14 01:04:29	[] ? inet_diag_dump+0x0/0x7ca [inet_diag]
2017-01-14 01:04:29	[] netlink_dump_start+0xd8/0xf1
2017-01-14 01:04:29	[] ? inet_diag_rcv_msg+0x0/0x393 [inet_diag]
2017-01-14 01:04:29	[] inet_diag_rcv_msg+0x164/0x393 [inet_diag]
2017-01-14 01:04:29	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:29	[] ? alloc_skb+0x13/0x15
2017-01-14 01:04:29	[] ? inet_diag_rcv_msg+0x0/0x393 [inet_diag]
2017-01-14 01:04:29	[] netlink_rcv_skb+0x43/0x93
2017-01-14 01:04:29	[] inet_diag_rcv+0x2c/0x3c [inet_diag]
2017-01-14 01:04:29	[] netlink_unicast+0xef/0x156
2017-01-14 01:04:29	[] netlink_sendmsg+0x24a/0x25d
2017-01-14 01:04:29	[] ? xen_restore_fl_direct_end+0x0/0x1
2017-01-14 01:04:29	[] __sock_sendmsg+0x5e/0x67
2017-01-14 01:04:29	[] sock_sendmsg+0xcc/0xe5
2017-01-14 01:04:29	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:29	[] ? autoremove_wake_function+0x0/0x3d
2017-01-14 01:04:29	[] ? get_phys_to_machine+0x32/0x4e
2017-01-14 01:04:29	[] ? pfn_to_mfn+0x17/0x34
2017-01-14 01:04:29	[] ? pte_pfn_to_mfn+0x29/0x55
2017-01-14 01:04:29	[] ? xen_make_pte+0x88/0x92
2017-01-14 01:04:29	[] ? move_addr_to_kernel+0x45/0x4e
2017-01-14 01:04:29	[] ? verify_iovec+0x54/0x9f
2017-01-14 01:04:29	[] sys_sendmsg+0x1e6/0x255
2017-01-14 01:04:29	[] ? xen_force_evtchn_callback+0xd/0xf
2017-01-14 01:04:29	[] ? check_events+0x12/0x20
2017-01-14 01:04:29	[] ? inotify_d_instantiate+0x20/0x4b
2017-01-14 01:04:29	[] ? __d_instantiate+0x66/0x6b
2017-01-14 01:04:29	[] ? security_d_instantiate+0x24/0x26
2017-01-14 01:04:29	[] ? d_instantiate+0x48/0x4d
2017-01-14 01:04:29	[] ? sock_attach_fd+0x9d/0xc8
2017-01-14 01:04:29	[] ? sock_map_fd+0x62/0x70
2017-01-14 01:04:29	[] system_call_fastpath+0x16/0x1b
2017-01-14 01:04:30	(XEN) Domain 0 crashed: 'noreboot' set - not rebooting.
```

从上述Call Trace可以看出，导致系统crash的内核函数是`ipv6_addr_copy`，而触发这个内核函数的程序是`ss`（可以从`Pid: 29755, comm: ss Tainted: P        W  2.6.32.36-xen #1 ProLiant DL380p Gen8`看到）。

通常修复内核bug的方法是补丁内核后需要重启操作系统（如果不能hotfix的话）。不过，考虑到线上运行系统重启涉及到应用迁移，有时候大量的服务器重启代价非常大，考虑实际网络环境中并没有使用IPv6协议，所以可以通过[Linux动态关闭IPv6](../net/disable_ipv6_on_linux)尝试绕开这个bug缺陷。

# 设置core dump

> 参考 [获取内核core dump](get_core_dump)

* 
