在早期的操作系统中，系统管理员很喜欢把一些操作系统启动时最后需要运行的脚本写在 `/etc/rc.local` 中，这个执行脚本（需要具有可执行属性）是操作系统启动时最后执行的启动脚本。

切换到RHEL/CentOS 7之后，`systemd`接管了`init`模式的启动脚本，实际上已经不再适合使用`rc.local`启动脚本。但是为了兼容一些老系统习惯，保留了一个称为 `rc.lcoal.service` 的服务来引用 `/etc/rc.local`。

**`注意`** ：实际上`systemd`执行的并不是`/etc/rc.local`，而是`/etc/rc.d/rc.local`脚本，这个执行程序可以通过`sudo systemctl status rc-local`指令看到输出如下

```bash
● rc-local.service - /etc/rc.d/rc.local Compatibility
   Loaded: loaded (/usr/lib/systemd/system/rc-local.service; static; vendor preset: disabled)
   Active: active (exited) since Thu 2017-08-31 10:21:19 CST; 4 days ago

Warning: Journal has been rotated since unit was started. Log output is incomplete or unavailable.
```

如果执行`sudo systemctl status rc-local`出现如下信息

```
The unit files have no installation config (WantedBy, RequiredBy, Also, Alias
settings in the [Install] section, and DefaultInstance for template units).
This means they are not meant to be enabled using systemctl.
Possible reasons for having this kind of units are:
1) A unit may be statically enabled by being symlinked from another unit's
   .wants/ or .requires/ directory.
2) A unit's purpose may be to act as a helper for some other unit which has
   a requirement dependency on it.
3) A unit may be started when needed via activation (socket, path, timer,
   D-Bus, udev, scripted systemctl call, ...).
4) In case of template units, the unit is meant to be enabled with some
   instance name specified.
```

则编辑兼容`rc.local`的`systemd`配置文件`/usr/lib/systemd/system/rc-local.service`，其内容如下

