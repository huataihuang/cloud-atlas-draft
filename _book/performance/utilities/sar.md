# 检查内存页使用

```
sar -B 2
```

输出显示

```
Linux 2.6.32-358.el5.x86_64 (server1.example.com) 	12/08/2016 	_x86_64_	(48 CPU)

03:39:34 PM  pgpgin/s pgpgout/s   fault/s  majflt/s  pgfree/s pgscank/s pgscand/s pgsteal/s    %vmeff
03:39:36 PM  29765.50  10182.50  98349.00    180.00 118255.00  11456.00      0.00   9827.00     85.78
03:39:38 PM  81624.50  36846.50  47286.50    726.00 107153.00  31520.00      0.00  20040.50     63.58
03:39:40 PM  20985.00   7027.00  30115.00    128.50  86342.00   3264.00      0.00   2594.00     79.47
03:39:42 PM  25380.00   9696.50   6531.50    109.50  76813.50  12320.00      0.00   9161.00     74.36
```

# 检查网络流量

```
sar -n DEV 1
```

> `1`表示每秒检查一次

# 检查历史记录

```
sar -f /var/log/sa/sa22 -s 21:25:00 -e 21:35:00 -n DEV -i 1
```

> `-f` 指定读取哪个历史记录文件
>
> `-s`和`-e`参数指定数据展示的开始和结束时间
>
> `-n DEV -i 1` 检查网络，并且每分钟一次数据的输出

# 检查磁盘负载

`-d` 参数检查磁盘传输

```
sar -d 
```

不过因为`sysstat`默认不开启磁盘负载的日志（避免大量磁盘的系统大量记录日志），所以会出现以下报错

```
Requested activities not available in file /var/log/sa/sa23
```

解决的方法是修改`sysstat`服务的配置`/etc/sysconfig/sysstat`

```
SADC_OPTIONS="-d"
```

然后重启`sysstat`

```
service sysstat restart
```

等待数据收集（至少20分钟前），就可以使用`sar -d`了。

# 参考

* [Examples of using SAR command for system monitoring in Linux](http://www.slashroot.in/examples-using-sar-command-system-monitoring-linux)
* [How do I configure sar to collect disk information (ala -d)?](http://superuser.com/questions/573773/how-do-i-configure-sar-to-collect-disk-information-ala-d)