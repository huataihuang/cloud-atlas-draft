# 需求

为了能够集中管理，通常我们会采用 syslog 的网络模式，将日志通过网络传输给集中的日志服务器进行存储。

不过，我想尝试一下，是否能够通过NFS这样的共享存储，将日志文件集中存储。

# sysemd-journal日志

* `Storage=`

> If "persistent", data will be stored preferably on disk, i.e. below the /var/log/journal hierarchy (which is created if needed), with a fallback to /run/log/journal (which is created if needed), during early boot and if the disk is not writable. "auto" is similar to "persistent" but the directory /var/log/journal is not created if needed, so that its existence controls where log data goes.

`systemd-journal`日志的存储已经考虑到了当系统重启时，实际上在磁盘就绪之前，日志是无法记录到磁盘的，所以会在内存中缓存。直到磁盘可以写入，才会将日志刷入磁盘。

这里有一个巧妙的参数`auto`，这个参数和持久化参数`persistent`效果是相同的，都是将日志存储到磁盘。但是如果磁盘目录 `/var/log/journal` 不存在，`auto`就不会创建该目录，而是将日志写入到内存文件系统`/run/log/journal`。

所以，只要将 `/var/log/journal` 改为一个软链接指向 NFS 挂载的 `/cn_nfs/` 中一个子目录 `log/journal` 。此时，系统刚启动时，NFS尚未挂载，软链接无法写入数据。此时`systemd-journal`将缓存日志在系统内存中，直到NFS存储挂载完成，目录可以写入，则日志会记录到NFS中。

注意：需要设置 `Storage=auto` 而不是 `Storage=persistent` 。因为`persistent`会在NFS尚未启动就绪时（当时还不存在 `/var/log/journal` 软链接所指向的目录）直接创建目录？

# syslog-ng日志

`/etc/syslog-ng/syslog-ng.conf` 有类似原理的配置：

```js
options {
        flush_lines (0);
        threaded(no);
        time_reopen (10);
        log_fifo_size (10000);
        chain_hostnames (no);
        use_dns (no);
        use_fqdn (yes);
        keep_hostname (yes);
        keep_timestamp(no);
        create_dirs (yes);  # 默认会创建目录
        dir_perm(0755);
        owner("root");
        group("adm");
        perm(0640);
        stats_freq(0);
};

#syslog-ng client configure,log source is only from local
source s_sys {
    system();
    internal();
};

include /etc/syslog-ng/conf.d;
include /etc/syslog-ng/remote_server.conf;

destination d_sys_cons      { file("/dev/console"); };
destination d_sys_mesg      { file("/var/log/messages"); };
destination d_sys_auth      { file("/var/log/secure"); };
destination d_sys_mail      { file("/var/log/maillog" flush_lines(10)); };
destination d_sys_spol      { file("/var/log/spooler"); };
destination d_sys_boot      { file("/var/log/boot.log"); };
destination d_sys_cron      { file("/var/log/cron"); };
destination d_sys_kern      { file("/var/log/kern"); };
destination d_sys_mlal      { file("/dev/tty0"); };
```

其中选项配置 `create_dirs (yes);` 修改成 `create_dirs (no);` 是否也能在系统启动时如果NFS没有就绪，暂时缓存在内存中，等待NFS就绪后再写入远程存储？

实践验证`create_dirs (no);`确实可以避免NFS没有就绪之前就创建子目录（而是由NFS服务器上创建好目录，输出给客户端使用）。以下是在`web-ws1`主机上配置，先挂载远程服务器的NFS输出到本地的`/nfs_share`目录，然后在NFS服务器的共享目录下为每个主机，例如这里是`web-ws1`创建`web-ws1/var/log`目录。这样`web-ws1`主机就可以把自己的系统日志存储到远程NFS服务器上（或者NAS服务器）：

```js
options {
        ...
        create_dirs (no);  # 关闭创建目录功能，避免NFS尚未就绪就在本地目录下创建目录
        ...
};
...
destination d_sys_cons      { file("/dev/console"); };
destination d_sys_mesg      { file("/nfs_share/web-ws1/var/log/messages"); };
destination d_sys_auth      { file("/nfs_share/web-ws1/var/log/secure"); };
destination d_sys_mail      { file("/nfs_share/web-ws1/var/log/maillog" flush_lines(10)); };
destination d_sys_spol      { file("/nfs_share/web-ws1/var/log/spooler"); };
destination d_sys_boot      { file("/nfs_share/web-ws1/var/log/boot.log"); };
destination d_sys_cron      { file("/nfs_share/web-ws1/var/log/cron"); };
destination d_sys_kern      { file("/nfs_share/web-ws1/var/log/kern"); };
destination d_sys_mlal      { file("/dev/tty0"); };
```

# 阅读非系统默认目录下的journal日志

对于远程存储到NFS服务器上的主机journal日志，需要使用`journalctl`工具来阅读。需要注意的是，`journalctl`如果没有指定目录或文件，默认是阅读自己系统目录。不过`journalctl`支持`-D dir`参数可以读取特定目录下日志。

# 参考

* [Howto inspect systemd system.journal from another system](https://unix.stackexchange.com/questions/199988/howto-inspect-systemd-system-journal-from-another-system)