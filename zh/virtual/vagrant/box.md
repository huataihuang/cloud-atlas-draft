Boxes是Vagrant环境的打包格式。一个box可以被任何Vagrant所支持的平台的任何人用于启动一个独立工作的环境。

`vagrant box`工具提供了所有的管理boxes的功能。最简单使用box的方法是使用[publicly available catalog of Vagrant boxes](https://atlas.hashicorp.com/boxes/search)来添加box。

# 探索Boxes

在[public Vagrant box catalog](https://atlas.hashicorp.com/boxes/search)上提供了支持各种虚拟化，如VirtualBox，VMware，AWS等。简单添加到本机的命令如下：

```bash
vagrant box add USER/BOX
```

例如：使用命令 `vagrant box add hashicorp/precise64` ，或者快速部署环境 `vagrant init hashicorp/precise64`。

# 快速复制Vagrant boxes

当需要1:1复制出Vagrant box，简单的方法如下

* 关闭box（如果当前box正在运行的话）

```bash
vagrant halt
```

* 创建一个`package.box`（默认名字），或者类似如下指定创建名

```bash
vagrant package --output centos-6.7.box
```

> 请参考 [使用vagrant package打包VirtualBox环境](box.md)

* 创建新的box文件 － 首先创建一个项目目录，然后在这个目录下初始化一个默认的Vagrantfile

```bash
mkdir devstack && cd devstack
vagrant init
```

* 编辑这个`Vagrantfile`，修改如下行

```bash
config.vm.box = "devstack"
```

* 编辑这个`Vagrantfile`，修改或添加如下行

```bash
config.vm.box_url = "file:///Users/huatai/Documents/Vagrant/centos-7.1/centos-7.1.box"
```

* 编辑这个`Vagrantfile`，修改或添加如下行（如果要指定IP地址，可选）

```bash
config.vm.network :private_network, ip: "192.168.33.101"
```

> 这里的`vagrant init`，命令可以改成`vagrant box add devstack /Users/huatai/Documents/Vagrant/centos-7.1/centos-7.1.box virtualbox`
>
> 这样就不需要再修改`Vagrantfile`（已经自动添加了`config.vm.box = "devstack"` 和 `config.vm.box_url = "file:///Users/huatai/Documents/Vagrant/centos-7.1/centos-7.1.box"` ）
>
> 此时只需要直接运行下一步`vagrant up`就可以了

* 运行Vagrant box

```bash
vagrant up
```

# 删除box

因为环境搞乱或者希望重建box，可以删除再重建。以下举例删除`devstack`（在`devstack`目录下执行命令）

> 注意：删除box并释放磁盘空间，需要使用[DESTROY](https://docs.vagrantup.com/v2/cli/destroy.html)

```bash
cd devstack
vagrant destroy
```

执行上述命令会提示再次确认

```bash
default: Are you sure you want to destroy the 'default' VM? [y/N] y
==> default: Destroying VM and associated drives... 
```

执行后将从VirtualBox中删除掉虚拟机配置以及虚拟机相关的虚拟磁盘，真正释放空间。

然后执行 `vagrant box remove devstack` 将Vagrant对应的`devstack`配置清理掉。

# 参考

* [Vagrant Docs - BOXES](https://docs.vagrantup.com/v2/boxes.html)
* [How to copy Vagrant boxes (or duplicate them)](http://www.dev-metal.com/copy-duplicate-vagrant-box/)