

centos 7 虚拟机内核 `3.10.0-123.9.3.el7.x86_64`

如果系统crash并且dump出了vmcore（vmcore是通过kdump这样的工具dump出内存），可以参考以下方法来排查vmcore

```
wget http://debuginfo.centos.org/7/x86_64/kernel-debuginfo-3.10.0-123.9.3.el7.x86_64.rpm
rpm2cpio kernel-debuginfo-3.10.0-123.9.3.el7.x86_64.rpm |cpio -idv ./usr/lib/debug/lib/modules/3.10.0-123.9.3.el7.x86_64/vmlinux

crash ./usr/lib/debug/lib/modules/3.10.0-123.9.3.el7.x86_64/vmlinux /vm/corefile/vm-1_corefile
```

此时可以看到Kernel Panic的概要信息，指出导致Panic的BUG位于`fs/buffer.c:1270`

```
      KERNEL: ./usr/lib/debug/lib/modules/3.10.0-123.9.3.el7.x86_64/vmlinux
    DUMPFILE: vm-1_corefile
        CPUS: 4 [OFFLINE: 3]
        DATE: Fri Feb 24 08:48:45 2017
      UPTIME: 154 days, 20:50:21
LOAD AVERAGE: 0.29, 0.26, 0.23
       TASKS: 275
    NODENAME: vm-1
     RELEASE: 3.10.0-123.9.3.el7.x86_64
     VERSION: #1 SMP Thu Nov 6 15:06:03 UTC 2014
     MACHINE: x86_64  (2593 Mhz)
      MEMORY: 4 GB
       PANIC: "kernel BUG at fs/buffer.c:1270!"
         PID: 28635
     COMMAND: "php-fpm"
        TASK: ffff880138e94440  [THREAD_INFO: ffff8800496fa000]
         CPU: 3
       STATE:  (PANIC)
```

首先检查vm crash时候系统日志，输入`dmesg` ，可以看到

