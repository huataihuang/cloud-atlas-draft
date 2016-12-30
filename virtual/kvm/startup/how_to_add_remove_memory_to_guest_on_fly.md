如果应用／DB需要更多内存，则需要调整VM的内存限制。KVM支持在配置了VM最大内存限制范围内动态调整内存。VM配置包涵2部分：

* 最大限制
* 当前分配

任何时候，你不能使用`virsh setmem`命令动态分配超过最大内存的量，而是需要关闭guest来调整VM最大内存限制。

检查VM的内存限制和当前分配内存

```
[root@UA-HA ~]# virsh dumpxml  UAKVM2|grep -i memo

  <memory unit='KiB'>2621440</memory>
  <currentMemory unit='KiB'>1048576</currentMemory>
```

以上配置

分配给VM的内存：1GB(Current Memory Unit)
最大内存限制：2.5GB(Memory Unit)

注意：VM虚拟机只能看见"currentMemory Unit"值

# 调整运行中VM的RAM/Memory

* 登陆到KVM虚拟机中查看分配和使用的内存

```
[root@UA-KVM1 ~]# free -m
              total        used        free      shared  buff/cache   available
Mem:           1001          78         780           6         141         787
Swap:           411           0         411
[root@UA-KVM1 ~]#
```

* 使用root登陆到KVM主机

* 列出KVM虚拟机查看domain配置

```
[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             34
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          running
CPU(s):         1
CPU time:       318.4s
Max memory:     2621440 KiB
Used memory:    1048576 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0
Security label: system_u:system_r:svirt_t:s0:c361,c741 (permissive)

[root@UA-HA ~]#
```

* 缩减内存到 512M

```
[root@UA-HA ~]# virsh setmem UAKVM2 512M

[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             34
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          running
CPU(s):         1
CPU time:       320.2s
Max memory:     2621440 KiB
Used memory:    524288 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0
Security label: system_u:system_r:svirt_t:s0:c361,c741 (permissive)

[root@UA-HA ~]#
```

检查 KVM guest

```
[root@UA-KVM1 ~]# free -m
              total        used        free      shared  buff/cache   available
Mem:            479          78         259           6         141         266
Swap:           411           0         411
[root@UA-KVM1 ~]#
```

也可以增加虚拟机内存

```
[root@UA-HA ~]# virsh setmem UAKVM2 2048M

[root@UA-HA ~]# virsh dominfo UAKVM2
Id:             36
Name:           UAKVM2
UUID:           6013be3b-08f9-4827-83fb-390bd5a86de6
OS Type:        hvm
State:          running
CPU(s):         1
CPU time:       56.0s
Max memory:     2621440 KiB
Used memory:    2097152 KiB
Persistent:     yes
Autostart:      disable
Managed save:   no
Security model: selinux
Security DOI:   0
Security label: system_u:system_r:svirt_t:s0:c305,c827 (permissive)

[root@UA-HA ~]#
```

* 需要编辑VM配置来避免VM关闭和启动配置丢失

```
[root@UA-HA ~]# virsh setmem UAKVM2 2048M --config
```

或者

```
[root@UA-HA ~]# virsh edit UAKVM2
```

# 增加VM的内存限制

如果尝试配置超过VM内存限制的内存分配，则会遇到以下报错：`error: invalid argument: cannot set memory higher than max memory`。这不是BUG，而是因为`virsh setmem`不能分配超过内存限制的使用内存。

* 要增加内存限制，必须首先停止VM

```
[root@UA-HA ~]# virsh shutdown UAKVM2
[root@UA-HA ~]# virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     UAKVM2                         shut off

[root@UA-HA ~]#
```

* 增加VM内存限制

```
[root@UA-HA ~]# virsh setmaxmem UAKVM2 4G
```

* 启动VM

```
[root@UA-HA ~]# virsh start UAKVM2
[root@UA-HA ~]# virsh list --all
 Id    Name                           State
----------------------------------------------------
 37    UAKVM2                         running

[root@UA-HA ~]#
```

* 登陆到guest虚拟机中检查当前内存大小

```
[root@UA-KVM1 ~]# free -m
              total        used        free      shared  buff/cache   available
Mem:            719          90         502           8         126         473
Swap:           411           0         411
[root@UA-KVM1 ~]#
```

* 此时可以将分配内存调整到3G

```
[root@UA-HA ~]# virsh setmem UAKVM2 3G

[root@UA-HA ~]#
```

* 然后在guest中检查内存分配

```
[root@UA-KVM1 ~]# free -m
              total        used        free      shared  buff/cache   available
Mem:           2767          90        2544           8         132        2518
Swap:           411           0         411
[root@UA-KVM1 ~]#
```

* 更新VM配置（这样重启后不会丢失配置）

```
[root@UA-HA ~]# virsh setmem UAKVM2 3G --config
```

或者直接编辑VM XML文件的currentMemory值到3GB

```
[root@UA-HA ~]# virsh edit UAKVM2
```

```
  <memory unit='KiB'>4194304</memory>
  <currentMemory unit='KiB'>3145728</currentMemory>
```

至此已经成功分配了KVM虚拟机内核和调整了VM的最大内存限制。

# 参考

* [Linux KVM – How to add /Remove Memory to Guest on Fly ? Part 8](http://www.unixarena.com/2015/12/linux-kvm-how-to-add-remove-memory-to-guest-on-fly.html)