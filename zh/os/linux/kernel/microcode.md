所有现代CPU厂商都有设计和生产瑕疵的历史，从相关设计稳定性问题到潜在的安全漏洞。虽然大多数CPU的勘误表中列出的bug都被标记为"不修复"，Intel依然提供了能够通过microcode更新的方式提供CPU稳定性和安全性补丁。

不幸的是，microcode更新格式是没有文档说明的（似乎没法获得microcode格式的理解方法），也无法清晰理解microcode补丁修复的具体bug。

# microcode更新工作原理

microcode更新是通过在一个称为`IA32_UCODE_WRITE`的特定型号寄存器（model-specific register, MSR）中写入intel提供的无文档说明的二进制内容的虚拟地址。这个私有的操作通常是在系统启动时通过系统BIOS来

microcode就是处理器厂商发布稳定性和安全性升级的处理器微代码。虽然微代码可以通过BIOS来升级，但是Linux内核也提供了一种通过在启动时更新的方法。这些更新提供了bug fix来确保系统的稳定性。没有这些更新，你可能会遇到奇怪的宕机或者异常的系统挂起，而且非常难以跟踪。

对于使用Intel Haswell和Broadwell处理器系列的用户，必须要安装这些microcode来取保系统稳定。

# 安装

Red Hat Enterprise Linux系统有一个`microcode_ctl`软件包，提供了更新 `x86/x86-64` CPU microcode的工具，默认系统已经安装。这个软件包包含了操作系统发行版本更新的Intel microcode，文件存储位置在 `/lib/firmware/intel-ucode/` 目录下。



Intel驱动下载中心提供了[Linux Processor Microcode Data File](https://downloadcenter.intel.com/search?keyword=Linux+Processor+Microcode+Data+File)下载，可以及时更新Linux系统的处理器微代码。下载的微代码解压缩后是一个 `microcode.dat` 文件。

参考[Gentoo Linux wiki: Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)，对于Intel Haswell处理器，要求先加载microcode，所以不能使用模块编译，要直接编译进内核，内核配置要求

```bash
CONFIG_MICROCODE_EARLY=y
```

此外，还需要在`bootloader`中添加

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
* []()
