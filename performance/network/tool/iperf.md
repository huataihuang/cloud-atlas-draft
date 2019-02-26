[iPerf/iPerf3](https://iperf.fr/)提供了IP网络的最大带宽测试功能，支持不通参数调整，包括时间，缓存和协议（TCp, UDP, SCTP, 协议 IPv4 和 IPv6）。每次策四可以报告带宽，丢包以及其他参数。

# iperf2 vs. iperf3

* `iperf2`
  * iperf2有windows版本  -  https://sourceforge.net/projects/iperf2/files/iperf-2.0.13a-win.exe/download
  * iperf2是多线程版本 - https://sourceforge.net/projects/iperf2/
  * iperf2只支持UDP模式带宽限制
  * 当前iperf2已经不是原来的开发者开发，但是依然活跃开发中

* `iperf3`
  * iperf3是完全重写的版本，目标是采用简化库方式来实现网络性能测试，但是需要注意iperf3是单线程工具 https://software.es.net/iperf/ ，所以推荐在多线程使用iperf2。
  * 如果要使用iperf3来测试多线程，采用的是多个服务和多个客户端方式，请参考 [iperf3 at 40Gbps and above](https://fasterdata.es.net/performance-testing/network-troubleshooting-tools/iperf/multi-stream-iperf3/)
  * iperf3支持TCP和UDP
  * iperf3提供了不同版本支持不同平台 - [下载](https://iperf.fr/iperf-download.php)

# 源代码安装

```
tar xfz iperf-3.6.tar.gz
cd iperf-3.6
./configure
make
make install
```

# 二进制安装

## Ubuntu安装

软件仓库已经包含了iperf3

```
apt update
apt-cache search iperf3
apt install iperf3
```

# 使用

* 服务器端启动：

iperf2使用如下命令启动

```
iperf -s -D
```

> `-D`表示后台服务模式，`-s`表示服务器端

对于iperf3，执行指定端口监听

```
iperf3 -s -p 5201 -D
```

* 客户端

iperf2测试

```
iperf -c 172.16.9.249 -t 86400 -l 8k -i 10
```

> * `-t`表示持续时间，86400秒就是24小时
> * `-l 8k`表示8k缓存
> * `-i 10`表示每10秒打印一个信息

上述命令是向服务器发送数据，如果要从服务器下载数据，则使用`-R`参数

上述命令会将整个带宽打满，所以很容易获得网络性能。

此外，`-b`参数可以限制流量，例如`-b 200M`就限制200Mb流量。不过，对于`iperf2`只支持UDP流量限流。

iperf3测试

```
iperf3 -c 192.168.101.1 -t 60 -l 8k -i 10 -b 500M -p 5201 -R
```

> * `-t`表示持续时间，600秒就是10分钟
> * `-l 8k`表示8k缓存
> * `-i 10`表示每10秒打印一个信息
> * `-b 500M`表示最高带宽500Mb/s
> * `-p 5201`表示端口
> * `-R`表示反向，也就是从服务器下载

测试输出

```
Reverse mode, remote host 192.168.101.1 is sending
[  5] local 192.168.101.81 port 60690 connected to 192.168.101.1 port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-10.00  sec   709 KBytes   580 Kbits/sec
[  5]  10.00-20.00  sec   636 KBytes   521 Kbits/sec
[  5]  20.00-30.00  sec   875 KBytes   717 Kbits/sec
[  5]  30.00-40.00  sec  1.16 MBytes   975 Kbits/sec
[  5]  40.00-50.00  sec  1.04 MBytes   874 Kbits/sec
[  5]  50.00-60.00  sec   853 KBytes   699 Kbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-60.00  sec  5.43 MBytes   759 Kbits/sec    0             sender
[  5]   0.00-60.00  sec  5.21 MBytes   728 Kbits/sec                  receiver

iperf Done.
```

* 自动重连

在使用iperf测试网络的时候，如果遇到网络抖动，可能客户端会出现如下报错

```
write failed: Connection reset by peer
```

此时客户端会退出。

但是这对一些测试环境是非常麻烦的，手工去处理是不可能的。

另外，我想了一个方法，通过cron脚本来实现

```bash
if ps aux | grep "iperf -c"| grep -v grep; then
    echo "iperf is running" > /dev/null
else
    iperf -c 172.16.9.249 -t 86400 -l 8k -i 10 -b 100M
fi
```

不过，对于iperf3，上述脚本也不能解决问题。因为iperf3是单线程程序，如果服务器启动并被一个客户端连接以后，后续其他客户端再连接就会提示错误：

```
iperf3: error - the server is busy running a test. try again later
```

解决的方法参考[iperf3 at 40Gbps and above](https://fasterdata.es.net/performance-testing/network-troubleshooting-tools/iperf/multi-stream-iperf3/)，在服务器端启动多个进程，并监听不同端口：

例如，以下脚本启动5个监听服务

```bash
for i in {1..5};do
    iperf3 -s -p 520${i} -D
done
```

则客户端脚本命令增加参数

```bash
if ps aux | grep "iperf -c"| grep -v grep; then
    echo "iperf is running" > /dev/null
else
    for i in {1..5};do
        iperf -c 172.16.9.249 -t 86400 -l 8k -i 10 -b 100M -p 520${i}
        if [ $? = 0]; then
            echo "iperf connect success" > /dev/null
            exit 0
        fi
    done
fi
```

> 还有一点问题暂时没有解决：虽然能够匹配某个连接，但是没有nohup放到后台。

# 参考

* [iperf3 FAQ](https://software.es.net/iperf/faq.html#faq)