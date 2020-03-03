如果设备无法获得OTA，则可以通过从 [Full OTA Images for Nexus and Pixel Devices](https://developers.google.com/android/ota) 提供的下载镜像来完成更新。Full OTA Image刷机和 [工厂镜像恢复](actory_recovery_nexus_6p)效果相同，但是不会擦除设备，也不需要unlock bootloader。

* 将设备切换到recovery模式

```
adb reboot recovery
```

> 如果不能使用adb来切换到recovery模式，可以使用组合键：同时安装 `音量增加键` + `电源键` 启动手机

* 选择 `Apply update from ADB` 进入 `sideload` 模式，此时使用 `adb devices` 可以看到设备

* 执行以下命令刷入 ota 文件

```
adb sideload angler-ota-mhc19q-b9ac826b.zip
```

# 参考

* [Full OTA Images for Nexus and Pixel Devices](https://developers.google.com/android/ota)