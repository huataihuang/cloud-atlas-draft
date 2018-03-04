在Linux服务器串口控制台经常输出`INIT: Id "c0" respawning too fast: disabled for 5 minutes`让人非常疑惑：

```
2018-03-01 22:08:06	INIT: Id "c0" respawning too fast: disabled for 5 minutes
2018-03-01 22:14:47	INIT: Id "c0" respawning too fast: disabled for 5 minutes
2018-03-01 22:21:28	INIT: Id "c0" respawning too fast: disabled for 5 minutes
2018-03-01 22:28:09	INIT: Id "c0" respawning too fast: disabled for 5 minutes
...
```

上述信息表明`/etc/inittab`中配置的`respawn`中对应的`c0`服务程序存在异常，不断挂掉又被`init`重新拉起

检查`/etc/inittab`可以看到：

```
# Run gettys in standard runlevels
c0:2345:respawn:/sbin/agetty hvc0  vt100-nav
S0:2345:respawn:/sbin/agetty ttyS0 115200 vt100-nav
1:2345:respawn:/sbin/mingetty tty1
2:2345:respawn:/sbin/mingetty tty2
3:2345:respawn:/sbin/mingetty tty3
4:2345:respawn:/sbin/mingetty tty4
5:2345:respawn:/sbin/mingetty tty5
6:2345:respawn:/sbin/mingetty tty6
```

其中第一行`c0`配置的进程无法正常启动，所以导致`init`初始进程不断尝试拉起这个`agetty`但是不断失败。

检查系统进程可以看到只有`/sbin/agetty ttyS0 115200 vt100-nav`而没有`/sbin/agetty hvc0  vt100-nav`

```
#ps aux | grep agetty
root     10748  0.0  0.0  61168   800 pts/3    S+   15:58   0:00 grep agetty
root     15557  0.0  0.0   3816   580 ttyS0    Ss+   2017   0:02 /sbin/agetty ttyS0 115200 vt100-nav
```

而其他`mingetty`进程则是正常的，可以通过如下方式检查

```
#ps aux | grep mingetty
root     11641  0.0  0.0  61168   800 pts/3    S+   15:58   0:00 grep mingetty
root     15558  0.0  0.0   3804   528 tty1     Ss+   2017   0:00 /sbin/mingetty tty1
root     15559  0.0  0.0   3804   532 tty2     Ss+   2017   0:00 /sbin/mingetty tty2
root     15560  0.0  0.0   3804   528 tty3     Ss+   2017   0:00 /sbin/mingetty tty3
root     15561  0.0  0.0   3804   528 tty4     Ss+   2017   0:00 /sbin/mingetty tty4
root     15562  0.0  0.0   3804   528 tty5     Ss+   2017   0:00 /sbin/mingetty tty5
root     15563  0.0  0.0   3804   528 tty6     Ss+   2017   0:00 /sbin/mingetty tty6
```

总之，系统配置的`/sbin/agetty hvc0  vt100-nav`无法正常启动导致了上述的异常日志，接下来就需要具体排查为何`agetty`无法启动这个虚拟控制台原因了。

> 这是一台虚拟化服务器，常规服务器上配置通常是：

```
# Run gettys in standard runlevels
S0:2345:respawn:/sbin/agetty ttyS0 115200 vt100-nav
```

## XEN服务器

观察了XEN服务器上，发现有人配置了两行相似的配置

```
c0:2345:respawn:/sbin/agetty hvc0  vt100-nav
co:2345:respawn:/sbin/agetty hvc0 9600 vt100-nav
```

而使用`ps aux | grep agetty`可以看到，实际上只有一个`agetty`能够正常启动

```
#ps aux | grep agetty
root      9784  0.0  0.0   3816   532 hvc0     Ss+   2016   0:04 /sbin/agetty hvc0 9600 vt100-nav
root     14771  0.0  0.0  61188   764 pts/0    S+   16:18   0:00 grep agetty
```

上述重复配置导致了XEN服务器的系统日志中不断打印：

```
Mar  2 15:33:36 my.xen.server init: Id "c0" respawning too fast: disabled for 5 minutes
Mar  2 15:40:17 my.xen.server init: Id "c0" respawning too fast: disabled for 5 minutes
...
```

## KVM服务器

KVM服务器上，实际上应该不需要这个配置

```bash
# KVM服务器实际不需要
c0:2345:respawn:/sbin/agetty hvc0  vt100-nav
```

但是被错误引入，所以在KVM服务器上也同样不断输出：

```
Mar  2 15:17:22 my.kvm.server init: Id "c0" respawning too fast: disabled for 5 minutes
Mar  2 15:24:03 my.kvm.server init: Id "c0" respawning too fast: disabled for 5 minutes
...
```

# 解决方法

* 首先注释掉`/etc/inittab`中这行异常的串口配置

```
# Run gettys in standard runlevels
# c0:2345:respawn:/sbin/agetty hvc0  vt100-nav
S0:2345:respawn:/sbin/agetty ttyS0 115200 vt100-nav
...
```

* 然后重启`init`进程

```
kill -SIGHUP 1
```

或者使用以下命令使得`init`重新初始化并重新读取`/etc/inittab`文件：

```
telnit q
```

# 参考

* ["init: Id "x" respawning too fast: disabled for 5 minutes."](http://www.unixguide.net/linux/faq/09.24.shtml)