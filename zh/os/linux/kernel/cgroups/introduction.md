# 什么是Cgroups

`control groups`，控制组，也称为`cgroups`，是Linux内核通过进程的层次化组织用于控制资源分配的功能 - 可以管控CPU时间片、系统内存、网路带宽，或者这些资源的组合。

通过使用cgroups，系统管理员可以非常好的得到资源分配，权重，拒绝和管理以及监控系统资源。硬件资源也可以分配和应用程序和用户，有效增加利用率。

控制组提供了层次化组织和标记进程，并且将资源分配给进程的方式。传统上，所有的进程能够获得系统相似的资源，系统管理员可以调整进程的`niceness`值（优先值）。使用这种接近的方式，应用程序启动大量的进程就能够获得比较少进程的应用程序更多的资源，而不管较少进程的应用程序的重要程度。

通过绑定系统的cgroup层次化结构和systemd单元树，Red Hat Enterprise Linux 7将资源管理设置从`进程级别`改到`应用程序级别`。这样就可以通过`systemctl`命令来管理系统资源，或者通过更改systemd单元文件。

在Red Hat Enterprise Linux的早期版本（RHEL 5/6），系统管理员使用`libcgroup`软件包中的`cgconfig`命令来构建自定的cgroup层次结构。当前(RHEL 7)已不建议使用`libcgroup`软件包，因为这个工具很容易导致和默认的cgroup层次冲突的配置。然而，这个`libcgroup`软件包依然为特定环境所保留，例如某些情况下不安装`systemd`，尤其是是使用`net-prio`子系统的环境。

> 本章节文档将同时兼顾Red Hat Enterpirse 7 和 6 系列，并阐述两者操作方法的区别。

**`注意：RHEL 6 和 RHEL 7 的cgroup概念及使用方法有较大差异，请注意区别！`**

----

**`RHEL7`** - `本段落是有关 Red Hat Enterprise 7 / CentOS 7 操作系统中 cgroups`

# 默认的Cgroup层次结构

默认情况下`systemd`自动创建一个`slice`（片），`scope`（范围）和`service`（服务）单元来提供cgroup树的统一结构。使用`systemctl`命令，可以通过创建定制的`slice`来修改这个层次结构。并且，`systemd`为重要的内核资源控制器在`/sys/fs/cgroup/`目录下自动挂载层次结构。

> **警告**

通过`libcgroup`软件包提供的`cgconfig`工具可以挂载和处理控制器的层次结构，但不被`systemd`所支持（尤其是`net-prio`控制器）。绝对不要使用`libcgroup`工具来修改通过`systemd`所挂载的默认层次结构，因为这样会导致不可预知的错误。`libcgroup`软件包将在未来的Red Hat Enterprise Linux版本中移除。

## Systemd单元类型

> `systemd`是Red Hat Enterprise Linux 7开始取代`init`的服务管理系统，本段落内容适用于RHEL 7。

所有运行在系统（RHEL 7）中的进程都是`systemd` init进程的子进程。`systemd`提供了三种单元类型用于资源控制目的：

* `Service`服务 - 一个进程或者一组进程，由`systemd`基于单元(unit)配置文件启动。服务包装了特定的进程，这样它们可以作为一个整体进行启动或停止。服务被命名成如下方式：

```bash
name.service
```

* `Scope`范围 - 一组外部创建的进程。scope包装了通过`fork()`功能启动和停止的进程，然后在运行时由`systemd`注册进程。例如，用户会话，容器和虚拟机就被视为`scope`。scope被命名成如下方式：

```bash
name.scope
```

* `slice`分片 - 使用unit层次化组织的组。`slice`不包含进程，它是由`scope`和`service`组成的层次结构。活跃的进程则包含在scope或service中。在层次结构树中，每个`slice`单元的命名都对应了层级结构中指向目标的路径。符号`-`就表示路径组件特征。例如，如果一个slice类似如下：

```bash
parent-name.slice
```

则表示这个`parent-name.slice`是`parent.slice`的`subslice`，这个`slice`也可以有自己的`subslice`，例如`parent-name-name2.slice`，依次类推。这里的根`slice`是`-.slice`。

`service`，`scope`和`slice`单元在cgroup树中直接被映射到对象。当这些单元被激活，每个单元都各自直接映射到单元名字对应的cgroup路径。例如位于`test-waldo.slice`中的`ex.service`被映射到cgroup的`test.slice/test-waldo.slice/ex.service/`。

`service`，`scope`和`slice`可以由系统管理员手工创建或者由程序动态创建。默认情况，操作系统定义了一组运行系统所必须的服务。即，默认有4个`slice`：

* `-.slice` - 根`slice`
* `system.slice` - 所有系统服务的默认存放位置
* `user.slice` - 所有用户会话的默认存放位置
* `machine.slice` - 所有虚拟机和容器的默认存放位置

注意，所有用户会话被自动放到一个独立的scope单元，虚拟机和容器进程也是这样处理的。而且，所有用户被指派到一个默认的subslice。在这个默认配置中，系统管理员可以定义一个新的slice并指定service和scope到这个slice中。

以下是`systemd-cgls`命令的输出案例：

