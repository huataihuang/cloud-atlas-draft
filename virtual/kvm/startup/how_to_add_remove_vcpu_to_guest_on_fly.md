KVM支持vCPU热插拔么？Linux KVM虚拟机能够感知到新添加的vCPU么？答案当然是"YES"。

类似[KVM 内存管理](how_to_add_remove_memory_to_guest_on_fly)，你可以使用`virsh`命令给正在运行的VM添加或删除vCPU。不过，这个工作是需要预先配置KVM虚拟机的最大vCPU参数才能使用。所以当部署一个新的虚拟机，你应该首先考虑这个参数。给KVM虚拟机设置最大vCPU数量并不会对资源有所小号，因为虚拟机只会使用分配的vCPU。

# 理解VM的vCPU配置

* 列出KVM主机配置的VM

```
[root@UA-HA ~]# virsh list  --all
 Id    Name                           State
----------------------------------------------------
  -     UAKVM2                         shut off

[root@UA-HA ~]#
```

* 检查当前VM配置

```
[root@UA-HA ~]# virsh dumpxml UAKVM2 | grep vcpu
  <vcpu placement='static' current='1'>2</vcpu>
```

以上显示这个VM当前使用1个vCPU，并且可以通过`virsh vsetcpus`命令增加vCPU。但死你不能在VM运行时增加超过2个vCPU。

* 现在我们启动VM

```
[root@UA-HA ~]# virsh start UAKVM2
Domain UAKVM2 started

[root@UA-HA ~]#
```

* 登陆到KVM虚拟机并检查分配的vCPU数量：

```
[root@UA-KVM1 ~]# lscpu
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
Model:                 44
Model name:            Westmere E56xx/L56xx/X56xx (Nehalem-C)
Stepping:              1
CPU MHz:               2594.058
BogoMIPS:              5188.11
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
NUMA node0 CPU(s):     0
[root@UA-KVM1 ~]#
```

# 向运行的KVM虚拟机增加vCPU

* 切换到KVM主机并使用`virsh`命令增加vCPU，从1增加到2

```
[root@UA-HA ~]# virsh setvcpus UAKVM2 2

[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             38
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          running
CPU(s):         2
CPU time:       51.5s
Max memory:     1048576 KiB
Used memory:    1048576 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0
Security label: system_u:system_r:svirt_t:s0:c709,c868 (permissive)
[root@UA-HA ~]#
```

* 返回到KVM guest虚拟机，检查新添加的vCPU。此时VM从`UP code(uniprocessor)`切换到`SMP code (symmetric multiprocessor`)

```
[root@UA-KVM1 ~]# tail -f /var/log/messages
Dec 16 12:48:28 UA-KVM1 kernel: CPU1 has been hot-added
Dec 16 12:48:28 UA-KVM1 kernel: SMP alternatives: switching to SMP code
Dec 16 12:48:57 UA-KVM1 kernel: smpboot: Booting Node 0 Processor 1 APIC 0x1
Dec 16 12:48:57 UA-KVM1 kernel: kvm-clock: cpu 1, msr 0:3ff87041, secondary cpu clock
Dec 16 12:48:57 UA-KVM1 kernel: TSC synchronization [CPU#0 -> CPU#1]:
Dec 16 12:48:57 UA-KVM1 kernel: Measured 906183720569 cycles TSC warp between CPUs, turning off TSC clock.
Dec 16 12:48:57 UA-KVM1 kernel: tsc: Marking TSC unstable due to check_tsc_sync_source failed
Dec 16 12:48:57 UA-KVM1 kernel: KVM setup async PF for cpu 1
Dec 16 12:48:57 UA-KVM1 kernel: kvm-stealtime: cpu 1, msr 3fd0d240
Dec 16 12:48:57 UA-KVM1 kernel: microcode: CPU1 sig=0x206c1, pf=0x1, revision=0x1
Dec 16 12:48:57 UA-KVM1 kernel: Will online and init hotplugged CPU: 1
[root@UA-KVM1 ~]# lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                2
On-line CPU(s) list:   0,1
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             2
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 44
Model name:            Westmere E56xx/L56xx/X56xx (Nehalem-C)
Stepping:              1
CPU MHz:               2594.058
BogoMIPS:              5188.11
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
NUMA node0 CPU(s):     0,1
[root@UA-KVM1 ~]#
```

* 如果想配置永久生效，保存VM配置

```
[root@UA-HA ~]# virsh setvcpus UAKVM2 2 --config

[root@UA-HA ~]#
```

现在我们已经成功给KVM虚拟机添加了vCPU并使配置永久生效。

# 从运行的KVM虚拟机去除vCPU

没有直接从KVM guest虚拟机直接移除vCPU的方法。但是可以通过禁止CPU核心方式将CPU核心的性能返还给KVM主机。

* 登陆到KVM host主机
* 假设当前KVM guest虚拟机UAKVM2有2个活动的vCPU
* 注意不要使用以下命令来移除vCPU，你会收到错误消息`error: internal error: cannot change vcpu count of this domain`

```
[root@UA-HA ~]# virsh setvcpus UAKVM2 1
error: internal error: cannot change vcpu count of this domain

[root@UA-HA ~]#
```

* 使用以下命令来缩减UAKVM2的vCPU数量（vCPU从2缩减到1）

```
[root@UA-HA ~]# virsh setvcpus --live --guest UAKVM2 1
[root@UA-HA ~]#
```

