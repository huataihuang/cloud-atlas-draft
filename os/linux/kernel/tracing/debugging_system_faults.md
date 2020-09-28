# 调试系统故障（Debugging System Faults）

即使你已经使用了所有监控和调试技术，有时候驱动中依然有bug，此时驱动程序执行时会出现系统故障（system fault）。故障发生时，重要的是尽可能搜集足够信息来解决问题。

注意"fault"并不意味着"panic"。Linux代码足够鲁棒可以优雅地响应大多数错误：一个失效故障通常发生破坏当前进程，而操作系统依然可以工作。如果失效故障发生在进程上下文之外或者系统的某些重要部分损坏，则系统依然`可以`panic。但是当错误发生在驱动发生错误的时候，通常导致使用这个驱动的进程突然死亡。当进程被销毁时唯一不可恢复的损坏是分配给这个进程的上下文的一些内存丢失；举例，由驱动通过`kmalloc`分配的动态列表可能会丢失。然而，由于进程死亡时，内核会将这个死亡进程所有打开的设备调用`close`操作，你的驱动可以释放掉先前通过`open`方法分配的资源。

甚至一个oops通常都不会导致整个系统宕机，你可能会发现需要在oops发生后自己重启系统。一个有bug的驱动可以导致应将不可使用，导致内核资源处于异常状态，或者，随机位置出现腐败的内核内存。通常你可以简单卸载存在bug的驱动并在oops之后再次尝试。不过，如果你发现任何系统整体不能正常工作，最有可能还是立即重启系统。

以下解释如何解码并使用输出到控制台的信息。虽然控制台信息对新手非常费解，处理器dump的信息还是很有用，通常足够找到程序bug而无须另外的测试。

## Oops消息

大多数bug显示它们在空指针（`NULL` pointer）错误引用或者由于使用了其他不正确的指针值。这种bug导致的有用输出信息是一个oops消息。

几乎任何处理器使用的地址都是一个虚拟地址并且通过一个复杂的页表结构映射到物理地址（唯一例外的是内存管理子系统自身是直接使用物理地址）。当一个错误当指针被错误引用，内存页分配机制将无法完成映射指针到物理内存，并且处理器发送一个页错误（page fault）给操作系统。如果地址是无效当，内核就不能"page in"错失的地址；如果此时处理器处于supervisor模式，内核通常产生一个oops。

一个oops显示了错误发生时处理器状态，包括CPU寄存器中内容以及其他看似无法理解的信息。这个消息是通过在默认处理者（`arch/*/kernel/traps.c`）的`printk`状态生成的。

让我们查看一个消息，以下是内核V2.6的一个空指针错误引用导致的，最相关的信息是指令指针（instruction pointer, EIP），即错误指令的地址。

