# 说明

Vagrant非常适合支持桌面级虚拟化VirtualBox，不过在生产环境中，通常会部署KVM或Xen环境。Vagrant通过libvirt支持不同的虚拟化环境，同样也包括了KVM／Qemu。Vagrant提供了易于部署和管理的包装，以便快速部署和方便管理VM。

> 本文是为了准备Ceph分布式存储系统实验环境，参考「Ceph Cookbook」部署的3节点Vagrant环境，采用KVM作为虚拟化平台。

> CentOS操作系统中安装KVM环境请参考 [在CentOS 7中部署KVM](../kvm/deployment_and_administration/deploy_kvm_on_centos)

> `vagrant-libvirt`插件

# 安装

* 安装vagrant

直接访问[Vargant官方下载](https://www.vagrantup.com/downloads.html)安装Vargant

```
wget https://releases.hashicorp.com/vagrant/1.8.7/vagrant_1.8.7_x86_64.rpm
sudo rpm -ivh vagrant_1.8.7_x86_64.rpm
```

如果是ubuntu，同样也需要从官网下载安装deb包安装（发行版包过于陈旧）

## 安装Vagrant Plugins

* `vagrant-libvirt`插件用于支持libvirt

```
vagrant plugin install vagrant-libvirt
```

> 需要安装好`libvirt-devel`才能安装`vagrant-libvirt`插件，否则提示以下错误

```
extconf.rb:73:in `<main>': libvirt library not found in default locations (RuntimeError)
```

* `vagrant-mutate`插件用于将官方的Vagrant guest box转换成KVM格式

```
vagrant plugin install vagrant-mutate
```

> 在[Vagrant官方镜像](https://atlas.hashicorp.com/boxes/search)中，也有部分发行版直接提供了`libvirt`版本

* `vagrant-rekey-ssh` - 由于官方的Vagrant boxes使用了内建的非安全的SSH key，所以我们可以使用`vagrant-rekey-ssh`插件来重新生成新的SSH key

```
vagrant plugin install vagrant-rekey-ssh
```

# 下载和安装虚拟机镜像

[Vagrant官方镜像](https://atlas.hashicorp.com/boxes/search) 提供了常用的主流发行版

## 使用vagrant-libvirt安装CentOS 7 box

* 初始化centos 7 box（CentOS提供了支持 vmware_fusion, vmware_desktop , virtualbox, libvirt 4种版本的镜像 [boxes  centos/7  box versions](https://atlas.hashicorp.com/centos/boxes/7)）

```
vagrant init centos/7
```

* Vagrant会尝试使用一个名为`default`的存储池，如果这个`default`存储池不存在就会尝试在`/var/lib/libvirt/images`上创建这个`defualt`存储池。CentOS7默认安装libvirt环境，已经在`/var/lib/libvirt/images`目录上创建了名为`images`的存储池，所以需要修改`Vagrantfile`配置文件中定义`provider`。

```
Vagrant.configure("2") do |config|
  ...
  config.vm.provider :libvirt do |libvirt|
    libvirt.storage_pool_name = "images"
  end
  ...
end
```

* 为告知Vagrant主机使用的provider是`vagrant-libvirt`而不是默认的`virtualbox`，设置环境变量（这样`vagrant up`命令就不需要加上`--provider libvirt`参数）

```
export VAGRANT_DEFAULT_PROVIDER=libvirt
```

* 启动安装

```
vagrant up
```

----

## 使用vagrant-libvirt安装CentOS 7 box的排查过程（供参考）

* CentOS提供了支持 vmware_fusion, vmware_desktop , virtualbox, libvirt 4种版本的镜像 [boxes  centos/7  box versions](https://atlas.hashicorp.com/centos/boxes/7)

以下为下载安装CentOS 7

```
vagrant init centos/7; vagrant up --provider libvirt
```

> 参考 [vagrant-libvirt/vagrant-libvirt](https://github.com/vagrant-libvirt/vagrant-libvirt) 可以通过以下设置环境变量方法使得Vagrant将默认的VirtulBox更改为Libvirt（这样就不必每次都使用`--provider=libvirt`参数了）

```
export VAGRANT_DEFAULT_PROVIDER=libvirt
```

在CentOS 7上使用vagrant会提示一个报错

```
There was error while creating libvirt storage pool: Call to virStoragePoolDefineXML failed: operation failed: Storage source conflict with pool: 'images'
```

参考 [ERROR: Call to virStoragePoolDefineXML failed: operation failed: pool 'default' already exists](https://github.com/vagrant-libvirt/vagrant-libvirt/issues/536)和 [vagrant up - always returns virStoragePoolCreateXML failed: storage conflict](https://github.com/vagrant-libvirt/vagrant-libvirt/issues/184) :

> Vagrant会尝试使用一个名为`default`的存储池，如果这个`default`存储池不存在就会尝试在`/var/lib/libvirt/images`上创建这个`defualt`存储池。

> [CentOS 7部署kvm](deploy_kvm_on_centos)使用SELinux增强模式，不能使用非默认的目录来创建VM镜像。

使用 `virsh pool-list --all` 可以看到当前系统的存储池

```
 Name                 State      Autostart
-------------------------------------------
 huatai               active     yes
 images               active     yes
 root                 active     yes
```

[error when default storage pool is missing](https://github.com/simon3z/virt-deploy/issues/8)提供了一个解决的方法

* 首先检查`virsh pool-list` 确保已经定义了

```
 Name                 State      Autostart 
-------------------------------------------
 default              active     yes 
```

可以尝试定义一个名为`default`的存储池并启动这个`default`存储池

```
virsh pool-define /dev/stdin <<EOF
<pool type='dir'>
  <name>default</name>
  <target>
    <path>/var/lib/libvirt/images</path>
  </target>
</pool>
EOF

virsh pool-start default
virsh pool-autostart default
```

这里我发现确实不能重复定义，在执行第一个`virsh pool-define /dev/stdin <<EOF`就提示相同错误（表明Vagrant确实在启动时如果找不到名为`default`存储池就会尝试在`/var/lib/libvirt/images`目录创建该存储池）

```
error: Failed to define pool from /dev/stdin
error: operation failed: Storage source conflict with pool: 'images'
```

通过 `virsh help | grep pool` 可以看到`virsh`提供了`pool-dumpxml`可以用来检查各个存储池的定义。我发现原来系统为每个用户（这里是`root`用户和`huatai`用户）各自定义了一个存储池位于其`HOME`目录。例如`huatai`用户定义的存储池 `virsh pool-dumpxml huatai` 显示如下

```
<pool type='dir'>
  <name>huatai</name>
  <uuid>d367d5bd-9a5c-42ad-b376-78f034eae621</uuid>
  <capacity unit='bytes'>52710469632</capacity>
  <allocation unit='bytes'>18440990720</allocation>
  <available unit='bytes'>34269478912</available>
  <source>
  </source>
  <target>
    <path>/home/huatai</path>
    <permissions>
      <mode>0700</mode>
      <owner>501</owner>
      <group>20</group>
    </permissions>
  </target>
</pool>
```

在 [error when default storage pool is missing](https://github.com/simon3z/virt-deploy/issues/8) rrasouli 提供了一个解决方法，就是删除掉`images`存储池，然后重新执行Vagrant部署，此时Vagrant就会去创建这个`default`存储池并且位于`/var/lib/libvirt/images`目录。

```
virsh pool-destroy images
virsh pool-undefine images
```

> 我检查了先前已经在运行的2个vm，发现原先创建的vm的`dumpxml`显示是直接使用`<source file='/var/lib/libvirt/images/centos7.img'/>`，所以理论上删除掉`images`这个存储池定义应该没有问题。但是，有没有方法直接定义Vagrant的存储池使用`images`而不是使用`default`呢？

仔细看了[vagrant-libvirt/vagrant-libvirt](https://github.com/vagrant-libvirt/vagrant-libvirt)开源项目的文档说明（其实很多时候开源项目的文档仔细阅读能够解决绝大多数问题，而是自己猜测或者直接论坛提问），在`Libvirt`配置中，有关`Porvider Options`中可以设置多个连接选项，其中有一个连接无关的选项是`storage_pool_name`定义了Libvirt存储池名字，也就是box image和instance snapshoot存储位置，参考说明文档案例并结合当前`Vagrantfile`中有关`provider`配置注释，在这个`Vagrantfile`中添加配置

```
Vagrant.configure("2") do |config|
  ...
  config.vm.provider :libvirt do |libvirt|
    libvirt.storage_pool_name = "images"
  end
  ...
end
```

然后再次执行命令 `vagrant up --provider libvirt` 就可以完成基于[vagrant-libvirt](https://github.com/vagrant-libvirt/vagrant-libvirt)的[CentOS 7 box](https://atlas.hashicorp.com/centos/boxes/7)安装。

# Vagrant网络

前面解决了Vagrant的存储问题，但是Vagrant的虚拟机启动后会遇到网络连接问题

* 首先遇到`vagrant up`启动设置防火墙报错

```
Error while activating network: Call to virNetworkCreate failed: internal error: Failed to apply firewall rules /usr/sbin/ip6tables --table filter --insert FORWARD --in-interface virbr1 --jump REJECT: ip6tables v1.4.21: can't initialize ip6tables table `filter': Address family not supported by protocol
Perhaps ip6tables or your kernel needs to be upgraded.
```

参考 [libvirt via virt-manager virtual network start failed](https://bbs.archlinux.org/viewtopic.php?id=198744) 和 [libvirt: “Failed to initialize a valid firewall backend”](http://superuser.com/questions/1063240/libvirt-failed-to-initialize-a-valid-firewall-backend) ，需要执行以下两个动作：

* 安装并启动 `firewalld` （实际系统已经安装但是没有启动，需要通过`systemctl status firewalld`确认）

```
yum install firewalld
systemctl start firewalld
```

* 重启一次 `libvirtd` （重启以后才能识别firewalld）

```
systemctl restart libvirtd
```

> 此时再起启动 `vagrant up` 则可以看到启动后进入网络连接

```
#vagrant up
Bringing machine 'default' up with 'libvirt' provider...
==> default: Starting domain.
==> default: Waiting for domain to get an IP address...
```

但是最后无法获得IP地址退出，显示如下

```
==> default: Removing domain...
/root/.vagrant.d/gems/gems/fog-core-1.43.0/lib/fog/core/wait_for.rb:9:in `block in wait_for': The specified wait_for timeout (2 seconds) was exceeded (Fog::Errors::TimeoutError)
```

在这个过程中(即显示`default: Waiting for domain to get an IP address...`时)，使用 `virsh list` 可以看到服务器上有运行 `centos7_default` 虚拟机

```
#virsh list
 Id    Name                           State
----------------------------------------------------
 ...
 5     centos7_default                running
```

此时使用 `virsh console centos7_default` 连接这个Vagrant启动的虚拟机，可以通过默认密码登陆，但是我发现这个虚拟机内部没有虚拟网卡，只有 `lo` 回环接口

```
[root@localhost ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
[root@localhost ~]# ip link
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00       
```

 此外，在物理服务器上查看，可以看到显示Vagrant启动的虚拟机连接到了 `virbr1` 这个虚拟网桥接口`virbr1-nic`接口（另外两个网桥接口 `docker0` 是 docker 服务使用，`virbr0` 是现前设置kvm使用），看来还需要排查Vagrant网络

 ```
#brctl show
bridge name	bridge id		STP enabled	interfaces
docker0		8000.0242019a7083	no
virbr0		8000.525400fa6cfe	yes		virbr0-nic
							vnet0
							vnet1
virbr1		8000.52540045088a	yes		virbr1-nic
```

# 参考

* [Vagrant and libVirt(KVM/Qemu) - Setting up boxes the easy way](http://www.lucainvernizzi.net/blog/2014/12/03/vagrant-and-libvirt-kvm-qemu-setting-up-boxes-the-easy-way/)
* [how to create custom vagrant box from libvirt/kvm instance?](http://unix.stackexchange.com/questions/222427/how-to-create-custom-vagrant-box-from-libvirt-kvm-instance)