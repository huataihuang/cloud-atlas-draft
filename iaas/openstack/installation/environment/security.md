OpenStack服务支持不同的安全方式，包括密码，策略，和加密。另外，支持服务包括数据库服务和消息代理支持密码安全。

为了方便安装过程，本章节指南只包括密码安全。可以通过手工创建密码或者通过[pwgen](https://sourceforge.net/projects/pwgen/)来生成密码或者运行命令：

```
openssl rand -hex 10
```

对于OpenStack服务，指南使用`SERVICE_PASS`来引用服务账号密码以及`SERVICE_DBPASS`引用数据库密码。

OpenStack的一些服务执行修改可以通过部署自动化工具，如Ansible, Chef, 和Puppet完成。

网络服务假设使用内核网络参数的默认值以及修改防火墙规则。要避免安装过程的大多数问题，建议使用主机支持的发行版的开发工具集合。

# 参考

* [OpenStack Install Guide RDO - Environment: Security](https://docs.openstack.org/ocata/install-guide-rdo/environment-security.html)