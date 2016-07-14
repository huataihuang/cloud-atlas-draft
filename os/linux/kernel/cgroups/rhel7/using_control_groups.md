在RHEL7中，建议使用`systemd`来管理cgroup，并且这种方式也是未来版本所支持的方式。虽然当前仍然可以使用`libcgroup`软件包作为向后兼容，但是未来RHEL发行版将不支持`libcgroup`。

# 在RHEL7中创建Control Groups

要创建一个服务的**暂时的cgroup**（`transient cgroup`），可以使用`systemd-run`命令来启动服务。这种方式可以通过服务运行时来设置资源分配。应用程序可以通过使用`systemd`API调用来动态创建暂时的cgroups。当服务停止时，暂时的unit将自动移除。

要指定**永久的cgroup**(`persistent cgroup`)则编辑对应的配置文件，这个配置文件将在系统重启后依然是持久化的，所以可以用来管理服务的启动。但是要注意`scope`单元不能使用这个方法创建。

## 使用`systemd-run`创建暂时的cgroups

`systemd-run`命令可以用来创建和启动一个暂时的`service`或`scope`单元并在这个单元中运行定制的命令。命令在`service`单元中执行并在后台异步启动，在后台服务进程是通过`systemd`进程来唤起的。通过`systemd-run`进程直接启动的在`scope`单元运行命令，会继承了调用者的执行环境，这种情况则是同步的。

要在指定cgroup中运行一个命令，以root执行如下：

```bash
systemd-run --unit=name --scope --slice=slice_name command
```

* 命令中`name`是你期望运行的单元，如果没有设置`--unit`，则自动生成一个单元名字。建议选择使用有意义的名字，因为它反映了`systemctl`输出中的单元。这个名字必须是运行期间的唯一的单元名字。
* `--scope`参数胡创建一个暂时的`scpoe`单元来代替默认创建的`service`单元
* `--slice`参数指定了新创建的`service`或`scope`单元在指定的`slice`中。将`slice_name`替换成一个已经存在的`slice`(即`systemctl -t slice`输出内容)，或者通过传递一个唯一的名字来创建一个新的`slice`。默认情况，`service`和`scope`都是作为**`system.slice`**的成员创建的。
* `systemd-run`还有一些其他选项，例如`--description`则创建单元的描述，`--remain-after-exit`允许在服务的进程终止以后搜集运行信息。`--machine`选项在一个封闭容器中执行命令。具体参考`systemd-run`手册。

举例：

在一个新的称为`test`的`slice`的服务单元中运行`top`工具

```bash
systemd-run --unit=toptest --slice=test top -b
```

输出信息如下表明启动了服务

```
Running as unit toptest.service.
```

## 创建持久化Cgroups

要配置启动启动时自动启动的单元，则使用`systemctl enable`命令（参考[RHEL系统管理:systemd](../../../redhat/system_administration/systemd/README.md)）。这个命令自动在`/usr/lib/systemd/system/`目录下创建一个单元文件。要持久化改变cgroup，添加或修改这个单元文件的配置参数。详细请参考 [修改控制组](modify_control_groups.md)

----

# 删除控制组

临时cgroups在其包含的进程停止的时候被自动释放。通过传递参数`--remain-after-exit`可以使得`systemd-run`在进程结束的时候依然保留运行的单元。

要优雅地停止单元，使用命令

```
systemctl stop name.service
```

将这里的`name.service`名字替换成你希望停止的服务。要停止一个或多个单元中的进程，执行：

```
systemctl kill name.service --kill-who=PID,... --signal=signal
```

这里的`name`是单元的名字，例如`httpd.serivce`。使用`--kill-who`参数来选择你希望停止的cgroup中断进程。要同时终止多个进程，则使用`,`逗号分隔的`PID`。将`signal`替换成你希望发送给指定进程的POSIX信号。默认信号是`SIGTERM`。

例如参考上例中的启动的`toptest.serivce`（见[RHEL7 使用控制组](using_control_groups.md)）

```
systemctl kill toptest.service
```

持久化的cgroup将在`disabled`单元的时候被释放，并且配置文件被删除：

```
systemctl disable name.service
```

----

# 修改控制组

通过systemd管理的每个持久化单元都有一个配置文件位于`/usr/lib/systemd/system/`目录。要修改一个服务单元的参数，就要修改这样的配置文件。这个配置修改可以手工操作，或者通过`systemctl set-property`命令接口来完成。

# 使用命令行接口设置参数

`systemctl set-property`命令可以在应用程序**运行的时候**持久化修改资源控制设置，语法如下：

```
systemctl set-property name parameter=value
```

上述命令中`name`替换成你希望修改的systemd单元，`parameter`是需要修改的参数的名字，而`value`则是设置参数的新值。

