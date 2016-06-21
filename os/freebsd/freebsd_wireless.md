# 内核配置

要使用无线网络，首先要使得内核配置相应的无线网络支持：内核有多个模块，需要配置支持。

> `ThinkPad X220`笔记本使用的是`Intel Centrino Advanced-N 6205 PCI Express Half Mini Card`无线网卡，驱动是`iwn0`。本文档实践是在`x220`上的无线配置

* 在 `/boot/loader.conf` 中添加加载`iwn`驱动（请根据硬件型号配置）

```bash
if_iwn_load="YES"
```

* 设置模块

# 参考

* [Wireless Networking](https://www.freebsd.org/doc/handbook/network-wireless.html)
* [FreeBSD 10 iwn problems](http://www.daemonology.net/blog/2015-01-13-freebsd-10-iwn-problems.html)
* [Thinkpad 笔记本电脑上的 FreeBSD 内核](https://wiki.freebsdchina.org/doc/k/kernel) - 非常好的中文文档，是ThinkPad上的经验汇总