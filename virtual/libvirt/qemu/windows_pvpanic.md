在配置了[libvirt pvpanic](libvirt_pvpanic)虚拟设备之后，QEMU的虚拟机内部会增加一个ISA设备。结合适当的驱动，就可以实现vm内部crash通知到host主机，以便采取相应的处理措施。

> 在测试Windows系统Crash是否能够触发pvpanic事件的关键点是模拟触发Windows crash，其余的环境设置和[CentOS pvpanic实现和测试](centos7_pvpanic)相似。

对于Windows物理服务器，人工触发Crash来获取memory dump:

* 设置`NMICrashDump`，通过使用一个硬件级别的远程管理接口来触发
* 设置`CrashOnCtrlScroll`，通过特定组合键来触发
* 使用NotMyFault
* 使用Bang! -- Crash on Demand Utility
* 使用WinDbg

详细请参考[触发Windows Crash（获取memory dump）](../../../os/windows/debug/force_windows_crash)

在虚拟化环境中，主要采用软件方法来触发。

# 触发Windows crash的工具

## NotMyFault(推荐)

微软提供了一个用于触发crash，hang以及引发内核内存泄露的工具

[NotMyFault](https://docs.microsoft.com/en-us/sysinternals/downloads/notmyfault)。


## QEMU QMP `inject-nmi`(推荐)

QEMU的底层协议 QENU Machine Protocol (QMP)可以通过 libvirt 的 `qemu-monitor-command` 命令访问。QMP指令`inject-nmi`可以触发Windows虚拟机出现一个蓝屏core dump

触发命令如下：

```bash
virsh qemu-monitor-command win2016 --pretty '{"execute":"inject-nmi"}'
```

> 这里`execute`表示执行`inject-nmi`指令（完全是JSON格式），此时就会在Windows虚拟机的VNC桌面看到触发了一个蓝屏。

> 参考 [Multiple ways to access QEMU Machine Protocol (QMP)](https://kashyapc.wordpress.com/2013/03/31/multiple-ways-to-access-qemu-machine-protocol-qmp/)

## BANG

[BANG! -- Crash on Demand Utility](http://www.osronline.com/article.cfm?article=153) 是一个非常简单实用的工具，可以根据不同的Windows版本触发crash。

* 在Windows 2012（x86_64）可以选择`vlh\AMD64\osrbang.exe`

![windows crash bang](../../../img/virtual/libvirt/qemu/windows_crash_bang.png)

运行程序后点击`Crash Now`按钮，此时即发生Windows Crash。并且可以在host物理服务器的`/var/log/libvirt/libvirtd.log`日志中观察到对应的虚拟机`emit panic`日志。

## WinDbg

[Windows Debugger (WinDbg)](https://developer.microsoft.com/en-us/windows/hardware/download-windbg)可以用于debug内核和用户模式代码，分析crash dump以及检查代码执行时CPU寄存器。

# Windows Virtio驱动

[Fedora Windows Virtio Drivers](https://fedoraproject.org/wiki/Windows_Virtio_Drivers)提供了。

从 virtio-win-0.1.103-2 开始支持 [QEMU pvpanic](https://github.com/qemu/qemu/blob/master/docs/specs/pvpanic.txt)

在Windows guest虚拟机内部可以看到如下ISA设备，但是此时因为操作系统没有安装驱动，所以暂时无法时别。同时，由于没有安装pvpanic设备驱动，Windows CRASH时候也不能传递信息给host主机的libvirtd。

![virtio-win的pvpianc设备](../../../img/virtual/libvirt/qemu/virtio-win_pvpanic.png)

参考[Windows虚拟机virtio驱动版本](../../kvm/virtio/windows_virtio_drivers_version)下载当前已经安装的`virtio-win`的相同版本的iso文件，然后通过 `7-zip` 工具解压缩，然后更新该ISA设备的驱动。

> 这里案例下载了`virtio-win-0.1.118.iso`，通过`7-zip`解压缩成`virtio-win-0.1.118`目录，其中包含了所有`virtio-win`驱动。

* 在`Device Manager`中找到这个ISA未知设备，双击显示设备属性

![virtio-win的pvpianc设备属性](../../../img/virtual/libvirt/qemu/update_pvpanic_driver.png)

* 点击`update driver`按钮，然后选择`Browse my computer for driver software`

![virtio-win的pvpianc设备驱动搜索](../../../img/virtual/libvirt/qemu/update_pvpanic_driver_search.png)

* 选择已经解压缩的驱动文件目录，然后确认后并且进入下一步驱动搜索

![virtio-win的pvpianc设备驱动目录](../../../img/virtual/libvirt/qemu/update_pvpanic_driver_path.png)

* Windows会自动找到匹配的驱动并提示安装，直接确认进行安装

![virtio-win的pvpianc设备驱动确认](../../../img/virtual/libvirt/qemu/update_pvpanic_driver_confirm.png)

* 正确安装了驱动之后，则Windows会正确识别出设备`QEMU PVPanic Device`如下：

![virtio-win的pvpianc设备驱动完成](../../../img/virtual/libvirt/qemu/update_pvpanic_driver_finish.png)
