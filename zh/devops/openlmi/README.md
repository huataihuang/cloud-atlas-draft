[OpenLMI](http://www.openlmi.org)是Open Linux Management Infrastructure，即"开放Linux管理基础架构"的意思，它提供了对不同操作系统的参数、服务、硬件安配置和系统资源监控的标准操作。使用多种编程语言和标准API可以通过OpenLMI提供的服务远程或本地访问服务器。

OpenLMI分为3个部分：

* agent : 安装和运行在被管理的Linux系统上，执行实际操作
* controller ： 控制器用来管理OpenLMI agent
* client ：通过OpenLMI良好定义的接口和语言绑定（基于管理远程系统的开放工业标准），来和OpenLMI controllers通讯，

OpenLMI并没有提供完整的管理解决方案，而是提供了底层的功能和API，这样就可以集成到不同的管理平台、应用程序或者配置脚本中。

OpenLMI通过管理agent执行的配置任务，以及监控和报告功能，扩展了现有的Linux架构。通过标准接口和通过代理执行这些实际操作，OpenLMI输出的这些操作，创建了一个可管理的框架提供应用程序使用，既可以系统配置，也可以监控资源和性能。

详细的功能请参考 [OpenLMI server components](http://docs.openlmi.org/en/latest/server.html)

# OpenLMI vs. Puppet

其实刚看到[Red Hat Enterprise Linux 7管理员手册中OpenLMI章节](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/chap-OpenLMI.html)，我内心也是非常疑惑的，这个系统管理组件到底和Puppet，Ansible有什么区别呢？优点和缺点又是什么呢？

> 当前我还无法确定，所以我决定仔细阅读并实践OpenLMI和Ansible（puppet我已经有比较多的实践经验，在数万规模的数据中心实施过）。

这里简单根据[OpenLMI vs. Puppet](http://techponder.wordpress.com/2013/11/14/openlmi-vs-puppet/)归纳一些异同点：

* OpenLMI是针对单个系统构建一个交互查询、修改、通知的模式，提供了不同子系统标准API，也支持API的任务
* Puppet是使用特定语言来构建系统的配置，是最终一致性，意味着相同配置的uoci执行会得到一致的结果。

OpenLMI非常适合对系统底层进行一次性配置，例如配置RAID，格式化文件系统，创建卷管理，配置网络（IP，DNS，bonding，VLAN等）。这些工作使用Puppet大多也能完成，但是会要求非常详细的系统配置（配置难度大大提高），而且puppet倾向于批量操作相同的设备环境。

> 和Ansible类似，OpenLMI也适合对系统进行一次性操作，并且由于使用了工业标准框架，OpenLMI非常适合完成固定的系统管理（使用组件），维护难度会大大降低。

# 参考

* [OpenLMI](https://en.wikipedia.org/wiki/OpenLMI)
* [OpenLMI vs. Puppet](http://techponder.wordpress.com/2013/11/14/openlmi-vs-puppet/)