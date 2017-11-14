在MacBook Pro上安装了Fedora 26操作系统，桌面是LXQt，设置了合上笔记本屏幕就进入suspend，但是，非常头疼的时，过几秒种就立即启动起来，导致笔记本放在包里面烫得不得了（和烧热的铁板一样）。

检查message日志显示系统suspended之后，立即被ACPI唤醒

```
...
Nov  7 21:23:04 DevStudio kernel: smpboot: CPU 4 is now offline
Nov  7 21:23:04 DevStudio kernel: IRQ 33: no longer affine to CPU5
Nov  7 21:23:04 DevStudio kernel: smpboot: CPU 5 is now offline
Nov  7 21:23:04 DevStudio kernel: IRQ 18: no longer affine to CPU6
Nov  7 21:23:04 DevStudio kernel: smpboot: CPU 6 is now offline
Nov  7 21:23:04 DevStudio kernel: smpboot: CPU 7 is now offline
Nov  7 21:23:04 DevStudio kernel: ACPI: Low-level resume complete
Nov  7 21:23:04 DevStudio kernel: ACPI: EC: EC started
Nov  7 21:23:04 DevStudio kernel: PM: Restoring platform NVS memory
Nov  7 21:23:04 DevStudio kernel: Suspended for 2.688 seconds
Nov  7 21:23:04 DevStudio kernel: Enabling non-boot CPUs ...
Nov  7 21:23:04 DevStudio kernel: x86: Booting SMP configuration:
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 1 APIC 0x2
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu1 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU1 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 2 APIC 0x4
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu2 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU2 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 3 APIC 0x6
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu3 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU3 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 4 APIC 0x1
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu4 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU4 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 5 APIC 0x3
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu5 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU5 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 6 APIC 0x5
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu6 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU6 is up
Nov  7 21:23:04 DevStudio kernel: smpboot: Booting Node 0 Processor 7 APIC 0x7
Nov  7 21:23:04 DevStudio kernel: cache: parent cpu7 should not be sleeping
Nov  7 21:23:04 DevStudio kernel: CPU7 is up
Nov  7 21:23:04 DevStudio kernel: ACPI: Waking up from system sleep state S3
```

导致上述休眠（suspended）之后立即被唤醒，是因为ACPI电源管理`wakeup`中有某个激活的设备触发导致的。具体是哪个设备需要检查自己笔记本的配置。

* 检查`wakeup`事件：

```
cat /proc/acpi/wakeup
```

在我的笔记上上显示输出

```
Device  S-state   Status   Sysfs node
P0P2      S3    *disabled  pci:0000:00:01.0
GFX0      S3    *disabled  pci:0000:01:00.0
PEG1      S3    *disabled  pci:0000:00:01.1
EC        S4    *disabled  platform:PNP0C09:00
GMUX      S3    *disabled  pnp:00:03
HDEF      S3    *disabled  pci:0000:00:1b.0
RP03      S3    *disabled  pci:0000:00:1c.2
ARPT      S4    *disabled  pci:0000:03:00.0
RP04      S3    *disabled  pci:0000:00:1c.3
RP05      S3    *disabled  pci:0000:00:1c.4
XHC1      S3    *enabled   pci:0000:00:14.0
ADP1      S4    *disabled  platform:ACPI0003:00
LID0      S4    *enabled   platform:PNP0C0D:00
```

也就是说，系统中有两个可能触发唤醒的设备分别如下

```
Device  S-state   Status   Sysfs node
XHC1      S3    *enabled   pci:0000:00:14.0
LID0      S4    *enabled   platform:PNP0C0D:00
```

* 要尝试禁用某个设备唤醒，只要将这个设备`echo`到`/proc/acpi/wakeup`就可以关闭

```
echo XHC1 | sudo tee /proc/acpi/wakeup
```

* 然后再次检查`wakeup`事件，就可以看到只有`LID0`可以唤醒系统

```
Device  S-state   Status   Sysfs node
P0P2      S3    *disabled  pci:0000:00:01.0
GFX0      S3    *disabled  pci:0000:01:00.0
PEG1      S3    *disabled  pci:0000:00:01.1
EC        S4    *disabled  platform:PNP0C09:00
GMUX      S3    *disabled  pnp:00:03
HDEF      S3    *disabled  pci:0000:00:1b.0
RP03      S3    *disabled  pci:0000:00:1c.2
ARPT      S4    *disabled  pci:0000:03:00.0
RP04      S3    *disabled  pci:0000:00:1c.3
RP05      S3    *disabled  pci:0000:00:1c.4
XHC1      S3    *disabled  pci:0000:00:14.0
ADP1      S4    *disabled  platform:ACPI0003:00
LID0      S4    *enabled   platform:PNP0C0D:00
```

再次验证就发现休眠作用已经工作正常。

另外，如果要禁用多个设备，如`XHC EHC1 EHC2`，可以使用如下脚本

```bash
for device in XHC EHC1 EHC2; do
    grep $device /proc/acpi/wakeup | grep enabled > /dev/null && {
        echo Disabling wakeup on $device 
        echo $device > /proc/acpi/wakeup
    }
done
```

> 将上述设置添加到启动`/etc/rc.local`脚本中，参考[systemd管理rc.local启动](../../redhat/system_administration/systemd/rc_local)

# 参考

* [Ubuntu wakes up after few seconds of sleep](https://askubuntu.com/questions/598236/ubuntu-wakes-up-after-few-seconds-of-sleep)