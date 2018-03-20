# Varnish简介

> Varnish是主要在FreeBSD上开发的缓存代理服务器，从 [How our website works: dogfood](http://varnish-cache.org/faq/dogfood.html) 可以看到，开发者最关注的是FreeBSD平台。或许和 [pfSense](https://www.pfsense.org) 类似，充分发挥了BSD系统的稳定性和网络协议高性能，FreeBSD是这些杀手级应用的良好平台。

* 作用

Web应用加速器，同时作为http反向缓存代理

* 特点
  * Varnish可以使用内存也可以使用硬盘进行数据缓存
  * 支持虚拟内存的使用
  * 有精确的时间管理机制
  * 状态引擎架构：通过特定的配置语言设计不同的语句
  * 以二叉堆格式管理缓存数据

* Varnish的优势
  * Varnish访问速度快，因为采用了“Visual Page Cache”技术，在读取数据时直接从内存中读取
  * Varnish支持更多的并发连接，因为varnish的TCP连接比squid快
  * Varnish通过管理端口，使用正则表达式批量的清除部分缓存

* Varnish的劣势
  * 进程一旦crash或重启，缓存的数据将从内存中完全释放
  * 在多台varnish实现负载均衡时，每次请求都会落到不同的varnish服务器中，造成url请求可能会穿透到后端

> 劣势解决方案
>
> * 在varnish的后端添加squid/nignx代理，这样防止了当varnish缓存被清空时，瞬间大量的请求发往web服务器
> * 在负载均衡上做url哈希，让单个url请求固定请求到一台varnish服务器上

# Varnish应用场景

Varnish适合做WEB服务器的反向缓存代理，但是不适合做小型办公室的透明上网代理服务器。

# 参考

* [Web架构：varnish缓存代理服务器超详细剖析](http://blog.51cto.com/xsboke/1922382)