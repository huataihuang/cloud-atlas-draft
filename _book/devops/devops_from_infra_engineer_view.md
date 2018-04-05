> [DevOps from the Infrastructure Engineer's Point-Of-View](http://www.linuxrecruit.co.uk/blog?title=DevOps%20from%20the%20Infrastructure%20Engineer%27s%20Point-Of-View&id=59) 这篇blog概述了底层架构角度对DevOps的观点，比较概括简练。以往开发，测试，运维各自分隔的视角对于系统整体把握很是割裂和矛盾，DevOps是一个改进的契机，需要从整个链路上完全自动化来实现软件的生命周期。

* 持续集成
  * 一旦代码check in，立即触发build
  * buid将提供一个完整科工作和可测试的系统

> * 工具：Jenkins, Bamboo, Codeshop, Travis CI, TeamCity…

* 测试自动化
  * 在测试自动化之后依然存在需要人工测试的复杂场景，仍然需要人工测试平台

> * 工具：Selenium

* 部署自动化

> * 工具：Jenkins, Go CD, Bamboo, …

* 配置管理
  * 在镜像就绪之后通过配置管理工具来管理系统
  * 配置管理工具使用一种称为"幂等"和平台无关的方法来实现，包括用户，文件，包和服务等

> * 工具：Puppet, Chef, Ansible, Salt, CFEngine

* 基础架构自动化
  * 将架构转换成脚本化服务
  * 采用类似Red Hat Satellite for instance或VMWare vCloud Orchestrator

> * 工具：Terraform, Vagrant, Docker

* 应用监控

* 基础架构监控

* 敏捷开发（限制过程中工作）

> * 方法：Agile, Scrum, Kanban
> * 工具：Jira或其他

> 参考 [[译]Agile、Scrum和 Kanban: 到底什么意思？](http://xuwenzhi.com/2016/03/13/%E8%AF%91agile%E3%80%81scrum%E5%92%8C-kanban-%E5%88%B0%E5%BA%95%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D%EF%BC%9F/)

* 版本控制
  * 所有代码必须进入源代码版本控制
  * 工作在代码分支或者采用极短的分支策略 -- 你需要理解分支，合并和标记
  * 精通Git

> * 方法：Agile, Scrum, Kanban
> * 工具：Jira或其他


* 迭代改进

* 构建安全的交付
  * 在构建过程中，始终执行安全扫描，静态代码分析等 - 这是称为`DevSecOps`的较为新型的观念
  * `注意`：当前DevOps在部署和推进中，很容易引入更大的安全风险，因为DevOps往往要求较高的权限运行Agent或者ssh登陆账号，导致受攻击面增大。

* 重构
  * 随着[极限编程](https://zh.wikipedia.org/wiki/%E6%9E%81%E9%99%90%E7%BC%96%E7%A8%8B)（Extreme Programming, XP）而来的理念

> 如同其他敏捷方法学，极限编程和传统方法学的本质不同在于它更强调可适应性而不是可预测性。極限编程的支持者认为软件需求的不断变化是很自然的现象，是软件项目开发中不可避免的、也是应该欣然接受的现象；他们相信，和传统的在项目起始阶段定义好所有需求再费尽心思的控制变化的方法相比，有能力在项目周期的任何阶段去适应变化，将是更加现实更加有效的方法。

* 快速反馈
  * 增强代码规范和测试覆盖率（单元测试），避免阻断事情发展。

# 参考

* [DevOps from the Infrastructure Engineer's Point-Of-View](http://www.linuxrecruit.co.uk/blog?title=DevOps%20from%20the%20Infrastructure%20Engineer%27s%20Point-Of-View&id=59)