所有现代CPU厂商都有设计和生产瑕疵的历史，从相关设计稳定性问题到潜在的安全漏洞。虽然大多数CPU的勘误表中列出的bug都被标记为"不修复"，Intel依然提供了能够通过microcode更新的方式提供CPU稳定性和安全性补丁。

microcode就是处理器厂商发布稳定性和安全性升级的处理器微代码。虽然微代码可以通过BIOS来升级，但是Linux内核也提供了一种通过在启动时更新的方法。这些更新提供了bug fix来确保系统的稳定性。没有这些更新，你可能会遇到奇怪的宕机或者异常的系统挂起，而且非常难以跟踪。

**对于使用Intel Haswell和Broadwell处理器系列的用户，必须要安装这些microcode来取保系统稳定。**

不幸的是，microcode更新格式是没有文档说明的（似乎没法获得microcode格式的理解方法），也无法清晰理解microcode补丁修复的具体bug。

# microcode更新工作原理

microcode更新是通过在一个称为`IA32_UCODE_WRITE`的特定型号寄存器（model-specific register, MSR）中写入intel提供的无文档说明的二进制内容的虚拟地址。这个私有的操作通常是在系统启动时通过系统BIOS来执行的，但是现代操作系统内核已经包含了支持microcode更新的功能。

BIOS（或操纵系统）在尝试WRMSR操作之前将校验匹配运行硬件的正确更新包。为了实现这个目的，每个microcode更新包的头部有一个更新元信息。这个文件头部在Intel开发手册卷3描述。包含3个相关校验信息：microcode修订，处理器签名和处理器标志。

microcode修订是一个递增的版本号 - 你只能更新更高版本的软件包（只能升级不能降级）。BIOS通常通过一个称为`IA32_UCODE_REV`的`RDMSR`调用来展开当前microcode订正，然后对比更新包头部的订正号。

处理器签名是一个microcode将要补丁的硬件型号的唯一标识。这个运行硬件的签名可以通过使用`CPUID`指令来获得，然后对比microcode头部的处理器卡名。对应Intel，"每个microcode更新是对于给定处理器家族，扩展模型，类型，型号等来签名"。处理器标志字段类似，Intel说"BIOS使用处理器标志为来结合MSR(17H)的平台ID来确定更新是否符合当前处理器"。

一旦microcode更新通过`IA32_UCODE_WRITE`完成，BIOS通常发出`CPUID`指令然后读取`IA32_UCODE_REV`的`MSR`。如果获得的修订版本号增加了，就表示补丁正确完成。

# 如何更新

从2008年开始，Intel周期性发布包含每个处理器的最新更新的DAT文件。在此之前，microcode更新数据包是通过开源工具`microcode_ctl`的一部分来发布的。

Red Hat Enterprise Linux系统有一个`microcode_ctl`软件包，提供了更新 `x86/x86-64` CPU microcode的工具，默认系统已经安装。这个软件包包含了操作系统发行版本更新的Intel microcode，文件存储位置在 `/lib/firmware/intel-ucode/` 目录下。（根据发行版本，也可能将更新的microcode存放在`/etc/firmware`目录）。未来版本会采用`kernel-firmware`方式来发布。(参考[microcode_ctl: tool to update x86/x86-64 CPU microcode](https://fedorahosted.org/microcode_ctl/))

Intel驱动下载中心提供了[Linux Processor Microcode Data File](https://downloadcenter.intel.com/search?keyword=Linux+Processor+Microcode+Data+File)下载，可以及时更新Linux系统的处理器微代码。下载的微代码解压缩后是一个 `microcode.dat` 文件。

参考[Gentoo Linux wiki: Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)，对于Intel Haswell处理器，要求先加载microcode，所以不能使用模块编译，要直接编译进内核，内核配置要求

```bash
CONFIG_MICROCODE_EARLY=y
```

micorcode需要通过`bootloader`加载，

# 验证microcode在启动时已经更新

使用`dmesg`命令检查系统启动时是否更新了microcode

```bash
dmesg | grep microcode
```

显示输出类似如下

```bash
[    0.855704] microcode: CPU0 sig=0x206d7, pf=0x1, revision=0x710
[    0.855898] microcode: CPU1 sig=0x206d7, pf=0x1, revision=0x710
[    0.856194] microcode: CPU2 sig=0x206d7, pf=0x1, revision=0x710
...
[    0.860201] microcode: CPU22 sig=0x206d7, pf=0x1, revision=0x710
[    0.860403] microcode: CPU23 sig=0x206d7, pf=0x1, revision=0x710
[    0.860635] microcode: Microcode Update Driver: v2.00 <tigran@aivazian.fsnet.co.uk>, Peter Oruba
```

使用命令 `cat /proc/cpuinfo` 可以看到cpu信息

```bash
processor	: 23
vendor_id	: GenuineIntel
cpu family	: 6
model		: 45
model name	: Intel(R) Xeon(R) CPU E5-2630 0 @ 2.30GHz
stepping	: 7
microcode	: 0x710
cpu MHz		: 2299.910
```

其中`microcode`版本显示`0x710`就是操作系统启动时加载的microcode更新的版本。

# 参考

* [Notes on Intel Microcode Updates](http://inertiawar.com/microcode/) - 这篇文档非常详尽，建议阅读
* [ArchLinux wiki: Microcode](https://wiki.archlinux.org/index.php/microcode)
* [Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)
