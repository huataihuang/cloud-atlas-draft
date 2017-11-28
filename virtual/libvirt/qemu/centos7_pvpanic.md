[pvpanic](libvirt_pvpanic)虚拟设备提供了在guest虚拟机crash时，传递信息给quemu进而传递给libvirt对应处理的方法。

结合[虚拟机串口控制台](../devices/vm_serial_console)可以在虚拟机crash时候对内核信息进行捕获，以便分析crash原因。

以下是在CentOS 7虚拟机内部模拟测试验证：

* 在guest虚拟机内部执行以下命令关闭（禁用）kdump

> kdump优先级高于pvpanic，所以需要先关闭kdump

```bash
sudo systemctl stop kdump
sudo systemctl disable kdump
```

* 在guest虚拟机内部执行以下命令通过SysRq触发一次内核core duump：

```
echo "1" | sudo tee /proc/sys/kernel/sysrq
echo c | sudo tee /proc/sysrq-trigger
```

* 如果设置了[虚拟机串口控制台](../devices/vm_serial_console)，则可以在控制台或控制台日志中观察到

```
[  280.987684] SysRq : Trigger a crash
[  280.988617] BUG: unable to handle kernel NULL pointer dereference at           (null)
[  280.990522] IP: [<ffffffff813fe606>] sysrq_handle_crash+0x16/0x20
[  280.991961] PGD 7a36e067 PUD 7a370067 PMD 0 
[  280.992929] Oops: 0002 [#1] SMP
...

```

此时，如果[libvirt日志](../log/libvirtd_log)启用了`libvirt`和`qemu` DEBUG模式，则可以看到`libvirtd.log`日志记录

