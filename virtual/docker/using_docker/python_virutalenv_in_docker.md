在实现了[Docker容器启动时启动ssh服务](dockerfile_container_start_service)，基本实现了一个可以随时构建的干净的容器环境。

以此类推，我们很容易就在上述Docker容器环境中安装各种软件包，构建[一个Docker容器中运行的开发环境](https://github.com/huataihuang/devops/tree/master/centos/7/dev)。

但是，在运行环境中，服务和python的虚拟环境（`virtualenv`）都是以`admin`用户身份运行的。如何在Docker中实现以`admin`身份来构建环境呢？

最初我想到的是`sudo`，也就是使用`sudo -i -u admin "virtualenv venv2"`来构建（模拟日常在shell终端中的操作）。但是，实际在`Dockerfile`中使用指令：

```dockerfile
RUN sudo -i -u admin "virtualenv venv2"
```

则会提示错误`-bash: virtualenv venv2: command not found`。

原来Docker内建了切换用户身份来运行指令的命令`User`，实际上不要使用`sudo`，格式如下：

```
USER admin
RUN virtualenv /home/admin/venv2
```

> 在`Dockerfile`中每次使用`User`指令都会切换一次执行身份。所以，如果后面又需要切换回`root`身份的话，还要使用一次`User`指令。

完整的构建Python 2.7的virtualenv环境`Dockerfile`:

```dockerfile
FROM docker.io/centos:7
MAINTAINER vincent huatai <vincent@huatai.me>

RUN yum clean all
RUN yum -y update

RUN yum -y install which sudo nmap-ncat mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 xz screen sysstat unzip nfs-utils lsof man bind-utils \
crontabs openssh-clients openssh-server initscripts

# install pip + virtualenv
RUN curl https://bootstrap.pypa.io/get-pip.py | python2.7
RUN pip2.7 install virtualenv

# Prepare sshd host key
RUN ssh-keygen -A

# add account "admin" and give sudo privilege
RUN groupadd -g 505 admin
RUN useradd -g 505 -u 505 -d /home/admin -m admin
RUN usermod -aG wheel admin
RUN echo "%wheel        ALL=(ALL)       NOPASSWD: ALL" >> /etc/sudoers

# Add ssh public key for login
RUN mkdir -p /home/admin/.ssh
ADD authorized_keys /home/admin/.ssh/authorized_keys
RUN chown -R admin:admin /home/admin/.ssh
RUN chmod 600 /home/admin/.ssh/authorized_keys
RUN chmod 700 /home/admin/.ssh

# deploy python virtualenv, sudo to admin
USER admin
RUN virtualenv /home/admin/venv2

# run service sshd & bash console
USER root
EXPOSE 22
ENTRYPOINT /usr/sbin/sshd && /bin/bash
```

> [最新的构建Python virtualenv的Dockerfile](https://github.com/huataihuang/devops/tree/master/centos/7/python2.7)

# 更完善的Dockerfile

[Docker and Virtualenv? A clean way to locally install python dependencies with pip in Docker](http://blog.theodo.fr/2015/04/docker-and-virtualenv-a-clean-way-to-locally-install-python-dependencies-with-pip-in-docker/) 提供了使用`docker-compose`文件来构建Python virtualenv环境以及服务器部署的方法，后续再参考实践。

# 参考

* [Using sudo inside a docker container](https://stackoverflow.com/questions/25845538/using-sudo-inside-a-docker-container)