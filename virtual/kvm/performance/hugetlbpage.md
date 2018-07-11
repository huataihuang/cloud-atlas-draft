> 本文是一个介绍大页内存在KVM虚拟化中的实践方法，内容比较简略，以实用为主。后续再补充详细技术文档。

大页内存(Huge Page)也称为[hugetlbpage](https://www.kernel.org/doc/Documentation/vm/hugetlbpage.txt)，是采用大内存块，可以提高虚拟机的性能。

> 在Linux x86_64系统中，大页内存的块大小是2048kB，也就是2MB。当需要分配给虚拟机大页内存，则将需要分配的内存大小除以2，就是需要保留的大页内存块数量。

> 注意：针对大页内存，当前有两种技术，一种是本文所介绍的hugetlbpage，另一种称为透明大页(Transparent Hugepage)。有关透明大页，请参考[透明大页内存技术](transparent_hugepage)，在Red Hat Enterprise Linux 6/7上默认启用了透明大页支持。

# 注意

* 大页内存需要显式设置（启动时），并且需要应用程序配合才能使用，所以应用不是很广泛。但是对性能有很大提升，所以常用于数据库应用。例如，Oracle数据库就使用了HugePage进行加速，并且Oracle明确说明其 **Oralce数据库只使用大页内存，但不使用透明大页内存** 。- [Oracle Database Release 18 - Disabling Transparent HugePages](https://docs.oracle.com/en/database/oracle/oracle-database/18/ladbi/disabling-transparent-hugepages.html#GUID-02E9147D-D565-4AF8-B12A-8E6E9F74BEEA)
* Red Hat Enterprise Linux 6/7 默认启用了透明大页技术（小于1G内存默认关闭），但是如果出现异常无法分配内存情况，请尝试关闭透明大页。 - [How to use, monitor, and disable transparent hugepages in Red Hat Enterprise Linux 6 and 7? ](https://access.redhat.com/solutions/46111)

# 为客机启用 1GB 大页面

Red Hat Enterprise Linux 7.1 系统支持 2MB 或 1GB 大页面，分配将在启动或运行时进行。页面大小均可以在运行时被释放。例如，在启动时分配 4 个 1GB 的大页面和 1,024 个 2MB 的大页面。使用以下命令行：

```
'default_hugepagesz=1G hugepagesz=1G hugepages=4 hugepagesz=2M hugepages=1024'
```

大页可以在运行时分配。运行时分配允许系统管理员选择从何种NUMA模式分配页面。但是由于内存碎片原因，运行时页面分配会比启动时分配更容易造成分配失败。

* 以下在运行时从 `node1` 分配 4 个 1G 的大页，以及从 `node3` 分配 1024 个 2MB 的大页：

```
# echo 4 > /sys/devices/system/node/node1/hugepages/hugepages-1048576kB/nr_hugepages
# echo 1024 > /sys/devices/system/node/node3/hugepages/hugepages-2048kB/nr_hugepages
```

* 然后将 2MB 和 1GB 的大页面挂载到主机：

```
# mkdir /dev/hugepages1G
# mount -t hugetlbfs -o pagesize=1G none /dev/hugepages1G
# mkdir /dev/hugepages2M
# mount -t hugetlbfs -o pagesize=2M none /dev/hugepages2M
```

* 重启 libvirtd ，使得 1GB 大页面可以在客户机上启用：

```
# systemctl restart libvirtd
```

> 注意，现在1GB大页面现在对客机不可用。

# 向多个客户机NUMA节点指定主机大页面

> 参考 [8.4.9 节 “向多个客机 NUMA 节点指定主机大页面”](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/7/html/virtualization_tuning_and_optimization_guide/sect-Virtualization_Tuning_Optimization_Guide-NUMA-NUMA_and_libvirt#sect-Virtualization_Tuning_Optimization_Guide-NUMA-Guest_NUMA_multinode-hugepages)

# 参考

* [Arch Linux: KVM - Enabling huge pages](https://wiki.archlinux.org/index.php/KVM#Enabling_huge_pages)
* [hugetlbpage.txt](https://www.kernel.org/doc/Documentation/vm/hugetlbpage.txt)