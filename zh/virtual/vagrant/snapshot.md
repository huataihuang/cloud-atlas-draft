> 使用Vagrant的快照功能可以很方便快速的创建当前虚拟机的一个临时备份状态，在进行重要操作时可以先创建一个快照以便在操作失误后快速恢复。

安装Vagrant快照插件：

```bash
vagrant plugin install vagrant-vbox-snapshot
```

> 我是切换到root用户身份下执行上述安装命令，后来发现不应该这样操作，而是应该使用自己的普通用户账号来执行上述插件安装。

支持的参数如下

```bash
vagrant snapshot take [vm-name] <SNAPSHOT_NAME>   # take snapshot, labeled by NAME
vagrant snapshot list [vm-name]                   # list snapshots
vagrant snapshot back [vm-name]                   # restore last taken snapshot
vagrant snapshot delete [vm-name] <SNAPSHOT_NAME> # delete specified snapshot
vagrant snapshot go [vm-name] <SNAPSHOT_NAME>     # restore specified snapshot
```

使用方法：

创建一个快照

```bash
vagrant snapshot take centos-7.1 centos-7.1_base
```

奇怪，`vagrant`程序没有识别出`snapshot`命令，依然提示help信息列表

参考 [Vagrant Docs Plugins installation](https://docs.vagrantup.com/v2/plugins/usage.html) ，插件安装后是自动由Vagrant加载的。但是，我使用 `vagrant plugin list` 命令显示，确实没有查看到刚安装的 `vagrant-vbox-snapshot`，只输出显示

```bash
vagrant-share (1.1.4, system)
```

查看了[官方plugin installation文档](https://docs.vagrantup.com/v2/plugins/usage.html)，文档中的`vagrant plugin install vagrant-example-plugin`显示的终端提示符是普通用户，所以切换到自己的账号，重新以普通用户身份安装插件。安装完成后，再次使用 `vagrant pluginin list` 则可以看到`vagrant-vbox-snapshot`插件了

```bash
vagrant-share (1.1.4, system)
vagrant-vbox-snapshot (0.0.10)
```

再次执行

```bash
vagrant snapshot take centos-7.1 centos-7.1_base
```

> 当前目录是Vagrant配置文件所在目录 `centos-7.1` ，我以为虚拟机的名字是 `centos-7.1` （不过看VirtualBox的图形管理界面中显示的是 `Vagrant_default_1448250085458_10997`），但是实际上述命令执行会提示错误

```bash
The machine with the name 'centos-7.1' was not found configured for this Vagrant environment.
```

那到底是什么名字呢？

使用 `vagrant status` 可以检查当前虚拟机状态（和名字）

```bash
Current machine states:

default                   poweroff (virtualbox)

The VM is powered off. To restart the VM, simply run `vagrant up`
```

好吧，既然名字是 `default` 就用下面的命令来执行快照

```bash
vagrant snapshot take default centos-7.1_base
```

出乎意料，快照的获取是瞬间完成了

```bash
Taking snapshot centos-7.1_base
0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%
Snapshot taken. UUID: af5b803c-266e-41af-875b-9f7a2bc36794
```

查看快照列表

```bash
vagrant snapshot list
```

显示输出

```bash
Listing snapshots for 'default':
   Name: centos-7.1_base (UUID: af5b803c-266e-41af-875b-9f7a2bc36794) *
```

从指定快照中恢复

```bash
vagrant snapshot go "Name"
```

删除一个快照

```bash
vagrant snapshot delete "Name"
```

# 参考

* [Vagrant建立快照备份](http://segmentfault.com/a/1190000003033407)
* [vagrant-vbox-snapshot github项目](https://github.com/dergachev/vagrant-vbox-snapshot)