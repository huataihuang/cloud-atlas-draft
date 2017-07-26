# Linux内核taint（污染）机制

Linux内核诶户了一个包含在内核错误消息中的"`tainted state`"。这个tainted state提供了一个指示了运行内核在发生内核错误或hang的时候是否可以通过分析内核源代码来有效地troubleshot。在taint相关一些信息表示内核错误信息是否可信任。

> 当内核被污染（kernel is tainted），这就意味着`处于污染状态的内核将不被社区支持`。很多内核开发者会忽略被污染内核的bug报告，并且社区成员可能会要求你在他们能够处理内核诊断问题前先修复内核的污染问题。此外，当内核被污染时，一些debug功能和API调用可能会被禁用。

例如，当主机检测异常（machine check exception, MCE）发生时taint state被设置，标志着硬件相关的错误发生。

一旦设置了内核`已经污染`(`tainted`)，则只能通过重启系统重新加载内核才能unset这个污染状态。

# Taint flags

内核的tainted status不仅能够表示内核是否被污染，也能够指示哪种事件导致内核被标记为污染状态。这个信息标记就是跟随在 "`Tainted:`" 字符串之后的单个字符：

* `P`： 模块使用了锁定的专有授权，例如，模块不是基于GNU GPL协议或兼容协议发布的。这可能标记模块的源代码不提供给Linux内核开发。
* `G`： `P`的相反：内核已经被污染（通过一个不同的标记来表示原因），但是所有加载到内核的模块都是给予GPL或GPL兼容协议。
* `F`:  内核模块是通过`insmod`或`modprobe`的强制选项`-f`加载的，这将导致合理的检查内核模版的版本信息步骤被跳过。
* `R`:  模块正在被使用或者没有被设计成能够通过强制移除方式从内核中使用`rmmod`的`-f`参数移除。
* `S`:  Linux内核运行在并行多处理器支持（SMP），但是系统的CPU没有针对SMP使用进行设计或认证。
* `M`:  当内核运行时发生主机检测异常（Machine Check Exception, MCE）。MCE是通过硬件触发的用于标记一个硬件相关的故障，例如CPU温度超出阀值或者一个内存堆暗示一个不可修复的错误。
* `B`:  处理器被发现处于一个坏页状态，表示虚拟内存子系统出现腐败，可能是由于制造的RAM或缓存问题导致的。
* `U`:  如果用户或用户程序设置要求这个Tainted flage被设置
* `D`:  如果内核最近死掉了，例如OOPS或BUG
* `A`:  如果ACPI表被覆盖
* `W`:  如果前面内核已经提出过告警
* `C`:  如果一个阶段性驱动被夹在
* `I`:  如果内核在这个平台firmware（BIOS等）用于修复一个服务bug
* `O`:  扩展模块被加载
* `E`:  没有签名的模块被加载到支持模块签名的内核中
* `L`:  系统前面出现了一个软件锁

> 参考 [oops跟踪](../tracing/oops_tracing)

其他附加flag（SUSE内核）

* `U`或`N`: 不支持的家在内核，例如模块不是被SUSE（原文是针对SUSE的）所支持的模块并且不知道第三方支持。例如，从硬件厂商获得的驱动没有经过可靠测试。
* `X`: 内核是第三方加载但是是和SUSE合作的

更为详细的`

# 检查运行内核的taint status

运行的内核的污染状态可以通过以下命令检查

```
cat /proc/sys/kernel/tainted
```

如果输出是`0`表示内核没有被污染。如果输出是非0值，则表明内核已经污染。这个值是结合了所以影响内核taint flags的数值累加（ORed）。可以查看以下文档获取当前使用内核flags的列表：

```
/usr/src/linux/Documentation/sysctl/kernel.txt
```

> 或者参考 https://www.kernel.org/doc/Documentation/sysctl/kernel.txt

例如，如果系统使用`-f`参数加载内核模块，则`/proc/sys/kernel/tainted`数值就是`2`

> 在 [分析CPU Machine Check Exception (MCE)] 时可以看到，`Tainted:` 其后跟随的字符表示了tainted stats，其中 `W` 字符表示内核在之前已经提出过告警。可以通过 `dmesg` 查看内核告警信息。

# 参考

* [Tainted kernel](https://www.novell.com/support/kb/doc.php?id=3582750) - Novell提供知识文档
* [oops-tracing.txt](http://lxr.free-electrons.com/source/Documentation/oops-tracing.txt)
* [Linux: What is a tainted kernel?](http://unix.stackexchange.com/questions/118116/linux-what-is-a-tainted-kernel)