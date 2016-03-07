在RHEL6系统中，管理cgroup的方法是使用`libcgroup`软件包中的相关命令工具。这样就可以`mount`层次结构并且使用shell命令和工具来设置`cgroup`参数（非持久化）：

```bash
yum install libcgroup
```

# `cgconfig`服务

`libcgroup`软件包提供安装了`cgconfig`服务，提供了便捷的方式来创建层次结构，添加子系统到层次结构，以及管理层次结构中的cgroups。建议使用`cgconfig`来管理系统中的层次结构和cgroups。

注意：Red Hat Enterprise Linux 6默认没有启动`cgconfig`服务。当启动`cgconfig`服务，这个服务将读取`/etc/cgconfig.conf`这个cgroup配置文件。此时cgroups将依次重新创建并保持持久化。根据配置文件内容的不同，`cgconfig`可以创建层次结构（hierarchies），挂载必要的文件系统，创建cgroups，并设置每个组的子系统参数。

默认的`/etc/cgconfig.conf`文件是在`libcgroup`软件包安装创建的并为每个子系统挂载了一个独立hierarchy，并将subsystem添加到hierarchy。`cgconfig`服务也允许在`/etc/cgconfig.d/`目录下创建配置文件，并从`/etc/cgconfig.conf`中加载这些配置文件。

启动`cgconfig`服务

```bash
service cgconfig start
```

启动后检查层次结构挂载

```bash
lssubsys -m
```

显示输出

```bash
cpuset /cgroup/cpuset
cpu /cgroup/cpu
cpuacct /cgroup/cpuacct
memory /cgroup/memory
devices /cgroup/devices
freezer /cgroup/freezer
net_cls /cgroup/net_cls
blkio /cgroup/blkio
```

此时，使用`ls`命令可以看到挂载的文件系统中的内容，如 `ls /cgroup/blkio`可以看到

```bash
blkio.io_merged         blkio.throttle.io_service_bytes   blkio.weight_device
blkio.io_queued         blkio.throttle.io_serviced        cgroup.event_control
blkio.io_service_bytes  blkio.throttle.read_bps_device    cgroup.procs
blkio.io_serviced       blkio.throttle.read_iops_device   notify_on_release
blkio.io_service_time   blkio.throttle.write_bps_device   release_agent
blkio.io_wait_time      blkio.throttle.write_iops_device  tasks
blkio.reset_stats       blkio.time
blkio.sectors           blkio.weight
```

当停止`cgconfig`服务（`service cgconfig stop`），则会卸载所有其挂载的层次结构：

```bash
service cgconfig stop
```

此时再使用`lssubsys -m`命令，将看不到任何输出。同时，在`/cgroup/blkio`等层次结构挂载卸载后，目录下都为空。

# `/etc/cgconfig.conf`配置文件

`/etc/cgconfig.conf`配置文件包含两种主要的内容 - `mount` 和 `group`。其中，`mount`内容创建和挂载层次结构作为虚拟文件系统，并添加子系统到层次结构。mount对象定义使用以下语法：

```bash
mount {
	subsystem = /cgroup/hierarchy;
	...
}
```

默认的配置类似如下

```bash
mount {
	cpuset	= /cgroup/cpuset;
	cpu	= /cgroup/cpu;
	cpuacct	= /cgroup/cpuacct;
	memory	= /cgroup/memory;
	devices	= /cgroup/devices;
	freezer	= /cgroup/freezer;
	net_cls	= /cgroup/net_cls;
	blkio	= /cgroup/blkio;
}
```

上述配置的subsystem自动挂载到`/cgroup/`目录下的对应层次结构（hierarchies）。建议使用这些默认的层次结构来设置控制组。注意，多个子系统可以挂载到单一的层次结构，但是每个子系统只能挂载一次。

* 创建mount节点案例

以下案例创建`cpuset`子系统的hirearchy

```bash
mount {
	cpuset = /cgroup/red;
}
```

对应的shell命令如下：

```bash
mkdir /cgroup/red
mount -t cgroup -o cpuset red /cgroup/red
```

由于每个子系统只能挂载一次，所以如果`cpuset`已经存在，则上述挂载会失败。

* 创建group对象

`group`会创建cgroups并设置subsystem参数，使用以下语法：

```bash
group <name> {
	[<permissions>]
	<controller> {
		<param name> = <param value>;
	}
}
```

以下案例创建一个SQL服务的cgroup，设置在`sqladmin`组中的用户权限来添加任务到cgroup，以及`root`用户修改subsystem参数：

```bash
group daemons {
	cpuset {
		cpuset.mems = 0;
		cpuset.cpus = 0;
	}
}
group daemons/sql {
	perm {
		task {
			uid = root;
			gid = sqladmin;
		} admin {
			uid = root;
			gid = root;
		}
	}
	cpuset {
		cpuset.mems = 0;
		cpuset.cpus = 0;
	}
}
```

