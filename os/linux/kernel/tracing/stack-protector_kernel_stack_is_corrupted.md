虚拟机crash的一个案例，类似参考 [vmcore分析案例："kernel BUG at fs/buffer.c:1270"](vmcore_example_bug_at_fs_buffer_c) 使用crash分析

```
rpm2cpio kernel-debuginfo-2.6.32-279.el6.x86_64.rpm | cpio -idv ./usr/lib/debug/lib/modules/2.6.32-279.el6.x86_64/vmlinux

crash ./usr/lib/debug/lib/modules/2.6.32-279.el6.x86_64/vmlinux 2017-0326-0343.02-AY1307061945475866c5.155086.33872.482.core
```

i-25rbugoxp

```
wget http://debuginfo.centos.org/6/x86_64/kernel-debuginfo-2.6.32-431.23.3.el6.x86_64.rpm
rpm2cpio kernel-debuginfo-2.6.32-431.23.3.el6.x86_64.rpm | cpio -idv ./usr/lib/debug/lib/modules/2.6.32-431.23.3.el6.x86_64/vmlinux

crash ./usr/lib/debug/lib/modules/2.6.32-431.23.3.el6.x86_64/vmlinux 2017-0411-1125.13-i-25rbugoxp.1495982.761845.2046.core
```

```
export kernel_version=2.6.32-573.22.1.el6.x86_64
wget http://debuginfo.centos.org/6/x86_64/kernel-debuginfo-${kernel_version}.rpm
rpm2cpio kernel-debuginfo-${kernel_version}.rpm | cpio -idv ./usr/lib/debug/lib/modules/${kernel_version}/vmlinux

crash ./usr/lib/debug/lib/modules/${kernel_version}/vmlinux 2017-0411-0913.48-i-23ljwikin.301864.118695.897.core
```

可以看到导致kernel panic的原因是`stack-protector: Kernel stack is corrupted`

```
      KERNEL: vmlinux
    DUMPFILE: 2017-0409-0418.11-AY1307061945475866c5.155086.33872.487.core
        CPUS: 2 [OFFLINE: 1]
        DATE: Sun Apr  9 04:18:10 2017
      UPTIME: 17:13:25
LOAD AVERAGE: 2.00, 2.10, 2.48
       TASKS: 155
    NODENAME: kamiconf4
     RELEASE: 2.6.32-279.el6.x86_64
     VERSION: #1 SMP Fri Jun 22 12:19:21 UTC 2012
     MACHINE: x86_64  (2194 Mhz)
      MEMORY: 2 GB
       PANIC: "Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: ffffffffa016087c"
         PID: 10522
     COMMAND: "AliHids"
        TASK: ffff88007c002080  [THREAD_INFO: ffff88000c8f8000]
         CPU: 0
       STATE: TASK_RUNNING (PANIC)
```

> 使用`sys`命令也可以显示上述信息

检查历史记录，每次crash的时候，出现的panic都是位于 `stack-protector: Kernel stack is corrupted in: ffffffffa016087c` ，内存地址都是`ffffffffa016087c`

使用`dmesg`指令查看，可以看到

* `Not tainted 2.6.32-279.el6.x86_64`表明内核没有强制加载的内核模块（这里采用的是标准的CentOS 6.3系统，内核无污染）

```
TCP: Peer 112.96.145.174:65008/8080 unexpectedly shrunk window 1283949404:1283949405 (repaired)
Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: ffffffffa016087c

Pid: 10522, comm: AliHids Not tainted 2.6.32-279.el6.x86_64 #1
Call Trace:
 [<ffffffff814fd11a>] ? panic+0xa0/0x168
 [<ffffffff8127cdb0>] ? sprintf+0x40/0x50
 [<ffffffff8106b85b>] ? __stack_chk_fail+0x1b/0x30
```

