排查响应缓慢的进程，可以采用一些排查步骤

* 找出进程

```bash
ps auxww | grep XXXX
```

* 使用 strace 跟踪进程查看系统调用

```bash
strace -p <pid>
```

# 找出某个进程的socket对应的访问主机

* 首先检查进程 54024 的 `socketfd` :

```bash
ls -l /proc/54024/fd
```

显示输出

```
total 0
lrwx------ 1 huatai dialout 64 Jul  6 22:06 0 -> /dev/pts/24
lrwx------ 1 huatai dialout 64 Jul  6 22:06 1 -> /dev/pts/24
lrwx------ 1 huatai dialout 64 Jul  6 22:06 2 -> /dev/pts/24
lrwx------ 1 huatai dialout 64 Jul  6 22:06 3 -> 'socket:[2671265]'
lrwx------ 1 huatai dialout 64 Aug 24 00:21 4 -> 'socket:[2671268]'
```

检查进程 `54024` 打开的设备

```bash
$ lsof -i -a -p 54024
COMMAND   PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
ssh     54024 huatai    3u  IPv4 2671265      0t0  TCP zcloud:40336->z-k8s-n-4:ssh (ESTABLISHED)
```

这里也可以根据socketfd现实的设备号进行过滤

```bash
$ lsof -i -a -p 54024 | grep 2671265
ssh     54024 huatai    3u  IPv4 2671265      0t0  TCP zcloud:40336->z-k8s-n-4:ssh (ESTABLISHED)
```

可以看出是访问 `z-k8s-n-4` 主机ssh

* 对进行进行debug，可以使用 `gdb`

```bash
gdb -p <pid>
```

# 参考

* [Debugging Stuck Process in Linux](https://superuser.blog/debugging-stuck-process-linux/)