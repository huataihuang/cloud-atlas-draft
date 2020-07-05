今天同事问我 `/tmp` 目录下文件是否有脚本定期清理，我根据记忆答复他 `/tmp` 目录下临时文件不需要脚本清理，只要不使用的文件，过10天系统就会自动清理。不过，具体是什么机制，我还是查询了一下，以下是学习笔记。

在 CentOS/RHEL 7 系统中， `tmpfiles.d` 会清理 `/tmp` 或者 `/var/tmp` 目录，删除掉不使用的文件。这个功能在 CentOS/RHEL 6上是通过 `crond` 唤起一个 `tmpwatch` 功能来实现的，但是到了 CentOS/RHEL 7则由 `systemd` 的 timer 计时器来管理。

在 `/tmp` 目录下往往存放着操作系统和软件临时存放的文件。如果 `/tmp` 目录下的任何文件在一段时间不被访问，就会自动被系统中删除。

# CentOS/RHEL 6

CentOS/RHEL 6需要安装一个名为 `tmpwatch` 的工具来自动处理 `/tmp` 目录下的过期文件。这个工具包通常会安装，但是如果你的系统是最小化安装，则可能没有这个工具。

```bash
yum install tmpwatch
```

安装了这个 `tmpwatch` 工具包之后。cronjob的配置目录中会增加一个 `/etc/cron.daily/tmpwatch` 定时任务配置文件，内容如下:

```bash
#! /bin/sh
flags=-umc
/usr/sbin/tmpwatch "$flags" -x /tmp/.X11-unix -x /tmp/.XIM-unix \
	-x /tmp/.font-unix -x /tmp/.ICE-unix -x /tmp/.Test-unix \
	-X '/tmp/hsperfdata_*' -X '/tmp/.hdb*lock' -X '/tmp/.sapstartsrv*.log' \
	-X '/tmp/pymp-*' 10d /tmp
/usr/sbin/tmpwatch "$flags" 30d /var/tmp
for d in /var/{cache/man,catman}/{cat?,X11R6/cat?,local/cat?}; do
    if [ -d "$d" ]; then
	/usr/sbin/tmpwatch "$flags" -f 30d "$d"
    fi
done
```

上述脚本中可以看到简单的逻辑就是对于一些特定匹配的文件名，例如 `'/tmp/pymp-*'` 则每10天清理一次；对于没有特定匹配文件名，则30天清理一次。

# CentOS/RHEL 7/8

从 CentOS/RHEL 7开始，采用 `systemd-tmpfile` 服务来周期性清理 `/tmp` 目录。配置文件是 `/usr/lib/tmpfiles.d/tmp.conf` :

```bash
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

# See tmpfiles.d(5) for details

# Clear tmp directories separately, to make them easier to override
q /tmp 1777 root root 10d
q /var/tmp 1777 root root 30d

# Exclude namespace mountpoints created with PrivateTmp=yes
x /tmp/systemd-private-%b-*
X /tmp/systemd-private-%b-*/tmp
x /var/tmp/systemd-private-%b-*
X /var/tmp/systemd-private-%b-*/tmp

# Remove top-level private temporary directories on each boot
R! /tmp/systemd-private-*
R! /var/tmp/systemd-private-*
```

系统配置了一个 `systemd-tmpfiles-clean.timer` :

```
systemd-tmpfiles-clean.timer                                                loaded active     waiting      Daily Cleanup of Temporary Directories
```

可以通过以下命令了解状态：

```
#systemctl status systemd-tmpfiles-clean.timer
● systemd-tmpfiles-clean.timer - Daily Cleanup of Temporary Directories
   Loaded: loaded (/usr/lib/systemd/system/systemd-tmpfiles-clean.timer; static; vendor preset: disabled)
   Active: active (waiting) since Thu 2020-06-11 23:45:08 CST; 3 weeks 0 days ago
  Trigger: Sat 2020-07-04 00:01:17 CST; 19min left
     Docs: man:tmpfiles.d(5)
           man:systemd-tmpfiles(8)

Jun 11 23:45:08 sqa011159245239.eu126 systemd[1]: Started Daily Cleanup of Temporary Directories.
```


# 参考

* [CentOS / RHEL 6,7 : Why the files in /tmp directory gets deleted periodically](https://www.thegeekdiary.com/centos-rhel-67-why-the-files-in-tmp-directory-gets-deleted-periodically/)