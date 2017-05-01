
从 `top` 查看`spoold`的线程可以看到确实始终在`cpu 1`上运行

```
top - 21:51:47 up 68 days,  8:21,  1 user,  load average: 1.19, 1.40, 1.41
Threads: 1220 total,   2 running, 1217 sleeping,   0 stopped,   1 zombie
%Cpu(s):  1.7 us,  0.2 sy,  0.0 ni, 98.1 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem : 19785972+total,  2179340 free, 17681568+used, 18864712 buff/cache
KiB Swap:        0 total,        0 free,        0 used. 20492928 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND                                                          P
106202 root      20   0 1290492  10908   9692 R 99.9  0.0  98408:25 spoold-slave-1                                                   1
```

但是启动`spoold`的进程，显示是在cpu 0上（`taskset -p <spoold_pid>`显示`1`表示在cpu0上）

```
#ps aux | grep spoold
root      20499  100  0.0 1282372 4608 ?        Ssl  20:55  58:02 /opt/spool/sbin/spoold -d -f /opt/spool/etc/spoold.conf -- -c 0x3 -m 1000 -n 4 --max-scan-mem 4096 --hot-upgrade
```

```
#taskset -p 20499
pid 20499's current affinity mask: 1
```

据开发说明，`spoold`启动会自己绑定cpu affinity，默认使用`0`和`1`，但是主pool线程会自动绑定到cpu 1。不过，尝试了`cgconfig.conf`配置，设置`spoold`为`1`的话会导致无法启动。因为程序启动时候尝试设置cpu affinity冲突：

```
直接原因是spoold 调用 pthread_setaffinity_np( ) 失败
```