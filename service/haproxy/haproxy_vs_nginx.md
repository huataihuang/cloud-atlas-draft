> 在部署云计算集群时，准备对比选择HAProxy和Nginx，主要原因是这两个软件在主流发行版的云计算部署架构、CDN部署中都广泛使用。究竟两者有何差别和利弊，一方面先综合网上分析分钟，另一方面也准备自己实践和测试。

# 场景

在数据中心，负载均衡既扩展了集群的性能，同时也成为集群的一个重要的入口和薄弱点，一旦出现故障，会导致服务不可用。相应的对部署架构提出了挑战：

* 对整个架构的完善监控
* 对整个架构的深入理解 - 不仅仅是单一服务，而且是后端众多服务的深入理解

> keycdn公司知识库提供了一个浅显易懂的[Load Balancing](https://www.keycdn.com/support/load-balancing/)介绍文档。

在Stack Overflow有一个有关负载均衡、缓存、web服务的讨论 [Ordering: 1. nginx 2. varnish 3. haproxy 4. webserver?](https://serverfault.com/questions/204025/ordering-1-nginx-2-varnish-3-haproxy-4-webserver) :

* 使用HAProxy作为负载均衡
* 使用Varnish作为静态文件的缓存服务
* 使用Nginx作为WEB服务器（PHP)或者直接使用Tomcat(Java应用)

> 或者HAProxy作为最前端的负载均衡，将Nginx作为中间层SSL卸载和缓存服务（取代Varnish，同时提供SSL卸载），后端使用Web服务（应用）

# HAProxy

HAProxy是可靠地并且高性能的开源代理和针对HTTP和TCP协议应用的负载均衡。它是负载均衡软件的主流软件，不能关切支持HTTP反向代理的基本功能。也提供作为负载均衡的众多优点：

* 可插拔结构
* 支持HTTP /2
* 可以热重启
* 提供大量信息状态
* 和远程全局限制速率服务集成
* 和远程可发现服务的集成
* 多线程架构可以易于操作和配置

# Nginx

Nginx是Web服务器中现代化软件。支持提供静态内容，HTTP/2, HTTP 7层反向代理负载均衡和其他功能。Nginx也是比边缘反向代理提供更快的性能。然而，现代化的面向服务的架构很少使用它们。不过，Nginx作为边缘代理有以下不足:

* 边缘代理服务器需要完整的HTTP / 2透明代理，同时支持上行和下行通讯的HTTP/2。但是Nginx只支持下行连接的HTTP/2。
* 高级负载均衡功能是免费提供的。但是Nginx plus才支持高级负载均衡的相似功能。
* 边缘代理能够在每个服务节点运行相同的软件就好像处于边缘。一些架构可以结合HAProxy和Nginx来运行。

# HAProxy和Nginx功能对比

| 对比项 | Nginx | HAProxy |
| ---- | ---- | ---- |
| 完整的Web服务器 | 是 | 否 |
| 负载均衡 | 支持 | 支持 |
| SSL卸载 | 支持 | 支持 |
| 插件 | 静态编译 | 动态加载 |
| 管理控制台 | 不提供 | 提供 |
| SPDY支持 | 插件支持 | 插件支持 |
| Windows平台支持 | 支持 | 不支持 |
| TCP代理 | 不支持 | 支持 |

> 如果要迟滞UDP负载均衡，可以尝试 [udpbalancer](http://dev.acts.hu/udpbalancer/) 或 [LVS](http://en.wikipedia.org/wiki/Linux_Virtual_Server)

# HAProxy和Nginx负载均衡对比

参考freelancinggig公司的负载均衡经验：

对于小型组织，使用LVS或者DNS以及Nginx就可以非常容易实现负载均衡。

但是，如果要作为数据中心提供强劲并且复杂的控制规则以及支持海量的连接请求，HAProxy是更好的选择。HAProxy提供了支持20万并发连接以及每秒10万请求的能力，最重要的是，HAProxy提供了完善的前后端支持，可伸缩的重写规则以及检查，并支持standby pool（方便故障切换）。

HAProxy提供了可伸缩的日志以及对每个请求连接的开始和结束的HTTP分析，这样可以帮助故障排查。并且HAProxy具备实时API可以动态从standby pool中添加或移除服务器，例如用于测试。对于开发特定维护工具友好支持，并且提供了一个内建的可通过浏览器访问的控制台，以便观察状态，请求和连接，检查信息和错误等等。

> [HAProxy vs nginx: Why you should NEVER use nginx for load balancing!](https://thehftguy.com/2016/10/03/haproxy-vs-nginx-why-you-should-never-use-nginx-for-load-balancing/)介绍了HAProxy内建的状态观察躬耕，以及集成到[DataDog监控平台](https://docs.datadoghq.com/integrations/haproxy/)的案例。

Nginx在维护和监控上非常简陋，所以很难观察服务的健康状态。不过，Nginx工作简单易于搭建，缺点是不能适合负载或大型系统。此外，Nginx比较容易实现SSL连接并转发请求给后端非加密的80端口连接，这点比HAProxy部署要容易。

如果架构中大量使用Nginx作为web服务器，深入掌握Ninx技术且只是使用比较简化的负载均衡体系，则可以选择Nginx同时作为负载均衡。这样可以简化技术栈，在一定程度上降低运维的知识成本。

> Nginx基于Web服务器体系架构，提供了大量的复杂缓存功能

根据 Stack Overflow 经验，[Stack Overflow网站结合使用HAProxy作为SSL卸载的负载均衡，结合后端nginx服务](https://serverfault.com/questions/229945/what-are-the-differences-between-haproxy-and-ngnix-in-reverse-proxy-mode)。

> HAProxy从 1.5-dev12开始加入SSL卸载反向代理功能，提供更多限流调整选项。

# 参考

* [HAProxy vs Nginx: Which Software Load Balancer is Better?](https://www.freelancinggig.com/blog/2017/04/26/haproxy-vs-nginx-software-load-balancer-better/)
* [HAProxy vs nginx: Why you should NEVER use nginx for load balancing!](https://thehftguy.com/2016/10/03/haproxy-vs-nginx-why-you-should-never-use-nginx-for-load-balancing/)