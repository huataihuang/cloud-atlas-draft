# 故障发现过程

线上`11.180.164.140`服务器在9月29日晚上19:19:10由于监控发现服务器无响应自动从带外重启了服务器。

检查带外日志显示`systemd`服务无法将日志刷新到持久化存储，所以我第一个怀疑是磁盘出现了故障

```
2016-09-29 18:02:54	Kernel 3.10.0-327.ali2003.alios7.x86_64 on an x86_64
2016-09-29 18:27:02	[3397246.501990] systemd[1]: systemd-journald.service watchdog timeout (limit 1min)!
2016-09-29 18:30:43	[3397468.708269] systemd[1]: systemd-journald.service watchdog timeout (limit 1min)!
2016-09-29 18:30:43	[3397468.716391] systemd[1]: Failed to start Flush Journal to Persistent Storage.
2016-09-29 18:30:43	[3397468.724090] systemd[1]: systemd-logind.service watchdog timeout (limit 1min)!
2016-09-29 18:31:35	[3397520.560464] systemd-logind[45352]: Failed to add match for NameOwnerChanged: Connection timed out
2016-09-29 18:31:45	[3397530.606574] systemd-logind[45352]: Failed to fully start up daemon: Connection timed out
2016-09-29 18:31:53	[3397538.414878] systemd[1]: Failed to start Login Service.
2016-09-29 18:43:42	[3398248.010794] systemd[1]: Failed to start Login Service.
2016-09-29 18:44:17	[3398283.777131] systemd-logind[45433]: Failed to add match for NameOwnerChanged: Connection timed out
2016-09-29 18:44:28	[3398293.841555] systemd-logind[45433]: Failed to fully start up daemon: Connection timed out
2016-09-29 18:45:31	[3398357.253961] systemd[1]: Failed to start Login Service.
2016-09-29 18:46:45	[3398431.147269] systemd[1]: Failed to start Journal Service.
2016-09-29 18:46:45	[3398431.153047] systemd[1]: Dependency failed for Flush Journal to Persistent Storage.
2016-09-29 18:47:02	[3398447.580644] systemd[1]: Failed to start Login Service.
2016-09-29 18:48:30	[3398536.599525] systemd[1]: Failed to start Journal Service.
2016-09-29 18:48:30	[3398536.605380] systemd[1]: Dependency failed for Flush Journal to Persistent Storage.
2016-09-29 18:49:57	[3398623.413137] systemd[1]: Failed to start Login Service.
2016-09-29 19:25:05	[2J[1;1H[2J[1;1H[0m[1m[1;1H[0m[2m[2J[1;1H[7;1H[0m[2m[7;1HVersion 2.17.1249. Copyright (C) 2016 American Megatrends, Inc. 
```

从OOB带外检查

```
 18a | 09/29/2016 | 19:19:10 | Unknown #0xcb |  | Asserted
 18b | 09/29/2016 | 19:19:14 | System ACPI Power State #0xc1 | S4/S5: soft-off | Asserted
 18c | 09/29/2016 | 19:24:11 | System ACPI Power State #0xc1 | S0/G0: working | Asserted
 18d | 09/29/2016 | 19:24:11 | Unknown #0xcb |  | Asserted
 18e | 09/30/2016 | 03:24:35 | System Boot Initiated #0xe0 | Initiated by power up | Asserted
 18f | 09/29/2016 | 19:25:26 | Unknown #0xcb |  | Asserted
 190 | 09/29/2016 | 19:25:48 | System Boot Initiated #0xe0 | Initiated by power up | Asserted
```

> 这里出现的`S4/S5: soft-off`我最初以为是电源管理出现了休眠的bug，但是发现过两次磁盘故障出现之后再出现`S4/S5: soft-off`，所以也怀疑这个报错可能是存储无响应以后触发的一个bug（也可能是存储无响应以后系统硬件以为是进入了磁盘休眠的一个误报警日志）

检查操作系统日志 `/var/log/kern` 发现在故障之前出现过一个异常的`segfault`

```
Sep 29 16:23:58 a20b09504 kernel: get_server_proc[39459]: segfault at 3 ip 00007f950ba428bc sp 00007ffe239171d0 error 4 in libc-2.17.so[7f950b9c3000+1b6000]
Sep 29 16:26:06 a20b09504 kernel: ixgbe 0000:01:00.1 eth1: VF Reset msg received from vf 1
Sep 29 16:32:17 a20b09504 kernel: ixgbe 0000:01:00.1 eth1: VF Reset msg received from vf 1
Sep 29 18:41:28 a20b09504 kernel: ixgbe 0000:01:00.1 eth1: VF Reset msg received from vf 1
Sep 29 18:41:29 a20b09504 kernel: ixgbe 0000:01:00.0 eth0: VF Reset msg received from vf 1
Sep 29 18:53:09 a20b09504 kernel: ixgbe 0000:01:00.0 eth0: VF Reset msg received from vf 1
Sep 29 19:03:11 a20b09504 kernel: ixgbe 0000:01:00.1 eth1: VF Reset msg received from vf 1
Sep 29 19:03:22 a20b09504 kernel: ixgbe 0000:01:00.1 eth1: VF Reset msg received from vf 1
```

由于这个`segfault`是由于`get_server_proc`触发的，所以检查系统

```
locate get_server_proc
```

显示有如下的文件相关，并且有core文件

```
/apsara/cloud/data/corefile/core-get_server_proc-39459-1475137438-a20b09504.et2
/apsara/cloud/data/corefile/core-get_server_proc-43588-1474617647-a20b09504.et2
/apsara/cloud/data/tianji/TianjiClient#/core_dump_manager/detail_core_dump_info/CoreDumpDetailInfo.1474617647.L2Nsb3VkL2RhdGEvY29yZWZpbGUvY29yZS1nZXRfc2VydmVyX3Byb2MtNDM1ODgtMTQ3NDYxNzY0Ny1hMjBiMDk1MDQuZXQy.core-get_server_proc-43588-1474617647-a20b09504.et2
/apsara/cloud/data/tianji/TianjiClient#/core_dump_manager/detail_core_dump_info/CoreDumpDetailInfo.1475137438.L2Nsb3VkL2RhdGEvY29yZWZpbGUvY29yZS1nZXRfc2VydmVyX3Byb2MtMzk0NTktMTQ3NTEzNzQzOC1hMjBiMDk1MDQuZXQy.core-get_server_proc-39459-1475137438-a20b09504.et2
/usr/alisys/dragoon/libexec/alimonitor/get_server_process_count
/usr/alisys/dragoon/libexec/monitor/server/get_server_process_count
/usr/alisys/dragoon/libexec/monitor/server/get_server_process_status
```

# 参考

