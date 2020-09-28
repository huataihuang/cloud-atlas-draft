树莓派使用Sandisk的128G TF卡，想测试一下读写性能

# 本地磁盘SSD测试命令

- 随机写IOPS

```bash
fio -direct=1 -iodepth=32 -rw=randwrite -ioengine=libaio -bs=4k -numjobs=4 -time_based=1 -runtime=1000 -group_reporting -filename=fio.img -size=1g -name=test_fio
```

iodepth=16
iodepth_batch=8
iodepth_low=8
iodepth_batch_complete=8

测试时显示负载过高

```
top - 08:56:43 up  2:19,  2 users,  load average: 13.66, 19.36, 15.91
Tasks: 341 total,   1 running, 340 sleeping,   0 stopped,   0 zombie
%Cpu0  :  0.3 us,  1.0 sy,  0.0 ni, 70.5 id, 28.1 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  :  0.3 us,  2.0 sy,  0.0 ni, 13.8 id, 83.9 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu2  :  0.3 us,  0.3 sy,  0.0 ni, 47.2 id, 52.1 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu3  :  0.7 us,  0.3 sy,  0.0 ni, 26.5 id, 72.5 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1848.2 total,    592.2 free,    220.0 used,   1036.1 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   1190.4 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1651 root      20   0 1220100  35572  13928 S   1.3   1.9  34:18.69 snapd
   3587 ubuntu    20   0   10920   3548   2720 R   1.0   0.2   0:00.30 top
   3061 ubuntu    20   0  790144 428844 424816 S   0.7  22.7   0:09.09 fio
     10 root      20   0       0      0      0 I   0.3   0.0   0:18.72 rcu_sched
    195 root       0 -20       0      0      0 I   0.3   0.0   0:18.75 kworker/1:1H-kblockd
   3064 ubuntu    20   0  724604   4916    872 D   0.3   0.3   0:15.15 fio
   3065 ubuntu    20   0  724608   4972    924 D   0.3   0.3   0:15.11 fio
   3066 ubuntu    20   0  724612   4972    928 D   0.3   0.3   0:15.02 fio
```

并且iops最高大约800+，最低出现个位数，所以瓶颈明显

```
test_fio: (g=0): rw=randwrite, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=32
...
fio-3.16
Starting 4 processes
test_fio: Laying out IO file (1 file / 1024MiB)
Jobs: 4 (f=4): [w(4)][100.0%][w=3387KiB/s][w=846 IOPS][eta 00m:00s]
test_fio: (groupid=0, jobs=4): err= 0: pid=3063: Sat Sep 19 08:57:08 2020
  write: IOPS=438, BW=1752KiB/s (1794kB/s)(1711MiB/1000030msec); 0 zone resets
    slat (usec): min=23, max=6227.3k, avg=7262.83, stdev=83659.37
    clat (usec): min=1038, max=9621.2k, avg=284958.20, stdev=609511.62
     lat (msec): min=2, max=9621, avg=292.22, stdev=620.32
    clat percentiles (msec):
     |  1.00th=[    5],  5.00th=[   14], 10.00th=[   27], 20.00th=[   55],
     | 30.00th=[   87], 40.00th=[  123], 50.00th=[  161], 60.00th=[  197],
     | 70.00th=[  234], 80.00th=[  284], 90.00th=[  384], 95.00th=[  902],
     | 99.00th=[ 3540], 99.50th=[ 4463], 99.90th=[ 6409], 99.95th=[ 7215],
     | 99.99th=[ 8221]
   bw (  KiB/s): min=   29, max= 4728, per=100.00%, avg=2208.06, stdev=336.76, samples=6345
   iops        : min=    5, max= 1182, avg=551.89, stdev=84.19, samples=6345
  lat (msec)   : 2=0.01%, 4=0.51%, 10=3.20%, 20=4.09%, 50=10.99%
  lat (msec)   : 100=14.87%, 250=39.82%, 500=19.38%, 750=1.65%, 1000=0.74%
  lat (msec)   : 2000=2.31%, >=2000=2.44%
  cpu          : usr=0.20%, sys=1.34%, ctx=305991, majf=0, minf=90
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=100.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.1%, 64=0.0%, >=64=0.0%
     issued rwts: total=0,438023,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=32

Run status group 0 (all jobs):
  WRITE: bw=1752KiB/s (1794kB/s), 1752KiB/s-1752KiB/s (1794kB/s-1794kB/s), io=1711MiB (1794MB), run=1000030-1000030msec

Disk stats (read/write):
  mmcblk0: ios=0/448343, merge=0/272632, ticks=0/89997955, in_queue=89102480, util=58.50%
```

- 重新测试，修改iodepth并且增加批量提交参数和最低

