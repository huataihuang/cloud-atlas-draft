> 社区提供了CentOS操作系统镜像，可以非常方便部署

```bash
docker create centos:7
```

或者直接使用下载最新镜像(镜像可以用于后续的容器创建)

```bash
docker pull centos
```

> 这里的映像名字可以在`Kitmatic`搜索，或者在[Docker Hub搜索到CentOS 7](https://hub.docker.com/_/centos/)

可以看到完整的创建过程，显示本地没有搜索到这个容器的镜像，会直接从Docker Hub的镜像仓库下载和部署。

上述`docker create`命令将下载一个最新的`centos:7`镜像，并创建一个容器

检查下载的镜像

```bash
docker images
```

```bash
REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
centos                        7                   0b3e82be9251        15 hours ago        196.6 MB
```

检查`docker create`命令创建的容器

```bash
docker ps -a
```

```bash
CONTAINER ID        IMAGE                                COMMAND             CREATED             STATUS              PORTS                   NAMES
ba568351464f        0b3e82be9251                         "/bin/bash"         15 minutes ago      Created                                     amazing_heisenberg
```

在[CentOS image documentation](https://hub.docker.com/_/centos/)介绍了这个映像是社区支持，并且每个月更新或者会紧急安全补丁升级。这个滚动更新的镜像会打上`主版本标记`(`major version`)，所以可以通过`docker pull`指令来更新：

```bash
docker pull centos:6
docker pull centos:7
```

如果要安装次要版本，例如指定的版本`5.11`或`6.5`:

```bash
docker pull centos:5.11
docker pull centos:6.5
```