注意：不是所有的单元参数都能过在运行是修改，不过大多数资源控制相关的参数可以在线修改，参考下文`修改单元文件`部分的完整列表。注意，`systemctl set-property`允许一次修改多个属性，比单独修改要方便。

这个修改是立即生效的，并且写入到单元文件，所以系统重启也是生效的。可以通过添加`--runtime`选项来使设置临时生效

```
systemctl set-property --runtim name property=value
```

举例，限制`httpd.service`的CPU和memory使用：

```
systemctl set-property httpd.service CPUShares=600 MemoryLimit=500M
```

如果是临时生效设置

```
systemctl set-property --runtime httpd.service CPUShares=600 MemoryLimit=500M
```

# 修改单元文件

Systemd服务单元文件提供了一组高层次配置参数用于资源管理。这些参数和Linux cgroup控制器通讯，这些cgroup控制器必须在内核激活。使用这些参数，可以用来管理CPU，内存消耗，块设备IO，以及更多的一些良好细粒度的单元属性。

## 管理CPU

`cpu`控制器默认在内核激活，并且每个系统服务接收相同的CPU分配，无论这个服务具有多少进程。这个默认属性可以通过`/etc/systemd/system.conf`配置文件修改默认的`DefaultControllers`参数。要管理CPU分配，在使用单元配置文件的`[Service]`段落的配置项：

> 根据`man systemd-system.conf`可以看到默认配置读取`/etc/systemd/system.conf`，`/etc/systemd/system.conf.d/*.conf`等配置文件

* `CPUShares=value`

这里`value`是CPU分享值。默认值是`1024`，通过增加这个数值可以指定更多的CPU时间给这个单元。这个参数意味着在单元文件中`CPUAccounting`已经开启。`CPUShares`参数控制了`cpu.shares`控制组参数。

`cpu.shares`详细说明请参考 `Controller-Specific Kernel Documentation`，这个文档是通过安装`kernel-doc`后获得的

```
yum install kernel-doc
```

安装以后检查 `/usr/share/doc/kernel-doc-<kernel_version>/Documentation/cgroups/` 目录下相关文档

* 举例：限制一个单元的CPU消耗

要设置Apache服务使用1500 CPU分享而不是默认的1024，修改 `/usr/lib/systemd/system/httpd.service` 单元文件的`CPUShares`

```
[Service]
CPUShares=1500
```

要生效这个修改值，重新加载systemd的配置并重启Apache服务

```
systemctl daemon-reload
systemctl restart httpd.service
```

## 管理内存

对于增强单元内存消耗的限制，使用在单元配置文件中的`[Service]`部分设置

* `MemoryLimit=value`

这里`value`限制进程在cgroup中的最大使用内存，使用`K`,`M`,`G`,`T`分别表示KB,MB,GB,TB。这里也要求在同一个单元激活`MemoryAccounting`参数。

`MemoryLimit`参数控制`memory.limit_in_bytes`控制组参数，详细信息也参考`Controller-Specific Kernel Documentation`文档。

* 举例：限制一个单元的内存消耗

设置Apache服务的使用内存1GB，则修改`/usr/lib/systemd/system/httpd.service`单元文件：

```
[Service]
MemoryLimit=1G
```

要生效这个修改值，重新加载systemd的配置并重启Apache服务

```
systemctl daemon-reload
systemctl restart httpd.service
```

## 管理块设备IO

管理块设备IO，同样修改单元配置文件中的`[Service]`部分，并确保`BlockIOAccounting`参数已经被激活

* `BlockIOWeight=value`

`value`值替换成执行集成的新的块设备IO权重。参数值从10到1000，默认设置是1000.

* `BlockIODeviceWeight=device_name value`

参数值是设置指定`device_name`的块设备IO权重。这里`device_name`是设备名或者是一个设备的路径。设置的`BlockIOWeight`也是范围从10到1000。

* `BlockIOReadBandwidth=device_name value`

指定单元的读带宽。`device_name`是设备名或者是一个设备的路径，`value`值是带宽速率。使用`K`,`M`,`G`,`T`作为度量单位，参数值如果没有附加后缀则认为是字节/秒。

* `BlockIOWriteBandwidth=device_name value`

指定单元的写入带宽。设置参数方法同`BlockIOReadBandwidth`。

> 当前`blkio`资源控制组不支持缓存型写操作。这里主要目标是限制直接I/O，所以如果服务使用缓存型写入就会忽略`BlockIOWriteBandwidth`设置。另一方面，缓存型读取操作是支持的，并且`BlockIOReadBandwidth`同时限制直接和缓存型读。

* 举例：限制单元的块设备IO

要限制Apache服务访问`/home/jdoe/`目录的IO权重，可以设置`/usr/lib/systemd/system/httpd.service`单元文件：

