
# 基本网络结构

使用HAProxy作为前端，实现对后端web服务的负载均衡：

[负载均衡网络示意图](../../img/service/haproxy/load-balancer-graph-1.png)

> 本示意图引用[How to Install HAProxy Load Balancer on CentOS](https://www.upcloud.com/support/haproxy-load-balancer-centos/)

这里的案例是为了实现虚拟化云计算平台的开发测试环境，在一台物理服务器上通过NAT模式提供对外web服务，但是不采用非常繁琐的端口映射，而是采用在物理服务器上构建负载均衡，在虚拟化NAT环境中，外部web访问通过物理服务器上的HAProxy反向代理到虚拟化NAT网络中的虚拟机，实现模拟线上集群部署。

同时，在HAProxy中实现较为复杂的规则转发，实现多网站托管。

# 通过软件仓库安装

```
sudo yum info haproxy
```

如果要自己手工编译安装最新版本，则需要安装编译所需工具如下：

```
sudo yum install wget gcc pcre-static pcre-devel -y
```

# 基本概念

HAProxy可以运行在两种模式：

* TCP模式 4 层负载均衡
* HTTP模式 7 层负载均衡

在4层TCP模式，HAProxy转发从客户端发出的底层TCP包给应用服务器。在7层HTTP模式，HAProxy则在转发数据包前处理HTTP头部然后再发给应用服务器。

以下案例使用Nginx作为web服务器，只支持7层 HTTP模式。

## 负载算法

HAProxy在选择后端实际服务器使用以下算法：

* Roundrobin - 最简单负载均衡算法，每个新链接将由下一个后端服务器处理。当到达最后一个后端服务器，则重新从后端服务器列表的第一个重新开始。
* Lastconn - 新连接将由后端连接数最少的服务器提供处理。适合负载请求处理时间变化较大的环境。
* Source - 提供会话保持，客户端IP地址将哈希来决定由哪个后端服务器来提供这个IP请求的处理。这样IP A将始终由backend1处理，而IP B将始终由backend2处理，这样就不会中断会话。

# 参考

* [How to setup HAProxy as Load Balancer for Nginx on CentOS 7](https://www.howtoforge.com/tutorial/how-to-setup-haproxy-as-load-balancer-for-nginx-on-centos-7/)
* [How to Install HAProxy Load Balancer on CentOS](https://www.upcloud.com/support/haproxy-load-balancer-centos/)