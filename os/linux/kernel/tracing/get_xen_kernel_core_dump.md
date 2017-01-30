> 在[获取内核core dump](get_kernel_core_dump)的实践中，我已经成功在使用KVM虚拟化的CentOS 7获得了操作系统内核core dump文件，但是在XEN环境中，同样的方法却没有成功。本文就是进一步排查问题所在原因的实践。

* 检查内核`core dump`存储位置

```
cat /proc/sys/kernel/core_pattern
```

显示配置了位置 - 这个配置可以在 `/etc/sysctl.conf` 中设置 `kernel.core_pattern = $PATH` 来实现

```
/cloud/data/corefile/core-%e-%p-%t-%h
```

* 检查内核启动参数中是否启用了`crashkernel`参数

```
grep --color crashkernel /boot/grub/grub.conf
```

> 这里看到内核启动参数中没有配置 `crashkernel=` 

* 检查`kdump`是否启动

```
chkconfig --list | grep kdump
```

> 这里目前看到 `kdump          	0:off	1:off	2:off	3:off	4:off	5:off	6:off` 显示系统没有配置 kdump 启用

* 在没有启动`kdump`之前，先尝试触发一次`SysRq`的core dump

```
echo c | sudo tee /proc/sysrq-trigger
```

此时在带外可以看到信息

```
2017-01-18 10:12:31	SysRq : Trigger a crash
2017-01-18 10:12:31	BUG: unable to handle kernel NULL pointer dereference at (null)
2017-01-18 10:12:31	IP: [] sysrq_handle_crash+0x16/0x20
2017-01-18 10:12:31	PGD 14b8f9067 PUD 19a30d067 PMD 0 
2017-01-18 10:12:31	Oops: 0002 [#1] SMP 
2017-01-18 10:12:31	last sysfs file: /sys/bus/pci/slots/3/address
...
2017-01-18 10:12:31	[] write_sysrq_trigger+0x3b/0x46
2017-01-18 10:12:31	[] proc_reg_write+0x74/0x8f
2017-01-18 10:12:31	[] vfs_write+0xb0/0x10a
2017-01-18 10:12:31	[] sys_write+0x4c/0x72
2017-01-18 10:12:31	[] system_call_fastpath+0x16/0x1b
2017-01-18 10:12:31	(XEN) Domain 0 crashed: 'noreboot' set - not rebooting.
```

不过重启系统之后，可以看到在 `/cloud/data/corefile/` 目录下并没有实现vmcore dump

* 修正启动内核参数增加 `crashkernel=64M@16M`

```
title  Linux Server (2.6.32.36-xen)
    root (hd0,0)
    kernel /xen-4.0.1.gz console=com1,vga com1=115200,8n1 dom0_mem=15814M dom0_max_vcpus=8 msi=1 iommu=off x2apic=off cpuidle=0 cpufreq=none no-xsave noreboot watchdog nmi=fatal
    module /vmlinuz-2.6.32.36-xen ro root=LABEL=/ biosdevname=0 console=hvc0 mem=18171M scsi_mod.scan=sync nmi_watchdog=1 crashkernel=64M@16M
    module /initrd-2.6.32.36-xen.img
```

* 启用`kdump`

```
chkconfig kdump on
```

检查 `chkconfig --list | grep kdump` 可以看到输出 `kdump          	0:off	1:off	2:on	3:on	4:on	5:on	6:off`

* 重启服务器使配置生效，使用`dmesg | grep crash` 可以看到

```
Command line: ro root=LABEL=/ biosdevname=0 console=hvc0 mem=18171M scsi_mod.scan=sync nmi_watchdog=1 crashkernel=64M@16M
Reserving 64MB of memory at 16MB for crashkernel (System RAM: 18171MB)
Kernel command line: ro root=LABEL=/ biosdevname=0 console=hvc0 mem=18171M scsi_mod.scan=sync nmi_watchdog=1 crashkernel=64M@16M
```

反复测试调整`crashkernel=`配置参数，但是还是没有成功

* 增加 `/etc/kdump.conf` 配置

```
ext4 /dev/sda6
path /apsara/dump
core_collector makedumpfile -c -d 31
extra_modules ahci megaraid_sas mpt2sas mptsas
```

* 再次触发kernel core dump

```
sudo echo c | sudo tee /proc/sysrq-trigger
```

不过，我感觉可能是没有存储到磁盘，因为带外显示

```
Kernel panic - not syncing: Fatal exception
...
2017-01-18 11:33:58	(XEN) Domain 0 crashed: rebooting machine in 5 seconds.
2017-01-18 11:34:03	(XEN) Resetting with ACPI MEMORY or I/O RESET_REG.
```

5秒钟时间可能太短了，磁盘不一定能够写完

* 重启服务器后再检查 `/cloud/data/corefile/core-%e-%p-%t-%h` 目录依然没有找到crash dump文件

这个问题需要进一步排查