> 处理用户的一个线上虚拟机`systemd-logind`异常消耗CPU资源的异常，记录相关的排查方法以及进一步的学习。

# 异常现象

* `top`显示`systemd-logind`和`dbus-daemon`两个进程占用了接近100%的CPU资源

```
top - 18:09:08 up 39 days,  7:25,  2 users,  load average: 3.37, 3.57, 3.59
Tasks: 127 total,   3 running, 124 sleeping,   0 stopped,   0 zombie
%Cpu(s): 49.9 us, 26.5 sy,  0.1 ni, 21.5 id,  0.0 wa,  0.0 hi,  2.0 si,  0.0 st
KiB Mem :  8010880 total,   461688 free,  4174468 used,  3374724 buff/cache
KiB Swap:        0 total,        0 free,        0 used.  2324852 avail Mem 
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 1334 root      20   0  809416 608856   1396 R  99.7  7.6   0:17.46 systemd-logind
  420 dbus      20   0   30252   5144   1120 R  89.3  0.1   5198:35 dbus-daemon
 5953 admin     20   0 4320808 2.126g  11648 S  79.7 27.8 291:06.39 java
 6253 admin     20   0   84312  25208   1320 S   7.0  0.3  18:10.09 tengine
 6252 admin     20   0   86360  24716   1320 S   6.0  0.3  18:19.18 tengine
   17 root      20   0       0      0      0 S   5.7  0.0 194:55.55 rcuos/3
```

* ssh登陆非常缓慢，并且登陆后`sudo`切换账号也非常缓慢(虽然vm的cpu分配了8个，从负载看还是有比较充裕的计算资源)

# 排查

## 检查服务

* 观察到上述`systemd-logind`和`dbus-daemon`负载过高，观察这两个进程的堆栈

```
[root@cms-metrichub011193080188.cm3 /proc/1334]
#cat /proc/1334/stack 
[<ffffffffffffffff>] 0xffffffffffffffff

[root@cms-metrichub011193080188.cm3 /proc/1334]
#cat /proc/420/stack 
[<ffffffff81223ace>] ep_poll+0x23e/0x360
[<ffffffff81224bcd>] SyS_epoll_wait+0xed/0x120
[<ffffffff8163dd09>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

* 检查`dbus`服务

```
systemctl status dbus
```

可以安康到服务启动运行状态

```
● dbus.service - D-Bus System Message Bus
   Loaded: loaded (/usr/lib/systemd/system/dbus.service; static; vendor preset: disabled)
   Active: active (running) since Fri 2017-12-01 10:43:49 CST; 1 months 8 days ago
 Main PID: 420 (dbus-daemon)
   CGroup: /system.slice/dbus.service
           └─420 /bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation

Jan 09 18:18:47 cms-metrichub011193080188.cm3 dbus-daemon[420]: dbus[420]: [system] Successfully activated service 'org.free...in1'
...
```

* 检查`systemd-logind`服务

```
systemctl status systemd-logind
```

也是启动运行状态

```
● systemd-logind.service - Login Service
   Loaded: loaded (/usr/lib/systemd/system/systemd-logind.service; static; vendor preset: disabled)
   Active: active (running) since Tue 2018-01-09 18:22:49 CST; 44s ago
     Docs: man:systemd-logind.service(8)
           man:logind.conf(5)
           http://www.freedesktop.org/wiki/Software/systemd/logind
           http://www.freedesktop.org/wiki/Software/systemd/multiseat
 Main PID: 4900 (systemd-logind)
   CGroup: /system.slice/systemd-logind.service
           └─4900 /usr/lib/systemd/systemd-logind

