批量检查服务器上的进程cpu负载，采用命令

```
ps -aux --sort=%cpu
```

则输出显示

```
USER        PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root          1  0.0  0.0 196136 12468 ?        Ss    2019  32:45 /usr/lib/systemd/systemd --switched-root --system --deserialize 21
root          2  0.0  0.0      0     0 ?        S     2019   1:23 [kthreadd]
root          5  0.0  0.0      0     0 ?        S<    2019   0:00 [kworker/0:0H]
...
admin     12597  208  2.0 17630628 10803540 ?   Sl   Aug05 2374:53 java -D...
admin    106071  287  2.2 15434760 12101576 ?   Sl   Jul23 56708:30 java -server ...
admin      8601  345  2.3 15496056 12297256 ?   Sl   11:05 800:52 java -server ...
```

可以看到按照 `%cpu` 排序后就很容易找到负载最高的进程，例如再加上 `tail -10` 就可以获得使用cpu资源最高的进程

对于docker环境，如果需要检查特定进程使用cpu的情况，例如syslog-ng进程，可以结合命令

```bash
ps -aux --sort=%cpu | grep syslog-ng | tail -n 3
```

使用top命令也可以查看cpu使用率，不过，top通常是交互模式，如果要命令行采集，采用 `top -b -n 1` 就可以采集一次(`-n 1`)输出，显示内容如下

```
#top -b -n 1
top - 15:07:14 up 244 days, 21:20,  1 user,  load average: 81.88, 89.74, 90.29
Tasks: 2458 total,   4 running, 2452 sleeping,   0 stopped,   2 zombie
%Cpu(s): 50.1 us, 18.8 sy,  0.0 ni, 29.4 id,  0.3 wa,  0.0 hi,  1.5 si,  0.0 st
KiB Mem : 52754140+total, 62239184 free, 31605289+used, 14924934+buff/cache
KiB Swap:        0 total,        0 free,        0 used. 17871446+avail Mem 

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 12597 admin     20   0   16.8g  10.3g  19100 S 517.8  2.0   2411:49 java
  8601 admin     20   0   14.8g  11.8g  14744 S 397.8  2.3 832:50.61 java
106071 admin     20   0   14.7g  11.5g  16728 S 380.0  2.3  56745:29 java
 10930 admin     20   0   22.7g   3.4g  26892 S 231.1  0.7   3284:41 java
103452 admin     20   0   16.8g  12.8g  29640 S 228.9  2.5   5013:20 java
...
```

# 获取cpu的脚本案例

参考 [Get CPU usage via SSH](https://stackoverflow.com/questions/20693089/get-cpu-usage-via-ssh) 提供了获取cpu利用率的案例，我做了一点修改来取样10次求平均值

```bash
top -b -n 10 -d.2 | grep 'Cpu' |  awk '{print $2}' | awk -F% '{ SUM += $1 } END { print SUM/10 }'
```

其中参数：

- `-b` 表示 Batch模式，脚本模式
- `-n 10` 表示取样10次
- `-d.2` 表示显示间隔(Delay time)，数值格式是 `-d ss.tt` 即(`seconds.tenths`)

上述脚本通过 `grep 'Cpu'` 可以过滤出每次top获得的cpu使用率

```bash
top -b -n 10 -d.2 | grep 'Cpu'
```

此时输出的内容类似如下：

```
Cpu(s):  0.8%us,  0.8%sy,  0.0%ni, 60.1%id,  0.5%wa,  0.0%hi,  0.0%si, 37.9%st
Cpu(s):  0.0%us,  0.0%sy,  0.0%ni, 63.0%id,  0.0%wa,  0.0%hi,  0.0%si, 37.0%st
Cpu(s):  1.2%us,  1.2%sy,  0.0%ni, 63.1%id,  0.0%wa,  0.0%hi,  0.0%si, 34.5%st
Cpu(s):  0.0%us,  1.2%sy,  0.0%ni, 64.6%id,  0.0%wa,  0.0%hi,  0.0%si, 34.1%st
Cpu(s):  0.0%us,  0.0%sy,  0.0%ni, 60.5%id,  0.0%wa,  0.0%hi,  0.0%si, 39.5%st
Cpu(s):  1.2%us,  3.7%sy,  0.0%ni, 56.1%id,  0.0%wa,  0.0%hi,  0.0%si, 39.0%st
Cpu(s):  1.2%us,  2.4%sy,  0.0%ni, 67.5%id,  0.0%wa,  0.0%hi,  0.0%si, 28.9%st
Cpu(s):  1.2%us,  0.0%sy,  0.0%ni, 66.3%id,  0.0%wa,  0.0%hi,  0.0%si, 32.5%st
Cpu(s):  0.0%us,  1.2%sy,  0.0%ni, 68.3%id,  0.0%wa,  0.0%hi,  0.0%si, 30.5%st
Cpu(s):  1.2%us,  0.0%sy,  0.0%ni, 68.3%id,  0.0%wa,  0.0%hi,  0.0%si, 30.5%st
```

通用 `|  awk '{print $2}' | awk -F% '{ SUM += $1 } END { print SUM/10 }'` 过滤出第2列数据，并以`%`分隔符取出cpu利用率数值进行累加并除以10计算出平均值。