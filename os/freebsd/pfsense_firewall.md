> 很久以前使用过FreeBSD的内核防火墙功能，最近有用户咨询在云上运行pfSense防火墙的方案，调研了一下相关信息，后期可以模拟测试。
>
> pfSense提供了[pfsense/FreeBSD-ports](https://github.com/pfsense/FreeBSD-ports)，所以可以在FreeBSD上直接构建企业级的防火墙。对于在云计算平台，就FreeBSD的定制安装，(应该)可以实现pfSense运行。

# pfSense简介

[pfSense](https://www.pfsense.org)上一个开源的基于FreeBSD路由和防火墙内核定制的一个防火墙产品，非常灵活稳定，降低了FreeBSD复杂的防火墙设置难度。

2004年，pfsense作为m0n0wall项目（基于freebsd内核的嵌入式软防火墙）的分支项目启动，增加了许多m0n0wall没有的功能(pfSense的官方网站称它为the better m0n0wall).pfSense除了包含宽带路由器的基本功能外,还有以下的特点:

* 基于稳定可靠的FreeBSD操作系统,能适应全天候运行的要求
* 具有用户认证功能,使用Web网页的认证方式,配合RADIUS可以实现记费功能
* 完善的防火墙、流量控制和数据包功能,保证了网络的安全,稳定和高速运行
* 支持多条WAN线路和负载均衡功能,可大幅度提高网络出口带宽,在带宽拥塞时自动分配负载
* 内置了IPsec 和PPTP VPN功能,实现不同分支机构的远程互联或远程用户安全地访问内部网
* 支持802.1Q VLAN标准,可以通过软件模拟的方式使得普通网卡能识别802.1Q的标记,同时为多个VLAN的用户提供服务
* 支持使用额外的软件包来扩展pfSense功能,为用户提供更多的功能(如FTP和透明代理).
* 详细的日志功能,方便用户对网络出现的事件分析,统计和处理
* 使用Web管理界面进行配置(支持SSL),支持远程管理和软件版本自动在线升级

> [pfSense下载](https://www.pfsense.org/download/)提供了基于U盘和CD ISO的下载，此外也提供GitHub开源代码。

pfSense软件包含了一个可以配置所有组件的web界面，所以可以无需任何UNIX知识，也不需要使用命令行。通常对商业防火墙熟悉的用户可以很快就使用pfSense来定制自己的需求。

* 硬件要求

pfSense上软件防火墙，可以使用通用的PC设备来实现。只需要使用live CD或者U盘测试硬件兼容性（和性能）就可以决定采用那种硬件来运行。甚至可以运行在嵌入系统中。

# 安装简介

请参考[Installing pfSense](https://doc.pfsense.org/index.php/Installing_pfSense)介绍了通过ISO, Memstick实现安装的过程。如果你熟悉FreeBSD的终端界面安装，可以认为是一个定制简化的FreeBSD安装过程。

# 配置简介

> 待实践补充

# 参考

* [图解pfSense软路由系统的使用（NAT功能）](http://seanlook.com/2015/04/23/pfsense-usage/) - 这篇文档详细介绍了pfSense的安装配置过程，值得参考