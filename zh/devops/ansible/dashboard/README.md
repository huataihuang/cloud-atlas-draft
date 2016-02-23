[Ansible Tower](https://www.ansible.com/tower)是企业级的Ansible web管理平台，提供了较为完善的观察Ansible任务运行的Dashboard。Tower允许控制访问帐号，以及分发SSH证书。可以通过图形界面管理`清单`文件或者从云进行同步。Tower提供了任务的日志，集成LDAP以及REST API。提供了方便和Jenkins集成的命令工具，和支持自动扩展拓扑的回调。

不过，Ansible Tower不是开源软件，对于10个节点免费，大规模应用场景需要购买Licence。

# Ansible Tower的开源替代

[semaphore](https://github.com/ansible-semaphore/semaphore)是Ansible Tower的基本功能的clone，提供了：

* 快速简单的WEB管理界面
* 通过websocket来输出任务信息
* 针对每个playbook来创建清单
* 针对特定主机运行playbook
* 多用户支持

# Ansible Tower和Foreman对比

[Foreman vs. Ansible Tower](https://www.upguard.com/articles/foreman-vs.-ansible-tower)比较了开源的服务器生命周期管理工具[Foreman](http://theforeman.org)和闭源的[Ansible Tower](https://www.ansible.com/tower)的使用场景。

> Foreman是一个非常成功的Puppet和Chef自动化管理平台，并且是得到社区活跃支持和持续开发的平台。

Foreman通过Smart Proxy架构来自动化集成配置管理平台Puppet/Chef，提供了REST API来扩展。Smart Proxy支持DHCP, DNS, TFTP 并默认支持Puppet和Chef连接。

Ansible目标是构建替代Puppet和Chef的轻量级自动化工具，所以其架构不同：使用Python编写，运行在SSH之上。Ansible Tower提供了实时的节点监控，显示当前运行的任务，以及存在问题的节点，这样可以快速检查问题。

> 从资料来看，对于Ansible开源项目，目前尚未有类似Foreman这样能够和Puppet/Chef完善结合的平台，对企业级运行Ansible来说，还是需要定制开发。

# 参考

* [Foreman vs. Ansible Tower](https://www.upguard.com/articles/foreman-vs.-ansible-tower)
* [Ansible autoscale (tower) alternatives](http://tjheeta.github.io/2014/11/24/ansible-autoscale-tower-alternative/)