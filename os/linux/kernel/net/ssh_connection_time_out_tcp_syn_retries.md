最近在测试虚拟机网络连接问题，遇到一个问题：服务器响应缓慢，往往会出现连接超时：

```
ssh: connect to host 172.16.1.129 port 22: Connection timed out
```

最初我想到的是SSH有相关参数`ConnectTimeout`，是否使用这个参数能够解决这个问题呢？我一点点提高这个参数，并且在ssh命令前后加上`date`验证超时时间：

```
echo -n  "start ssh..."
date
ssh -o ConnectTimeout=240 172.16.1.129 "echo -n 'Inside VM...';date"
date
```

出乎意料，发现实际上并没有达到4分钟超时就断开了：

```
Tue Jun 26 23:15:47 CST 2018
ssh: connect to host 172.16.1.129 port 22: Connection timed out
Tue Jun 26 23:16:08 CST 2018
```

准确地说，只有23秒钟就显示连接超时，似乎SSH命令的`ConnectTimeout`完全没有作用。

后来想到了，这个`ConnectTimeout`实际上是连接ssh以后，不断通过idle发送tip来保持连接的参数。而这里实际上是TCP连接超时，这个超时是受到内核TCP参数限制的：

TCP连接需要通过发起SYN数据包来建立，如果没有收到初始的SYN数据包响应，内核会重试一定次数。内核会在发送SYN重试之间不断增加等待时间，以避免flooding缓慢的服务器。

对于BSD系列内核，包括Mac OS X，标准第二次SYN数据包将在第一次SYN的6秒之后发送，然后是18秒之后发送第三次SYN，最终在75秒之后超时。

对于Linux内核，默认的重试循环将在20秒之后结束。Linux将在20秒之内尝试发送5次SYN，但这个包含最初的数据包。实际上5次数据包之间间隔（3s, 6s, 12s, 24s）

要修改这个连接超时，需要修改内核参数`net.ipv4.tcp_syn_retries`

* 检查默认内核参数

```
# cat /proc/sys/net/ipv4/tcp_syn_retries 
5
```

* 增加默认内核参数

```
echo 6 | sudo tee /proc/sys/net/ipv4/tcp_syn_retries 
```

但是，非常奇怪，这次测试连接虽然有时候完全符合预期，保持超过34秒之后能够正确连接到ssh服务器

```
start ssh...Tue Jun 26 23:58:05 CST 2018
Inside VM...Tue Jun 26 23:58:42 CST 2018
Tue Jun 26 23:58:45 CST 2018

start ssh...Tue Jun 26 23:59:49 CST 2018
Inside VM...Wed Jun 27 00:00:26 CST 2018
Wed Jun 27 00:00:30 CST 2018
```

但是偶然也有10秒就出现`Connection timed out`，而且每次都是10秒钟就出现`Connection timed out`，不符合预期

```
start ssh...Tue Jun 26 23:56:06 CST 2018
ssh: connect to host 172.16.1.129 port 22: Connection timed out
Tue Jun 26 23:56:16 CST 2018

start ssh...Wed Jun 27 00:00:35 CST 2018
ssh: connect to host 172.16.1.129 port 22: Connection timed out
Wed Jun 27 00:00:45 CST 2018
```

但是，我注意到虚拟机内部时钟和ssh客户端时钟相差了3~4秒，会不会影响到timeout?

也有接近预期的timeout - 45秒超时（3,6,12,24,48）

```
Wed Jun 27 00:06:39 CST 2018
ssh: connect to host 172.16.1.129 port 22: Connection timed out
Wed Jun 27 00:07:24 CST 2018
```

改为重试次数7之后，93秒超时 (3,6,12,24,48,96)

```
Wed Jun 27 00:10:35 CST 2018
ssh: connect to host 172.16.1.129 port 22: Connection timed out
Wed Jun 27 00:12:08 CST 2018
```

# 参考

* [Increase SSH ConnectTimeout greater than 60 seconds](https://unix.stackexchange.com/questions/179038/increase-ssh-connecttimeout-greater-than-60-seconds)
* [Overriding the default Linux kernel 20-second TCP socket connect timeout](http://www.sekuda.com/overriding_the_default_linux_kernel_20_second_tcp_socket_connect_timeout)