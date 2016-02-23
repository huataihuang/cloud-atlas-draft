Playbooks是Ansible的配置，部署和编排语言。Playbook可以用来描述远程系统的一种策略，用来增强或者执行一系列处理步骤。

如果说Ansible模块是工具，则playbooks可以视为设计计划。

在基础层面，playbooks可以用于管理配置和部署到远程主机。更高层，playbook可以顺序执行多个滚动升级，并且可以委托其他主机执行，和监控服务器、负载均衡交互。

playbook被设计成高度可读并且使用基础的文本语言编排。有多种组织playbooks的方法。

建议阅读[Playbook案例](https://github.com/ansible/ansible-examples)来体验如何将不同的概念组合成最佳实践。