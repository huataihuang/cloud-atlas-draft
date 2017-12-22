# 一些困惑

自从升级到Fedora 27之后，突然发现`dnf upgrade`提示使用`docker-common`替换`docker`。

但是升级替换之后，却不能执行`docker`指令，显示缺少`/usr/bin/docker-latest`。从软件仓库来看，确实有一个`docker-latest`软件包，所以就先尝试安装

```
dnf install docker-latest
```

不过，安装以后，虽然可以使用`docker ps`指令，但是显示尚未启动服务。只时，此时并没有`systemctl`可以管控的docker服务。

> 从Docker官方网站来看，当前Docker已经将软件分裂成社区版本和企业版本，并且在Fedora平台不再提供企业版本，只能安装部署社区版本。由于Fedora 27刚刚发布，当前Docker并没有释出针对Fedora 27的社区版本，导致现在存在的困境。

参考 [Please provide repo for docker-ce on Fedora 27 #164](https://github.com/docker/for-linux/issues/164) 当前可以暂时使用 Fedora 26版本的 docker-ce 运行于 Fedora 27，即下载 https://download.docker.com/linux/fedora/docker-ce.repo ，然后通过以下命令替换`$release`变量

```bash
sed -i 's/\$releasever/26/g' /etc/yum.repos.d/docker-ce.repo
```

等以后提供了Fedora 27版本之后，在使用以下命令恢复

```bash
sed -i 's/26/\$releasever/g' /etc/yum.repos.d/docker-ce.repo
```

# 安装docker-ce

* 首先清理Fedora发行版提供的Docker

```
dnf remove docker \
      docker-common \
      container-selinux \
      docker-selinux \
      docker-engine
```


* 添加Docker CE软件参股

```
dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo
```

> 注意：当前参考前述先替换`$release`成固定数值`26`

```
sed -i 's/\$releasever/26/g' /etc/yum.repos.d/docker-ce.repo
```

* 安装Docker CE

```
dnf install docker-ce
```

* 如果需要体验最新的实验特性，可以编辑`/etc/docker/daemon.json`设置如下

```
{
    "experimental": true
}
```

* 启动Docker服务

```
systemctl start docker
```

* 检查实验模式是否激活

```
docker version -f '{{.Server.Experimental}}'
```

# `Error response from daemon: Unknown runtime specified oci`(实际解决是重新安装Fedora 27发行版提供的Docker)

以往使用docker部属的的容器，在安装了`docker-ce`之后，启动出现错误提示

```
$ docker start dev5
Error response from daemon: Unknown runtime specified oci
Error: failed to start containers: dev5
```

> OCI即Open Container Initiative，请参考 [	
Demystifying the Open Container Initiative (OCI) Specifications](https://blog.docker.com/2017/07/demystifying-open-container-initiative-oci-specifications/)

这个问题在[Fix docker `Unknown runtime specified oci` error](http://www.voidcn.com/article/p-mgkvxkby-vt.html) 提供了一个解决方法

* 找到存在问题容器的ID

```
docker ps -a
```

实际上可以通过`docker inspect dev5`来找到这个`dev5`容器的详细配置信息，其中有一条就是：

```
"Id": "12be884e554aea2a055687567aa4800522d8b62028854e3166d9544a3a5c5d22"
```

* 进入目录`/var/lib/docker/containers/<ID>`

```
cd /var/lib/docker/containers/12be884e554aea2a055687567aa4800522d8b62028854e3166d9544a3a5c5d22
```

* 检查`hostconfig.json`，删除掉`Runtime`属性的`oci`值
* 重启docker

```
sudo systemctl restart docker
```

> 不过，实际上上述解决方法只是绕开功能问题，参考[dockerd(stable version)参数](https://docs.docker.com/engine/reference/commandline/dockerd/)显示默认容器的运行参数是`runc`，需要修改`-default-runtime string                Default OCI runtime for containers (default "runc")`


通过`ps aux | grep docker`检查发现，除了`/usr/bin/dockerd`进程外，还有一个`docker-containerd --config /var/run/docker/containerd/containerd.toml`进程。

检查`/var/run/docker/containerd/containerd.toml`配置文件可以看到

```
[plugins]
  [plugins.linux]
    shim = "docker-containerd-shim"
    runtime = "docker-runc"
    runtime_root = "/var/lib/docker/runc"
    no_shim = false
    shim_debug = false
    shim_no_newns = false
```

有关`runtime`默认使用了`docker-runc`插件

# `Error response from daemon: secret store is not initialized`

解决了上述`Unknown runtime specified oci`，再次启动`dev5`容器，又遇到新的报错

```
$ docker start dev5
Error response from daemon: secret store is not initialized
Error: failed to start containers: dev5
```

经过google，在[dockered](https://docs.docker.com/edge/engine/reference/commandline/dockerd/)中找到了提示：

> Edge only: This is the dockerd configuration reference for Docker CE Edge versions. Some of these options may not be available to Docker CE stable or Docker EE. You can view the stable version of this dockerd configuration reference or learn about Docker CE Edge.

也就是说，默认的stable版本docker ce不能够支持一些特性，需要使用edge版本。

所以修改`/etc/yum.repos.d/docker-ce.repo`，关闭`stable`版本仓库，启用`edge`版本仓库，重新安装`docker-ce`

# 最终解决方法

> 解决不了兼容以往docker容器的方法，所以还是卸载了`docker-ce`，重新安装Fedora 27提供的docker版本

```
rpm -e docker-ce
dnf install docker docker-common container-selinux
```

这个发行版安装的`docker`则可以通过如下命令启动

```
systemctl start docker
```

# 参考

* [Please provide repo for docker-ce on Fedora 27 #164](https://github.com/docker/for-linux/issues/164)
* [#Docker: Install the new Docker CE in experimental mode on Fedora Linux](https://blog.voina.org/docker-install-the-new-docker-ce-in-experimental-mode-on-fedora-linux/)