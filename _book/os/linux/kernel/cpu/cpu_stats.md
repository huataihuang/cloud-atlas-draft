

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

# 参考