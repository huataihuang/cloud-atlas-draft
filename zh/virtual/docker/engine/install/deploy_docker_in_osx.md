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