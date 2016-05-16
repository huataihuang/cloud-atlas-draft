[Vagrant](https://www.vagrantup.com/)基于工业标准化技术至上提供了易于配置，可重复部署以及可移植的工作环境，并且通过一个简单的一致性的工作流提供控制来帮助你和你的团队最大化生产力和可伸缩性。

为了实现这个奇迹，Vagrant站在了巨人的肩膀之上。主机由VirtualBox，VMware，AWS或[其他provider](http://docs.vagrantup.com/v2/providers/)提供。然后，工业标准化的供给工具，例如shell脚本，Chef或Puppet，可以提供自动化安装和配置主机中的软件。

> 个人感觉Vagrant和Docker类似，通过组合底层开源技术加上自己开发的程序/脚本以及良好定义的规则，实现了标准化的快速部署虚拟系统的架构。所不同的是，Docker采用的是轻量级的容器技术，Vagrant则使用kvm/virtualbox等重量级的全/半虚拟化平台。
>
> Vagrant实现的是根据模版快速提供虚拟系统，大规模生产虚拟系统，需要结合进一步定制的管理控制平台来实现PaaS。
>
> Vagrant更适合部署完全虚拟化集群，可以实现更为复杂的系统模拟，在特定的需要安全性隔离环境以及需要实现完整的操作系统功能的虚拟系统。

# 参考

* [Vagrant Docs](http://docs.vagrantup.com/)