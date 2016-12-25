# MCE故障

线上多台服务器连续出现异常宕机重启，在OOB带外日志显示首先出现网卡`bnx2`的`NETDEV WATCHDOG`报告传输队列超时（Call Trace），同时出现CPU `[Hareware Error]` 显示 `Machine Check Exception: 4 Bank 5: be00000000800400`:

* [#9775121](https://aone.alibaba-inc.com/issue/9775121) 2016-12-22 09:43:59 AY71V e74d10542.cloud.em21(10.153.170.63)

```
2016-12-03 19:08:42    [14874902.828670] ------------[ cut here ]------------
2016-12-03 19:08:42    [14874902.833622] WARNING: at net/sched/sch_generic.c:261 dev_watchdog+0x263/0x270() (Tainted: GF          ---------------   )
2016-12-03 19:08:42    [14874902.844875] Hardware name: PowerEdge R510
2016-12-03 19:08:42    [14874902.849212] NETDEV WATCHDOG: slave0 (bnx2): transmit queue 5 timed out
2016-12-03 19:08:42    [14874902.856068] Modules linked in: kvm_intel_0 ksplice_etuw1mmg_vmlinux_new ksplice_etuw1mmg havs(F) kvm_intel_1 ksplice_ubnyr3k6_vmlinux_new ksplice_ubnyr3k6 sch_sfq act_police cls_u32 sch_ingress xt_mac xt_state mptctl mptbase nbd tcp_diag inet_diag nfnetlink_queue igb nfnetlink xt_conntrack ipt_REJECT ip6table_filter ip6_tables arpt_nfqueue cls_fw sch_htb ebt_mark ebt_arp arptable_filter arp_tables autofs4 ipmi_devintf ipmi_si ebtable_filter ebtable_nat flow_acl(F) iptable_filter ip_tables nf_conntrack_ipv4 nf_defrag_ipv4 bonding ipv6 8021q garp ext4 jbd2 dm_mirror dm_multipath video output sbs sbshc acpi_pad acpi_ipmi ipmi_msghandler vhost_net(F) macvtap(F) macvlan(F) parport turbo_proxy tun slb_ctk_proxy(F) ruleset patch_cksum kvm flow_mark flow_filter nf_conntrack flow_ctk(F) vpc_session(F) classic_traceroute(F) ebt_fnat(F) ebtable_broute(F) ebtables(F) bridge stp llc avs_hotfix slb_ctk_session alivrouter(F) flow_qos(F) sg power_meter iTCO_wdt iTCO_vendor_support bnx2 serio_raw i7core_edac edac_core dcdbas lpc_ich mfd_core dm_raid45 dm_memcache dm_region_hash dm_log dm_mod shpchp ext3 jbd mbcache virtio_pci virtio_blk virtio virtio_ring raid456 async_pq async_xor xor async_memcpy async_raid6_recov raid6_pq async_tx raid10 raid1 raid0 mpt2sas scsi_transport_sas raid_class hpsa cciss [last unloaded: kvm_intel_0]
2016-12-03 19:08:43    [14874902.975946] Pid: 0, comm: swapper Tainted: GF          ---------------    2.6.32-358.23.2.ali1233.el5.x86_64 #1
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
2016-12-03 19:08:52    [14874912.048401] Pid: 0, comm: swapper Tainted: GF  M    W  ---------------    2.6.32-358.23.2.ali1233.el5.x86_64 #1
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

上述Call Trace和Kernel panic的记录中，有一些值得学习和分析的内容：

* [污染的内核(tainted kernel)是什么意思](tainted_kernel)

当出现machine check exception (MCE) 的时候，硬件出现问题，此时会设置一个`taint state`（污染状态），一旦设置了内核`已经污染`(`tainted`)，则只能通过重启系统重新加载内核才能unset这个污染状态。

# Machine Check Exceptions (MCE)

主机检测异常是通过主机的CPU处理器检测到的错误。有2种主要的MCE错误类型：警告类错误(notice or warning error)，和致命异常（fatal exception）。

* 警告类错误(notice or warning error)将通过一个"Machine Check Event logged"消息记录到系统日志中，然后可以通过一些Linux哦你工具事后查看。
* 致命异常（fatal exception）则导致主机停止响应，MCE的详细信息将输出到系统的控制台。

## 哪些会导致MCE错误

常见的MCE错误原因包括：

* 内存错误或ECC(Error Correction Code)问题
* 冷却不充分/处理器过热
* 系统总线错误
* 处理器或硬件的缓存错误

## 如何查看MCE错误信息

如果在控制台或者系统日志中看到"Machine Check Events logged"，可以运行`mcelog`命令从内核读取信息。一旦你运行过`mcelog`，你就不能再运行`mcelog`来查看错误，所以最好将程序输出到文本文件，这样以后还可以分析，例如：

```
/usr/sbin/mcelog > mcelog.out
```

一些系统会周期性执行mcelog并将输出信息记录到文件 `/var/log/mcelog`。所以如果你看到"Machine Check Events logged"消息但是`mcelog`没有返回任何数据，请检查`/var/log/mcelog`。

## 分析致命的MCE

一些致命的MCE通常是硬件故障。需要捕获MCE消息，然后在主机恢复以后通过`mcelog`程序分析，以下是一个线上宕机的控制台输出

```
2016-12-21 16:07:49    [2592938.163474] [Hardware Error]: CPU 6: Machine Check Exception: 0 Bank 8: 88000040000200cf
2016-12-21 16:07:49    [2592938.163513] Clocksource tsc unstable (delta = -17179860571 ns).  Enable clocksource failover by adding clocksource_failover kernel parameter.
2016-12-21 16:07:50    [2592938.414712] [Hardware Error]: TSC 0 MISC 98873a2000043000 
```

将MCE错误信息记录到文本`mce_error`如下

```
CPU 6: Machine Check Exception: 0 Bank 8: 88000040000200cf
TSC 0 MISC 98873a2000043000 
```

然后执行

```
mcelog --ascii < mce_error
```

解析显示是内存的可纠正错误（corrected error）

```
Hardware event. This is not a software error.
CPU 6 BANK 8
MISC 98873a2000043000
MCG status:
MCi status:
Corrected error
MCi_MISC register valid
MCA: MEMORY CONTROLLER MS_CHANNELunspecified_ERR
Transaction: Memory scrubbing error
STATUS 88000040000200cf MCGSTATUS 0
```

现在我们来分析上文宕机故障中控制台输出的MCE错误消息

```
CPU 19: Machine Check Exception: 4 Bank 5: be00000000800400
TSC 7ebbc5c7e698b4 ADDR 1579aa6 
PROCESSOR 0:206c2 TIME 1480763330 SOCKET 0 APIC 11
CPU 7: Machine Check Exception: 4 Bank 5: be00000000800400
TSC 7ebbc5c7e698c8 ADDR 1579aa6 
PROCESSOR 0:206c2 TIME 1480763330 SOCKET 0 APIC 10
Machine check: Processor context corrupt
```

通过`mcelog`分析输出可以看到

```
Hardware event. This is not a software error.
CPU 19 BANK 5 TSC 7ebbc5c7e698b4
MISC 0 ADDR 1579aa6
TIME 1480763330 Sat Dec  3 19:08:50 2016
MCG status:MCIP
MCi status:
Uncorrected error
Error enabled
MCi_MISC register valid
MCi_ADDR register valid
Processor context corrupt
MCA: Internal Timer error
STATUS be00000000800400 MCGSTATUS 4
CPUID Vendor Intel Family 6 Model 44
SOCKET 0 APIC 11
Hardware event. This is not a software error.
CPU 7 BANK 5 TSC 7ebbc5c7e698c8
MISC 0 ADDR 1579aa6
TIME 1480763330 Sat Dec  3 19:08:50 2016
MCG status:MCIP
MCi status:
Uncorrected error
Error enabled
MCi_MISC register valid
MCi_ADDR register valid
Processor context corrupt
MCA: Internal Timer error
STATUS be00000000800400 MCGSTATUS 4
CPUID Vendor Intel Family 6 Model 44
SOCKET 0 APIC 10
Machine check: Processor context corrupt
```

# 参考

* [What are Machine Check Exceptions (or MCE)?](http://www.advancedclustering.com/act-kb/what-are-machine-check-exceptions-or-mce/)
* [怎样诊断Machine-check Exception](http://linuxperf.com/?p=105)
