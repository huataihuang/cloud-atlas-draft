# 显示Iptables规则

要列出所有激活的iptables规则，使用`-S`参数

```
iptables -S
```

以下案例是部署了docker和kvm的服务器的默认iptables

```
-P INPUT ACCEPT
-P FORWARD ACCEPT
-P OUTPUT ACCEPT
-N DOCKER
-N DOCKER-ISOLATION
-A INPUT -i virbr0 -p udp -m udp --dport 5[903972.334145] root[40469]: alicmd:root:iptables -S:root ttyS0 2016-12-30 09:48
3 -j ACCEPT
-A INPUT -i virbr0 -p tcp -m tcp --dport 53 -j ACCEPT
-A INPUT -i virbr0 -p udp -m udp --dport 67 -j ACCEPT
-A INPUT -i virbr0 -p tcp -m tcp --dport 67 -j ACCEPT
-A FORWARD -d 192.168.122.0/24 -m state --state NEW,RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -d 192.168.122.0/24 -o virbr0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -s 192.168.122.0/24 -i virbr0 -j ACCEPT
-A FORWARD -i virbr0 -o virbr0 -j ACCEPT
-A FORWARD -o virbr0 -j REJECT --reject-with icmp-port-unreachable
-A FORWARD -i virbr0 -j REJECT --reject-with icmp-port-unreachable
-A FORWARD -j DOCKER-ISOLATION
-A FORWARD -o docker0 -j DOCKER
-A FORWARD -o docker0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A FORWARD -i docker0 ! -o docker0 -j ACCEPT
-A FORWARD -i docker0 -o docker0 -j ACCEPT
-A OUTPUT -o virbr0 -p udp -m udp --dport 68 -j ACCEPT
-A DOCKER-ISOLATION -j RETURN
```

＃ 以表方式列出规则

```
sudo iptables -L
```

输出 

```
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     udp  --  anywhere             anywhere             udp dpt:domain
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:domain
ACCEPT     udp  --  anywhere            [904810.654911] root[41494]: alicmd:root:iptables -L:root ttyS0 2016-12-30 09:48
 anywhere             udp dpt:bootps
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:bootps

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             192.168.122.0/24     state NEW,RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             192.168.122.0/24     ctstate RELATED,ESTABLISHED
ACCEPT     all  --  192.168.122.0/24     anywhere
ACCEPT     all  --  anywhere             anywhere
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable
REJECT     all  --  anywhere             anywhere             reject-with icmp-port-unreachable
DOCKER-ISOLATION  all  --  anywhere             anywhere
DOCKER     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     udp  --  anywhere             anywhere             udp dpt:bootpc

Chain DOCKER (1 references)
target     prot opt source               destination

Chain DOCKER-ISOLATION (1 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere
```

如果要指定chain来检查，例如`INPUT`，`OUTPUT`或`TCP`灯，可以通过`-L`参数来指定链路（chain），这里检查`INPUT`的链路

```
sudo iptables -L INPUT
```

在链路中的列头含义：

* target 如果数据包符合规则，则执行这个指定的规则。例如，一个数据包可以被接受，抛弃，纪录或发送给另外一个链路来匹配更多规则。
* port 协议端口，例如`tcp` `udp` `icmp` 或 `all`
* opt 表示IP选项
* source 数据流量的源IP地址或子网，或者`anywhere`
* destination 目标IP地址或子网，或者`anywhere`

# 显示数据包计数和聚合大小

当列出iptables规则，可以显示数据包的数量，并且聚合数据包的大小，以及符合每个匹配规则。结合使用｀-L`和`-v`参数

```
sudo iptables -L FORWARD -v
```

例如展示转发列表

```
Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
 501K  917M ACCEPT     all  --  any    any     anywhere             192.168.122.0/24     state NEW,RELATED,ESTABLISHED
  405  315K ACCEPT     all  --  any    virbr0  anywhere             192.168.122.0/24     ctstate RELATED,ESTABLISHED
 449K   56M ACCEPT     all  --  virbr0 any     192.168.122.0/24     anywhere
   51 16796 ACCEPT     all  --  virbr0 virbr0  anywhere             anywhere
    0     0 REJECT     all  --  any    virbr0  anywhere             anywhere             reject-with icmp-port-unreachable
    0     0 REJECT     all  --  virbr0 any     anywhere             anywhere             reject-with icmp-port-unreachable
 545K 1387M DOCKER-ISOLATION  all  --  any    any     anywhere             anywhere
    0     0 DOCKER     all  --  any    docker0  anywhere             anywhere
    0     0 ACCEPT     all  --  any    docker0  anywhere             anywhere             ctstate RELATED,ESTABLISHED
    0     0 ACCEPT     all  --  docker0 !docker0  anywhere             anywhere
    0     0 ACCEPT     all  --  docker0 docker0  anywhere             anywhere
```

> 注意上述显示的列表中`pkts`和`bytes`显示了数据流聚合的统计纪录。

# 重置数据包计数

如果需要清零掉规则纪录的表，使用`-Z`参数。特别是需要重新计算：

```
iptables -Z
```

也可以单独清理某个数据链的计数

```
iptables -Z INPUT
```

# 删除指定规则

可以使用`iptables`命令的`-D`参数来删除指定规则，可以通过`iptables -S`来检查规则列表

```
iptables -t nat -S
```

输出显示

```
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination
DNAT       tcp  --  anywhere             kvm-server.example.com  tcp dpt:rsh-spx to:192.168.122.2:22
...
```

现在删除掉这个规则

```
iptables -t nat -D PREROUTING -p tcp -d 10.244.4.111 --dport 22 -j DNAT --to-destination 192.168.122.2:22
```

> 注意：对于NAT规则需要使用`-t nat`才能处理

# 清除规则链

使用参数`-F`或者`--flush`来刷新规则

```
sudo iptables -F INPUT
```

清除所有规则

```
sudo iptables -F
```

# 参考

* [How To List and Delete Iptables Firewall Rules](https://www.digitalocean.com/community/tutorials/how-to-list-and-delete-iptables-firewall-rules)