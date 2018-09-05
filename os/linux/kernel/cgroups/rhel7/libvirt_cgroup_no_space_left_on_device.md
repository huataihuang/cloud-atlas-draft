
在`/var/lob/libvirt/libvirtd.log`日志中有关于 cgroup 无法设置`cpuset,cpu,cpuacct`相关的

```
2018-07-30 10:26:46.764+0000| 24902| error | virCgroupSetValueStr:669 | Unable to write to '/sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemu\x2dexample\x2dad04f.scope/tasks': No space left on device
2018-07-30 10:26:46.764+0000| 24902| error | virCgroupRemoveRecursively:1042 | Unable to remove /sys/fs/cgroup/memory/machine.slice/machine-qemu\x2dexample\x2dad04f.scope/ (16)
2018-07-30 10:26:46.764+0000| 24902| error | virCgroupRemoveRecursively:1042 | Unable to remove /sys/fs/cgroup/devices/machine.slice/machine-qemu\x2dexample\x2dad04f.scope/ (16)
2018-07-30 10:26:46.764+0000| 24902| error | virCgroupRemoveRecursively:1042 | Unable to remove /sys/fs/cgroup/blkio/machine.slice/machine-qemu\x2dexample\x2dad04f.scope/ (16)
```

检查可以发现`libvirtd`默认应该建立的 `/sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemu\x2dexample\x2dad04f.scope/` cgroup控制组没有建立，所以在添加pid到 `tasks` 时候失败。不过，和常见的文件目录不存在报错`No such file or directory`不同，在cgroup的控制组中如果不能写入，都是显示`No space left on devices`。

# libvirt的cgroup

* 可以看到，当创创建启动第一个虚拟机时候，libvirt创建了`/sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice`这个cgroup控制组，但是检查这个目录下的`cpuset.mems`和`cpuset.cpus`内容都是空的。

模拟创建cgroup

```
cgcreate -g cpuset:machine.slice/machine-qemu\x2diso\x2dexample\x2dtest.scope
```

创建完成后可以看到建立了目录`/sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope`，注意此时这个目录下的 `cpuset.cpus` 和 `cpuset.mems` 内容也是空的。

此时还不能加入task的pid

````
#echo 8324 > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/tasks
-bash: echo: write error: No space left on device
```

而且也不能设置cpus（需要一级级设置）：

```
#echo "0-63" > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/cpuset.cpus
-bash: echo: write error: Permission denied
```

这是因为上一级`cpuset.cpus`没有设置，所以先设置上一级，然后设置下一级

```
#echo "0-63" > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/cpuset.cpus

#echo "0-63" > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/cpuset.cpus

#cat /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/cpuset.cpus
0-63

#cat /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/cpuset.cpus
0-63
```

同样也要设置好两级`cpuset.mems`:

```
#echo 0 > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/cpuset.mems

#echo 0 > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/cpuset.mems
```

此时就可以设置tasks不再报错

```
#echo 8324 > /sys/fs/cgroup/cpuset,cpu,cpuacct/machine.slice/machine-qemux2disox2dexamplex2dtest.scope/tasks
```

> 具体排查，请参考[libvirt程序调试排错](../../../../virtual/libvirt/debug_libvirt)

# `No space left on device`可能的其他原因

[CGroups and No Space](https://www.richardhsu.me/posts/2014/12/08/cgroups-and-no-space.html)这篇文档让我想起这个问题以前处理过，在某次写脚本设置进程的cgroup时遇到过并且也解决过:

在设置cgroup控制组的时候，必须同时设置`cpuset.cpus`和`cpuset.mems`两个值，否则会导致报错`No space left on device`。

例如:

创建一个cgroup控制组`my_app`

```bash
cgcreate -g cpuset:my_app
```

如果操作系统是CentOS 5.x，则`/cgroup/cpuset/my_app/cpuset.cpus`和`/cgroup/cpuset/my_app/cpuset.mems`值都是空的：

```
#cat /cgroup/cpuset/my_app/cpuset.cpus

#cat /cgroup/cpuset/my_app/cpuset.mems
```

如果操作系统是CentOS 7.x，则`/sys/fs/cgroup/cpuset/my_app/cpuset.cpus`和`/sys/fs/cgroup/cpuset/my_app/cpuset.mems`值此时是空的：

```
#cat /sys/fs/cgroup/cpuset/my_app/cpuset.cpus

#cat /sys/fs/cgroup/cpuset/my_app/cpuset.mems
```

> CentOS 7需要安装`libcgroup-tools`软件包才有`cgcreate`工具

如果此时只设置 cgroup 控制组 `my_app` 的 `cpuset.cpus` 值，没有设置 `cpuset.mems` ，却马上将某个进程的pid加入到 `my_app/tasks` 中就会同样报错 ``

```
#cgset -r cpuset.cpus=32 my_app

#cat /sys/fs/cgroup/cpuset/my_app/cpuset.cpus
32

#cat /sys/fs/cgroup/cpuset/my_app/cpuset.mems
```

假设有一个进程 `my_example_app.sh` 的 pid 是 `13058` ，需要将这个进程归到`my_app`这个cgroup控制组，我们通常可以使用：

```
echo 13058 >  /sys/fs/cgroup/cpuset/my_app/tasks
```

但是你会发现此时报错

```
-bash: echo: write error: No space left on device
```

解决的方法是：在设置`cpuset.cpus=32`之后，必须设置`cpuset.mems=XXX`才能添加`tasks`中的pid

```
#cgset -r cpuset.mems=0 my_app

#cat /sys/fs/cgroup/cpuset/my_app/cpuset.mems
0
```

然后执行将pid值`13058`添加到`/sys/fs/cgroup/cpuset/my_app/tasks`就不会报错

```
#echo 13058 >  /sys/fs/cgroup/cpuset/my_app/tasks
```

此时检查`13058`的 cgroup 控制组就可以看到正确的`my_app`这个cgroup控制组设置：

```
#cat /proc/13058/cgroup
...
4:cpuacct,cpu,cpuset:/my_app
...
```

# 参考

* [CGroups and No Space](https://www.richardhsu.me/posts/2014/12/08/cgroups-and-no-space.html)
* [echo $$ > tasks gives “no space left on device” when trying to use cpuset](https://stackoverflow.com/questions/28348627/echo-tasks-gives-no-space-left-on-device-when-trying-to-use-cpuset)
* [Cgroup change results in "No space left on device" or "Error Code: 5001"](https://access.redhat.com/solutions/232153) - 这篇文档是Red Hat知识库，我没有账号，等以后看看