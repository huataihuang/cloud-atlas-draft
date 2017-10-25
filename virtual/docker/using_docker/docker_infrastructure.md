# Docker架构

* Docker 守护进程

负责容器的创建、运行和监控，还负责镜像的构建和储存。Docker 守护进程通过 docker daemon 命令启动，一般会交由主机的操作系统负责执行。

* Docker 客户端

通过 HTTP 与 Docker 守护进程通信。默认使用 Unix 域套接字（Unix domain socket）实现，但为了支持远程客户端也可以使用 TCP socket。如果该套接字由 systemd 管理的话，也可以使用文件描述符。

与守护进程通信的 API 都有清晰的定义和详细文档，使得开发者可以利用这套 API 来开发与守护进程直接通信的程序，而无需通过 Docker 客户端。

* Docker 寄存服务

负责储存和发布镜像。默认的寄存服务为 Docker Hub，它托管了数以千计的公共镜像，以及由其负责把关的“官方”镜像。许多组织会搭建自己的寄存服务器，用于储存商业用途和机密的镜像，这样做还可以节省从互联网下载镜像所浪费的时间。

当 Docker 守护进程收到 docker pull 请求之后，便会从寄存服务器下载镜像。而当遇到 docker run 请求或 Dockerfile 中的 FROM 指令时，假如本地没有它们要求的镜像存在，Docker 守护进程也会自动从服务器下载镜像。

# 底层技术

Docker 守护进程通过一个“执行驱动程序”（execution driver）来创建容器。默认情况下，它是 Docker 项目自行开发的 `runc` 驱动程序，但仍支持旧有的 LXC。runc 与下面提到的内核功能密不可分。

* `cgroups`，负责管理容器使用的资源（例如 CPU 和内存的使用）。它还负责冻结和解冻容器这两个 `docker pause` 命令所需的功能。
* `namespaces`（命名空间），负责容器之间的隔离；它确保系统的其他部分与容器的文件系统、主机名、用户、网络和进程都是分开的。

Libcontainer 还支持 SElinux 和 AppArmor，它们可以给容器更稳固的安全保障。

另一个主要的 Docker 底层技术就是联合文件系统（Union File System，UFS），它负责储存容器的镜像层。UFS 由数个存储驱动中的其中之一提供，可以是 AUFS、devicemapper、BTRFS 或 Overlay。

# 周边技术

Docker 引擎和 Docker Hub 并不足以构成一套完整的容器方案。大部分用户发现它们还需要一些支撑服务和软件，诸如集群管理、服务发现（service discovery）工具和更先进的联网功能。

* Swarm

Docker 的集群方案。Swarm 可以把多个 Docker 主机组合起来，使其资源能整合为一体。

* Compose

Docker Compose 是负责构建和运行由多个 Docker 容器所组成的应用程序的工具。它主要用于开发和测试，而不太用于生产环境。

* Machine

Docker Machine 可以在本地或远程资源上安装和配置 Docker 主机。Machine 还能配置 Docker 客户端，使用户能轻松地在不同的环境之间切换。

* Kitematic

Kitematic 是一个 Mac OS 和 Windows 上的 GUI，用于运行和管理 Docker 容器。

* Docker Trusted Registry

Docker 的一个企业内部方案，用于储存和管理 Docker 镜像。实际上它是个 Docker Hub 的本地版本，能够与企业或组织现有的安全基础架构集成，并能帮助他们遵守有关数据存储和安全方面的法规。其特点包括指标（metrics）、基于角色的权限控制（Role-Based Access Control，RBAC）和日志，它们全部通过一个管理控制台管理。这是 Docker 公司目前唯一的非开源产品。

* 网络连接

Docker 实现一个集成的联网方案，名为 Overlay。通过 Docker 的联网插件架构，用户可以用其他方案取代 Overlay 驱动程序。

* 服务发现

当 Docker 容器启动时，它需要通过某种方法来找出与之通信的服务，而这些服务一般也是运行在容器内的。容器的 IP 地址是动态分配的，因此在大型系统中要解决这个问题并非易事。

常用的是 etcd（https://github.com/coreos/etcd），集成到Kubernetes中。

* 服务编排及集群管理 - 这方面已有数个解决方案互相竞争，包括来自
  * 谷歌的 Kubernetes（http://kubernetes.io/）
  * Marathon（https://github.com/mesosphere/marathon）[ 来自 Mesos  （https://mesos.apache.org/）的框架 ]
  * CoreOS 的 Fleet（https://github.com/coreos/fleet）
  * Docker 自家的 Swarm。

在大型的容器部署上，监控和管理系统的工具必不可少。对每个新的容器，都需要安排把它放置在哪台主机上，并对它实施监控和保持更新。系统需要对故障的出现或负载的改变作出反应，实际情况下可能是搬迁、启动或停止容器。

* Docker Trusted Registry 也有替代方案
  * CoreOS 的 Enterprise Registry（https://coreos.com/products/enterprise-registry/）
  * JFrog 的 Artifactory（http://www.jfrog.com/open-source/#os-arti）

* 数据卷插件（volume plugin） - 用于与其他存储系统集成
  * Flocker（https://github.com/ClusterHQ/flocker），一个多主机数据管理及迁移工具
  * GlusterFS（https://github.com/calavera/docker-volume-glusterfs）用于分布式存储

* Docker发行版
  * Project Atomic（http://www.projectatomic.io/）
  * CoreOS（https://coreos.com/）
  * RancherOS（http://rancher.com/rancher-os/）

# Docker托管

* 谷歌的 Container Engine 是直接在 Kubernetes 上构造
* Joyent 在 SmartOS 之上构建，叫作 Triton。它利用自己的容器和 Linux 模拟技术实现了 Docker API，使得 Joyent 成功创造了一个可以与普通 Docker 客户端通信的公共云平台。重要的是，Joyent 认为它的容器实现足够安全，可以直接运行于裸机之上，因此没有必要使用虚拟机，这意味着在效能方面（尤其是输入 / 输出）能得到大大提升。

一些 PaaS 平台项目是在 Docker 的基础之上建立的

* Deis（http://deis.io/）
* Flynn（https://flynn.io/）
* Paz（http://paz.sh）