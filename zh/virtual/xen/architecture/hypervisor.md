# Xen Hypervisor

> hypervisor是一种运行在物理服务器和操作系统之间的中间软件层,可允许多个操作系统和应用共享一套基础物理硬件，因此也可以看作是虚拟环境中的“元”操作系统，它可以协调访问服务器上的所有物理设备和虚拟机，也叫虚拟机监视器（Virtual Machine Monitor）。-[hypervisor百度百科](http://baike.baidu.com/view/4404351.htm)

Xen hypervisor是一个开源的`type-1`或`baremetal`类型hypervisor，它能够在一个操作系统中运行多个instance或者在一个单一主机中运行多个不同的操作系统。Xen hypervisor是目前唯一开源的`type-1` hypervisor。

> `type-1`也称为`native`或者`bare-metal`，此时hypervisor直接访问主机硬件来管理guest操作系统。由于这个原因，也称为`bare metal` hypervisor。这时，guest操作系统是作为物理主机的一个进程来运行的。目前流行的`type-1` hypervisor有`Oracle VM Server for SPARC/x86`，Citrix `XenServer`，Microsoft `Hyper-V`以及`VMware ESX/ESXi`。
> 
> `type-2`也称为`hosted` hypervisor，此时hypervisor在物理主机上和其他进程类似其他集成，此时`type-2` hypervisor从物理主机操作系统中抽象出guest操作系统。`VMware Workstation`，`VMware Player`，`VirtualBox`，`QEMU`都是典型的`type-2` hypervisor。
> 
> 不过，上述两种hypervisor类型并不是明显区别。Linux `kernel-base Virtual Machine`(`KVM`)以及FreeBSD `bhyve`都是内核模块，可以高效地转换主机操作系统成为`type-1` hypervisor。不过，由于Linux和FreeBSD依然是通用功能的操作系统，其他应用程序和VM资源并行，所以KVM和bhyve依然被视为`type-2` hypervisor。
> 
> 2012年，Lynx Software Technologies发布了一种新的高性能hypervisor架构，`type-0`，是一种抽象了所有一场处理和应用程序/VM服务到用户空间的硬件虚拟化。这个设计通过去除了用户空间的功能移除了在层次结构（如Linux KVM/ESXi）Kernel API(例如 POSIX)和I/O堆栈。这种架构通过去除了用户空间能力做到了直接将数据传递给内核以及直接执行功能，从而消除了诸如VENOM的CPU特权攻击。此外，LynxSecure不需要诸如Xen Dom0这样的特权辅助OS，所有的VM都能够自动运行无需管理domin的服务。

![hypervisor type](/img/virtual/xen/architecture/hyperviseur.png)

Xen hypervisor的关键特性：

* 小型的footprint和接口（大约1MB）。由于是微内核设计，对于guest使用非常小的内存和有限的接口，所以比较具有鲁棒性
* 操作系统不可知性：大多数linux的安装都是作为主控制堆栈（即`domain 0`），不过也有少数操作系统可以取代，如NetBSD和OpenSolaris
* 驱动隔离：Xen hypervisor能够允许在虚拟主机中运行主要的设备驱动。如果驱动crash，或者异常，VM所包含的驱动可以重启并且这个驱动重启不会影响系统的其他部分
* 半虚拟化：完全`半`虚拟化的guest虚拟机是作为一个虚拟主机来运行的，这使得guest运行的速度比硬件扩展虚拟化（HVM）要更快。并且，半虚拟化可以在硬件不支持虚拟化扩展的主机上运行。

# Xen架构

Xen hypervisor直接运行在硬件上负责处理CPU，内存和中断。Xen hypervisor也是bootloader启动并结束后第一个运行的程序。在hypervisor之上运行了一系列的虚拟机。每个虚拟机的运行会话称为`domain`或者`guest`。一个特殊的`domain`称为`domain 0`包含了系统中所有设备的驱动。`domain 0`也包含了一个控制堆栈来管理虚拟机的创建、销毁和配置。

![Xen架构示意图](/img/virtual/xen/architecture/Xen_Arch_Diagram.png)

Xen组件说明：

* Xen Project Hypervisor：直接运行在硬件上的软件层，负责管理CPU、内存和中断。**`hypervisor`自身是不具备网络和存储I/O功能的。**
* Guest Domains/Virtual Machines：虚拟环境，运行自己的操作系统和应用程序。Xen hypervisor支持两种不同的虚拟化模式：半虚拟化Paravirtualization（PV）和硬件辅助虚拟化（HVM）（也称为完全虚拟化）。在一个hypervisor上支持同时运行这两种类型的虚拟机。也支持在一个HVM虚拟机中运行PV虚拟机，这称为PV on HVM。Guest VM和硬件完全隔离：也就是说，虚拟机没有权限直接访问硬件或者I/O功能。所以，虚拟机也称为非特权domain（`DomU`）。
* Control Domain（`Domain 0`）：`Dom0`是一个特殊的虚拟机，具有直接访问硬件的特权，可以处理所有的系统I/O功能并且和其他虚拟机交互。它也输出一个控制接口，用于控制系统。没有`Domain 0`Xen Project Hypervisor就不能工作，这也是系统启动的第一个VM。
* Toolstack和Console：`Domain 0`包含了一个控制堆栈（也称为`Toolstack`）允许用户管理虚拟机的创建、销毁和配置。这个toolstack输出了一个接口用于通过命令行控制台或者图形接口或者云计算平台如OpenStack或CloudStack来管理。
* Xen Project-enabled操纵系统：`Domain 0`需要一个Xen Project-enabled内核。半虚拟化的guest需要一个PV-enabled内核。基于较新的Linux内核的发行版本都是Xen Project-enabled并包含了必要的hypervisor和工具（Toolstack和Console）的。除了遗留的古老的Linux内核外，其他所有内核都是PV-enabled的，可以作为PV guest运行。

# Guest类型

![Guest类型](/img/virtual/xen/architecture/VirtModes0.png)

* PV - 半虚拟化是高效和轻量级的虚拟化技术，不需要物理服务器支持虚拟化扩展。然而，半虚拟化要求guest虚拟机使用特殊的PV-enabled内核以及PV驱动，这样guest就可以感知到hypervisor并且不需要模拟硬件所以运行效率更高。
* HVM - 完全虚拟化或硬件辅助虚拟化（HVM）使用物理服务器CPU的虚拟扩展，需要Intel VT或AMD-V硬件扩展支持。Xen使用Qemu来模拟PC硬件，包括BIOS，IDE磁盘控制器，VGA显卡，USB控制器，网卡等等。虚拟化硬件扩展可以获得突发尖峰性能，并且不需要任何Guest内核修改支持，也就意味着Windows操作系统也可以安装部署。但是完全虚拟化guest系统通常比半虚拟化系统运行缓慢，因为需要实现硬件模拟。注意：也可以使用PV驱动来加速HVM guest的IO性能，对于Windows则要求相应安装PV驱动。
* PVHVM - 针对启动性能，全虚拟化HVM guest可以使用特殊的半虚拟化设备驱动（PVHVM或PV-on-HVM驱动），这些驱动是针对HVM环境优化的PV驱动并且绕过磁盘和网络IO的模拟，这样就在HVM系统上得到PV类似的性能。注意，Xen Project PV（paravirtual）的guest是自动使用PV驱动的，所以不需要使用这种特殊优化的驱动，这种PVHVM驱动只在HVM（完全虚拟化）guest虚拟机中才需要。
* PVH - Xen 4.4提供了PVH for DomU，Xen 4.5提供了PVH for Dom0。主要是PV guest使用PV驱动来启动和I/O，其他时候则使用硬件虚拟化扩展，而不是模拟硬件。这种方式可以精简代码并减少攻击。

# Toolstacks，管理API和Consoles

Xen可以使用不同的toolstack，例如[Libvirt](http://wiki.xen.org/wiki/Libvirt)和[XAPI](http://wiki.xen.org/wiki/XAPI)（Xen提供的toolstack）。对于Xen，[可按需选择Toolstacks](http://wiki.xen.org/wiki/Choice_of_Toolstacks)。

`xenwatch`是一个底层虚拟化工具，用于显示运行的domain的特性以及用于连接到字符或图形（vnc）控制台。

# 如何区分运行的vm是PV还是HVM

在Xen的物理主机上，使用toolstack可以检查运行的`domU`虚拟机的虚拟化类型。

## 使用`XAPI` toolstack

对于早期的Xen部署，可以使用`xm`命令，较新的Xen部署，则使用`xl`命令，命令的参数都是一样的，即`list -l`（`-l`表示`--long`），此时输出详细的虚拟机运行状态

* 首先查看物理服务器上运行的虚拟机列表

```bash
xm list
```

例如输出显示运行的虚拟机名字是 `My-PV-VM`

```bash
Name                                        ID   Mem VCPUs      State   Time(s)
Domain-0                                     0  1024    24     r----- 10956905.0
My-PV-VM                                    7 10240     4     -b---- 18018883.9
```

* 检查详细的虚拟机信息

```bash
xm list -l My-PV-VM
```

输出信息如果类似

```bash
(domain
    (domid 7)
    (on_crash restart)
    (uuid 52da5902-fa44-ffeb-1b9f-e595b0b25a5f)
    (bootloader_args -q)
    (vcpus 4)
    (name My-PV-VM)
    (on_poweroff destroy)
    (on_reboot restart)
    (cpus (() () () ()))
    (bootloader /usr/bin/pygrub)
    (maxmem 10240)
    (memory 10240)
    (shadow_memory 0)
    (features )
    (on_xend_start ignore)
    (on_xend_stop ignore)
    (start_time 1414077732.97)
    (cpu_time 18018885.9864)
    (online_vcpus 4)
    (image
        (linux
            (kernel )
            (args 'DOM0=6CU33020NK')
...... 
```

注意：其中显示在`image`段落中的`linux`项就表示`paravirtual`（而不是实际的系统类型），如果是`full virtualization`完全虚拟化，则这个地方看到的关键字是`hvm`。

以下是另外一个`HVM`类型的虚拟机`My-HVM-VM`输出的信息

```bash
(domain
    (domid 11)
    (cpu_weight 256)
    (cpu_cap 0)
    (on_crash destroy)
    (uuid 43f8cbea-5295-418a-bf26-f887a6d4623d)
    (bootloader_args )
    (vcpus 8)
    (name My-HVM-VM)
    (on_poweroff destroy)
    (on_reboot restart)
    (cpus
        ((4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
            (4 5 6 7 8 9 10 11 12 13 14 15 20 21 22 23 24 25 26 27 28 29 30 31)
        )
    )
    (bootloader )
    (maxmem 16384)
    (memory 16384)
    (shadow_memory 136)
    (features )
    (on_xend_start ignore)
    (on_xend_stop ignore)
    (start_time 1438052640.27)
    (cpu_time 8921790.78668)
    (online_vcpus 8)
    (image
        (hvm
            (kernel )
            (superpages 0)
            (tsc_mode 0)
            (hpet 0)
            (boot dc)
            (loader /usr/lib/xen/boot/hvmloader)
            (serial none)
            (vpt_align 1)
            (xen_platform_pci 1)
            (rtc_timeoffset 0)
            (parallel none)
            (pci ())
            (pae 1)
            (hap 1)
            (viridian 0)
            (acpi 1)
            (localtime 1)
            (timer_mode 1)
            (apic 1)
            (nomigrate 0)
            (usbdevice tablet)
            (device_model /usr/lib/xen/bin/qemu-dm)
            (usb 1)
            (notes (SUSPEND_CANCEL 1))
        )
    )
    (status 2)
    (state -b----)
......
```

同样，在`image`段落看到的关键字是`hvm`，则表示完全虚拟化。

对于 Xen 4.x 系统，提供了新的XenLight toolstack，也就是可以使用`xl`命令来代替`xm`，这个新工具输出的信息更为清晰，可以看到`c_info`段落的`type`是`pv`或`hvm`，例如类似

```bash
[
    {
        "domid":6,
        "config":{
            "c_info":{
                "name":"My-Virtual-Machine",
                "uuid":"12345678-abcd-1234-abcd-12345678abcd",
                "type":"pv",
                ...
            },
            ...
        }
    }
]
```

## 使用`Libvirt` toolstack

也可以使用`Libvirt` toolstack提供的`virsh`命令来检查Xen虚拟机的类型，这个工具有一个`dumpxml`的命令可以输出虚拟机的配置，其中就包含了`type`字段

```bash
virsh dumpxml My-HVM-VM
```

可以看到输出内容类似如下

```bash
<domain type='xen' id='26'>
  <name>My-HVM-VM</name>
  <uuid>f4a166ef-ac5f-4224-99e1-4dfc1238952b</uuid>
  <memory>16777216</memory>
  <currentMemory>16777216</currentMemory>
  <vcpu cpuset='4-15,20-31' cpu_cap='0'>4</vcpu>
  <os>
    <type>hvm</type>
    <loader>/usr/lib/xen/boot/hvmloader</loader>
    <boot dev='cdrom'/>
    <boot dev='hd'/>
  </os>
```

# 参考

* [Xen Project Software Overview](http://wiki.xen.org/wiki/Xen_Project_Software_Overview)
* [The Xen Hypervisor](http://www.informit.com/articles/article.aspx?p=1187966)
* [Determine which guest is running on XEN: HVM or PV guest](http://serverfault.com/questions/511923/determine-which-guest-is-running-on-xen-hvm-or-pv-guest)
