# 问题

线上系统通过`cgroup`方式，将一些辅助代理进程加入到名为`agent`的cgroup控制组，并限定使用`cpu 24`。这种方式是为了避免辅助程序和应用系统争抢CPU资源。

但是，发现数十个辅助程序绑定到`cpu 24`之后，这个CPU出现了非常严重的`sys`使用率，从`top`来看，系统`load average`负载非常高，但是实际上除了少数`cpu`确实计算较为繁忙，大多数cpu都是空闲的。

```
top - 22:35:20 up 50 days,  8:33,  2 users,  load average: 40.91, 41.86, 42.51
Tasks: 7101 total,  38 running, 7058 sleeping,   0 stopped,   5 zombie
Cpu0  :  0.0%us,  0.0%sy,  0.0%ni, 88.4%id, 11.6%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu1  :  0.0%us,  3.7%sy,  0.0%ni, 95.0%id,  1.3%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu2  : 21.7%us,  6.2%sy,  0.0%ni, 69.1%id,  2.0%wa,  0.0%hi,  1.0%si,  0.0%st
Cpu3  : 27.6%us, 12.8%sy,  0.0%ni, 57.2%id,  0.0%wa,  0.0%hi,  2.3%si,  0.0%st
...
Cpu24 : 32.1%us, 67.6%sy,  0.0%ni,  0.0%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
...
Mem:  263819896k total, 137107080k used, 126712816k free,  2005040k buffers
Swap:        0k total,        0k used,        0k free, 30639512k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
27980 root      20   0 1189m 1.0g 5148 S 107.1  0.4   8049:15 qemu-kvm
32303 root      20   0 1274m 1.0g 5136 S 106.5  0.4   2790:12 qemu-kvm
 3869 root      20   0 1193m 171m 5108 S 43.6  0.1   0:05.26 qemu-kvm
```

> 有关`top`的使用详解请参考 [top命令使用tips](../../../os/linux/process/management/top_tips)

* 由于`cpu 24`上的某个程序（如果我推测没有错的话）导致CPU大量消耗`sys`，并且导致运行队列过长，所以临时将所有的进程都迁移到另一个控制组`service`中（这个`service`控制组分配了多个CPU资源，可以承担较大负载）

```
for i in `cat /cgroup/cpuset/agent/tasks`;do sudo cgclassify -g cpuset:service $i;done
```

果然可以看到，`sys`被分担到CPU `2-5,26-29` 上，此时可以看到这8个CPU上`sys`大量增加。不过好在有8个CPU分担，没有造成CPU完全满负荷，所以可以看到运行队列立即得到缓解，系统`load average`从原先40以上下降到10以下。

```
top - 23:18:20 up 50 days,  9:16,  3 users,  load average: 9.14, 15.95, 28.81
Tasks: 6994 total,   3 running, 6988 sleeping,   0 stopped,   3 zombie
Cpu0  :  0.0%us,  0.3%sy,  0.0%ni, 97.7%id,  2.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu1  :  0.0%us,  6.7%sy,  0.0%ni, 91.6%id,  1.3%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu2  : 15.5%us, 41.3%sy,  4.2%ni, 35.5%id,  0.0%wa,  0.0%hi,  3.5%si,  0.0%st
Cpu3  : 16.4%us, 43.4%sy,  7.4%ni, 26.4%id,  0.0%wa,  0.0%hi,  6.4%si,  0.0%st
Cpu4  : 17.7%us, 38.3%sy,  4.8%ni, 31.5%id,  2.3%wa,  0.0%hi,  5.5%si,  0.0%st
Cpu5  : 24.7%us, 24.0%sy,  0.6%ni, 40.7%id,  0.0%wa,  0.0%hi,  9.9%si,  0.0%st
...
Cpu24 :  0.0%us,  0.0%sy,  0.0%ni, 99.7%id,  0.3%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu25 :  0.0%us,  7.0%sy,  0.0%ni, 93.0%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu26 : 18.9%us, 46.2%sy,  6.7%ni, 27.9%id,  0.0%wa,  0.0%hi,  0.3%si,  0.0%st
Cpu27 : 14.6%us, 42.1%sy,  1.3%ni, 42.1%id,  0.0%wa,  0.0%hi,  0.0%si,  0.0%st
Cpu28 : 41.3%us, 24.1%sy,  3.2%ni, 28.6%id,  0.0%wa,  0.0%hi,  2.9%si,  0.0%st
Cpu29 : 38.1%us, 21.6%sy,  0.0%ni, 35.6%id,  0.0%wa,  0.0%hi,  4.8%si,  0.0%st
...
Mem:  263819896k total, 137200564k used, 126619332k free,  2004656k buffers
Swap:        0k total,        0k used,        0k free, 30641964k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
27980 root      20   0 1189m 1.0g 5148 S  108  0.4   8095:26 qemu-kvm
32303 root      20   0 1274m 1.0g 5136 S  107  0.4   2836:03 qemu-kvm
46073 root      20   0 4514m 4.1g 5340 S   72  1.6   8376:12 qemu-kvm
```

经过对比，发现导致`load average`非常高的原因是`cpu 24`存在`阻塞`：这个CPU异常高的`sys`完全消耗了CPU资源，导致任务在运行队列中很长。

> 停止部分`cpu 24`上的辅助程序，可以看到`load average`明显下降（因为减少了运行队列长度），但是`sys`始终保持在`70%`，白白浪费了CPU资源。

我的目标是找出导致如此高的`sys`消耗的程序，解决辅助程序堆积在运行队列中导致`load average`过高问题。

# 查找占用`sys`的进程

> 暂时还没有找到如何根据CPU来观察进程CPU占用的方法（需要同时观察`us`和`sys`）

