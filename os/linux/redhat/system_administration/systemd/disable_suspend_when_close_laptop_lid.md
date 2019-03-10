当笔记本作为工作平台，运行服务器软件，希望能够在屏幕关闭的时候不出现suspend，否则会导致主机网路断开无法访问。

# 禁用屏幕关闭时suspend

* 编辑 `/etc/systemd/logind.conf`配置：

```bash
HandleLidSwitch=ignore
```

* 然后重新加载`logind.conf`配置以便生效：

```bash
systemctl restart systemd-logind
```

在`logind.conf`的man中有如下相关信息：

`HandlePowerKey=, HandleSuspendKey=, HandleHibernateKey=, HandleLidSwitch=` 控制了logind如何处理系统电源管理和睡眠键以及屏幕开阖时候触发的动作，例如系统电源关闭或者suspend。设置值可以是`ignore`，`poweroff`，`reboot`，`halt`，`kexec`，`suspend`，`hybrid-sleep` 和 `lock`。如果设置了`ignore`，就不会处理任何这些键。如果设置`lock`则会锁定屏幕。只有输入设备具有`power-switch` udev标签才会监视键盘和屏幕开阖事件。默认设置：

```bash
HandlePowerKey=poweroff
HandleSuspendKey=suspend
HandleLidSwitch=suspend
HandleHibernateKey=hibernate
```

> 上述配置方法原理和[修改ACPI事件：更改电源键默认操作](../../../kernel/cpu/acpi_events_change_handlepowerkey_action)原理是相同的，即通过`systemd`修改电源管理策略。

# 参考

* [How to disable auto suspend when I close laptop lid?](https://unix.stackexchange.com/questions/52643/how-to-disable-auto-suspend-when-i-close-laptop-lid)