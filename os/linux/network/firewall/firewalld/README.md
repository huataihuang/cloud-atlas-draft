
`firewalld` 是 `iptables` 的前端控制器，用于实现持久的网络流量规则。它提供命令行和图形界面，主要在Red Hat发行版使用。

> Debian/Ubuntu也提供了`firewalld`发行包

与直接控制 iptables 相比，使用 `firewalld` 有两个主要区别：

* `firewalld` 使用区域和服务而不是链式规则。
* 它动态管理规则集，允许更新规则而不破坏现有会话和连接。

> `firewalld` 是 `iptables` 的一个封装，可以让你更容易地管理 `iptables` 规则 - 它并不是 `iptables` 的替代品。虽然 `iptables` 命令仍可用于 `firewalld`，但建议使用 `firewalld` 时仅使用 `firewalld` 命令。

# 参考

* [CentOS 上的 firewalld 简明指南](https://linux.cn/article-8098-1.html)
* [CentOS 7 下使用 Firewall](https://havee.me/linux/2015-01/using-firewalls-on-centos-7.html)