# migration线程

在KVM物理服务器上，有时候发现有大量的`migration`内核线程在运行，这是什么意思呢？

```
#top
top - 15:25:50 up 21:50,  1 user,  load average: 1.54, 1.72, 1.68
Tasks: 1246 total,  30 running, 1216 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.9 us, 18.1 sy,  0.0 ni, 79.9 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem : 39474374+total,  2673812 free, 38875446+used,  3315484 buff/cache
KiB Swap:        0 total,        0 free,        0 used.  4553544 avail Mem

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
  9479 root      20   0  477260  26464   7212 D 170.5  0.0 630:45.92 qemu-kvm
 10198 root      20   0  320408  21064   7164 S 160.7  0.0 311:34.86 qemu-kvm
  8644 root      20   0  469068  24308   7148 S 154.1  0.0 585:11.22 qemu-kvm
 10961 root      20   0  320408  21068   7164 S 110.5  0.0 241:48.08 qemu-kvm
   500 root      rt   0       0      0      0 S  17.7  0.0  68:22.87 migration/9
   510 root      rt   0       0      0      0 R  17.7  0.0  68:17.16 migration/11
   515 root      rt   0       0      0      0 R  17.7  0.0  68:14.61 migration/12
   520 root      rt   0       0      0      0 R  17.7  0.0  68:12.32 migration/13
   540 root      rt   0       0      0      0 R  17.7  0.0  68:02.97 migration/17
   550 root      rt   0       0      0      0 R  17.7  0.0  67:58.50 migration/19
   560 root      rt   0       0      0      0 R  17.7  0.0  67:54.37 migration/21
   565 root      rt   0       0      0      0 R  17.7  0.0  67:52.17 migration/22
   505 root      rt   0       0      0      0 R  17.4  0.0  68:20.30 migration/10
   525 root      rt   0       0      0      0 R  17.4  0.0  68:09.29 migration/14
...
```




# 参考

* [How migration thread works inside of Linux Kernel](https://www.systutorials.com/239971/migration-thread-works-inside-linux-kernel/)