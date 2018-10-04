

```
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0: AER: Multiple Corrected error received: id=0070
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0: PCIe Bus Error: severity=Corrected, type=Data Link Layer, id=0070(Transmitter ID)
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0:   device [8086:19a8] error status/mask=00001100/00002000
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0:    [ 8] RELAY_NUM Rollover
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0:    [12] Replay Timer Timeout
[Fri Sep 14 20:40:13 2018] pcieport 0000:00:0e.0:   Error of this Agent(0070) is reported first
[Fri Sep 14 20:40:13 2018] pci 0000:05:00.0: PCIe Bus Error: severity=Corrected, type=Physical Layer, id=0500(Transmitter ID)
[Fri Sep 14 20:40:13 2018] pci 0000:05:00.0:   device [dabc:1017] error status/mask=00001041/00006000
[Fri Sep 14 20:40:13 2018] pci 0000:05:00.0:    [ 0] Receiver Error         (First)
[Fri Sep 14 20:40:13 2018] pci 0000:05:00.0:    [ 6] Bad TLP
[Fri Sep 14 20:40:13 2018] pci 0000:05:00.0:    [12] Replay Timer Timeout
```

以下是参考 [Errors in dmesg](https://www.linuxquestions.org/questions/linux-hardware-18/errors-in-dmesg-4175551409/) 的一些知识点：

* PCIe实际上不是一个总线，而是设备的网络，通过一个交换类型借口通讯，每个设备标记自己的物理未知和其他设备相关联。
* 数据通讯是传输层形式并且接收数据包，使用一种结合了流控制，错误检测和错误发生时数据包重传的协议。
* 物理上接口是6x的连线（每个方向2x不同连线对；并且1x连线对支持设备对引用时钟信号）
* PCIe硬件实现模拟了PCI接口卡

> 详细的PCI express设备通讯原理介绍，请参考[深入TLP：PCI Express设备如何通讯](../../device/pcie/pcie_device_talk)

在PCIe的通讯模式下有3个软件层：
* 传输层（也称为TL）
* 数据链路层（也称为DL）
* 物理层

上述错误中有关键字 `Physical Layer` 并且显示物理层错误是 `Corrected` （可修复的）

TLP：Transaction Layer Packet (TLP)

`Bad TLP` 表明出现了错误的传输层数据包

数据链路层（Data Link Layer, DL） 包装了 TLPs 的头部和链路CRC以确保TLPs（传输层）传输一致性。（在理想状态下）没有传输层丢失。一个ACK重传协议规则在DL层尝试定位问题。（DL数据链路曾实现流控）

所以，一个错误的TLP构成了一个系统与PCIe设备之间通讯的主要中断。一般通讯损坏的非知名错误可以纠正，但是某些奇怪的情况下，传输层数据包可能不会顺序叨叨，或者存在PCIe协议实现错误。错误的原因可能包括有缺陷的硬件，或者可能存在BIOS代码的问题。

如果这是一个新的错误，并且之前一切都是正常工作，则可能是一个退化硬件故障的迹象。如果是新情况，并且是在对系统进行硬件/BIOS配置修改后，则可能是BIOS兼容性问题。甚至可能是PCIe硬件实现问题。

有报告说在内核命令行加上`pcie_aspm=off`（PCIE:强制启用/禁用PCIe活动状态电源管理(ASPM)）以抑制与PCIe设备电源管理相关的报错。但是这个解决方法可能只是掩盖了严重的问题。

> 需要确保BIOS是最新，并且主板之前是否有报告类似的PCIe设备交互错误记录。

# 参考

* [Errors in dmesg](https://www.linuxquestions.org/questions/linux-hardware-18/errors-in-dmesg-4175551409/)