* 保存VM配置

```
[root@UA-HA ~]# virsh setvcpus --config UAKVM2 1

[root@UA-HA ~]#
```

* 登陆到KVM guest虚拟机`UAKVM2`验证

```
[root@UA-KVM1 ~]# tail -f /var/log/messages
Dec 16 13:01:01 UA-KVM1 systemd: Starting Session 2 of user root.
Dec 16 13:19:08 UA-KVM1 kernel: Unregister pv shared memory for cpu 1
Dec 16 13:19:08 UA-KVM1 kernel: smpboot: CPU 1 is now offline
[root@UA-KVM1 ~]# lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                2
On-line CPU(s) list:   0
Off-line CPU(s) list:  1
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             1
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 44
Model name:            Westmere E56xx/L56xx/X56xx (Nehalem-C)
Stepping:              1
CPU MHz:               2594.058
BogoMIPS:              5188.11
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
NUMA node0 CPU(s):     0
[root@UA-KVM1 ~]#
```

注意：

在KVM物理主机中过，你依然会看到两个vCPU呗分配给虚拟机`UAKVM2`，只有重启VM才会生效。

```
[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             38
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          running
CPU(s):         2
CPU time:       90.4s
Max memory:     1048576 KiB
Used memory:    1048576 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0
Security label: system_u:system_r:svirt_t:s0:c709,c868 (permissive)

[root@UA-HA ~]#
```

* 关闭`UAKVM2` KVM虚拟机并验证

```
[root@UA-HA ~]# virsh destroy UAKVM2
Domain UAKVM2 destroyed

[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             -
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          shut off
CPU(s):         1
Max memory:     1048576 KiB
Used memory:    0 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0

[root@UA-HA ~]#
```

此时可以看到`vCPU`被修改成1个。

如果尝试添加比预分配更多的vCPU会看到如下错误信息`error: invalid argument: requested vcpus is greater than max allowable vcpus for the domain`

```
[root@UA-HA ~]# virsh setvcpus UAKVM2 3
error: invalid argument: requested vcpus is greater than max allowable vcpus for the domain: 3 > 2
[root@UA-HA ~]#
```

请重新参考前述的"理解VM vCPU配置"段落。使用`virsh`命令不能超过vCPU最大配置数量。这个最大vCPU数量不能在虚拟机运行时修改。

# 如何修改每个虚拟机的最大vCPU数量？（只能使用offline模式）

* 作为root用户登陆到KVM host主机
* 优雅地停止虚拟机

```
[root@UA-HA ~]# virsh list
 Id    Name                           State
----------------------------------------------------
 39    UAKVM2                         running

[root@UA-HA ~]# virsh shutdown UAKVM2
Domain UAKVM2 is being shutdown

[root@UA-HA ~]#
```

* 编辑VM配置类似如下，这里将最大vCPU数量从2修改成4:

```
<vcpu placement='static' currtne='1'>2</vcpu>
```

修改成

```
<vcpu placement='static' currtne='1'>4</vcpu>
```

vCPU XML 格式：

```
<vcpu placement='static' current='N'>M</vcpu>
```

这里N时当前激活的CPU数量，而M是CPU的最大数量

* 启动KVM虚拟机`UAKVM2`

```
[root@UA-HA ~]# virsh start UAKVM2
Domain UAKVM2 started

[root@UA-HA ~]#
```

* 验证UAKVM2虚拟机的vCPU信息

```
[root@UA-HA ~]# virsh vcpuinfo UAKVM2
VCPU:           0
CPU:            1
State:          running
CPU time:       24.0s
CPU Affinity:   yy

[root@UA-HA ~]#
```

如上所述，此时UAKVM2只分配了1个vCPU。由于我们配置了vCPU最大数量是4，所以我们可以动态将虚拟机的vCPU增加到4个。

* 增加vCPU数量到4

```
[root@UA-HA ~]# virsh setvcpus UAKVM2 4

[root@UA-HA ~]# virsh vcpuinfo UAKVM2
VCPU:           0
CPU:            0
State:          running
CPU time:       27.6s
CPU Affinity:   yy

VCPU:           1
CPU:            0
State:          running
CPU time:       0.4s
CPU Affinity:   yy

VCPU:           2
CPU:            0
State:          running
CPU time:       0.1s
CPU Affinity:   yy

VCPU:           3
CPU:            0
State:          running
CPU time:       0.1s
CPU Affinity:   yy

[root@UA-HA ~]#
[root@UA-HA ~]# virsh setvcpus UAKVM2 4 --config

[root@UA-HA ~]#
```

* 登陆到KVM虚拟机`UAKVM2`中并列出vCPU

```
[root@UA-KVM1 ~]# lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                4
On-line CPU(s) list:   0-3
Thread(s) per core:    1
Core(s) per socket:    1
Socket(s):             4
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 44
Model name:            Westmere E56xx/L56xx/X56xx (Nehalem-C)
Stepping:              1
CPU MHz:               2594.058
BogoMIPS:              5188.11
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              4096K
NUMA node0 CPU(s):     0-3
[root@UA-KVM1 ~]#
```

以上我们已经在离线情况下成功增加了最大vCPU数量，并在VM运行时增加了分配到vCPU。

# 参考

* [Linux KVM – How to add /Remove vCPU to Guest on fly ? Part 9](http://www.unixarena.com/2015/12/linux-kvm-how-to-add-remove-vcpu-to-guest-on-fly.html)