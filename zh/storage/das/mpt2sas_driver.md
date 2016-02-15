# LSI Fusion MPT SAS2

# 常见报错

`/var/log/messages`日志中不断出现`hard reset`，表明存储卡出现异常

```
Feb 14 10:53:28 host1.example kernel: : mpt2sas0: fault_state(0x5841)!
Feb 14 10:53:28 host1.example kernel: : mpt2sas0: sending diag reset !!
...
Feb 14 11:14:27 host1.example kernel: : mpt2sas0: fault_state(0x5841)!
Feb 14 11:14:27 host1.example kernel: : mpt2sas0: sending diag reset !
...
Feb 14 11:25:30 host1.example kernel: : mpt2sas0: fault_state(0x5841)!
Feb 14 11:25:30 host1.example kernel: : mpt2sas0: sending diag reset !!
Feb 14 11:25:30 host1.example kernel: : mpt2sas0: fault_state(0x5841)!
Feb 14 11:25:30 host1.example kernel: : mpt2sas0: sending diag reset !!
Feb 14 11:25:31 host1.example kernel: : mpt2sas0: diag reset: SUCCESS
Feb 14 11:25:31 host1.example kernel: : mpt2sas0: diag reset: SUCCESS
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: LSISAS2008: FWVersion(08.00.09.00), ChipRevision(0x03), BiosVersion(07.15.00.00)
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: Protocol=(Initiator,Target), Capabilities=(Raid,TLR,EEDP,Snapshot Buffer,Diag Trace Buffer,Task Set Full,NCQ)
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: sending port enable !!
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: port enable: SUCCESS
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_sas_devices
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: LSISAS2008: FWVersion(08.00.09.00), ChipRevision(0x03), BiosVersion(07.15.00.00)
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: Protocol=(Initiator,Target), Capabilities=(Raid,TLR,EEDP,Snapshot Buffer,Diag Trace Buffer,Task Set Full,NCQ)
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: sending port enable !!
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: port enable: SUCCESS
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_sas_devices
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_raid_devices
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_raid_devices
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_expanders
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _base_fault_reset_work: hard reset: success
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _scsih_search_responding_expanders
Feb 14 11:25:38 host1.example kernel: : mpt2sas0: _base_fault_reset_work: hard reset: success
...
Feb 14 13:46:48 host1.example kernel: : mpt2sas0: fault_state(0x5841)!
Feb 14 13:46:48 host1.example kernel: : mpt2sas0: sending diag reset !!
...
```

> 在系统监控中，应监控`messages`日志中出现的`kernel`关键字，往往是异常的端倪！

此时观察系统负载可以明显看到，在存储卡`hard reset`的时候，系统负载急剧升高

![mpt2sas hard reset high load](/img/storage/das/mpt2sas_reset_load.png)

**服务器RAID卡需要替换维修。**

# 参考

* [LSI Fusion MPT SAS2](http://hwraid.le-vert.net/wiki/LSIFusionMPTSAS2)