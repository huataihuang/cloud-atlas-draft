# Playbooks简介

Playbooks是Ansible的配置，部署和编排语言。Playbooks可以描述需要远程系统执行的策略来增强或设置一系列处理步骤。

在底层，playbooks可以用于管理配置并分发到远程主机。从更高层次来看，它可以排列多个层级任务，包括滚动升级，并且可以将工作分配给其他主机，和监控服务器、负载均衡交互。

palybooks被设计成可读并且使用基本的文本语言开发。有多种方式来组织playbooks以及它们包含的文件。

> 建议阅读[Example Playbooks](https://github.com/ansible/ansible-examples)。

playbooks用于申明配置，但是也可以组织任何人工顺序处理，甚至是作为回滚和作为不同主机之间不同步骤执行。可以同步或异步调用任务。

# playbook语言案例

playbooks使用YAML格式撰写，并且有一个很小的语法集，这样就可以不作为编程语言或者脚本，而仅仅是配置或者过程的一个模式来使用。

每个playbook由一个或多个列表中的`plays`来组成。

