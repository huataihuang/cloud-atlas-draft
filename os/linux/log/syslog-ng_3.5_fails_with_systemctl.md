尝试`strace`方法跟踪启动时候的库调用

```
strace /usr/sbin/syslog-ng -F -p /var/run/syslog-ng.pid
```

结果发现最后出现的问题可能和`NSCD` service for DNS有关

```
open("/etc/resolv.conf", O_RDONLY|O_CLOEXEC) = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=91, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f30b584e000
read(7, "options timeout:2 attempts:2\nsea"..., 4096) = 91
read(7, "", 4096)                       = 0
close(7)                                = 0
munmap(0x7f30b584e000, 4096)            = 0
socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 7
connect(7, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (No such file or directory)
close(7)                                = 0
socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 7
connect(7, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (No such file or directory)
close(7)                                = 0
open("/etc/host.conf", O_RDONLY|O_CLOEXEC) = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=9, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f30b584e000
read(7, "multi on\n", 4096)             = 9
read(7, "", 4096)                       = 0
close(7)                                = 0
munmap(0x7f30b584e000, 4096)            = 0
futex(0x7f30b3baca70, FUTEX_WAKE_PRIVATE, 2147483647) = 0
open("/etc/hosts", O_RDONLY|O_CLOEXEC)  = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=87, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f30b584e000
read(7, "127.0.0.1 localhost localhost.lo"..., 4096) = 87
read(7, "", 4096)                       = 0
close(7)                                = 0
munmap(0x7f30b584e000, 4096)            = 0
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=34586, ...}) = 0
mmap(NULL, 34586, PROT_READ, MAP_PRIVATE, 7, 0) = 0x7f30b5804000
close(7)                                = 0
open("/lib64/libnss_dns.so.2", O_RDONLY|O_CLOEXEC) = 7
read(7, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\0\21\0\0\0\0\0\0"..., 832) = 832
fstat(7, {st_mode=S_IFREG|0755, st_size=27512, ...}) = 0
mmap(NULL, 2117888, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 7, 0) = 0x7f30af50f000
mprotect(0x7f30af514000, 2093056, PROT_NONE) = 0
mmap(0x7f30af713000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 7, 0x4000) = 0x7f30af713000
close(7)                                = 0
mprotect(0x7f30af713000, 4096, PROT_READ) = 0
munmap(0x7f30b5804000, 34586)           = 0
write(2, "Error resolving hostname; host='"..., 34Error resolving hostname; host=''
) = 34
write(2, "Error initializing message pipel"..., 37Error initializing message pipeline;
) = 37
close(5)                                = 0
munmap(0x7f30b580d000, 16384)           = 0
unlink("/var/lib/syslog-ng/syslog-ng.persist-") = 0
exit_group(2)                           = ?
+++ exited with 2 +++
```

