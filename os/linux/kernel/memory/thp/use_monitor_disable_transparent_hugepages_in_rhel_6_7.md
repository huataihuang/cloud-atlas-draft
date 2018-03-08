> **`警告`**
>
> Red Hat Enterprise Linux 6默认激活的透明大页（THP）可能对一些应用带来问题，从网上的资料来看，早期文档显示Oracle建议关闭THP（因为Oracle是使用显式大页，没有用到透明大页并且会带来性能问题和内存泄漏），此外Hadoop也可能引发性能问题。
>
> 不过，开源技术总是在发展的，需要多关注开源社区文档，并且最重要的是实际测试和评估自己的应用，以数据说话。

# 说明

* RHEL 6不支持透明大页
* 如何禁用RHEL 7透明大页参考[How to disable transparent hugepages (THP) on Red Hat Enterprise Linux 7](https://access.redhat.com/solutions/1320153)
* 透明大页(`Transparent Huge Pages`, THP)在RHEL 6上默认对`所有`应用程序激活。内核会尝试尽可能分配大页，并且如果`mmap`区域是2MB自然对齐的话，任何Linux进程将收到2MB内存页。主内核地址空间自身使用大页来映射，降低了内核代码的TLB压力。

> 有关大页的通用信息，请参考 [What are Huge Pages and what are the advantages of using them?](https://access.redhat.com/site/solutions/2592)

内核会始终尝试使用大页来满足内存分配。如果没有大页（例如没有连续的物理内存），内核就会回退到常规的4KB内存页。THP也是可交换的（swappable），这点和`hugetlbfs`不同。这个THP交换的功能是通过将大页分解成更小的4KB内存页，然后就可以像常规内存页一样swap out。

但是，为了能够高效地使用大页，内核必须找到连续的物理内存区域，这个连续内存区域要比请求的内存更大，这样才能分配。为了实现这个功能，一个**`khugepaged`**内核线程被引入。这个线程会不定时尝试将较小的当前使用的内存页替换成一个大页内存分配，这样以实现THP使用最大化。

在用户空间，应用程序无需修改（即`透明`）。但是也有一些方法可以优化THP的使用。对于那些想要使用大页的应用程序，使用`posix_memalign()`可以有助于确保大型应用可以对齐到大页（2MB）的边界。

另外，THP透明大页只能对匿名内存区域激活。目前计划在`tmpfs`和`页缓存`中加入THP支持。可以在`/sys`目录下的`/sys/kernel/mm/redhat_transparent_hugepage`找到THP调整项。

# 激活或关闭THP

* `/sys/kernel/mm/redhat_transparent_hugepage/enabled`

```
always   -  always use THP
never    -  disable THP
madvise  -  give advice about use of memory
```

> [madvise](http://man7.org/linux/man-pages/man2/madvise.2.html) 表示获得内存使用的建议。这个`madvise()`系统调用是使用有关在地址`addr`和`length`字节大小的地址范围获得建议或指导内核。大多数情况下，这个建议是用于提高系统或应用程序性能。

当`redhat_transparent_hugepage/enabled`被设置成`always`或者`madvise`时候就会自动启动`khuepaged`，并且这个内核线程会在该值设置成`never`时候停止。`redhat_transparent_hugepage/defrag`参数控制内核在何时强制使用内存压缩以获得跟多可用大页。

# 检查系统范围的THP使用

* 以下命令检查系统范围的THP使用

```
grep AnonHugePages /proc/meminfo
```

> 注意：Red Hat Enterprise Linux 6.2以及以后版本通过`/proc/vmstat`提供了透明大页THP监控：

```
$egrep 'trans|thp' /proc/vmstat
nr_anon_transparent_hugepages 6489
thp_fault_alloc 1656214
thp_fault_fallback 3678934
thp_collapse_alloc 66384
thp_collapse_alloc_failed 273790
thp_split 256610
```

# 检查每个进程使用的THP

使用以下命令监控每个进程使用的THP：

```bash
grep -e AnonHugePages  /proc/*/smaps | awk  '{ if($2>4) print $0} ' |  awk -F "/"  '{print $0; system("ps -fp " $3)} '
```

输出类似：

```
UID        PID  PPID  C STIME TTY          TIME CMD
root     12190     1  3  2017 ?        6-10:36:06 /usr/bin/qemu-kvm -name kvm-vm1 -kvmdev /dev/kvm2 -S -machine pc-i440fx-2.1,accel=kvm,usb=off -cpu host -m 4096 -realtime mlock=off -smp 2,sockets=1,cores=2,threads=1 -uuid 844b1680-dffc-453f-8331-6057d24660
/proc/13294/smaps:AnonHugePages:    841728 kB
UID        PID  PPID  C STIME TTY          TIME CMD
root     13294     1 26  2017 ?        45-00:11:05 /usr/bin/qemu-kvm -name kvm-vm2 -kvmdev /dev/kvm2 -S -machine pc-i440fx-2.1,accel=kvm,usb=off -cpu host -m 8192 -realtime mlock=off -smp 4,sockets=1,cores=4,threads=1 -uuid 86bf9e61-fb16-48a0-9942-8140e77
/proc/13294/smaps:AnonHugePages:      8192 kB
...
```

# 启动时禁止THP

在`grub.conf`中添加以下内核命令：

```bash
transparent_hugepage=never
```

> 注意：一些`ktune` 和/或 `tuned`profile会在实施时激活THP。如果`transparent_hugepage=never`已经在启动时设置，但是THP依然没有关闭，则参考[Disabling transparent hugepages (THP) on Red Hat Enterprise Linux 6 is not taking effect](https://access.redhat.com/solutions/422283)

# 运行时关闭THP

执行以下命令可以在运行时动态关闭THP:

```
# echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled
# echo never > /sys/kernel/mm/redhat_transparent_hugepage/defrag
```

> 注意：以上命令只会停止新创建和使用的THP。在这之前创建和使用的THP不会被分解成常规内存页。要使得系统完全关闭THP，需要在启动时禁止THP并且要重启系统才能生效。
>
> 注意：一些第三方应用程序安装脚本会检查以上proc文件并有可能在设置启动时`transparent_hugepage=never`设置已经关闭THP，此时`/sys/kernel/mm/redhat_transparent_hugepage/defrag`是不能调整的。

# 显式大页（Explicit HugePages）激活或关闭

在系统中有两种类型大页：

* 显式大页（Explicit HugePages） - 通过`vm.nr_hugepages` sysctl参数显式分配
* 透明大页（Transparent HugePages） - 由内核自动分配

## 显式大页禁用

* 如果`HugePages_Total`值是`0`就表示系统`禁用`了大页

```
#grep -i HugePages_Total /proc/meminfo
HugePages_Total:       0
```

* 类似的，如果`/proc/sys/vm/nr_hugepages` 或者 `vm.nr_hugepages` 的 sysctl 参数设置成 `0` 就表示系统`禁用`大页：

```
#cat /proc/sys/vm/nr_hugepages
0

#sysctl vm.nr_hugepages
vm.nr_hugepages = 0
``` 

## 显式大页激活

* 如果`HugePages_Total`值`大于 0`就表明系统激活了显式大页：

```
# grep -i HugePages_Total /proc/meminfo 
HugePages_Total:       1024
```

* 类似如果`/proc/sys/vm/nr_hugepages` 或者 `vm.nr_hugepages` 的 sysctl 参数`大于 0`就表明系统`激活`大页：

```
# cat /proc/sys/vm/nr_hugepages 
1024
# sysctl vm.nr_hugepages
vm.nr_hugepages = 1024
```

> 注意，在系统内存小于1G的时候，RHEL 6会禁用THP

> 使用显式大页（`libhugetlbfs`）的缺点是：`hugetlbfs`需要应用开发和系统管理员同时工作；显式大页需要启动时设置，并且应用程序需要显式映射。进程被使用的`hugetlbfs`限制到必须小心使用。`hugetlbfs`常常在大型的数据库管理系统中使用。

# 参考

* [How to use, monitor, and disable transparent hugepages in Red Hat Enterprise Linux 6 and 7? ](https://access.redhat.com/solutions/46111)