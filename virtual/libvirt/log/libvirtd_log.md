# 开启debug日志

libvirt可以捕获所有运行domain的stderr，对于故障排查非常有用。

daemon配置文件依赖链接的URI，`qemu:///system`:

* 打开`/etc/libvirt/libvirtd.conf`配置以下变量：

```bash
log_level = 1
log_filters="3:remote 4:event 3:json 3:rpc"
log_outputs="1:file:/var/log/libvirt/libvirtd.log"
```

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

# 参考

* [libvirt DebugLogs](https://wiki.libvirt.org/page/DebugLogs)
* [Logging in the library and the daemon](https://libvirt.org/logging.html)