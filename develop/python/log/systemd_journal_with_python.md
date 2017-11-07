当systemd逐渐成为Linux主流操作系统服务管理器之后，也带来了全新的journal日志体系。通过systemd journal可以实现复杂而灵活的日志过滤和检查，简化了以往需要通过复杂且不同实现的日志处理编程。

> 通过 Python 结合 systemd journal 来实现高效灵活的日志处理。
>
> 传统Linux系统的日志处理`或许`可以通过[Python's Watchdog模块实现文件系统变化触发操作](../../filesystem/python_watchdog_monitor_change_of_filesystem)
>
> 虚拟化Libvirt的日志处从从0.10.0开始采用了systemd journal（如果`/run/systemd/journal/socket`存在），详细参考[libvirt日志](../../../virtual/libvirt/log/libvirtd_log)


# 参考

* [How to tail log entries through the systemd journal using Python](https://www.g-loaded.eu/2016/11/26/how-to-tail-log-entries-through-the-systemd-journal-using-python/)