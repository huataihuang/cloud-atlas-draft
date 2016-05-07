在排查服务器IO繁忙的原因时，需要检查哪个进程在频繁IO。在Linux内核提供了`block_dump`参数来把block读写（`WRITE/READ`）情况dump到日志中，这样就可以使用`dmesg`命令来查看：

```bash
sysctl vm.block_dump=1
```

或者

```bash
echo 1 > /proc/sys/vm/block_dump
```

然后就可以通过`dmesg`观察到各个进程的IO活动情况

```bash
dmesg -c
```

> 注意：其中日志中`WRITE block 0`，`WRITE block 16`, `WRITE block 104`中的数字表示写到了哪个block 而 **不是** 写了多少blocks。

统计一段时间以后，可以再关闭`blcok_dump`功能

```bash
sysctl vm.block_dump=0
```

可以采用如下简单的方法采样3秒钟：

```bash
sudo sysctl -w "vm.block_dump=1"; sleep 3; sudo sysctl -w "vm.block_dump=0"
```

采用如下命令统计当前占用IO最高的10个进程

```bash
dmesg |awk -F: '{print $1}'|sort|uniq -c|sort -rn|head -n 10
```

# 参考

* [通过dmesg分析占用io程序](http://iblog.daobidao.com/linux-io-program-through-dmesg-analysis-occupancy.DaoBiDao)
* [监测 Linux 进程的实时 IO 情况](http://www.vpsee.com/2010/07/monitoring-process-io-activity-on-linux-with-block_dump/)