Jan 09 18:22:49 cms-metrichub011193080188.cm3 systemd[1]: Starting Login Service...
Jan 09 18:22:49 cms-metrichub011193080188.cm3 systemd[1]: Started Login Service.
Jan 09 18:22:49 cms-metrichub011193080188.cm3 systemd-logind[4900]: New seat seat0.
Jan 09 18:22:50 cms-metrichub011193080188.cm3 systemd-logind[4900]: Watching system buttons on /dev/input/event0 (Power Button)
```

## 检查journel日志

`systemd`提供了非常好的日志检查功能命令`journalctl`

* `journalctl`

检查journel日志，发现有大量的 `systemd-logind.service watchdog timeout` 以及 `pam_systemd` 创建会话时没有从消息总线接收到响应

```
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: systemd-logind.service watchdog timeout (limit 1min)!
Jan 09 18:14:46 cms-metrichub011193080188.cm3 su[2843]: pam_systemd(su:session): Failed to create session: Message did not receive a reply (timeout by message bus)
Jan 09 18:14:46 cms-metrichub011193080188.cm3 su[2809]: pam_systemd(su:session): Failed to create session: Message did not receive a reply (timeout by message bus)

Jan 09 18:14:46 cms-metrichub011193080188.cm3 su[2813]: pam_systemd(su:session): Failed to create session: Message did not receive a reply (timeout by message bus)
Jan 09 18:14:46 cms-metrichub011193080188.cm3 su[2796]: pam_systemd(su:session): Failed to create session: Message did not receive a reply (timeout by message bus)
```

* 通过`journalctl`检查系统日志可以看到 `systemd-logind.service`主进程被杀死重启

```
Jan 09 18:14:46 cms-metrichub011193080188.cm3 dbus[420]: [system] Activating via systemd: service name='org.freedesktop.login1' unit='dbus-org.freedesktop.login1.service'
Jan 09 18:14:46 cms-metrichub011193080188.cm3 dbus-daemon[420]: dbus[420]: [system] Activating via systemd: service name='org.freedesktop.login1' unit='dbus-org.freedesktop.login1.service'
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: systemd-logind.service: main process exited, code=killed, status=6/ABRT
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: Unit systemd-logind.service entered failed state.
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: systemd-logind.service failed.
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: systemd-logind.service has no holdoff time, scheduling restart.
...
Jan 09 18:14:46 cms-metrichub011193080188.cm3 dbus[420]: [system] Successfully activated service 'org.freedesktop.login1'
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd-logind[2899]: New seat seat0.
Jan 09 18:14:46 cms-metrichub011193080188.cm3 systemd[1]: Started Login Service.
Jan 09 18:14:46 cms-metrichub011193080188.cm3 dbus-daemon[420]: dbus[420]: [system] Successfully activated service 'org.freedesktop.login1'
...
```

`注意`：这里可以看到`systemd-logind.service`主进程被杀死，并且不断被`systemd`再次启动。那么我们需要佩查为何操作系统要杀死`systemd-logind`。

* 持续观察针对某个服务的日志

`journalctl`提供了指定服务的日志观察方法：

```
journalctl -u systemd-logind -f
```

这样可以只观察`systmed-logind`服务日志。

* 由于观察到`systemd-logind`不断重启，我们来观察重启的规律：

```
journalctl -u systemd-logind | grep restart
```

可以看到每分钟都出现一次`systemd-logind`服务被杀死重启：

```
Jan 06 03:50:52 my-server.com systemd[1]: systemd-logind.service has no holdoff time, scheduling restart.
Jan 06 03:51:53 my-server.com systemd[1]: systemd-logind.service has no holdoff time, scheduling restart.
Jan 06 03:52:53 my-server.com systemd[1]: systemd-logind.service has no holdoff time, scheduling restart.
...
```

* 开启`journalctl -f`动态查看日志，发现这个系统内存不足，导致不断有`java`和`tengine`和`systemd-logind`进程被oom杀死：

```
Jan 10 10:44:40 my-server.com kernel: java invoked oom-killer: gfp_mask=0x42d0, order=3, oom_score_adj=0
Jan 10 10:44:40 my-server.com kernel: java cpuset=/ mems_allowed=0
Jan 10 10:44:40 my-server.com kernel: CPU: 3 PID: 31611 Comm: java Tainted: G           OE  ------------   3.10.0-327.ali2000.alios7.x86_64 #1
Jan 10 10:44:40 my-server.com kernel: Hardware name: Alibaba Cloud Alibaba Cloud ECS, BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
Jan 10 10:44:40 my-server.com kernel:  ffff880149d0a2b0 00000000356107b0 ffff8800787bb8b0 ffffffff8162d5d1
Jan 10 10:44:40 my-server.com kernel:  ffff8800787bb940 ffffffff81628571 ffff880230a72600 ffff880230a72618
Jan 10 10:44:40 my-server.com kernel:  0000000000000202 ffff880149d0a2b0 ffff8800787bb928 ffffffff81122d2f
Jan 10 10:44:40 my-server.com kernel: Call Trace:
Jan 10 10:44:40 my-server.com kernel:  [<ffffffff8162d5d1>] dump_stack+0x19/0x1b
Jan 10 10:44:40 my-server.com kernel:  [<ffffffff81628571>] dump_header+0x8e/0x214
Jan 10 10:44:40 my-server.com kernel:  [<ffffffff81122d2f>] ? delayacct_end+0x8f/0xb0
Jan 10 10:44:40 my-server.com kernel:  [<ffffffff811674de>] oom_kill_process+0x24e/0x3b0
```

> 仔细检查发现`systemd-logind`内存泄漏非常快，从top上查看，很快就达到了2G，导致被oom杀掉

# 使用valgrind排查内存泄漏

`systemd-logind`位于`/usr/lib/systemd`目录下，采用以下脚本替换

* `check_systemd-logind`:

```bash
#!/bin/sh
exec /bin/valgrind --leak-check=full --log-file=/var/log/systemd-logind-valgrind.out /usr/lib/systemd/systemd-logind.bin
```

* 安装

```
chmod 755 /usr/lib/systemd/check_systemd-logind
mv /usr/lib/systemd/systemd-logind /usr/lib/systemd/systemd-logind.bin
mv /usr/lib/systemd/check_systemd-logind /usr/lib/systemd/systemd-logind
```

* 回退

```
mv /usr/lib/systemd/systemd-logind /usr/lib/systemd/check_systemd-logind
mv /usr/lib/systemd/systemd-logind.bin /usr/lib/systemd/systemd-logind
```

但是日志显示：

```
==3108== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward et al.
==3108== Using Valgrind-3.10.0 and LibVEX; rerun with -h for copyright info
==3108== Command: /usr/lib/systemd/systemd-logind.bin
==3108== Parent PID: 1
==3108== 
--3108-- WARNING: unhandled syscall: 318
--3108-- You may be able to write your own handler.
--3108-- Read the file README_MISSING_SYSCALL_OR_IOCTL.
--3108-- Nevertheless we consider this a bug.  Please report
--3108-- it at http://valgrind.org/support/bug_reports.html.
```

> 暂时没有找到排查方法

# systemd的一些排查方法

systemd提供了一个非常好的工具可以观察cgroup的资源使用

```
systemd-cgtop
```

以下观察到内存使用从6.8G突然降低到4.0G是因为`systemd-logind`被oom-kill导致：

```
Path                                                                                                            Tasks   %CPU   Memory  Input/s Output/s

