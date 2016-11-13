最近遇到用户反馈kvm虚拟机中运行的应用响应缓慢（RT较高），对物理服务器检查，意外发现系统有一个非常高的负载的`kipmi0`进程。这个`kipmi0`进程是和BMC通讯的，通常应该极少占用资源。

```
top - 20:05:20 up 87 days,  7:59,  2 users,  load average: 193.69, 113.92, 81.70
Tasks: 729 total,   3 running, 726 sleeping,   0 stopped,   0 zombie
%Cpu(s): 93.3 us,  3.7 sy,  0.0 ni,  3.1 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem : 19786745+total,  3874380 free, 19185401+used,  2139072 buff/cache
KiB Swap: 12582904 total, 12582904 free,        0 used.  5360364 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
16114 root      20   0 92.520g 0.088t   6588 S  3013 47.8  25928,15 qemu-kvm
10926 root      20   0 92.583g 0.088t   6264 S  3005 47.8  26079,01 qemu-kvm
11749 root      39  19       0      0      0 R 100.0  0.0  33718:35 kipmi0
```

检查可以看到这个系统中有大量的`ipmitool`进程，显示很多ipmi监控脚本都么有执行晚一直卡在系统中，大量消耗系统资源。

```
root     48830  0.0  0.0  23576  1344 ?        S    Oct18   0:00 /usr/bin/ipmitool mc info
root     48860  0.0  0.0  23576  1348 ?        S    04:57   0:00 /usr/bin/ipmitool mc info
root     48864  0.0  0.0  23576  1348 ?        SN   Oct19   0:00 /usr/bin/ipmitool -b 6 -t 0x2c raw 0x4 0x2d 0xbe
root     48877  0.0  0.0  23576  1344 ?        S    Oct04   0:00 /usr/bin/ipmitool mc info
root     48890  0.0  0.0  23576  1348 ?        S    Oct04   0:00 /usr/bin/ipmitool mc info
root     48901  0.0  0.0  23576  1344 ?        S    Oct16   0:00 /usr/bin/ipmitool mc info
root     48927  0.0  0.0  23576  1348 ?        S    Oct21   0:00 /usr/bin/ipmitool mc info
root     48953  0.0  0.0  23576  1344 ?        S    Oct15   0:00 /usr/bin/ipmitool mc info
```

选择检查其中一个`ipmtool`进程的stat，显示处于轮询等待中

```
$sudo cat /proc/65113/stack
[<ffffffff811edac5>] poll_schedule_timeout+0x55/0xb0
[<ffffffff811ee441>] do_select+0x6d1/0x7c0
[<ffffffff811ee70b>] core_sys_select+0x1db/0x300
[<ffffffff811ee8ea>] SyS_select+0xba/0x110
[<ffffffff8163e7c9>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff

$sudo cat /proc/65113/stat
65113 (ipmitool) S 1 13257 13257 0 -1 1077944320 501 0 0 0 0 0 0 0 20 0 1 0 596383532 24141824 336 18446744073709551615 4194304 4831636 140735297749936 140735297748856 140139888896403 0 0 15973 2 18446744071580867269 0 0 17 32 0 0 0 0 0 6932832 7041384 7581696 140735297752421 140735297752447 140735297752447 140735297753062 0
```

杀掉所有`ipmitool`进程可以缓解负载问题

```
for i in `ps auxf | grep ipmitool | awk '{print $2}'`; do sudo kill $i; done
```

这个故障现象以前发现过，是因为带外oob控制器死机导致无法响应查询。彻底解决的方法是cold reset带外设备，如果cold reset无效则需要维修带外设备。

> 不过，由于操作提供中`ipmitool`工具已经无法操作oob设备，所以只能通过带外oob管理机直接oob设备发reset指令。

```
ipmitool -I lanplus -H <oob_ip> -U <username> -P <passwd> chassis power status
```

如果电源状态能够检查到，就说明至少通过网络访问oob是正常的，此时可以尝试通过`ipmitool`的`lanplus`方式`冷启动一下`

```
ipmitool -I lanplus -H <oob_ip> -U <username> -P <passwd> mc reset cold
```

完成以后可以看到`top` 中的 `ipmitool0` 进程 占用的cpu资源迅速从 100% 降低到0