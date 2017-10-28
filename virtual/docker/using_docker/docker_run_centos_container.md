> 本文是快速部署CentOS系列Docker容器的快速指南

# 下载各个系列CentOS docker基础镜像

* 下载CentOS 5/6/7 版本基础镜像

```
sudo docker pull centos:5
sudo docker pull centos:6
sudo docker pull centos:7
```

* 检查下载的镜像：

```
sudo docker images
```

可以看到如下输出

```
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
docker.io/centos    7                   196e0ce0c9fb        5 weeks ago         197 MB
docker.io/centos    6                   5dedbd63518e        6 weeks ago         194 MB
docker.io/centos    5                   1ae98b2c895d        14 months ago       285 MB
```

# 启动各版本创建一个基础容器

## CentOS5容器

```
sudo docker run -it --hostname centos5 --name centos5 docker.io/centos:5 /bin/bash
```

注意：CentOS 5已经停止镜像，只能通过 http://vault.centos.org/5.11/ 下载更新，所以编辑 `/etc/yum.repos.d/CentOS-Vault.repo`

```
[C5.11-base]
name=CentOS-5.11 - Base
baseurl=http://vault.centos.org/5.11/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
enabled=1

[C5.11-updates]
name=CentOS-5.11 - Updates
baseurl=http://vault.centos.org/5.11/updates/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
enabled=1

[C5.11-extras]
name=CentOS-5.11 - Extras
baseurl=http://vault.centos.org/5.11/extras/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
enabled=1

[C5.11-centosplus]
name=CentOS-5.11 - Plus
baseurl=http://vault.centos.org/5.11/centosplus/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
enabled=1
```

## CentOS6容器

```
sudo docker run -it --hostname centos6 --name centos6 docker.io/centos:6 /bin/bash
```

## CentOS7容器

```
sudo docker run -it --hostname centos7 --name centos7 docker.io/centos:7 /bin/bash
```

# 升级和安装

* 进入容器安装必要的软件包

```
yum clean all
yum update

yum -y install which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts
```

> 默认的docker镜像中不安装ssh客户端（5）或ssh服务器（7），并且CentOS 7不安装 `initscripts` 软件包，则会缺乏`/etc/rc.d/init.d/functions`这样的`/etc/init.d`目录下`sysv`基础脚本，会导致一些传统脚本失效或报错。

* CentOS 5/6激活sshd

```
/etc/init.d/sshd start
chkconfig sshd on
```

* CentOS 7激活sshd

```
ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa
/usr/sbin/sshd
```

> 

> 实际轻量级微服务部署的docker，不需要安装如此多的软件，应该部署一个精简容器，只启动必要的服务 - 下次实践一个Django容器

# 制作镜像

```
sudo docker commit centos5 local:centos5
sudo docker commit centos6 local:centos6
sudo docker commit centos7 local:centos7
```

此后检查镜像

```
[huatai@devstack ~]$ sudo docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
local               centos7             89d417f57e5e        12 seconds ago      459 MB
local               centos6             6d071df1d7cb        48 seconds ago      428 MB
local               centos5             d0fcf242634d        2 minutes ago       546 MB
docker.io/centos    7                   196e0ce0c9fb        5 weeks ago         197 MB
docker.io/centos    6                   5dedbd63518e        6 weeks ago         194 MB
docker.io/centos    5                   1ae98b2c895d        14 months ago       285 MB
```

# 使用镜像创建容器

* centos 5

```
sudo docker run -it --hostname dev5 --name dev5 local:centos5 /bin/bash
```

* centos 6

```
sudo docker run -it --hostname dev6 --name dev6 local:centos6 /bin/bash
```

* centos 7

```
sudo docker run -it --hostname dev7 --name dev7 local:centos7 /bin/bash
```

# 通过Dockerfile创建镜像

上述手工完成的工作，可以改写成Dockerfile如下

* Dockerfile

```
FROM docker.io/centos:5
MAINTAINER vincent huatai <vincent@huatai.me>

RUN yum clean all
RUN yum -y update

RUN yum -y install which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts
```

* 执行命令

```
docker build -t local:centos5 .
```