在Mac上运行VMware虚拟机时候，默认情况下需要启动GUI形式的VMware管理控制台，然后通过交互方式启动虚拟机。并且不能关闭窗口，关闭窗口会suspend住虚拟机。

特别对于运行多个虚拟机的测试环境，我们希望能够想KVM这样的服务器端虚拟化一样，通过命令行在后台运行虚拟机实例，不需要程序窗口。这种模式称为 "headless" 模式。

# headless命令行

* 在Terminal终端，使用以下命令创建一个`vmrun`的程序别名：

```
alias vmrun=/Applications/VMware\ Fusion.app/Contents/Library/vmrun
```

> 不过，我发现实际上也可以不用加入这个alias，因为VMware fusion安装已经在用户的环境变量PATH中添加了上述路径，所以可以直接使用 `vmrun` 命令

* 然后通过以下命令无需GUI就可以启动虚拟机

```
vmrun -T fusion start "/path/to/vm.vmx" nogui
```

> `-T <hostType> (ws|fusion)`
>
> 指令可以是 `start|stop|reset|suspend|pause|unpause`

不过，我启动虚拟机遇到报错：

```
vmrun -T fusion start "/Users/huatai/Virtual\ Machines.localized/centos7_base.vmwarevm/centos7_base.vmx" nogui
```

提示错误

```
Error: Cannot open VM: /Users/huatai/Virtual\ Machines.localized/centos7_base.vmwarevm/centos7_base.vmx, The virtual machine cannot be found
```

但是，实际上这个虚拟机文件是存在的，暂时没有解决这个问题

# 快捷键隐藏VMware窗口

参考 [Is it possible to run VMware Fusion in the background to hide the windows and icons it produces?](https://apple.stackexchange.com/questions/68928/is-it-possible-to-run-vmware-fusion-in-the-background-to-hide-the-windows-and-ic/68941)

在VMware Fusion窗口启动虚拟机之后，同时按下 `Command+Option+Shift+Esc` 可以关闭VMware窗口并且保持虚拟机在后台运行。非常赞的方法！

# 参考

* [How to run “headless” virtual machines in OS X](https://www.macissues.com/2016/01/03/how-to-run-headless-virtual-machines-in-os-x/)