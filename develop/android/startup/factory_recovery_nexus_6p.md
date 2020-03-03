> 注意：Factory Image恢复设备会导致数据抹除，所以建议采用OTA镜像恢复（不需要解锁也不需要擦除数据）

* 将手机切换到fastboot模式

```
adb reboot bootloader
```

> 如果命令行切换失败，可以通过组合键完成切换fastboot模式：关机，同时按住 `音量减小键` + `电源键` 开机，则切换到fastboot模式

* 手机解锁bootloader

```
fastboot flashing unlock
```

* (可选)可以安装第三方recovery - 参考 [Install LineageOS on angler](https://wiki.lineageos.org/devices/angler/install)

下载 [TWRP for angler](https://dl.twrp.me/angler/) ，然后刷入

```
fastboot flash recovery twrp-3.3.1-0-angler.img
```

> 下载完的镜像文件，请先校验SHA256:

```
shasum -a 256 angler-opm7.181205.001-factory-b75ce068.zip
```

* 解压缩下载的镜像

```
unzip angler-opm7.181205.001-factory-b75ce068.zip
```

* 执行 `flash-all` 脚本，安装  bootloader, baseband firmware(s), 和操作系统

```
./flash-all.sh
```

> 注意：刷工厂镜像，手机必须是解锁的，否则会报错 `FAILED (remote: 'device is locked. Cannot flash images')`

* 完成刷机以后，再次切换到fastboot模式，然后锁住bootloader

```
fastboot flashing lock
```

> 注意：每次切换lock都会抹除一次系统数据

# 参考

* [Factory Images for Nexus and Pixel Devices](https://developers.google.com/android/images)