```bash
├─1 /usr/lib/systemd/systemd --switched-root --system --deserialize 21
├─user.slice
│ └─user-1000.slice
│   └─session-2.scope
│     ├─2069 sshd: vagrant [priv]
│     ├─2072 sshd: vagrant@pts/0
│     ├─2073 -bash
│     ├─2253 systemd-cgls
│     └─2254 systemd-cgls
└─system.slice
  ├─postfix.service
  │ ├─1200 /usr/libexec/postfix/master -w
  │ ├─1216 qmgr -l -t unix -u
  │ └─2250 pickup -l -t unix -u
  ├─sshd.service
  │ └─888 /usr/sbin/sshd -D
  ...
```

上述案例可以看到`service`和`scope`包含进程，并且`service`和`scope`又被包含在`slice`中，而`slice`是不直接包含进程的。唯一的例外是`PID`为`1`的进程，位于特殊的`systemd.slice`中。还要注意，`-.slice`并没有显示在输出中，这是因为它表示了整个cgroup树。

`service`和`slice`单元可以通过单元文件配置或者动态通过调用`PID 1`的API来创建。`scope`单元则只能使用单元配置文件的方法来创建。通过API调用方法动态创建的单元是临时的并且只在运行期间存在。这些短暂存在的单元在单元结束时、禁用时或系统重启时自动释放。

# Linux内核中的资源控制器

资源控制器（resource controller），也称为cgroup子系统（cgroup subsystem），相当于一个单一资源，例如CPU时间或内存。Linux内核提供了一系列的资源控制器，它们都通过`systemd`自动挂载。

在`/proc/cgroups`中列出了当前挂载的resource controller列表

```bash
cat /proc/cgroups
```

输出内容

```bash
#subsys_name	hierarchy	num_cgroups	enabled
cpuset	7	1	1
cpu	5	1	1
cpuacct	5	1	1
memory	8	1	1
devices	10	1	1
freezer	6	1	1
net_cls	3	1	1
blkio	2	1	1
perf_event	4	1	1
hugetlb	9	1	1
```

也可以通过`lssubsys`(该命令属于`libcgroup-tools`软件包)，其中`-i`参数表示层次结构，`-m`参数表示输出挂载

```bash
lssubsys -i
```

输出

```bash
cpuset 7
cpu,cpuacct 5
memory 8
devices 10
freezer 6
net_cls 3
blkio 2
perf_event 4
hugetlb 9
```

```bash
lssubsys -m
```

```bash
cpuset /sys/fs/cgroup/cpuset
cpu,cpuacct /sys/fs/cgroup/cpu,cpuacct
memory /sys/fs/cgroup/memory
devices /sys/fs/cgroup/devices
freezer /sys/fs/cgroup/freezer
net_cls /sys/fs/cgroup/net_cls
blkio /sys/fs/cgroup/blkio
perf_event /sys/fs/cgroup/perf_event
hugetlb /sys/fs/cgroup/hugetlb
```

在RHEL 7中可用的资源控制器：

* `blkio` - 设置访问块设备的`I/O`存取限制
* `cpu` - 设置CPU调度算法提供cgroup调度任务访问CPU。这个挂载是和`cpuacct`控制器同时挂载的
* `cpuacct` - 通过使用cgroup的任务创建CPU资源的自动报告。这个挂载是和`cpu`控制器同时挂载的
* `cpuset` - 在多核系统中指定独立的CPU和内存节点给cgroup的任务
* `devices` - 允许或拒绝cgroup中的任务访问设备
* `freezer` - 挂起或继续cgroup重大任务
* `memory` - 通过cgroup中的任务设置内存限制，并通过其他任务来自动创建内存资源的报告
* `net_cls` - 通过分类标记（classid）来标记网络数据包，这样Linux流量控制器（`tc`命令）从参与的cgroup任务中标记数据包。
* `perf_event` - 通过`perf`工具激活监控cgroups
* `hugetlb` - 允许使用大的虚拟内存也，并强化资源限制在这些内存页

Linux内核针对可以通过`systemd`配置的资源控制来提供广泛的性能调优参数。

# 相关信息资源

## cgroup相关的systemd文档

以下手册页（man）包含了`systemd`下的cgroup通用信息

* `systemd.resource-control` - 描述通过system单元共享的资源控制配置选项
* `systemd.unit` - 描述所有单元配置文件的常用项
* `systemd.slice` - 提供`.slice`单元的通用信息
* `systemd.scope` - 提供`.scope`单元的通用信息
* `systemd.service` - 提供`.service`单元的通用信息

## 控制器相关内核文档

内核文档软件包提供了详细的有关所有资源控制器的文档。这个软件包包含了可选的订阅通道。

```bash
yum install kernel-doc
```

安装完成后，相关文件位于 `/usr/share/doc/kernel-doc-<kernel_version>/Documentation/cgroups/`目录。

## 在线文档

* [Red Hat Enterprise Linux 7 System Administrators Guide](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/index.html) - 详细解释了systemd概念和相关的服务管理方法
* [The D-Bus API of systemd](https://www.freedesktop.org/wiki/Software/systemd/dbus/) - 有关使用D-Bus API命令和`systemd`交互的参考手册

----

**`RHEL6`** - `本段落是有关 Red Hat Enterprise 6 / CentOS 6 操作系统中 cgroups`

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