/                                                                                                                 143  235.3     6.8G        -        -
/system.slice/aliyun.service                                                                                        1      -        -        -        -
/system.slice/crond.service                                                                                         4      -        -        -        -
/system.slice/dbus.service                                                                                          1      -        -        -        -
/system.slice/mcelog.service                                                                                        1      -        -        -        -
/system.slice/ntpd.service                                                                                          1      -        -        -        -
/system.slice/polkit.service                                                                                        1      -        -        -        -
/system.slice/sshd.service                                                                                         27      -        -        -        -
/system.slice/staragentctl.service                                                                                 10      -        -        -        -
/system.slice/syslog-ng.service                                                                                     1      -        -        -        -
/system.slice/system-getty.slice/getty@tty1.service                                                                 1      -        -        -        -
/system.slice/system-serial\x2dgetty.slice/serial-getty@ttyS0.service                                               1      -        -        -        -
/system.slice/systemd-journald.service                                                                              1      -        -        -        -
/system.slice/systemd-logind.service                                                                                1      -        -        -        -
/user.slice/user-0.slice/session-c29.scope                                                                          2      -        -        -        -
/user.slice/user-0.slice/session-c50.scope                                                                          1      -        -        -        -
/user.slice/user-0.slice/session-c936522.scope                                                                      7      -        -        -        -
/user.slice/user-1000.slice/session-11.scope                                                                        1      -        -        -        -
/user.slice/user-125509.slice/session-59063.scope                                                                   2      -        -        -        -

