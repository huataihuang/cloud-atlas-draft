> 业务反馈虚拟机访问分布式存储间歇性存在延迟问题，初步排查了虚拟化相关性能，没有发现异常。所以怀疑可能是网络问题。以下是一个简单的排查网络延迟的方法：

* 使用`ping -i 0.1 xxx.x.x.x`来加快ping包频率，可以快速反映出网络是否有性能问题。（默认ping间隔1秒，对于网络抖动不容易发现问题）
* 使用`tcpdump -n host xxx.x.x.x and icmp`检查两边服务器上ping包，当出现响应延迟时，记录下ping包的id，然后根据id检查两边tcpdump的时间戳，对比时间戳差异就可以知道在那段出现延迟。

案例命令

```
tcpdump -nni eth0  icmp and host IP1 and host IP2
```

写入抓包文件

```
tcpdump -w /tmp/icmp.pcap  -nni eth0  icmp
```

如果只抓包100mb

```
tcpdump -C 100 -w /tmp/icmp.pcap  -nni eth0  icmp
```

还可以重复抓多个100mb的包，例如以下是存储50个文件(也就是 5 gb)

```
tcpdump -W 50 -C 100 -w /tmp/icmp.pcap  -nni eth0  icmp
```

存储的抓包文件可以使用Wireshark查看，显示过滤:

```
ip.addr==IP and not icmp.resp_in and icmp.type==8
```

# 案例

* A主机：192.168.1.109
* B主机：192.168.4.135

192.168.1.109 A主机上执行：

```
sudo tcpdump -n -i eth0 host 192.168.4.135 and icmp
```

在另一台192.168.4.135 B主机上反向抓包：

```
sudo tcpdump -n -i eth0 host 192.168.1.109 and icmp
```

然后在 `192.168.4.135` 上 ping `192.168.1.109`，当出现响应延迟时候终止ping，记录下id。例如，以下案例可以看到响应时间突然增加到`10.1 ms`，对应到icmp包`icmp_seq`是`363`。接下来就是根据这个`363`id来检查两边tcpdump上到时间戳

```
64 bytes from 192.168.1.109: icmp_seq=361 ttl=64 time=0.068 ms
64 bytes from 192.168.1.109: icmp_seq=362 ttl=64 time=2.29 ms
64 bytes from 192.168.1.109: icmp_seq=363 ttl=64 time=10.1 ms  <== 这个包延迟明显
64 bytes from 192.168.1.109: icmp_seq=364 ttl=64 time=1.26 ms
64 bytes from 192.168.1.109: icmp_seq=365 ttl=64 time=0.070 ms
```
对比时间戳

192.168.1.109显示：

```
20:47:02.864948 IP 192.168.4.135 > 192.168.1.109: ICMP echo request, id 18467, seq 363, length 64
20:47:02.864966 IP 192.168.1.109 > 192.168.4.135: ICMP echo reply, id 18467, seq 363, length 64
```

192.168.4.135显示：

```
20:47:02.853050 IP 192.168.4.135 > 192.168.1.109: ICMP echo request, id 18467, seq 363, length 64
20:47:02.863233 IP 192.168.1.109 > 192.168.4.135: ICMP echo reply, id 18467, seq 363, length 64
```

发出的包中间网络时间： `20:47:02.864948 - 20:47:02.853050 = 11.898 ms`

返回的包中间网络时间： `20:47:02.864966 - 20:47:02.863233 = 1.733 ms`

可以确定从 `192.168.4.135` 到 `192.168.1.109` 出现了较大延迟，可以检查一下这个链路方向网络交换机以及链路。

# 参考

* [Using tcpdump to verify ICMP polling.](https://www.ibm.com/support/pages/using-tcpdump-verify-icmp-polling)