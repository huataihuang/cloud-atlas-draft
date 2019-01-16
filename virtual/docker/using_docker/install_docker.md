Docker需要3.10以上内核运行，即RHEL/CentOS 7以上发行版内核。

> 实际我采用Fedora 26发行版自带的Docker版本，虽然不是最新版本，但是方便维护和升级，并且解决了软件包依赖关系，由社区提供支持。

# 设置SELinux

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

# 通过脚本安装Docker

可以通过 https://get.docker.com 提供的脚本来自动安装 Docker:

```bash
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh
```

> 执行下载的`get-docker.sh`脚本之前务必检查脚本内容，避免安全问题。

在使用Docker 时，建议以宽容（permissive）模式运行 SELinux，这样 SELinux 将只把错误写进日志，而非强制执行。如果以强制（enforcing）模式运行 SELinux，会遇到各种莫名其妙的“权限不足”（Permission Denied）错误。


# 通过yum/dnf安装

* 通过发行版安装docker

```
sudo dnf install docker
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

# 无需sudo即可以运行docker的设置

使用`docker`指令连接docker服务默认是通过sock，所以用户需要有对`/var/run/docker.sock`读写的权限。否则会出现如下报错

```
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.26/containers/json: dial unix /var/run/docker.sock: connect: permission denied
```

检查可以看到`/var/run/docker.sock`需要属于`root`组才能读写，所以如果要无需sudo，则需要将用户加入到`root`组即可。注意，这可能存在安全隐患，所以谨慎使用，仅建议个人自己的测试主机上使用，生产环境还是使用sudo较为稳妥。

如果安装版本设置了docker用户组，则可以将用户添加到docker用户组组来避免需要使用sudo命令执行Docker:

```
sudo usermod -aG docker $USER
```

> 可能需要重启主机使上述设置生效

```
$ ls -lh /var/run/docker.sock
srw-rw----. 1 root root 0 Oct 25 21:16 /var/run/docker.sock
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