上述配置对等的shell命令如下：

```bash
mkdir -p /cgroup/red/daemons/sql
chown root:root /cgroup/red/daemons/sql/*
chown root:sqladmin /cgroup/red/daemons/sql/tasks
echo $(cgget -n -v -r cpuset.mems /) > /cgroup/red/daemons/cpuset.mems
echo $(cgget -n -v -r cpuset.cpus /) > /cgroup/red/daemons/cpuset.cpus
echo 0 > /cgroup/red/daemons/sql/cpuset.mems
echo 0 > /cgroup/red/daemons/sql/cpuset.cpus
```

**重启`cgconfig`服务使得更改生效。**

注意：当修改完 `/etc/cgconfig.conf` 配置文件后，需要重启`cgconfig`服务才能够生效。然而，重启这个服务会导致整个cgroup hierarchy重建，意味着删除所有现有的cgroups（例如，所有被`libvirtd`使用的cgroups）。重启`cgconfig`服务命令如下：

```bash
service cgconfig restart
```

# `/etc/cgconfig.d/`目录

`/etc/cgconfig.d/`目录保留用于存储特殊的应用程序和使用情况的配置文件。这些文件使用`.conf`后缀名，并且使用和`/etc/cgconfig.conf`相同的语法。

`cgconfig`服务会首先处理`/etc/cgconfig.conf`配置文件，然后继续处理`/etc/cgconfig.d/`目录下的配置文件。需要注意的是，该目录下文件处理的顺序是不确定的，所以不要在不同的配置文件中定义相同的group。

# 创建一个Hierarchy和添加Subsystems

对于运行系统：

创建新的hierarchy并添加subsystems，如果系统之前没有配置过cgroups，则指令不会立即生效。更改cgroup的tasks参数，则可能会立即作用于tasks。

在一个已经配置了cgroups的系统（手工或者通过`cgconfig`服务），这些命令会失败，除非你首先`umount`现存的hierarchies。**不要直接在生产系统上测试这些指令**

下面案例创建`cpu_and_mem`的层次结构，并添加`cpu,cpuset,cpuacct,memory`的subsystems

```bash
mount {
	cpuset = /cgroup/cpu_and_mem;
	cpu = /cgroup/cpu_and_mem;
	cpuacct = /cgroup/cpu_and_mem;
	memory = /cgroup/cpu_and_mem;
}
```

上述配置等同命令：

```bash
mkdir /cgroup/cpu_and_mem
mount -t cgroup -o cpu,cpuset,memory cpu_and_mem /cgroup/cpu_and_mem
```

然后使用命令`lssubsys`检查

```bash
lssubsys -am
```

可以看到，在执行上述配置命令之前`lssubsys -am`输出内容

```
cpuset
ns
cpu
cpuacct
memory
devices
freezer
net_cls
blkio
perf_event
net_prio
```

执行之后，可以看到系统已经挂载了`cpu,cpuset,memory`

```
ns
cpuacct
devices
freezer
net_cls
blkio
perf_event
net_prio
cpuset,cpu,memory /cgroup/cpu_and_mem
```

> 上述shell命令执行时，`cgconfig`并没有启动，是手工挂载的。此时需要卸载cgroup挂载之后才能启动`cgconfig`服务，否则会冲突。

重新挂载`cpu_and_mem`层次结构，可以使用`remount`选项：

```bash
mount -t cgroup -o remount,cpu,cpuset,cpuacct,memory cpu_and_mem /cgroup/cpu_and_mem
```

# 卸载hierarchy

```bash
umount /cgroup/cpu_and_mem
```

要移除一个层次结构，需要确保在umount层次结构之前，已经移除了所有的子cgroups，或者使用`cgclear`命令来deactive一个非空的层次结构。

# 创建Control Groups

使用`cgcreate`命令来创建cgroups，语法如下：

```bash
cgcreate -t uid:gid -a uid:gid -g subsystems:path
```

* `-t` - 指定这个cgroup中拥有`tasks`伪文件的属主uid和gid
* `-a` - 指定这个cgroup中拥有所有伪文件的属主uid和gid，也就是可以修改这个cgroup中任务
* `-g` - 指定cgroup创建在哪个hierarchy中，可以对多个hierarchy操作（多个hierarchy之间使用逗号分隔）

`cgcreate`命令举例：

```bash
cgcreate -g cpu,net_cls:/test-subgroup
```

上述命令创建了`2`个`test-subgroup`，分别位于`cpu_and_mem`和`net`这两个hierarchy。

# 删除Control Groups

```bash
cgdelete subsystems:path
```

举例：

```bash
cgdelete cpu,net_cls:/test-subgroup
```

可以使用参数`-r`表示删除所有subgroup

