在运行性能要求极高的HPC应用程序或者网络负载很高的多内核NUMA进程，CPU/memory affinity是一个非常重要的特性。调度接近的相关进程到相通的NUMA节点可以减少缓慢的远程内存访问。在类似Intel Sandy Bridge处理器上有一个集成的PCIe控制器，你可以调度网络I/O负载到相同的NUMA节点，这样可以充分实现`PCI-to-CPU affinity`来优化性能。

在性能调优和故障排查时，需要知道进程当前调度到哪个CPU或者NUMA节点。

# 方法一：显示进程的CPU affinity

如果进程是通过[taskset](../../cpu/cpu_affinity)方式来指定进程执行的CPU亲和性，可以通过`taskset`来找出这个进程pin到哪些CPU上：

```
taskset -c -p <pid>
```

> 任何进程都可以使用这个方法

# 方法二：检查进程当前运行的CPU

 `ps`工具提供了`PSR`列显示当前进程运行的CPU

```
ps -o pid,psr,comm -p <pid>
```

输出类似

```
  PID PSR COMMAND
13737   8 qemu-kvm
```

# 方法三：使用top

`top`命令的`p`选项可以针对某个进程显示运行状态，然后按下`f`键，再通过高亮选择`Last used CPU`列来显示处理器

# 方法四：使用`htop`

`htop`提供了显示进程/线程的CPU使用，按下`<F2>`添加列

# 参考

* [How to find out which CPU core a process is running on](http://ask.xmodulo.com/cpu-core-process-is-running.html)