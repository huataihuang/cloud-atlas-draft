在Linux平台使用蓝牙设备需要安装`bluez`和`bluez-utils`软件包，系统已经默认安装并启动了bluez服务

# 命令行使用

* 检查是否已经激活了内置的蓝牙功能

```bash
$ hcitool dev
Devices:
        hci0    B8:E8:56:33:E4:8B
```

> 上述显示的是笔记本电脑的蓝牙设备

* 扫描外部蓝牙设备 - 注意：如果要配对外部的设备

```
$ hcitool scan
Scanning ...
        10:48:B1:99:6B:87       Bluedroid TV 1.0
        A4:E9:75:0C:5B:9B       Magic Mouse 2
```

* 根据`hcitool`的help，可以看到

```
        scan    Scan for remote devices
        con     Display active connections
        cc      Create connection to remote device
        dc      Disconnect from remote device
```

* 连接MagicMouse

```
sudo hcitool cc A4:E9:75:0C:5B:9B
```

此时就可以在Linux图形界面中使用MagicMouse 2，不过，比较遗憾的是，对MagicMouse V2的支持有限，中键的模拟（双指滑动）不能实现。

# 图形界面（可选）

要方便使用，安装图形界面程序还是有必要的。

> 实际使用发现利用率不高，第一次配对和连接，实际上使用命令行也能够完成。如果对系统维护有“洁癖”，还是使用命令行维护较好。

在[Archlinux: Bluetooth](https://wiki.archlinux.org/index.php/bluetooth)介绍了多种图形界面前端程序，分别针对不同的桌面：

* [GNOME Bluetooth](https://wiki.gnome.org/Projects/GnomeBluetooth)
* [Bluedevil](https://projects.kde.org/projects/kde/workspace/bluedevil) - KDE环境
* Blueberry - 多中平台适用
* Blueman

在LXQt桌面，主要程序基于Qt5，正好适用Bluedevil程序，基本无需安装太多软件包（底层已经具备），非常方便使用。

启动`bluedevil-wizard`工具，只要开启了Apple Magic Mouse 2的开关，就可以找到设备进行配对，立即就可以使用。不过，默认无法识别MagicMouse的中间滑动手势（相当于滚轮），所以需要进一步设置。

# 触摸板

参考[pple Magic Mouse - no scrolling](https://bbs.archlinux.org/viewtopic.php?id=210091)，采用以下方法：


```
modprobe hid-magicmouse emulate_scroll_wheel=Y
```

这种方式加载了`hid-magicmouse`之后，就可以在MacBook Pro上使用MagicPad的双指滑动的手势，不过，对MagicMouse 2则无效。

# 参考

* [Archlinux: Bluetooth](https://wiki.archlinux.org/index.php/bluetooth)
* [Using the Apple Magic Mouse with Ubuntu (16.0.4)](http://sneclacson.blogspot.com/2016/09/using-apple-magic-mouse-with-ubuntu-1604.html) - 介绍了使用Magic Mouse V1的经验
* [AppleMagicTrackpad](https://wiki.ubuntu.com/Multitouch/AppleMagicTrackpad)