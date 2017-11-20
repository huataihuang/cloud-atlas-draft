作为个人开发平台，最好的运行环境就是Docker，可以把各种开发测试环境通过dokcer完美地运行于一个笔记本内，并且不会影响到host主机操作系统环境。非常方便迭代和复杂测试。

# 安装docker

* 通过发行版安装docker

```
sudo dnf install docker
```

* 启动docker

```
sudo systemctl start docker
```

* 设置docker在操作系统启动时启动

```
sudo systemctl enable docker
```

# 部署CentOS容器

* 下载CentOS 5/6/7 版本基础镜像

```
sudo docker pull centos:5
sudo docker pull centos:6
sudo docker pull centos:7
```

* 在host主机上创建`share-data`卷

> 各容器中通过host上的存储卷共享数据，这样方便数据交换和备份

```
docker volume create share-data
```

* 启动共享存储的容器

```
docker run -it -p 22 --memory=2048M --cpus="2" --hostname centos5 --name centos5 -v share-data:/data docker.io/centos:5 /bin/bash

docker run -it -p 22 --memory=2048M --cpus="2" --hostname centos6 --name centos6 -v share-data:/data docker.io/centos:6 /bin/bash

docker run -it -p 22 --memory=2048M --cpus="2" --hostname centos7 --name centos7 -v share-data:/data docker.io/centos:7 /bin/bash
```

* 在虚拟容器内部安装需要的软件包：

```
yum clean all
yum -y update

yum -y install which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts
```

* 启动sshd

```
sshd-keygen
/usr/sbin/sshd
```

使用非systemd的CentOS 5/6 可以使用`/etc/init.d/sshd start`来启动ssh服务。

> 上述手工操作可以通过DockerFile来自动完成，参考 [使用Docker快速部署不同版本CentOS容器](../virtual/docker/using_docker/docker_run_centos_container) 最后部分使用的DockerFile操作方法。

# 参考

* [安装Docker](../virtual/docker/using_docker/install_docker)
* [使用Docker快速部署不同版本CentOS容器](../virtual/docker/using_docker/docker_run_centos_container)
* [映射Docker容器内服务端口提供外部服务](../virtual/docker/using_docker/mapping_docker_container_port)
* [Docker卷](../virtual/docker/using_docker/docker_volume)