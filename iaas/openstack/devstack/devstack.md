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

devstack将安装 keystone, glance, nova, cinder, neutron, 和 horizon。对于使用，可以切换到 `stack` 用户身份以后，进入 `devstack` 目录，然后执行 `source openrc` 设置好操作环境，就可以使用 `openstack` 命令管理 devstaack。

完成后可以访问 http://<SERVER_IP>

# IPv4

对于配置了IPv6的主机，DevStack会直接启动服务监听在IPv6的地址上，反而不监听IPv4。

采用[关闭CentOS 7 IPv6](../../os/linux/redhat/system_administration/network/centos7_disable_ipv6)

# 重启

> 参考 [Cannot restart services on Devstack](https://ask.openstack.org/en/question/1916/cannot-restart-services-on-devstack/)

Devstack不是通过服务方式运行的，而是通过`screen`程序。在成功运行了`stack.sh`之后，如果需要重启任何openstack服务，使用`screen -r`来连接screen。例如，要重启nova网络，则连接screen 9来访问nova网络的screen（使用命令`CTRL+A`和`9`）。要停止nova网络，使用｀CTRL+C`然后再使用向上键再回车。

如果重启了主机，则还是需要再运行一次`stack.sh`脚本。

# devstack环境要求

最初我安装devstack是在kvm虚拟机中，分配了1c1g配置（即1个vcpu 1GB内存的kvm虚拟机），安装过程没有太大资源问题。但是实际运行devstack时候，发现`neutron`虚拟网络非常消耗CPU资源（有3个进程`neutron`服务进程始终在运行），并且使用了近1GB的swap空间。所以准备调整虚拟机的内存河CPU资源：

通过[动态调整KVM Guest内存和CPU资源](add_remove_vcpu_memory_to_guest_on_fly)

如果由于意外中断devstack运行（如强制关机），则需要先运行 `./unstack.sh` 清理环境，然后重启运行 `./stack.sh` 脚本重建会话。

# 访问

> 我的`devstack`测试环境是安装在[CentOS平台的KVM虚拟机](../../../virtual/kvm/startup/in_action/deploy_kvm_on_centos)，采用的[NAT端口映射方式](../../../virtual/kvm/startup/in_action/kvm_libvirt_static_ip_for_dhcp_and_port_forwarding)，所以访问是 https://devstack:11443 。如果你采用的bridge模式虚拟机或者直接安装在物理主机上，则不需要添加端口`11433`

在本地桌面主机`/etc/hosts`添加访问`devstack`测试环境的域名解析绑定

```
192.168.1.11  devstack
```

然后通过 https://devstack

#  参考

* [DevStack文档](http://docs.openstack.org/developer/devstack/)