```
[Service]
BlockIODeviceWeight=/home/jdoe 750
```

要限制Apache服务读`/var/log/`目录的最大带宽为`5MB/s`，则设置

```
[Service]
BlockIOReadBandwidth=/var/log 5M
```

要生效这个修改值，重新加载systemd的配置并重启Apache服务

```
systemctl daemon-reload
systemctl restart httpd.service
```

## 管理其他系统资源

还有一些其他单元文件设置可以用来进行资源管理。

* `DeviceAllow=device_name options`

这个`DeviceAllow`参数控制特定设备节点的访问。这里`device_name`指设备节点的路径或者在`/proc/devices`中指定的设备组名字。`options`是结合了`r,w,m`允许单元`读`，`写`或`创建`设备节点。

* `DevicePolicy=value`

这个`value`值是：`strict`（只允许在`DeviceAllow`中明确指定访问类型），`closed`（允许访问表标准伪设备`pseudo devices`包括`/dev/null`，`/dev/zero`，`/dev/full`，`/dev/random`和`/dev/urandom`）或者`auto`（如果没有明确的`DeviceAllow`设置，但还是允许访问所有设备，这是缺省值）

* `Slice=slice_name`

`slice_name`默认是`system.slice`，Scope单元不能以这种方式排列，因为Scope是位于slice之下的排列。

* `ControlGroupAttribute=attribute value`

这个选项设置通过Linux cgroup控制器暴露出来的系列控制组参数。这个底层cgroup参数可以直接修改。

* 举例：修改底层Cgroup属性

假设希望修改`memory.swappiness`设置内核换出cgroup中任务所使用的进程内存的倾向。这个设置的详情，参考`Controller-Specific Kernel Documentation`文档。例如，这里设置Apache服务的`memory.swappiness`值为`70`，则在`/usr/lib/systemd/system/httpd.service`添加如下内容：

```
[Service]
ControlGroupAttribute=memory.swappiness 70
```

要生效这个修改值，重新加载systemd的配置并重启Apache服务

```
systemctl daemon-reload
systemctl restart httpd.service
```

----

# 获取有关控制组的信息

使用`systemctl`命令来列出系统单元并查看它们的状态。此外，`systemd-cgls`命令提供了查看控制组的层次结构，`systemd-cgtop`则实时监控资源消耗的情况。

## 列出单元

使用以下命令列出系统的所有激活的单元：

```
systemctl list-units
```

这里默认的选项执行会接受到类似如下的输出信息：

```
UNIT                     LOAD   ACTIVE SUB     DESCRIPTION
abrt-ccpp.service        loaded active exited  Install ABRT coredump hook
abrt-oops.service        loaded active running ABRT kernel log watcher
abrt-vmcore.service      loaded active exited  Harvest vmcores for ABRT
abrt-xorg.service        loaded active running ABRT Xorg log watcher
...
```

输出列的说明：

* `UNIT` - 在cgroup树中引用的单元位置的单元名字。可以看到单元类型在控制组中有3种：`slice`，`scope`和`service`。有关systemd的单元类型，参考[系统管理：systemd](../../../redhat/system_administration/systemd/README.md)
* `LOAD` - 标识这个单元的配置文件是否正确加载。如果单元文件加载失败，在这个列显示的是`error`而不是正常的`loaded`。其他单元加载状态还有：`stub`，`merged`和`masked`
* `SUB` - 低层次单元活动状态。这个列的可能值依赖单元类型
* `DESCRIPTION` - 单元内容和功能的描述。

默认情况，`systemctl`只列出激活单元（概念上就是高层活动状态是`ACTIVE`）。使用`--all`参数可以显示包括没有激活的单元的所有单元。要限制输出列表的信息，使用`--type(-t)`参数，参数是逗号分隔的单元类型列表（例如`service`和`slice`）或者单元加载的状态（例如`loaded`和`masked`）

* 使用`system list-units`案例

显示所有`slices`列表

```
systemctl -t slice
```

显示所有激活的service和socket

```
systemctl -t service,socket
```

列出所有安装在系统中的单元文件以及它们的状态

```
systemctl list-unit-files
```

## 层次结构查看控制组

上述使用`systemctl`命令只在单元层显示了cgroups中激活的进程。然而，输出信息不能显示单元之间的层次关系。可以通过`systemd-cgls`命令显示cgroups的运行进程：

```
systemd-cgls
```

没有带参数的`systemd-cgls`命令返回整个层次结构

```
├─1 /usr/lib/systemd/systemd --switched-root --system --deserialize 21
├─test.slice
│ └─toptest.service
│   └─1363 /usr/bin/top -b
├─system.slice
│ ├─dbus.service
│ │ └─718 /usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation
│ ├─firewalld.service
│ │ └─728 /usr/bin/python3 -Es /usr/sbin/firewalld --nofork --nopid
...
```