```bash
fio -direct=1 -iodepth=16 -iodepth_batch=8 -iodepth_low=8 -iodepth_batch_complete=8 \
-rw=randwrite -ioengine=libaio -bs=4k -numjobs=4 -time_based=1 -runtime=1000 \
-group_reporting -filename=fio.img -size=1g -name=test_fio
```

若然调整以后负载不再过高

```
top - 09:08:38 up  2:31,  2 users,  load average: 3.42, 4.18, 8.61
Tasks: 138 total,   1 running, 137 sleeping,   0 stopped,   0 zombie
%Cpu0  :  5.1 us,  3.1 sy,  0.0 ni, 61.0 id, 30.8 wa,  0.0 hi,  0.0 si,  0.0 st
%Cpu1  :  0.7 us,  5.0 sy,  0.0 ni, 64.2 id, 29.4 wa,  0.0 hi,  0.7 si,  0.0 st
%Cpu2  :  0.7 us,  5.0 sy,  0.0 ni, 65.9 id, 27.8 wa,  0.0 hi,  0.7 si,  0.0 st
%Cpu3  :  1.0 us,  2.7 sy,  0.0 ni, 69.3 id, 27.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1848.2 total,    600.9 free,    211.3 used,   1036.0 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   1199.1 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1651 root      20   0 1220100  35768  13928 S   9.9   1.9  36:40.74 snapd
    193 root       0 -20       0      0      0 D   2.3   0.0   0:22.31 kworker/2:1H+kblockd
    195 root       0 -20       0      0      0 I   2.3   0.0   0:22.20 kworker/1:1H-kblockd
   3598 ubuntu    20   0  724596   5164   1140 S   2.0   0.3   0:02.23 fio
   3599 ubuntu    20   0  724600   5104   1080 S   2.0   0.3   0:02.22 fio
   3601 ubuntu    20   0  724608   5104   1080 S   2.0   0.3   0:02.21 fio
   3600 ubuntu    20   0  724604   5176   1152 S   1.7   0.3   0:02.21 fio
    214 root       0 -20       0      0      0 I   1.3   0.0   0:24.28 kworker/3:2H-kblockd
   3609 ubuntu    20   0   10696   3312   2728 R   1.0   0.2   0:00.20 top
     18 root      20   0       0      0      0 S   0.7   0.0   0:03.53 ksoftirqd/1
     24 root      20   0       0      0      0 S   0.7   0.0   0:03.25 ksoftirqd/2
   3596 ubuntu    20   0  790140 428908 424888 S   0.7  22.7   0:02.64 fio
   3606 root      20   0       0      0      0 I   0.7   0.0   0:00.23 kworker/0:0-events
     10 root      20   0       0      0      0 I   0.3   0.0   0:20.10 rcu_sched
     30 root      20   0       0      0      0 S   0.3   0.0   0:03.37 ksoftirqd/3
```

执行 `iostat -dx 1` 检查是否符合iodepth要求

```
Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0          0.00      0.00     0.00   0.00    0.00     0.00  809.00   3916.00    80.00   9.00   43.71     4.84    0.00      0.00     0.00   0.00    0.00     0.00   33.72  94.40


Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0          0.00      0.00     0.00   0.00    0.00     0.00  813.00   3932.00    80.00   8.96   45.40     4.84    0.00      0.00     0.00   0.00    0.00     0.00   35.26  93.20


Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0          0.00      0.00     0.00   0.00    0.00     0.00  808.00   3912.00    80.00   9.01   43.42     4.84    0.00      0.00     0.00   0.00    0.00     0.00   33.44  94.00
```

测试结果

```
test_fio: (g=0): rw=randwrite, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
...
fio-3.16
Starting 4 processes
Jobs: 4 (f=4): [w(4)][100.0%][w=3200KiB/s][w=800 IOPS][eta 00m:00s]
test_fio: (groupid=0, jobs=4): err= 0: pid=3598: Sat Sep 19 09:21:55 2020
  write: IOPS=403, BW=1615KiB/s (1654kB/s)(1577MiB/1000067msec); 0 zone resets
    slat (usec): min=124, max=2053.5k, avg=33814.75, stdev=104627.67
    clat (msec): min=8, max=4712, avg=124.65, stdev=246.82
     lat (msec): min=8, max=4959, avg=158.47, stdev=304.86
    clat percentiles (msec):
     |  1.00th=[   21],  5.00th=[   27], 10.00th=[   31], 20.00th=[   37],
     | 30.00th=[   44], 40.00th=[   54], 50.00th=[   75], 60.00th=[   81],
     | 70.00th=[   85], 80.00th=[   96], 90.00th=[  150], 95.00th=[  485],
     | 99.00th=[ 1452], 99.50th=[ 1754], 99.90th=[ 2500], 99.95th=[ 2668],
     | 99.99th=[ 3406]
   bw (  KiB/s): min=  252, max= 3840, per=100.00%, avg=1809.57, stdev=336.42, samples=7138
   iops        : min=   60, max=  960, avg=452.24, stdev=84.11, samples=7138
  lat (msec)   : 10=0.01%, 20=0.94%, 50=36.31%, 100=44.30%, 250=10.34%
  lat (msec)   : 500=3.25%, 750=1.43%, 1000=1.58%, 2000=1.56%, >=2000=0.27%
  cpu          : usr=0.07%, sys=0.90%, ctx=298229, majf=0, minf=84
  IO depths    : 1=0.0%, 2=0.0%, 4=0.0%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=0.0%, 8=100.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=0.0%, 8=100.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=0,403800,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
  WRITE: bw=1615KiB/s (1654kB/s), 1615KiB/s-1615KiB/s (1654kB/s-1654kB/s), io=1577MiB (1654MB), run=1000067-1000067msec

Disk stats (read/write):
  mmcblk0: ios=119/416905, merge=1/41503, ticks=9121/36852761, in_queue=36022036, util=57.04%
```

