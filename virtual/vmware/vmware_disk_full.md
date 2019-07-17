在VMware Fusion中创建Ubuntu虚拟机，分配了6G虚拟机磁盘，因为我预估主要是作为模版，安装软件包有限，应该不需要很多磁盘空间。

但是在运行时，时不时提示窗口弹出：

```
VMwaree Fusion has paused this virtual machine because the disk on which the virtual machine is stored is almost full.
```

但是观察Ubuntu虚拟机内部磁盘空间只使用了 50%

```
huatai@ubuntu18-04 ➜  ~ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            953M     0  953M   0% /dev
tmpfs           197M  1.3M  196M   1% /run
/dev/sda2       5.4G  2.6G  2.6G  50% /             <= 虚拟机内部空间充足
tmpfs           985M     0  985M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           985M     0  985M   0% /sys/fs/cgroup
/dev/loop0       89M   89M     0 100% /snap/core/7270
/dev/loop1       91M   91M     0 100% /snap/core/6350
/dev/sda1       511M  8.0M  504M   2% /boot/efi
tmpfs           197M     0  197M   0% /run/user/501
```

而物理主机（macOS)却非常奇怪：

```
➜  ~ df -h
Filesystem      Size   Used  Avail Capacity iused      ifree %iused  Mounted on
/dev/disk1s5   233Gi  9.9Gi  6.6Gi    60%  476036 2447625284    0%   /
devfs          197Ki  197Ki    0Bi   100%     682          0  100%   /dev
/dev/disk1s1   233Gi  205Gi  6.6Gi    97% 7779652 2440321668    0%   /System/Volumes/Data
/dev/disk1s4   233Gi   10Gi  6.6Gi    61%      10 2448101310    0%   /private/var/vm
map auto_home    0Bi    0Bi    0Bi   100%       0          0  100%   /home
/dev/disk1s3   233Gi  1.4Gi  6.6Gi    18%      65 2448101255    0%   /Volumes/Recovery
```

显示磁盘卷 `map auto_home` 是百分百使用，但是磁盘空间还是有的。似乎是物理主机显示的磁盘空间不足