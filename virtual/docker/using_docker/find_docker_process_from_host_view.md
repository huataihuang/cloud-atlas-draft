在物理主机上，观察Docker的进程，会发现不容易直接找到某个进程究竟是哪个容器中的进程。

例如

```
#top
top - 21:59:50 up 162 days, 22:06,  1 user,  load average: 41.84, 41.87, 40.47
Tasks: 1467 total,   5 running, 1459 sleeping,   0 stopped,   3 zombie
%Cpu(s): 29.2 us, 18.5 sy,  0.0 ni, 47.5 id,  0.1 wa,  2.9 hi,  1.8 si,  0.0 st
KiB Mem : 26316931+total, 25308768 free, 19596931+used, 41891228 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used. 50833336 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
115752 admin     20   0   24.9g   5.3g  77060 S 163.8  2.1 582:47.03 java
  7637 admin     20   0   27.0g   5.7g  78384 S 138.8  2.3   1149:09 java
 91225 admin     20   0   15.2g   2.5g  37128 S 112.6  1.0 909:04.82 java
 14063 admin     20   0   24.6g   3.7g  37000 S 102.6  1.5 847:11.42 java
 93907 root      20   0    9248   2100   1972 R  98.4  0.0 139:47.84 sh
107043 admin     20   0   31.9g   3.4g  37488 S  98.1  1.4   1106:00 java
 33975 root      20   0    9248   2084   1952 R  95.5  0.0  81:57.60 sh
```

上述 `93907` 和 `33975` 进程只看出是一个shell进程，但是在Host上不知道是哪个容器中运行。

```
#ps aux | grep 93907 | grep -v grep
root      93907 96.5  0.0   9248  2100 ?        R    19:35 127:55 /bin/sh /xxxx/log_rotate.sh

#ps aux | grep 33975 | grep -v grep
root      33975 96.6  0.0   9248  2084 ?        R    20:35  70:11 /bin/sh /xxxx/log_rotate.sh
```

`systemdctl`提供了一个命令可以按照 `systemd-cgls` 以树状方式递归检查Linux控制组的层次结构，非常容易循着tree找出某个进程编号对应的容器id。

例如：

```
systemd-cgls
```

进入vi模式，可以通过 `/` 搜索 `93907` 和 `33975`

```
│ ├─063048f7f375a94dcb63d5ac9e50bc2343e06df93b60cc628450bd2f01241ee0
│ │ ├─ 30379 /opt/bin/java -server ...
...
│ │ ├─ 33975 /bin/sh /home/admin/spanner/sbin/log_rotate.sh
...
│ │ ├─ 93907 /bin/sh /xxxx/log_rotate.sh
```

可以看出 `93907` 和 `33975` 进程都属于容器 `063048f7f375a94dcb63d5ac9e50bc2343e06df93b60cc628450bd2f01241ee0`

然后检查容器

```
docker ps
```

可以看到对应的容器如下：

```
CONTAINER ID        IMAGE                                                                        COMMAND                  CREATED             STATUS              PORTS               NAMES
...
063048f7f375        reg.docker.example.com/dev/centos6u2:20181229a                         "/sbin/init"             33 hours ago        Up 33 hours                             exam-app-5157
```

这样就可以对应找到容器并登陆容器进行进一步检查。


# 参考

* [Finding Docker container processes? (from host point of view)](https://stackoverflow.com/questions/34878808/finding-docker-container-processes-from-host-point-of-view)