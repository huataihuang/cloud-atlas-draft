迁移GUEST ubuntu 14.04.2 LTS ，虚拟机 example-server-1 （实例配置8c16g）从 nc-1 迁移到 nc-2 ，控制系统显示迁移失败

目标nc 上显示迁移过程启动的实例没有响应

```
2017-02-24 07:45:41.636+0000: 32748: warning : qemuProcessPrepareMonitorChr:2760 : Domain example-server-1 monitor chr /var/lib/libvirt/qemu/example-server-1.monitor.0.m0
2017-02-24 07:45:41.724+0000: 32748: warning : virInitAvsVersion:50 : avs: find avs version version : avs_v3
.

2017-02-24 07:45:42.027+0000: 32748: warning : qemuDomainObjTaint:1807 : Domain id=1013 name='example-server-1' uuid=f22f1752-e4b8-4643-bf36-9dce68268c96 is tainted: high-privileges
2017-02-24 07:45:42.027+0000: 32748: warning : qemuDomainObjTaint:1807 : Domain id=1013 name='example-server-1' uuid=f22f1752-e4b8-4643-bf36-9dce68268c96 is tainted: host-cpu
2017-02-24 07:45:42.240+0000: 32748: warning : qemuProcessWaitForMonitor:1945 : Connect monitor to 0x2b0c673105d0 'example-server-1'
2017-02-24 07:45:42.440+0000: 32748: warning : qemuDomainObjEnterMonitorInternal:1435 : This thread seems to be the async job owner; entering monitor without asking for a nested job is dangerous
2017-02-24 07:45:43.538+0000: 32748: warning : qemuDomainObjEnterMonitorInternal:1435 : This thread seems to be the async job owner; entering monitor without asking for a nested job is dangerous
...
2017-02-24 07:45:45.199+0000: 32743: warning : qemuMonitorEmitMIGSubStatusChanged:1374 : mon=0x2b0c672eb190 migration sub-status changed to 1008300
2017-02-24 07:46:12.001+0000: 32745: warning : qemuDomainObjBeginJobInternalCore:1248 : Cannot start job (modify, none) for domain example-server-1; current job is (none, migration in) owned by (0, 0)
2017-02-24 07:46:12.001+0000: 32745: error : qemuDomainObjBeginJobInternalCore:1253 : Timed out during operation: cannot acquire state change lock
2017-02-24 07:46:14.000+0000: 32747: warning : qemuDomainObjBeginJobInternalCore:1248 : Cannot start job (modify, none) for domain example-server-1; current job is (none, migration in) owned by (0, 0)
2017-02-24 07:46:14.000+0000: 32747: error : qemuDomainObjBeginJobInternalCore:1253 : Timed out during operation: cannot acquire state change lock
2017-02-24 07:46:30.447+0000: 32743: warning : virKeepAliveTimerInternal:140 : No response from client 0x2b0c673355a0 after 5 keepalive messages in 30 seconds
2017-02-24 07:46:30.447+0000: 32743: warning : virKeepAliveTimerInternal:140 : No response from client 0x2b0c672f8660 after 5 keepalive messages in 30 seconds
```

观察监控，这个vm的CPU负载低于40%，磁盘iops个位数，公网流量很低

通过VNC观察vm内部，存在进程OOM情况(运行的是ruby程序)

今天又迁移一台 GUEST ubuntu 14.04.2 LTS ，迁移显示失败，但是控制系统显示已经成功迁移到目标nc上。同样在VNC带外看到进程OOM现象：

```
Out of memory: Kill process 19925 (php) score 4 or sacrifice child
Killed process 19925 (php) total-vm: 188228kB, anon-rss:4240kB, file-rss:0kB
Out of memory: Kill process 20010 (php) score 4 or sacrifice child
Killed process 20010 (php) total-vm: 190376kB, anon-rss:4176kB, file-rss:388kB
```
