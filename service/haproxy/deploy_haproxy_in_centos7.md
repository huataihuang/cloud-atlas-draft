
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

# 参考

* [How to setup HAProxy as Load Balancer for Nginx on CentOS 7](https://www.howtoforge.com/tutorial/how-to-setup-haproxy-as-load-balancer-for-nginx-on-centos-7/)
* [How to Install HAProxy Load Balancer on CentOS](https://www.upcloud.com/support/haproxy-load-balancer-centos/)