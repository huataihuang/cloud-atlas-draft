在检测文件系统性能时，经常会使用`iostat`工具，这个工具可以从设备级别了解磁盘的数据读写。对于和存储性能紧密相关的应用，例如数据库，`iostat`提供了观测方法。

```
$iostat
Linux 2.6.32 	09/19/2018 	_x86_64_	(24 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.60    0.17    2.79    0.99    0.00   93.44

Device:            tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sdc               5.22       217.12        44.13  173388621   35239832
sdb               5.03       212.42        43.97  169638797   35110792
...
sda              34.62        11.24       425.25    8972630  339604008
```

默认`iostat`输出包括了CPU使用，以及系统中每个磁盘信息：

* `tps` - 每秒传输数（I/O请求）
* `kB_read/s`和`kB_wrtn/s` - 当前设备读取和写入每秒kB
* `kB_read`和`kB_wrtn`是系统启动之后读取和写入的数据量

上述默认输出的单位是`kB`，如果想显示成`MB`，则使用参数`-m`

```
$iostat -m
Linux 2.6.32 09/19/2018 	_x86_64_	(24 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.60    0.17    2.79    0.99    0.00   93.44

Device:            tps    MB_read/s    MB_wrtn/s    MB_read    MB_wrtn
sdc               5.22         0.21         0.04     171106      34580
sdb               5.01         0.21         0.04     166960      34470
...
sda              34.63         0.01         0.42       8766     334982
```

# 参考

* [Linux iostat tips](http://www.dba-oracle.com/t_linux_iostat.htm)
* [How to use the Linux iostat command to check on your storage subsystem](https://www.techrepublic.com/article/how-to-use-the-linux-iostat-command-to-check-on-your-storage-subsystem/)
* [How to Read Linux Iostat’s Output and Interpret System Performance](https://www.xaprb.com/blog/2010/01/09/how-linux-iostat-computes-its-results/)
* [Monitoring Storage Devices with iostat](http://www.admin-magazine.com/HPC/Articles/Monitoring-Storage-with-iostat)