Path                                                                                                            Tasks   %CPU   Memory  Input/s Output/s

/                                                                                                                 138  281.5     4.0G        -        -
/system.slice/aliyun.service                                                                                        1      -        -        -        -
/system.slice/crond.service                                                                                         1      -        -        -        -
/system.slice/dbus.service                                                                                          1      -        -        -        -
/system.slice/mcelog.service                                                                                        1      -        -        -        -
/system.slice/ntpd.service                                                                                          1      -        -        -        -
/system.slice/polkit.service                                                                                        1      -        -        -        -
/system.slice/sshd.service                                                                                         27      -        -        -        -
/system.slice/staragentctl.service                                                                                  7      -        -        -        -
/system.slice/syslog-ng.service                                                                                     1      -        -        -        -
/system.slice/system-getty.slice/getty@tty1.service                                                                 1      -        -        -        -
/system.slice/system-serial\x2dgetty.slice/serial-getty@ttyS0.service                                               1      -        -        -        -
/system.slice/systemd-journald.service                                                                              1      -        -        -        -
/system.slice/systemd-logind.service                                                                                1      -        -        -        -
/user.slice/user-0.slice/session-c29.scope                                                                          2      -        -        -        -
/user.slice/user-0.slice/session-c50.scope                                                                          1      -        -        -        -
/user.slice/user-0.slice/session-c936522.scope                                                                      7      -        -        -        -
/user.slice/user-1000.slice/session-11.scope                                                                        1      -        -        -        -
/user.slice/user-125509.slice/session-59063.scope                                                                   2      -        -        -        -
```

* `systemd-analyze dump`提供了dump信息

```
> Unit session-c109165.scope:
        Description: Session c109165 of user root
        Instance: n/a
        Unit Load State: loaded
        Unit Active State: active
        Inactive Exit Timestamp: Tue 2017-12-05 08:38:56 CST
        Active Enter Timestamp: Tue 2017-12-05 08:38:56 CST
        Active Exit Timestamp: n/a
        Inactive Enter Timestamp: n/a
        GC Check Good: yes
        Need Daemon Reload: no
        Transient: yes
        Slice: user-0.slice
        CGroup: /user.slice/user-0.slice/session-c109165.scope
        CGroup realized: no
        CGroup mask: 0x0
        CGroup members mask: 0x0
        Name: session-c109165.scope
        DropIn Path: /run/systemd/system/session-c109165.scope.d/50-After-systemd-logind\x2eservice.conf
        DropIn Path: /run/systemd/system/session-c109165.scope.d/50-After-systemd-user-sessions\x2eservice.conf
        DropIn Path: /run/systemd/system/session-c109165.scope.d/50-Description.conf
        DropIn Path: /run/systemd/system/session-c109165.scope.d/50-SendSIGHUP.conf
        DropIn Path: /run/systemd/system/session-c109165.scope.d/50-Slice.conf
        Condition Timestamp: Tue 2017-12-05 08:38:56 CST