> 有关空指针的概念参考 [访问 NULL 指针错误背后的原理](http://blog.xiaohansong.com/2016/02/18/dereference-null/)

```
Unable to handle kernel NULL pointer dereference at virtual address 00000000
 printing eip:
d083a064
Oops: 0002 [#1]
SMP 
CPU:    0
EIP:    0060:[<d083a064>]    Not tainted
EFLAGS: 00010246   (2.6.6) 
EIP is at faulty_write+0x4/0x10 [faulty]
eax: 00000000   ebx: 00000000   ecx: 00000000   edx: 00000000
esi: cf8b2460   edi: cf8b2480   ebp: 00000005   esp: c31c5f74
ds: 007b   es: 007b   ss: 0068
Process bash (pid: 2086, threadinfo=c31c4000 task=cfa0a6c0)
Stack: c0150558 cf8b2460 080e9408 00000005 cf8b2480 00000000 cf8b2460 cf8b2460 
       fffffff7 080e9408 c31c4000 c0150682 cf8b2460 080e9408 00000005 cf8b2480 
       00000000 00000001 00000005 c0103f8f 00000001 080e9408 00000005 00000005 
Call Trace:
 [<c0150558>] vfs_write+0xb8/0x130
 [<c0150682>] sys_write+0x42/0x70
 [<c0103f8f>] syscall_call+0x7/0xb

Code: 89 15 00 00 00 00 c3 90 8d 74 26 00 83 ec 0c b8 00 a6 83 d0
```

这个消息是通过写入到属于`faulty`模块的设备而产生的消息，这个`faulty`模块是特意用来显示故障的。在`faulty.c`实现了写入方法：

```
ssize_t faulty_write (struct file *filp, const char _ _user *buf, size_t count,
        loff_t *pos)
{
    /* make a simple fault by dereferencing a NULL pointer */
    *(int *)0 = 0;
    return 0;
}
```

正如你所见，这里有一个错误引用的空指针。由于`0`永远不是正确的指针值，就发生了一个错误，这使得内核变成前面显示的消息，这个调用进程被杀死。

这个`错误`模块有在`read`实现中一个不同的错误条件：

```
ssize_t faulty_read(struct file *filp, char _ _user *buf,
            size_t count, loff_t *pos)
{
    int ret;
    char stack_buf[4];

    /* Let's try a buffer overflow  */
    memset(stack_buf, 0xff, 20);
    if (count > 4)
        count = 4; /* copy 4 bytes to the user */
    ret = copy_to_user(buf, stack_buf, count);
    if (!ret)
        return count;
    return ret;
}
```

上述方法复制一个字符串到一个本地变量；不幸的是，字符串比目标数组要长。结果这个功能返回时候出现缓存溢出导致一个oops。由于`return`指令带来的指令指向空的地方，这种错误非常难跟踪，并且你得到了类似如下消息

```
EIP:    0010:[<00000000>]
Unable to handle kernel paging request at virtual address ffffffff
 printing eip:
ffffffff
Oops: 0000 [#5]
SMP 
CPU:    0
EIP:    0060:[<ffffffff>]    Not tainted
EFLAGS: 00010296   (2.6.6) 
EIP is at 0xffffffff
eax: 0000000c   ebx: ffffffff   ecx: 00000000   edx: bfffda7c
esi: cf434f00   edi: ffffffff   ebp: 00002000   esp: c27fff78
ds: 007b   es: 007b   ss: 0068
Process head (pid: 2331, threadinfo=c27fe000 task=c3226150)
Stack: ffffffff bfffda70 00002000 cf434f20 00000001 00000286 cf434f00 fffffff7 
       bfffda70 c27fe000 c0150612 cf434f00 bfffda70 00002000 cf434f20 00000000 
       00000003 00002000 c0103f8f 00000003 bfffda70 00002000 00002000 bfffda70 
Call Trace:
 [<c0150612>] sys_read+0x42/0x70
 [<c0103f8f>] syscall_call+0x7/0xb

Code:  Bad EIP value.
```

在这个案例中，我们只看到部分的调用堆栈（`vfs_read`和`faulty_read`被忽略了），并且内核报错"`Bad EIP value`"。这个报错，以及偏移地址（`ffffffff`）列出在开始部分，都提示了内核堆栈已经破坏。

总的来说，当你面对一个oops，首先要查看问题发生的位置，通常会独立地显示在调用堆栈前面。上述oops案例中，相关行显示：

```
EIP is at faulty_write+0x4/0x10 [faulty]
```

这里我们看到在功能`faulty_write`，位于`faulty`模块（也就是`[]`中列出）。这个十六进制数字表示指令指针在该function中是4字节，并显示为10(hex)字节长度。通常这已经足够指出错误所在。

如果你需要进一步信息，调用堆栈显示了各部分如何获得的。堆栈是使用十六进制格式打印，使用一些手段，你通常可以检查堆栈中列出本地变量的值以及功能参数。有经验的内核开发者可以从这一系列式样中辨别出线索。例如，以下堆栈显示`faulty_read` oops:

```
Stack: ffffffff bfffda70 00002000 cf434f20 00000001 00000286 cf434f00 fffffff7 
       bfffda70 c27fe000 c0150612 cf434f00 bfffda70 00002000 cf434f20 00000000 
       00000003 00002000 c0103f8f 00000003 bfffda70 00002000 00002000 bfffda70
```

在堆栈顶部的`ffffffff`是中断事情的部分字符串。在x86架构中，默认，用户空间堆栈从低于`0xc0000000`开始，也就是反复出现的`0xbfffda70`可能是一个用户空间堆栈地址；实际上，这个在缓存中地址传递给`read`系统调用，每次下传到内核调用链时候被替换。在x86架构(默认)内核空间从`0xc0000000`开始，所以高于该值的就是内核空间地址，依次类推。

最后，当查看oops列表，要注意"`slab poisoning`"值。例如，如果你收到一个内核oops位于偏移地址`0xa5a5a5a5`，你通常是忘记在什么地方初始化动态内存了。

> [Linux SLUB 分配器详解](http://www.ibm.com/developerworks/cn/linux/l-cn-slub/index.html)介绍了SLAB和SLUB内核对象缓冲区分配器。

注意只有在内核编译时候开启了`CONFIG_KALLSYMS`选项的时候才能看到上述的符号调用堆栈。否则就只能看到底层的十六进制列表，这对解码的帮助就低很多了。

## 系统挂起（System Hangs）

虽然大多数内核代码bug最后只出现oops消息，有时候也会导致系统完全挂起。如果系统挂起，没有消息打印出。例如，如果代码进入死循环，内核停止调度，以及系统不能响应任何动作，包括Ctrl-Alt-Del组合键。你有两个选择来处理系统挂起 -- 或者提前防范 或者能够在发生时debug

> 『内核停止调度』实际上，多处理器系统仍然可以在其他处理器上调度，甚至单处理器也可能在内核抢占（kernel preemption）激活情况下调度。在大多数情况下（单处理器是关闭内核抢占的），系统还是停止了调度。

通过在关键点插入`schedule`invocations来防止无止尽的循环。这个`schedule`调用（如你所猜测）发起调度并且允许其他进程从当前进程中偷取CPU时间。如果一个进程由于驱动中的bug陷入到内核空间循环，`schedule`调用可以让你能够在这个跟踪发生时杀死进程。

当然你将会意识到，任何针对调度的调用可能会创建一个针对驱动的可重入调用的附加资源，因为它允许其他进程运行。这个重入（reentrancy）通常不会是问题，假设你已经在驱动中使用了合适的锁。但是，**一定要确保在你的驱动获得了一个spinlock时候不要调用`schedule`**。

如果你的驱动确实hang住了系统，并且你不知道在哪里可以插入`schedule`调用，最好的方法是添加一些print消息，并将消息写入到控制台（如果需要通过修改`console_loglevel`值）。

有时候系统可能表现成hung，但实际上不是。可能发生在，例如，如果键盘在某种特殊情况下保持锁住。这些宕机可以通过保持运行的程序的输出来判断。显示屏上的时钟或系统负载监控可以作为一个好的状态监控，如果它持续更新，则表示调度器还在工作。

对于很多锁死的系统，一个必不可少的工具是"magic SysRq key"，在很多架构上都有。Magic SysRq在PC键盘上是组合使用Alt和SysRq键，并且在串口控制台也可使用。而第3个组合键，使用以下键：

* `r` - 关闭键盘raw模式；通常用于crash程序（如X server）导致键盘处于奇怪的状态
* `k` - 调用"安全关注键"（secure attention key, SAK）功能。SAK杀死当前控制台中运行的所有进程，还给你一个干净的终端
* `s` - 执行一次所有磁盘的紧急同步
* `u` - umount。尝试重新挂载所有磁盘进入只读模式。这个操作通常在`s`动作之后进行，可以在系统出现一系列故障时减少大量的文件系统检查时间
* `b` - Boot。立即重启系统，请确保已经做过磁盘同步并且重新挂载过磁盘
* `p` - 打印处理器的寄存器信息
* `t` - 打印当前任务列表
* `m` - 打印内存信息

其他SysRq功能参考内核源码文档目录下的`sysrq.txt`。注意magic SysRq必须明确在内核配置中激活，而大多数发行版由于安全原因并没有激活该功能。对于用于开发驱动的系统，激活magic SysRq来调试内核非常必要。Magic SysRq可以在运行时通过以下命令关闭：

```
echo 0 > /proc/sys/kernel/sysrq
```

如果未经授权人可以访问你的系统键盘，则考虑到防止故障或危险，应关闭这个功能。一些早期内核版本默认就关闭了sysrq，所以你需要在运行时通过写入`1`到相同的`/proc/sys/kernel/sysrq`来激活。

sysrq操作非常游泳，所以对于系统管理员无法访问控制台，有一个`/proc/sysrq-trigger`只写的入口文件，可以通过写入相应的命令字符来触发特定的sysrq动作；这样就可以搜集到任何内核日志输出数据。这个sysrq入口始终工作的，哪怕`sysrq`在控制台disable。

如果你经历了一个"live hang"，也就是驱动陷入循环但是系统整体上依旧工作，则有很多技术可用。通常SysRq `p`功能可以指出错误规则。失败时，你也可以使用内核`profiling`功能。激活`profiling`方式编译内核并启动内核使用`profile=2`。使用`readprofile`工具重置profile计数器，然后将驱动陷入到循环。过一会，再次使用`readprofile`来查看内核花费时间。另一个有用的工具是`oprofile`，文档`Documentation/basic_profilling.txt`可以告诉你使用profileer的方法。

一个当系统挂起时值得使用的预防措施是将所有磁盘挂载成只读（或者卸载掉磁盘）。如果磁盘只读或者卸载，就没有破坏文件系统的风险或者导致文件系统异常状态。另外一个可能是使用一个主机通过NFS挂载作为系统文件系统。这个"NFS-Root"功能需要在内核激活，并且特定参数必须传递给内核。这样，就可以甚至没有SysRq也可避免文件系统损坏，因为这时候文件系统完全是由NFS服务器管理的，而不是由设备驱动管理。

# 参考

* 本文翻译自[Linux Device Drivers, 3rd Edition: Debugging System Faults](http://www.makelinux.net/ldd3/chp-4-sect-5) 主要想参考一下排查方法

本书在亚马逊有中文版纸质书「[LINUX设备驱动程序(第3版)](https://www.amazon.cn/LINUX设备驱动程序-科波特/dp/B001147E76/ref=sr_1_1?ie=UTF8&qid=1490794333&sr=8-1&keywords=linux+驱动)」可购买。