透明大页面（THP，transparent huge page）将为性能自动优化系统设置。通过允许所有的空余内存被用作缓存以提高性能。

一旦 `/sys/kernel/mm/transparent_hugepage/enabled` 被设置为 `always` ，透明大页面将被默认使用。运行以下命令禁用透明大页面：

```
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

透明大页面支持不能阻止 hugetlbfs 的使用。但在 hugetlbfs 未使用时，KVM 将使用透明大页面来替代常规的 4KB 页面大小。

## 静态大页面配置

在某些情况下，更优的选择是增加对大页面的控制。在客机中使用静态大页面，使用 virsh edit 向客机 XML 配置添加以下命令：

```xml
<memoryBacking>
        <hugepages/>
</memoryBacking>
```

以上命令使主机使用大页面向客机分配内存，以替代使用默认的页面大小。

* 查看当前的大页面值，请运行以下命令

```
cat /proc/sys/vm/nr_hugepages
```

例如，输出：

```
118784
```

> 这里输出的当前大页值就是`/proc/meminfo`中的 `HugePages_Totaol`

* 查看当前的大页面值：

```
cat /proc/meminfo | grep Huge
```

可以看到输出类似：

```
AnonHugePages:    526336 kB
HugePages_Total:   118784
HugePages_Free:    16126
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
```

* 大页面将以 2MB 为增量进行设置。将大页面的数量设置到 25,000，请运行以下命令：

```
echo 25000 > /proc/sys/vm/nr_hugepages
```

如果要进行永久设置，则使用以下命令将

```
sysctl -w vm.nr_hugepages=N
```

可以在 `/etc/sysctl.d/` 目录下创建一个 `nr_hugepages.conf` 配置文件：

```
vm.nr_hugepages=25000
```

然后执行 `sysctl -p`刷新使之生效。

* 挂载大页面：

```
mount -t hugetlbfs hugetlbfs /dev/hugepages
```

* 重启`libvirtd`之后，再运行以下命令启动虚拟机

```
# systemctl start libvirtd

# virsh start virtual_machine
```

* 验证 `/proc/meminfo` 中对修改：

```
# cat /proc/meminfo | grep Huge
AnonHugePages:         0 kB
HugePages_Total:   25000
HugePages_Free:    23425
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
```

# 参考

* [Transparent Hugepage Support](https://www.kernel.org/doc/Documentation/vm/transhuge.txt)
* [How to use, monitor, and disable transparent hugepages in Red Hat Enterprise Linux 6 and 7? ](https://access.redhat.com/solutions/46111)
* [透明大页面配置](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/7/html/virtualization_tuning_and_optimization_guide/sect-virtualization_tuning_optimization_guide-memory-tuning#sect-Virtualization_Tuning_Optimization_Guide-Memory-Huge_Pages)