```
2017-11-27 07:43:32.215+0000: 15440: debug : qemuMonitorEmitEvent:1326 : mon=0x7fb28c001d10 event=GUEST_PANICKED
2017-11-27 07:43:32.215+0000: 15440: debug : qemuProcessHandleEvent:638 : vm=0x7fb2883263f0
2017-11-27 07:43:32.215+0000: 15440: debug : qemuMonitorEmitGuestPanic:1395 : mon=0x7fb28c001d10
2017-11-27 07:43:32.215+0000: 15603: debug : virThreadJobSetWorker:77 : Thread 15603 is running worker qemuProcessEventHandler
2017-11-27 07:43:32.215+0000: 15603: debug : qemuProcessEventHandler:4745 : vm=0x7fb2883263f0, event=1
2017-11-27 07:43:32.215+0000: 15603: debug : qemuDomainObjBeginJobInternal:4005 : Starting async job: dump (vm=0x7fb2883263f0 name=centos7, current job=none async=none)
2017-11-27 07:43:32.215+0000: 15603: debug : qemuDomainObjBeginJobInternal:4054 : Started async job: dump (vm=0x7fb2883263f0 name=centos7)
2017-11-27 07:43:32.215+0000: 15603: debug : virFileMakePathHelper:2912 : path=/var/run/libvirt/qemu mode=0777
2017-11-27 07:43:32.216+0000: 15603: debug : virFileClose:110 : Closed fd 28
2017-11-27 07:43:32.217+0000: 15603: debug : virFileMakePathHelper:2912 : path=/var/run/libvirt/qemu mode=0777
2017-11-27 07:43:32.217+0000: 15603: debug : virFileClose:110 : Closed fd 28
2017-11-27 07:43:32.217+0000: 15603: debug : processGuestPanicEvent:4192 : Preserving lock state '<null>'
2017-11-27 07:43:32.217+0000: 15603: debug : qemuProcessStop:6086 : Shutting down vm=0x7fb2883263f0 name=centos7 id=2 pid=14416, reason=crashed, asyncJob=dump, flags=0
2017-11-27 07:43:32.217+0000: 15603: debug : qemuDomainObjBeginJobInternal:4005 : Starting job: async nested (vm=0x7fb2883263f0 name=centos7, current job=none async=dump)
2017-11-27 07:43:32.217+0000: 15603: debug : qemuDomainObjBeginJobInternal:4046 : Started job: async nested (async=dump vm=0x7fb2883263f0 name=centos7)
2017-11-27 07:43:32.221+0000: 15603: debug : virFileClose:110 : Closed fd 21
2017-11-27 07:43:32.221+0000: 15603: debug : qemuDomainLogAppendMessage:5035 : Append log message (vm='centos7' message='2017-11-27 07:43:32.221+0000: shutting down, reason=crashed
2017-11-27 07:43:32.222+0000: 15603: debug : virFileClose:110 : Closed fd 21
2017-11-27 07:43:32.222+0000: 15603: debug : virFileClose:110 : Closed fd 29
2017-11-27 07:43:32.223+0000: 15603: debug : virFileClose:110 : Closed fd 28
2017-11-27 07:43:32.223+0000: 15603: debug : virFileClose:110 : Closed fd 26
2017-11-27 07:43:32.223+0000: 15440: debug : qemuMonitorDispose:323 : mon=0x7fb28c001d10
2017-11-27 07:43:32.223+0000: 15603: debug : qemuProcessKill:6002 : vm=0x7fb2883263f0 name=centos7 pid=14416 flags=5
2017-11-27 07:43:32.223+0000: 15603: debug : virProcessKillPainfully:355 : vpid=14416 force=1
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:707 : dispatching to max 0 clients, called from event watch 7
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:720 : event not handled.
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:707 : dispatching to max 0 clients, called from event watch 7
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:720 : event not handled.
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:707 : dispatching to max 0 clients, called from event watch 7
2017-11-27 07:43:32.613+0000: 15440: debug : virNetlinkEventCallback:720 : event not handled.
2017-11-27 07:43:32.634+0000: 15440: debug : virNetlinkEventCallback:707 : dispatching to max 0 clients, called from event watch 7
2017-11-27 07:43:32.634+0000: 15440: debug : virNetlinkEventCallback:720 : event not handled.
2017-11-27 07:43:32.824+0000: 15603: debug : qemuDomainCleanupRun:5621 : driver=0x7fb2881a1970, vm=centos7
2017-11-27 07:43:32.824+0000: 15603: debug : qemuProcessAutoDestroyRemove:6709 : vm=centos7
2017-11-27 07:43:32.824+0000: 15603: debug : virCloseCallbacksUnset:162 : vm=centos7, uuid=2bff41b1-8d88-4f76-b716-604eb3267f48, cb=0x7fb2cc4198f0
2017-11-27 07:43:32.830+0000: 15603: debug : virSystemdTerminateMachine:429 : Attempting to terminate machine via systemd
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:622 : rootiter=0x7fb2b51267b0 types=s
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:634 : Loop nstack=0 narray=-1 nstruct=1 types='s'
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:715 : Appended basic type 'char *' varg 'char *' sig 's' val 'qemu-2-centos7'
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:634 : Loop nstack=0 narray=-1 nstruct=0 types=''
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:640 : Reset array ref
2017-11-27 07:43:32.830+0000: 15603: debug : virDBusMessageIterEncode:644 : Popping iter=0x7fb2b51267b0
2017-11-27 07:43:32.834+0000: 15603: debug : qemuDomainObjEndJob:4205 : Stopping job: async nested (async=dump vm=0x7fb2883263f0 name=centos7)
2017-11-27 07:43:32.836+0000: 15603: debug : qemuDomainObjEndAsyncJob:4222 : Stopping async job: dump (vm=0x7fb2883263f0 name=centos7)
2017-11-27 07:43:32.836+0000: 15603: debug : qemuDomainObjBeginJobInternal:4005 : Starting job: modify (vm=0x7fb2883263f0 name=centos7, current job=none async=none)
2017-11-27 07:43:32.836+0000: 15603: debug : qemuDomainObjBeginJobInternal:4046 : Started job: modify (async=none vm=0x7fb2883263f0 name=centos7)
2017-11-27 07:43:32.836+0000: 15603: debug : qemuDomainObjEndJob:4205 : Stopping job: modify (async=none vm=0x7fb2883263f0 name=centos7)
```

上述debug信息可以看出：默认发生vm panic事件，将dump虚拟机内存，然后停止vm。

* 设置虚拟机crash后自动重启

`libvirt`支持guest虚拟机crash时候进行相应的coredump和重启，以及一些有关电源管理的配置，例如以下XML的配置：

```xml
  <on_crash>coredump-restart</on_crash>
```

则在虚拟机crash时候自动触发coredump和重启虚拟机。

如果没有指定`<on_crash>`配置，则默认是关闭虚拟机

```xml
  <on_crash>destroy</on_crash>
```

# 进一步改进

当出现[libvirt pvpanic](libvirt_pvpanic)，结合[hook](../hook/hooks_for_specific_system_management)可以触发一些分析和处理脚本，通过[虚拟机串口控制台](../devices/vm_serial_console)就可以获得crash的原因。