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