```
[76081.443074] loop: module loaded
[76081.478154] bio: create slab <bio-1> at 1
[76081.509497] bio: create slab <bio-2> at 2
[76120.625165] Bridge firewalling registered
[76120.633776] nf_conntrack version 0.5.0 (16384 buckets, 65536 max)
[76120.694112] ip_tables: (C) 2000-2006 Netfilter Core Team
[76120.783740] IPv6: ADDRCONF(NETDEV_UP): docker0: link is not ready
[76125.124708] bio: create slab <bio-2> at 2
[76125.140981] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
[76136.712206] bio: create slab <bio-2> at 2
[76136.729650] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
...
[153039.317114] hrtimer: interrupt took 2016981 ns
[368696.410853] systemd-journald[342]: Vacuuming done, freed 0 bytes
[631527.253301] DCCP: Activated CCID 2 (TCP-like)
[631527.253312] DCCP: Activated CCID 3 (TCP-Friendly Rate Control)
[727316.409094] systemd-journald[342]: Vacuuming done, freed 0 bytes
...
[1467538.820679] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[1467556.724097] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)

[1692176.407874] systemd-journald[342]: Vacuuming done, freed 0 bytes
[1826812.767440] bio: create slab <bio-2> at 2
[1826817.803562] bio: create slab <bio-2> at 2
[2105379.332813] systemd-journald[342]: Vacuuming done, freed 0 bytes
...
[4014081.495653] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
[4014099.022916] bio: create slab <bio-2> at 2
...
[6624983.286806] systemd-journald[342]: Vacuuming done, freed 24854528 bytes
[6732114.764622] TCP: TCP: Possible SYN flooding on port 11211. Sending cookies.  Check SNMP counters.
...
[12718399.920299] device-mapper: ioctl: unable to remove open device docker-253:1-1053135-994bc83181568ed5a7f985b121535d0088ad8c2d5c80e43691a472590f204701-init
...
[13380335.508864] traps: php-fpm[27016] general protection ip:6abbe9 sp:7ffff953ee30 error:0 in php-fpm[400000+860000]
[13380337.816762] php-fpm[26318]: segfault at 7f223d1df128 ip 000000000067a851 sp 00007ffff953ef20 error 4 in php-fpm[400000+860000]
[13380621.167487] traps: php-fpm[28635] general protection ip:7f223396fc80 sp:7ffff953ec40 error:0 in taeprobe.so[7f2233965000+f000]
[13380621.257921] ------------[ cut here ]------------
[13380621.257933] WARNING: at block/blk.h:227 generic_make_request_checks+0x36e/0x380()
[13380621.257935] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERADE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_bufio libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw[13059720.753177] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13264901.546121] systemd-journald[342]: Vacuuming done, freed 24854528 bytes
[13312435.053870] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312435.161880] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312435.197895] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312582.339199] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312582.449299] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312582.479447] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312808.390360] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312808.490980] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13312808.516718] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13380335.508864] traps: php-fpm[27016] general protection ip:6abbe9 sp:7ffff953ee30 error:0 in php-fpm[400000+860000]
[13380337.816762] php-fpm[26318]: segfault at 7f223d1df128 ip 000000000067a851 sp 00007ffff953ef20 error 4 in php-fpm[400000+860000]
[13380621.167487] traps: php-fpm[28635] general protection ip:7f223396fc80 sp:7ffff953ec40 error:0 in taeprobe.so[7f2233965000+f000]
[13380621.257921] ------------[ cut here ]------------
[13380621.257933] WARNING: at block/blk.h:227 generic_make_request_checks+0x36e/0x380()
[13380621.257935] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERA
DE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_buf
io libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw
 gf128mul glue_helper ablk_helper cryptd dm_mirror virtio_balloon(OF) virtio_cod(OF) serio_raw dm_region_hash pcspkr dm_log i2c_piix4 dm_mod mperf ext4 mbcache jbd2 sr_mod cdrom ata_generic pata_acpi virtio_console(OF) virtio_blk(OF) virtio_net(OF) cirrus syscopyarea sysfillrect sysimgblt drm_kms_helper ttm ata_piix drm libata i2c_core virtio_pci(OF) virtio_ring(OF) virtio(OF) floppy [last unloaded: ip[13380621.257935] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERA
DE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_buf
io libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw
 gf128mul glue_helper ablk_helper cryptd dm_mirror virtio_balloon(OF) virtio_cod(OF) serio_raw dm_region_hash pcspkr dm_log i2c_piix4 d
m_mod mperf ext4 mbcache jbd2 sr_mod cdrom ata_generic pata_acpi virtio_console(OF) virtio_blk(OF) virtio_net(OF) cirrus syscopyarea sy
sfillrect sysimgblt drm_kms_helper ttm ata_piix drm libata i2c_core virtio_pci(OF) virtio_ring(OF) virtio(OF) floppy [last unloaded: ip
_tables]
[13380621.257983]
[13380621.257986] CPU: 3 PID: 28635 Comm: php-fpm Tainted: GF          O--------------   3.10.0-123.9.3.el7.x86_64 #1
[13380621.257988] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
[13380621.257990]  0000000000000000 000000001d7f5ebd ffff8800496fb5f8 ffffffff815e239b
[13380621.257994]  ffff8800496fb630 ffffffff8105dee1 ffff88004ee48c00 00000000ffffffff
[13380621.257996]  00000000000000ff ffff880127dbd280 ffff88009afbc958 ffff8800496fb640
[13380621.257999] Call Trace:
[13380621.258004]  [<ffffffff815e239b>] dump_stack+0x19/0x1b
[13380621.258004]  [<ffffffff8105dee1>] warn_slowpath_common+0x61/0x80
[13380621.258004]  [<ffffffff8105e00a>] warn_slowpath_null+0x1a/0x20
[13380621.258004]  [<ffffffff8129032e>] generic_make_request_checks+0x36e/0x380
[13380621.258004]  [<ffffffff81290367>] generic_make_request+0x27/0x130
[13380621.258004]  [<ffffffff812904e1>] submit_bio+0x71/0x150
[13380621.258004]  [<ffffffffa01765a5>] ext4_io_submit+0x25/0x50 [ext4]
[13380621.258004]  [<ffffffffa01767ad>] ext4_bio_write_page+0x1dd/0x3b0 [ext4]
[13380621.258004]  [<ffffffffa016db69>] mpage_da_submit_io+0x319/0x390 [ext4]
[13380621.258004]  [<ffffffffa0172502>] mpage_da_map_and_submit+0x122/0x450 [ext4]
[13380621.258004]  [<ffffffffa0172d1d>] write_cache_pages_da+0x4ed/0x560 [ext4]
[13380621.258004]  [<ffffffffa017309a>] ext4_da_writepages+0x30a/0x610 [ext4]
[13380621.258004]  [<ffffffff8114d68e>] do_writepages+0x1e/0x40
[13380621.258004]  [<ffffffff81142bd5>] __filemap_fdatawrite_range+0x65/0x80
[13380621.258004]  [<ffffffff81142c9c>] filemap_flush+0x1c/0x20
[13380621.258004]  [<ffffffffa0170228>] ext4_alloc_da_blocks+0x38/0x70 [ext4]
[13380621.258004]  [<ffffffffa0169859>] ext4_release_file+0x79/0xc0 [ext4]
[13380621.258004]  [<ffffffff811b1239>] __fput+0xe9/0x270
[13380621.258004]  [<ffffffff811b150e>] ____fput+0xe/0x10
[13380621.258004]  [<ffffffff810823c7>] task_work_run+0xa7/0xe0
[13380621.258004]  [<ffffffff81063deb>] do_exit+0x2cb/0xa60
[13380621.258004]  [<ffffffff81070a53>] ? __sigqueue_free.part.11+0x33/0x40
[13380621.258004]  [<ffffffff8107104c>] ? __dequeue_signal+0x13c/0x220
[13380621.258004]  [<ffffffff810645ff>] do_group_exit+0x3f/0xa0
[13380621.258004]  [<ffffffff81074010>] get_signal_to_deliver+0x1d0/0x6e0
[13380621.258004]  [<ffffffff81071989>] ? complete_signal+0x119/0x250
[13380621.258004]  [<ffffffff81012437>] do_signal+0x57/0x600
[13380621.258004]  [<ffffffff81071f54>] ? __send_signal+0x194/0x4b0
[13380621.258004]  [<ffffffff810722ae>] ? send_signal+0x3e/0x80
[13380621.258004]  [<ffffffff81072bfc>] ? force_sig_info+0xcc/0xe0
[13380621.258004]  [<ffffffff81012a49>] do_notify_resume+0x69/0xb0
[13380621.258004]  [<ffffffff815e9f3c>] retint_signal+0x48/0x8c
[13380621.258004] ---[ end trace 0d358b69ac15ccb7 ]---
[13380621.258004] ------------[ cut here ]------------
[13380621.258004] kernel BUG at fs/buffer.c:1270!
[13380621.258004] invalid opcode: 0000 [#1] SMP
[13380621.258004] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERADE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_bufio libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw gf128mul glue_helper ablk_helper cryptd dm_mirror virtio_balloon(OF) virtio_cod(OF) serio_raw dm_region_hash pcspkr dm_log i2c_piix4 dm_mod mperf ext4 mbcache jbd2 sr_mod cdrom ata_generic pata_acpi virtio_console(OF) virtio_blk(OF) virtio_net(OF) cirrus syscopyarea sysfillrect sysimgblt drm_kms_helper ttm ata_piix drm libata i2c_core virtio_pci(OF) virtio_ring(OF) virtio(OF) floppy [last unloaded: ip_tables]
[13380621.258004]
[13380621.258004] CPU: 3 PID: 28635 Comm: php-fpm Tainted: GF       W  O--------------   3.10.0-123.9.3.el7.x86_64 #1
[13380621.258004] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
[13380621.258004] task: ffff880138e94440 ti: ffff8800496fa000 task.ti: ffff8800496fa000
[13380621.258004] RIP: 0010:[<ffffffff815df851>]  [<ffffffff815df851>] check_irqs_on.part.11+0x4/0x6
[13380621.258004] RSP: 0000:ffff8800496fb5a0  EFLAGS: 00010046
[13380621.258004] RAX: 0000000000000046 RBX: ffff8800496fb810 RCX: ffff880137664000
[13380621.258004] RDX: 0000000000001000 RSI: 0000000000000405 RDI: ffff8800369a8680
[13380621.258004] RBP: ffff8800496fb5a0 R08: 0000000000000000 R09: 0000000000000000
[13380621.258004] R10: ffff880137664000 R11: 0000000000000220 R12: ffff8800369a8680
[13380621.258004] R13: 0000000000001000 R14: 0000000000000004 R15: 0000000000000405
[13380621.258004] FS:  0000000000000000(0000) GS:ffff88013fd80000(0000) knlGS:0000000000000000
[13380621.258004] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[13380621.258004] CR2: 00007f223273a000 CR3: 00000000018d0000 CR4: 00000000000406e0
[13380621.258004] DR0: 0000000000000000 DR1: 0000000000000000 DR2: 0000000000000000
[13380621.258004] DR3: 0000000000000000 DR6: 00000000ffff0ff0 DR7: 0000000000000400
[13380621.258004] Stack:
[13380621.258004]  ffff8800496fb618 ffffffff811e2725 ffff8800496fb5e8 ffffffffa01f4c7e
[13380621.258004]  ffff88013641f000 0000000000000001 ffff8800496fb688 ffff8800a9e6a2a0
[13380621.258004]  ffff8800a9e6a2c0 ffff8800496fb650 000000001d7f5ebd ffff8800496fb810
[13380621.258004] Call Trace:
[13380621.258004]  [<ffffffff811e2725>] __find_get_block+0x255/0x260
[13380621.258004]  [<ffffffffa01f4c7e>] ? __map_bio+0x3e/0x110 [dm_mod]
[13380621.258004]  [<ffffffff811e2755>] __getblk+0x25/0x2e0
[13380621.258004]  [<ffffffffa01680b5>] ext4_read_block_bitmap_nowait+0x55/0x300 [ext4]
[13380621.258004]  [<ffffffffa0168379>] ext4_read_block_bitmap+0x19/0x60 [ext4]
[13380621.258004]  [<ffffffffa01a37ca>] ext4_mb_mark_diskspace_used+0x5a/0x4f0 [ext4]
[13380621.258004]  [<ffffffffa01a4fdd>] ext4_mb_new_blocks+0x2ad/0x580 [ext4]
[13380621.258004]  [<ffffffff812904e1>] ? submit_bio+0x71/0x150
[13380621.258004]  [<ffffffffa019b385>] ext4_ext_map_blocks+0x695/0xfa0 [ext4]
[13380621.258004]  [<ffffffffa01765b4>] ? ext4_io_submit+0x34/0x50 [ext4]
[13380621.258004]  [<ffffffffa016fa55>] ext4_map_blocks+0x2b5/0x4d0 [ext4]
[13380621.258004]  [<ffffffffa017254e>] mpage_da_map_and_submit+0x16e/0x450 [ext4]
[13380621.258004]  [<ffffffffa0172d1d>] write_cache_pages_da+0x4ed/0x560 [ext4]
[13380621.258004]  [<ffffffffa017309a>] ext4_da_writepages+0x30a/0x610 [ext4]
[13380621.258004]  [<ffffffff8114d68e>] do_writepages+0x1e/0x40
[13380621.258004]  [<ffffffff81142bd5>] __filemap_fdatawrite_range+0x65/0x80
[13380621.258004]  [<ffffffff81142c9c>] filemap_flush+0x1c/0x20
[13380621.258004]  [<ffffffffa0170228>] ext4_alloc_da_blocks+0x38/0x70 [ext4]
[13380621.258004]  [<ffffffffa0169859>] ext4_release_file+0x79/0xc0 [ext4]
[13380621.258004]  [<ffffffff811b1239>] __fput+0xe9/0x270
[13380621.258004]  [<ffffffff811b150e>] ____fput+0xe/0x10
[13380621.258004]  [<ffffffff810823c7>] task_work_run+0xa7/0xe0
[13380621.258004]  [<ffffffff81063deb>] do_exit+0x2cb/0xa60
[13380621.258004]  [<ffffffff81070a53>] ? __sigqueue_free.part.11+0x33/0x40
[13380621.258004]  [<ffffffff8107104c>] ? __dequeue_signal+0x13c/0x220
[13380621.258004]  [<ffffffff810645ff>] do_group_exit+0x3f/0xa0
[13380621.258004]  [<ffffffff81074010>] get_signal_to_deliver+0x1d0/0x6e0
[13380621.258004]  [<ffffffff81071989>] ? complete_signal+0x119/0x250
[13380621.258004]  [<ffffffff81012437>] do_signal+0x57/0x600
[13380621.258004]  [<ffffffff81071f54>] ? __send_signal+0x194/0x4b0
[13380621.258004]  [<ffffffff810722ae>] ? send_signal+0x3e/0x80
[13380621.258004]  [<ffffffff81072bfc>] ? force_sig_info+0xcc/0xe0
[13380621.258004]  [<ffffffff81012a49>] do_notify_resume+0x69/0xb0
[13380621.258004]  [<ffffffff815e9f3c>] retint_signal+0x48/0x8c
[13380621.258004] Code: c7 c7 e8 aa 80 81 e8 c6 c1 ff ff 4d 85 e4 74 12 49 8d 7c 24 58 e8 20 a1 00 00 4c 89 e7 e8 88 67 be ff 5b 41 5c 5d c3 55 48 89 e5 <0f> 0b 55 48 89 e5 0f 0b 0f 1f 44 00 00 55 48 89 e5 0f 0b 55 48
[13380621.258004] RIP  [<ffffffff815df851>] check_irqs_on.part.11+0x4/0x6
[13380621.258004]  RSP <ffff8800496fb5a0>
[13380621.258004] ---[ end trace 0d358b69ac15ccb8 ]---
[13380621.258004] Kernel panic - not syncing: Fatal exception
[13380621.258004] drm_kms_helper: panic occurred, switching back to text console
[13380621.300368] ------------[ cut here ]------------
[13380621.301365] WARNING: at arch/x86/kernel/smp.c:124 native_smp_send_reschedule+0x5f/0x70()
[13380621.301365] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERADE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_bufio libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw gf128mul glue_helper ablk_helper cryptd dm_mirror virtio_balloon(OF) virtio_cod(OF) serio_raw dm_region_hash pcspkr dm_log i2c_piix4 dm_mod mperf ext4 mbcache jbd2 sr_mod cdrom ata_generic pata_acpi virtio_console(OF) virtio_blk(OF) virtio_net(OF) cirrus syscopyarea sysfillrect sysimgblt drm_kms_helper ttm ata_piix drm libata i2c_core virtio_pci(OF) virtio_ring(OF) virtio(OF) floppy [last unloaded: ip_tables]
[13380621.301365]
[13380621.301365] CPU: 3 PID: 28635 Comm: php-fpm Tainted: GF     D W  O--------------   3.10.0-123.9.3.el7.x86_64 #1
[13380621.301365] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
[13380621.301365]  0000000000000000 000000001d7f5ebd ffff88013fd83d90 ffffffff815e239b
[13380621.301365]  ffff88013fd83dc8 ffffffff8105dee1 0000000000000000 ffff88013fd945c0
[13380621.301365]  000000041d878014 ffff88013fc145c0 0000000000000003 ffff88013fd83dd8
[13380621.301365] Call Trace:
[13380621.301365]  <IRQ>  [<ffffffff815e239b>] dump_stack+0x19/0x1b
[13380621.301365]  [<ffffffff8105dee1>] warn_slowpath_common+0x61/0x80
[13380621.301365]  [<ffffffff8105e00a>] warn_slowpath_null+0x1a/0x20
```

