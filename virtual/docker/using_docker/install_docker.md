Docker需要3.10以上内核运行，即RHEL/CentOS 7以上发行版内核。

> 实际我采用Fedora 26发行版自带的Docker版本，虽然不是最新版本，但是方便维护和升级，并且解决了软件包依赖关系，由社区提供支持。

# 通过脚本安装Docker

可以通过 https://get.docker.com 提供的脚本来自动安装 Docker:

```bash
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh
```

> 执行下载的`get-docker.sh`脚本之前务必检查脚本内容，避免安全问题。

在使用Docker 时，建议以宽容（permissive）模式运行 SELinux，这样 SELinux 将只把错误写进日志，而非强制执行。如果以强制（enforcing）模式运行 SELinux，那么很有可能在执行书中的范例时，会遇到各种莫名其妙的“权限不足”（Permission Denied）错误。

* 查看SELinux模式：

```
sestatus
```

如果输出的`Current mode`状态是`enforcing`则表明SELinux已经生效并强制执行规则。

要将 SELinux 设为宽容模式，只需执行 

```
sudo setenforce 0
```

执行上述命令之后，可以看到`Current mode`状态是`permissive`

> 持久化上述`SELinux`配置，则通过编辑`/etc/sysconfig/selinux`配置

```
#SELINUX=enforcing
SELINUX=permissive
```

# 启动docker

* 启动docker

```
sudo systemctl start docker
```

* 设置docker在操作系统启动时启动

```
sudo systemctl enable docker
```

# 在Mac OS和Windows上安装Docker

> Docker和微软已经于2016年9月宣布Windows Server 2016正式支持Docker - https://blog.docker.com/2016/09/build-your-first-docker-windows-server-container/

在Mac OS和Windows上，如果没有直接支持Docker，则需要通过Docker Toolbox工具 https://www.docker.com/toolbox 来运行一个极小的boot2docker虚拟机。

Toolbox 成功安装后，便可以打开 Docker 的 quickstart 终端使用 Docker。

启动虚拟机之后，可以通过 `docker-machine ssh default`来登陆虚拟机，此时就可以运行docker相关指令了。

> 实际上Docker Toolbox是一个VirtualBox虚拟机，所以能够跨平台运行一个微型Linux系统，然周在这个Linux系统内运行Docker容器。

# 验证Docker版本

```
docker version
```