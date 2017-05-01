在[虚拟机ping延迟问题排查](../../../virtual/network/troubleshoot/debug_vm_ping_reply_slow)时，通过tcpdump抓波分析定位到网络延迟的原因是因为网卡流量间歇性暴增，打满了单边（bonding）千兆网卡端口。但是，究竟是什么类型网络流量导致了网络拥塞？复杂的集群网络部署，混合了分布式存储、虚拟化网络、海量服务器日志采集等数据流，需要能够定位到具体的流量才能解决问题根源。

最初通过google，我发现有推荐古老的网络工具[TCPTrack](http://www.draconyx.net/articles/tcptrack-simple-tcp-connection-monitor.html)（然而这个工具已经停止开发并且在大负载千兆网络下很难正确工作），也有推荐使用WEB分析平台[ntop](http://www.ntop.org/)（但是部署使用略复杂有些杀鸡用牛刀的感觉）。

网络开发同学推荐了一个简单实用的终端工具[iftop](https://en.wikipedia.org/wiki/Iftop)，最初我以为只是IP流量展示（默认没有参数使用确实只展示主机间流量），但是简单查看了help，发现确实是一个非常实用展示网络端口流量的简洁工具，确实适合这种场景下使用。

# `iftop`简介

`iftop`是一个命令行系统监控工具用来显示网络连接。默认按照带宽使用排序连接，并且最大带宽消耗排最上方。`iftop`在命名的网络接口上监听网络流量并显示按照主机对显示当前流量带宽。

如果没有指定接口，`iftop`将监听在外部接口（使用`libcap`和`libncurses`）的第一个接口上。`iftop`必须使用超级管理员权限运行，因为需要监控所有网络流量。

默认`iftop`将解析地址对应的主机名并计算所有通过过滤器的IP地址。主机名查询会增加网络流量而显示在网络流量展示中。

# `iftop`安装

[EPEL](https://fedoraproject.org/wiki/EPEL)(Extra Packages for Enterprise Linux)提供了`iftop`安装包，使用以下命令安装EPEL repo再安装iftop：

```
rpm -ivh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.

yum install iftop -y
```

# `iftop`窗口说明

![iftop界面](../../../img/network/packet_analysis/utilities/iftop.png)

* 默认使用第一个网络接口`eth0`
* 默认显示`rates`的3列数据分别表示：最近2秒，10秒和40秒的平均流量。
* `peak`指网络速率的尖峰值（最大）
* `cum`表示累积流量`cumulative`，在交互界面时按下`T`就可以看到`主机对`之间累计的网络数据流量

# `iftop`交互界面操作

* `T` - 显示或隐藏累积网络数据量（`cumulative`），会在显示主机对的3列网络速率`rate`左边再增加一列显示累积数据量`cum`
* `S` - 显示源端端口
* `D` - 显示目的端端口
* `n` - 显示主机IP地址而不是解析的主机名
* `1/2/3` - 按照指定列进行排序
* `<` - 根据源名字排序
* `>` - 根据目的名字排序
* `P` - 暂停显示（否则就不断更新当前显示）
* `j/k` - 滚动显示
* `?` - 帮助

# `iftop`配置文件

`~/.iftoprc`是默认配置文件，格式是 `name:value`，举例

```
port-display: on
```

# `iftop`过滤和排序

在交互模式，按下`l`（表示`limit`）会在顶端显示一个文本输入框，可以输入过滤规则，只显示特定内容，例如只显示包含字符串`dropbox`，则会过滤显示主机名包含`dropbox`的流

![iftop过滤](../../../img/network/packet_analysis/utilities/iftop_filter_dropbox.jpg)

# `iftop`启动参数解析

启动参数实际就是交互中的模式

```
Synopsis: iftop -h | [-npbBP] [-i interface] [-f filter code] [-N net/mask]

   -h                  显示帮助信息
   -n                  不执行主机名DNS解析(即直接显示IP地址而不是主机名)
   -N                  不执行端口转换成服务操作（直接显示端口数字）
   -p                  运行在混杂模式（此时会显示整个网段中其他主机`部分`流量）
   -b                  不显示流量的图形条
   -B                  采用字节(bytes)显示带宽
   -i interface        监听在指定网络接口
   -f filter code      使用过滤代码来选择计数的数据包（默认是none，但是只计算IP包）
   -F net/mask         显示网络的in/out数据流
   -P                  显示端口
   -m limit            设置带宽等级的上限
   -c config file      指定替代的配置文件
```

`iftop`可以接收一系列启动参数，大多数参数和交互界面的快捷键相关。

使用`-f`参数是一种过滤特性数据包的方法，可以组合网络，主机或端口。例如以下只显示在`/dev/wlan0`无线网卡接口的SSH数据包：

```
iftop -i wlan0 -f "dst port 22"
```

一些组合案例：

| 过滤器 | 描述 |
| ---- | ---- |
| `dst host 1.2.3.4` | 所有目标地址是1.2.3.4的数据包 |
| `src port 22` | 所有从端口22发出的数据包 |
| `dst portrange 22-23` | 端口范围是22到23范围的数据包 |
| `gateway 1.2.3.5` | 使用网关地址1.2.3.5的数据包 |

使用bonding的多网卡物理服务器上，可以开启两个终端窗口，分别对两个物理网卡分析流量

```
iftop -n -N -P -B -i eth0

iftop -n -N -P -B -i eth1
```

这样可以观察bonding网卡不同的流量来判断网络均衡情况。

# 参考

* [IFTOP Guide: Display Network Interface Bandwidth Usage on Linux](http://www.thegeekstuff.com/2008/12/iftop-guide-display-network-interface-bandwidth-usage-on-linux/)
* [Analyzing Network Traffic with iftop](http://www.linux-magazine.com/Online/Features/Traffic-Watch)
* [The Sysadmin's Toolbox: iftop](http://www.linuxjournal.com/content/sysadmins-toolbox-iftop)
* [What do the three values mean on network monitoring tools](What do the three values mean on network monitoring tools)
* [Iftop Onscreen Command for Cumulative Total](https://www.shorttutorials.com/iftop-monitoring/iftop-onscreen-cumulative-total.html)