参考 [Kernel Page Error](http://www.dedoimedo.com/computers/crash-analyze.html#mozTocId782257) 如果在`Oops`部分看到`decimal code of the Kernel Page Error`（4位数值，例如`Oops: 0002`）

[crash Kernel Page Error](../../../../../img/os/linux/kernel/tracing/crash-analysis-kpe-1.png)

> 注意位0到3是从右到左

`0002 (dec) --> 0010 (binary) --> Not instruction fetch|Kernel mode|Write|Invalid access`

# 反向跟踪

我们需要分析进程的执行历史，这里需要使用`backtrace`，也就是`bt`指令

```
crash> bt
PID: 10522  TASK: ffff88007c002080  CPU: 0   COMMAND: "AliHids"
 #0 [ffff88000c8f9d80] xen_panic_event at ffffffff810033c2
 #1 [ffff88000c8f9da0] notifier_call_chain at ffffffff81503325
 #2 [ffff88000c8f9de0] atomic_notifier_call_chain at ffffffff8150338a
 #3 [ffff88000c8f9df0] panic at ffffffff814fd145
 #4 [ffff88000c8f9e70] __stack_chk_fail at ffffffff8106b85b
    RIP: 3e79656b2f3c656d  RSP: 676e697274733c20  RFLAGS: 2020202020202020
    RAX: 2020200a3e79656b  RBX: 202020202020200a  RCX: 2020202020202020
    RDX: 0a3e746369643c20  RSI: 2020202020202020  RDI: 2020202020202020
    RBP: 3e746369643c2020   R8: 2f3c676e702e305f   R9: 6968736e6169715f
    R10: 69746f6169623e79  R11: 656b3c2020202020  R12: 2020202020200a3e
    R13: 79656b2f3c73656d  R14: 6172663e79656b3c  R15: 2020202020202020
    ORIG_RAX: 6172663e79656b3c  CS: 202020202020200a  SS: 382c3233337b7b3e
bt: WARNING: possibly bogus exception frame
```

> 这里有一个BUG: 上述采用CentOS 5.11操作系统下编译crash最新版本，来分析`bt`的时候，会出现`bt: WARNING: possibly bogus exception frame`，参考 [Bug 802234 - WARNING: possibly bogus exception frame](https://bugzilla.redhat.com/show_bug.cgi?id=802234)，原来这个BUG在CentOS 7上已经得到修复。
>
> 转换到CentOS 7平台，同样使用`crash ./usr/lib/debug/lib/modules/2.6.32-279.el6.x86_64/vmlinux 2017-0326-0343.02-AY1307061945475866c5.155086.33872.482.core`，就不再出现告警，而输出的正确内容如下

```
crash> bt
PID: 23983  TASK: ffff88007a9c2080  CPU: 0   COMMAND: "AliHids"
 #0 [ffff88007be43d80] xen_panic_event at ffffffff810033c2
 #1 [ffff88007be43da0] notifier_call_chain at ffffffff81503325
 #2 [ffff88007be43de0] atomic_notifier_call_chain at ffffffff8150338a
 #3 [ffff88007be43df0] panic at ffffffff814fd145
 #4 [ffff88007be43e70] __stack_chk_fail at ffffffff8106b85b
    RIP: 00007f5df958360d  RSP: 00007f5df796d958  RFLAGS: 00000206
    RAX: 000000000000c747  RBX: ff8b4d7544171b32  RCX: 00007f5df9fc82c0
    RDX: 00000000000049d4  RSI: 0000000001ca72f8  RDI: 000000000000000f
    RBP: 2f7b07899a13336f   R8: 46c34549d6da7435   R9: c3694c0bf4cc3cc9
    R10: 40e10a9dac1ffa53  R11: 23d56528e78dedf3  R12: 6a6ecd194c7425a2
    R13: 4d852b9f03902eca  R14: dd1390feac2b0f52  R15: 0c5079d804d98fa7
    ORIG_RAX: 0000000000000000  CS: 0033  SS: 002b
```

所以，要正确分析crash core dump，应该在最新的CentOS 7平台上使用crash来完成。否则，会明显看到寄存器内容读取错误，出现诡异的`CS: 202020202020200a`。正确的`CS`内容在CentOS 7平台可以解析出`CS: 0033` 

## Call trace

这里以`#`开头的表示call trace，也就是先前crash时执行内核功能的列表，这里可以看出系统宕机前的迹象。

```
 #0 [ffff88007be43d80] xen_panic_event at ffffffff810033c2
 #1 [ffff88007be43da0] notifier_call_chain at ffffffff81503325
 #2 [ffff88007be43de0] atomic_notifier_call_chain at ffffffff8150338a
 #3 [ffff88007be43df0] panic at ffffffff814fd145
 #4 [ffff88007be43e70] __stack_chk_fail at ffffffff8106b85b
```

## 指令指针

`RIP`表示指令指针（instruction point, IP），也就是指向内存地址，表示在内存中程序进程地址。

```
   RIP: 00007f5df958360d  RSP: 00007f5df796d958  RFLAGS: 00000206
```

> 注意：在32位系统中，指令指针称为`EIP`

> 如果有类似 `[exception RIP: default_idle+61]` 则表示`RIP`指向的内核功能是`default_idle`，`+61`是偏移量（十进制），也就是异常发生的位置。

## 代码段（Code Segment, CS）寄存器

在Call Trace之后的内容是寄存器内容输出，大多数没有太大用途。不过，有一个`CS`(Code Segment)寄存器需要注意

```
CS: 0033
```

###  Privilege levels（特权级别）概念

`privilege level`是CPU的保护资源的概念。不同执行线程可以有不同的特权级别，以允许访问系统资源，类似内存区域，I/O端口，等等。有4个特权级别，从0到3。`0`层是最高权限，也就是内核态；`3`层则权限最低，也就是用户态。

大多数现代操作系统，包括linux，不使用中间2层，只使用`0`和`3`。这里的`level`也称为`ring`（环）。

### 当前特权层（Current Privilege Level, CPL）

Code Segment(CS) register是一个指向程序指令设置的段的指针。该寄存器2个最小的重要位指示了CPU的当前特权层（Current Privilege Level, CPL）。这两位代表的数值是0到3。

### 描述符特权级别（Descriptor Privilege Level, DPL）和 请求特权界别（Requested Privilege Level, RPL）

描述符特权级别（Descriptor Privilege Level, DPL）是被能够访问资源和被定义级别更高级别的权限。这个值在段描述符（Segement Descriptor）中定义。请求特权级别（RPL）是在段选择器(Segment Selector)中定义，至少2位。精确地来说，CPL是不允许超过最大值（RPL, DPL），如果超过，就会导致一般保护错误（General Protection Fault, GPF)。

**`注意`** `CPL`

如果`CPL`是`3`的时候发生系统crash，则表示是由于硬件故障导致的，因为系统不可能由于用户态的错误导致crash。

相反，则可能是由于存在bug的系统调用导致的问题。

> 更多信息，请参考O'Reilly的[Understanding Linux Kernel](https://www.amazon.cn/gp/product/B0011F5RYM/ref=zg_bs_663825051_4?ie=UTF8&psc=1&refRID=FZ0A1G9D8B6CSD5BHFZA) 第二章 "内存地址" 中有关 Segment Selectors, Segment Descriptors, Table Index, Global and Local Descriptor Tables , Current Privilege Level (CPL)等概念。

在这里的案例 `CS: 0033`，表示

### 内核crash时的功能调用

前述案例中crash时执行内核功能的列表

```
 #0 [ffff88000c8f9d80] xen_panic_event at ffffffff810033c2
 #1 [ffff88000c8f9da0] notifier_call_chain at ffffffff81503325
 #2 [ffff88000c8f9de0] atomic_notifier_call_chain at ffffffff8150338a
 #3 [ffff88000c8f9df0] panic at ffffffff814fd145
 #4 [ffff88000c8f9e70] __stack_chk_fail at ffffffff8106b85b
```

可以看到功能调用顺序

```
xen_panic_event => notifier_call_chain => atomic_notifier_call_chain
panic at ffffffff814fd145
__stack_chk_fail at ffffffff8106b85b
```

## backtrace所有任务

默认情况下，crash智慧显示活跃任务的backtrace，如果要查看所有任务的backtrace，需要使用`foreach`

```
foreach bt
```

## dump系统消息缓存

`log`命令可以显示系统message buffer。在这个内核log buffer(`log_buf`)有可能包含有用的crash信息。不过，如果发生了间歇性的硬件故障或者纯软件bug，这个`log`命令可能没有什么帮助。

尝试了发现实际和`dmesg`没有差别

## 显示进程状态信息

`ps` 命令可以显示进程状态信息：

```
crash> ps
   PID    PPID  CPU       TASK        ST  %MEM     VSZ    RSS  COMM
> 20423      1   1  ffff88007b2f2080  RU   0.2  243724   3716  pamdicks
...
> 23983      1   0  ffff88007a9c2080  RU   0.4   95416   7756  AliHids
...      
```

这里`>`表示active task

注意：一定要使用正确的操作系统和crash，我遇到在CentOS 5上使用crash错误指向了active task

可以看到和`bt`显示的一样 `PID: 10522  TASK: ffff88007c002080  CPU: 0   COMMAND: "AliHids"`，这里可以从`ffff88007c002080`任务地址看到`AliHids`

# 分析

完整显示`backtrace`

```
crash>  bt -f 23983
PID: 23983  TASK: ffff88007a9c2080  CPU: 0   COMMAND: "AliHids"
 #0 [ffff88007be43d80] xen_panic_event at ffffffff810033c2
    ffff88007be43d88: ffff880000000003 ffffffff8102b610
    ffff88007be43d98: ffff88007be43dd8 ffffffff81503325
 #1 [ffff88007be43da0] notifier_call_chain at ffffffff81503325
    ffff88007be43da8: ffff88007be43db8 ffffffff81793c68
    ffff88007be43db8: 0000000000000001 00000000000049d4
    ffff88007be43dc8: 0000000001ca72f8 ffff88000f640000
    ffff88007be43dd8: ffff88007be43de8 ffffffff8150338a
 #2 [ffff88007be43de0] atomic_notifier_call_chain at ffffffff8150338a
    ffff88007be43de8: ffff88007be43e68 ffffffff814fd145
 #3 [ffff88007be43df0] panic at ffffffff814fd145
    ffff88007be43df8: 0000000000000001 00000000000049d4
    ffff88007be43e08: ffff880000000010 ffff88007be43e78
    ffff88007be43e18: ffff88007be43e28 ffffffff8127cdb0
    ffff88007be43e28: ffff880000000018 ffffffffa016087c
    ffff88007be43e38: 05b3cfb3cd059c9a 0000000000000000
    ffff88007be43e48: 0000000000000004 0000000001ca72f8
    ffff88007be43e58: 0000000000000001 ffff88000f6400fd
    ffff88007be43e68: ffff88007be43e78 ffffffff8106b85b
 #4 [ffff88007be43e70] __stack_chk_fail at ffffffff8106b85b
    RIP: 00007f5df958360d  RSP: 00007f5df796d958  RFLAGS: 00000206
    RAX: 000000000000c747  RBX: ff8b4d7544171b32  RCX: 00007f5df9fc82c0
    RDX: 00000000000049d4  RSI: 0000000001ca72f8  RDI: 000000000000000f
    RBP: 2f7b07899a13336f   R8: 46c34549d6da7435   R9: c3694c0bf4cc3cc9
    R10: 40e10a9dac1ffa53  R11: 23d56528e78dedf3  R12: 6a6ecd194c7425a2
    R13: 4d852b9f03902eca  R14: dd1390feac2b0f52  R15: 0c5079d804d98fa7
    ORIG_RAX: 0000000000000000  CS: 0033  SS: 002b
```

# 查看源代码

* `#4 [ffff88007be43e70] __stack_chk_fail at ffffffff8106b85b`

```
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 459
0xffffffff8106b840 <__stack_chk_fail>:  push   %rbp
0xffffffff8106b841 <__stack_chk_fail+1>:        mov    %rsp,%rbp
0xffffffff8106b844 <__stack_chk_fail+4>:        nopl   0x0(%rax,%rax,1)
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 460
0xffffffff8106b849 <__stack_chk_fail+9>:        mov    0x8(%rbp),%rsi
0xffffffff8106b84d <__stack_chk_fail+13>:       mov    $0xffffffff81793c68,%rdi
0xffffffff8106b854 <__stack_chk_fail+20>:       xor    %eax,%eax
0xffffffff8106b856 <__stack_chk_fail+22>:       callq  0xffffffff814fd07a <panic>
```

> `dis -l (function+offset)` -- disassemble

**这里可以看到源代码以及所在行**

类似倒推，一共有4个函数需要检查

* `#3 [ffff88007be43df0] panic at ffffffff814fd145`

```
crash> dis -l panic
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 67
0xffffffff814fd07a <panic>:     push   %rbp
0xffffffff814fd07b <panic+1>:   mov    %rsp,%rbp
0xffffffff814fd07e <panic+4>:   push   %rbx
0xffffffff814fd07f <panic+5>:   sub    $0x68,%rsp
0xffffffff814fd083 <panic+9>:   callq  0xffffffff8100adc0 <mcount>
0xffffffff814fd088 <panic+14>:  mov    %rdi,%rbx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 83
0xffffffff814fd08b <panic+17>:  mov    $0xffffffff81e25940,%rdi
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 67
0xffffffff814fd092 <panic+24>:  mov    %rsi,-0x38(%rbp)
0xffffffff814fd096 <panic+28>:  mov    %rdx,-0x30(%rbp)
0xffffffff814fd09a <panic+32>:  mov    %rcx,-0x28(%rbp)
0xffffffff814fd09e <panic+36>:  mov    %r8,-0x20(%rbp)
0xffffffff814fd0a2 <panic+40>:  mov    %r9,-0x18(%rbp)
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 83
0xffffffff814fd0a6 <panic+44>:  callq  0xffffffff814fff30 <__sched_text_end>
0xffffffff814fd0ab <panic+49>:  test   %eax,%eax
0xffffffff814fd0ad <panic+51>:  jne    0xffffffff814fd0b4 <panic+58>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 84
0xffffffff814fd0af <panic+53>:  callq  0xffffffff8106b350 <panic_smp_self_stop>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/include/linux/kernel.h: 358
0xffffffff814fd0b4 <panic+58>:  cmpl   $0x0,0x59a345(%rip)        # 0xffffffff81a97400 <console_printk>
0xffffffff814fd0bb <panic+65>:  je     0xffffffff814fd0c7 <panic+77>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/include/linux/kernel.h: 359
0xffffffff814fd0bd <panic+67>:  movl   $0xf,0x59a339(%rip)        # 0xffffffff81a97400 <console_printk>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 87
0xffffffff814fd0c7 <panic+77>:  mov    $0x1,%edi
0xffffffff814fd0cc <panic+82>:  callq  0xffffffff8127f420 <bust_spinlocks>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 88
0xffffffff814fd0d1 <panic+87>:  lea    0x10(%rbp),%rax
0xffffffff814fd0d5 <panic+91>:  lea    -0x60(%rbp),%rcx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 89
0xffffffff814fd0d9 <panic+95>:  mov    %rbx,%rdx
0xffffffff814fd0dc <panic+98>:  mov    $0x400,%esi
0xffffffff814fd0e1 <panic+103>: mov    $0xffffffff81e25540,%rdi
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 88
0xffffffff814fd0e8 <panic+110>: movl   $0x8,-0x60(%rbp)
0xffffffff814fd0ef <panic+117>: mov    %rax,-0x58(%rbp)
0xffffffff814fd0f3 <panic+121>: lea    -0x40(%rbp),%rax
0xffffffff814fd0f7 <panic+125>: mov    %rax,-0x50(%rbp)
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 89
0xffffffff814fd0fb <panic+129>: callq  0xffffffff8127c780 <vsnprintf>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 91
0xffffffff814fd100 <panic+134>: mov    $0xffffffff81e25540,%rsi
0xffffffff814fd107 <panic+141>: mov    $0xffffffff81793c40,%rdi
0xffffffff814fd10e <panic+148>: xor    %eax,%eax
0xffffffff814fd110 <panic+150>: callq  0xffffffff814fd1e2 <printk>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 93
0xffffffff814fd115 <panic+155>: callq  0xffffffff814fd004 <dump_stack>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 101
0xffffffff814fd11a <panic+160>: xor    %edi,%edi
0xffffffff814fd11c <panic+162>: callq  0xffffffff810ba5f0 <crash_kexec>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 103
0xffffffff814fd121 <panic+167>: xor    %edi,%edi
0xffffffff814fd123 <panic+169>: callq  0xffffffff8106c930 <kmsg_dump>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/include/asm/smp.h: 85
0xffffffff814fd128 <panic+174>: xor    %edi,%edi
0xffffffff814fd12a <panic+176>: callq  *0x595e48(%rip)        # 0xffffffff81a92f78 <smp_ops+24>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 112
0xffffffff814fd130 <panic+182>: xor    %esi,%esi
0xffffffff814fd132 <panic+184>: mov    $0xffffffff81e25540,%rdx
0xffffffff814fd139 <panic+191>: mov    $0xffffffff81e254c0,%rdi
0xffffffff814fd140 <panic+198>: callq  0xffffffff81503370 <atomic_notifier_call_chain>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 114
0xffffffff814fd145 <panic+203>: xor    %edi,%edi
0xffffffff814fd147 <panic+205>: callq  0xffffffff8127f420 <bust_spinlocks>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 116
0xffffffff814fd14c <panic+210>: cmpq   $0x0,0x92837c(%rip)        # 0xffffffff81e254d0 <panic_blink>
0xffffffff814fd154 <panic+218>: jne    0xffffffff814fd161 <panic+231>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 117
0xffffffff814fd156 <panic+220>: movq   $0xffffffff8106b340,0x92836f(%rip)        # 0xffffffff81e254d0 <panic_blink>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 119
0xffffffff814fd161 <panic+231>: mov    0x928371(%rip),%esi        # 0xffffffff81e254d8 <panic_timeout>
0xffffffff814fd167 <panic+237>: test   %esi,%esi
0xffffffff814fd169 <panic+239>: jle    0xffffffff814fd1b8 <panic+318>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 124
0xffffffff814fd16b <panic+241>: mov    $0xffffffff8178cf76,%rdi
0xffffffff814fd172 <panic+248>: xor    %eax,%eax
0xffffffff814fd174 <panic+250>: xor    %ebx,%ebx
0xffffffff814fd176 <panic+252>: callq  0xffffffff814fd1e2 <printk>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 126
0xffffffff814fd17b <panic+257>: jmp    0xffffffff814fd1a2 <panic+296>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 127
0xffffffff814fd17d <panic+259>: callq  0xffffffff810db560 <touch_nmi_watchdog>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 128
0xffffffff814fd182 <panic+264>: mov    %rbx,%rdi
0xffffffff814fd185 <panic+267>: callq  *0x928345(%rip)        # 0xffffffff81e254d0 <panic_blink>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 129
0xffffffff814fd18b <panic+273>: mov    $0x418958,%edi
0xffffffff814fd190 <panic+278>: mov    %rax,-0x68(%rbp)
0xffffffff814fd194 <panic+282>: callq  0xffffffff8127d440 <__const_udelay>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 130
0xffffffff814fd199 <panic+287>: mov    -0x68(%rbp),%rax
0xffffffff814fd19d <panic+291>: lea    0x1(%rbx,%rax,1),%rbx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 126
0xffffffff814fd1a2 <panic+296>: imul   $0x3e8,0x92832c(%rip),%eax        # 0xffffffff81e254d8 <panic_timeout>
0xffffffff814fd1ac <panic+306>: cltq
0xffffffff814fd1ae <panic+308>: cmp    %rbx,%rax
0xffffffff814fd1b1 <panic+311>: jg     0xffffffff814fd17d <panic+259>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 137
0xffffffff814fd1b3 <panic+313>: callq  0xffffffff8108a770 <emergency_restart>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/include/asm/paravirt.h: 885
0xffffffff814fd1b8 <panic+318>: sti
0xffffffff814fd1b9 <panic+319>: nopw   0x0(%rax,%rax,1)
0xffffffff814fd1bf <panic+325>: xor    %ebx,%ebx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 157
0xffffffff814fd1c1 <panic+327>: callq  0xffffffff810dacf0 <touch_softlockup_watchdog>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 158
0xffffffff814fd1c6 <panic+332>: mov    %rbx,%rdi
0xffffffff814fd1c9 <panic+335>: callq  *0x928301(%rip)        # 0xffffffff81e254d0 <panic_blink>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 159
0xffffffff814fd1cf <panic+341>: mov    $0x418958,%edi
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 158
0xffffffff814fd1d4 <panic+346>: add    %rax,%rbx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 160
0xffffffff814fd1d7 <panic+349>: add    $0x1,%rbx
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/panic.c: 159
0xffffffff814fd1db <panic+353>: callq  0xffffffff8127d440 <__const_udelay>
0xffffffff814fd1e0 <panic+358>: jmp    0xffffffff814fd1c1 <panic+327>
```

* `[ffff88007be43de0] atomic_notifier_call_chain at ffffffff8150338a`

```
crash> dis -l atomic_notifier_call_chain
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/notifier.c: 190
0xffffffff81503370 <atomic_notifier_call_chain>:        push   %rbp
0xffffffff81503371 <atomic_notifier_call_chain+1>:      mov    %rsp,%rbp
0xffffffff81503374 <atomic_notifier_call_chain+4>:      callq  0xffffffff8100adc0 <mcount>
0xffffffff81503379 <atomic_notifier_call_chain+9>:      xor    %r8d,%r8d
0xffffffff8150337c <atomic_notifier_call_chain+12>:     mov    $0xffffffff,%ecx
0xffffffff81503381 <atomic_notifier_call_chain+17>:     add    $0x8,%rdi
0xffffffff81503385 <atomic_notifier_call_chain+21>:     callq  0xffffffff815032d0 <notifier_call_chain>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/notifier.c: 192
0xffffffff8150338a <atomic_notifier_call_chain+26>:     leaveq
0xffffffff8150338b <atomic_notifier_call_chain+27>:     retq
```

* `[ffff88007be43da0] notifier_call_chain at ffffffff81503325`

```
crash> dis -l atomic_notifier_call_chain
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/notifier.c: 190
0xffffffff81503370 <atomic_notifier_call_chain>:        push   %rbp
0xffffffff81503371 <atomic_notifier_call_chain+1>:      mov    %rsp,%rbp
0xffffffff81503374 <atomic_notifier_call_chain+4>:      callq  0xffffffff8100adc0 <mcount>
0xffffffff81503379 <atomic_notifier_call_chain+9>:      xor    %r8d,%r8d
0xffffffff8150337c <atomic_notifier_call_chain+12>:     mov    $0xffffffff,%ecx
0xffffffff81503381 <atomic_notifier_call_chain+17>:     add    $0x8,%rdi
0xffffffff81503385 <atomic_notifier_call_chain+21>:     callq  0xffffffff815032d0 <notifier_call_chain>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/kernel/notifier.c: 192
0xffffffff8150338a <atomic_notifier_call_chain+26>:     leaveq
0xffffffff8150338b <atomic_notifier_call_chain+27>:     retq
```

* `#0 [ffff88007be43d80] xen_panic_event at ffffffff810033c2`

```
crash> dis -l xen_panic_event
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/xen/enlighten.c: 1076
0xffffffff810033a0 <xen_panic_event>:   push   %rbp
0xffffffff810033a1 <xen_panic_event+1>: mov    %rsp,%rbp
0xffffffff810033a4 <xen_panic_event+4>: sub    $0x10,%rsp
0xffffffff810033a8 <xen_panic_event+8>: nopl   0x0(%rax,%rax,1)
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/include/asm/xen/hypercall.h: 273
0xffffffff810033ad <xen_panic_event+13>:        mov    $0x2,%edi
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/xen/enlighten.c: 1077
0xffffffff810033b2 <xen_panic_event+18>:        movl   $0x3,-0x10(%rbp)
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/include/asm/xen/hypercall.h: 273
0xffffffff810033b9 <xen_panic_event+25>:        lea    -0x10(%rbp),%rsi
0xffffffff810033bd <xen_panic_event+29>:        callq  0xffffffff810013a0 <hypercall_page+928>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/xen/enlighten.c: 1079
0xffffffff810033c2 <xen_panic_event+34>:        test   %eax,%eax
0xffffffff810033c4 <xen_panic_event+36>:        je     0xffffffff810033ca <xen_panic_event+42>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/xen/enlighten.c: 1080
0xffffffff810033c6 <xen_panic_event+38>:        ud2
0xffffffff810033c8 <xen_panic_event+40>:        jmp    0xffffffff810033c8 <xen_panic_event+40>
/usr/src/debug/kernel-2.6.32-279.el6/linux-2.6.32-279.el6.x86_64/arch/x86/xen/enlighten.c: 1082
0xffffffff810033ca <xen_panic_event+42>:        xor    %eax,%eax
0xffffffff810033cc <xen_panic_event+44>:        leaveq
0xffffffff810033cd <xen_panic_event+45>:        retq
```

# 扩展`ps`和`files`

```
crash> ps
```

可以看到

```
   PID    PPID  CPU       TASK        ST  %MEM     VSZ    RSS  COMM
> 23983      1   0  ffff88007a9c2080  RU   0.4   95416   7756  AliHids
```

* 检查文件

```
crash> file ffff88007a9c2080
struct file {
  f_u = {
    fu_list = {
      next = 0x0,
      prev = 0xffff88007be42000
    },
    fu_rcuhead = {
      next = 0x0,
      func = 0xffff88007be42000
    }
  },
  f_path = {
    mnt = 0x40214000000002,
    dentry = 0xffffffff00000000
  },
  f_op = 0x7800000078,
  f_lock = {
    raw_lock = {
      slock = 120
    }
  },
  f_count = {
    counter = -2124369120
  },
  f_flags = 1024,
  f_mode = 0,
  f_pos = 4194304,
  f_owner = {
    lock = {
      raw_lock = {
        lock = 1
      }
    },
    pid = 0x0,
    pid_type = PIDTYPE_PID,
    uid = 0,
    euid = 35743528,
    signum = -30720
  },
  f_cred = 0xffff880037708b00,
  f_ra = {
    start = 1,
    size = 11186381,
    async_size = 156034,
    ra_pages = 1415622133,
    mmap_miss = 3,
    prev_pos = 39654903394240
  },
  f_version = 14245521487,
  f_security = 0x0,
  private_data = 0x0,
  f_ep_links = {
    next = 0x23,
    prev = 0x0
  },
  f_mapping = 0x0
}
```

```
crash> set ffff88007a9c2080
    PID: 23983
COMMAND: "AliHids"
   TASK: ffff88007a9c2080  [THREAD_INFO: ffff88007be42000]
    CPU: 0
  STATE: TASK_RUNNING (PANIC)
```

# 内核源代码获取

# 参考

* [Analyzing Linux kernel crash dumps with crash - The one tutorial that has it all](http://www.dedoimedo.com/computers/crash-analyze.html)
* [How to debug a kernel crash](https://people.netfilter.org/hawk/presentations/debugging_conf2013/debug2013_kernel_panic_decode_JesperBrouer.pdf)
* [Linux Crash Dump Capture and Analysis](https://www.slideshare.net/PaulVNovarese/linux-crash-dump-capture-and-analysis)