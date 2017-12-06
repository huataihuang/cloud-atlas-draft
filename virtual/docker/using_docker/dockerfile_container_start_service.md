在[使用Docker快速部署不同版本CentOS容器](docker_run_centos_container)介绍了如何构建运行CentOS的容器，这样我们可以快速clone出多个以相同image构建的CentOS环境。

在`Dockerfile`中有很多`RUN`指令告诉docker在构建容器的时候需要完成哪些工作。但是要注意，这个`RUN`指令只在构建容器的时候运行一次，用于初始化容器。但是容器停止然后再次启动，则不会运行。

这样，对于我们每次启动容器都要运行的服务，该如何调用呢？

docker提供了另外一个指令 `CMD`，该指令在容器每次启动时都会执行，这样就可以在容器中启动服务，例如`sshd`。

举例：

> 这里同时添加了一个`authorized_keys`到容器中方便ssh登陆，所以在Dockerfile的相同目录下还要再准备一个从`authorized_keys`文件

```dockerfile
FROM docker.io/centos:7
MAINTAINER vincent huatai <vincent@huatai.me>

RUN yum clean all
RUN yum -y update

#RUN yum -y install which sudo mlocate net-tools rsyslog file ntp ntpdate \
#wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
#gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
#zlib-devel git openssh-clients openssh-server initscripts
RUN yum -y install which sudo openssh-clients openssh-server initscripts

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

# run service when container started
EXPOSE 22
#CMD /usr/sbin/sshd，this is not a interactive shell
CMD ["/usr/sbin/sshd", "-D"]
```

> `sshd`的参数`-D`是一个前台debug参数：

```
 -D      When this option is specified, sshd will not detach and does not become a daemon.  This allows easy monitoring of sshd.
```

> 参考[Dockerize an SSH service](https://docs.docker.com/engine/examples/running_ssh_service/)
>
> 注意：这里`EXPOSE 22`（等同于命令行`--expose=22`或`-p 22`）会将容器的22端口随机映射到host主机的网络对外网络接口上，此时就可以通过`docker port <容器名>`查看端口映射，即可使用动态映射的端口从外部网络访问虚拟容器的ssh服务。
>
> 如果要固定映射，则配置为`EXPOSE 22:8022`；命令行使用`-p 22:8022`将容器ssh端口映射成物理服务器的`8022`端口。

* 构建镜像

```bash
docker build -t local:centos7 .
```

* 创建容器

```
docker run -d -P --hostname dev7 --name dev7 local:centos7
```

> 这里不要使用`docker run -it`进入交互模式（最后启动的是`bash`会导致替换掉`Dockerfile`中的最后的`CMD ["/usr/sbin/sshd", "-D"]`） 
>
> -- 注意：`Dockerfile`最后的`CMD`指令会被`docker run ... /bin/bash`替换，命令行的`CMD`优先级高。

如果使用如下名林启动`/bin/bash`则会进入交互模式，此时不会启动`sshd`，但是可以在交互模式中使用手工命令`/usr/sbin/sshd`启动ssh服务：

```bash
docker run -it --hostname dev7 --name dev7 local:centos7 /bin/bash
```

# Dockerfile中`CMD`和`ENDPOINT`的区别

上述容器化`sshd`有一个非常麻烦的地方是，无法`docker attach`访问容器内部系统（因为最后一个`CMD`是`/usr/sbin/sshd -D`占用了控制台），对于传统的系统维护带来不便。

但是如上所述，如果在`docker run`命令行传递需要运行的指令`/bin/bash`虽然可以获得终端交互，但是带来上述`CMD ["/usr/sbin/sshd", "-D"]`被覆盖，就不能自动启动`ssh`服务。

解决的方法是使用`ENDPOINT`，这个方式的指令不会被命令行指令覆盖。此外，可以在`ENDPOINT`部分使用`&&`来连续处理多个服务启动，并最后执行`/bin/bash`来获得一个交互终端：

```
ENTRYPOINT /usr/sbin/sshd && /bin/bash
```

然后按照以下方式创建镜像和启动容器：

```bash
docker build -t local:centos7 .

docker run -itd --hostname dev7 --name dev7 local:centos7
```

**注意**：

* `docker run`参数要使用`-it`，这样表示启动一个`pty`(`-t`)和交互模式(`-i`)，以避免`/bin/bash`指令立即结束。如果没有`-it`参数，则容器瞬间启动并结束（因为`/bin/bash`已经执行结束了）。
* `docker run`参数使用`-d`表示detach，这样可以断开容器终端，让容器中的`/bin/bash`继续运行。这样也就达到了随时可以重新用`docker attach dev7`重新连接到虚拟容器进行进一步操作。

## 完整Dockerfile

```dockerfile
# HowTo use this dockerfile?
# ------ for example:
# 1. create image which name "local:centos7"
# 2. create container which name "dev7"
# --------------------------------------
# docker build -t local:centos7 .
# docker run -itd --hostname dev7 --name dev7 local:centos7

FROM docker.io/centos:7
MAINTAINER vincent huatai <vincent@huatai.me>

RUN yum clean all
RUN yum -y update

RUN yum -y install which sudo openssh-clients openssh-server initscripts

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

# run service when container started - sshd
EXPOSE 22
#CMD ["/usr/sbin/sshd", "-D"]

# ----------
# WANT run sshd and get a bash
# ENTRYPOINT will not be override by commandline
# ----------
ENTRYPOINT /usr/sbin/sshd && /bin/bash
```

# 其他服务启动案例

> 以下案例同时创建了共享存储和端口映射

```bash
# creat host share storage volume
docker volume create share-data

# create container with port 8000 map
docker run -itd -p 22 -p 8000:8000 --memory=2048M --cpus="1.5" --hostname dev7 --name dev7 \
-v share-data:/data local:centos7
```

或者简化一些：

```
docker run -itd --hostname dev7 --name dev7 -v share-data:/data local:centos7
```

> 最新的Dockerfile见我的[DevOps: Docker: CentOS7](https://github.com/huataihuang/devops/tree/master/centos/7)

# 参考

* [How to automatically start a service when running a docker container?](https://stackoverflow.com/questions/25135897/how-to-automatically-start-a-service-when-running-a-docker-container)
* [Dockerize an SSH service](https://docs.docker.com/engine/examples/running_ssh_service/)
* [Run multiple services in a container](https://docs.docker.com/engine/admin/multi-service_container/)
* [How to automatically start a service when running a docker container?](https://stackoverflow.com/questions/25135897/how-to-automatically-start-a-service-when-running-a-docker-container)