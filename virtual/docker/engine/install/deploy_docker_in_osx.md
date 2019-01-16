> 作为开发运维人员，很多人喜欢[使用Mac OS X作为自己的工作平台](../../../../develop/mac/README.md)，我也不例外 ^_^

> 本文是早期采用Docker Toolbox（也就是VirtualBox虚拟机来运行Docker）的方案，当前最新版本的Docker已经可以采用类似KVM的Hypervisor，即[bhyve](../../../bhyve/README)来运行，性能更佳。详细的最新版本Docker for macOS请参考[Docker for Mac快速起步](../../docker_for_mac/docker_for_mac_startup)。

Docker虽然不支持在Linux之外的操作系统直接运行（因为其底层技术和Linux内核紧密结合），但是可以通过在其他操作系统，如Mac OS X、Windows等，借助其他虚拟机（如VirtualBox，VMware）内部运行的Linux来运行Docker。在Mac OS X上，Docker通过[Docker Toolbox](https://www.docker.com/toolbox)来方便部署Docker容器。

Docker Toolbox包括了以下Docker工具：

* 运行`docker-machine`程序的Docker Machine - 这个工具是为了创建和连接到虚拟机
* 运行`docker`程序的Docker Engine
* 运行`docker-compose`程序的Docker Compose
* Docker GUI程序Kitematic
* 支持Docker命令行环境的预配置shell
* Oracle VM VirtualBox

# Mac OS X运行Docker的架构

在OS X中，`docker`服务并不是直接运行在原生状态（例如Linux中是直接运行在物理主机Linux操作系统），而是运行在一个名为`default`的Linux虚拟机。这个`default`虚拟机是一个在Mac OS X中只运行Docker服务的轻量级Linux虚拟机。这个虚拟机完全运行在内存中，下载大小只有24MB，启动只需要5秒钟。

![OS X中运行Docker](/img/virtual/docker/mac_docker_host.svg)

这个运行在OS X中的Docker主机地址就是Linux虚拟机的地址。当使用`docker-machine`启动虚拟机，这个虚拟机被分配一个IP地址。当这个虚拟机中运行的容器启动时，这个容器的端口被影射到虚拟机的对外端口。这样，用户就能够通过访问虚拟机的对外端口访问到容器中的服务。

# 安装

如果已经运行了VirtualBox，必须在运行Docker Toolbox安装前关闭这个Virtualbox

* 从[Docker Toolbox](https://www.docker.com/products/docker-toolbox)网站下载安装包
* 启动Docker Toolbox安装

![Docker Toolbox安装](/img/virtual/docker/docker_toolbox_install_1.png)

* 安装最后步骤是`Quick Start`步骤，可以选择启动Docker的方式。这里选择`Kitmatic`图形管理器

![Docker Toolbox安装](/img/virtual/docker/docker_toolbox_install_2.png)

> [Kitematic](https://docs.docker.com/kitematic/userguide/)是运行在Mac和Windows平台的Docker GUI，提供了方便管理和使用Docker的操作界面。

点击选择`Kitematic`则开始下载和初始化最小化的`docker-machine`虚拟机

![Docker Toolbox安装](/img/virtual/docker/docker_toolbox_install_3.png)

* 选择登录，登录到Docker公共的软件仓库（或在线注册），登录以后就可以看到`Kitematic`提供了很多流行的docker容器，直接可以安装，方便进行开发环境部署

![Docker Toolbox安装](/img/virtual/docker/browse-images.png)

> 这里点击`hello-world-nginx`安装一个案例容器

# 快速起步

* 点击新创建的`hello-world-nginx`容器的卷

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx.png)

可以看到这个卷就是本地目录`~/Documents/Kitematic/hello-world-nginx/website_files`目录。所有在这个目录下添加的文件，都可以通过这个容器中运行的nginx访问。

* 查看容器端口映射

点击`hello-world-nginx`容器的`Settings`

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx_setting.png)

然后点击`Ports`就可以看到Docker Toolbox已经映射好访问容器中nginx服务的IP地址和端口`192.168.99.100:32769`

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx_setting_port.png)

此时打开浏览器，访问 http://192.168.99.100:32769 就可以看到初始页面

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx_view.png)

# 背后的VirtualBox

如上所述，Docker容器是运行在VirtualBox虚拟机中的，我们可以打开VirtualBox管理器来看看这个虚拟机的运行。

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx_virtualbox.png)

可以看到这是一个名为`default`的Linux虚拟机。双击这个`default`虚拟机，可以看到这个虚拟机的控制台界面，就可以如同普通的VirtualBox虚拟于行的Linux一样进行操作。

![Docker Toolbox安装](/img/virtual/docker/hello-world-nginx_linux.png)

# 在shell中操作

## 准备docker容器操作

```bash
docker-machine ls
```

显示

