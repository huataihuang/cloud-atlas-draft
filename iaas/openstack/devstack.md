# Devstack

Devstack是一套给开发人员快速部署OpenStack开发环境的脚本，不适用于生产环境。Devstack将自动下载源代码，自动执行所有服务的安装脚本，自动生成正确的配置文件，自动安装依赖的软件包。

[DevStack文档](http://docs.openstack.org/developer/devstack/)推荐初学者使用[All-in-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)来快速部署一个开发环境。

* 虚拟机

可以使用任何支持Linux发行版本的虚拟机，建议使用4G内存可以获得最好的执行效率。OpenStack官方文档推荐[All-In-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)方式运行DevStack，可以在各种虚拟机环境中部署DevStack。

* [最小化配置](http://docs.openstack.org/developer/devstack/configuration.html#minimal-configuration)

> 虚拟机采用CentOS 7初始最小化安装，并按照[CentOS最小化安装后安装的软件包](../../os/linux/redhat/package/yum_after_mini_install)安装必要的开发工具包

* 添加stack用户

Devstack使用非root用户的sudo来工作

```
adduser stack
```

```bash
echo "stack ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
su - stack
```

* 下载DevStack

```bash
git clone https://git.openstack.org/openstack-dev/devstack
cd devstack
```

* 创建`local.conf`

在`devstack`这个git repo目录中，创建`local.conf`设置4个密码

```
[[local|localrc]]
ADMIN_PASSWORD=secret
DATABASE_PASSWORD=$ADMIN_PASSWORD
RABBIT_PASSWORD=$ADMIN_PASSWORD
SERVICE_PASSWORD=$ADMIN_PASSWORD
```

* 启动安装

```bash
./stack.sh
```

自动完成软件包安装和配置，可能需要多次安装（网络是关键）。安装完成后，源代码位于`stack`中，可以进行相关分析和开发。

完成后可以访问 http://<SERVER_IP>

#  参考

* [DevStack文档](http://docs.openstack.org/developer/devstack/)