# 检查Firewall事件

在Windows平台，有时候会有误设置Firewall情况，导致服务无法正常访问。此时可以通过系统的Event Viewer来检查设置日志：

* 菜单`Start` => `Manager` => `System Tools`，然后点击`Event Viewer`
* 在`Event Viewer`的导航树中，依次展开`Applications and Services` => `Microsoft` => `Windows` => `Windows Firewall and Advanced Security`
* 一共有4个操作事件：
  * `ConnectionSecirity`: 有关配置IPsec规则的事件，例如在IPsec中添加或删除设置，日志就会记录在这里
  * `ConnectionSecurityVerbose`: 有关IPsec引擎操作状态的事件。例如，当一个连接安全规则变成活跃或者加密对（crypto sets）被添加或删除则记录事件。
  * `Firewall`: 有关配置Windows防火墙的事件，例如规则被添加，删除或修改，或者网卡接口更改了profile，就记录事件
  * `FirewallVerbose`: 防火墙操作状态相关的事件，例如，防火墙规则变成active或者profile设置更改，则记录事件。注意：这个日志默认被禁用，要激活这个日志，需要右击`FirewallVerbose`，然后点击`Enable Log`。

**如果不确定防火墙什么时候被激活或者关闭，可以查看`Firewall`操作事件**

# 检查Firewall活动

当网络流量被过滤，所有的防火墙处理记录会记录到日志文件，提供了有关源和目的IP地址，端口号，以及协议记录。这个Windows Firewall log文件可以用来监控TCP/UDP连接以及被防火墙阻断的数据包。

不过，默认情况下，这个`log`文件是禁用的，也就是没有信息记录下来。要创建防火墙过滤日志文件，执行`Win key + R`打开运行框，然后输入 `wf.msc` 命令并回车执行。此时会出现`Windows Firewall and Andance Security`窗口，在窗口的右方，点击`Properties`

![Windows Firewall and Andance Security设置](/img/os/windows/firewall/windows_firewall_with_advanced_security.png)

在对话扩中，点击`Private Profile`，然后选择`Logging`部分的`Customize...`按钮

![Windows Firewall private profile设置](/img/os/windows/firewall/firewall_private_profile.png)

在对话窗口中定制日志文件的大小，位置，以及是否记录抛弃的数据包，成功连接的记录。被抛弃的数据包就是防火墙阻断的数据包，而成功连接是外部成功连接到你服务器端口的记录，并不是指入侵者。

![Windows Firewall Logging设置](/img/os/windows/firewall/firewall_logging_settings.png)

 
# 参考

* [Viewing Firewall and IPsec Events in Event Viewer](https://technet.microsoft.com/en-us/library/ff428140)
* [How to Track Firewall Activity with the Windows Firewall Log](http://www.howtogeek.com/220204/how-to-track-firewall-activity-with-the-windows-firewall-log/)