# 系统日志排查

* 连续的`bio: create slab`

```
[76125.124708] bio: create slab <bio-2> at 2
[76125.140981] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
[76136.712206] bio: create slab <bio-2> at 2
[76136.729650] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
[76145.437787] bio: create slab <bio-2> at 2
[76145.454647] EXT4-fs (dm-1): mounted filesystem with ordered data mode. Opts: (null)
```

[kernel periodically logs 'create slab' messages](https://bugzilla.redhat.com/show_bug.cgi?id=956180) 指出，这个`create slab` 并不是BUG，只是一个信息输出，表示the block layer started using incrementally larger allocations.  bio-0 = 4k, bio-1 = 8k, bio-2 = 16k etc.. 数据块层开始使用递增的更大的分配，`bio-0`表示4k，`bio-1`表示8k，`bio-2`表示16k，依次类推。

* `[153039.317114] hrtimer: interrupt took 2016981 ns`

参考 [What does "hrtimer: interrupt" mean?](https://www.digitalocean.com/community/questions/what-does-hrtimer-interrupt-mean) 这个消息通常是因为非常高的CPU使用率的时候出现，表示CPU的一个中断事件。如果偶然看到则不用担心。但是如果经常看到`hrtimer: interrupt`消息则表示服务器资源不足，需要迁移到资源更多的服务器或者需要排查运行在服务器上的应用看是否有导致系统hang住的软件。

* `systemd-journald[342]: Vacuuming done, freed 0 bytes`

参考 [What do systemd “Vacuuming done, freed 0 bytes” messages mean?](http://unix.stackexchange.com/questions/226145/what-do-systemd-vacuuming-done-freed-0-bytes-messages-mean)

> vacuum 是 `真空，吸尘` 的意思

journald vacuum size `--vacuum-size=`表示删除归档等日志文件直到日志使用的磁盘空间低于指定大小（可以使用"K","M","G","T"）

* `EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)`

这个日志记录应该是正常的，只是表示挂载文件系统

* `[6732114.764622] TCP: TCP: Possible SYN flooding on port 11211. Sending cookies.  Check SNMP counters.`

参考 ["kernel: Possible SYN flooding on port X. Sending cookies" is logged](https://access.redhat.com/solutions/30453) 这条日志是表示内核检测到SYN攻击。

* `[12718399.920299] device-mapper: ioctl: unable to remove open device docker-253:1-1053135-994bc83181568ed5a7f985b121535d0088ad8c2d5c80e43691a472590f204701-init`

看来在OS内部使用了Docker

* `traps: php-fpm[27016] general protection ip:6abbe9 sp:7ffff953ee30 error:0 in php-fpm[400000+860000]`

[General protection fault](https://en.wikipedia.org/wiki/General_protection_fault)(GPF)是Intel x86处理器的保护机制。如果处理器检测到一个protection violation（保护违反），就会停止执行代码并发送一个GPF中断。很多情况下姜导致操作系统从执行队列中删除故障的进程，通知用户，并继续执行其他进程。但是，如果操作系统没有捕获到general protection fault，例如，其他保护校验在操作系统从上一个GPF中断中返回之前又发生了一个protection violation，此时处理器就会触发double fault，就会停止操作系统。如果是另外一个failure（triple fault）发生（接连发生3次），则处理器停止工作并且响应一个reset操作。

* `php-fpm[26318]: segfault at 7f223d1df128 ip 000000000067a851 sp 00007ffff953ef20 error 4 in php-fpm[400000+860000]`

 `php-fpm segfault`常见的错误有`error 4`和`error 6`

 上述系统日志显示`php-fpm`多次触发GPF

 ```
 [13380335.508864] traps: php-fpm[27016] general protection ip:6abbe9 sp:7ffff953ee30 error:0 in php-fpm[400000+860000]
[13380337.816762] php-fpm[26318]: segfault at 7f223d1df128 ip 000000000067a851 sp 00007ffff953ef20 error 4 in php-fpm[400000+860000]
[13380621.167487] traps: php-fpm[28635] general protection ip:7f223396fc80 sp:7ffff953ec40 error:0 in taeprobe.so[7f2233965000+f000]
[13380621.257921] ------------[ cut here ]------------
[13380621.257933] WARNING: at block/blk.h:227 generic_make_request_checks+0x36e/0x380()
[13380621.257935] Modules linked in: ipt_REJECT dccp_diag dccp udp_diag unix_diag af_packet_diag netlink_diag xt_conntrack ipt_MASQUERADE nf_conntrack_ipv4 nf_defrag_ipv4 xt_addrtype nf_nat nf_conntrack bridge stp llc dm_thin_pool dm_persistent_data dm_bio_prison dm_bufio libcrc32c loop tcp_diag inet_diag sg crct10dif_pclmul crct10dif_common crc32_pclmul crc32c_intel ghash_clmulni_intel aesni_intel lrw[13059720.753177] EXT4-fs (dm-2): mounted filesystem with ordered data mode. Opts: (null)
[13380335.508864] traps: php-fpm[27016] general protection ip:6abbe9 sp:7ffff953ee30 error:0 in php-fpm[400000+860000]
[13380337.816762] php-fpm[26318]: segfault at 7f223d1df128 ip 000000000067a851 sp 00007ffff953ef20 error 4 in php-fpm[400000+860000]
[13380621.167487] traps: php-fpm[28635] general protection ip:7f223396fc80 sp:7ffff953ec40 error:0 in taeprobe.so[7f2233965000+f000]
```

导致`php-fpm` GPF的库文件是`taeprobe.so` (`traps: php-fpm[28635] general protection ip:7f223396fc80 sp:7ffff953ec40 error:0 in taeprobe.so[7f2233965000+f000]`)，所以推测是[TAE](https://segmentfault.com/a/1190000004408756)存在的BUG。

* `CPU: 3 PID: 28635 Comm: php-fpm Tainted: GF          O--------------   3.10.0-123.9.3.el7.x86_64 #1`

这段Call Trace显示的调用函数和`ext4`文件系统写入缓存有关

* `kernel BUG at fs/buffer.c:1270`

```
[13380621.258004] kernel BUG at fs/buffer.c:1270!
[13380621.258004] invalid opcode: 0000 [#1] SMP
...
[13380621.258004] CPU: 3 PID: 28635 Comm: php-fpm Tainted: GF       W  O--------------   3.10.0-123.9.3.el7.x86_64 #1
...
[13380621.258004] task: ffff880138e94440 ti: ffff8800496fa000 task.ti: ffff8800496fa000
[13380621.258004] RIP: 0010:[<ffffffff815df851>]  [<ffffffff815df851>] check_irqs_on.part.11+0x4/0x6
[13380621.258004] RSP: 0000:ffff8800496fb5a0  EFLAGS: 00010046
...
[13380621.258004] Call Trace:
[13380621.258004]  [<ffffffff811e2725>] __find_get_block+0x255/0x260
[13380621.258004]  [<ffffffffa01f4c7e>] ? __map_bio+0x3e/0x110 [dm_mod]
[13380621.258004]  [<ffffffff811e2755>] __getblk+0x25/0x2e0
[13380621.258004]  [<ffffffffa01680b5>] ext4_read_block_bitmap_nowait+0x55/0x300 [ext4]
[13380621.258004]  [<ffffffffa0168379>] ext4_read_block_bitmap+0x19/0x60 [ext4]
[13380621.258004]  [<ffffffffa01a37ca>] ext4_mb_mark_diskspace_used+0x5a/0x4f0 [ext4]
[13380621.258004]  [<ffffffffa01a4fdd>] ext4_mb_new_blocks+0x2ad/0x580 [ext4]
[13380621.258004]  [<ffffffff812904e1>] ? submit_bio+0x71/0x150
[13380621.258004]  [<ffffffffa019b385>] ext4_ext_map_blocks+0x695/0xfa0 [ext4]
[13380621.258004]  [<ffffffffa01765b4>] ? ext4_io_submit+0x34/0x50 [ext4]
[13380621.258004]  [<ffffffffa016fa55>] ext4_map_blocks+0x2b5/0x4d0 [ext4]
[13380621.258004]  [<ffffffffa017254e>] mpage_da_map_and_submit+0x16e/0x450 [ext4]
[13380621.258004]  [<ffffffffa0172d1d>] write_cache_pages_da+0x4ed/0x560 [ext4]
[13380621.258004]  [<ffffffffa017309a>] ext4_da_writepages+0x30a/0x610 [ext4]
[13380621.258004]  [<ffffffff8114d68e>] do_writepages+0x1e/0x40
[13380621.258004]  [<ffffffff81142bd5>] __filemap_fdatawrite_range+0x65/0x80
[13380621.258004]  [<ffffffff81142c9c>] filemap_flush+0x1c/0x20
[13380621.258004]  [<ffffffffa0170228>] ext4_alloc_da_blocks+0x38/0x70 [ext4]
[13380621.258004]  [<ffffffffa0169859>] ext4_release_file+0x79/0xc0 [ext4]
[13380621.258004]  [<ffffffff811b1239>] __fput+0xe9/0x270
[13380621.258004]  [<ffffffff811b150e>] ____fput+0xe/0x10
[13380621.258004]  [<ffffffff810823c7>] task_work_run+0xa7/0xe0
[13380621.258004]  [<ffffffff81063deb>] do_exit+0x2cb/0xa60
[13380621.258004]  [<ffffffff81070a53>] ? __sigqueue_free.part.11+0x33/0x40
[13380621.258004]  [<ffffffff8107104c>] ? __dequeue_signal+0x13c/0x220
[13380621.258004]  [<ffffffff810645ff>] do_group_exit+0x3f/0xa0
[13380621.258004]  [<ffffffff81074010>] get_signal_to_deliver+0x1d0/0x6e0
[13380621.258004]  [<ffffffff81071989>] ? complete_signal+0x119/0x250
[13380621.258004]  [<ffffffff81012437>] do_signal+0x57/0x600
[13380621.258004]  [<ffffffff81071f54>] ? __send_signal+0x194/0x4b0
[13380621.258004]  [<ffffffff810722ae>] ? send_signal+0x3e/0x80
[13380621.258004]  [<ffffffff81072bfc>] ? force_sig_info+0xcc/0xe0
[13380621.258004]  [<ffffffff81012a49>] do_notify_resume+0x69/0xb0
[13380621.258004]  [<ffffffff815e9f3c>] retint_signal+0x48/0x8c
[13380621.258004] Code: c7 c7 e8 aa 80 81 e8 c6 c1 ff ff 4d 85 e4 74 12 49 8d 7c 24 58 e8 20 a1 00 00 4c 89 e7 e8 88 67 be ff 5b 41 5c 5d c3 55 48 89 e5 <0f> 0b 55 48 89 e5 0f 0b 0f 1f 44 00 00 55 48 89 e5 0f 0b 55 48
[13380621.258004] RIP  [<ffffffff815df851>] check_irqs_on.part.11+0x4/0x6
[13380621.258004]  RSP <ffff8800496fb5a0>
```

上述Kernel Panic出现在内核`3.10.0-123.9.3.el7.x86_64`代码`fs/buffer.c:1270`，这个BUG在Docker的[Kernel Panic - Centos 7.2 3.10.0 - with devicemapper LVM thinpool ext4 #25504](https://github.com/docker/docker/issues/25504)可以看到类似issue，原因和EXT4文件系统有关。

> In looking at the changelog for the latest available 3.10 kernel on Centos 7.2, I don't see any fixes that appear related, so I'm hesitant to just roll out a kernel upgrade in hopes it fixes it. I've been unable to locate similar panics in my searching.

该BUG报告中提供的线索是通过更换文件系统到XFS来绕过这个BUG。