在RHEL7中，建议使用`systemd`来管理cgroup，并且这种方式也是未来版本所支持的方式。虽然当前仍然可以使用`libcgroup`软件包作为向后兼容，但是未来RHEL发行版将不支持`libcgroup`。

# 在RHEL7中创建Control Groups

要创建一个服务的**暂时的cgroup**（`transient cgroup`），可以使用`systemd-run`命令来启动服务。这种方式可以通过服务运行时来设置资源分配。应用程序可以通过使用`systemd`API调用来动态创建暂时的cgroups。当服务停止时，暂时的unit将自动移除。

要指定**永久的cgroup**(`persistent cgroup`)则编辑对应的配置文件，这个配置文件将在系统重启后依然是持久化的，所以可以用来管理服务的启动。但是要注意scope单元不能使用这个方法创建。

## 使用`systemd-run`创建暂时的cgroups

`systemd-run`命令可以用来创建和启动一个暂时的`service`或`scope`单元并在这个单元中运行定制的命令。命令在`service`单元中执行并在后台异步启动，在后台服务进程是通过`systemd`进程来唤起的。通过`systemd-run`进程直接启动的在`scope`单元运行命令，会继承了调用者的执行环境，这种情况则是同步的。

要在指定cgroup中运行一个命令，以root执行如下：

```bash
systemd-run --unit=name --scope --slice=slice_name command
```

**待完善补充RHEL7文档**
