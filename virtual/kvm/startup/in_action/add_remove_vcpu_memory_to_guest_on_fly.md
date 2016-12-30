KVM虚拟机可以动态增加和删除vCPU，但是前提条件是，必须在虚拟机offline模式下先设置好最大vCPU数量。动态增加虚拟机的vCPU数量不能超过虚拟机的最大vCPU数量。同样，虚拟机的最大可分配内存大小也是要在虚拟机offline的时候设置。

这里的案例是动态修改[DevStack虚拟机](../../../../iaas/openstack/devstack/devstack)所分配的vCPU和内存。

> 建议在创建VM的时候，总是先设置好预计VM未来可能分配的最大vCPU数和最大内存量，以免今后系统扩展时无法动态增加虚拟机的vCPU数量和内存大小。例如，可以将每个VM最大vCPU数量设置成物理主机的CPU数量（略微有些超卖），然后在初始化VM设置一个较低的实际分配vCPU数量，以便今后随业务发展而不断动态调整。

* 首先关闭`devstack`虚拟机

```
sudo virsh shutdown devstack
```

* 通过`virsh dumpxml`可以看到当前虚拟机配置

```
  <memory unit='KiB'>2097152</memory>
  <currentMemory unit='KiB'>2097152</currentMemory>
  <vcpu placement='static'>1</vcpu>
```

* 通过`virsh`命令设置虚拟机最大可分配内存32G

```
sudo virsh setmaxmem devstack 32G
```

> 虽然也可以直接编辑xml文件，但是设置内存大小通过命令修改内存大小多少`G`比较方便

此时再使用`virsh dumpxml devstack`可以看到如下配置

```
  <memory unit='KiB'>33554432</memory>
  <currentMemory unit='KiB'>2097152</currentMemory>
  <vcpu placement='static'>1</vcpu>
```

* 通过`virsh edit devstack`修改vCPU配置

```
  <vcpu placement='static' current='1'>12</vcpu>
```

然后保存并再次通过`virsh dumpxml devstack`验证配置是否正确。

* 启动虚拟机

```
sudo virsh start devstack
```

* 启动虚拟机后，登陆到虚拟机中检查当前虚拟机配置

```
[huatai@devstack ~]$ lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                1
On-line CPU(s) list:   0
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             1
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 42
Model name:            Intel Xeon E312xx (Sandy Bridge)
Stepping:              1
CPU MHz:               2299.998
BogoMIPS:              4599.99
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
NUMA node0 CPU(s):     0

[huatai@devstack ~]$ free
              total        used        free      shared  buff/cache   available
Mem:        1323632      444368      641860        8616      237404      506580
Swap:       1048572           0     1048572
```

# 动态调整

当前我们虚拟机的配置依然是 1 vCPU 2G Memory，现在我们启动devstack程序观察系统负载，可以看到由于虚拟机资源不足，系统负载始终高于3（大于VM的分配vCPU数量）且有swap磁盘交换，所以性能较差。

```

```

现在动态给虚拟机增加到4个vCPU

```
sudo virsh setvcpus devstack 4
```

在虚拟中观察vCPU数量，可以看到已经增加到了4个vCPU，负载过大得到了极大缓解：

```

```

同时观察虚拟机系统日志可以看到vCPU数量增加

```

```

* 动态增加虚拟机内存

```
virsh setmem devstack 8G
```

然后在guest中观察内存分配

```
free -m
```

# 参考

* [八：如何在线添加/移除虚拟机的内存](../how_to_add_remove_memory_to_guest_on_fly)
* [九：如何在线添加/移除虚拟机的vCPU](../how_to_add_remove_vcpu_to_guest_on_fly)