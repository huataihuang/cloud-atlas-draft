# Headless

通常在桌面启动Virtualbox虚拟机，如果关闭窗口，默认是保存虚拟机运行状态，或者就直接管理了虚拟机。为了能够在后台运行（类似服务器），可以使用 headless 模式，这个模式不需要使用桌面图形环境，可以命令行启动虚拟机运行在后台：

```bash
VBoxManage startvm "freebsd11" --type headless
```

# snapshot

虚拟机安装运行后，又做了软件包初始安装，此时如果做测试又怕把环境搞乱。可以采用快照方式保存一个快照，如果测试出现问题，可以回滚到前一个备份快照

# clone

`clone`是完整的复制虚拟机

```bash
VBoxManage clonevm devstack --name centos
```

上述操作步骤将`devstack`虚拟机完整复制成一个`centos`虚拟机，可以在`~/VirtualBox\ VMs`目录下看到`centos`子目录，其中就是clone出来的新虚拟机磁盘，可以随时导入启动

# 虚拟机磁盘resize

VirtualBox支持虚拟机磁盘调整大小：

```
VBoxManage modifyhd --resize [new size in MB] [/path/to/vdi]
```

举例：

```
VBoxManage modifyhd --resize 32000 /Users/huatai/images/win10.vdi
```

> 瞬间完成虚拟磁盘resize。

# 参考

* [VirtualBox: Snapshots and Cloning Virtual Machines](https://ryantrotz.com/2011/12/virtualbox-snapshots-and-vmis/)