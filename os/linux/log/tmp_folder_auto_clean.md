Linux操作系统的`/tmp`目录保存临时文件，那么这个目录下的临时文件究竟会保存多久，何时被清理，通过什么方式（哪个服务）来维护清理工作呢？

# 手工清理

清理 `/tmp` 目录文件最简单和直接的方式是使用脚本命令清理N天前的临时文件（如果空间不足的话）

```
find /tmp -type f -mtime +5 -exec rm -f {} \;
```

> 清理`5`天前的文件。如果有程序不断写入`/tmp`目录下，则需要做轮转，这样才能使得文件的`mtime`保持确定时间，达到一定时间（如5天）被清理。
>
> 这个方法是应急处理，对于各个Linux发行版本，都有各自维护`/tmp`目录的设置方法

# Red Hat / CentOS 和 `tmpwatch`

## RHEL/CentOS 6使用`tmpwatch`维护临时文件删除

CentOS 6有一个`tmpwatch`默认会根据文件的最后访问时间`atime`来删除文件（不是根据`mtime`）。查看文件的`atime`可以通过 `ls -u` 来检查。

`/etc/cron.daily/tmpwatch` 脚本每天运行进行文件清理

```
#! /bin/sh
flags=-umc
/usr/sbin/tmpwatch "$flags" -x /tmp/.X11-unix -x /tmp/.XIM-unix \
	-x /tmp/.font-unix -x /tmp/.ICE-unix -x /tmp/.Test-unix \
	-X '/tmp/hsperfdata_*' 10d /tmp
/usr/sbin/tmpwatch "$flags" 30d /var/tmp
for d in /var/{cache/man,catman}/{cat?,X11R6/cat?,local/cat?}; do
    if [ -d "$d" ]; then
	/usr/sbin/tmpwatch "$flags" -f 30d "$d"
    fi
done
```

可以看到这个脚本默认保留 `/tmp` 目录下10天的文件，以及`/var/tmp`目录下30天文件；以及`/var/{cache/man,catman}`目录下30天文件。

参数：

* `-u` 根据`atime`决定删除文件
* `-m` 根据`mtime`决定删除文件
* `-c` 根据`ctime`决定删促文件
* 当同时结合使用 `-umc` 则表示是否删除文件取决于这3个时间点`最大值`。

## RHEL/CentOS 7使用`systemd-tmpfiles-clean.timer`服务维护临时文件删除

在 RHEL/CentOS 7种，有一个每日运行的`systemd target`称为 `systemd-tmpfiles-clean.timer` ，这是用来替代`/etc/cron.daily/tmpwatch`的。默认值是

```
OnBootSec=15min
OnUnitActiveSec=1d
```

检查：

```
sudo systemctl status systemd-tmpfiles-clean.timer
```

输出提示

```
● systemd-tmpfiles-clean.timer - Daily Cleanup of Temporary Directories
   Loaded: loaded (/usr/lib/systemd/system/systemd-tmpfiles-clean.timer; static; vendor preset: disabled)
   Active: active (waiting) since Fri 2016-07-29 10:17:19 CST; 2 months 1 days ago
     Docs: man:tmpfiles.d(5)
           man:systemd-tmpfiles(8)
```

可以使用如下命令检查

```
sudo journalctl -u systemd-tmpfiles-clean
```

> 由于没有定义时间，所以对于大型集群，这个清理时间是不固定的，这样整个集群清理时间可以错开。

在 `/usr/lib/tmpfiles.d/tmp.conf` 配置文件中定义了 `systemd-tmpfiles-clean.service` 的配置，注意其中会避开一些使用`PrivateTmp=yes`创建的名字空间挂载点：

```
# Clear tmp directories separately, to make them easier to override
v /tmp 1777 root root 10d
v /var/tmp 1777 root root 30d

# Exclude namespace mountpoints created with PrivateTmp=yes
x /tmp/systemd-private-%b-*
X /tmp/systemd-private-%b-*/tmp
x /var/tmp/systemd-private-%b-*
X /var/tmp/systemd-private-%b-*/tmp
```

> 可以看到对于`/tmp`目录，默认配置也是保留10天文件

# 按日轮转日志

对于`/tmp`目录下的日志文件可以通过自己简单的脚本进行轮转 - 思路：脚本在执行日志生成前，对比当前时间和文件的更改时间，如果跨日期（0点），则会出现当前时间的日期比文件上一次更改时间戳日

# 参考

* [When does /tmp get cleared?](http://serverfault.com/questions/377348/when-does-tmp-get-cleared)
* [When exactly does tmpwatch clear out files I place in /tmp?](http://unix.stackexchange.com/questions/118754/when-exactly-does-tmpwatch-clear-out-files-i-place-in-tmp)