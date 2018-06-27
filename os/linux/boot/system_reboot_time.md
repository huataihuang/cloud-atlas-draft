经常在检查系统重启原因时要找到操作系统启动的准确时间，一种方式是翻看系统messages日志，但是非常麻烦。使用`uptime`命令检查则比较模糊，不能看到精确的启动时间。

其实，系统提供了以下两个可以方便检查启动时间的命令：

* `last`
* `who`

# 使用`who`命令检查最后系统启动时间

```bash
who -b
```

可以看到输出：

```
         system boot  2018-03-13 04:28
```

# 使用`last reboot`命令

```bash
last reboot
```

`last`命令可以看到用户登陆系统的时间，也包括了重启时间，使用`last reboot`则只查看重启时间。

# 找出最新关闭时间

```bash
last -x|grep shutdown | head -1
```

`-x`参数显示系统shutdown记录以及运行级别改变

比较简单的方法：

```bash
last -x reboot

last -x shutdown
```

上述命令可以分别找出重启和关机的时间

也可以找出系统启动时间

```
uptime -s
```

此时输出和`last -x reboot`是相同的

```
2018-05-15 19:27:49
```

# 找出谁重启或关闭了系统

如果使用了[psacct](https://www.cyberciti.biz/tips/howto-log-user-activity-using-process-accounting.html)系统，还能够对系统进行审计，获得谁重启了系统。

# 参考

* [Linux Find Out Last System Reboot Time and Date Command](https://www.cyberciti.biz/tips/linux-last-reboot-time-and-date-find-out.html)