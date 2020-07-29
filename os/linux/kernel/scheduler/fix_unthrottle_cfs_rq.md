Linux系统日志

```bash
[Tue Jul 21 07:02:43 2020] ------------[ cut here ]------------
[Tue Jul 21 07:02:43 2020] rq->tmp_alone_branch != &rq->leaf_cfs_rq_list
[Tue Jul 21 07:02:43 2020] WARNING: CPU: 11 PID: 0 at kernel/sched/fair.c:368 unthrottle_cfs_rq+0x274/0x290
[Tue Jul 21 07:02:43 2020] Modules linked in: nft_chain_nat_ipv6 nf_conntrack_ipv6 nf_nat_ipv6 xt_statistic ipt_REJECT nf_reject_ipv4 ip_vs_sh ip_vs_wrr ip_vs_rr ip_vs nf_defrag_ipv6 nft_chain_route_ipv4 xt_comment xt_mark xt_nat veth xt_conntrack ipt_MASQUERADE nf_conntrack_netlink nft_counter xt_addrtype nft_compat nft_chain_nat_ipv4 nf_conntrack_ipv4 nf_defrag_ipv4 nf_nat_ipv4 nf_nat nf_conntrack nf_tables nfnetlink br_netfilter bridge stp llc overlay fuse xfs libcrc32c intel_rapl_msr intel_rapl_common nfit libnvdimm crct10dif_pclmul crc32_pclmul cirrus ghash_clmulni_intel drm_kms_helper syscopyarea sysfillrect sysimgblt fb_sys_fops drm joydev virtio_balloon pcspkr i2c_piix4 ip_tables ext4 mbcache jbd2 ata_generic ata_piix libata virtio_net crc32c_intel net_failover virtio_console serio_raw virtio_blk failover
[Tue Jul 21 07:02:43 2020] Features: eBPF/cgroup
[Tue Jul 21 07:02:43 2020] CPU: 11 PID: 0 Comm: swapper/11 Kdump: loaded Not tainted 4.18.0-193.6.3.el8_2.x86_64 #1
[Tue Jul 21 07:02:43 2020] Hardware name: Alibaba Cloud Alibaba Cloud ECS, BIOS 8c24b4c 04/01/2014
[Tue Jul 21 07:02:43 2020] RIP: 0010:unthrottle_cfs_rq+0x274/0x290
[Tue Jul 21 07:02:43 2020] Code: 8a 05 00 e9 ff fe ff ff 31 db 80 3d 0b 5b 2d 01 00 0f 85 cf fe ff ff 48 c7 c7 58 3d c9 ae c6 05 f7 5a 2d 01 01 e8 26 02 fc ff <0f> 0b 48 85 db 0f 85 d2 fe ff ff e9 ac fe ff ff e8 a7 89 05 00 e9
[Tue Jul 21 07:02:43 2020] RSP: 0018:ffff9dffdfac3e70 EFLAGS: 00010082
[Tue Jul 21 07:02:43 2020] RAX: 0000000000000000 RBX: ffff9dfb69998400 RCX: 0000000000000000
[Tue Jul 21 07:02:43 2020] RDX: 000000000000002d RSI: ffffffffaf81af4d RDI: 0000000000000046
[Tue Jul 21 07:02:43 2020] RBP: ffff9dfb38190c00 R08: ffffffffaf81af20 R09: 000000000000002d
[Tue Jul 21 07:02:43 2020] R10: 0000000000000000 R11: 000000008000000b R12: ffff9dffdf9a9c40
[Tue Jul 21 07:02:43 2020] R13: 0000000000000002 R14: 0000000000000001 R15: 0000000000000001
[Tue Jul 21 07:02:43 2020] FS:  0000000000000000(0000) GS:ffff9dffdfac0000(0000) knlGS:0000000000000000
[Tue Jul 21 07:02:43 2020] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[Tue Jul 21 07:02:43 2020] CR2: 00007fb1159234f4 CR3: 000000052760a005 CR4: 00000000003606e0
[Tue Jul 21 07:02:43 2020] DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
[Tue Jul 21 07:02:43 2020] DR3: 0000000000000000 DR6: 00000000fffe0ff0 DR7: 0000000000000400
[Tue Jul 21 07:02:43 2020] Call Trace:
[Tue Jul 21 07:02:43 2020]  <IRQ>
[Tue Jul 21 07:02:43 2020]  distribute_cfs_runtime+0xc3/0x140
[Tue Jul 21 07:02:43 2020]  sched_cfs_period_timer+0x108/0x210
[Tue Jul 21 07:02:43 2020]  ? sched_cfs_slack_timer+0xe0/0xe0
[Tue Jul 21 07:02:43 2020]  __hrtimer_run_queues+0x100/0x280
[Tue Jul 21 07:02:43 2020]  hrtimer_interrupt+0x100/0x220
[Tue Jul 21 07:02:43 2020]  smp_apic_timer_interrupt+0x6a/0x140
[Tue Jul 21 07:02:43 2020]  apic_timer_interrupt+0xf/0x20
[Tue Jul 21 07:02:43 2020]  </IRQ>
[Tue Jul 21 07:02:43 2020] RIP: 0010:cpuidle_enter_state+0xbc/0x420
[Tue Jul 21 07:02:43 2020] Code: e8 49 f0 a3 ff 80 7c 24 13 00 74 17 9c 58 0f 1f 44 00 00 f6 c4 02 0f 85 37 03 00 00 31 ff e8 db fd a9 ff fb 66 0f 1f 44 00 00 <45> 85 e4 0f 88 6c 02 00 00 49 63 cc 4c 8b 3c 24 4c 2b 7c 24 08 48
[Tue Jul 21 07:02:43 2020] RSP: 0018:ffffba3ec31dfe68 EFLAGS: 00000246 ORIG_RAX: ffffffffffffff13
[Tue Jul 21 07:02:43 2020] RAX: ffff9dffdfae9c40 RBX: ffffffffaef2a540 RCX: 00000000ffffffff
[Tue Jul 21 07:02:43 2020] RDX: 00094dc87e68fb16 RSI: 00000000000043fa RDI: 0000000000000000
[Tue Jul 21 07:02:43 2020] RBP: ffff9dffdfaf3800 R08: 000ba13b3114dac0 R09: 000000000000037c
[Tue Jul 21 07:02:43 2020] R10: ffff9dffdfae8be0 R11: ffff9dffdfae8bc0 R12: 0000000000000003
[Tue Jul 21 07:02:43 2020] R13: ffffffffaef2a678 R14: 0000000000000003 R15: 0000000000000000
[Tue Jul 21 07:02:43 2020]  ? cpuidle_enter_state+0x97/0x420
[Tue Jul 21 07:02:43 2020]  cpuidle_enter+0x2c/0x40
[Tue Jul 21 07:02:43 2020]  do_idle+0x236/0x280
[Tue Jul 21 07:02:43 2020]  cpu_startup_entry+0x6f/0x80
[Tue Jul 21 07:02:43 2020]  start_secondary+0x1a7/0x200
[Tue Jul 21 07:02:43 2020]  secondary_startup_64+0xb7/0xc0
[Tue Jul 21 07:02:43 2020] ---[ end trace 069b932bbbef0c26 ]---
```

这个报错是CFS调度器相关，可能和 [[PATCH] sched/fair: fix unthrottle_cfs_rq for leaf_cfs_rq list](https://lkml.org/lkml/2020/5/11/999) 有关，待学习分析

# 参考

* [[PATCH] sched/fair: fix unthrottle_cfs_rq for leaf_cfs_rq list](https://lkml.org/lkml/2020/5/11/999)
* [Linux Kernel Scheduler Basics](https://josefbacik.github.io/kernel/scheduler/2017/07/14/scheduler-basics.html)