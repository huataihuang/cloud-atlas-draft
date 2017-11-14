# 安装

[sysbench测试案例](https://wiki.mikejung.biz/Sysbench)提供了多种平台的安装方法，例如，可以通过EPEL

[sysbench GitHub文档](https://github.com/akopytov/sysbench)提供方法：

```bash
curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.rpm.sh | sudo bash
sudo yum -y install sysbench
```

# 压测案例

* 测试8个cpu的虚拟机性能

```bash
sysbench cpu --threads=8 --time=300 --cpu-max-prime=100000 run
```

> `cpu-max-prime` 寻找最大素数
>
> `time` 持续时间，默认是`--time=0`表示不限制时间

输出举例

```
sysbench 1.0.9 (using system LuaJIT 2.0.4)

Running the test with following options:
Number of threads: 8
Initializing random number generator from current time


Prime numbers limit: 100000

Initializing worker threads...

Threads started!

CPU speed:
    events per second:   278.78

General statistics:
    total time:                          300.0210s
    total number of events:              83639

Latency (ms):
         min:                                 27.98
         avg:                                 28.69
         max:                                126.48
         95th percentile:                     33.12
         sum:                            2399991.83

Threads fairness:
    events (avg/stddev):           10454.8750/37.61
    execution time (avg/stddev):   299.9990/0.01
```

# 参考

* [sysbench GitHub文档](https://github.com/akopytov/sysbench)
* [sysbench测试案例](https://wiki.mikejung.biz/Sysbench)
* [How To Benchmark Your System (CPU, File IO, MySQL) With sysbench](https://www.howtoforge.com/how-to-benchmark-your-system-cpu-file-io-mysql-with-sysbench)