> 警告:
>
> 批量杀死Linux系统中的进程是高危操作，所以务必仔细检查和灰度

# 找出某个用户的进程进行kill

`ps` 命令提供了输出字段过滤功能，例如需要找出 `huatai` 用户的进程:

```bash
ps -o pid= -u huatai
```

此时只会显示该用户的进程pid(无需awk)，所以我们可以进一步使用 `xargs` 进行管道命令处理(kill)

```bash
ps o pid= -u huatai | xargs kill
```

这样系统中所有 `huatai` 用户的进程都会被杀死

# killall命令

`killall` 命令提供了更为简单的杀死所有进程的方法，默认发送 `SIGTERM` 信号：

- `-I` 忽略大小写
- `-i` 交互模式，在杀死每个进程前进行确认
- `-o` 只杀死比指定时间更早(older)的进程
- `-y` 只杀死比指定时间更晚(younger)的进程
- `-r` 使用规则选择进程

举例：

* 杀死1周前的apache2进程，杀死前交互确认:

```bash
killall -io 1w apache2
```

* 如果使用 `SIGTERM` 不能杀掉进程，则使用 `kill -9` 方式:

```bash
killall -9 -io 1w apache2
```

# pgrep和pkill

`pgrep` 会列出所有匹配的进程pid，而 `pkill` 则杀死所有匹配的进程:

```bash
pgrep apache2
```

批量杀死

```bash
pkill apache2
```

# 参考

* [Linux Tip: How To Kill Multiple Processes In Linux](https://www.tiger-computing.co.uk/how-to-kill-multiple-processes-in-linux/)