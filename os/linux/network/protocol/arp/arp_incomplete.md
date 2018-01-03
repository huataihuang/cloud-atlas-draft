# 异常问题

在局域网中

* 网关 30.17.44.254
* host A: 30.17.44.236/24
* host B: 30.17.44.12/24

有时候，突然会发生 A 不能访问 B（无法ping或者ssh到B），但是，此时在B主机上，ping外部网络都是正常的（通过网关）。而A访问外部网络也正常。

由于A和B是同一个网段的两个主机，所以就推测到问题和ARP有关

# 排查

当异常发生时，在B主机上检查：

```
[root@devstack ~]# arp -an
? (30.17.44.254) at 58:69:6c:31:de:16 [ether] on wlp3s0
? (172.17.0.2) at 02:42:ac:11:00:02 [ether] on docker0
? (172.17.0.5) at 02:42:ac:11:00:05 [ether] on docker0
? (30.17.44.236) at <incomplete> [ether] on wlp3s0
? (172.17.0.6) at 02:42:ac:11:00:06 [ether] on docker0
? (172.17.0.9) at <incomplete> on docker0
? (172.17.0.8) at 02:42:ac:11:00:08 [ether] on docker0
? (192.168.122.11) at 52:54:00:82:87:0e [ether] on virbr0
```

可见B主机上无法找到A主机`30.17.44.236`的ARP地址。

在RedHat的知识库有一篇["arp" or "ip neigh" showing hardware MAC address as INCOMPLETE](https://access.redhat.com/solutions/2453931)提到了解决

推测是内核存在问题或者是某个内核设置存在问题，导致ARP表被刷新过期。具体原因我还需要再探索。

* 可以使用`ip neighbour`显示MAC地址

```
[root@devstack ~]# ip neigh
30.17.44.254 dev wlp3s0 lladdr 58:69:6c:31:de:16 STALE
172.17.0.2 dev docker0 lladdr 02:42:ac:11:00:02 STALE
172.17.0.5 dev docker0 lladdr 02:42:ac:11:00:05 REACHABLE
30.17.44.236 dev wlp3s0 lladdr b8:e8:56:33:e4:8a REACHABLE
172.17.0.6 dev docker0 lladdr 02:42:ac:11:00:06 STALE
172.17.0.9 dev docker0  INCOMPLETE
172.17.0.8 dev docker0 lladdr 02:42:ac:11:00:08 STALE
192.168.122.11 dev virbr0 lladdr 52:54:00:82:87:0e STALE
```

`STALE` 表示不新鲜的，即可能会过期（如果长时间没有数据通讯到`30.17.44.254`则这个ARP缓存会过期）。如何转换这个ARP状态呢？我们尝试`ping 30.17.44.254`，完成一个短暂的`ping`验证网络联通正常后，再次检查`arp -an`可以看到：

```
[root@devstack ~]# ip neigh
30.17.44.254 dev wlp3s0 lladdr 58:69:6c:31:de:16 DELAY
...
```

可以看到这条ARP记录被延迟失效，而且，再次使用`ip neighbour`检查，可以看到这个目标地址ARP转变成了`REACHABLE`

```
[root@devstack ~]# ip neigh
30.17.44.254 dev wlp3s0 lladdr 58:69:6c:31:de:16 REACHABLE
```

## 和ARP相关的内核参数`cg_XXXX`

> 详细请参考[Configuring ARP age timeout](https://stackoverflow.com/questions/15372011/configuring-arp-age-timeout)和[2.1. Address Resolution Protocol (ARP)](http://linux-ip.net/html/ether-arp.html)

ARP性能调整的参数位于 `/proc/sys/net/ipv4/neigh/default` 目录下，有：

* `gc_interval` - 默认值30，表示30秒进行一次`gc`
* `gc_stale_time` - 默认值60。注意：路由缓存的垃圾回收时间就是这个值的5倍
* `gc_thresh1`
* `gc_thresh2`
* `gc_thresh3`

> 以上内核参数值尚未仔细研究，待查证

在neighbor缓存对象失效或只是被标记为`stale/invalid`是有细微区别的。介于`base_reachable_time/2`和`3*base_reachable_time/2`之间，则对象还会在缓存中，但是会被标记为`STALE`状态。可以通过`ip -s neighbor show`进行检查：

```
$ ip -s neighbor list
192.168.42.1 dev eth0 lladdr 00:25:90:7d:7e:cd ref 2 used 184/184/139 probes 4 STALE
192.168.10.2 dev eth0 lladdr 00:1c:23:cf:0b:6a ref 3 used 33/28/0 probes 1 REACHABLE
192.168.10.1 dev eth0 lladdr 00:17:c5:d8:90:a4 ref 219 used 275/4/121 probes 1 REACHABLE
```

当出于STALE状态，如果ping这个地址，就会正确发送给`00:25:90:7d:7e:cd`数据包。一秒钟或者稍后，就通常会发送一个ARP请求"who has 192.168.42.1"以便能够更新它的缓存回到`REACHABLE`状态。但是，有时候内核会基于更高层协议反馈修改timeout值。这意味着，如果`ping 192.168.42.1`并且它答复，则内核可能并不会发送ARP请求因为它假定这个pong已经表明了ARP缓存值是正确的。如果这个对象是`STALE`状态，它也会被已经查看到的主动ARP相应更新。



# 临时的解决方法

## 强制刷新网络接口arp

参考[Clear the arp cache on linux, really](https://unix.stackexchange.com/questions/192313/clear-the-arp-cache-on-linux-really)使用如下命令强制刷新arp

```
ip link set arp off dev wlp3s0
ip link set arp on dev wlp3s0
```

## 重启网络接口

根据故障排查经验，通过简单的重启网络接口可以强制刷新arp

```
ifdown wlp3s0
ifup wlp3s0
```

之后通常可以正常通讯。

## 设置静态ARP解析解决

临时解决的方法可以参考[Linux下Mac地址绑定防范arp病毒攻击](http://soft.chinabyte.com/os/281/12311781.shtml)，编辑`/etc/ethers`添加

```
30.17.44.236 b8:e8:56:33:e4:8a
```

然后执行`arp -f`命令刷新，再次使用`arp -an`就可以看到

```
? (30.17.44.236) at b8:e8:56:33:e4:8a [ether] on wlp3s0
```

如果将ARP映射配置存放到其他文件，例如`/etc/ip-mac`，则通过`-f`参数指定读取文件，即执行`arp -f /etc/ip-mac`，也能实现相同效果。

如果不使用`-f`参数读取配置文件，也可以使用`-s`参数直接指定设置：

```
arp -s 30.17.44.236 b8:e8:56:33:e4:8a
```

# 参考

* [Configuring ARP age timeout](https://stackoverflow.com/questions/15372011/configuring-arp-age-timeout)
* [Guide to IP Layer Network Administration with Linux](http://linux-ip.net/html/index.html) - 所有有关ARP协议原理和排查案例请参考该手册的[2.1. Address Resolution Protocol (ARP)](http://linux-ip.net/html/ether-arp.html)，非常详细的一份网络协议指南