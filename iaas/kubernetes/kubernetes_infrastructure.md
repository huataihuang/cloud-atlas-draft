* Kubernetes Service

* Kubernetes是分布式系统，基于容器技术的分布式架构
  * 多层次安全防护
  * 多租户应用支持
  * 透明的服务注册和服务发现
  * 内建负载均衡
  * 故障自动发现和自动修复
  * 服务滚动升级
  * 在线扩容
  * 克扩展资源自动调度
  * 多种粒度的资源配额管理

# Kubernetes 概念

* 服务 Service
  * 唯一命名
  * 具有虚拟机IP（Cluster IP, Service IP 或 VIP）以及端口号
  * 提供远程服务能力
  * 映射到提供服务能力的一组容器应用

Service服务目前基于Socket通讯方式对外提供服务（Redis, Memcache, MySQL, Web） 或者具体业务的特定TCP Server进程。Service通常由多个相关服务进程来提供服务，每个服务进程都有独立的Endpoint (IP+Port) 的访问点。

Kubernetes提供Service（虚拟Cluster IP + Service Port）对外提供访问入口，通过内建的负载均衡和故障恢复机制，量

# 参考

* [Kubernetes设计架构](https://www.kubernetes.org.cn/kubernetes%E8%AE%BE%E8%AE%A1%E6%9E%B6%E6%9E%84)