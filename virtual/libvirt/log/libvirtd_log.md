# 开启debug日志

libvirt可以捕获所有运行domain的stderr，对于故障排查非常有用。

daemon配置文件依赖链接的URI，`qemu:///system`:

* 打开`/etc/libvirt/libvirtd.conf`配置以下变量：

```bash
log_level = 1
log_filters="3:remote 4:event 3:json 3:rpc"
log_outputs="1:file:/var/log/libvirt/libvirtd.log"
```

> 以上配置采用了`DEBUG`模式，会打印大量的排查日志。

在生产环境中，可以采用默认的`log_level = 3`，此外，参考[Bug 920614 - decrease libvirtd log level ](https://bugzilla.redhat.com/show_bug.cgi?id=920614)，可以设置不同对象的不同日志过滤级别：

```
log_level = 3
log_filters="3:virobject 3:virfile 2:virnetlink 3:cgroup 3:event 3:json 1:libvirt 1:util 1:qemu"
log_outputs="1:file:/var/log/libvirt/libvirtd.log"
```

> 目前测试[pvpanic](../qmeu/libvirt_pvpanic)似乎发现，如果没有设置`qemu`的`DEBUG`级别日志，则[虚拟机串口控制台](../devices/vm_serial_console)不能输出信息。待进一步验证。

* 重启libvirtd服务

```bash
systemctl restart libvirtd.service
```

以上配置设置了日志级别1（debug级别），并设置过滤，例如从rpc收到日志作为warning（=level 3）和以上级别将会报告。

日志记录在`/var/log/libvirt/libvirtd.log`

如果要获取客户端日志，需要设置环境变量：

```bash
export LIBVIRT_LOG_OUTPUTS="1:file:/tmp/libvirt_client.log"
```

如果问题和domain相关，还需要查看`/var/log/libvirt/qemu/$dom.log`

# 运行时设置libvirt的debug级别

由于重启libvirt服务在线上环境是很麻烦的，特别是重启可能导致当前异常小时。所以可以通过libvirt管理API在运行状态时打开debug log。这个功能需要使用`libvirt-admin`软件包：

```
virt-admin domain-log-filters
```

默认输出

```
 Logging filters: 3:remote 4:json 4:rpc
```

修改设置成debug模式：

```
virt-admin daemon-log-filters "1:util 1:libvirt 1:storage 1:network 1:nodedev 1:qemu"
```

此外还可以修改日志输出位置：

```
virt-admin daemon-log-outputs
```

默认设置：

```
Logging outputs: 3:syslog:libvirtd
```

可以修改日志输出位置：

```
virt-admin daemon-log-outputs "1:file:/var/log/libvirt/libvirtd.log"
```

要去除任何日志记录（不建议这样设置），可以使用

```
# virt-admin daemon-log-filters ""
 Logging filters: 
```

也可设置不使用日志文件而改为使用journal 日志

```
# virt-admin daemon-log-outputs
 Logging outputs: 1:file:/var/log/libvirt/libvirtd.log
# virt-admin daemon-log-outputs ""
 Logging outputs: 2:journald
```

# 参考

* [libvirt DebugLogs](https://wiki.libvirt.org/page/DebugLogs)
* [Logging in the library and the daemon](https://libvirt.org/logging.html)