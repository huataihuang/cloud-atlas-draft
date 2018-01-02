微软在[How to generate a kernel or a complete memory dump file in Windows Server 2008 and Windows Server 2008 R2](https://support.microsoft.com/en-us/help/969028/how-to-generate-a-kernel-or-a-complete-memory-dump-file-in-windows-ser)提供了详细的生成、采集、检查和分析内核以及内存dump文件的步骤。

# 触发crash dump

## 方法1 -- NotMyFault

微软提供了一个用于触发crash，hang以及引发内核内存泄露的工具[NotMyFault](https://docs.microsoft.com/en-us/sysinternals/downloads/notmyfault)。特别适合用来学习如何标识和诊断设备驱动和硬件故障，以及使用它来触发蓝屏dump。

配合[Windows Debugger (WinDbg)](https://developer.microsoft.com/en-us/windows/hardware/download-windbg)调试和分析内核异常。

> 推荐使用这个工具

## 方法2 -- `NMICrashDump` (斯和远程管理的服务器硬件)

一些服务器硬件提供了通过硬件中断触发crash（以获得memory dump）的方法，通常是使用一个硬件级别的远程管理接口来触发 。详细请参考 [How to generate a complete crash dump file or a kernel crash dump file by using an NMI on a Windows-based system](https://support.microsoft.com/en-us/help/927069/how-to-generate-a-complete-crash-dump-file-or-a-kernel-crash-dump-file)

简单来说，就是先设置`NMICrashDump`注册表值，然后使用特定的硬件远程管理接口来触发crash。

## 方法3 -- `CrashOnCtrlScroll`

[CrashOnCtrlScroll](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/forcing-a-system-crash-from-the-keyboard)是Windows提供的一种通过键盘驱动和内核配合，在特定按键组合情况下，触发主机crash（以获得memory dump）的技术。

* 使用`regedit`命令打开注册表
* USB键盘，注册表信息位置`HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\kbdhid\Parameters`，创建一个名为`CrashOnCtrlScroll`的键，并设置`REG_DWORD`值为`0x01`
* 重启系统使生效
* 按住键盘右边的`CTRL`键，然后连续按`两次` `SCROLL LOCK`键，则触发系统crash

![CrashOnCtrlScroll](../../../img/os/windows/debug/CrashOnCtrlScroll.png)

如果你的键盘没有`SCROLL LOCK`键，则可以定义不同的组合快捷键来实现相同的crash功能。对于USB键盘，设置`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\kbdhid\crashdump`，创建以下子键注册表`REG_DWORD`值：

* `Dump1Keys` - 该值是第一个热键的位映射（bit map），例如，替代默认的键盘右方的`CTRL`键，设置成左方的`SHIFT`键：

| 值 | 第一个快捷键 |
| ---- | ---- |
| 0x01 | 右方 SHIFT 键 |
| 0x02 | 右方 CTRL 键 |
| 0x04 | 右方 ALT 键 |
| 0x10 | 左方 SHIFT 键 |
| 0x20 | 左方 CTRL 键 |
| 0x40 | 左方 ALT 键 |

> 注意: `Dump1Kyes`也可以组合定义多个键，例如`0x11`表示同时按下左右方的`SHIFT`键

* `Dump2Key` 是目标主机的键盘布局的scancode表的索引值

![CrashOnCtrlScroll Dump key](../../../img/os/windows/debug/CrashOnCtrlScroll_dumpkey.png)

这里的案例是`Ctrl+D+D`

# 参考

* [How to Force a Diagnostic Memory Dump When a Computer Hangs](https://blogs.technet.microsoft.com/askpfeplat/2015/04/05/how-to-force-a-diagnostic-memory-dump-when-a-computer-hangs/)
* [Forcing a System Crash from the Keyboard](https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/forcing-a-system-crash-from-the-keyboard)
* [How to manually generate a Memory Dump](https://support.symantec.com/en_US/article.TECH91246.html) - 这篇Symantec文档非常详细介绍了如何触发Memory Dump方法