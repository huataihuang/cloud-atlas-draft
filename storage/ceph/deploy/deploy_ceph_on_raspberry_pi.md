# 树莓派上的Ceph

一直想构建一个Ceph集群，虽然使用KVM虚拟机环境，也可以实现多个节点的集群，但是，没有实际物理硬件，无法满足自己的"机械之心"对精巧设备的向往。通过廉价的树莓派，个人可以构建一个精巧的云存储系统，也为构建One Personal Cloud提供一个分布式存储基础。

> 有关硬件的思考请参考[为何我会选择树莓派组件Ceph集群](../hardware/README)：



已经有不少人实践过在树莓派上运行Ceph集群，例如 SuSE的Sven Seeberg 在openSUSE Conference 2017上演示了采用树莓派构建的Ceph集群。从现场展示的机器来看，应该是采用了TF卡这种固态存储设备来实现的大约18个节点的集群。


> 当前TF卡的价格也相对较低，但是容量比不上HDD硬盘，如果只是演示Ceph on Raspberry Pis，则采用TF卡作为存储也可以。

> Sven Seeberg 的Ceph on Raspberry Pis集群还使用了三色的LED来展示集群的监控状态。这个思路对于产品化有借鉴作用，例如IDC机房现场可以通过简单的LED或者液晶屏指示信息做硬件判断。
> 
> 我准备用ELK来实现Ceph集群的可视化监控。

# 硬件

| 硬件 | 说明 |
| ---- | ---- |
| 树莓派Raspberry Pi 3代 | |
| 树莓派X820存储扩展卡 | 通过树莓派USB接口转换成SATA存储接口 |
| 希捷2.5寸笔记本硬盘 | 5400转，容量500GB |

Ceph进程对于每GB存储需要消耗大约1MB内存，

# Ceph组件

Ceph集群组件如下：

* monitor - 监控集群健康
* osd - 文件存储
* mds - 在CephFS中使用

> 最好将`mon`和`osd`分开安装，避免同时故障引发判断错误（假设网络故障），由于案例中只有3个Raspberry Pi设备，所以`mon`和`osd`是并列部署在每个节点上：

| 主机名 | IP | 功能 |
| ---- | ---- | ---- |
| pi1 | 192.168.0.11 | Admin/Monitor/OSD |
| pi2 | 192.168.0.12 | Monitor/OSD |
| pi3 | 192.168.0.13 | Monitor/OSD |

> `pi1`作为`admin`角色，将在这个节点运行`ceph-deploy`

# 主机设置

要点：

* 所有节点运行ntp服务确保主机时间同步
* 所有主机名字必须能够解析，所以需要安装配置DNS服务器，或者在所有主机上配置`/etc/hosts`

> * 时间同步方法参考 [在Ubuntu系统部署NTP服务](../../../service/ntp/deploy_ntp_daemon_on_ubuntu)
> * DNS配置参考 [DNSmasq快速起步](../../../service/dns/dnsmasq/dnsmasq_quick_startup)

> 网络拓扑结构


# 安装


# 参考

* [Ceph Cluster Raspian (english version)](https://blog.raveland.org/post/raspian_ceph.en/) - 详细的安装步骤
* [Ceph Explained - With Raspberry Pis: Demonstration of Ceph on a Raspberry Pi cluster](https://media.ccc.de/v/1428-ceph-explained-with-raspberry-pis#t=2) - SuSE的Sven Seeberg的演讲视频，在[YouTube上也有](https://www.youtube.com/watch?v=9jjUygE8Wk4)（油管视频有机器提供的字幕），不过这个演讲没有提供实际的部署方法，并且我个人感觉解释不详尽