TCP BBR是一种TCP冲突控制算法，由Google开发。BBR科夫了传统的TCP冲突控制算法(Beno或GUBIC)的缺点，实现了较高的带宽和较低的延迟。TCP BBR已经在Google.com、YouTube和Google Cloud Platform得到了使用。IETF组织已经在2017年7月确立该算法标准。

BBR只要求修改服务器端，例如在Linux Web服务器，激活TCP BBR可以实现web网站更高的页面下载速度。

# 检查Linux的TCP冲突控制算法

默认情况下，Linux使用`Reno`和`GUBIC`冲突控制算法，检查方法如下

```
sysctl net.ipv4.tcp_available_congestion_control
```

输出：

```
net.ipv4.tcp_available_congestion_control = cubic reno
```

检查当前使用的冲突控制算法：

```
sysctl net.ipv4.tcp_congestion_control
```

显示输出

```
net.ipv4.tcp_congestion_control = cubic
```

# 安装内核 4.9或更高版本

对于Ubuntu LTS版本，如果选择安装Hardware Enablement Stack(HWE)版本内核，就会相应安装较新的内核版本。

```
sudo apt update
sudo apt install --install-recommends linux-generic-hwe-18.04
```

# 激活TCP BBR

当使用内核高于4.9时，可以通过修改 `sysctl.conf` 配置激活TCP BBR

```
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

然后刷新内核配置

```
sudo sysctl -p
```

再次检查使用的冲突控制算法：

```
sysctl net.ipv4.tcp_congestion_control
```

可以看到输出：

```
net.ipv4.tcp_congestion_control = bbr
```

# 测试对比

```
iperf3 -c 192.168.101.1 -t 60 -l 8k -i 10 -p 5201 -R
```

测试输出

```
Reverse mode, remote host 192.168.101.1 is sending
[  5] local 192.168.101.81 port 62551 connected to 192.168.101.1 port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-10.00  sec  41.0 MBytes  34.4 Mbits/sec
[  5]  10.00-20.00  sec  17.7 MBytes  14.9 Mbits/sec
[  5]  20.00-30.00  sec  12.7 MBytes  10.7 Mbits/sec
[  5]  30.00-40.00  sec  3.13 MBytes  2.63 Mbits/sec
[  5]  40.00-50.00  sec  3.61 MBytes  3.03 Mbits/sec
[  5]  50.00-60.00  sec  7.83 MBytes  6.56 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-60.00  sec  88.2 MBytes  12.3 Mbits/sec  2015             sender
[  5]   0.00-60.00  sec  86.0 MBytes  12.0 Mbits/sec                  receiver
```

```
[  5] local 192.168.101.81 port 62600 connected to 192.168.101.1 port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-10.00  sec  11.3 MBytes  9.45 Mbits/sec
[  5]  10.00-20.00  sec  4.35 MBytes  3.65 Mbits/sec
[  5]  20.00-30.00  sec  19.4 MBytes  16.2 Mbits/sec
[  5]  30.00-40.00  sec  25.6 MBytes  21.5 Mbits/sec
[  5]  40.00-50.00  sec  20.6 MBytes  17.3 Mbits/sec
[  5]  50.00-60.00  sec  19.5 MBytes  16.3 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-60.00  sec   103 MBytes  14.4 Mbits/sec  3443             sender
[  5]   0.00-60.00  sec   101 MBytes  14.1 Mbits/sec                  receiver
```

# 参考

* [How to Easily Boost Ubuntu 16.04/17.10 Network Performance by Enabling TCP BBR](https://www.linuxbabe.com/ubuntu/enable-google-tcp-bbr-ubuntu)