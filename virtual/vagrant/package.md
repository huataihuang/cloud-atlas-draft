`vagrant package`是一个当前运行的VirtualBox环境打包成一个可重用的[box](http://docs.vagrantup.com/v2/boxes.html)方法。注意，`vagrant package`不能用于其它[provider](http://docs.vagrantup.com/v2/providers/)，只支持VirtalBox。其它provider需要手工完成打包。

> package         packages a running vagrant environment into a box
>
> 可以对运行状态的虚拟机环境打包

# 简单的打包方法

进入Vagrant的项目目录，执行简单的命令

```bash
vagrant package
```

就可以看到如下输出显示打包过程

```bash
==> default: Clearing any previously set forwarded ports...
==> default: Exporting VM...
==> default: Compressing package to: /Users/huatai/Documents/Vagrant/centos-6.7/package.box
```

# 参数使用

* `--base NAME` - 替代打包一个VirtualBox主机，这个参数打包一个VirtualBox manages的VirtualBox。这里`NAME`是VirtualBox GUI中显示的虚拟机的UUID或者名字。

* `--output NAME` - 这个参数设置打包的名字，如果没有这个参数，则默认保存为 `package.box`

* `--include x,y,z` - 附加一些文件到box中，这是让打包Vagrantfile执行附加任务
 
* `--vagrantfile FILE` - 打包一个Vagrantfile到box中，这个Vagrantfile将作为box使用的Vagrantfile load

使用案例

```bash
vagrant package --output centos-6.7.box
```

显示输出

```bash
==> default: Exporting VM...
==> default: Compressing package to: /Users/huatai/Documents/Vagrant/centos-6.7/centos-6.7.box
```

> Vagrant还支持快照备份，以便快速创建当前虚拟机的一个临时备份状态，在重要操作时可以先创建一个快照以便在操作失误时快速恢复 - [使用vagrant snapshot创建快照备份](snapshot.md)

# 参考

* [Vagrant Docs - PACKAGE](http://docs.vagrantup.com/v2/cli/package.html)