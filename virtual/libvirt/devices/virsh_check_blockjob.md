

```
[root@mytest-server:/root]
#virsh list
 Id    Name                           State
----------------------------------------------------
 11    io_vm_219003                   shut off


[root@mytest-server:/root]
#virsh start io_vm_219003
error: Domain is already active
```

`ps aux | grep io_vm_2019003` 可以看到实际上`/usr/bin/qemu-kvm -name io_vm_219003 ...`是运行状态

尝试关闭虚拟机发现有锁导致超时

```
#virsh destroy io_vm_219003

error: Failed to destroy domain io_vm_219003
error: Timed out during operation: cannot acquire state change lock
```

libvirtd日志显示：

```
2018-04-23 15:35:10.000+0000| 3571| warning | qemuDomainObjBeginJobInternalCore:1254 | Cannot start job (modify, none) for domain io_vm_219003; current job is (modify, none) owned by (3568, 0)
2018-04-23 15:35:10.000+0000| 3571| error | qemuDomainObjBeginJobInternalCore:1259 | Timed out during operation: cannot acquire state change lock
```

可以看到当前任务是 `3568` 

```
    blockjob                       Manage active block operations
    domjobabort                    abort active domain job
    domjobinfo                     domain job information
```

参考 [domain has active block job](https://www.redhat.com/archives/libvirt-users/2015-January/msg00042.html) 检查块设备是否有活动操作：

首先检查实例有哪些块设备

```
virsh domblklist io_vm_219003
```

输出如下：

```
Target     Source
------------------------------------------------
vda        /diskspool/disk3/kvm_vm_img/io_vm_219003.raw
...
```

然后检查是否磁盘设备有活跃块操作

```
virsh blockjob io_vm_219003 /diskspool/disk3/kvm_vm_img/io_vm_219003.raw --info
```

但是显示超时：

```
error: Timed out during operation: cannot acquire state change lock
```

最后排查原因是，最初用户`kill -9`杀掉qemu进程后，qemu没有发送close给后端分布式存储关闭磁盘引发的再次启动无法使用磁盘。