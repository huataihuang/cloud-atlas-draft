* 创建一个`mpiggroup`（名字随意），并设置内存限制（例如50GB）

```
cgcreate -g memory,cpu:mpigroup
cgset -r memory.limit_in_bytes=$((50*1024*1024*1024)) mpigroup
```

* 如果进程在运行，则将这个运行进行加入到cgroup

```
cgclassify -g memory,cpu:mpicgroup $(pidof mpiexec)
```

* 如果是启动进程，则使用`cgexec`

```
cgexec -g memory,cpu:mpigroup mpiexec COMMAND
```

> `cgexec` 有一个 `--sticky` 参数：如果使用`--sticky`，则`cgred`服务（是`cgrulesengd`进程）就不会更改执行命令进程和它的子进程。这样不仅启动的命令会按照`cgexec`指定的cgroup运行，这个命令启动的子命令也会继承`cgexec`指定的cgroup。这样即使和`cgrules.conf`配置冲突（`cgred`服务使用的配置）也不影响。
>
> 否则，虽然`cgexec`启动的命令可以指定cgroup，但是命令启动的子进程就会收到`cgrules.conf`配置的限制，而不是启动时候`cgexec`指定的cgroup。
>
> 参考 `man cgexec`

> 同样，`cgclassify`也是有一个`--sticky`，使用方法相同，即使用`--sticky`时，可以避免`cgrules.conf`影响作用于进程和子进程。

`注意`：

`cgclassify`和`cgset`也可以不实用任何参数，即不使用`-g memory,cpu:mpicgroup`，此时是`cgred`服务会作用于进程，按照`cgrules.conf`配置来调整进程，所以也是非常方便的。

# 参考

* [How to set a memory limit for a specific process?](http://askubuntu.com/questions/510913/how-to-set-a-memory-limit-for-a-specific-process)