```
[Unit]
Description=/etc/rc.d/rc.local Compatibility
ConditionFileIsExecutable=/etc/rc.d/rc.local
After=network.target

[Service]
Type=forking
ExecStart=/etc/rc.d/rc.local start
TimeoutSec=0
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

然后再次执行`sudo systemctl enable rc-local`

`/etc/rc.local`则是`/etc/rc.d/rc.local`的软链接：

```
$ls -lh /etc/rc.local
lrwxrwxrwx 1 root root 13 Jun 21 09:25 /etc/rc.local -> rc.d/rc.local
```

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

## 排查一

* 在RHEL/CentOS 7平台是通过[systemd管理cpupower](cpupower)，该服务读取了`/etc/sysconfig/cpupower`环境配置文件来设置CPU governor
* `systemd`配置了`rc-local.service`兼容以往RHEL5/6的启动脚本`/etc/rc.d/rc.local`，但是`systemd`启动脚本是采用并行方式，所以`rc.local.service`和`cpupower.service`执行的先后顺序不固定

```
rc-local.service                                       loaded active exited    /etc/rc.d/rc.local Compatibility
```

* 如果在`rc.local`中配置了和`cpupower.service`配置的`governor`不一致的设置，则不能保证正确执行 - 后执行的脚本设置将覆盖前一个脚本设置。

## 排查二

解决了上述`systemd`并发启动执行顺序问题，依然发现有某些服务器在执行`rc.local`时候出现没有执行`cpupower frequency-set -g powersave`。仔细排查发现，`/etc/rc.local`到`/etc/rc.d/rc.local`脚本的软链接被破坏，`/etc/rc.local`被替换成一个实际的文本脚本。

这个问题的引发是因为在rpm包的`SPEC`文件的`%post`段落中，采用`sed -i /powerManagement/d /etc/rc.local`修订配置文件。但是，从RHEL/CentOS 7开始，`/etc/rc.local`是一个软链接文件。

`sed`在读取文件之前不会检查文件是否是软链接，所以`sed`转换之后覆盖原文件（`sed`相当于将原文件通过流方式过滤改成，然后通过管道生成临时文件，然后删除掉原文件，再将临时文件重命名成原文件）。这就导致了如果原文件是一个软链接，就会在修改后转变成实体文件。

GNU `sed` 提供了一个`--follow-symlinks`参数，可以检测修改的是软链接，而实现对软链接指向的实体文件的修改，避免破坏软链接。

详细排查参考[如何避免sed -i破坏文件的软链接](../../../../../develop/shell/sed_awk/prevent_sed_-i_from_destroying_symlinks)

# rc.local执行报错`Exec format error` -- **`rc-local`脚本第一行必须设置解释器**

设置了 `rc.local` 只写了一句命令用于设置电源

```
echo XHC1 | sudo tee /proc/acpi/wakeup
```

之后重启并没有执行，检查`systemctl status rc-local` 显示错误如下：

```
Dec 06 08:24:54 DevStudio systemd[1]: Starting /etc/rc.local Compatibility...
Dec 06 08:24:54 DevStudio systemd[850]: rc-local.service: Failed at step EXEC spawning /etc/rc.local: Exec format error
Dec 06 08:24:54 DevStudio systemd[1]: rc-local.service: Control process exited, code=exited status=203
Dec 06 08:24:54 DevStudio systemd[1]: Failed to start /etc/rc.local Compatibility.
Dec 06 08:24:54 DevStudio systemd[1]: rc-local.service: Unit entered failed state.
Dec 06 08:24:54 DevStudio systemd[1]: rc-local.service: Failed with result 'exit-code'.
Dec 06 08:27:50 DevStudio systemd[1]: /etc/systemd/system/rc-local.service:11: Support for option SysVStartPriority= has been removed and it
```

尝试重新执行一次`systemctl restart rc-local`，然后再查看状态`systemctl status rc-local.service`依然失败。

通过`journalctl -xe`检查可以看到`systemd`执行提示`/etc/rc.local could not be executed and failed`

```
Dec 06 08:34:05 DevStudio systemd[1]: Starting /etc/rc.local Compatibility...
-- Subject: Unit rc-local.service has begun start-up
-- Defined-By: systemd
-- Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
-- 
-- Unit rc-local.service has begun starting up.
Dec 06 08:34:05 DevStudio audit[1]: SERVICE_START pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=rc-lo
Dec 06 08:34:05 DevStudio audit[7184]: ANOM_ABEND auid=1000 uid=0 gid=0 ses=2 subj=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023 pid=
Dec 06 08:34:05 DevStudio systemd[7185]: rc-local.service: Failed at step EXEC spawning /etc/rc.local: Exec format error
-- Subject: Process /etc/rc.local could not be executed
-- Defined-By: systemd
-- Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
-- 
-- The process /etc/rc.local could not be executed and failed.
-- 
-- The error number returned by this process is 8.
Dec 06 08:34:05 DevStudio systemd[1]: rc-local.service: Control process exited, code=exited status=203
Dec 06 08:34:05 DevStudio systemd[1]: Failed to start /etc/rc.local Compatibility.
-- Subject: Unit rc-local.service has failed
-- Defined-By: systemd
-- Support: https://lists.freedesktop.org/mailman/listinfo/systemd-devel
-- 
-- Unit rc-local.service has failed.
-- 
-- The result is failed.
Dec 06 08:34:05 DevStudio systemd[1]: rc-local.service: Unit entered failed state.
Dec 06 08:34:05 DevStudio systemd[1]: rc-local.service: Failed with result 'exit-code'.
```

原因参考 [The after.local.service fails to start with exec format error](https://www.suse.com/support/kb/doc/?id=7017128) 即`rc.local`必须在脚本开头设置shell解释器。我们日常已经登陆到系统shell中，所以执行没有问题。但是systemd启动时是不知道使用哪个shell来作为解释器的，所以会失败。

在`rc.local`开头添加一行`#!/bin/bash`重启验证问题解决。

# 参考

* [How to Enable /etc/rc.local with Systemd](https://www.linuxbabe.com/linux-server/how-to-enable-etcrc-local-with-systemd)