- 随机读IOPS

```bash
fio -direct=1 -iodepth=32 -rw=randread -ioengine=libaio -bs=4k -numjobs=4 -time_based=1 -runtime=1000 -group_reporting -filename=fio.img -size=1g -name=test_fio
```

测试时负载

```
top - 09:29:09 up  2:51,  2 users,  load average: 3.15, 2.47, 4.56
Tasks: 136 total,   1 running, 135 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.7 us,  6.5 sy,  0.0 ni, 60.2 id, 28.7 wa,  0.0 hi,  0.8 si,  0.0 st
MiB Mem :   1848.2 total,    593.5 free,    213.7 used,   1041.1 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   1196.7 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1651 root      20   0 1220100  35736  13928 S  15.2   1.9  39:07.44 snapd
    193 root       0 -20       0      0      0 D   7.6   0.0   0:32.55 kworker/2:1H+kblockd
     24 root      20   0       0      0      0 S   4.3   0.0   0:07.38 ksoftirqd/2
   4119 ubuntu    20   0  724600   5216   1152 D   4.3   0.3   0:02.01 fio
   4121 ubuntu    20   0  724608   5204   1140 S   4.3   0.3   0:02.01 fio
   4120 ubuntu    20   0  724604   5180   1116 S   4.0   0.3   0:01.98 fio
   4118 ubuntu    20   0  724596   5204   1140 S   3.6   0.3   0:01.98 fio
   4122 root       0 -20       0      0      0 I   3.0   0.0   0:01.43 kworker/2:0H-kblockd
   4116 ubuntu    20   0  790140 428920 424900 S   1.0  22.7   0:01.41 fio
     10 root      20   0       0      0      0 I   0.3   0.0   0:21.83 rcu_sched
    817 root      20   0       0      0      0 S   0.3   0.0   0:39.20 jbd2/mmcblk0p2-
   2296 ubuntu    20   0   15564   4844   3616 S   0.3   0.3   0:01.08 sshd
   4109 root      20   0       0      0      0 D   0.3   0.0   0:00.13 kworker/0:0+events
```

检查iostat

```
iostat -dx 1 /dev/mmcblk0
```

输出

```
Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0       1879.00   7516.00     0.00   0.00   64.23     4.00   37.00   1140.00   104.00  73.76   23.46    30.81    0.00      0.00     0.00   0.00    0.00     0.00  117.77  98.80


Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0       1897.00   7596.00     2.00   0.11   70.03     4.00   38.00   1080.00   106.00  73.61   23.08    28.42    0.00      0.00     0.00   0.00    0.00     0.00  129.80  99.20


Device            r/s     rkB/s   rrqm/s  %rrqm r_await rareq-sz     w/s     wkB/s   wrqm/s  %wrqm w_await wareq-sz     d/s     dkB/s   drqm/s  %drqm d_await dareq-sz  aqu-sz  %util
mmcblk0       1906.00   7628.00     1.00   0.05   66.02     4.00   38.00   1144.00   112.00  74.67   23.00    30.11    0.00      0.00     0.00   0.00    0.00     0.00  122.70  98.40
```

测试结果

