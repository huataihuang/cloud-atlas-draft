# 需求

如何

# sysemd-journal日志

* `Storage=`

> If "persistent", data will be stored preferably on disk, i.e. below the /var/log/journal hierarchy (which is created if needed), with a fallback to /run/log/journal (which is created if needed), during early boot and if the disk is not writable. "auto" is similar to "persistent" but the directory /var/log/journal is not created if needed, so that its existence controls where log data goes.

`systemd-journal`日志的存储已经考虑到了当系统重启时，实际上在磁盘就绪之前，日志是无法记录到磁盘的，所以会在内存中缓存。直到磁盘可以写入，才会将日志刷入磁盘。

这里有一个巧妙的参数`auto`，这个参数和持久化参数`persistent`效果是相同的，都是将日志存储到磁盘。但是如果磁盘目录 `/var/log/journal` 不存在，`auto`就不会创建该目录，而是将日志写入到内存文件系统`/run/log/journal`。

所以，只要将 `/var/log/journal` 改为一个软链接指向 NFS 挂载的 `/cn_nfs/` 中一个子目录 `log/journal` 。此时，系统刚启动时，NFS尚未挂载，软链接无法写入数据。

# syslog-ng日志

`/etc/syslog-ng/syslog-ng.conf` 记录了

