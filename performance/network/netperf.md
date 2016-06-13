[netperf](http://www.netperf.org/netperf/NetperfPage.html)是一个非常简单有效测试网络性能的工具。分服务端程序`netserver`和客户端程序`netperf`，首先在服务器段启动`netserver`监听，然后就可以在客户端启动`netperf`对服务器进行网路流量压测，可以非常方便得到性能指标。

# 测试案例

* 测试TCP带宽

```bash
/usr/local/bin/netperf -H 192.168.1.1 -t TCP_RR -l 360000000 -- -m 1501
```

> `-H` 远程服务器IP
>
> `-l` 持续时间，单位秒
>
> `-m` 分组大小

* 测试UCP带宽

```bash
/usr/local/bin/netperf -H 192.168.1.1 -t UDP_STREAM -l 360000000 -- -m 200
```

> `-t UDP_STREAM` 可以测试UDP批量传输时的网络性能

# 问题排查

* `UDP_STREAM`测试时候报错`netperf: send_omni: send_data failed: Network is unreachable`

测试环境如下：

服务器A的IP地址是 `192.168.1.1` ，服务器B的IP地址是 `10.1.1.1`，两个服务器通过三层路由交换机连接，已设置路由规则，所以两个服务器之间`ping`检查网络是完全通的。但是，执行如下命令出现问题

```bash
netperf -H 10.1.1.1 -t UDP_STREAM -l 360000000 -- -m 200
```

提示信息

```
MIGRATED UDP STREAM TEST from 0.0.0.0 (0.0.0.0) port 0 AF_INET to 10.1.1.1 () port 0 AF_INET
send_data: data send error: errno 101
netperf: send_omni: send_data failed: Network is unreachable
```

参考[Error in running netperf udp stream over openvpn](http://stackoverflow.com/questions/11981480/error-in-running-netperf-udp-stream-over-openvpn)，原来`netperf`在`UDP_STREAM`测试时，默认是禁止IP路由的，所以只能在同一个网段测试`UDP_STREAM`。如果要在不同网段测试`UDP_STREAM`，则要使用`-R 1`参数来启用路由，上述命令需要修改成：

```bash
netperf -H 10.1.1.1 -t UDP_STREAM -l 360000000 -- -m 200 -R 1
```

# 参考

* [netperf 与网络性能测量](https://www.ibm.com/developerworks/cn/linux/l-netperf/)
* [Error in running netperf udp stream over openvpn](http://stackoverflow.com/questions/11981480/error-in-running-netperf-udp-stream-over-openvpn)