* 最初我想通过排除方法来找异常进程

```
ps -TA -o tid,pid,ppid,psr,cmd | awk '{if($4=='24') print $1" "$5}' | tee cpu_24
```

上述命令将所有在`cpu 24`上运行的命令都找出来，然后想一一尝试从`agent`这个cgroup中移出，看移除掉哪个进程`sys`能够恢复正常比例就能够定位异常程序。

* 创建2个控制组`test`和`jail`控制组，分别绑定`cpu 24`和`cpu 25`。需要测试的进程加入`test`控制组，测试完的所有进程都放到`jail`控制组，这样可以保持`cpu 24`只有一个进程运行和测试

```
sudo mkdir /cgroup/cpuset/test
echo 24 | sudo tee /cgroup/cpuset/test/cpuset.cpus
echo 0 | sudo tee /cgroup/cpuset/test/cpuset.mems

sudo mkdir /cgroup/cpuset/jail
echo 25 | sudo tee /cgroup/cpuset/jail/cpuset.cpus
echo 0 | sudo tee /cgroup/cpuset/jail/cpuset.mems
```

* 现在我们通过以下脚本`cg_cpu.sh`命令逐个将进程迁移到`cpu 24`上（即加入到`agent`控制组），看究竟是那个程序移动后出现`sys`的改变。测试完成后，再将进程移动到`cpu 25`（即加入到`jail`控制组），对比不同进程就可以知道哪个进程程序存在异常。

```
p_cgclassify()
{
#for pid in $(pgrep "${pname}")
for pid in $(pgrep -f "${pname}")
do
    [ "${pid}" != "" ] || exit
    echo "PID: ${pid}"
    for tid in \
      $(ps --no-headers -ww -p "${pid}" -L -olwp | sed 's/$/ /' | tr  -d '\n')
    do
      sudo cgclassify -g ${cgroup_set} ${tid}
    done
done
}

if [ $# = 0 ]; then
    echo "Usage: $0 <process_name> <cgroup_name>"
else
    pname=$1
    cgroup_set="cpuset:$2"
    p_cgclassify
fi
```

例如：

要将进程限制到`cpu 24`上运行（控制组`agent`），则执行

```
./cg_cpu.sh example_process_name agent
```

要将进程限制到`cpu 25`上运行（控制组`jail`），则执行

```
./cg_cpu.sh example_process_name jail
```

# 使用`strace`和`gdb`排查程序消耗sys的原因

> 一个应用服务器最高效的方式是尽可能使用用户层CPU时间（或者是`user`或者是`nice`），所以如果CPU时间被用于kernel（system）则表明存在一些设计上或者编码上的缺陷，或者系统此时有很严重的I/O问题。

既然通过上述方法找出了异常的程序，我们现在来排查为何程序这样消耗sys。

* `starce`统计系统调用

`strace`工具可以检测出如果部分调用过多的问题。这个工具特别适合debug，因为它记录了进程使用系统调用。`strace`的计数选项（`-c`）提供了一些性能上的诊断信息，这样就可以从系统调用的CPU时间来查看。

```
strace -c -p 48255
```

此时提示

```
Process 48255 attached - interrupt to quit
```

过一会按下`ctrl-c`终止，输出如下

```
Process 48255 detached
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 78.95    0.014999         833        18         9 nanosleep
 21.05    0.003998         400        10           restart_syscall
------ ----------- ----------- --------- --------- ----------------
100.00    0.018997                    28         9 total
```

上述案例显示主要调用的系统调用是 `nanosleep` ，占用了进程系统调用的 `78.95%`；剩下的系统调用是`21.05%`的系统调用`restart_syscall`

> 参考[NANOSLEEP(2)](http://man7.org/linux/man-pages/man2/nanosleep.2.html)
>
> `nanosleep()`挂起调用线程的执行直到通过`*req`指定的时间过去，或者发生一个信号处理器触发调用线程或终止进程。如果是信号处理器触发的中断调用，`nanosleep()`返回`-1`，设置`errno`到`EINTR`，并将剩余时间记录到`rem`的结构中，除非`rem`是`NULL`。这个`*rem`记录的值将在`nanosleep()`在此调用是使用以完成刚才的暂停。

为何程序进入睡眠会导致这么高的`system`占用？

* `gdb`输出进程堆栈

```
for i in `ps -AL |grep process_name |cut -c 7-12`; do \
    echo === $i ===; \
    gdb --q --n --ex bt --batch --pid $i; \
  done 2>&1 |tee /tmp/stacks.txt
```

上述命令可以输出程序堆栈，以便做分析

# 通过crash分析

如果系统crash并且dump出了vmcore（vmcore是通过kdump这样的工具dump出内存），可以参考以下方法来排查vmcore

```
wget http://debuginfo.centos.org/6/x86_64/kernel-debuginfo-2.6.32-431.20.5.el6.x86_64.rpm
rpm2cpio kernel-debuginfo-2.6.32-431.20.5.el6.x86_64.rpm |cpio -idv ./usr/lib/debug/lib/modules/2.6.32-431.20.5.el6.x86_64/vmlinux

crash ./usr/lib/debug/lib/modules/2.6.32-431.20.5.el6.x86_64/vmlinux /var/crash/127.0.0.1-2014-08-07-17\:56\:19/vmcore
```

分析方法参考 [内核core dump分析](core_dump_analysis)

# 参考

* [How To Diagnose High Sys CPU On Linux](https://newspaint.wordpress.com/2013/07/24/how-to-diagnose-high-sys-cpu-on-linux/)
* [Debugging High CPU Usage Using Perf Tool and vmcore Analysis](https://www.pythian.com/blog/debugging-high-cpu-usage-using-perf-tool-and-vmcore-analysis/)