要减少`systemd-cgls`输出，并查看特定的层次结构，使用`systemd-cgls name`，这个`name`参数是希望查看的资源控制组的名字。

* 举例：查看资源控制组层次

```
systemd-cgls memory
```

输出显示

```
memory:
├─  1 /usr/lib/systemd/systemd --switched-root --system --deserialize 21
├─913 /sbin/agetty --noclear tty1 linux
├─test.slice
│ └─1363 /usr/bin/top -b
├─system.slice
│ ├─ 570 /usr/lib/systemd/systemd-journald
│ ├─ 598 /usr/sbin/lvmetad -f
```

检查服务状态

```
systemctl status httpd.service
```

状态显示输出包括了进程信息以及启动进程的日志摘要

```
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; disabled; vendor preset: disabled)
   Active: active (running) since Wed 2016-07-13 18:31:30 CST; 12s ago
 Main PID: 3693 (httpd)
   Status: "Total requests: 0; Idle/Busy workers 100/0;Requests/sec: 0; Bytes served/sec:   0 B/sec"
   CGroup: /system.slice/httpd.service
           ├─3693 /usr/sbin/httpd -DFOREGROUND
           ├─3694 /usr/sbin/httpd -DFOREGROUND
           ├─3695 /usr/sbin/httpd -DFOREGROUND
           ├─3697 /usr/sbin/httpd -DFOREGROUND
           ├─3698 /usr/sbin/httpd -DFOREGROUND
           └─3701 /usr/sbin/httpd -DFOREGROUND

Jul 13 18:31:22 fedora systemd[1]: Starting The Apache HTTP Server...
Jul 13 18:31:27 fedora httpd[3693]: AH00558: httpd: Could not reliably determine the server's fully qualified domain name, us...message
Jul 13 18:31:30 fedora systemd[1]: Started The Apache HTTP Server.
Hint: Some lines were ellipsized, use -l to show in full.
```

## 查看资源控制组

上述`systemctl`命令可以在较高的层次单元监视，但是没有显示Linux内核实际被哪个进程使用的资源控制器。这个信息存储在独立的进程文件中，要查看这个信息，需要以`root`用户身份执行：

```
cat /proc/PID/cgroup
```

这里`PID`是需要检查进程的pid。默认情况下，这个列表是和通过`systemd`启动的所有单元相同，因为它自动挂载所有默认控制器。以下是一个案例：

```
cat /proc/3693/cgroup
```

显示输出

```
10:freezer:/
9:memory:/system.slice
8:perf_event:/
7:blkio:/system.slice
6:devices:/system.slice/httpd.service
5:cpuset:/
4:hugetlb:/
3:net_cls,net_prio:/
2:cpu,cpuacct:/system.slice
1:name=systemd:/system.slice/httpd.service
```

要检查这个文件，你可以决定进程是否通过systemd单元文件设置，将进程放置在指定的cgroup。

## 监视资源消耗

`systemd-cgls`命令提供了cgroup层次结构的状态快照，可以查看当前运行进程按照资源使用（CPU, memory, IO）的动态记录：

```
systemd-cgtop
```

----

# 附加资源

有关`systemd`使用相关信息参考[系统管理：systemd](../../../redhat/system_administration/systemd/README.md)

有关cgroup相关的systemd工具：

* `systemd-run`
* `systemctl`
* `system-cgls`
* `system-cgtop`
* `machinectl`
* `systemd.kill`

控制组相关内核文档通过`yum install kernel-doc`，相关cgroup文档位于`/usr/share/doc/kernel-doc-<kernel_version>/Documentation/cgroups/`目录下

* blkio subsystem — blkio-controller.txt
* cpuacct subsystem — cpuacct.txt
* cpuset subsystem — cpusets.txt
* devices subsystem — devices.txt
* freezer subsystem — freezer-subsystem.txt
* memory subsystem — memory.txt
* net_cls subsystem — net_cls.txt

有关cpu子系统文档信息

* Real-Time scheduling — /usr/share/doc/kernel-doc-<kernel_version>/Documentation/scheduler/sched-rt-group.txt
* CFS scheduling — /usr/share/doc/kernel-doc-<kernel_version>/Documentation/scheduler/sched-bwc.txt

## 在线文档

* [Red Hat Enterprise Linux 7 System Administrators Guide](https://access.redhat.com/site/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide)
* [The D-Bus API of systemd](http://www.freedesktop.org/wiki/Software/systemd/dbus/)

# 参考

* [CHAPTER 2. USING CONTROL GROUPS](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Resource_Management_Guide/chap-Using_Control_Groups.html)