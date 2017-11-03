# 压测案例

* 测试8个cpu的虚拟机性能

```bash
sysbench cpu --threads=8 --time=300 --cpu-max-prime=100000 run
```

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