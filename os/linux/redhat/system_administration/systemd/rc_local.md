在早期的操作系统中，系统管理员很喜欢把一些操作系统启动时最后需要运行的脚本写在 `/etc/rc.local` 中，这个执行脚本（需要具有可执行属性）是操作系统启动时最后执行的启动脚本。

切换到RHEL/CentOS 7之后，`systemd`接管了`init`模式的启动脚本，实际上已经不再适合使用`rc.local`启动脚本。但是为了兼容一些老系统习惯，保留了一个称为 `rc.lcoal.service` 的服务来引用 `/etc/rc.local`。

# `rc.local`执行结果不一致问题排查

CentOS 7操作系统测试服务器，在`/etc/rc.local`中有2条指令分别设置CPU p-state governor：

```
x86_energy_perf_policy performance
cpupower frequency-set -g powersave
```

> 上述`rc.local`脚本仅作为测试案例，非真实使用。

但是启动后检查 `cpupower frequency-info` 输出显示，CPU governor 有时候显示`performance`，有时候又显示为`powersave`。

按照`rc.local`脚本内容执行顺序，`powersave`应该覆盖`performance`，最终得到结果预期是`powersave`。但是偶然也出现`performance`生效，这说明还有其他设置在起作用，

* 检查`rc.local`服务状态

```
#systemctl status rc.local
● rc.local.service
   Loaded: not-found (Reason: No such file or directory)
   Active: inactive (dead)
```

* 检查`/var/log/messages`日志，其中显示有：

```
Jun 13 17:48:47 server.example.com systemd[1]: Starting /etc/rc.d/rc.local Compatibility...
```

这表明操作系统启动时执行了`rc.local`兼容模式

* 注意，系统日志中还显示在执行`rc.local`同时还执行了`Configure CPU power related settings`：

```
Jun 13 17:48:47 server.example.com systemd[1]: Started /etc/rc.d/rc.local Compatibility.
Jun 13 17:48:47 server.example.com systemd[1]: Started Configure CPU power related settings.
```

由于`systemd`为了加速系统启动，执行启动服务采用了并行模式，所以对于没有依赖关系的服务，启动先后顺序是不可预知的。这就带来了一个问题，同时有多处执行`cpupower`策略设置，如果配置相互矛盾，则执行结果不可预知。

> 通过`stat /var/lock/subsys/local`可以查看到`rc.local`执行的详细时间（该文件是`rc.local`执行时`touch`的文件可作为执行时间戳），对比`systemctl status cpupower`就可以看到是同一秒执行的两个程序，导致`cpupower frequency-set -g <governor>`结果不可控。

## 排查

* 在RHEL/CentOS 7平台是通过[systemd管理cpupower](cpupower)，该服务读取了`/etc/sysconfig/cpupower`环境配置文件来设置CPU governor
* `systemd`配置了`rc-local.service`兼容以往RHEL5/6的启动脚本`/etc/rc.d/rc.local`，但是`systemd`启动脚本是采用并行方式，所以`rc.local.service`和`cpupower.service`执行的先后顺序不固定

```
rc-local.service                                       loaded active exited    /etc/rc.d/rc.local Compatibility
```

* 如果在`rc.local`中配置了和`cpupower.service`配置的`governor`不一致的设置，则不能保证正确执行 - 后执行的脚本设置将覆盖前一个脚本设置。

# 参考

* [How to Enable /etc/rc.local with Systemd](https://www.linuxbabe.com/linux-server/how-to-enable-etcrc-local-with-systemd)