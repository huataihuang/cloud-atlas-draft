本文汇总了使用VMware Fusion的一些建议和实践记录

# VMware Fusion简介

VMware Fusion基于 Intel 的 macOS操作系统运行的虚拟机系统，通过将物理硬件映射到虚拟机的资源，使得虚拟机具有自己的处理器、内存、磁盘和I/O设备。

可以在虚拟机中运行`未修改的完整操作系统`和关联的应用程序软件，就像在物理 PC 上一样。支持操作系统包括 Windows、Linux 和 macOS。

## VMware Fusion Pro 的 `Pro` 特点

* 支持软链接Clone，可以大大节约磁盘占用
* 创建高级自定义网络连接配置
* **设置带宽、数据包丢失和虚拟网络适配器的延迟，以模拟各种网络环境** (这是一个非常方便的模拟测试功能)
* 使用 Rest API
* 启用 UEFI 安全引导

## 特性

* [Fusion系统要求](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-84E34BF1-92A2-4B86-9995-70893A9B04A9.html)
* [Fusion的硬件模拟](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-B9315DCC-437D-4373-BD71-09A63D0CD5C3.html)

* **固态驱动器**

如果主机具有物理固态驱动器 (Solid State Drive, SSD)，主机将通知客户机操作系统它们在 SSD 上运行。这样，客户机操作系统就可以优化行为。

`注意：虚拟机识别 SSD 并使用该信息的方式取决于客户机操作系统和虚拟磁盘的磁盘类型（SCSI、SATA、IDE 或 NVMe）。`：

* 在 Windows 8、Windows 10、Ubuntu 和 Red Hat Enterprise Linux 虚拟机中，所有驱动器类型可以将其虚拟磁盘报告为 SSD 驱动器。
* 在 Mac 虚拟机中，仅 SATA 和 NVMe 虚拟磁盘会报告为 SSD。(macOS 10.13 和更高版本支持 NVMe 虚拟硬盘。)

# VMware Fusion使用

* 通过Fusion交互窗口操作的方法请参考 [在虚拟机资源库窗口中对虚拟机执行操作](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-37C4F0FF-4581-44B5-91C3-ACC412CD4931.html)

* VMware Fusion支持[将 Boot Camp 分区作为虚拟机打开](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-44F0AC9F-C57A-49A7-BA71-7FF0E9BDDD2E.html)。

Boot Camp 可以在硬盘上创建单独的 Mac 和 Windows 分区以创建双引导动环境。将 Windows Boot Camp 分区作为 Fusion 虚拟机就可以避免重新引导切换的麻烦。

# 保护虚拟机

## 快照

如果要在虚拟机中执行某个操作，但不确定该操作的后果，可以拍摄一个快照:

* 在更改虚拟机的系统软件（如操作系统升级或重大配置更改）之前，可以拍摄一个快照。如果在更改后未达到预期的效果，则可以恢复快照以将虚拟机恢复为更改之前的状态。
* 在访问 Internet 或登录到未知网络之前，也可以拍摄快照。如果虚拟机感染了软件病毒或遭到间谍软件的攻击，则可以恢复快照以将虚拟机恢复为感染之前的状态。

快照可以捕获您在拍摄该快照时虚拟机的整个状态:

* 内存状态 - 虚拟机内存的内容
* 设置状态 - 虚拟机设置
* 磁盘状态 - 所有虚拟磁盘的状态

> `快照与备份不同。它不是虚拟机的副本。`

备注：快照类似于LVM卷管理。我理解VMware的这个快照技术类似于定时对虚拟机磁盘进行一次volume snapshot，同时将内存中数据suspend到磁盘中和磁盘快照一起保存。这样需要回滚时，先恢复volume snapshot，然后再恢复内存数据，然后resume虚拟机运行。这样就回滚到某个之前运行状态。

## AutoProtect

AutoProtect就是定期自动快照，例如，每 30 分钟、每小时或每天自动拍摄一次快照。

## 虚拟机备份

由于虚拟机是一些文件，因此，可以创建拷贝以备份虚拟机。实际上就是通过文件管理器复制虚拟机文件。

## Time Machine（警告：不要使用Time Machine备份虚拟机）

如果使用 Time Machine，应从备份中排除虚拟机。

如果对虚拟机的虚拟硬盘文件进行任何更改，将导致备份整个文件。如果具有 40GB 虚拟机，并且将 Time Machine 设置为每小时备份一次，备份将很快占用所有硬盘空间。

# 配置虚拟机（选摘）

* VMware Fusion支持针对MacBook Pro的集成和独立显卡。通过图形卡管理，虚拟机可以在两块显卡间切换，也可以配置虚拟机使用高性能的独立显卡来加速。
* [配置客户机与主机操作系统之间的时间同步](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-4313475E-559A-4C46-86B6-114C1EF45D84.html)：启用该高级设置以进行时间同步，VMware Tools 服务（在客户机操作系统中运行）将每分钟检查一次以确保客户机和主机操作系统上的时钟同步。
* [硬盘缓冲](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-EADBD3B4-76F5-4455-9F76-E8C0F3C13404.html)
* [固件类型](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-4219647D-7736-4F25-8B1F-6B2799A03477.html)：UEFI 安全引导通过阻止加载未使用可接受数字签名签署的驱动程序和操作系统加载程序来保证引导进程的安全。

# 使用 `vmrun`

VMware Fusion 中使用 vmrun 命令行实用工具控制虚拟机，以及在 VMware 虚拟机上自动完成客户机操作。vmrun 实用工具与 VIX API 库相关联。

> 详细的 [vmrun操作命令案例列表](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-FF306A59-080E-497E-857D-F45125927FB3.html)

* 重新引导虚拟机。

```
vmrun reset Win10.vmwarevm/Win10.vmx soft
```

* 创建虚拟机的快照。

```
vmrun snapshot Ubuntu16.vmwarevm/Ubuntu16.vmx mySnapshot
```

* 列出虚拟机上的快照，从而显示在上一命令中创建的快照。

```
vmrun listSnapshots Ubuntu16.vmwarevm/Ubuntu16.vmx
```

* 还原为创建的快照（这会挂起虚拟机），并重新启动以恢复运行。

```
vmrun revertToSnapshot Ubuntu16.vmwarevm/Ubuntu16.vmx mySnapshot
vmrun start Ubuntu16.vmwarevm/Ubuntu16.vmx
```

* 列出虚拟机上的所有网络适配器。

```
vmrun listNetworkAdapters Win10.vmwarevm/Win10.vmx
```

* 将 NAT 网络适配器添加到虚拟机中。

```
vmrun addNetworkAdapter Win10.vmwarevm/Win10.vmx nat
```

* 运行客户机应用程序

大多数 vmrun 客户机操作要求在客户机操作系统上安装 VMware Tools。

在 Windows 客户机上以最小化方式启动该命令工具。

```
vmrun -gu guestUser -gp guestPassword runProgramInGuest Win10.vmwarevm/Win10.vmx -interactive cmd.exe
```

# 参考

* [使用VMware Fusion](https://docs.vmware.com/cn/VMware-Fusion/11/com.vmware.fusion.using.doc/GUID-F2874B79-A32A-4B83-914F-9838372D47CD.html)