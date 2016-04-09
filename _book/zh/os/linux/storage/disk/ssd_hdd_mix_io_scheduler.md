# 说明

大家都知道[磁盘IO调度器](disk_io_scheduler.md)平衡了IO吞吐量和IO响应时间，针对不同的磁盘类型，HDD或SSD，提供了相应的优化调度方法。通常，内核编译时候，选择CFQ作为默认的IO scheduler，适合于HDD设备。如果我们使用SSD设备（如现在主流的笔记本），则可以在Linux启动的时候，通过Grub向内核传递 `elevator=deadline`来更改访问SSD设备的IO scheduler。

但是，在线上的服务器，有些针对特定应用采用的混合磁盘类型的服务器，如采用部分SSD磁盘，部分HDD磁盘，则采用这种一刀切调整IO scheduler就不合理，不论是采用`CFQ`还是`deadline`都无法完全满足要求。

这就要求我们的设置方法能够根据服务器安装的磁盘类型，自动检测并采用对应的IO scheduler。

**`动态调整混合存储的io scheduler`**

# 找出系统所有磁盘设备

```bash
ls /sys/block/ | grep sd
```

> 参考 [Find all storage devices attached to a Linux machine](http://stackoverflow.com/questions/200960/find-all-storage-devices-attached-to-a-linux-machine)。注意：如果要找到所有分区可以查看`/proc/partitions`。注意，块设备有很多，其中磁盘设备以`sd`开头。

# 分辨设备是SSD还是HDD

设备是SSD还是HDD可以通过`cat /sys/block/sda/queue/rotational`内容来区分，其中内容为`1`表示是传统磁盘HDD，如果内容是`0`则表示SSD

> 参考[How to know if a disk is an SSD or an HDD](http://unix.stackexchange.com/questions/65595/how-to-know-if-a-disk-is-an-ssd-or-an-hdd)

# 设置SSD设备io scheduler

可以`on fly`方式动态修改SSD设备的io scheduler

```bash
echo deadline > /sys/block/sda/queue/scheduler
```

# 结合脚本命令设置磁盘io scheduler

* 扫描所有磁盘检查是否是SSD（这个命令也就是先验证一遍是否是SSD，为后面准备批量调整）

```bash
for i in `ls /sys/block/ | grep sd`;do ( if [[ `cat /sys/block/$i/queue/rotational` == 0 ]]; then echo "$i ok";else echo "$i ng";fi );done 
```

可以看到输出内容符合预期

```bash
sda ok
sdb ng
sdc ng
sdd ng
sde ng
sdf ng
sdg ng
sdh ng
sdi ng
sdj ng
sdk ok
sdl ok
```

* 现在我们可以一次性调整好所有符合要求的SSD的io scheduler为`deadline`，HDD的io scheduler为`cfq` (需要使用`root`权限调整)

```bash
for i in `ls /sys/block/ | grep sd`;do ( if [[ `cat /sys/block/$i/queue/rotational` == 0 ]]; then echo deadline > /sys/block/$i/queue/scheduler;else echo cfq > /sys/block/$i/queue/scheduler;fi );done 
```

* 验证调整是否成功

```bash
for i in `ls /sys/block/ | grep sd`;do ( echo $i; cat /sys/block/$i/queue/scheduler );done
```

检查结果符合预期

```bash
sda
noop anticipatory [deadline] cfq 
sdb
noop anticipatory deadline [cfq] 
sdc
noop anticipatory deadline [cfq] 
sdd
noop anticipatory deadline [cfq] 
sde
noop anticipatory deadline [cfq] 
sdf
noop anticipatory deadline [cfq] 
sdg
noop anticipatory deadline [cfq] 
sdh
noop anticipatory deadline [cfq] 
sdi
noop anticipatory deadline [cfq] 
sdj
noop anticipatory deadline [cfq] 
sdk
noop anticipatory [deadline] cfq 
sdl
noop anticipatory [deadline] cfq
```

----

**`持久化调整混合存储的io scheduler`**

Linux 的 udev rule 可以针对不同的磁盘类型设置io scheduler，方法如下

* 编辑`/etc/udev/rules.d/60-ssd-scheduler.rules`内容如下

```bash
# set deadline scheduler for non-rotating disks
ACTION=="add|change", KERNEL=="sd[a-z]", ATTR{queue/rotational}=="0", ATTR{queue/scheduler}="deadline"
```

* 刷新udev规则

```bash
udevcontrol reload_rules
```

* 以上配置就使得当系统重启或者插拔SSD磁盘时，系统就会自动设置好SSD的io scheduler。可以重启一台NC验证一下

> 参考[Debian - SSDOptimization](https://wiki.debian.org/SSDOptimization#Low-Latency_IO-Scheduler)