当网络发生延迟问题时，可以在交换机上检查端口到端口的延迟。对于Cisco Nexus交换机，有一种称为延迟测试的方法，允许管理员规划网络拓扑，管理响应响应并标识出网络应用问题的原因。这种方案也能够提供对于延迟敏感型应用的SLA。

Cisco Nexus 5600系列交换机支持Cisco latency monitoring tool可以用来诊断网络延迟。

原理：

在每个数据包进出交换机端口时标记上一个时间戳只，然后计算系统中每个数据包的延迟，交换机会计算出数据包进入时间戳和发出时间戳，就能够实时显示所有端口的延迟时间。

默认，交换机已经激活了端口对的瞬间模式延迟监控（Instantaneous mode latency monitoring）。这个模式可以测量每个数据包的交换机延迟。这个交换机延迟工具工作在线性速率上，也就是不需要数据包采样。

该延迟测量工具是完全硬件实现的，不会影响数据包交换的CPU。

数据包延迟监控提供每个指定端口对的最小、平均和最大延迟，并且维护一个延迟直方图（精确到ns）：

![延迟监控数据包时间戳](../../../../img/network/cisco/switch/data_center/latency_monitor_package_timestamp.jpg)

当数据包进入到源端口，就会标记上时间戳t0，当离开目标端口，就会标记时间戳t1，延迟监控工具计算出(t1-t0)作为延迟值。

# 交换机延迟度量模式

* 瞬间模式： 该模式默认激活，无需配置。这个模式提供了快速检查端口对延迟的快照
* 线性直方图模式：这个模式用于检查数据包针对用户配置的延迟值之间的计数
* 幂数直方图模式：提供线性直方图的幂数视图
* 自定义直方图

在瞬时模式，最小，最大和平均延迟被采集，默认激活

# 检查延迟

* 检查入端口 Eth1/6 到 出端口 Eth1/1的延迟：

```
switch# show hardware profile latency monitor interface ethernet 1/1 interface ethernet 1/6
--------------------------------------------------------------------------------
Egress Port: Ethernet1/1 Ingress Port: Ethernet1/6 Mode: Inst
--------------------------------------------------------------------------------
| | Minimum | Maximum | Average |
--------------------------------------------------------------------------------
| cnt | 890 | 1020| 960 |
--------------------------------------------------------------------------------
```

* 配置线性模式

```
if base ≤ latency < base + step, increment CNT0
if base + step ≤ latency < base + 2 * step, increment CNT1
if base + 2 * step ≤ latency < base + 3 * step, increment CNT2
if base + 3 * step ≤ latency < base + 4 * step, increment CNT3
```

* 显示

```
switch# show hardware profile latency monitor interface ethernet 1/1 interface ethernet 1/6
--------------------------------------------------------------------------------
Egress Port: Ethernet1/1 Ingress Port: Ethernet1/6 Mode: Linear Histogram
--------------------------------------------------------------------------------
| Range| 800-840| 840-880| 880-920| 920-960|
--------------------------------------------------------------------------------
| cnt | 123009| 556009| 640003| 450243|
--------------------------------------------------------------------------------
```

# 参考

* [Latency Monitoring Tool on Cisco Nexus Switches: Troubleshoot Network Latency](https://www.cisco.com/c/en/us/products/collateral/switches/nexus-5000-series-switches/white-paper-c11-733025.html)