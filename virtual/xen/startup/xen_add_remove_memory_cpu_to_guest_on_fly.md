尝试给虚拟机 i-23gst39so 添加内存

```
[admin@r8mo02537.cloud.am5:/home/admin]
$sudo xm list | grep i-23gst39so
i-23gst39so.3048243.311136                1344  8192     4     r-----   1888.2

[admin@r8mo02537.cloud.am5:/home/admin]
$sudo virsh dumpxml i-23gst39so.3048243.311136 | grep -i memo
  <memory>8388608</memory>
  <currentMemory>8388608</currentMemory>
```

> 物理服务器 AY66N  10.154.177.160

检查配置

```
[admin@r8mo02537.cloud.am5:/home/admin]
$sudo virsh dominfo i-23gst39so.3048243.311136
Id:             1336
Name:           i-23gst39so.3048243.311136
UUID:           cede2fda-78f2-4806-b204-d86883dc37e1
OS Type:        hvm
State:          running
CPU(s):         4
CPU time:       128431.4s
Max memory:     8392704 kB
Used memory:    8392668 kB
Autostart:      disable
```

设置内存

```
sudo virsh setmem i-23gst39so.3048243.311136 16384M
```

但是比较奇怪，但是发现没有生效

```
[admin@r8mo02537.cloud.am5:/home/admin]
$sudo virsh dominfo i-23gst39so.3048243.311136
Id:             1336
Name:           i-23gst39so.3048243.311136
UUID:           cede2fda-78f2-4806-b204-d86883dc37e1
OS Type:        hvm
State:          running
CPU(s):         4
CPU time:       129163.6s
Max memory:     8392704 kB
Used memory:    8392668 kB
Autostart:      disable
```

原来这个是xen的系统，居然不能使用virsh来调整

改为xm

```
sudo xm mem-set i-23gst39so.3048243.311136 16384
```

但是报错

```
Error: memory_dynamic_max must be less than or equal to memory_static_max
Usage: xm mem-set <Domain> <Mem>

Set the current memory usage for a domain.
```

先设置DomU max memory

```
sudo xm mem-max i-23gst39so.3048243.311136 16384
```

然后再设置内存就不再报错

```
sudo xm mem-set i-23gst39so.3048243.311136 16384
```

检查发现显示内存已经扩容

```
$sudo xm list | grep i-23gst39so.3048243.311136
i-23gst39so.3048243.311136                1336 16384     4     r----- 131582.9
```

不过，虚拟机内部`cat /proc/meminfo`依然显示8G

```
[root@emr-header-1 proc]# cat /proc/meminfo
MemTotal:        8058056 kB
MemFree:          312760 kB
Buffers:           43488 kB
Cached:          3431344 kB
SwapCached:            0 kB
Active:          6166360 kB
Inactive:        1295604 kB
Active(anon):    4590644 kB
Inactive(anon):   873464 kB
Active(file):    1575716 kB
Inactive(file):   422140 kB
```

此时使用 `sudo virsh dominfo i-23gst39so.3048243.311136` 可以看到`Used memory` 依然是 8G

```
Id:             1344
Name:           i-23gst39so.3048243.311136
UUID:           cede2fda-78f2-4806-b204-d86883dc37e1
OS Type:        hvm
State:          running
CPU(s):         4
CPU time:       2194.3s
Max memory:     16777216 kB
Used memory:    8392668 kB
Autostart:      disable
```

参考 [Xen VPS not reflecting the RAM upgrade using xm mem-set](http://serverfault.com/questions/546475/xen-vps-not-reflecting-the-ram-upgrade-using-xm-mem-set)

原来在虚拟机内部需要使用 [Linux Memory Hotplug](http://lhms.sourceforge.net/%20%22Linux%20Memory%20Hotplug) ，这个 [Linux Memory Hotplug](http://lhms.sourceforge.net/%20%22Linux%20Memory%20Hotplug) 提供了访问 `/sys/devices/system/memory` 的sysfs接口，这样可以通过写入 `/sys/devices/system/memory/memory[number]/state` 来激活或关闭模块。

[VMWare KB article](http://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1012764) 提供了设置步骤方法。

检查

```
grep line /sys/devices/system/memory/*/state
```

但是我发现都是`online`状态

```
/sys/devices/system/memory/memory0/state:online
/sys/devices/system/memory/memory10/state:online
...
/sys/devices/system/memory/memory8/state:online
/sys/devices/system/memory/memory9/state:online
```

[Changing a Domain's Memory Size Under Xen](https://blogs.oracle.com/rscott/entry/changing_a_domain_s_memory) 


----

换一台测试虚拟机 houyiecsay-1423698772021.187469.48154 10.175.192.6 ，物理服务器是10.154.173.10

* 先检查虚拟机内存配置显示是512M

```
sudo xm list | grep houyiecsay-1423698772021.187469.48154
```

```
houyiecsay-1423698772021.187469.48154      829   512     1     -b----  98701.3
```

```
sudo virsh dominfo houyiecsay-1423698772021.187469.48154
```

```
Id:             829
Name:           houyiecsay-1423698772021.187469.48154
UUID:           24e3f190-a43f-4d73-a6d5-6b03a14610eb
OS Type:        hvm
State:          idle
CPU(s):         1
CPU time:       98700.5s
Max memory:     528384 kB
Used memory:    528348 kB
Autostart:      disable
```

虚拟机内部检查

```
cat /proc/meminfo
```

```
MemTotal:         500472 kB
MemFree:           12456 kB
Buffers:          137420 kB
Cached:           112464 kB
```

* 设置内存改成1G

```
sudo xm mem-max houyiecsay-1423698772021.187469.48154 1024
sudo xm mem-set houyiecsay-1423698772021.187469.48154 1024
```

* 此时检查虚拟机内存可以看到

```
sudo virsh dominfo houyiecsay-1423698772021.187469.48154
```

显示内存最大1G，但是使用了512M

```
Max memory:     1048576 kB
Used memory:    528348 kB
```

检查了虚拟机内部sysfs接口的`/sys/devices/system/memory/memory*/state`，发现在物理服务器上调整虚拟机的内存都没有变化。究竟如何让虚拟机操作系统能刷新出内存配置的变化？

# 动态调整XEN虚拟机的CPU

在domU配置，你需要设置`maxvcpus`来设置允许的虚拟cpu数量，如果没有设置这个`maxvcpus`，则这个值默认和`vcpus`相等。

```
#vcpus - number of VCPUs to boot the system with.
vcpus = 2;
 
#maxvcpus - maximum number of VCPUs (total) that can be hot added later.
maxvcpus = 8;
```

> `maxvcpus`需要在domU创建的时候设置，运行状态的vm无法动态修改`maxvcpus`，所以要让虚拟机能够伸缩，建议提前设置好一些余量。

* 动态添加vcpu

```
sudo xm list | grep houyiecsay-1423698772021.187469.48154
```

显示是1个cpu

```
houyiecsay-1423698772021.187469.48154      829  1024     1     -b----  98714.9
```

* 动态设置vcpu

```
sudo xm vcpu-set houyiecsay-1423698772021.187469.48154 4
```

显示报错

```
Error: Cannot set vcpus greater than max vcpus on running domain
Usage: xm vcpu-set <Domain> <vCPUs>

Set the number of active VCPUs for allowed for the domain.
```

也就是要先修改 `vcpumax`设置。这个设置似乎不能动态调整，要在虚拟机创建时即设置好。



# 参考

* [How to Hot Add/Remove Memory from a Xen Domain](http://backdrift.org/xen-memory-hot-add-and-remove)
* []