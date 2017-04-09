线上多台服务器连续出现异常宕机重启，在OOB带外日志显示首先出现网卡`bnx2`的`NETDEV WATCHDOG`报告传输队列超时（Call Trace），同时出现CPU `[Hareware Error]` 显示 `Machine Check Exception: 4 Bank 5: be00000000800400`:

```
2016-12-03 19:08:42    [14874902.828670] ------------[ cut here ]------------
2016-12-03 19:08:42    [14874902.833622] WARNING: at net/sched/sch_generic.c:261 dev_watchdog+0x263/0x270() (Tainted: GF          ---------------   )
2016-12-03 19:08:42    [14874902.844875] Hardware name: PowerEdge R510
2016-12-03 19:08:42    [14874902.849212] NETDEV WATCHDOG: slave0 (bnx2): transmit queue 5 timed out
2016-12-03 19:08:42    [14874902.856068] Modules linked in: kvm_intel_0 ksplice_etuw1mmg_vmlinux_new ksplice_etuw1mmg havs(F) kvm_intel_1 ksplice_ubnyr3k6_vmlinux_new ksplice_ubnyr3k6 sch_sfq act_police cls_u32 sch_ingress xt_mac xt_state mptctl mptbase nbd tcp_diag inet_diag nfnetlink_queue igb nfnetlink xt_conntrack ipt_REJECT ip6table_filter ip6_tables arpt_nfqueue cls_fw sch_htb ebt_mark ebt_arp arptable_filter arp_tables autofs4 ipmi_devintf ipmi_si ebtable_filter ebtable_nat flow_acl(F) iptable_filter ip_tables nf_conntrack_ipv4 nf_defrag_ipv4 bonding ipv6 8021q garp ext4 jbd2 dm_mirror dm_multipath video output sbs sbshc acpi_pad acpi_ipmi ipmi_msghandler vhost_net(F) macvtap(F) macvlan(F) parport turbo_proxy tun slb_ctk_proxy(F) ruleset patch_cksum kvm flow_mark flow_filter nf_conntrack flow_ctk(F) vpc_session(F) classic_traceroute(F) ebt_fnat(F) ebtable_broute(F) ebtables(F) bridge stp llc avs_hotfix slb_ctk_session alivrouter(F) flow_qos(F) sg power_meter iTCO_wdt iTCO_vendor_support bnx2 serio_raw i7core_edac edac_core dcdbas lpc_ich mfd_core dm_raid45 dm_memcache dm_region_hash dm_log dm_mod shpchp ext3 jbd mbcache virtio_pci virtio_blk virtio virtio_ring raid456 async_pq async_xor xor async_memcpy async_raid6_recov raid6_pq async_tx raid10 raid1 raid0 mpt2sas scsi_transport_sas raid_class hpsa cciss [last unloaded: kvm_intel_0]
2016-12-03 19:08:43    [14874902.975946] Pid: 0, comm: swapper Tainted: GF          ---------------    2.6.32-358.el5.x86_64 #1
2016-12-03 19:08:43    [14874902.986422] Call Trace:
2016-12-03 19:08:43    [14874902.989201]    [] ? dev_watchdog+0x263/0x270
2016-12-03 19:08:43    [14874902.995819]  [] ? dev_watchdog+0x263/0x270
2016-12-03 19:08:43    [14874903.001810]  [] ? warn_slowpath_common+0x98/0xc0
2016-12-03 19:08:43    [14874903.008319]  [] ? warn_slowpath_fmt+0x6e/0x70
2016-12-03 19:08:43    [14874903.014570]  [] ? strlcpy+0x4f/0x70
2016-12-03 19:08:43    [14874903.019952]  [] ? netdev_drivername+0x48/0x60
2016-12-03 19:08:43    [14874903.026208]  [] ? dev_watchdog+0x263/0x270
2016-12-03 19:08:43    [14874903.032201]  [] ? scheduler_tick+0xeb/0x250
2016-12-03 19:08:43    [14874903.038276]  [] ? dev_watchdog+0x0/0x270
2016-12-03 19:08:43    [14874903.044092]  [] ? run_timer_softirq+0x161/0x340
2016-12-03 19:08:43    [14874903.050519]  [] ? lapic_next_event+0x1d/0x30
2016-12-03 19:08:43    [14874903.056682]  [] ? __do_softirq+0xbf/0x220
2016-12-03 19:08:43    [14874903.062584]  [] ? hrtimer_interrupt+0x11d/0x230
2016-12-03 19:08:43    [14874903.069010]  [] ? call_softirq+0x1c/0x30
2016-12-03 19:08:43    [14874903.074827]  [] ? do_softirq+0x65/0xa0
2016-12-03 19:08:43    [14874903.080463]  [] ? irq_exit+0x7c/0x90
2016-12-03 19:08:43    [14874903.085932]  [] ? smp_apic_timer_interrupt+0x70/0x9d
2016-12-03 19:08:43    [14874903.092794]  [] ? apic_timer_interrupt+0x13/0x20
2016-12-03 19:08:43    [14874903.099306]    [] ? intel_idle+0xe1/0x180
2016-12-03 19:08:43    [14874903.105668]  [] ? intel_idle+0xc4/0x180
2016-12-03 19:08:43    [14874903.111399]  [] ? cpuidle_idle_call+0x99/0x140
2016-12-03 19:08:43    [14874903.117734]  [] ? cpu_idle+0xa8/0xe0
2016-12-03 19:08:43    [14874903.123197]  [] ? start_secondary+0x226/0x360
2016-12-03 19:08:43    [14874903.129451] ---[ end trace d5f89fd37f9190bc ]---
2016-12-03 19:08:43    [14874903.134393] bnx2 0000:01:00.0: slave0: <--- start FTQ dump --->
2016-12-03 19:08:43    [14874903.140642] bnx2 0000:01:00.0: slave0: RV2P_PFTQ_CTL 00010000
2016-12-03 19:08:43    [14874903.146715] bnx2 0000:01:00.0: slave0: RV2P_TFTQ_CTL 00020000
2016-12-03 19:08:43    [14874903.152785] bnx2 0000:01:00.0: slave0: RV2P_MFTQ_CTL 00004000
2016-12-03 19:08:43    [14874903.158858] bnx2 0000:01:00.0: slave0: TBDR_FTQ_CTL 00004002
2016-12-03 19:08:43    [14874903.164844] bnx2 0000:01:00.0: slave0: TSCH_FTQ_CTL 00020000
2016-12-03 19:08:43    [14874903.171056] bnx2 0000:01:00.0: slave0: TDMA_FTQ_CTL 00010002
2016-12-03 19:08:43    [14874903.177044] bnx2 0000:01:00.0: slave0: TXP_FTQ_CTL 00010002
2016-12-03 19:08:43    [14874903.182945] bnx2 0000:01:00.0: slave0: TPAT_FTQ_CTL 00010002
2016-12-03 19:08:43    [14874903.188933] bnx2 0000:01:00.0: slave0: TAS_FTQ_CTL 00010002
2016-12-03 19:08:43    [14874903.194830] bnx2 0000:01:00.0: slave0: RXP_CFTQ_CTL 00008000
2016-12-03 19:08:43    [14874903.200817] bnx2 0000:01:00.0: slave0: RXP_FTQ_CTL 00100000
2016-12-03 19:08:43    [14874903.206720] bnx2 0000:01:00.0: slave0: RLUP_FTQ_CTL 00008000
2016-12-03 19:08:43    [14874903.212704] bnx2 0000:01:00.0: slave0: COM_COMXQ_FTQ_CTL 00010000
2016-12-03 19:08:43    [14874903.219126] bnx2 0000:01:00.0: slave0: COM_COMTQ_FTQ_CTL 00020000
2016-12-03 19:08:43    [14874903.225545] bnx2 0000:01:00.0: slave0: COM_COMQ_FTQ_CTL 00010000
2016-12-03 19:08:43    [14874903.231881] bnx2 0000:01:00.0: slave0: CP_CPQ_FTQ_CTL 00004000
2016-12-03 19:08:43    [14874903.238039] bnx2 0000:01:00.0: slave0: RDMA_FTQ_CTL 00010000
2016-12-03 19:08:43    [14874903.244031] bnx2 0000:01:00.0: slave0: CSCH_CH_FTQ_CTL 00004000
2016-12-03 19:08:43    [14874903.250279] bnx2 0000:01:00.0: slave0: MCP_MCPQ_FTQ_CTL 00005000
2016-12-03 19:08:43    [14874903.256612] bnx2 0000:01:00.0: slave0: CPU states:
2016-12-03 19:08:43    [14874903.261737] bnx2 0000:01:00.0: slave0: 045000 mode b84c state 80001000 evt_mask 500 pc 8001288 pc 8001288 instr 8e030000
2016-12-03 19:08:43    [14874903.273005] bnx2 0000:01:00.0: slave0: 085000 mode b84c state 80009000 evt_mask 500 pc 8000a5c pc 8000a4c instr 1440fffc
2016-12-03 19:08:43    [14874903.284263] bnx2 0000:01:00.0: slave0: 0c5000 mode b84c state 80001000 evt_mask 500 pc 8004c14 pc 8004c14 instr 32070001
2016-12-03 19:08:43    [14874903.295524] bnx2 0000:01:00.0: slave0: 105000 mode b8cc state 80000000 evt_mask 500 pc 8000a9c pc 8000aa4 instr 8821
2016-12-03 19:08:43    [14874903.306444] bnx2 0000:01:00.0: slave0: 145000 mode b880 state 80004000 evt_mask 500 pc 80009d4 pc 800c6cc instr 0
2016-12-03 19:08:43    [14874903.317098] bnx2 0000:01:00.0: slave0: 185000 mode b8cc state 80000000 evt_mask 500 pc 8000c6c pc 8000c6c instr 1700ffe1
2016-12-03 19:08:43    [14874903.328351] bnx2 0000:01:00.0: slave0: <--- end FTQ dump --->
2016-12-03 19:08:43    [14874903.334425] bnx2 0000:01:00.0: slave0: <--- start TBDC dump --->
2016-12-03 19:08:43    [14874903.340766] bnx2 0000:01:00.0: slave0: TBDC free cnt: 32
2016-12-03 19:08:43    [14874903.346404] bnx2 0000:01:00.0: slave0: LINE     CID  BIDX   CMD  VALIDS
2016-12-03 19:08:43    [14874903.353351] bnx2 0000:01:00.0: slave0: 00    001100  a6d8   00    [0]
2016-12-03 19:08:43    [14874903.360127] bnx2 0000:01:00.0: slave0: 01    001100  a6d8   00    [0]
2016-12-03 19:08:43    [14874903.366896] bnx2 0000:01:00.0: slave0: 02    001000  c5f8   00    [0]
2016-12-03 19:08:43    [14874903.373667] bnx2 0000:01:00.0: slave0: 03    001200  bf80   00    [0]
2016-12-03 19:08:43    [14874903.380435] bnx2 0000:01:00.0: slave0: 04    001000  9f20   00    [0]
2016-12-03 19:08:43    [14874903.387208] bnx2 0000:01:00.0: slave0: 05    001000  2218   00    [0]
2016-12-03 19:08:43    [14874903.393980] bnx2 0000:01:00.0: slave0: 06    001000  2250   00    [0]
2016-12-03 19:08:43    [14874903.400750] bnx2 0000:01:00.0: slave0: 07    001000  2220   00    [0]
2016-12-03 19:08:43    [14874903.407524] bnx2 0000:01:00.0: slave0: 08    001000  2238   00    [0]
2016-12-03 19:08:43    [14874903.414302] bnx2 0000:01:00.0: slave0: 09    001000  2258   00    [0]
2016-12-03 19:08:43    [14874903.421076] bnx2 0000:01:00.0: slave0: 0a    001000  2228   00    [0]
2016-12-03 19:08:43    [14874903.427848] bnx2 0000:01:00.0: slave0: 0b    001000  2260   00    [0]
2016-12-03 19:08:43    [14874903.434628] bnx2 0000:01:00.0: slave0: 0c    001000  2148   00    [0]
2016-12-03 19:08:43    [14874903.441407] bnx2 0000:01:00.0: slave0: 0d    001000  2150   00    [0]
2016-12-03 19:08:43    [14874903.448180] bnx2 0000:01:00.0: slave0: 0e    001000  2158   00    [0]
2016-12-03 19:08:43    [14874903.454952] bnx2 0000:01:00.0: slave0: 0f    001000  2168   00    [0]
2016-12-03 19:08:43    [14874903.461730] bnx2 0000:01:00.0: slave0: 10    001000  2170   00    [0]
2016-12-03 19:08:43    [14874903.468501] bnx2 0000:01:00.0: slave0: 11    001000  2180   00    [0]
2016-12-03 19:08:43    [14874903.475273] bnx2 0000:01:00.0: slave0: 12    001000  2188   00    [0]
2016-12-03 19:08:43    [14874903.482044] bnx2 0000:01:00.0: slave0: 13    001000  2190   00    [0]
2016-12-03 19:08:43    [14874903.488816] bnx2 0000:01:00.0: slave0: 14    001000  1938   00    [0]
2016-12-03 19:08:43    [14874903.495588] bnx2 0000:01:00.0: slave0: 15    001000  1940   00    [0]
2016-12-03 19:08:43    [14874903.502360] bnx2 0000:01:00.0: slave0: 16    001000  1948   00    [0]
2016-12-03 19:08:43    [14874903.509131] bnx2 0000:01:00.0: slave0: 17    001000  1950   00    [0]
2016-12-03 19:08:43    [14874903.515902] bnx2 0000:01:00.0: slave0: 18    001000  17f0   00    [0]
2016-12-03 19:08:43    [14874903.522674] bnx2 0000:01:00.0: slave0: 19    001000  1800   00    [0]
2016-12-03 19:08:43    [14874903.529447] bnx2 0000:01:00.0: slave0: 1a    001000  0808   00    [0]
2016-12-03 19:08:43    [14874903.536220] bnx2 0000:01:00.0: slave0: 1b    001000  0810   00    [0]
2016-12-03 19:08:43    [14874903.542999] bnx2 0000:01:00.0: slave0: 1c    001000  b780   00    [0]
2016-12-03 19:08:43    [14874903.549777] bnx2 0000:01:00.0: slave0: 1d    001000  4200   00    [0]
2016-12-03 19:08:43    [14874903.556548] bnx2 0000:01:00.0: slave0: 1e    001000  b548   00    [0]
2016-12-03 19:08:43    [14874903.563322] bnx2 0000:01:00.0: slave0: 1f    001000  8040   00    [0]
2016-12-03 19:08:43    [14874903.570091] bnx2 0000:01:00.0: slave0: <--- end TBDC dump --->
2016-12-03 19:08:43    [14874903.576253] bnx2 0000:01:00.0: slave0: DEBUG: intr_sem[0] PCI_CMD[00100406]
2016-12-03 19:08:43    [14874903.583606] bnx2 0000:01:00.0: slave0: DEBUG: PCI_PM[19002008] PCI_MISC_CFG[92000088]
2016-12-03 19:08:43    [14874903.591827] bnx2 0000:01:00.0: slave0: DEBUG: EMAC_TX_STATUS[00000008] EMAC_RX_STATUS[00000000]
2016-12-03 19:08:47    [14874907.108434] bnx2 0000:01:00.0: slave0: NIC Copper Link is Up, 1000 Mbps full duplex
2016-12-03 19:08:43    [14874903.600908] bnx2 0000:01:00.0: slave0: DEBUG: RPM_MGMT_PKT_CTRL[40000088]
2016-12-03 19:08:43    [14874903.608021] bnx2 0000:01:00.0: slave0: DEBUG: HC_STATS_INTERRUPT_STATUS[015f00a0]
2016-12-03 19:08:43    [14874903.615886] bnx2 0000:01:00.0: slave0: DEBUG: PBA[00000000]
2016-12-03 19:08:43    [14874903.621791] bnx2 0000:01:00.0: slave0: DEBUG: MSIX table:
2016-12-03 19:08:43    [14874903.627518] bnx2 0000:01:00.0: slave0: DEBUG: [0]: fee00618 00000000 00000000 00000000
2016-12-03 19:08:43    [14874903.635818] bnx2 0000:01:00.0: slave0: DEBUG: [1]: fee00618 00000000 00000001 00000000
2016-12-03 19:08:43    [14874903.644131] bnx2 0000:01:00.0: slave0: DEBUG: [2]: fee00618 00000000 00000002 00000000
2016-12-03 19:08:43    [14874903.652433] bnx2 0000:01:00.0: slave0: DEBUG: [3]: fee00618 00000000 00000003 00000000
2016-12-03 19:08:43    [14874903.660739] bnx2 0000:01:00.0: slave0: DEBUG: [4]: fee00618 00000000 00000004 00000000
2016-12-03 19:08:43    [14874903.669270] bnx2 0000:01:00.0: slave0: DEBUG: [5]: fee00618 00000000 00000005 00000000
2016-12-03 19:08:43    [14874903.677572] bnx2 0000:01:00.0: slave0: DEBUG: [6]: fee00618 00000000 00000006 00000000
2016-12-03 19:08:43    [14874903.685876] bnx2 0000:01:00.0: slave0: DEBUG: [7]: fee00618 00000000 00000007 00000000
2016-12-03 19:08:43    [14874903.694180] bnx2 0000:01:00.0: slave0: <--- start MCP states dump --->
2016-12-03 19:08:43    [14874903.701040] bnx2 0000:01:00.0: slave0: DEBUG: MCP_STATE_P0[0003610e] MCP_STATE_P1[0003610e]
2016-12-03 19:08:43    [14874903.709776] bnx2 0000:01:00.0: slave0: DEBUG: MCP mode[0000b880] state[80000000] evt_mask[00000500]
2016-12-03 19:08:43    [14874903.719217] bnx2 0000:01:00.0: slave0: DEBUG: pc[0800b220] pc[0800b158] instr[30820800]
2016-12-03 19:08:43    [14874903.727604] bnx2 0000:01:00.0: slave0: DEBUG: shmem states:
2016-12-03 19:08:43    [14874903.733505] bnx2 0000:01:00.0: slave0: DEBUG: drv_mb[01030014] fw_mb[00000014] link_status[0000006f] drv_pulse_mb[00004a50]
2016-12-03 19:08:43    [14874903.745044] bnx2 0000:01:00.0: slave0: DEBUG: dev_info_signature[44564907] reset_type[01005254] condition[0003610e]
2016-12-03 19:08:43    [14874903.755891] bnx2 0000:01:00.0: slave0: DEBUG: 000001c0: 01005254 42530088 0003610e 00000000
2016-12-03 19:08:43    [14874903.764630] bnx2 0000:01:00.0: slave0: DEBUG: 000003cc: 00000000 00000000 00000000 00000000
2016-12-03 19:08:43    [14874903.773370] bnx2 0000:01:00.0: slave0: DEBUG: 000003dc: 00000000 00000000 00000000 00000000
2016-12-03 19:08:43    [14874903.782112] bnx2 0000:01:00.0: slave0: DEBUG: 000003ec: 00000000 00000000 00000000 00000000
2016-12-03 19:08:43    [14874903.792028] bnx2 0000:01:00.0: slave0: DEBUG: 0x3fc[00000000]
2016-12-03 19:08:43    [14874903.798098] bnx2 0000:01:00.0: slave0: <--- end MCP states dump --->
2016-12-03 19:08:44    [14874903.916087] bnx2 0000:01:00.0: slave0: NIC Copper Link is Down
2016-12-03 19:08:44    [14874903.922336] bonding: eth0: link status definitely down for interface slave0, disabling it
2016-12-03 19:08:52    [14874911.977687] [Hardware Error]: CPU 19: Machine Check Exception: 4 Bank 5: be00000000800400
2016-12-03 19:08:52    [14874911.977777] Clocksource tsc unstable (delta = -8589935096 ns).  Enable clocksource failover by adding clocksource_failover kernel parameter.
2016-12-03 19:08:52    [14874911.999243] [Hardware Error]: TSC 7ebbc5c7e698b4 ADDR 1579aa6 
2016-12-03 19:08:52    [14874912.005430] [Hardware Error]: PROCESSOR 0:206c2 TIME 1480763330 SOCKET 0 APIC 11
2016-12-03 19:08:52    [14874912.013203] [Hardware Error]: CPU 7: Machine Check Exception: 4 Bank 5: be00000000800400
2016-12-03 19:08:52    [14874912.021686] [Hardware Error]: TSC 7ebbc5c7e698c8 ADDR 1579aa6 
2016-12-03 19:08:52    [14874912.027876] [Hardware Error]: PROCESSOR 0:206c2 TIME 1480763330 SOCKET 0 APIC 10
2016-12-03 19:08:52    [14874912.035650] [Hardware Error]: Machine check: Processor context corrupt
2016-12-03 19:08:52    [14874912.042500] Kernel panic - not syncing: Fatal Machine check
2016-12-03 19:08:52    [14874912.048401] Pid: 0, comm: swapper Tainted: GF  M    W  ---------------    2.6.32-358.el5.x86_64 #1
2016-12-03 19:08:52    [14874912.058867] Call Trace:
2016-12-03 19:08:52    [14874912.061632]  <#MC>  [] ? panic+0xd6/0x1d0
2016-12-03 19:08:52    [14874912.067554]  [] ? notifier_call_chain+0x21/0x90
2016-12-03 19:08:52    [14874912.073971]  [] ? __ratelimit+0xbd/0xe0
2016-12-03 19:08:52    [14874912.079701]  [] ? print_mce+0xf1/0x150
2016-12-03 19:08:52    [14874912.085338]  [] ? mce_panic+0x20e/0x210
2016-12-03 19:08:52    [14874912.091062]  [] ? do_machine_check+0x9b8/0x9c0
2016-12-03 19:08:52    [14874912.097396]  [] ? machine_check+0x1c/0x30
2016-12-03 19:08:52    [14874912.103293]  [] ? intel_idle+0xb4/0x180
2016-12-03 19:08:52    [14874912.109015]  <>  [] ? menu_select+0xee/0x370
2016-12-03 19:08:52    [14874912.115627]  [] ? cpuidle_idle_call+0x99/0x140
2016-12-03 19:08:52    [14874912.121958]  [] ? cpu_idle+0xa8/0xe0
2016-12-03 19:08:52    [14874912.127422]  [] ? start_secondary+0x226/0x360
```

