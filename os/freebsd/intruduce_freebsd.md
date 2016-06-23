# FreeBSD 非凡的特性

* 抢占式多任务与动态优先级调整确保在应用程序和用户之间平滑公正的分享计算机资源， 即使工作在最大的负载之下。
* 符合业界标准的强大 TCP/IP 网络 支持， 例如 SCTP、 DHCP、 NFS、 NIS、 PPP， SLIP， IPsec 以及 IPv6。 这意味着 FreeBSD 主机可以很容易地和其他系统互联， 也可以作为企业的服务器，提供重要的功能
* 内存保护确保应用程序(或者用户)不会相互干扰。 一个应用程序崩溃不会以任何方式影响其他程序。
* 页式请求虚拟内存和“集成的 VM/buffer 缓存”设计有效地满足了应用程序巨大的内存需求并依然保持其他用户的交互式响应。

FreeBSD 基于加州大学伯克利分校计算机系统研究组 (CSRG) 发布的 4.4BSD-Lite， 继承了 BSD 系统开发的优良传统。 除了 CSRG 优秀的工作之外， FreeBSD 项目花费了非常多的时间来优化调整系统， 使其在真实负载情况下拥有最好的性能和可靠性。

因为 FreeBSD 自身的源代码是完全公开的， 所以对于特定的应用程序或项目，可以对系统进行最大限度的定制。 

FreeBSD 是一个免费使用且带有完整源代码的基于 4.4BSD-Lite 的系统， 它广泛运行于 Intel i386™、i486™、Pentium®、 Pentium® Pro、 Celeron®、 Pentium® II、 Pentium® III、 Pentium® 4(或者兼容系统)、 Xeon™、 和 Sun UltraSPARC® 的计算机系统上。 它主要以 加州大学伯克利分校 的 CSRG 研究小组的软件为基础，并加入了 NetBSD、OpenBSD、386BSD 以及来自 自由软件基金会 的一些东西。除了最基本的系统软件，FreeBSD 还提供了一个拥有成千上万广受欢迎的程序组成的软件的 Ports Collection。 (参考 [在FreeBSD上安装软件:Packages和Ports](packages_and_ports.md))

> [FreeBSD 的简要历史](https://www.freebsd.org/doc/zh_CN.UTF-8/books/handbook/history.html)



# FreeBSD 项目目标

FreeBSD 项目的目标是无附加条件地提供能够用于任何目的的软件。

我们认为我们的首要 “使命” 是为任何人提供代码， 不管他们打算用这些代码做什么， 因为这样代码将能够被更广泛地使用， 从而最大限度地发挥其价值。 我认为这是自由软件最基本的， 同时也是为我们所倡导的一个目标。

# FreeBSD 开发模式

FreeBSD 的开发是一个非常开放且有有伸缩性的过程， 它是完全由来自全世界的数以百计的贡献者发展起来的。 FreeBSD 的开发基础结构允许数以百计的开发者通过互联网协同工作。 



# 谁在使用 FreeBSD?

FreeBSD 被世界上最大的 IT 公司用作设备和产品的平台， 包括：

* Apple
* Cisco
* Juniper
* NetApp

FreeBSD 也被用来支持 Internet 上一些最大的站点， 包括：

* Yahoo!
* Yandex
* Apache
* ...

从FreeBSD 10开始，采用了Clang作为默认的C/C++编译器，取代了GCC，实现了基于BSD-licensed C++软件栈。（[FreeBSD 10 To Use Clang Compiler, Deprecate GCC](http://www.phoronix.com/scan.php?page=news_item&px=MTEwMjI)）

# 参考

* [FreeBSD 10 To Use Clang Compiler, Deprecate GCC](http://www.phoronix.com/scan.php?page=news_item&px=MTEwMjI)