```bash
NAME      ACTIVE   DRIVER       STATE     URL   SWARM   DOCKER    ERRORS
default   -        virtualbox   Stopped                 Unknown
```

> 这个容器我前面通过`Kitmatic`关闭了，现在使用命令行来启动它

```bash
docker-machine start default
```

> 这个命令将启动VirtualBox虚拟机，并准备好Docker环境

显示

```bash
Starting "default"...
(default) Resuming VM ...
(default) Waiting for an IP...
Machine "default" was started.
Waiting for SSH to be available...
Detecting the provisioner...
Started machines may have new IP addresses. You may need to re-run the `docker-machine env` command.
```

按照提示，我们现在检查一下环境

```bash
docker-machine env
```

显示

```bash
export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://192.168.99.100:2376"
export DOCKER_CERT_PATH="/Users/huatai/.docker/machine/machines/default"
export DOCKER_MACHINE_NAME="default"
# Run this command to configure your shell:
# eval $(docker-machine env)
```

好了，我们现在执行命令来配置当前shell环境

```bash
eval $(docker-machine env)
```

此时，当前shell就已经连接到VirtualBox中的Docker环境，现在再执行`docker`命令就是直接操作VirtualBox中的docker服务了。后面的操作和在Linux上运行`docker`是一样的体验。

例如，我们现在在`shell`中可以执行`docker`命令，来控制容器了

```bash
docker ps
docker image
```

> 在`Kitematic`的图形管理界面中，点击左下角的`DOCKER CLI`按钮，也可以同样启动一个终端shell，并且这个shell会自动执行上述命令准备好环境，可以直接使用，更为方便。

## docker容器操作

* 查看当前已经下载的镜像，这些镜像就是我们可以快速创建容器的基础

```bash
docker images
```

显示输出

```bash
REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
kitematic/hello-world-nginx   latest              03b4557ad7b9        8 months ago        7.913 MB
```

* 检查容器

  * 首先检查是否有docker容器在运行

```bash
docker ps
```

显示输出

```bash
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
```

表明当前还没有在运行的容器。

  * 检查已经部署的容器
  
```bash
docker ps -a
```

显示输出

```bash
CONTAINER ID        IMAGE                                COMMAND             CREATED             STATUS                     PORTS               NAMES
ebd7e112e317        kitematic/hello-world-nginx:latest   "sh /start.sh"      6 hours ago         Exited (137) 6 hours ago                       hello-world-nginx
```

这个容器就是我们前面使用`Kitematic`安装的第一个测试容器，现在我们用命令行来启动这个容器

  * 启动容器`hello-world-nginx`
  
```bash
docker start hello-world-nginx
```

  * 检查容器`hello-world-nginx`
  
```bash
docker ps
```

可以看到

```bash
CONTAINER ID        IMAGE                                COMMAND             CREATED             STATUS              PORTS                   NAMES
ebd7e112e317        kitematic/hello-world-nginx:latest   "sh /start.sh"      6 hours ago         Up 4 seconds        0.0.0.0:32768->80/tcp   hello-world-nginx
```

注意，其中有一个`PORTS`字段，显示了端口映射

```bash
0.0.0.0:32768->80/tcp
```

现在我们又可以通过 http://192.168.99.100:32768 访问这个服务了。

> 注意：这个`192.168.99.100`IP地址是VirtualBox运行的虚拟机的HOST类型网络，也就是只在本地主机可以访问的地址，并不是对外服务的IP地址。这种环境适合做本地开发测试。

# 使用`Kitematic`创建和运行新容器

图形界面，操作非常直观，点击`+ NEW`按钮，然后在搜索页面搜索需要的镜像就可以创建了，例如，我们要创建`redis`容器，直接搜索到`redis`（推荐）映像，点击`CREATE`按钮就可以创建了。

![Docker Toolbox安装](/img/virtual/docker/kitematic_create_docker_container.png)

# Docker在Mac OS X的案例

到这里，应该有了一个运行着虚拟机并且可以通过shell链接。使用以下命令验证

```bash
docker-machine ls
```

显示

```bash
NAME      ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
default   *        virtualbox   Running   tcp://192.168.99.100:2376           v1.10.1
```
访问容器端口

* 在`DOCKER_HOST`上启动一个NGINX容器

```bash
docker run -d -P --name web nginx
```

通常情况下`docker run`命令会启动一个容器，运行它，然后退出。这里`-d`参数使得容器在`docker run`命令完成后始终运行在后台。`-P`参数将容器的端口暴露给本地主机；这样就可以从Mac上访问容器。

* 显示容器

```bash
docker ps
```

```bash

```

# 命令行从头开始创建和运行新容器

创建[CentOS容器](docker_run_centos.md)涉及到通过docker file来定制systemd服务，步骤略微复杂。

# 参考

* [Installation on Mac OS X](https://docs.docker.com/engine/installation/mac/)
