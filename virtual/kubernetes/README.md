Kubernetes是Google开源的容器集群管理系统，其提供应用部署、维护、 扩展机制等功能，利用Kubernetes能方便地管理跨机器运行容器化的应用：

* 使用Docker对应用程序包装(package)、实例化(instantiate)、运行(run)
* 以集群的方式运行、管理跨机器的容器
* 解决Docker跨机器容器之间的通讯问题
* Kubernetes的自我修复机制使得容器集群总是运行在用户期望的状态（比如用户想让apache一直运行，用户不需要关心怎么去做，Kubernetes会自动去监控，然后去重启，新建，总之，让apache一直提供服务）

在Kubenetes中，所有的容器均在Pod中运行,一个Pod可以承载一个或者多个相关的容器，同一个Pod中的容器会部署在同一个物理机器上并且能够共享资源。

> `pod`理解为一个物理主机

一个Pod也可以包含O个或者多个磁盘卷组（volumes）,这些卷组将会以目录的形式提供给一个容器，或者被所有Pod中的容器共享，对于用户创建的每个Pod,系统会自动选择那个健康并且有足够容量的机器，然后创建类似容器的容器,当容器创建失败的时候，容器会被node agent自动的重启,这个node agent叫kubelet,但是，如果是Pod失败或者机器，它不会自动的转移并且启动，除非用户定义了 replication controller。

> 单个pod占有的存储卷应该是本地存储;所有pod容器共享的存储卷是分布式存储（基于网络共享）
> 
> pod失败（理解为物理服务器故障）默认不failover容器，需要定义复制（容器）控制器（replication controller）来进行故障迁移。

用户可以自己创建并管理Pod，Kubernetes将这些操作简化为两个操作：

# 参考

* [Kubernetes中文社区:Kubernetes概述](https://www.kubernetes.org.cn/k8s)
* [Kubernetes系统架构简介](http://www.infoq.com/cn/articles/Kubernetes-system-architecture-introduction)
* [Kubernetes权威指南：从Docker到Kubernetes实践全接触（第2版）](https://www.amazon.cn/Kubernetes%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97-%E4%BB%8EDocker%E5%88%B0Kubernetes%E5%AE%9E%E8%B7%B5%E5%85%A8%E6%8E%A5%E8%A7%A6-%E9%BE%9A%E6%AD%A3/dp/B01LY9Q24C/ref=sr_1_2?ie=UTF8&qid=1508816308&sr=8-2&keywords=Kubernetes%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%9A%E4%BB%8EDocker%E5%88%B0Kubernetes%E5%AE%9E%E8%B7%B5%E5%85%A8%E6%8E%A5%E8%A7%A6)