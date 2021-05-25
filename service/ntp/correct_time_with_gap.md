在云计算环境，KVM Guest运行的操作系统在某些情况下比较容易出现时钟偏移，例如，如果qemu热升级，可能会短时间suspend住虚拟机，这会导致guest os恢复运行以后，时钟出现偏移。如果时钟偏移较大，由于ntpd服务是步进方式修正时间，所以修正过程可能会非常缓慢。

# 使用ntpdate快速校准时间

在操作系统首次启动的时候，有些发行版采用 `ntpdate` 命令快速矫正时间，然后继续启动 `ntpd` 服务确保服务器的时钟时钟准确。

我们在处理服务器时钟偏移矫正时，也可以采用类似方法。

> 需要注意：很多应用程序依赖正确的时钟，例如交易应用、加密通讯应用，当时钟差异较大，会导致会话失败；而且，如果时钟突然大幅变化，也会导致业务异常，甚至导致错乱的交易记录。所以，`ntpd`服务矫正时间是建议采用渐进步进方式校准，而不是大幅度修改系统时间。

* 检查 `/etc/ntp.conf` 配置，获取当前服务器的时钟服务器列表

```bash
cat /etc/ntp.conf | grep server
```

* 停止ntpd服务 - ntpdate和ntpd使用相同的socks，所以不能同时运行

```bash
systemctl stop ntpd
```

* 使用`ntpdate`命令矫正时间，这里使用的 `<ntp_server_ip>` 是从 `/etc/ntp.conf` 配置中查询出来的服务器地址

```bash
ntpdate <ntp_server_ip>
```

> `ntpdate` 命令支持多个ntp服务器，也就是可以同时提供多个ntp服务器地址，会自动选择最为准确的时间服务器进行同步，例如:

```bash
ntpdate 192.168.6.1 192.168.6.2 192.168.6.3
```

显示输出：

```
Mon May 24 20:59:13 CST 2021
24 May 21:00:07 ntpdate[467955]: step time server 192.168.6.1 offset 47.550589 sec
Mon May 24 21:00:07 CST 2021
```

* 以下命令将校准时间写入本地时间（可选）：

```bash
hwclock -w --localtime
```

* 以下命令恢复ntpd服务运行:

```bash
systemctl start ntpd
```

# (推荐)使用ntpdate快速校准时间

我使用上述 `ntpdate` 方法校准服务器时间，我的同事向我提了一个问题：

最好不要通过查询 `/etc/ntp.conf`  而是通过一条命令就能更新时钟。因为每个机房都有自己的时钟服务器，要分析配置文件找本地机房时钟服务器逻辑复杂不好维护脚本。最好通过一个全局域名（`dns view`）之类的，一个域名（或ip）就能够更新时钟。

这个问题促使我查询并学习了一些有关NTP的资料，发现原来 `ntpd` 服务其实是提供了直接校准时间的命令参数的，只是我们平时都是配置了ntpd服务持续维持正确时间，而忽视了这个功能参数。

通常情况下 `ntpd` 对于时钟的校准是缓慢步进方式的，所以对于时钟差异较大的时间调整非常缓慢。此外，如果是服务器启动时的主机时钟(由计算机内集成的`time-of-year` 芯片，也称为TOY芯片，维持关闭时期的时间)和ntp服务器时间差异超过`1000s`，则ntpd认为出现非常错误，ntpd会自动退出并发出紧急消息。

不过，ntpd也提供了一个快速校准时钟的参数 `-g` ，这个参数会忽略TOY芯片时间，并且直接将时钟设置为ntp服务器时间。注意，一旦时钟设置，大于1000s的时钟差异错误依然会让ntpd退出。

为了能够快速正确校准时钟，同时让ntpd服务在校准时钟之后立即退出(方便我们再次以daemon方式运行ntpd)，我们通常会结合 `-q`参数来使用 `-g`参数，也就是 `ntpd -gq`，这样通过ntpd命令校准时间后自然退出，我们就可以在正确的时钟情况下，重新启动 ntpd服务来维护主机时钟。

举例：

* 首先我们停止ntpd服务，然后将时间调整错误值

```bash
systemctl stop ntpd
date
```

* 使用 `date` 命令检查当前正确时间

```
Tue May 25 14:22:29 CST 2021
```

* 使用 `date -s` 命令设置一个错误时间

```basg
date -s "2 May 2021 1:1:1"
```

此时显示系统时间被调整成错误时间:

```
Sun May  2 01:01:01 CST 2021
```

* 执行时钟校准命令 - 这个命令不需要指定ntp服务器，服务器配置是从 `/etc/ntp.conf` 配置中读取的

```bash
ntpd -gq
```

此时可以看到`ntpd`服务启动并设置时间，然后自然退出:

```
 2 May 01:01:13 ntpd[15472]: ntpd 4.2.8p10@1.3728-o Thu May 18 14:01:20 UTC 2017 (1): Starting
 2 May 01:01:13 ntpd[15472]: Command line: ntpd -gq
 2 May 01:01:13 ntpd[15472]: proto: precision = 0.112 usec (-23)
 2 May 01:01:13 ntpd[15472]: switching logging to file /var/log/ntp.log
 2 May 01:01:13 ntpd[15472]: Listen and drop on 0 v6wildcard [::]:123
 2 May 01:01:13 ntpd[15472]: Listen and drop on 1 v4wildcard 0.0.0.0:123
 2 May 01:01:13 ntpd[15472]: Listen normally on 2 lo 127.0.0.1:123
 2 May 01:01:13 ntpd[15472]: Listen normally on 3 eth0 192.168.6.201:123
 2 May 01:01:13 ntpd[15472]: Listening on routing socket on fd #20 for interface updates
25 May 14:24:15 ntpd[15472]: ntpd: time set +2035372.774127 s
ntpd: time set +2035372.774127s
```

* 再次 `date` 检查时间就可以看到正确时钟

```
Tue May 25 14:24:22 CST 2021
```

* 然后我们就可以启动ntpd服务以便维护好系统准确时间

```
systemctl start ntpd
```

# 参考

* [Red Hat Enterprise Linux 6 Deployment Guide: 2.2.2. NETWORK TIME PROTOCOL SETUP](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/sect-date_and_time_configuration-command_line_configuration-network_time_protocol)
* [Linux Set Date and Time From a Command Prompt](https://www.cyberciti.biz/faq/howto-set-date-time-from-linux-command-prompt/)
* [How to force a clock update using ntp?](https://askubuntu.com/questions/254826/how-to-force-a-clock-update-using-ntp)