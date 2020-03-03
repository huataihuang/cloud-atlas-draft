> 在选择代理服务器的时候，我首先想到的就是3个著名的Proxy Server: Squid, Varnish, Nginx ，但是这3者具体有哪些区别，各有什么优劣，却没有系统梳理过。考虑到我的不同应用场景，以及未来需要系统实践的方向，所以收集和整理相关信息。

# varnish和squid差异

> 以下差异对比取自 [What is the fundamental difference between varnish and squid caching architectures?](https://www.quora.com/What-is-the-fundamental-difference-between-varnish-and-squid-caching-architectures) ，该文是2013年1月28日，已经是7年历史可能和现状不符，有待后续修正

* Squid是一个转发代理(open proxy)，但是也支持配置作为反向代理；然而Varnish从一开始就是构建为反向代理
* 从概念上来说，Varnish更适合作为反向HTTP代理，但是Squid的开发历史悠久，所以具备了很多Varnish没有的功能
    * Squid内建了SSL支持，而Varnish需要结合stud，nginx或者stunnel来实现SSL
    * Squid支持更为广泛的流媒体对象
    * Squid支持杀毒插件(antivirus-plugins)
* Varnish的优势在于
    * 极其巧妙的配置系统VCL提供了极具伸缩性的运行策略：从一系列user-agent请求重写URL来适合特定网络，这种模式对于Squid配置则非常复杂
    * Varnish的性能比Squid要好：Squid是单进程程序只能运行在一个CPU核心，而Varnish是多线程程序
    * Varnish具有更好的伸缩性：可以基于更多或更少的任何对象的缓存清理功能



# 参考

* [What is the fundamental difference between varnish and squid caching architectures?](https://www.quora.com/What-is-the-fundamental-difference-between-varnish-and-squid-caching-architectures)