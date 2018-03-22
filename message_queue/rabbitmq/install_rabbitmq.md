# 安装Erlang

建议使用最新版本的Erlang来支持RabbitMQ运行，以获得所有更新和改进，并且能够使得RabbitMQ性能提升。

RabbitMQ官方文档中[supported version of Erlang/OTP](https://www.rabbitmq.com/which-erlang.html)列出了支持的Erlang版本。建议使用以下打包的版本之一：

* [Erlang Solutions](https://packages.erlang-solutions.com/erlang/)
* [Zero dependency Erlang/OTP RPM for RabbitMQ](https://github.com/rabbitmq/erlang-rpm)
* [Erlang/OTP Docker images](https://hub.docker.com/_/erlang/)
* [kerl](https://github.com/kerl/kerl)

## Debian/Ubuntu平台安装Erlang

> 待实践

## CentOS安装Erlang

> EPEL提供的erlang版本比较陈旧，2018年3月尝试安装发现是 `R16B-03.18.el7` 版本。所以，建议使用[Erlang Solutions](https://packages.erlang-solutions.com/erlang/)安装源安装最新的`20.3-1.el7.centos`版本。
>
> 不过，Erlang Solutions软件仓库安装的Erlang依赖`wxGTK`包是由EPEL提供的（没有包含在CentOS发行版），所以我的实践中是同时安装了EPEL和Erlang Solutions的软件仓库。

* 从[EPEL](https://fedoraproject.org/wiki/EPEL)下载安装EPEL软件仓库

```
wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

rpm -Uvh epel-release-latest-7.noarch.rpm
```

* 从 [Erlang Solutions](https://packages.erlang-solutions.com/erlang/) 下载添加软件仓库

```
wget https://packages.erlang-solutions.com/erlang-solutions-1.0-1.noarch.rpm
rpm -Uvh erlang-solutions-1.0-1.noarch.rpm
```

* 安装软件包

```
sudo yum install erlang
```

> [Erlang Solutions](https://packages.erlang-solutions.com/erlang/) 还提供了一个`esl-erlang`，包含了Erlang/OTP平台和所有它的应用程序。不过，对于运行RabbitMQ，安装`erlang`就可以了。

# 安装RabbitMQ

## CentOS 7部署RabbitMQ

> `rabbitmq-server`已经包含在Fedora Server发行版中，不过，对于CentOS需要通过第三方源。

* 使用PackageCloud Yum软件仓库安装RabbitMQ

安装软件仓库repo

```
curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.rpm.sh | sudo bash
```

安装RabbitMQ

```
sudo yum install rabbitmq-server
```

> PackageCloud也提供了Chef cookbook和Puppet module进行自动安装。

* (可选)直接安装（我采用的是Yum仓库安装方法）

RabbitMQ官方提供了直接安装的`rabbitmq-server`安装包，可以直接安装

```bash
rpm --import https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc
# this example assumes the CentOS 7 version of the package
yum install rabbitmq-server-3.7.4-1.el7.noarch.rpm
```

# 启动

* 在终端直接执行

```
sudo /usr/sbin/rabbitmq-server
```

启动后在另外一个终端中使用`ps aux | grep rabbitmq`可以看到相关进程。此外，可以注意到`rabbitmq-server`是使用`rabbitmq`用户身份运行的。

* 检查服务状态

```
sudo rabbitmqctl status
```

> `beam.smp`非常占用内存，需要根据实际情况进行内存调整