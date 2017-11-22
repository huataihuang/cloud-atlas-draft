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

注意：CentOS 5已经停止镜像，但是可以通过 http://vault.centos.org/5.11/ 下载更新，所以编辑 `/etc/yum.repos.d/CentOS-Vault.repo`（只需要这个配置文件就可以）

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

[base-source]
name=CentOS-$full_releasever - Base source
baseurl=http://vault.centos.org/5.11/os/Source/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
priority=1
enabled=1


[updates-source]
name=CentOS-$full_releasever - Updates Source
baseurl=http://vault.centos.org/5.11/updates/Source/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-5
priority=1
enabled=1
```

> 这里同时激活了`base-source`和`updates-source`源，可以方便下载SRPM进行自己的编译安装。

> 补充：
>
> 但是CentOS 5系列依然缺少一些基础软件（例如`git`），可参考[CentOS 5平台通过yum安装git](../../../os/linux/redhat/package/install_git_on_centos5_using_yum)方法，添加EPEL的软件仓库作为补充：

```
sudo rpm -Uvh http://dl.fedoraproject.org/pub/epel/5/i386/epel-release-5-4.noarch.rpm
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

yum -y install sudo which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts
```

> 默认的docker镜像中不安装ssh客户端（5）或ssh服务器（7），并且CentOS 7不安装 `initscripts` 软件包，则会缺乏`/etc/rc.d/init.d/functions`这样的`/etc/init.d`目录下`sysv`基础脚本，会导致一些传统脚本失效或报错（例如，无法执行`sshd-keygen`）。

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

> CentOS 7上也可以使用`sshd-keygen`来生成服务器的key，然后就可以启动`/usr/sbin/sshd`

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

# 添加ssh密钥

* 通过Dockerfilei添加ssh密钥

为了实现ssh登陆到docker容器中，建议使用的是密钥登陆方式。docker支持将host主机中的文件添加到容器中，可以在`Dockerfile`使用的指令是`ADD`。此外，在`docker build`指令时候，也可以通过`--build-arg`将host主机上的密钥内容转换成变量传递给docker，以便在Dockerfile中引用。

> 参考 [Using SSH keys inside docker container](https://stackoverflow.com/questions/18136389/using-ssh-keys-inside-docker-container)

举例，以下添加一个github账号的私钥到容器中，以便能够方便开发

```Dockerfile
# Setup for ssh onto github
RUN mkdir -p /root/.ssh
ADD id_rsa /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN echo "Host github.com\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config
```

以下Dockerfile中将源代码目录复制到docker容器中，并且将私钥复制到容器中，安装nodejs模块，映射端口，最后启动服务，是一个比较完整的案例，值得参考

```Dockerfile
#DOCKER-VERSION 0.3.4                                                           

from  ubuntu:12.04                                                              

RUN  apt-get update                                                             
RUN  apt-get install python-software-properties python g++ make git-core openssh-server -y
RUN  add-apt-repository ppa:chris-lea/node.js                                   
RUN  echo "deb http://archive.ubuntu.com/ubuntu precise universe" >> /etc/apt/sources.list
RUN  apt-get update                                                             
RUN  apt-get install nodejs -y                                                  

ADD . /src                                                                       
ADD ../../home/ubuntu/.ssh/id_rsa /root/.ssh/id_rsa                             
RUN   cd /src; npm install                                                      

EXPOSE  808:808                                                                 

CMD   [ "node", "/src/app.js"]
```

> 在[Using SSH Private keys securely in Docker build](http://blog.cloud66.com/using-ssh-private-keys-securely-in-docker-build/)也有一个比较有意思的解决方法，是通过在docker容器中运行wget，从host主机的一个本地运行的web服务器上下载密钥，也算一种解决方法：

```
FROM ubuntu  
... usual apt-get steps + adding github to known_hosts
RUN wget -O ~/.ssh/id_rsa http://192.168.99.1:8080/secrets/file/id_rsa && ssh -T git@github.com && rm ~/.ssh/id_rsa  
```

# 通过Dockerfile创建镜像

上述手工完成的工作，可以改写成Dockerfile如下

* Dockerfile

```Dockerfile
FROM docker.io/centos:5
MAINTAINER vincent huatai <vincent@huatai.me>

RUN yum clean all
RUN yum -y update

RUN yum -y install which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts

# Add ssh public key for login
RUN mkdir -p /root/.ssh
ADD authorzied_keys /root/.ssh/authorzied_keys
RUN chmod 600 /root/.ssh/authorzied_keys
RUN chmod 700 /root/.ssh 
```

* 执行命令

```
docker build -t local:centos5 .
```