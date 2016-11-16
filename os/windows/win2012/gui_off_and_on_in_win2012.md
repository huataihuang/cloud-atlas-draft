在安装Windows server 2012的时候，一个安装选项是只安装`Server core`而不安装图形界面程序。这个安装模式适合作为服务器运行，但是没有提供图形界面对常规的使用非常不方便。

Windows Server提供了Server Manager来管理角色（Server Roles）和功能（Features），其中Features中包含了`User Interfaces and Infrastructure`就是对应图形界面。

如果安装时候没有选择GUI，则可以使用命令行来设置

```
SConfig
```

> 这个配置工具提供了激活`远程桌面`，按照文档似乎应该有`Restore Graphical User Interface (GUI)`选项（也可能是先安装再卸载以后才有这个选项），不过我实践时候没有找到。

使用`PowerShell`安装新功能：

在命令行执行`PowerShell`命令，切换到`PowerShell`命令接口后，就可以直接使用很多高级命令，包括安装GUI：

```
Add-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra
```

相当于

```
Install-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra
```

如果要卸载，则使用命令

```
Remove-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra
```

或

```
Uninstall-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra
```

不管是安装还是卸载，执行后都要重启服务器

```
Shutdown –r -t 0
```

# 参考

* [How to Turn the GUI Off and On in Windows Server 2012](http://www.howtogeek.com/111967/how-to-turn-the-gui-off-and-on-in-windows-server-2012/)