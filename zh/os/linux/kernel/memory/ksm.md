> 本文是有关KSM（kernel samepage merging）相关技术资料的汇总

[kernel same-page merging](https://en.wikipedia.org/wiki/Kernel_same-page_merging)也称为KSM，是一个内核特性，可以用于在虚拟控制系统中共享相同内存页面给不同的进程或者虚拟机。KSM是通过扫描主内存找到重复内存页面来执行内存共享的。每个被发现重复的分页将被合并成一个分页，然后映射到两个初始的位置。这个页面也被标记为"写时复制"（[copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write)），或者称为COW，这样内核可以在一个进程更改其数据时自动分离内存页面。

KSM最初是用于在一个主机上通过进程间共享内存来运行更多虚拟机。实际使用中，用户也发现KSM可以用于非虚拟化环境。这个KSM内核模块在内核版本2.6.32时被合并到内核主线代码中，最初发布于2009年12月3日。为了更有效，操作系统内核必须找到不同进程使用的相同内存页面。内核也需要决定内存页是否很少更新这样才能有效合并进程资源使用的内存。虽然使用KSM可以节约内存使用，但是可能会导致CPU资源消耗，另外一个潜在的风险是有安全隐患。

虽然基于内核的虚拟机（KVM）被设计为自调优，但是可以调整一些参数使KVM主机性能更好。最重要的参数是内核同页合并（kernel samepage merging ,KSM），这一特性允许内核更有效地处理内存。KSM允许Linux内核识别出包含相同内容的内存页，然后合并这些内存页，将数据整合在一个位置可以多 次引用。
如果在主机上使用KVM，通常会激活数个客户操作系统，而且这些操作系统经常运行相同的OS，这意味着大量的内核页面被多次加载。通过应用KSM，许多虚 拟机可以使用相同数量的内存启动。事实上，KSM允许虚拟机过度分配内存。但是使用KSM存在性能损失，在一般的环境中，性能损失大概是10%，这也是在 某些环境中关闭KSM的原因。

在RHEL 6（CentOS 6）和Fedora 16中，KSM默认是打开的。KSM通过两个服务：`ksmd`和`ksmtuned`实现，这两个服务在系统初始化时自动启动。管理员应该判断他们的环境并决定保持KSM处于运行状态还是关闭它。

如果目标是运行尽可能多的虚拟机，而且性能不是问题，应该保持KSM处于运行状态。例如KSM允许运行30个虚拟机的主机上运行40个虚拟机，这意味着最大化硬件使用效率。但是，如果服务器在运行相对较少的虚拟机并且性能是个问题时，那么应该关闭KSM。

对任何系统来说，最佳选择将取决于创建虚拟环境时的内存估算。如果在虚拟主机中有足够的物理内存，在没有开启KSM时就能够满足虚拟机的内存需求，那么最好关闭KSM。但是如果主机内存紧张，那么最好保持KSM处于运行状态。

# 优化KSM达到最佳性能

使用KSM时，可以优化一些参数以达到最佳性能。这些参数位于一个小的配置文件/etc/ksmtuned.conf中：

```bash
#优化KSM的配置文件
#优化调整之间应休眠多长时间
# KSM_MONITOR_INTERVAL=60
#在扫描16Gb服务器之间ksm休眠的毫秒数
#内存较小的服务器休眠的时间更长，内存较大的服务器休眠时间更短。
# KSM_SLEEP_MSEC=10
# KSM_NPAGES_BOOST=300
# KSM_NPAGES_DECAY=-50
# KSM_NPAGES_MIN=64
# KSM_NPAGES_MAX=1250
# KSM_THRES_COEF=20
# KSM_THRES_CONST=2048
#如果你想获取优化KSM的调试信息，取消以下注释
# LOGFILE=/var/log/ksmtuned
# DEBUG=1
```

> 配置文件中最重要的参数是KSM_SLEEP_MSEC。Fedora 16使用的默认值是大型服务器的设置值。当在主机上运行较少的虚拟机，使用KSM时最好让主机休眠更长的时间。例如，尝试设置`KSM_SLEEP_MSEC=50`，然后测试对虚拟机的影响。

# KSM 配置和监控

KSM 的管理和监控通过 sysfs（位于根 `/sys/kernel/mm/ksm`）执行。

在这个 `sysfs` 子目录中的文件，有些用于控制，其他的用于监控。

* `run` 用于启用和禁用 KSM 的页面合并。默认情况下，KSM 被禁用（`0`），但可以通过将一个 `1` 写入这个文件来启用 KSM 守护进程（例如，`echo 1 > sys/kernel/mm/ksm/run`）。通过写入一个 `0`，可以从运行状态禁用这个守护进程（但是保留合并页面的当前集合）。另外，通过写入一个 `2`，可以从运行状态（`1`）停止 KSM 并请求取消合并所有合并页面。
* KSM 运行时，可以通过 `3` 个参数（`sysfs` 中的文件）来控制它。`sleep_millisecs` 文件定义执行另一次页面扫描前 `ksmd` 休眠的毫秒数。`max_kernel_pages` 文件定义 `ksmd` 可以使用的最大页面数（默认值是可用内存的 `25%`，但可以写入一个 `0` 来指定为无限）。
* `pages_to_scan` 文件定义一次给定扫描中可以扫描的页面数。任何用户都可以查看这些文件，但是用户必须拥有根权限才能修改它们。
* 还有 `5` 个通过 `sysfs` 导出的可监控文件（均为只读），它们表明 `ksmd` 的运行情况和效果:
  * `full_scans` 文件表明已经执行的全区域扫描的次数。
  * `pages_shared`：KSM 正在使用的不可交换的内核页面的数量。 
  * `pages_sharing`：一个内存存储指示。 
  * `pages_unshared`：为合并而重复检查的惟一页面的数量。 
  * `pages_volatile`：频繁改变的页面的数量。 

> KSM 作者定义：较高的 `pages_sharing/pages_shared` 比率表明高效的页面共享（反之则表明资源浪费）。

> VMware 的 ESX 服务器系统管理程序将这个特性命名为 `Transparent Page Sharing (TPS)`，而 XEN 将其称为 `Memory CoW`。不管采用哪种名称和实现，这个特性都提供了更好的内存利用率，从而允许操作系统（KVM 的系统管理程序）过量使用内存，支持更多的应用程序或 VM。 

# 参考

* [使用 KSM（kernel samepage merging）调整 KVM 虚拟机的主机性能](http://www.cnblogs.com/zhangzhang/archive/2012/05/23/2514336.html)
* [KSM(Kernel Samepage Merging) 剖析](http://blog.csdn.net/summer_liuwei/article/details/6013255)
* [Kernel same-page merging](https://en.wikipedia.org/wiki/Kernel_same-page_merging)