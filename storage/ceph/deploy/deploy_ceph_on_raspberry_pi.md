# 树莓派上的Ceph

一直想构建一个Ceph集群，虽然使用KVM虚拟机环境，也可以实现多个节点的集群，但是，没有实际物理硬件，无法满足自己的"机械之心"对精巧设备的向往。通过廉价的树莓派，个人可以构建一个精巧的云存储系统，也为构建One Personal Cloud提供一个分布式存储基础。

> 有关硬件的思考请参考[为何我会选择树莓派组件Ceph集群](../hardware/README)：
>
> 已经有不少人实践过在树莓派上运行Ceph集群，例如 SuSE的Sven Seeberg 在openSUSE Conference 2017上演示了采用树莓派构建的Ceph集群。从现场展示的机器来看，应该是采用了TF卡这种固态存储设备来实现的大约18个节点的集群。
>
> 当前TF卡的价格也相对较低，但是容量比不上HDD硬盘，如果只是演示Ceph on Raspberry Pis，则采用TF卡作为存储也可以。
>
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
* mds - 在CephFS中使用，即[ceph metadata server daemon](http://docs.ceph.com/docs/master/man/8/ceph-mds/)

> 最好将`mon`和`osd`分开安装，避免同时故障引发判断错误（假设网络故障），由于案例中只有3个Raspberry Pi设备，所以`mon`和`osd`是并列部署在每个节点上：

| 主机名 | IP | 功能 |
| ---- | ---- | ---- |
| store-1 | 192.168.0.11 | Admin/Monitor/OSD |
| store-2 | 192.168.0.12 | Monitor/OSD |
| store-3 | 192.168.0.13 | Monitor/OSD |

> `store-1`作为`admin`角色，将在这个节点运行`ceph-deploy`

# 主机设置

要点：

* 所有节点运行ntp服务确保主机时间同步
* 所有主机名字必须能够解析，所以需要安装配置DNS服务器，或者在所有主机上配置`/etc/hosts`

> * 时间同步方法参考 [在Ubuntu系统部署NTP服务](../../../service/ntp/deploy_ntp_daemon_on_ubuntu)
> * DNS配置参考 [DNSmasq快速起步](../../../service/dns/dnsmasq/dnsmasq_quick_startup)

> 网络拓扑结构


# 安装

> 当前Raspbian版本是9.4，即`stretch`版本，请参考 [Ceph Get Packages](http://docs.ceph.com/docs/master/install/get-packages/) 设置仓库配置。

我的实践是参考官方 [Ceph Get Packages](http://docs.ceph.com/docs/master/install/get-packages/) 来完成，以官方安装方法为准。

* 安装release.asc key

```
wget -q -O- 'https://download.ceph.com/keys/release.asc' | sudo apt-key add -
```

* 添加debian源：

```
sudo apt-add-repository 'deb https://download.ceph.com/debian-luminous/ {codename} main'
```

> Raspbian没有`apt-add-repository`，所以采用如下命令直接添加`/etc/apt/sources.list.d/ceph.list`

```
echo deb https://download.ceph.com/debian-luminous/ $(lsb_release -sc) main | sudo tee /etc/apt/sources.list.d/ceph.list
```

注意，对于ARM处理器，需要 Google的memory profiling tools(google-perftools)

```
echo deb https://download.ceph.com/packages/google-perftools/debian  $(lsb_release -sc) main | sudo tee /etc/apt/sources.list.d/google-perftools.list
```

> 参考[Google perftools usage with ceph](http://www.yangguanjun.com/2015/10/30/google-perftools-usage-with-ceph/)

* 安装

```
apt install ceph ceph-deploy
```

> 如果要使用CephFS，则还需要安装`ceph-mds`软件包。默认会同时安装`xfsprogs`，因为Ceph缺省使用XFS作为底层文件系统。

# 部署Ceph

Ceph提供了一个`ceph-deploy`工具用于部署和管理Ceph集群，依赖的是ssh执行命令，所以需要打通3个主机的SSH密钥免密码登陆。

> 详细的`ceph-deploy`使用手册参考[man: ceph-deploy](http://docs.ceph.com/docs/hammer/man/8/ceph-deploy/)

在使用`ceph-deploy`之前，我们先创建一个`ceph`账号（在每个服务器上执行），并给予`完全的sudo访问权限`：

```
groupadd -g 501 ceph
useradd -g 501 -u 501 -s /bin/bash -d /home/ceph -m ceph

echo 'ceph ALL = (root) NOPASSWD:ALL' > /etc/sudoers.d/ceph
```

在作为`Admin`角色的`store-1`主机上，切换到`ceph`用户账号执行`ssh-keygen`命令，生成密钥对，注意`paraphrase`项留空以便无需密码输入。

```
su -s /bin/bash - ceph
ssh-keygen
```

* 作为`ceph`用户，将ssh公钥复制到所有主机，包括自己：

```
su -s /bin/bash - ceph
for h in store-1 store-2 store-3;do ssh-copy-id ${h};done
```

> 复制完成后，在所有主机的`~/.ssh`目录下可以看到`authorized_keys`文件包含`store-1`的公钥，这样就可以从`store-1`主机无密码ssh登陆到集群所有主机上。

* 作为`ceph`用户，需要创建一个`ceph-deploy`目录

```bash
cd ~
mkdir ceph-deploy && cd ceph-deploy
ceph-deploy new --public-network 192.168.0.0/24 store-1 store-2 store-3
```

> `ceph-deploy`提供将初始配置文件`ceph.conf`复制到集群节点。
>
> 部署日志记录在当前目录的`ceph-deploy-ceph.log`

* 安装Ceph软件包

```bash

```

# 参考

* [Ceph Cluster Raspian (english version)](https://blog.raveland.org/post/raspian_ceph.en/) - 详细的安装步骤
* [Ceph官方：Storage Cluster Quick Start](http://docs.ceph.com/docs/mimic/start/quick-ceph-deploy/)
* [Ceph Explained - With Raspberry Pis: Demonstration of Ceph on a Raspberry Pi cluster](https://media.ccc.de/v/1428-ceph-explained-with-raspberry-pis#t=2) - SuSE的Sven Seeberg的演讲视频，在[YouTube上也有](https://www.youtube.com/watch?v=9jjUygE8Wk4)（油管视频有机器提供的字幕），不过这个演讲没有提供实际的部署方法，并且我个人感觉解释不详尽
