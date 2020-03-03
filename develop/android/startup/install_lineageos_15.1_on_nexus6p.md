# 解锁bootloader

* 连接设备到主机
* 在主机上，执行以下命令将设备切换到fastboot模式:

```
adb reboot bootloader
```

也可以通过在设备上使用组合键切换到fastboot模式，即先关机，然后同时按住 `音量减小键` + `电源键` 进入fastboot

* 一旦进入到fastboot模式，就会在设备屏幕上看到一个横躺着的Android机器人。此时使用以下命令验证fastboot模式:

```
fastboot devices
```

* 执行以下命令解锁bootloader:

```
fastboot flashing unlock
```

* 此时设备提示 `Unlock bootloader?` ，按下电源键确认

# 使用fastboot安装 `自定义recovery`

* 下载 `自定义recovery` - [TWRP](https://dl.twrp.me/angler)
* 连接设备到主机
* 终端命令将设备切换成 fastboot 模式:

```
adb reboot bootloader
```

此时屏幕显示为一个躺着到机器人，并且 `adb devices` 将看不到设备，但是 `fastboot devices` 可以看到设备

* 当设备进入fastboot模式，通过以下命令验证:

```
fastboot devices
```

显示如下

```
KYV7N15C03000136	fastboot
```

* 将TWRP的recovery刷入设备:

```
fastboot flash recovery twrp-3.3.1-0-angler.img
```

* 然后重启设备，按住 `音量减小键` + `电源键` 进入fastboot，并通过音量键选择 `Recovery Mode` 进入Recovery模式

# 从recovery中安装LineageOS

* 下载 [LineageOS installation package](https://download.lineageos.org/angler)
* 下载 [Google Apps](https://wiki.lineageos.org/gapps.html) - 注意安装 `arm64` 版本
* 在设备上的Recovery模式下(TWRP中)选择 `Wipe` ，然后选择 `Format Data` ，然后继续格式化。这个过程将删除所有加密和内部存储数据
* 返回上级菜单，选择 `Advanced Wipe` ，然后选择 `Cache` 和 `System` 分区，再 `Swipe to Wipe`

# 参考

* [Install LineageOS on angler](https://wiki.lineageos.org/devices/angler/install)