在`top`工具的性能显示中，有一个字段是`%st`。这个`st`表示的含义是Steal percentage(可参考man手册中`mpstat`)表示hypervisor告知你VM不能使用的CPU资源。

CPU steal time表示虚拟CPU等待物理CPU的时间百分比，这个时间就是hypervisor服务于其他虚拟CPU的时间。

> CPU Steal Time Definition
>
> Steal time is the percentage of time a virtual CPU waits for a real CPU while the hypervisor is servicing another virtual processor.

对于使用Paravirtual技术的XEN虚拟机中，`vmstat`和`top`都支持`St`字段来显示XEN从虚拟机应得的CPU时间中"偷走"的时间，这个被偷走的时间在VMWare ESX中被称为`ready time`，来反映VM准备运行在物理CPU的时间，而这个CPU时间被分配给了其他任务-通常是另外一个虚拟机。

在guest操作系统中能够看到ST是因为paravirtualized操作系统，例如Xen，内核是针对虚拟化重写的，即paravirtualized Linux内核做了修改以便vmstat和top能够显示虚拟化。

> 对于`hvm`模式的XEN虚拟机，在虚拟机内部是看不到被hypervisor偷走的时间。

使用`vmstat -s`可以显示完整的内存使用和各个类型的CPU使用

```
$vmstat -s
     18427968  total memory
     18235924  used memory
      8068660  active memory
      5848140  inactive memory
       192044  free memory
       232868  buffer memory
      9637048  swap cache
            0  total swap
            0  used swap
            0  free swap
   3365274289 non-nice user cpu ticks
    229036298 nice user cpu ticks
   4146952572 system cpu ticks
  66286956655 idle cpu ticks
   2937830791 IO-wait cpu ticks
       823170 IRQ cpu ticks
    814487783 softirq cpu ticks
    233749331 stolen cpu ticks
 396011467073 pages paged in
 555952626850 pages paged out
            0 pages swapped in
            0 pages swapped out
   1269498855 interrupts
   4201459488 CPU context switches
   1423037158 boot time
    442087553 forks
```

# 参考

* [Understanding CPU Steal – An Experiment](http://www.stackdriver.com/understanding-cpu-steal-experiment/)
* [What does %st mean in top?](http://serverfault.com/questions/230495/what-does-st-mean-in-top)
* [Understanding AWS stolen CPU and how it affects your apps](https://www.datadoghq.com/blog/understanding-aws-stolen-cpu-and-how-it-affects-your-apps/)
* [“Stolen” CPU on Xen-based virtual machines](http://guyharrison.squarespace.com/blog/2010/7/12/stolen-cpu-on-xen-based-virtual-machines.html)