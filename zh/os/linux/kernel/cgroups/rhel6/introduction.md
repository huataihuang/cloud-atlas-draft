Cgroups是层次结构组织的，类似进程，子cgroups继承了父cgroups的一些属性，但是和进程的层次结构有所不同：

# Linux进程模型

在RHEL6/CentOS6操作系统中，使用的是一个公共的父进程`init`进程（对应的RHEL7/CentOS7中的`systemd`），这个进程是内核启动时执行的进程，并负责启动其他子进程。这样，Linux进程模型就是单一层次结构，或称为树。此外，每个Linux进程，除了`init`之外，都会继承父进程环境（例如`PATH`环境变量），以及其他特性（如打开的文件句柄数）。

# Cgroup模型

Cgroups和进程类似之处有：

* 都是层次结构
* 子cgroups继承了父cgroups的一系列特性

所不同之处是cgroups可以存在多个层次结构，也就是cgroup模型有一个或多个独立的不连接的任务树。

> 请参考前文有关RHEL7的文档`Systemd单元类型`，可以看到单个cgroup树是有多个分支。概念其实是类似的，只是在以前版本中，没有隐患的`-.slice`来表示整个cgroup树，所以会称之为多个任务树。

（在RHEL 6中）多个分离的cgroups层次结构之所以需要，是因为每个层次结构附加了一个或多个子系统。一个子系统表述了一个资源，例如CPU时间或内存。Red Hat Enterprise Linux 6提供了10个cgroup子系统。

> cgroup 子系统也称为资源控制器（resource controllers），见前文RHEL 7文档部分。不过，要注意，在 RHEL6 中提供的10个cgroup subsystem和 RHEL7 中提供的10个resource controllers并不完全相同：RHEL6中的`net_prio`和`ns`被取消，RHEL7增加了`perf_event`和`hugetlb`

* `blkio` - 设置访问块设备（如磁盘，固态硬盘，USB等）的I/O限速
* `cpu` - 使用调度器提供访问CPU的cgroup tasks
* `cpuacct` - 提供cgroup中任务访问CPU资源的自动报告
* `cpuset` - 提供设置独立的CPU和内存节点给cgroup中的任务
* `devices` - 允许或拒绝cgroup中的任务访问设备
* `freezeer` - 挂起或继续cgroup中的任务
* `memory` - 设置cgroup中的任务的内存限制，同时使用这些任务自动产生内存资源报告
* `net_cls` - 通过分类标记（classid）来标记网络数据包，这样Linux流量控制器（`tc`命令）从参与的cgroup任务中标记数据包。
* `net_prio` - 提供每个网络接口设置网络流量的动态方法
* `ns` - `namespace`子系统

在RHEL6中，`lssubsys`工具位于`libcgroup`软件包。

# 子系统，层次结构，控制组和任务之间的关系

在cgroup概念中，系统进程被称为`task`（任务）。

在子系统，cgroup的层次结构，和任务之间，有一些解释性的规则：

* 规则1

一个单一层次可以有一个或多个子系统附加其上。

这个规则的结果是，`cpu`和`memory`子系统（或者任何子系统成员）可以添加到一个单一结构下。

![cgroup规则1](/img/os/kernel/cgroup/RMG-rule1.png)

* 规则2

如果某个层次结构有一个不同的子系统已经附加，任何一个单一子系统（例如cpu）不能添加到超过一个层次结构下。

这个规则的结果是，如果两个层次结构其中一个层次结构已经附加了`memory`子系统，则`cpu`子系统不能附加到两个不同的层次结构。然而，一个单一结构的子系统则可以附加到两个层次结构上，只要两个层次结构都只有那个子系统附加。

![cgroup规则2](/img/os/kernel/cgroup/RMG-rule2.png)

* 规则3

每次系统中创建了一个新的层次结构，所有在系统中的任务是这个`root cgroup`的层次结构的默认cgroup的初始层元。对于管理员创建的任何单一层次结构，系统中的每个任务都是一个cgroup的成员。一个单一任务可以属于多个cgroup，与此同时，这些cgroup可以是不同的层次结构。此时，任务成为相同层次结构的第二个cgroup的成员，它就会从这个层次结构的第一个cgroup移除。对于同一个层次结构，任务不能同时属于不同的cgroup。

这个规则的结果是，如果`cpu`和`memory`子系统被附加到名为`cpu_mem_cg`的层次结构，并且`net_cls`子系统被附加到名为`net`的层次结构，这样，一个运行的`httpd`进程可以成为`cpu_mem_cg`层次结构中的任意一个cgroup，同时是`net` cgroup的成员。

在`cpu_mem_cg`的cgroup中的`httpd`进程可能限制CPU是时间是其他进程的一半，并且限制其内存为`1024MB`，并且，`net`这个cgroup则限制`httpd`进程传输速率为30MB。当第一个层次结构被创建后，每个任务是至少一个cgroup，也就是`root cgroup`。当使用`cgroups`时，每个系统任务已经至少属于一个cgroup。

![cgroup规则3](/img/os/kernel/cgroup/RMG-rule3.png)

* 规则4

任何进程（任务）fork自己的时候创建一个子任务，这个子任务自动继承了父任务的cgroup关系，但会在需要是移动到不同的cgroup。一旦fork完成，父进程和子进程的cgroup关系就完全分离了。

这个规则的结果，可以考虑`httpd`任务是一个位于`cpu_and_mem`层次结构中名为`half_cpu_1gb_max`的cgroup的成员，并且是`net`层次结构中命名为`trans_rate_30`的cgroup成员。当`httpd`进程fork自己的是偶，它的子进程将自动成为`half_cpu_1gb_max` cgroup 和 `trans_rate_30` cgroup的成员。也就是子进程继承了父进程所属的cgroup属性。

在这个过程完成后，父进程和子进程的cgroup关系就完全无关了。无论是修改父进程的cgroup属性还是子进程的cgroup属性，两者都不会相互影响。

![cgroup规则4](/img/os/kernel/cgroup/RMG-rule4.png)

# 资源管理的隐含规则

* 由于一个任务只能属于单一层次结构中的一个cgroup，在一个层次结构中只有一个子系统可以限制和作用任务。
* 可以组合多个子系统来作用于单个层次结构中的所有任务。由于那个层次结构中的cgroup有不同的参数，这些任务会有不同效果。
* 可以在需要时将任务重新附加到层次结构。例如，从层次结构的多个子系统中摘除附加的子系统，然后将子系统附加到一个新的分离的层次结构。
* 相反，如果需要切分子系统到不同的层次结构，你可以删除一个层次结构并将原先附加的子系统到另一个层次结构。
* cgroup设计可以允许在一个单一层次结构中对特定任务设置多个参数，例如使用附加的`cpu`和`memory`子系统。
* cgroup设计也允许高度定制：每个任务（进程）可以是每个层次结构的成员，每个层次结构有一个单一的附加的子系统。这种配置可以让系统管理员抽象控制每个简单任务的所有参数。