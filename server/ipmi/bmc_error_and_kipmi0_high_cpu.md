# 快速起步

如果你没有时间看完这篇文章，这里有一个快速起步的三板斧：

* BMC故障导致`IPMI`接口无响应，会导致大量`ipmitool`监控hang住占用系统资源（目前监控框架已经修改，超过10个`ipmitool`进程将不再发器新IMPI监控指令），此时`top`显示系统负载极高，同时没有实际CPU占用程序，也没有`iowait`，却有一个100%占用CPU的`kipmi0`进程。
* 修复BMC的手段是`reset cold`，请依次通过如下方法尝试修复：
  * 在操作系统内执行 `ipmitool mc reset cold` - 有一定概率能冷重启BMC
  * 通过移除`ipmi`相关内核模块解决`kipmi0`占用CPU资源问题：`rmmod ipmi_si` - 这个步骤不解决BMC无响应故障，但通过关闭ipmi接口可以解决系统负载问题
  * 终极大招：通过OOB管理服务器向服务器管理IP发送指令`ipmitool -I lanplus -H <oob_ip> -U <username> -P <passwd> mc reset cold`冷重启BMC

如果你还有兴趣，请看以下排查故障的过程：

# 故障现象

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

上述故障的特征是：

* 系统load负载极高，但是应用程序运行占用的CPU资源很低，并且没有`iowait`（表明没有磁盘故障）
* 系统有一个`kipmi0`进程接近100%占用了一个CPU资源

检查可以看到这个系统中有大量的`ipmitool`进程，显示很多ipmi监控脚本都么有执行完一直卡在系统中，大量消耗系统资源。

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

# 故障排除笔记

## 操作系统内`mc reset cold`

这个故障现象以前发现过，是因为带外oob控制器死机导致无法响应查询。彻底解决的方法是cold reset带外设备，如果cold reset无效则需要维修带外设备。

如果能够登录服务器，则可以在改服务器操作系统内部执行`mc reset cold`。如果幸运地冷重启BMC，则可以看到`top` 中的 `ipmitool0` 进程 占用的cpu资源迅速从 100% 降低到0。

```
ipmitool mc reset cold
```

如果操作系统内部执行`ipmitool`命令会没有响应。则可以尝试卸载ipmi内核模块或者通过带外重启MC

## 卸载ipmi模块

首先可以尝试卸载ipmi内核模块

检查ipmi内核模块

```
lsmod | grep ipmi
```

可以看到操作系统使用了如下内核模块

```
ipmi_devintf            7429  0
ipmi_si                44127  0
acpi_ipmi               3836  0
ipmi_msghandler        37887  3 ipmi_devintf,ipmi_si,acpi_ipmi
```

卸载内核模块`ipmi_devintf`(针对IPMI驱动的用户端IOCTL接口，每个为这个设备打开文件将绑定到消息处理器message handler作为一个IPMI用户)

> 此时`kipmi0`负载没有降低

尝试卸载内核模块`ipmi_si`（不同系统接口的驱动）

```
rmmod ipmi_si
```

**GOOD**，可以看到`kipmi0`进程的100%负载立即降低到0。

