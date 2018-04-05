笔记本电脑作为工作平台，涉及到一些性能优化，以便能够榨取硬件的每一份潜力。

# 电源管理

由于作为工作平台，实际上是作为远程服务器访问，不希望笔记本屏幕合起的时候进入睡眠状态（否则会导致无法远程访问）。设置方法参考 [通过 systemd禁用笔记本屏幕关闭时suspend系统](../os/linux/redhat/systemd/disable_suspend_when_close_laptop_lid):

* 编辑`/etc/systemd/logind.conf`:

```
HandleLidSwitch=ignore
```

* 重启logind

```
systemdctl restart systemd-logind
```

# 参考

* [How to disable auto suspend when I close laptop lid?](https://unix.stackexchange.com/questions/52643/how-to-disable-auto-suspend-when-i-close-laptop-lid)