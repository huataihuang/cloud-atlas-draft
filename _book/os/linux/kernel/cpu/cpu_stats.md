

# 排查系统中system占用过高进程

`pidstat`命令可以报告进程当前在哪个CPU上执行，并且输出该进程的`us`和`sys`占用率，对于一些大量消耗`sys`但几乎没有`us`的`畸形`程序进程非常有用。以下是几条简单命令排序输出`sys`占用最高的10个进程

```
pidstat
```

可以输出类似如下

```
Linux 3.10.0-514.2.2.el7.x86_64 (testtfs-1-3.sqa.ztt) 	12/20/2016 	_x86_64_	(24 CPU)

11:33:42 PM   UID       PID    %usr %system  %guest    %CPU   CPU  Command
11:33:43 PM   107     37687    0.00    0.00    0.00    0.00     5  qemu-kvm
11:33:44 PM   107     37687    0.00    0.00    1.00    1.00     5  qemu-kvm
11:33:45 PM   107     37687    0.00    0.00    0.00    0.00     5  qemu-kvm
11:33:46 PM   107     37687    1.00    0.00    0.00    1.00     5  qemu-kvm
```

例如在CentoSO 7上可以使用如下命令找出占用sys最多的10个进程

```
pidstat | grep -v PID | grep -v `uname -r` | grep -v "^$" | sort -k 6 | tail -10
```

# 排查系统中D住进程

```
while true; do date; ps auxf | awk '{if($8=="D") print $0;}'; sleep 1; done
```

可以看到类似如下输出

```
Wed Jan 11 21:45:30 CST 2017
root       414  0.0  0.0      0     0 ?        D     2014 562:43  \_ [kjournald]
root     24030  0.0  0.0      0     0 ?        D     2014 486:33  \_ [flush-8:32]
root      5631  2.0  0.0 116756 14080 ?        D    21:45   0:00  |   |       \_ /opt/tdc/tdc_admin lsi
root      6033  0.0  0.0  18732   300 ?        D    21:45   0:00  |   |           \_ /usr/sbin/xl network-list 3531
root      6036  0.0  0.0  58964   556 ?        D    21:45   0:00  |               \_ tail -n 6000 /var/log/messages
Wed Jan 11 21:45:31 CST 2017
root       414  0.0  0.0      0     0 ?        D     2014 562:43  \_ [kjournald]
root      5631  2.4  0.1 119828 19880 ?        D    21:45   0:00  |   |       \_ /opt/tdc/tdc_admin lsi
root      6101  3.0  0.0  72192  2908 ?        D    21:45   0:00  |   |           \_ /usr/bin/python /usr/sbin/xm li
root      6063  1.0  0.0  58948   520 ?        D    21:45   0:00  |               \_ cat /var/log/messages
Wed Jan 11 21:45:33 CST 2017
root       414  0.0  0.0      0     0 ?        D     2014 562:43  \_ [kjournald]
root      2138  0.0  0.0      0     0 ?        D     2014 549:08  \_ [flush-8:0]
root      5631  2.3  0.1 121876 24392 ?        D    21:45   0:00  |   |       \_ /opt/tdc/tdc_admin lsi
root      6101  3.0  0.0 119524  5340 ?        D    21:45   0:00  |   |           \_ /usr/bin/python /usr/sbin/xm li
root      6063  1.5  0.0  58948   520 ?        D    21:45   0:00  |   |           \_ cat /var/log/messages
root      6270  2.0  0.0  64116  1476 ?        D    21:45   0:00  |       \_ /bin/bash /usr/alisys/dragoon/libexec/alimonitor2/get_server_hardware_syslog
```

参考 [What Process is using all of my disk IO](http://stackoverflow.com/questions/488826/what-process-is-using-all-of-my-disk-io)