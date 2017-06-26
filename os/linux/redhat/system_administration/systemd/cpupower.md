CPU governor是调节处理器Turbo性能的策略，通过以下命令可以查看所有处理器的governor:

```
cpupower -c all frequency-info
```

> 详细的Intel Turbo Boost技术参考 [Intel Turbo Boost技术和intel_pstate](../../../kernel/cpu/intel_turbo_boost_and_pstate)

手工设置`powersave`作为目标CPU governor:

```
sudo cpupower -c all frequency-set -g powersave
```

# systemd和cpupower

RHEL/CentOS 7的`systemd`提供了`cpupower.service`配置 - `/usr/lib/systemd/system/cpupower.service` 内容如下：

```
[Unit]
Description=Configure CPU power related settings
After=syslog.target

[Service]
Type=oneshot
RemainAfterExit=yes
EnvironmentFile=/etc/sysconfig/cpupower
ExecStart=/usr/bin/cpupower $CPUPOWER_START_OPTS
ExecStop=/usr/bin/cpupower $CPUPOWER_STOP_OPTS

[Install]
WantedBy=multi-user.target
```

这个`systemd`启动服务脚本只需要创建一个软链接就可以使用:

```
systemctl enable cpupower.service
```

上述命令软件了 `/etc/systemd/system/multi-user.target.wants/cpupower.service` 到 `/usr/lib/systemd/system/cpupower.service` 的软链接。

然后可以启动服务

```
systemctl start cpupower.service
```

启动服务之后，可以通过systemd检查状态

```
systemctl status cpupower.service
```

输出显示

```
● cpupower.service - Configure CPU power related settings
   Loaded: loaded (/usr/lib/systemd/system/cpupower.service; enabled; vendor preset: disabled)
   Active: active (exited) since Tue 2017-06-13 19:06:05 CST; 1min 17s ago
  Process: 22853 ExecStart=/usr/bin/cpupower $CPUPOWER_START_OPTS (code=exited, status=0/SUCCESS)
 Main PID: 22853 (code=exited, status=0/SUCCESS)

Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 15
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 16
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 17
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 18
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 19
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 20
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 21
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 22
Jun 13 19:06:05 controller cpupower[22853]: Setting cpu: 23
Jun 13 19:06:05 controller systemd[1]: Started Configure CPU power related ...s.
Hint: Some lines were ellipsized, use -l to show in full.
```

## 配置`cpupower`

默认的CPU governor配置是`performance`，这个设置可以从`/etc/sysconfig/cpupower`环境配置文件得到：

```
# See 'cpupower help' and cpupower(1) for more info
CPUPOWER_START_OPTS="frequency-set -g performance"
CPUPOWER_STOP_OPTS="frequency-set -g ondemand"
```

即默认配置下，`cpupower.service`启动将设置`governor`为`performance`，停止时则设置`ondemand`。

> 详细的调整 CPU governor 以及设置 Intel p-state 方法，请参考 [Intel Turbo Boost技术和intel_pstate](../../../kernel/cpu/intel_turbo_boost_and_pstate)

# 参考

* [How to set CPU governor at system boot](https://blog.sleeplessbeastie.eu/2015/11/09/how-to-set-cpu-governor-at-boot/)
* [Enable cpupower.service](https://www.centos.org/forums/viewtopic.php?t=47982)