```
test_fio: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=32
...
fio-3.16
Starting 4 processes
Jobs: 4 (f=4): [r(4)][100.0%][r=8660KiB/s][r=2165 IOPS][eta 00m:00s]
test_fio: (groupid=0, jobs=4): err= 0: pid=4118: Sat Sep 19 09:45:00 2020
  read: IOPS=2121, BW=8486KiB/s (8689kB/s)(8287MiB/1000069msec)
    slat (usec): min=11, max=143677, avg=369.44, stdev=1271.49
    clat (usec): min=4, max=711276, avg=59960.95, stdev=59590.91
     lat (usec): min=15, max=711326, avg=60331.31, stdev=59652.03
    clat percentiles (usec):
     |  1.00th=[     7],  5.00th=[    10], 10.00th=[    11], 20.00th=[  8586],
     | 30.00th=[ 17433], 40.00th=[ 27132], 50.00th=[ 40633], 60.00th=[ 57934],
     | 70.00th=[ 80217], 80.00th=[108528], 90.00th=[147850], 95.00th=[179307],
     | 99.00th=[240124], 99.50th=[265290], 99.90th=[333448], 99.95th=[375391],
     | 99.99th=[471860]
   bw (  KiB/s): min= 2216, max=15280, per=100.00%, avg=8484.97, stdev=269.85, samples=8000
   iops        : min=  554, max= 3820, avg=2121.16, stdev=67.46, samples=8000
  lat (usec)   : 10=9.73%, 20=0.64%, 50=0.16%, 100=0.59%, 250=0.38%
  lat (usec)   : 500=0.01%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.45%, 4=2.49%, 10=7.13%, 20=11.21%, 50=23.04%
  lat (msec)   : 100=21.51%, 250=21.90%, 500=0.74%, 750=0.01%
  cpu          : usr=0.79%, sys=3.51%, ctx=1715462, majf=0, minf=214
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=100.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.1%, 64=0.0%, >=64=0.0%
     issued rwts: total=2121536,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=32

Run status group 0 (all jobs):
   READ: bw=8486KiB/s (8689kB/s), 8486KiB/s-8486KiB/s (8689kB/s-8689kB/s), io=8287MiB (8690MB), run=1000069-1000069msec

Disk stats (read/write):
  mmcblk0: ios=1866420/37218, merge=10304/103188, ticks=125973253/879501, in_queue=123030356, util=96.82%
```

- 修改iodpeth测试

```
fio -direct=1 -iodepth=16 -iodepth_batch=8 -iodepth_low=8 -iodepth_batch_complete=8 \
-rw=randread -ioengine=libaio -bs=4k -numjobs=4 -time_based=1 -runtime=1000 \
-group_reporting -filename=fio.img -size=1g -name=test_fio
```

看起来读使用iodepth 16太小了，性能反而不如iodepth 32

```
test_fio: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
...
fio-3.16
Starting 4 processes
Jobs: 4 (f=4): [r(4)][100.0%][r=5952KiB/s][r=1488 IOPS][eta 00m:00s]2s]
test_fio: (groupid=0, jobs=4): err= 0: pid=4172: Sat Sep 19 10:13:21 2020
  read: IOPS=1995, BW=7982KiB/s (8174kB/s)(7795MiB/1000034msec)
    slat (usec): min=92, max=734, avg=221.20, stdev=35.58
    clat (usec): min=9, max=459870, avg=31828.85, stdev=22314.84
     lat (usec): min=204, max=460118, avg=32050.35, stdev=22314.36
    clat percentiles (msec):
     |  1.00th=[    6],  5.00th=[    9], 10.00th=[   11], 20.00th=[   15],
     | 30.00th=[   18], 40.00th=[   22], 50.00th=[   27], 60.00th=[   32],
     | 70.00th=[   38], 80.00th=[   46], 90.00th=[   60], 95.00th=[   74],
     | 99.00th=[  111], 99.50th=[  127], 99.90th=[  165], 99.95th=[  186],
     | 99.99th=[  247]
   bw (  KiB/s): min= 2048, max=13696, per=99.98%, avg=7980.63, stdev=239.09, samples=8000
   iops        : min=  512, max= 3424, avg=1995.04, stdev=59.75, samples=8000
  lat (usec)   : 10=0.01%, 20=0.01%, 250=0.01%, 500=0.01%, 750=0.01%
  lat (usec)   : 1000=0.01%
  lat (msec)   : 2=0.03%, 4=0.20%, 10=7.18%, 20=30.03%, 50=46.24%
  lat (msec)   : 100=14.71%, 250=1.59%, 500=0.01%
  cpu          : usr=0.30%, sys=2.15%, ctx=1758674, majf=0, minf=154
  IO depths    : 1=0.0%, 2=0.0%, 4=0.0%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=0.0%, 8=100.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=0.0%, 8=100.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=1995576,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=7982KiB/s (8174kB/s), 7982KiB/s-7982KiB/s (8174kB/s-8174kB/s), io=7795MiB (8174MB), run=1000034-1000034msec

Disk stats (read/write):
  mmcblk0: ios=1762212/36647, merge=3134/101930, ticks=47642082/863119, in_queue=44880512, util=97.43%
```

# USB外接移动硬盘性能测试



# 参考

* [阿里云帮助文档: 测试块存储性能](https://help.aliyun.com/document_detail/147897.html)