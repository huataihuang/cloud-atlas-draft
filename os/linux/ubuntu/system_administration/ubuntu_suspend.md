# Ubuntu Suspend

遇到一个奇怪的问题，当退出Xfce4桌面时，屏幕是全黑，并没有返回到字符终端。此时主机实际上工作正常，远程ssh连接依然工作，可以正常远程操作主机。从合上笔记本屏幕，再次打开完全黑屏无响应看，似乎和电源管理有关。

系统日志显示确实进入了suspend的睡眠状态

```
   Mar 10 09:10:12 xcloud systemd-sleep[2322]: Suspending system...
   Mar 10 09:10:12 xcloud kernel: PM: suspend entry (deep)
```

之后我尝试按动键盘和启动电源按钮都没有响应，强制关机后再启动检查日志，在上述日志之后没有新的唤醒日志，所以怀疑是休眠存在异常无法唤醒。

检查启动日志确实存在ACPI报错

```
Mar 10 09:30:18 xcloud kernel: ACPI: BIOS _OSI(Darwin) query honored via DMI
Mar 10 09:30:18 xcloud kernel: ACPI: [Firmware Bug]: BIOS _OSI(Linux) query ignored
Mar 10 09:30:18 xcloud kernel: ACPI Error: Needed type [Reference], found [Integer]         (ptrval) (20170831/exresop-103)
Mar 10 09:30:18 xcloud kernel: ACPI Exception: AE_AML_OPERAND_TYPE, While resolving operands for [Store] (20170831/dswexec-461)
Mar 10 09:30:18 xcloud kernel: No Local Variables are initialized for Method [_PDC]
Mar 10 09:30:18 xcloud kernel: Initialized Arguments for Method [_PDC]:  (1 arguments defined for method invocation)
Mar 10 09:30:18 xcloud kernel:   Arg0:           (ptrval) <Obj>           Buffer(12) 01 00 00 00 01 00 00 00
Mar 10 09:30:18 xcloud kernel: ACPI Error: Method parse/execution failed \_PR.CPU0._PDC, AE_AML_OPERAND_TYPE (20170831/psparse-550)
```

# 排查

参考 [[持续更新][MacBook Pro] Deepin 15.7 遇到的几个问题和解决方法 ](https://bbs.deepin.org/forum.php?mod=viewthread&tid=169677) 是建议在内核启动参数添加 `acpi_osi=Linux  acpi_backlight=vendor` 以支持屏幕亮度调节。

在ACPI报错中可以看到：

```
Mar 10 09:30:18 xcloud kernel: ACPI: BIOS _OSI(Darwin) query honored via DMI
Mar 10 09:30:18 xcloud kernel: ACPI: [Firmware Bug]: BIOS _OSI(Linux) query ignored
```

我搜索了 `acpi_osi` 相关信息，看来这个参数通常要设置成 Windows

[archlinux: MacBookPro11,x](https://wiki.archlinux.org/index.php/MacBookPro11,x) 建议设置 `acpi_osi=Darwin` ，这样才能正常实现 suspend/hibernate。不过，我测试过设置这个参数，出现的报错信息依旧是:

```
Mar 10 13:28:04 xcloud kernel: ACPI: BIOS _OSI(Darwin) query honored via cmdline
Mar 10 13:28:04 xcloud kernel: ACPI: [Firmware Bug]: BIOS _OSI(Linux) query ignored
Mar 10 13:28:04 xcloud kernel: ACPI Error: Needed type [Reference], found [Integer] (____ptrval____) (20180531/exresop-69)
Mar 10 13:28:04 xcloud kernel: ACPI Error: AE_AML_OPERAND_TYPE, While resolving operands for [Store] (20180531/dswexec-427)
Mar 10 13:28:04 xcloud kernel: No Local Variables are initialized for Method [_PDC]
Mar 10 13:28:04 xcloud kernel: Initialized Arguments for Method [_PDC]:  (1 arguments defined for method invocation)
Mar 10 13:28:04 xcloud kernel:   Arg0:   (____ptrval____) <Obj>           Buffer(12) 01 00 00 00 01 00 00 00
Mar 10 13:28:04 xcloud kernel: ACPI Error: Method parse/execution failed \_PR.CPU0._PDC, AE_AML_OPERAND_TYPE (20180531/psparse-516)
```

从 [Red Hat Bugzilla – Bug 1459317](https://bugzilla.redhat.com/show_bug.cgi?id=1459317) 来看，这个问题在各个版本内核中始终存在。 从 [Red Hat Bugzilla – Bug 1458390](https://bugzilla.redhat.com/show_bug.cgi?id=1458390) 来看，这个问题在Intel的ACPI开发工程师来看是BIOS的bug。

参考 [What does the kernel boot parameter “set acpi_osi=Linux” do?](https://askubuntu.com/questions/28848/what-does-the-kernel-boot-parameter-set-acpi-osi-linux-do) 来看，这个是因为BIOS会查询操作系统的类型，例如 Windows/Linux/Darwin ，所以这里应该让Linux操作系统返回给BIOS表示自己是Darwin（macOS）。



# 参考

* [archlinux: MacBookPro11,x](https://wiki.archlinux.org/index.php/MacBookPro11,x)
* [Power savings setup| 20180906](https://forum.manjaro.org/t/howto-power-savings-setup-20180906/1445)
* [What do the kernel parameters acpi_osi=linux and acpi_backlight=vendor do?](https://unix.stackexchange.com/questions/110624/what-do-the-kernel-parameters-acpi-osi-linux-and-acpi-backlight-vendor-do)
* [What does the kernel boot parameter “set acpi_osi=Linux” do?](https://askubuntu.com/questions/28848/what-does-the-kernel-boot-parameter-set-acpi-osi-linux-do)
* [[持续更新][MacBook Pro] Deepin 15.7 遇到的几个问题和解决方法 ](https://bbs.deepin.org/forum.php?mod=viewthread&tid=169677)