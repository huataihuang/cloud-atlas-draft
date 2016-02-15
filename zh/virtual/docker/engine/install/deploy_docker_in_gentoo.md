在Gentoo Linux上安装Docker有两种方式：

* 使用官方源
* 使用`docker-overlay`方法

> 官方源由[Gentoo Docker](https://wiki.gentoo.org/wiki/Project:Docker)团队维护
>
> 建议使用官方源的稳定版本`app-emulation/docker`

> 如果需要使用`-bin` ebuild，以及实时更新ebuild或者希望使用最新的ebuild，则可以是使用overlay。通过`app-portage/layman`添加`docker-overlay`就可以使用最新且及时更新的文档。

# 可用的USE flags

| USE Flag | 默认 | 描述 |
| --- | --- | --- |
| `aufs` | | 通过补丁方式安装`sys-kernel/aufs-sources`，且要激活`CONFIG_AUFS_FS` |
| `btrfs` |  | 使用btrfs作为存储后端 |
| `contrib` | Yes | 安装附加的脚本和组件 |
| `device-mapper` | Yes | 使用`devicemapper`作为存储后端，也就是使用LVM卷管理 |

> 默认使用`devicemapper`作为存储，请参考"在Gentoo上使用LVM"
> 
> USE flags参数描述参考[tianon’s blog](https://tianon.github.io/post/2014/05/17/docker-on-gentoo.html)

# 内核配置

[Docker支持的内核配置参考](https://wiki.gentoo.org/wiki/Docker)

```
General setup  --->
    [*] POSIX Message Queues
    [*] Control Group support  --->
        [*]   Freezer cgroup subsystem
        [*]   Device controller for cgroups
        [*]   Cpuset support
        [*]   Simple CPU accounting cgroup subsystem
        [*]   Enable perf_event per-cpu per-container group (cgroup) monitoring
        [*]   Group CPU scheduler  --->
            [*]   Group scheduling for SCHED_OTHER
            [*]     CPU bandwidth provisioning for FAIR_GROUP_SCHED
    -*- Namespaces support
        [*]   UTS namespace
        [*]   IPC namespace
        [*]   PID Namespaces
        [*]   Network namespace
[*] Networking support  --->
       Networking options  --->
        [*] Network packet filtering framework (Netfilter)  --->
            [*]   Advanced netfilter configuration
            [*]     Bridged IP/ARP packets filtering
         Core Netfilter Configuration  --->
                  *** Xtables matches ***
            <*>   "addrtype" address type match support
            <*>   "conntrack" connection tracking match support
         IP: Netfilter Configuration  --->
            <*> IPv4 connection tracking support (required for NAT)
            <*> IP tables support (required for filtering/masq/NAT)
            <*>   Packet filtering
            <*>   IPv4 NAT
            <*>     MASQUERADE target support
        <*> 802.1d Ethernet Bridging
Device Drivers  --->
    [*] Multiple devices driver support (RAID and LVM)  --->
        <*>   Device mapper support
        <*>     Thin provisioning target
    [*] Network device support  --->
        [*]   Network core driver support
        <*>     Virtual ethernet pair device
       Character devices  --->
        -*- Enable TTY
        -*-   Unix98 PTY support
        [*]     Support multiple instances of devpts
```


    *   CONFIG_MACVLAN
    *   CONFIG_VETH
    *   CONFIG_BRIDGE
    *   CONFIG_BRIDGE_NETFILTER
    *   CONFIG_CGROUP_HUGETLB
    *   CONFIG_NET_CLS_CGROUP
    *   CONFIG_CFS_BANDWIDTH （可选，用于容器状态数据搜集）
    *   CONFIG_RT_GROUP_SCHED
    *   CONFIG_CGROUP_NET_PRIO
    *   CONFIG_BLK_DEV_DM
    *   CONFIG_DM_THIN_PROVISIONING

# 启动Docker

确保内核已经包含了必要的模块和配置（如可选的的`device-mapper`，`AUFS`或`Btrfs`）

要使用Docker，需要以 **root** 身份运行`docker`服务。要以 **non-root** 用户身份运行Docker，则需要使用如下命令将自己加入到`docker`组

	sudo usermod -a -G docker USER


# 参考

* [Docker Docs - Installation on Gentoo](https://docs.docker.com/engine/installation/linux/gentoolinux/)
* [Gentoo Linux wiki: Docker](https://wiki.gentoo.org/wiki/Docker)