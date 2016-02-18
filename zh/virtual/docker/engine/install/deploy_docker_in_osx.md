> 作为开发运维人员，很多人喜欢[使用Mac OS X作为自己的工作平台](../../../../develop/mac/README.md)，我也不例外 ^_^

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

# 参考

* [Installation on Mac OS X](https://docs.docker.com/engine/installation/mac/)
