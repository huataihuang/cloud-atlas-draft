x86系统中所有内存都可以通过CPU同等访问，被称为"统一内存访问"（UMA）。而近期的x86处理器已改为采用NUMA（Non-Uniform Memory Access），系统内存被划分到NUMA节点（node），并与socket对应，或者与特定某一组与本地系统内存子集具有相同访问延迟到CPU相对应。

# NUMA内存分配策略

* `strict`

目标节点中不能分配内存时，分配将被默认操作转进至其他节点。严格的策略意味着，当目标节点中不能分配内存时，分配将会失效。

* `interleave`

内存页面将被分配至一项节点掩码指定的节点，但将以轮循机制的方式分布。

* `preferred`

内存将从单一最优内存节点分配。如果内存并不充足，内存可以从其他节点分配。

XML 配置启用所需策略：

```xml
<numatune>
        <memory mode='preferred' nodeset='0'>
</numatune>
```

# 自动化 NUMA 平衡

自动化 NUMA 平衡改进了 NUMA 硬件系统中运行应用的性能。它在 Red Hat Enterprise Linux 7 系统中被默认启用。

自动化 NUMA 平衡会把任务（任务可能是线程或进程）移到与它们需要访问的内存更近的地方，同时也会移动内存应用程序数据，使其更靠近参考这一数据的任务。以上均在自动化 NUMA 平衡启用时由内核自动完成。

自动化 NUMA 平衡启用时需满足以下两个条件：

* `numactl --hardware` 显示多个节点
* `cat /sys/kernel/debug/sched_features` 在标识中显示`NUMA`

# 实战

## BIOS和OS中激活NUMA

* 检查硬件

```
numactl --hardware
numactl -H
```

显示输出

```
available: 1 nodes (0)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95
node 0 size: 391844 MB
node 0 free: 5190 MB
node distances:
node   0
  0:  10
```

* 首先需要在BIOS开启或关闭NUMA

```
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5a 0x80
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5c 0x00 0x01 0x81
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5c 0x05 0x01 0x81 //打开NUMA
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD power cycle
```

```
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5a 0x80
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5c 0x00 0x01 0x81
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD raw 0x3e 0x5c 0x05 0x01 0x80 //关闭NUMA
ipmitool -I lanplus -H 192.168.1.1 -U USERNAME -P PASSWORD power cycle
```

* 操作系统内核需要开启NUMA

注意，Linux系统内核启动参数有可能关闭了NUMA，所以首先需要检查一下

```
grep -i numa /var/log/dmesg
```

如果输出信息类似如下则表明OS层没有启用NUMA

```
[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-3.10.0-327.centos7.x86_64 root=UUID=d1fe19e0-eb9f-4ac8-918c-5e3af2dc5c4a ro crashkernel=auto fsck.repair=yes console=ttyS0,115200 ... numa=off ...
[    0.000000] NUMA turned off
[    0.000000] Kernel command line: BOOT_IMAGE=/boot/vmlinuz-3.10.0-327.centos7.x86_64 root=UUID=d1fe19e0-eb9f-4ac8-918c-5e3af2dc5c4a ro crashkernel=auto fsck.repair=yes console=ttyS0,115200 ... numa=off ...
[    3.413954] pci_bus 0000:00: on NUMA node 0
[    3.501491] pci_bus 0000:17: on NUMA node 0
[    3.579943] pci_bus 0000:3a: on NUMA node 0
[    3.909876] pci_bus 0000:47: on NUMA node 0
```

编辑 `/boot/grub2/grub.cfg` 删除掉配置项`numa=off`，然后重启操作系统，再次检查：

```
#grep -i numa /var/log/dmesg
[    0.000000] NUMA: Initialized distance table, cnt=2
[    0.000000] NUMA: Node 0 [mem 0x00000000-0x7fffffff] + [mem 0x100000000-0x303fffffff] -> [mem 0x00000000-0x303fffffff]
[    0.000000] Enabling automatic NUMA balancing. Configure with numa_balancing= or the kernel.numa_balancing sysctl
[    3.414030] pci_bus 0000:00: on NUMA node 0
[    3.502586] pci_bus 0000:17: on NUMA node 0
[    3.581023] pci_bus 0000:3a: on NUMA node 0
[    3.916580] pci_bus 0000:47: on NUMA node 0
[    3.988120] pci_bus 0000:80: on NUMA node 1
[    4.116644] pci_bus 0000:85: on NUMA node 1
[    4.245682] pci_bus 0000:be: on NUMA node 1
[    4.371917] pci_bus 0000:d7: on NUMA node 1
```

* 检查NUMA状态

```
numactl --hardware
```

输出

```
available: 2 nodes (0-1)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71
node 0 size: 195236 MB
node 0 free: 2054 MB
node 1 cpus: 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95
node 1 size: 196608 MB
node 1 free: 3658 MB
node distances:
node   0   1
  0:  10  21
  1:  21  10
```

# 检查

* 检查每个节点可用内存

```
#numactl -H | grep free
node 0 free: 5190 MB
```

# 参考

* [虚拟化调试和优化指南：NUMA](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/7/html/virtualization_tuning_and_optimization_guide/chap-virtualization_tuning_optimization_guide-numa)
* [numactl installation and examples](http://fibrevillage.com/sysadmin/534-numactl-installation-and-examples)