```

检查了CentOS的版本，发现原来alios 7.2已经把最新的CentOS 7.4所用的systemd版本backport回来的，最新的systemd版本就是 `systemd-219-42.el7_4.4.x86_64.rpm`

# 通过strace排查

* strace 采用如下方法检查`systemd_logind`进程访问系统函数情况


```
systemd_logind_pid=`ps aux | grep systemd-logind | grep -v grep | awk '{print $2}'`
strace -ff -p $systemd_logind_pid
```

检查发现有大量的

```
recvmsg(12, {msg_name(0)=NULL, msg_iov(1)=[{"\6\1s\0\t\0\0\0:1.144786\0\0\0\0\0\0\0\10\1g\0\1v\0\0"..., 63}], msg_controllen=0, msg_flags=MSG_CMSG_CLOEXEC}, MSG_DONTWAIT|MSG_NOSIGNAL|MSG_CMSG_CLOEXEC) = 63
sendmsg(12, {msg_name(0)=NULL, msg_iov(2)=[{"l\1\0\0014\0\0\0\202\r\0\0\250\0\0\0\1\1o\0007\0\0\0/org/fre"..., 184}, {"\35\0\0\0org.freedesktop.systemd1.Uni"..., 52}], msg_controllen=0, msg_flags=0}, MSG_DONTWAIT|MSG_NOSIGNAL) = 236
clock_gettime(CLOCK_MONOTONIC, {4009622, 704876538}) = 0
recvmsg(12, 0x7fff5d6007d0, MSG_DONTWAIT|MSG_NOSIGNAL|MSG_CMSG_CLOEXEC) = -1 EAGAIN (Resource temporarily unavailable)
clock_gettime(CLOCK_MONOTONIC, {4009622, 704942872}) = 0
ppoll([{fd=12, events=POLLIN}], 1, {24, 999934000}, NULL, 8) = 1 ([{fd=12, revents=POLLIN}], left {24, 999932816})
recvmsg(12, {msg_name(0)=NULL, msg_iov(1)=[{"l\2\1\1\17\0\0\0S\240w\0245\0\0\0\5\1u\0\202\r\0\0", 24}], msg_controllen=0, msg_flags=MSG_CMSG_CLOEXEC}, MSG_DONTWAIT|MSG_NOSIGNAL|MSG_CMSG_CLOEXEC) = 24
```

然后出现不断重复的

```
mmap(NULL, 794624, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f2878cee000
mremap(0x7f2878cee000, 794624, 1585152, MREMAP_MAYMOVE) = 0x7f27f0110000
mkdir("/run/systemd/sessions", 0755)    = -1 EEXIST (File exists)
lstat("/run/systemd/sessions", {st_mode=S_IFDIR|0755, st_size=372460, ...}) = 0
umask(077)                              = 022
open("/run/systemd/sessions/.#c589964Z7rK18", O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC, 0600) = 232
umask(022)                              = 077
fcntl(232, F_GETFL)                     = 0x8002 (flags O_RDWR|O_LARGEFILE)
fchmod(232, 0644)                       = 0
fstat(232, {st_mode=S_IFREG|0644, st_size=0, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f2878dbd000
write(232, "# This is private data. Do not p"..., 255) = 255
rename("/run/systemd/sessions/.#c589964Z7rK18", "/run/systemd/sessions/c589964") = 0
close(232)                              = 0
munmap(0x7f2878dbd000, 4096)            = 0
mkdir("/run/systemd/users", 0755)       = -1 EEXIST (File exists)
lstat("/run/systemd/users", {st_mode=S_IFDIR|0755, st_size=89520, ...}) = 0
umask(077)                              = 022
open("/run/systemd/users/.#0msPZWF", O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC, 0600) = 232
umask(022)                              = 077
fcntl(232, F_GETFL)                     = 0x8002 (flags O_RDWR|O_LARGEFILE)
fchmod(232, 0644)                       = 0
fstat(232, {st_mode=S_IFREG|0644, st_size=0, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f2878dbd000
write(232, "# This is private data. Do not p"..., 4096) = 4096
write(232, "21914 c71463 c708590 c1017162 c8"..., 4096) = 4096
write(232, "332 c620268 c82038 c989969 c1071"..., 4096) = 4096
......
write(232, "c225793 c134251 c86364 c489558 c"..., 4096) = 4096
write(232, "264 c1107220 c549874 c927778 c12"..., 4096) = 4096
write(232, "4330 c435384 c394047 c537918 c25"..., 272) = 272
rename("/run/systemd/users/.#0msPZWF", "/run/systemd/users/0") = 0
close(232)                              = 0
munmap(0x7f2878dbd000, 4096)            = 0
```

* 通过`strace`统计

```
systemd_logind_pid=`ps aux | grep systemd-logind | grep -v grep | awk '{print $2}'`

strace -c -p $systemd_logind_pid
```

可以大量的时间消耗在 `recvmsg`并且有接近1/6的调用错误，而且`mkdir`系统调用100%错误。

```
Process 1992 attached
^CProcess 1992 detached
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 30.59    0.306078           6     52055      8539 recvmsg
 19.08    0.190916           2     90012           write
 18.70    0.187060           9     21754           sendmsg
 16.35    0.163575           5     30287           clock_gettime
  6.62    0.066260           8      8539           ppoll
  2.34    0.023395           9      2512           rename
  0.80    0.007981           6      1248           mremap
  0.77    0.007707           3      2521           open
  0.77    0.007707           2      3760           mmap
  0.76    0.007622           3      2512           munmap
  0.69    0.006885           1      5024           umask
  0.44    0.004404           2      2516      2516 mkdir
  0.43    0.004265           2      2516           lstat
  0.41    0.004124           2      2512           fchmod
  0.39    0.003868           2      2520           close
  0.36    0.003559           1      2512           fcntl
  0.34    0.003448           1      2512           fstat
  0.14    0.001438           6       258           poll
  0.02    0.000214          27         8           name_to_handle_at
  0.00    0.000026           1        26           brk
  0.00    0.000000           0         8           read
------ ----------- ----------- --------- --------- ----------------
100.00    1.000532                235612     11055 total
```

# systemd的sessions

为何系统会有重复的

```
mkdir("/run/systemd/sessions", 0755)    = -1 EEXIST (File exists)
lstat("/run/systemd/sessions", {st_mode=S_IFDIR|0755, st_size=372460, ...}) = 0

mkdir("/run/systemd/users", 0755)       = -1 EEXIST (File exists)
lstat("/run/systemd/users", {st_mode=S_IFDIR|0755, st_size=89520, ...}) = 0
```

观察了 `/run/systemd/sessions` 目录下有大量的会话文件

```
[root@my-server.com /root]
#cd /run/systemd/sessions/

[root@my-server.com /run/systemd/sessions]
#ls | wc -l
19763
```

注意，在`/run/systemd/sessions`目录下，有大量数字字符串命名的文件，以及以`c`开头的数字字符串命名的文件，其中部分文件还有一个配对的`.ref`后缀的文件，类似如下：

```
...
93685         c1132188      c149579       c214953      c294718      c385660      c538128      c704125      c843767      c99012
93685.ref     c1132268      c149588       c214961      c294726      c385924      c538145      c704161      c843805      c990175
93701         c1132268.ref  c149596       c214969      c294816      c386174      c53822       c704557      c843966      c990183
93701.ref     c11323        c149604       c214977      c294845      c386309      c538361      c704722      c844242      c99029
...
```

参考 [help understand /var/run/systemd/sessions/2 file / or hacked?](https://unix.stackexchange.com/questions/266224/help-understand-var-run-systemd-sessions-2-file-or-hacked/266272)

我检查可以看到有2000+个`.ref`文件

```
[root@my-server.com /run/systemd/sessions]
#ls *.ref | wc -l
2126
```

但是，使用`loginctl`指令无法显示会话，显示消息总线响应超时(`Failed to get session: Message did not receive a reply (timeout by message bus)`)

```
[root@my-server.com /run/systemd/sessions]
#loginctl show-session 2
Failed to get session: Message did not receive a reply (timeout by message bus)

[root@my-server.com /run/systemd/sessions]
#loginctl show-session c1140512
Failed to get session: Message did not receive a reply (timeout by message bus)
```

正常情况下`loginctl`是可以显示服务器会话的详细信息的，例如：

```
[root@devstack ~]# cd /run/systemd/sessions/
[root@devstack sessions]# ls
29  29.ref  52  52.ref

[root@devstack sessions]# loginctl show-session 52
Id=52
User=505
Name=admin
Timestamp=Tue 2018-01-16 22:55:28 CST
TimestampMonotonic=1836763327171
VTNr=0
Remote=yes
RemoteHost=10.65.133.200
Service=sshd
Scope=session-52.scope
Leader=5818
Audit=52
Type=tty
Class=user
Active=yes
State=active
IdleHint=no
IdleSinceHint=0
IdleSinceHintMonotonic=0
LockedHint=no

[root@devstack sessions]# loginctl list-sessions
   SESSION        UID USER             SEAT             TTY             
        52        505 admin                                             
        29          0 root             seat0            tty1            

2 sessions listed.
```

显然，上述异常服务器中会话管理出现了问题，特别明显的是 message bus 没有响应。

另外，我明白了，为何在前面 `strace -c -p $systemd_logind_pid` 会出现以下内容

```
write(232, "# This is private data. Do not p"..., 4096) = 4096
```

原来这个`"# This is private data. Do not p"`实际上就是session文件开头的第一行：

```
[root@my-server.com /run/systemd/sessions]
#ls -lh 99708*
-rw-r--r-- 1 root root 280 Jan 16 23:00 99708
prw------- 1 root root   0 Dec 22 07:32 99708.ref

[root@my-server.com /run/systemd/sessions]
#cat 99708
# This is private data. Do not parse.
UID=1000
USER=agent
ACTIVE=1
STATE=active
REMOTE=0
STOPPING=0
TYPE=unspecified
CLASS=background
SCOPE=session-99708.scope
FIFO=/run/systemd/sessions/99708.ref
SERVICE=crond
POS=0
LEADER=24300
REALTIME=1513899121136279
MONOTONIC=1802896976431
```

也就是说，有大量的会话连接存在。

搜索到CentOS 7的一个bug报告 [0014278: systemd update causes /run tmpfs to fill up with sessions](https://bugs.centos.org/view.php?id=14278)，报告称升级了`systemd`之后`/run/systemd/sessions`堆积了大量会话文件，导致分区被占满。

类似检查了一下服务器

```
[root@my-server.com /run/systemd/sessions]
#du -sh /run/systemd/sessions/
69M     /run/systemd/sessions/
```

同样表明`/run/systemd/sessions`目录下会话文件没有清理。解决的方法是升级了`systemd`之后重启一次操作系统。

这个问题已经在`systemd`上游项目中发现，上游`systemd`版本已经修复。导致的原因是因为`systemd`丢失了dbus连接。

```
[root@my-server.com /run/systemd/sessions]
#ls -ld /run/systemd/system/session-*.scope* |wc -l
31351
/etc/sysconfig/bash-prompt-history: line 1: /bin/logger: Argument list too long
```

存在异常的centos 7 服务器，所有 `ls -ld /run/systemd/system/session-*.scope* |wc -l` 输出结果都是3万以上。

显示大量的用户会话都是`root`账号。

在 [Bug 1439989 - why so many sessions scope file didn't been deleted? ](https://bugzilla.redhat.com/show_bug.cgi?id=1439989) 说明在docker容器中，存在于`/run/systemd/systme/`目录下会有大量的`session-xxx.scope.d`文件和目录。而且这个bug报告的系统`systemd`和`dbus`版本恰恰和当前运行服务器版本相同：

```
[root@my-server.com /root]
#rpm -q dbus
dbus-1.6.12-13.1.alios7.x86_64

[root@my-server.com /root]
#rpm -q systemd
systemd-219-19.7.alios7.12.x86_64

[root@my-server.com /root]
#ls -ld /run/systemd/system/session-*.scope* |wc -l
32944
/etc/sysconfig/bash-prompt-history: line 1: /bin/logger: Argument list too long
```

这个bug说明中显示，`systemd-219-19.el7_2.13`容易有泄漏，并且参考 [Leak of scope units slowing down "systemctl list-unit-files" and delaying logins #1961](https://github.com/systemd/systemd/issues/1961) 可以看到完全相同的案例：

* 在`/run/systemd/system`目录下有大量泄漏的scope unit文件
* PID 1使用了100% CPU资源并导致登陆延迟

使用`journalctl -b -u systemd-logind`观察。

参考  Raman Gupta 2017-04-28 13:24:58 EDT 在 [Bug 1271394 - All logins, like ssh, sudo, su take many seconds ](https://bugzilla.redhat.com/show_bug.cgi?id=1271394) 提供的解决方法

```
systemctl daemon-reload
systemctl restart dbus
systemctl restart systemd-logind
```

如果第一个命令`systemctl daemon-reload`失败，可以尝试一下命令重启：

删除session文件

```
find /run/systemd/system -name "session-*.scope" -delete 
```

删除session目录

```
rm -rf /run/systemd/system/session*scope*
```

然后删除abandoned sessions

```
systemctl | grep "abandoned" | grep -e "-[[:digit:]]" | sed "s/\.scope.*/.scope/" | xargs systemctl stop
```

最后再次尝试上述命令。

> 不过，实际验证发现`systemctl daemon-reload`始终超时，无法正确完成。并且`systemd-logind`的负载不能下降。google发现CentOS的buglist中报告，当前版本的systemd升级后必须重启操作系统。只有上游的最新版本的`systemd`可以支持升级后无需重启操作系统。

# 升级`systemd`解决

果然，升级以后重启操作系统，观察到恢复正常

```
[root@my-server.com /run/systemd/sessions]
#top
top - 10:26:43 up 13 min,  2 users,  load average: 1.72, 1.45, 0.82
Tasks: 128 total,   2 running, 125 sleeping,   0 stopped,   1 zombie
%Cpu0  : 17.8 us,  5.2 sy,  0.0 ni, 73.8 id,  0.0 wa,  0.0 hi,  3.1 si,  0.0 st
%Cpu1  : 19.0 us,  2.7 sy,  0.0 ni, 78.0 id,  0.0 wa,  0.0 hi,  0.3 si,  0.0 st
%Cpu2  : 19.5 us,  3.4 sy,  0.0 ni, 76.8 id,  0.0 wa,  0.0 hi,  0.3 si,  0.0 st
%Cpu3  : 19.2 us,  3.0 sy,  0.0 ni, 77.4 id,  0.0 wa,  0.0 hi,  0.3 si,  0.0 st
KiB Mem :  8010880 total,  5668088 free,  1769604 used,   573188 buff/cache
KiB Swap:        0 total,        0 free,        0 used.  6006948 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 5105 admin     20   0 4291072 1.290g  16396 S  76.1 16.9  10:24.41 java
 5421 admin     20   0   84312  25168   1468 R   8.3  0.3   0:30.22 tengine
 5419 admin     20   0   82264  25352   1468 S   5.0  0.3   0:31.13 tengine
 5420 admin     20   0   86360  25656   1468 S   4.7  0.3   0:32.85 tengine
 5422 admin     20   0   80216  23900   1468 S   1.7  0.3   0:31.38 tengine
   13 root      20   0       0      0      0 S   0.7  0.0   0:04.23 rcu_sched
    1 root      20   0   41244   3764   2424 S   0.3  0.0   0:02.19 systemd
   14 root      20   0       0      0      0 S   0.3  0.0   0:01.98 rcuos/0
   16 root      20   0       0      0      0 S   0.3  0.0   0:01.76 rcuos/2
   17 root      20   0       0      0      0 S   0.3  0.0   0:01.74 rcuos/3
 ```

 并且 `/run/systemd/sessions` 目录下只有少量session

 ```
 [root@my-server.com /run/systemd/sessions]
#ls
10  10.ref  9  9.ref  c65  c7  c8  c9
 ```

# 参考

* [PAM related memory leak #2187](https://github.com/systemd/systemd/issues/2187)
* [Bug 1308780 - systemd Using 4GB RAM after 18 Days of Uptime](https://bugzilla.redhat.com/show_bug.cgi?id=1308780)