当删除cgroup时，所有这个组的任务会移动到它的上级组。

# 设置参数

通过`cgset`命令设置一个额用户帐号允许修改相应的cgroup。例如，如果`cpuset`被挂载在`/cgroup/cpu_and_mem/`，并且有一个`/cgroup/cpu_and_mem/group1`子目录，设置CPU访问方法：

```bash
cgset -r cpuset.cpus=0-1 group1
```

这里`cgset`的语法：

```bash
cgset -r parameter=value path_to_cgroup
```

这里：

* `parameter`是对应在指定cgroup目录下的文件
* `value`是参数值
* `path_to_cgroup`是cgroup层次结构的根相关的路径。例如，设置root组的参数（这里的例子是挂载在`/cgroup/cpu_and_mem/`目录下的`cpuacct`子系统），修改`/cgroup/cpu_and_mem/`目录

```bash
cgset -r cpuacct.usage=0 /
```

当然，由于`.`就是表示根组，也可以将上述命令修改成

```bash
cgset -r cpuacct.usage=0 .
```

不过，建议使用`/`。

只有少量的参数可以设置到根组。这是因为根组拥有所有的资源。

要设置`group1`，这个根组的子组：

```bash
cgset -r cpuacct.usage=0 group1
```

可以通过`cgset`命令复制一个cgroup的参数到另外一个cgroup

```bash
cgset --copy-from group1/ group2/
```

上述设置命令的另外一种方式是直接使用`echo`命令：

```bash
echo 0-1 > /cgroup/cpu_ane_mem/group1/cpuset.cpus
```

# 将一个进程移动到控制组

要将一个进程移入到一个cgroup，使用`cgclassify`命令。例如：

```bash
cgclassify -g cpu,memory:group1 1701
```

这个`cgclassify`语法是：

```bash
cgclassify -g subsystems:path_to_cgroup pidlist
```

* `subsystem`是逗号分隔的，或者用`*`来加载进程到hierarchy相应的所有可用的subsystems。注意如果cgroup在多个层次结构中同名，则`-g`参数将移动进程到所有组。
* `path_to_cgroup`是这个层次结构的cgroup路径
* `pidlist`是空格分隔的进程id（PIDs）

如果没有指定`-g`参数，则`cgclassify`自动搜索`/etc/cgrules.conf`，并使用第一个合适的配置行。针对匹配行，`cgclassify`检查hierarchies和cgroups并移动进程到符合的控制组。

可以添加 `--sticky` 选项在`pid`之前，这样所有的子进程将位于相同的cgroup。如果没有设置这个选项，并且`cgred`服务也在运行，则子进程将基于`/etc/cgrules.conf`配置中符合的cgruops。然而，其父进程将保留在首次启动的cgroup中。

使用`cgclassify`，可以同时移动多个进程。例如：

```bash
cgclassify -g cpu,memory:group1 1701 1138
```

替代的方法：

直接将进程的PID写入到cgroup的`tasks`文件：

```bash
echo 1701 > /cgroup/cpu_and_mem/group1/tasks
```

# `cgred`服务

`cgred`服务（将启动`cgrulesengd` daemon）将根据`/etc/cgrules.conf`配置将进程移动到相应cgroups的tasks中。在`/etc/cgrules.conf`配置文件中，有如下两种格式：

```bash
user subsystems control_group
user:command subsystems control_group
```

这里`user`是用户名，或者是以`@`开头的组名。

**这里需要再补充一些细节**

# 在控制组中启动一个进程

注意：在移动一个进程到使用了子系统的cgroup，这些子系统需要先设置好强制参数（mandatory parameters）。例如，在将一个任务移动到使用了`cpuset`子系统的cgroup之前，你必须先创建好`cpuset.cpus`和`cpuset.mems`参数。

要将一个进程在cgroup中启动，需要使用`cgexec`命令。例如，在`gruop1`的cgroup中启动`firefox`浏览器，限制到`cpu`子系统

```bash
cgexec -g cpu:group1 firefox http://www.redhat.com
```

使用`cgexec`的语法：

```bash
cgexec -g subsystems:path_to_cgroup command arguments
```

* `subsystem`是逗号分隔的子系统列表。如果在多个hierarchies中有相同名字的cgroup，则`-g`参数将在每个groups中创建进程。
* `path_to_cgroup`是在hierarchy中的相关cgroup

**替代方法**

也可以使用shell命令：当启动一个进程，它将继承父进程的group，所以替代方法是先将shell进程移动到组里面，然后在shell中启动组：

```bash
echo $$ > /cgroup/cpu_and_mem/group1/tasks
firefox
```

更好的方法是：

```bash
sh -c "echo \$$ > /cgroup/cpu_and_mem/group1/tasks && firefox"
```

# Starting a Service in a Control Group