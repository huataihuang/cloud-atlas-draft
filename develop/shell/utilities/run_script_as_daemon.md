在一些测试情况下，需要验证进程的继承关系，所以想能够持续运行一个脚本，作为daemon。

# 使用`setsid`运行脚本作为daemon

要使得一个shell按照daemon方式运行，需要使用`setsid`（`setsid - run a program in a new session`）并将输出重定向。可以将输出重定向到一个认知文件，或者`/dev/null`抛弃日志。

假设这里我们有一个 `test_daemon.sh` 脚本内容如下

```bash
#!/bin/bash

while true; do
  /bin/echo "run as daemon then sleep 10s"
  /bin/date > /dev/shm/test_daemon
  /bin/sleep 10
done
```

则我们可以如下方式执行

```bash
setsid test_daemon.sh >/dev/null 2>&1 < /dev/null &
```

但是发现这个`test_daemon.sh`并没有如料想的一样运行，而是检查进程发现结束了

```bash
$ps aux | grep test_daemon
admin    220955  0.0  0.0  61200   756 pts/0    S+   14:39   0:00 grep test_daemon
[1]+  Done                    setsid test_daemon.sh > /dev/null 2>&1 < /dev/null
```

将`/dev/null`替换成本地的一个日志文件`/home/admin/test_daemon.log`，看输出情况

```bash
setsid test_daemon.sh > /home/admin/test_daemon.log 2>&1 < /home/admin/test_daemon.log &
```

可以看到 `test_daemon.log` 中有一行记录

```
execvp: No such file or directory
```

这个问题似乎和终端有关，是执行脚本命令需要tty么？

# 使用`daemon`工具

> 参考 [Using Daemon to create Linux services in 5 minutes](http://blog.terminal.com/using-daemon-to-daemonize-your-programs/) - 这篇文章解释非常透彻清晰

[daemon](http://www.libslack.org/daemon/)是一个将其他进程转换成daemon运行的工具，安装方法可以参考[README](http://libslack.org/daemon/README)。可以直接从从官网下载源代码安装，或者使用rpm安装。

```bash
wget http://libslack.org/daemon/download/daemon-0.6.4.tar.gz
tar xfz daemon-0.6.4.tar.gz
cd daemon-0.6.4
./config
make
sudo make install
```

> `make test`是用来检测`libslack`，不确定用途

使用方法非常简单，假设这里运行一个`test_daemon_10.sh`脚本

```bash
daemon -r /home/admin/test_daemon_10.sh
```

实验用的`test_daemon_10.sh`内容如下

```bash
#!/bin/bash

rm -f /dev/shm/test_daemon

i=0
while true; do
  /bin/echo "run as daemon then sleep 10s"
  /bin/date >> /dev/shm/test_daemon
  /bin/sleep 10
  echo "Hello world - $i" >> /dev/shm/test_daemon
  i=$(( $i + 1 ))
done
```

> 这个脚本唯一的功能就是不断循环并将输出记录到`/dev/shm/test_daemon`文件。

使用`daemon -r`参数，这个`-r`参数表示`respawn`，也就是自动重新重启。表示当脚本被杀死以后，`daemon`会自动再启动这个脚本作为服务。

下面我们来检验一下，先检查脚本进程

```bash
ps aux | grep test_daemon_10 | grep -v grep
```

可以看到

```bash
admin     45747  0.0  0.0  65400   424 ?        S    09:49   0:00 daemon -r /home/admin/test_daemon_10.sh
admin     45749  0.0  0.0  63872  1076 ?        S    09:49   0:00 /bin/bash /home/admin/test_daemon_10.sh
```

我们杀死进程`45749`

```bash
kill 45749
```

然后再使用命令`ps aux | grep test_daemon_10 | grep -v grep` 检查系统中的`test_daemon_10`，可以看到脚本进程已经杀死

```bash
admin     45747  0.0  0.0  65400   436 ?        S    09:49   0:00 daemon -r /home/admin/test_daemon_10.sh
admin     45749  0.0  0.0      0     0 ?        Z    09:49   0:00 [test_daemon_10.] <defunct>
```

过一会，我们再次使用命令 `ps aux | grep test_daemon_10 | grep -v grep` 就会发现脚本再次被`daemon`进程启动（注意进程号不同了）

```bash
admin     45747  0.0  0.0  65428   680 ?        S    09:49   0:00 daemon -r /home/admin/test_daemon_10.sh
admin     98336  0.0  0.0  63872  1068 ?        S    09:57   0:00 /bin/bash /home/admin/test_daemon_10.sh
```

这个daemon化的脚本会一直运行，即使关闭终端窗口。

> [Using Daemon to create Linux services in 5 minutes](http://blog.terminal.com/using-daemon-to-daemonize-your-programs/)还提供了SysVinit兼容的启动脚本用于`daemonize`脚本。


# 使用脚本functions来管理daemon(Red Hat/CentOS系使用)

Red Hat系发行版提供了一个标准化的`/etc/init.d/functions`来管理daemon脚本。

# 参考

* [Run bash script as daemon](http://stackoverflow.com/questions/19233529/run-bash-script-as-daemon)
* [Using Daemon to create Linux services in 5 minutes](http://blog.terminal.com/using-daemon-to-daemonize-your-programs/)
* [Managing Linux daemons with init scripts](https://www.linux.com/learn/tutorials/442412-managing-linux-daemons-with-init-scripts)
* [How can I run a shell script as a daemon under Redhat?](http://unix.stackexchange.com/questions/72881/how-can-i-run-a-shell-script-as-a-daemon-under-redhat)
* [How to start Script as Daemon – DEBIAN – UBUNTU](http://ram.kossboss.com/start-script-daemon-debian-ubuntu/)
* [Best way to make a shell script daemon?](http://stackoverflow.com/questions/3430330/best-way-to-make-a-shell-script-daemon) - 提到了[Unix Programming FAQ](http://www.faqs.org/faqs/unix-faq/programmer/faq/)有关案例
* [Beginners Guide to creating a daemon in Linux](http://shahmirj.com/blog/beginners-guide-to-creating-a-daemon-in-linux) - 一个简单的c语言写的daemon，可参考