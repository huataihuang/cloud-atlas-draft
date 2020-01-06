[在hammerhead(Nexus 5)上安装LineageOS](install_lineageos_on_hammerhead)记录了之前我自己编译和安装LineageOS 14.1的过程。

本文是全新刷新安装LineageOS 15.1 for Nexus 5 Android Oreo 8.1 ROM的实践笔记。

# TWRP

安装 [TWRP for hammerhead](https://dl.twrp.me/hammerhead/)

请参考[How to Install TWRP Recovery on Android Using Fastboot](https://www.cyanogenmods.org/forums/topic/install-twrp-recovery-android-using-fastboot/)

* 在Developer Options中 Enable USB Debuging
* 在笔记本上安装ADB和Fastboot utility
* 使用USB连接手机和笔记本，执行以下命令：

```
adb reboot bootloader
```

* 执行以下命令刷入TWRP

```
fastboot flash recovery twrp-3.0.x.x-xxx.img
```

* 完成TWRP刷新后执行命令：

```
fastboot reboot
```

# 清理数据

参考 [How to Clean/Wipe Data using TWRP on any Android Phone](https://www.cyanogenmods.org/forums/topic/clean-wipe-data-partitions-using-twrp/)

* 关闭手机
* 同时按下电源键和音量减小键，然后通过音量键上下选择，选择启动到recovery模式，此时会看到TWRP界面
* 选择wipe功能
* 拖动`swipe to Wipe`键则恢复出厂设置。不过，我已经备份过数据，所以采用高级选项，将所有数据全部清理。
* 重启系统，并重新进入TWRP的recovery模式

# 上传ROM zip和GApps

* 下载[Unofficial LineageOS 15.1 for Nexus 5](https://forum.xda-developers.com/google-nexus-5/development/rom-lineageos-15-1-nexus-5-t3756643)

```
adb push lineage-15.1-20180901-UNOFFICIAL-hammerhead.zip /sdcard/
```

* Google Apps 可以选择[Pico](https://github.com/opengapps/opengapps/wiki/Pico-Package) - 出于最小化安装并且很多Google服务在墙内无法使用，所以我选择安装Pico包。

> [GApps下载方法](https://www.cyanogenmods.org/forums/topic/gapps-lineageos-15-android-oreo-roms/)

* 安装[OpenConnect for Android](https://github.com/cernekee/ics-openconnect)

# 必须解决Google账号设置（翻墙）

最初刷新好软件包之后，一直没有办法通过浏览器下载文件，每次下载文件都是显示在文件管理器中`queued`状态。而且，设置了google账号之后，依然无法从Google Play安装软件。

偶然发现，很可能是最初因为无法连接Google服务（被墙），所以跳过了LineageOS初次安装后的初始设置步骤。这个设置步骤很可能做了一些系统的必须设置，跳过这个设置会导致无法通过Download Manager下载文件。通过`adb`将[OpenConnect for Android](https://github.com/cernekee/ics-openconnect)推送到手机内部，然后翻墙，重新初始化之后才能正常工作。

# 参考

* [Download LineageOS 15.1 for Nexus 5 – Android Oreo 8.1 ROM](https://www.cyanogenmods.org/forums/topic/download-lineageos-15-1-for-nexus-5-android-oreo-8-1-rom/)