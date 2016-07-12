# Devstack

Devstack是一套给开发人员快速部署OpenStack开发环境的脚本，不适用于生产环境。Devstack将自动下载源代码，自动执行所有服务的安装脚本，自动生成正确的配置文件，自动安装依赖的软件包。

[DevStack文档](http://docs.openstack.org/developer/devstack/)推荐初学者使用[All-in-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)来快速部署一个开发环境。

* 虚拟机

可以使用任何支持Linux发行版本的虚拟机，建议使用4G内存可以获得最好的执行效率。OpenStack官方文档推荐[All-In-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)方式运行DevStack，可以在各种虚拟机环境中部署DevStack。


* 下载DevStack

```bash
git clone https://git.openstack.org/openstack-dev/devstack
```

* [最小化配置](http://docs.openstack.org/developer/devstack/configuration.html#minimal-configuration)

* 添加stack用户

```bash
devstack/tools/create-stack-user.sh; su stack
```

* 启动安装

```bash
cd devstack; ./stack.sh
```

自动完成软件包安装和配置，可能需要多次安装（网络是关键）。安装完成后，源代码位于`/opt/stack`中，可以进行相关分析和开发。

#  参考

* [DevStack文档](http://docs.openstack.org/developer/devstack/)