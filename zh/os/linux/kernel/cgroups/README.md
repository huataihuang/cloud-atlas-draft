# 什么是Cgroups

`control groups`，控制组，也称为`cgroups`，是Linux内核通过进程的层次化组织用于控制资源分配的功能 - 可以管控CPU时间片、系统内存、网路带宽，或者这些资源的组合。

通过使用cgroups，系统管理员可以非常好的得到资源分配，权重，拒绝和管理以及监控系统资源。硬件资源也可以分配和应用程序和用户，有效增加利用率。

控制组提供了层次化组织和标记进程，并且将资源分配给进程的方式。传统上，所有的进程能够获得系统相似的资源，系统管理员可以调整进程的`niceness`值（优先值）。使用这种接近的方式，应用程序启动大量的进程就能够获得比较少进程的应用程序更多的资源，而不管较少进程的应用程序的重要程度。

通过绑定系统的cgroup层次化结构和systemd单元树，Red Hat Enterprise Linux 7将资源管理设置从`进程级别`改到`应用程序级别`。这样就可以通过`systemctl`命令来管理系统资源，或者通过更改systemd单元文件。

在Red Hat Enterprise Linux的早期版本（RHEL 5/6），系统管理员使用`libcgroup`软件包中的`cgconfig`命令来构建自定的cgroup层次结构。当前(RHEL 7)已不建议使用`libcgroup`软件包，因为这个工具很容易导致和默认的cgroup层次冲突的配置。然而，这个`libcgroup`软件包依然为特定环境所保留，例如某些情况下不安装`systemd`，尤其是是使用`net-prio`子系统的环境。

> 本章节文档将同时兼顾Red Hat Enterpirse 7 和 6 系列，并阐述两者操作方法的区别。

**`注意：RHEL 6 和 RHEL 7 的cgroup概念及使用方法有较大差异，请注意区别！`**

* [RHEL 6 Cgroups介绍](../../../../../zh/os/linux/kernel/cgroups/rhel6/introduction.md)
* [RHEL 7 Cgroups介绍](../../../../../zh/os/linux/kernel/cgroups/rhel7/introduction.md)


# 参考

* [Resource Management Guide: Managing system resources on Red Hat Enterprise Linux 7](https://access.redhat.com/site/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Resource_Management_Guide/index.html)