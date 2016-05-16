# `ad_select`概述

在Bonding驱动v3.4.0，增加了一个802.3AD模式（mode 4）的参数来实现aggreator选择。

初始模式或以前版本模式现在称为`Stable`模式作为默认选项。新增了2个策略，`Bandwidth`（带宽）和`Count`（计数）被增加，通过全部贷款来选择激活的aggregator或者通过aggregator的端口数量来选择。这两个策略和stable策略不同，它们是在bond发生可用性相关变化时候重新选择active aggregator时候使用（例如，连接状态发生变化）。

`Bandwith`和`Count`选择策略允许802.3ad聚合在激活聚合发生部分失效时实现failover，这使得aggregator能够在任何时候实现最高的高可用（或者是带宽或者是端口数量）。

# `ad_select`详细描述

`ad_select`参数可以作为`BONDING_OPTS`参数添加到`/etc/sysconfig/network-scripts`目录下的`ifcfg_bond*`配置文件，参数值可以使用3个值之一：

* `Stable`或`0`

这是原始特性也是默认设置

激活的聚合是通过最大聚合带宽来选择的。只在激活的聚合的所有slave接口都down掉的情况下或者激活的聚合没有任何slave接口的时候才会重新选择激活的聚合。

* `Bandwith`或者`1`

这个策略是通过最大聚合带宽来选择聚合。如果发生以下情况则开始重新选择激活的聚合：

    * 当有一个slave被添加到bond或者从bond中移除
    * 任何slave链路状态变化
    * 任何slave的802.3ad相关状态变化
    * bond的管理状态变更成up

* `Count`或者`2`

通过slave的最大端口数量来选择活跃的aggregator。发生重新选择的条件和上述`Bandwidth`设置相同。

# 案例

使用1个10GB网卡和4个1GB网卡的聚合实现一个802.3ad的failvoer － [bonding over bonding](http://sourceforge.net/p/bonding/discussion/77913/thread/d44ec9cc/)

可以使用带有`ad_select=bandwidth`参数的802.3ad模式，在交换机上创建2个LACP组，一个是针对`10G`，一个是针对`1G`，此时linux bonding 802.3ad就会使用两个不同的aggregator（将5个接口设置成一个bond），并通过`ad_select`选项选择最佳的aggreator（例如这里是带宽）。

**注意：需要使用bonding的驱动是3.5.0才支持`ad_select`** - 可以看到 [服务器bonding失败](#服务器bonding失败) 使用的RHEL 5.4操作系统的内核 `2.6.18-164` ，启动的bonding driver 也是 `3.4.0` 可能也存在类似问题。

参考 [Ubuntu 10.10 Bonding changed?](http://ubuntuforums.org/showthread.php?t=1595177) 提出的bonding参数

    options bonding mode=4 miimon=100 lacp_rate=1 downdelay=200 updelay=200

上述参数可以借鉴（也许和delay参数有关）

# 参考

* [Red Hat Linux Enterprise 6 - What Is the Bonding Paramater ad_select?](http://support.hp.com/hk-en/document/c02695247)
* [获取Linux网卡信息](#获取Linux网卡信息)