* [污染的内核(tainted kernel)是什么意思](tainted_kernel)

当出现machine check exception (MCE) 的时候，硬件出现问题，此时会设置一个`taint state`（污染状态），一旦设置了内核`已经污染`(`tainted`)，则只能通过重启系统重新加载内核才能unset这个污染状态。

请注意，在这里有两次出现 Call Trace，在Call Trace之前，有一个标记 `Tainted:` 其后跟随的字符表示了tainted stats。在 `Machine Check Exception` (MCE) 之后的 Kernel panic中，tainted stats 是 `GF  M    W`。其中的 `W` 表示 warning ，也就是 "`W`:  如果前面内核已经提出过告警"。

仔细查看`dmesg`输出信息，可以看到在操作系统启动时，内核已经发出过警告信息

```
[    1.434178] [Hardware Error]: This system BIOS has enabled interrupt remapping
[    1.434179] on a chipset that contains an errata making that
[    1.434180] feature unstable.  Please reboot with nointremap
[    1.434180] added to the kernel command line and contact
[    1.434181] your BIOS vendor for an update
```

> 上述启动时的硬件错误信息是提示系统BIOS开启了中断重映射（这个功能是用于kvm passthrough虚拟化），但是主机的芯片存在bug会导致系统不稳定，所以建议关闭`intremap`并升级BIOS。详细分析见本文后述。