[5 simple ways to troubleshoot using Strace](http://hokstad.com/5-simple-ways-to-troubleshoot-using-strace) 恰好也有一个strace的案例是调试连接服务器问题的，和目前的情况类似。

[Troubleshooting and debugging syslog-ng](https://pzolee.blogs.balabit.com/2009/12/troubleshooting-and-debugging-syslog-ng/)提供了一些debug的建议：

* 使用debug方式启动`syslog-ng -Fevd`可以查看详细日志
* 使用`strace`进行跟踪 `strace -s 256 -f syslog-ng` （这个方法即上述使用）
* 如果出现crash，可以使用 `syslog-ng -F –enable-core` (也可以使用环境变量 `ulimit -c unlimited`)。不过，对于有core文件，并且`syslog-ng`是使用了`--enable-debug`编译的，则可以使用`gdb`进行调试（[gdb documentation](http://www.gnu.org/software/gdb/documentation/)）
* 可以使用logger发送日志给`/dev/log`，例如`logger “message part”`
* 远程发送日志的方法：
  * 本地启用命令 `logger -r 10 -i -s 300 -I 2 10.30.0.32 9999`，远程则启动`nc`监听：`nc -lp 9999`

```
gdb syslog-ng core
```

> 注意：`syslog-ng -V`应该有`Enable-Debug: on`才表示编译的时候激活了debug


`connect(7, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (No such file or directory)`表示尝试连接`/var/run/nscd/socket`，这个`NSCD`是Name Service Cache Daemon，通常用于响应NIS，YP, LDAP或类似名字查询的目录协议。

连接`NSCD`失败后，下一步显示服务转向读取`/etc/host.conf`配置，可以看到如下信息

```
open("/etc/host.conf", O_RDONLY|O_CLOEXEC) = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=9, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f30b584e000
read(7, "multi on\n", 4096)             = 9
read(7, "", 4096)                       = 0
close(7)                                = 0
munmap(0x7f30b584e000, 4096)            = 0
```

检查了一下`/etc/host.conf`配置确实只有一行

```
multi on
```

然后读取的是`/etc/hosts`

```
open("/etc/hosts", O_RDONLY|O_CLOEXEC)  = 7
fstat(7, {st_mode=S_IFREG|0644, st_size=87, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f30b584e000
read(7, "127.0.0.1 localhost localhost.lo"..., 4096) = 87
read(7, "", 4096)                       = 0
close(7)                                = 0
munmap(0x7f30b584e000, 4096)            = 0
```

但是，只看到后来有打开`/etc/ld.so.cache`和`/lib64/libnss_dns.so.2`，但是没有看到查询DNS（例如连接DNS服务器端口53的记录）

比较奇怪，我找了线上另外一个集群，同样也没有对服务器的IP地址做正向和反向的DNS解析，但是这个集群的`syslog-ng`服务却能够正常启动

```
root     32215  0.0  0.0 100504  4512 ?        Ss   23:02   0:00 /usr/sbin/syslog-ng -F -p /var/run/syslogd.pid
```

`man syslog-ng`说明`-F`参数表示非`daemon`运行，是`foreground`运行模式。

我同样使用`strace /usr/sbin/syslog-ng -F -p /var/run/syslog-ng.pid`，惊奇地发现，这个正常服务器上启动的`sysylog-ng`居然没有去读取`/etc/host.conf`，`/etc/hosts`，并且也没有尝试对`NSCD`进行访问。

> 正常服务器上`syslog-ng`版本是`syslog-ng-3.5.6-3`；异常服务器上`syslog-ng`版本是`syslog-ng-3.5.6-5`。我也对比了两个主机的`syslog-ng.conf`配置完全一致。

但是看到`syslog-ng.conf`配置的前面部分

```
options {
    flush_lines (0);
    time_reopen (10);
    log_fifo_size (1000);
    chain_hostnames (off);
    use_dns (no);
    use_fqdn (no);
    create_dirs (yes);
    keep_hostname (yes);
    dir_perm(0755);
    owner("root");
    group("adm");
    perm(0640);
    stats_freq(0);

};
```

其中有一个配置是`use_dns (no);`，这也就解释了为何使用`strace`排查，只看到读取了`/etc/hosts`文件，却看不到DNS解析的请求。

会不会软件版本升级以后，默认启动时候会进行一次初始化的主机名的解析，但是配置文件中设置了`use_dns (no);`，导致无法完成解析，所以失败。

尝试修改`syslog-ng.conf`的选项启动DNS，但是发现没有解决问题，报错信息相同

```
options {
    ...
    use_dns (yes);
	use_fqdn (yes);
    ...
};
```

回滚了一次`syslog-ng-3.5.6-3`，报错信息依旧。但是，我发现，如果使用`syslog-ng`安装包的初始化配置，是可以正常启动`syslog-ng`服务的。所以，导致这个异常的问题应该是：

* 自定义的`syslog-ng.conf`中有配置项比较特别，在某个特定的环境下会激活`host`查询，但是却无法完成解析导致无法启动
* 正常的集群中同样地配置，却没有host解析动作，所以绕过了这个bug
* 但是，是什么环境触发了这个问题？

注意到自定义配置中有如下

```
options {
    flush_lines (0);
    time_reopen (10);
    log_fifo_size (1000);
    chain_hostnames (off);
    use_dns (no);
    use_fqdn (no);
    create_dirs (yes);
    keep_hostname (yes);
    dir_perm(0755);
    owner("root");
    group("adm");
    perm(0640);
    stats_freq(0);

};
```

而rpm包安装的默认配置有

```
options {
    flush_lines (0);
    time_reopen (10);
    log_fifo_size (1000);
    chain_hostnames (off);
    use_dns (no);
    use_fqdn (no);
    create_dirs (no);
    keep_hostname (yes);
};
```

其中有一行`create_dirs (yes);`差异，我修改了也没有解决问题。

# 设置`syslog-ng`使用本地主机名解析

[17.3.1. Procedure – Resolving hostnames locally](https://www.balabit.com/sites/default/files/documents/syslog-ng-ose-latest-guides/en/syslog-ng-ose-guide-admin/html/example-local-dns.html)提供了设置syslog-ng的本地DNS解析方法，使用本地存储的主机名解析

```
options {
        use-dns(persist_only);
        dns-cache-hosts(/etc/hosts); };
```

不过这个方法测试设置还是没有解决

# `syslog-ng`低于3.2.5版本需要配置`unix-dgram ("/dev/log");`

* `syslog-ng` < 3.2.5 版本时会默认 `/dev/log` 是 `unix-stream`，但是`systemd`将这个设备文件作为`unix-dgram`，所以需要修改 `/etc/syslog-ng/syslog-ng.conf`

```
...
 source s_sys {
  file ("/proc/kmsg" program_override("kernel: "));
- unix-stream ("/dev/log");
+ unix-dgram ("/dev/log");
  internal();
  # udp(ip(0.0.0.0) port(514));
 };
...
```

如果没有上述修订配置，启动`syslog-ng`会出现以下报错信息

```
May 07 17:26:15 superserver.company.corp systemd[1]: Starting Syslog Socket.
May 07 17:26:15 superserver.company.corp systemd[1]: Listening on Syslog Socket.
May 07 17:26:15 superserver.company.corp systemd[1]: Starting System Logger Daemon...
May 07 17:26:15 superserver.company.corp systemd[1]: syslog-ng.service: main process exited, code=exited, status=2/INVALIDARGUMENT
May 07 17:26:15 superserver.company.corp systemd[1]: Failed to start System Logger Daemon.
May 07 17:26:15 superserver.company.corp systemd[1]: Unit syslog-ng.service entered failed state.
May 07 17:26:15 superserver.company.corp systemd[1]: syslog-ng.service holdoff time over, scheduling restart.
May 07 17:26:15 superserver.company.corp systemd[1]: Stopping System Logger Daemon...
May 07 17:26:15 superserver.company.corp systemd[1]: Starting System Logger Daemon...
May 07 17:26:15 superserver.company.corp systemd[1]: syslog-ng.service: main process exited, code=exited, status=2/INVALIDARGUMENT
```

开启debug模式会看到如下报错

```
May 08 10:31:29 server.corp systemd[1]: Starting System Logger Daemon...
May 08 10:31:29 server.corp systemd[1]: About to execute: /usr/sbin/syslog-ng -F -p /var/run/syslogd.pid
May 08 10:31:29 server.corp systemd[1]: Forked /usr/sbin/syslog-ng as 3121
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service changed dead -> start
May 08 10:31:29 server.corp systemd[1]: Set up jobs progress timerfd.
May 08 10:31:29 server.corp systemd[1]: Set up idle_pipe watch.
May 08 10:31:29 server.corp systemd[3121]: Executing: /usr/sbin/syslog-ng -F -p /var/run/syslogd.pid
May 08 10:31:29 server.corp systemd[1]: Got notification message for unit syslog-ng.service
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service: Got message
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service: got STATUS=Starting up... (Fri May  8 10:31:29 2015
May 08 10:31:29 server.corp systemd[1]: Got notification message for unit syslog-ng.service
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service: Got message
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service: got STATUS=Starting up... (Fri May  8 10:31:29 2015
May 08 10:31:29 server.corp systemd[1]: Received SIGCHLD from PID 3121 (syslog-ng).
May 08 10:31:29 server.corp systemd[1]: Child 3121 (syslog-ng) died (code=exited, status=2/INVALIDARGUMENT)
May 08 10:31:29 server.corp systemd[1]: Child 3121 belongs to syslog-ng.service
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service: main process exited, code=exited, status=2/INVALIDARGUMENT
May 08 10:31:29 server.corp systemd[1]: syslog-ng.service changed start -> failed
May 08 10:31:29 server.corp systemd[1]: Job syslog-ng.service/start finished, result=failed
May 08 10:31:29 server.corp systemd[1]: Failed to start System Logger Daemon. 
```

# 参考

* [Systemd and syslog-ng interaction problems: system freezes / syslog-ng fails to start](https://fedoraproject.org/wiki/Common_F16_bugs#systemd-syslog-ng-problems)
* [syslog-ng service not starting with systemd but command works fine](http://unix.stackexchange.com/questions/202044/syslog-ng-service-not-starting-with-systemd-but-command-works-fine)
* [Troubleshooting and debugging syslog-ng](https://pzolee.blogs.balabit.com/2009/12/troubleshooting-and-debugging-syslog-ng/) - 这个博客的作者是匈牙利的BalaBit公司的测试开发工程师，在开发syslog-ng Premium Edition的syslog-ng团队负责测试工作，主要工作就是测试syslog-ng和syslog-ng agent。博客中有大量有关log服务器的测试和调试经验分享
* [5 simple ways to troubleshoot using Strace](http://hokstad.com/5-simple-ways-to-troubleshoot-using-strace)