> 参考 [Kipmi0 eating up to 99.8% cpu on centos 6.4](https://unix.stackexchange.com/questions/74900/kipmi0-eating-up-to-99-8-cpu-on-centos-6-4/74928#74928?newreg=a5cb4cd02d364196aced94b6c7834ecd) 的建议方法，采用卸载`ipmi_si`和`ipmi_msghandler`可以解决`kimpi0`负载高的问题。
>
> 注意：卸载内核模块要按照模块引用计数器来卸载，引用计数为0的模块先卸载，所以先卸载`ipmi_devintf`,`ipmi_si`和`acpi_ipmi`，然后再卸载`ipmi_msghandler`。

继续将所有`ipmi`模块都卸载掉

```
rmmod acpi_ipmi
ipmi_msghandler
```

确定所有`ipmi`模块都卸载之后，尝试过`sudo /etc/init.d/ipmi start`，发现会导致`modprobe ipmi_si`进程D住：

```
root     15528  1.1  0.0   4016   712 pts/0    D+   10:31   0:01 modprobe ipmi_si
```

```
$ps r -A
  PID TTY      STAT   TIME COMMAND
15528 pts/0    D+     0:02 modprobe ipmi_si
24986 pts/1    R+     0:00 ps r -A
```

说明IPMI驱动接口内核模块无法启动，检查堆栈可以看到`sys_init_module`内核函数没有返回

```
$sudo cat /proc/15528/stack
[<ffffffffa04667c8>] wait_for_msg_done+0x38/0x70 [ipmi_si]
[<ffffffffa0466a88>] try_smi_init+0x288/0x820 [ipmi_si]
[<ffffffffa046bdc8>] init_ipmi_si+0x5e8/0xb00 [ipmi_si]
[<ffffffff81002046>] do_one_initcall+0x36/0x1c0
[<ffffffff810b59ff>] sys_init_module+0xef/0x260
[<ffffffff8100cf72>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

要重新卸载`ipmi_si`内核模块，首先要确保这个文件没有打开，否则会提示`in use`

```
#rmmod ipmi_si
ERROR: Module ipmi_si is in use
```

检查打开到文件句柄

```
#lsof | grep ipmi
modprobe  15528   root    3uw     REG                8,2       92280               606830 /lib/modules/2.6.32-358.23.2.ali1195.el5.x86_64/kernel/drivers/char/ipmi/ipmi_si.ko
```

杀掉进程`15528`之后查看再查看内核模块

```
ipmi_si                44127  0
ipmi_msghandler        37887  1 ipmi_si
```

注意：这里虽然看上去`ipmi_si`模块已经加载到内核，实际上`ipmi0`设备文件初始化没有成功，导致`/dev/ipmi0`设备不存在，无法通过`ipmitool`进行操作，例如

```
#ipmitool mc reset cold
Could not open device at /dev/ipmi0 or /dev/ipmi/0 or /dev/ipmidev/0: No such file or directory
Could not open device at /dev/ipmi0 or /dev/ipmi/0 or /dev/ipmidev/0: No such file or directory
Sent cold reset command to MC
```

实际可能硬件存在故障，无法初始化驱动

检查集群中其他服务器的`/dev/ipmi0`设备，可以看到

```
crw------- 1 root root 247, 0 Jun  3  2015 /dev/ipmi0
```

所以尝试在这台故障服务器上手工创建设备文件

```
cd /dev
mknod ipmi0 c 247 0
```

> 尝试使用`sh MAKEDEV ipmi0`提示错误`MAKEDEV: MAKEDEV: cannot execute binary file`，没有明白^_^

不过，实践发现内核模块`ipmi_si`没有正确加载情况下，即使手工创建`/dev/ipmi0`设备文件也无法执行`mc reset cold`，报错依旧。

## 终极大招：OOB带外`mc reset cold`

从带外oob管理机直接oob设备发reset指令。

```
ipmitool -I lanplus -H <oob_ip> -U <username> -P <passwd> chassis power status
```

如果电源状态能够检查到，就说明至少通过网络访问oob是正常的，此时可以尝试通过`ipmitool`的`lanplus`方式`冷启动一下`

```
ipmitool -I lanplus -H <oob_ip> -U <username> -P <passwd> mc reset cold
```

前面手工`mknod ipmi0 c 247 0`创建的设备文件已定要先删除，否则即使`mc reset cold`之后再启动`service ipmi start`系统日志还会显示报错，并且导致`modprobe ipmi_si`进程D住：

```
Feb 20 13:07:51 server1.example.com kernel: : [54240346.738217] ipmi message handler version 39.2
Feb 20 13:07:51 server1.example.com kernel: : [54240346.755812] ipmi_si: Adding SMBIOS-specified kcs state machine
Feb 20 13:07:51 server1.example.com kernel: : [54240346.755880] ipmi_si: Adding ACPI-specified kcs state machine: duplicate interface
Feb 20 13:07:51 server1.example.com kernel: : [54240346.755884] ipmi_si: Trying SMBIOS-specified kcs state machine at i/o address 0xca8, slave address 0x20, irq 0
```

实际修复是通过**终极大招**OOB带外`mc reset cold`来修复完成：

* 操作系统内部由于BMC无响应，所以无法重新加载`ipmi_si`内核模块，所以也无法在操作系统内部`ipmitool mc reset cold`
* 如果带外能够通过`lanplus`接口`reset cold`一次BMC，则会恢复操作系统内部和BMC的通讯，所以这个方法修复的可能性较高。

# 参考

* [Kipmi0 eating up to 99.8% cpu on centos 6.4](https://unix.stackexchange.com/questions/74900/kipmi0-eating-up-to-99-8-cpu-on-centos-6-4/74928#74928?newreg=a5cb4cd02d364196aced94b6c7834ecd)