# dev_watchdog

# Kernel Panic原因

[Interrupt remapping problems with Intel 5500, 5520 CPUs](https://asocialpenguin.com/2013/12/23/interrupt-remapping-problems-with-intel-5500-5520-cpus/) 汇总了有关Intel VT-d中断映射引擎影响Intel 5500/5520芯片的问题。

出现 `NETDEV WATCHDOG: eth0 (bnx2): transmit queue 2 timed out` 的原因是因为 Intel `55XX` 芯片存在一个中断重映射（`interrupt remapping`）的bug，通常会导致网卡丢失，以及watchdog触发panic。

# 关闭`interrupt remapping`方法

服务器启动内核修改 /boot/grub/menu.lst 配置文件kernel行添加 intremap=off

```
sudo sed -i '/vmlinuz-2.6.32/ s/$/ intremap=off/' /boot/grub/grub.conf
```

修正后内核启动配置类似如下(这里借用了[Kernel panic with "NETDEV WATCHDOG: eth0 (bnx2): transmit queue 2 timed out" error](https://kb.plesk.com/en/121971)案例)

```
title Parallels (2.6.32-042stab090.2)
        root (hd0,2)
        kernel /boot/vmlinuz-2.6.32-042stab090.2 ro root=UUID=2b7b0e76-2383-4423-805a-376893fadcb4 rd_NO_LUKS rd_NO_LVM rd_NO_MD rd_NO_DM LANG=es_ES.UTF-8 SYSFONT=latarcyrheb-sun16 KEYBOARDTYPE=pc KEYTABLE=es crashkernel=auto rhgb quiet intremap=off
        initrd /boot/initramfs-2.6.32-042stab090.2.img
```

# 依然存在Kernel Panic

重启操作系统后，`dmesg`消息中不再出现系统警告`[Hardware Error]: This system BIOS has enabled interrupt remapping`，但是却发现内核参数添加了`intremap=off`依然会出现Panic，但是不再出现`NETDEV WATCHDOG: slave0 (bnx2): transmit queue 5 timed out`这样的信息。

依然出现的是`Machine Check Exception: 4 Bank 5: be00000000800400`:

```
2017-03-30 00:40:55	[1412408.649353] [Hardware Error]: CPU 20: Machine Check Exception: 4 Bank 5: be00000000800400
2017-03-30 00:40:55	[1412408.649370] Clocksource tsc unstable (delta = -8589936066 ns).  Enable clocksource failover by adding clocksource_failover kernel parameter.
2017-03-30 00:40:55	[1412408.670723] [Hardware Error]: TSC c0912bd05e005 ADDR 164b547 
2017-03-30 00:40:55	[1412408.676741] [Hardware Error]: PROCESSOR 0:206c2 TIME 1490805655 SOCKET 1 APIC 33
2017-03-30 00:40:55	[1412408.684427] [Hardware Error]: CPU 8: Machine Check Exception: 4 Bank 5: be00000000800400
2017-03-30 00:40:55	[1412408.692814] [Hardware Error]: TSC c0912bd05df33 ADDR 164b547 
2017-03-30 00:40:55	[1412408.698822] [Hardware Error]: PROCESSOR 0:206c2 TIME 1490805655 SOCKET 1 APIC 32
2017-03-30 00:40:55	[1412408.706517] [Hardware Error]: Machine check: Processor context corrupt
2017-03-30 00:40:55	[1412408.713280] Kernel panic - not syncing: Fatal Machine check
2017-03-30 00:40:55	[1412408.719091] Pid: 0, comm: swapper Tainted: GF  M       ---------------    2.6.32-358.23.2.ali1233.el5.x86_64 #1
2017-03-30 00:40:55	[1412408.729479] Call Trace:
2017-03-30 00:40:55	[1412408.732158]  <#MC>  [] ? panic+0xd6/0x1d0
2017-03-30 00:40:55	[1412408.738002]  [] ? notifier_call_chain+0x21/0x90
2017-03-30 00:40:55	[1412408.744334]  [] ? __ratelimit+0xbd/0xe0
2017-03-30 00:40:55	[1412408.749973]  [] ? print_mce+0xf1/0x150
2017-03-30 00:40:55	[1412408.755522]  [] ? mce_panic+0x20e/0x210
2017-03-30 00:40:55	[1412408.761156]  [] ? do_machine_check+0x9b8/0x9c0
2017-03-30 00:40:55	[1412408.767402]  [] ? machine_check+0x1c/0x30
2017-03-30 00:40:55	[1412408.773214]  [] ? intel_idle+0xb4/0x180
2017-03-30 00:40:55	[1412408.778846]  <>  [] ? menu_select+0xee/0x370
2017-03-30 00:40:56	[1412408.785370]  [] ? cpuidle_idle_call+0x99/0x140
2017-03-30 00:40:56	[1412408.791616]  [] ? cpu_idle+0xa8/0xe0
2017-03-30 00:40:56	[1412408.796995]  [] ? start_secondary+0x226/0x360
```



# 参考

* [Kernel panic with "NETDEV WATCHDOG: eth0 (bnx2): transmit queue 2 timed out" error](https://kb.plesk.com/en/121971)
