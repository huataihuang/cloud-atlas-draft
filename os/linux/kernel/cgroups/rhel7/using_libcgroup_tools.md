`libcgroup`软件包是是以前Red Hat Enterprise Linux（5/6）所使用的cgroup维护工具，在当前RHEL 7操作系统中已经不推荐使用，后续将从发行版中剥离。为了避免冲突，不要使用`libcgroup`工具来操作默认的资源控制组（见[Avaliable Controllers in Red Hat Enterprise Linux 7](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Resource_Management_Guide/br-Resource_Controllers_in_Linux_Kernel.html#itemlist-Available_Controllers_in_Red_Hat_Enterprise_Linux_7)），因为默认资源控制组现在是`systemd`的一个独立的domain。所以现在只有很少的地方使用`libcgroup`工具，只在需要管理当前`systemd`还不支持的控制组，例如`net_prio`。

以下章节内容说明如何在不和默认系统的cgroup控制组冲突情况下使用`libcgroup`。

> 注意：

> 要使用`libcgroup`工具，首先要确保`libcgroup`和`libcgroup-tools`软件包被安装到系统中

```
yum install libcgroup
yum install libcgroup-tools
```

> 注意：

> `net_prio`控制器没有像其他控制器一样编译到内核，这是一个模块，所以在挂载前需要先加载：

```
modprobe netprio_cgroup
```

# 挂载一个层次结构

要使用一个没有自动挂载的内核资源控制器，需要创建一个包含这个控制器的层次结构。通过编辑`/etc/cgconfig.conf`配置文件添加或去除`mount`段落的一个层次结构。这个方式使得控制器持久化，也就是操作系统重启依然生效。作为替代，使用`mount`命令创建一个临时的挂载则只在当前会话有效。

## 使用`cgconfig`服务

通过`libcgroup-tools`软件包安装的`cgconfig`服务提供了一种方法来挂载附加的资源控制组层次结构。默认，这个服务没有自动启动。当你启动`cgconfig`，它会执行`/etc/cgconfig.conf`配置文件中设置。这个配置就会从会话到会话重新创建并变成持久化。注意，如果你停止`cgconfig`，它会`umount`所有它挂载的层次结构。

`libcgroup`软件包安装的默认`/etc/gconfig.conf`配置文件没有包含任何配置，只是由`systemd`自动挂载了系统主要的资源控制组。

在`/etc/cgconfig.conf`的`mount`,`group`和`template`三个类型。`mount`部分用于作为虚拟文件系统来创建和挂载层次结构，然后添加控制器到这些层次结构。在Red Hat Enterprise Linux 7，默认的层次结构自动挂载到`/sys/fs/cgroup/`目录，`cgconfig`被单独用于添加**非默认**的控制器。

挂载对象的定义使用如下语法：

```
mount {
    controller_name = /sys/fs/cgroup/controller_name;
    …
}
```

将上面的`congroller_name`替换成你指定的内核资源控制器就可以。

* 举例：创建一个挂载点

```
mount {
    net_prio = /sys/fs/cgroup/net_prio;
}
```

然后重启`cgconfig`服务使设置生效

```
systemctl restart cgconfig.service
```

## 使用`mount`命令

使用`mount`命令可以临时挂载一个层次结构。要实现这个功能，首先创建一个挂载点`/sys/fs/cgroup/`目录，用于`systemd`挂载主资源控制器：

```
mkdir /sys/fs/cgroup/name
```

将`name`替换成要挂载的目标，通常是使用的控制器的名字。然后执行挂载层次结构并同时附加一个或多个子系统：

```
mount -t cgroup -o controller_name none /sys/fs/cgroup/controller_name
```

将`controller_name`替换成通过挂载目录挂载的控制器的名字，这里`-t`参数是指定挂载的类型。

* 举例：使用`mount`命令添加控制器

要挂载`net_prio`控制器的层次结构，首先创建挂载点：

```
mkdir /sys/fs/cgroup/net_prio
```

然后挂载`net_prio`

```
mount -t cgroup -o net_prio none /sys/fs/cgroup/net_prio
```

通过`lssubsys`命令可以检查挂载的所有层次结构

```
lssubsys -am
```

```
cpuset /sys/fs/cgroup/cpuset
cpu,cpuacct /sys/fs/cgroup/cpu,cpuacct
memory /sys/fs/cgroup/memory
devices /sys/fs/cgroup/devices
freezer /sys/fs/cgroup/freezer
net_cls /sys/fs/cgroup/net_cls
blkio /sys/fs/cgroup/blkio
perf_event /sys/fs/cgroup/perf_event
hugetlb /sys/fs/cgroup/hugetlb
net_prio /sys/fs/cgroup/net_prio
```

----

# 3.2. UNMOUNTING A HIERARCHY


