# 安装Docker (Ubuntu发行版`docker.iso`)

Ubuntu默认发行版本`docker.io`是可以兼容在Ubuntu主推的LXD系统中，但是版本会较Docker官方低一些。安装非常简便：

```
sudo apt install docker.io
```

安装完成后就可以直接查看

```
docker ps
```

# 安装Docker CE

[Docker官方提供了Docker CE for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)，需要删除掉Ubuntu系统自带`docker.io`软件之后才可以安装：

```
sudo apt-get remove docker docker-engine docker.io
```

> Docker CE on Ubuntu支持`overlay2`和`aufs`存储驱动

* 设置软件仓库

```bash
sudo apt-get update

# 设置apt使用HTTPS访问软件仓库
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```

* 添加Docker官方GPG key

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

* 设置Docker官方的**stable**仓库：

```
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```

> Docker官方也提供`armhf`版本

* 安装Docker CE

```
sudo apt-get update
sudo apt-get install docker-ce
```

> 也可以安装指定版本的`docker-ce`

```
sudo apt-get install docker-ce=<VERSION>
```

* 验证Docker CE

```
sudo docker run hello-world
```

# 参考

* [Get Docker CE for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/sudo apt-get remove docker docker-engine docker.io)
* [How To Install Docker on Ubuntu 16.04](https://medium.com/@Grigorkh/how-to-install-docker-on-ubuntu-16-04-3f509070d29c)
* [Docker Engine on Ubuntu](https://www.ubuntu.com/containers/docker-ubuntu) - Ubuntu主推LXC容器(LXD)，不过也同时支持Docker Engine