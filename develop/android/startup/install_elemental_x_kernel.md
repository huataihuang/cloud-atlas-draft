Elemental X Kernel是aaron(flar2)提供的Android定制内核，也是最流行的Android第三方内核，提供了更多的有用特性，提升性能和延长电池寿命。

如果系统root之后，还可以安装 EX Kernel Manager，则可以备份、更新镜像，以及控制内核设置，运行脚本等。（从Google Play就可以安装）

# 安装要求

* 检查 [EX Kernel兼容设备列表](http://elementalx.org/devices/) 或者下载安装 [EX Kernel Manager](https://play.google.com/store/apps/details?id=flar2.exkernelmanager)。EX Kernel ManagerUI自动下载合适设备的内核
* 解锁bootloader：只有解锁了bootloader才能是使用自定义recovery并安装定制内核
* 主机需要安装fastboot和adb：这个工具可以通过在 [Android开发网站下载platform-tools](https://developer.android.com/studio/releases/platform-tools) 获得
* TWRP recovery：从 [TWRP官网](https://twrp.me/Devices/) 下载最佳自定义recovery
* SuperSU 或 Magisk (可选) ： 建议使用 [SuperSU](https://forum.xda-developers.com/apps/supersu/2014-09-02-supersu-v2-05-t2868133) 或 [Magisk](https://forum.xda-developers.com/apps/magisk/official-magisk-v7-universal-systemless-t3473445) root系统，则样就可以使用ElementalX来修改内核设置或者优化设备性能或电池寿命

# 安装TWRP

* 将手机切换到fastboot状态(也可以通过同时按住 `电源键` + `音量减小键` 开机进入fastboot状态 )

```
adb reboot bootloader
```

在fastboot状态下，执行 `fastboot devices` 可以看到设备

* 刷入TWRP

```
fastboot flash recovery twrp-3.3.1-0-angler.img
```

* 进入TWRP

通过音量键导航方式，选择 `recovery` 进入TWRP

# 备份boot image

在操作之前，备份系统非常重要

* 在TWRP中提供了 `Backup` 选贤，选择 `boot` 项可以备份整个boot分区。请将备份命名为合适的名字，该备份将存储在sdcard区

* 如果Android系统已经root，则可以使用 EX Kernel Manager进行备份

# Root设备

建议安装 [Magisk](https://forum.xda-developers.com/apps/magisk/official-magisk-v7-universal-systemless-t3473445) ，这是目前活跃开发的Root工具，并且开源。

* 从 [Magisk Github Release](https://github.com/topjohnwu/Magisk/releases) 下载zip安装包

* 参考 [Sideload Flashable ZIPs on Android with TWRP](https://android.gadgethacks.com/how-to/sideload-flashable-zips-android-with-twrp-0176529/) 将Magisk加载到TWRP中，然后通过TWRP安装

首先将售价启动到fastboot，然后进入Recovery模式

此时执行 `adb devices` 显示状态

```
List of devices attached
KYV7N15C03000136	recovery
```

在TWRP中选择 `Advanced` => `Sideload`

此时执行 `adb devices` 显示状态

```
List of devices attached
KYV7N15C03000136	sideload
```

然后执行以下命令sideload文件到TWRP

```
adb sideload Magisk-v20.3.zip
```

上述步骤完成后就完成了Magisk安装，当TWRP加压缩Magisk之后会运行该程序，此时TWRP中运行的Magisk会有一个Wizard引导你一步步完成设置，例如调整CPU核心的频率等。

只要安装过一次Magisk，就可以在Google Play中安装Magisk Manager，以后通过Magisk Manager可以非常方便进行版本升级。

# 参考

* [Elemental X官方文档：How to install](https://elementalx.org/how-to-install/)