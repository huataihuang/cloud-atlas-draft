# 开源监控平台

大约十多前，在一家小公司做运维的时候，主要使用过[Nagios](http://www.nagios.org/)和[Cacti](http://www.cacti.net)做系统监控，对于中小型公司的简单业务，是比较合适的解决方案。

任何开源架构都是需要在实践中不断结合实际进行组合，融汇贯通之后，用最合适的组件和方法来完成一个可扩展、高性能且支持海量系统的平台。没有什么银弹，需要的是和现实结合不断改进。

这里记录的是我近期实践的开源监控，并希望在半年以后，对比和总结出可靠的经验:

* [Skinken](skinken/README.md) - modern re-implementation of Nagios in Python
* [sensu](https://sensuapp.org) - 可扩展的综合了多个开源软件的解决方案

----

# 从组件自己开发监控平台

其实，从底层来说，目前主流的基础环境监控都可以采用如下组件(或类似组件)实现：

* Nagios - 服务异常发现
* Collectd - 系统性能数据搜集
* Graphite - 数据可视化图形输出

# 参考

* [Server Monitoring: What are the best alternatives to Nagios?](https://www.quora.com/Server-Monitoring/What-are-the-best-alternatives-to-Nagios)
* [alternativeToNagios](http://alternativeto.net/software/nagios/)
