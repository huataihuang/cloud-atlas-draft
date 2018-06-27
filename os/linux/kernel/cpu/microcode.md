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

# 更新微码概述

从2008年开始，Intel周期性发布包含每个处理器的最新更新的DAT文件。在此之前，microcode更新数据包是通过开源工具`microcode_ctl`的一部分来发布的。

Red Hat Enterprise Linux系统有一个`microcode_ctl`软件包，提供了更新 `x86/x86-64` CPU microcode的工具，默认系统已经安装。这个软件包包含了操作系统发行版本更新的Intel microcode，文件存储位置在 `/lib/firmware/intel-ucode/` 目录下。（根据发行版本，也可能将更新的microcode存放在`/etc/firmware`目录）。未来版本会采用`kernel-firmware`方式来发布。(参考[microcode_ctl: tool to update x86/x86-64 CPU microcode](https://fedorahosted.org/microcode_ctl/))

Intel驱动下载中心提供了[Linux Processor Microcode Data File](https://downloadcenter.intel.com/search?keyword=Linux+Processor+Microcode+Data+File)下载，可以及时更新Linux系统的处理器微代码。下载的微代码解压缩后是一个 `microcode.dat` 文件。

参考[Gentoo Linux wiki: Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)，对于Intel Haswell处理器，要求先加载microcode，所以不能使用模块编译，要直接编译进内核，内核配置要求

```bash
CONFIG_MICROCODE_EARLY=y
```

micorcode需要通过`bootloader`加载

# 更新微码详解

内核有一个x86 microcode loader机制支持在OS内部加载微码。这样可以在主机厂商停止OEM支持之后继续更新微码，并且支持无需重启就更新微码。

x86 microcode loader支持3种加载模式：

## 更新微码方式一： Early load microcode

内核可以在启动过程的早期更新微码。Early load microcode 可以在内核启动时在出现CPU问题之前修复CPU错误。

Early load microcode是存储在`initrd`文件中，在内核启动时，从initrd文件读取微码加载到CPU核心。

在结合到initrd镜像中的microcode格式是非压缩的cpio格式，是跟随着initrd镜像（有可能压缩）。此时loader会在启动时处理这种结合格式的initrd镜像。

在cpio中的microcode命名：

```
on Intel: kernel/x86/microcode/GenuineIntel.bin
on AMD : kernel/x86/microcode/AuthenticAMD.bin
```

在BSP（BootStrapping Processor）启动过程（pre-SMP），内核扫描initrd中的微码文件。如果微码匹配主机的CPU，就会在BSP过程中应用到所有应用程序处理器（APs, Application Processors）。

loader也会保存匹配上的微码到内存中，这样，当CPU从睡眠状态恢复时，就会将缓存的微码补丁应用上去。

以下时一个如何处理initrd微码的脚本，不过通常是由发行版本来处理的，不需要自己执行：

```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "You need to supply an initrd file"
    exit 1
fi

INITRD="$1"

DSTDIR=kernel/x86/microcode
TMPDIR=/tmp/initrd

rm -rf $TMPDIR

mkdir $TMPDIR
cd $TMPDIR
mkdir -p $DSTDIR

if [ -d /lib/firmware/amd-ucode ]; then
        cat /lib/firmware/amd-ucode/microcode_amd*.bin > $DSTDIR/AuthenticAMD.bin
fi

if [ -d /lib/firmware/intel-ucode ]; then
        cat /lib/firmware/intel-ucode/* > $DSTDIR/GenuineIntel.bin
fi

find . | cpio -o -H newc >../ucode.cpio
cd ..
mv $INITRD $INITRD.orig
cat ucode.cpio $INITRD.orig > $INITRD

rm -rf $TMPDIR
```

系统需要将微码软件包安装到`/lib/firmware`目录，或者直接从处理器厂商网站下载微码。

## 更新微码方式二： late loading

有两种传统的用户空间接口可以用来加载微码，或者通过 `/dev/cpu/micorcode` 或者通过sysfs的文件入口 `/sys/devices/system/cpu/microcode/reload`。

当前`/dev/cpu/microcode`方式已经被废弃，因为它需要一个特殊的用户空间工具来实现。

较为简单的方法是，将发行版的微码包安装好以后，然后以`root`用户身份执行如下命令：

```
echo 1 > /sys/devices/system/cpu/microcode/reload
```

此时加载机制将查看 `/lib/firmware/{intel-ucode,amd-ucode}`目录，也就是默认发行版已经将微码存放在这些目录下。

也可以手工安装微码，如果拿到的是rpm包，可以使用以下命令将rpm解开：

```
rpm2cpio microcode_XXXX_el7.noarch.rpm | cpio -idmv
```

然后将解压缩之后`lib/firmware/XX-xx`子目录手工复制到 `/lib/firmware/intel-ucode` 目录下。

不过，此时微码尚未生效，需要执行一次

```
echo 1 > /sys/devices/system/cpu/microcode/reload
```

执行以后使用 `dmesg | grep microcode` 可以看到类似

```
...
[300889.237741] microcode: CPU0 sig=0x406f1, pf=0x1, revision=0xb000021
[300889.242919] microcode: CPU0 updated to revision 0xb00002e, date = 2018-04-19
...
```

此时通过`cat /proc/cpuinfo`可以看到升级微码前版本

```
microcode	: 0xb000021
```

升级后微码版本

```
microcode	: 0xb00002e
```

### `late loading`更新微码的注意点

`late loading`更新微码是在用户空间实现的，所以系统启动后，会在较晚的时候加载。这可能会带来一个问题：
如果某个内核模块依赖于修复微码以后特性，并且内核模块先于microcode生效，则可能会引起系统异常。

## 更新微码方式三： Builtin microcode

loader也支持builtin microcode，也就是常规的嵌入firmware方式，即 `CONFIG_EXTRA_FIRMWARE`，当前仅支持64位系统。

以下是案例：

```
CONFIG_EXTRA_FIRMWARE="intel-ucode/06-3a-09 amd-ucode/microcode_amd_fam15h.bin"
CONFIG_EXTRA_FIRMWARE_DIR="/lib/firmware"
```

不过，上述方法不灵活，要求重新编译内核来升级微码，对于CPU厂商经常更新微码的情况，非常麻烦。

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

## 启动时microcode更新阶段

操作系统启动时，微码更新可能会分2个阶段，例如微码`0x200004a`刷新可以看到分为`updated early`阶段，大约时启动时0.6秒~2秒内，到7秒时候开始第二阶段：

```
#dmesg | grep microcode
[    0.000000] CPU0 microcode updated early to revision 0x200004a, date = 2018-03-28
[    0.664059] CPU1 microcode updated early to revision 0x200004a, date = 2018-03-28
...
[    1.975245] CPU47 microcode updated early to revision 0x200004a, date = 2018-03-28
...
[    7.053195] microcode: CPU0 sig=0x50654, pf=0x80, revision=0x200004a
[    7.059795] microcode: CPU1 sig=0x50654, pf=0x80, revision=0x200004a
```

# 参考

* [Notes on Intel Microcode Updates](http://inertiawar.com/microcode/) - 这篇文档非常详尽，建议阅读
* [ArchLinux wiki: Microcode](https://wiki.archlinux.org/index.php/microcode)
* [Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)
* [linux/Documentation/x86/microcode.txt](https://github.com/torvalds/linux/blob/master/Documentation/x86/microcode.txt)
* [How to update CPU microcode in Linux](https://www.pcsuggest.com/update-cpu-microcode-in-linux/)
* [archlinux: Microcode](https://wiki.archlinux.org/index.php/microcode)
* [debian: Microcode](https://wiki.debian.org/Microcode)
* [gentoo linux: Intel microcode](https://wiki.gentoo.org/wiki/Intel_microcode)
* [How to load new Intel microcode](https://www.linuxquestions.org/questions/slackware-14/how-to-load-new-intel-microcode-4175621053/) - 有关处理Slackware 64平台的microcode，解决Meltdown和Spectre