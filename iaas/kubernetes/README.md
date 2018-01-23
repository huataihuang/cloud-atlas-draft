Kubernetes是Google开源的容器集群管理系统，其提供应用部署、维护、 扩展机制等功能，利用Kubernetes能方便地管理跨机器运行容器化的应用：

* 使用Docker对应用程序包装(package)、实例化(instantiate)、运行(run)
* 以集群的方式运行、管理跨机器的容器
* 解决Docker跨机器容器之间的通讯问题
* Kubernetes的自我修复机制使得容器集群总是运行在用户期望的状态（比如用户想让apache一直运行，用户不需要关心怎么去做，Kubernetes会自动去监控，然后去重启，新建，总之，让apache一直提供服务）

在Kubenetes中，所有的容器均在Pod中运行,一个Pod可以承载一个或者多个相关的容器，同一个Pod中的容器会部署在同一个物理机器上并且能够共享资源。

> `pod`理解为一个物理主机上的一个逻辑子集，和物理服务器紧密绑定。

一个Pod也可以包含O个或者多个磁盘卷组（volumes）,这些卷组将会以目录的形式提供给一个容器，或者被所有Pod中的容器共享，对于用户创建的每个Pod,系统会自动选择那个健康并且有足够容量的机器，然后创建类似容器的容器,当容器创建失败的时候，容器会被node agent自动的重启,这个node agent叫kubelet,但是，如果是Pod失败或者机器，它不会自动的转移并且启动，除非用户定义了 replication controller。

> 单个pod占有的存储卷应该是本地存储;所有pod容器共享的存储卷是分布式存储（基于网络共享）
> 
> pod失败（理解为物理服务器故障）默认不failover容器，需要定义复制（容器）控制器（replication controller）来进行故障迁移。

用户可以自己创建并管理Pod，Kubernetes将这些操作简化为两个操作：

* 基于相同的Pod配置文件部署多个Pod复制品
* 创建可替代的Pod

> 当一个Pod挂了或者机器挂了的时候，Kubernetes API中负责来重新启动，迁移等行为的部分叫做`replication controller`。
>
> 它根据一个模板生成了一个Pod,然后系统就根据用户的需求创建了许多冗余，这些冗余的Pod组成了一个整个应用，或者服务，或者服务中的一层。
>
> 一旦一个Pod被创建，系统就会不停的监控Pod的健康情况以及Pod所在主机的健康情况。如果这个Pod因为软件原因挂掉了或者所在的机器挂掉了，`replication controller`会自动在一个健康的机器上创建一个一摸一样的Pod,来维持原来的Pod冗余状态不变，一个应用的多个Pod可以共享一个机器。

**简单来说，只要应用无状态就可以采用`replication controller`在pod挂掉的时候在其他pod启动完全一致的pod。**

可以给Kubernetes Api中的任何对象贴上一组 `key:value`的标签，这样就通过标签来选择一组相关的`Kubernetes Api`对象，去执行一些特定的操作。每个资源额外拥有一组（很多） `keys` 和 `values`,然后外部的工具可以使用这些keys和vlues值进行对象的检索，这些`Map`叫做`annotations`（注释）。

> `key:value`标签理解为逻辑组

Kubernetes支持一种特殊的网络模型，Kubernetes创建了一个地址空间，并且不动态的分配端口，它可以允许用户选择任何想使用的端口，为了实现这个功能，它为每个Pod分配IP地址。

> 在物理服务器上创建的每个pod都分配一个IP地址，这样就可以对pod提供对外服务。

Kubernetes提供了**服务的抽象**，并提供了固定的IP地址和DNS名称，而这些与一系列Pod进行动态关联，这些都通过之前提到的标签进行关联。

可以关联任何Pod，当一个Pod中的容器访问这个地址的时候，这个请求会被转发到本地代理（`kube proxy`）,每台机器上均有一个本地代理，然后被转发到相应的后端容器。

Kubernetes通过一种轮训机制选择相应的后端容器，这些动态的Pod被替换的时候,Kube proxy时刻追踪着，所以，服务的 IP地址（dns名称），从来不变。

> pod和代理可以理解成：
>
> 对于物理服务器上的每个pod，每个pod都有一个对外IP，访问pod的服务是通过访问pod所在的IP和端口实现，而这个`IP+端口`是由kubernetes的一个对外代理服务器提供服务（这个代理服务可以是HAProxy也可以是Nginx balance，或者是LVS）。
>
> 代理服务会反向代理到后端pod中的容器所运行的真实服务器。并且反向代理有健康检测功能，可以自动剔除故障服务节点。
>
> 代理服务对外提供的IP和DNS名称始终保持不变，所以外部不需要了解pod中后端的容器中运行的服务是否正常，有多少容器服务等等，完全被这个对外的代理服务所包装了。

所有Kubernetes中的资源，比如Pod,都通过一个叫URI的东西来区分，这个URI有一个UID,URI的重要组成部分是：对象的类型（比如pod），对象的名字，对象的命名空间，对于特殊的对象类型，在同一个命名空间内，所有的名字都是不同的，在对象只提供名称，不提供命名空间的情况下，这种情况是假定是默认的命名空间。UID是时间和空间上的唯一。

# 个人理解

**以上注释部分是个人理解，不一定完全正确，并且随着对Kubernetes和Docker等技术的学习逐步进行完善和修正！**

> Kubernetes不是虚拟化也不是容器，而是将容器的计算资源进行抽象和标准化，以便能够大规模部署和管理。

Kubernetes对计算资源进行了更高层次的抽象，通过将容器进行细致的组合，将最终的应用服务交给用户。Kubernetes在模型建立之初就考虑了容器跨机连接的要求，支持多种网络解决方案，同时在Service层次构建集群范围的SDN网络。其目的是将服务发现和负载均衡放置到容器可达的范围，这种透明的方式便利了各个服务间的通信，并为微服务架构的实践提供了平台基础。而在Pod层次上，作为Kubernetes可操作的最小对象，其特征更是对微服务架构的原生支持。

# 参考

* [Kubernetes中文社区:Kubernetes概述](https://www.kubernetes.org.cn/k8s)
* [Kubernetes系统架构简介](http://www.infoq.com/cn/articles/Kubernetes-system-architecture-introduction)
* [Kubernetes权威指南：从Docker到Kubernetes实践全接触（第2版）](https://www.amazon.cn/Kubernetes%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97-%E4%BB%8EDocker%E5%88%B0Kubernetes%E5%AE%9E%E8%B7%B5%E5%85%A8%E6%8E%A5%E8%A7%A6-%E9%BE%9A%E6%AD%A3/dp/B01LY9Q24C/ref=sr_1_2?ie=UTF8&qid=1508816308&sr=8-2&keywords=Kubernetes%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97%EF%BC%9A%E4%BB%8EDocker%E5%88%B0Kubernetes%E5%AE%9E%E8%B7%B5%E5%85%A8%E6%8E%A5%E8%A7%A6)