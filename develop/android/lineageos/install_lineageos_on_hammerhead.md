# 写在前面的一些经验教训

* recovery请刷[TWRP](https://dl.twrp.me/hammerhead)，[否则安装GApps可能存在问题](https://github.com/opengapps/opengapps/wiki/FAQ)

# 基本要求

* 确保计算机安装了`adb`，设置介绍可以参考[这里](https://wiki.lineageos.org/adb_fastboot_guide.html)

* 在设备上激活[USB debugging](https://wiki.lineageos.org/adb_fastboot_guide.html#setting-up-adb)

# 解锁bootloader

> 本步骤每台设备只需要运行一次
>
> `警告！`：解锁bootloader将`删除`设备上所有数据。处理前请确保已经备份设备上数据。

* 通过USB连接设备和PC
* 在主机上执行如下命令：

```
adb reboot bootloader
```

也可以通过按键组合启动进入`fastboot`模式：首先关闭手机，然后同时按住`Volume Down + Volume Up`(即同时按住音量增大和减小键)，然后按下电源键，直到启动菜单出现。

> 注意：首次操作需要手机上授权

* 当手机进入fastboot模式后，在主机端通过以下命令验证：

```
fastboot devices
```

* 输入以下命令解锁bootloader

```
fastboot oem unlock
```

* 如果设备没有自动重启，则手工重启。重启以后手机就已经是unlock了。

* 当手机重启完毕后，你需要重新激活USB debug

# 使用`fastboot`安装定制recovery

* 下载一个定制recovery，例如可以下载[TWRP](https://dl.twrp.me/hammerhead)，例如`twrp-x.x.x-x-hammerhead.img`

> 虽然[构建hammerhead(Nexus 5)的LineageOS ROM](build_lineageos_for_hammerhead)中构建了`recover.img`，并且也能够在这个`recover.img`支持下完成LineageOS的刷机。但是发现对[GApps支持不佳](https://github.com/opengapps/opengapps/wiki/FAQ)，最后还是重新刷了标准的[TWRP Recovery](https://twrp.me/)

* 通过USB连接手机和主机

* 在主机的终端输入以下命令：

```
adb reboot bootloader
```

* 将recovery刷入手机设备

```
fastboot flash recovery recovery.img
```

* 现在再次重启进入recovery来验证这个安装：

首先关闭手机，然后同时按住`Volume Down + Volume Up`(即同时按住音量增大和减小键)，然后按下电源键，直到启动菜单出现。使用音量键导航，并通过电源键选择"RECOVERY Mode"

# 从recovery安装LineageOS

* 下载[LineageOS安装包](https://download.lineageos.org/hammerhead)，或者和我一样自己[构建hammerhead(Nexus 5)的LineageOS ROM](build_lineageos_for_hammerhead)
  * 可选下载第三方英哟年程序包，例如[Google Apps](https://wiki.lineageos.org/gapps.html)
  
> Google Apps 可以选择安装[Nano](https://github.com/opengapps/opengapps/wiki/Nano-Package)或者[Pico](https://github.com/opengapps/opengapps/wiki/Pico-Package) - 出于最小化安装并且很多Google服务在墙内无法使用，所以我选择安装Pico包。

* 将LineageOS `.zip`包和需要安装的第三方包推送到根目录下的`/sdcard`目录

```
adb push filename.zip /sdcard/
```

实践：

```
adb push lineage-14.1-20171201_032348-UNOFFICIAL-hammerhead.zip /sdcard/
```

> 这里可能出现一个报错（原因未知，重新刷了TWRP,没有再遇到过，似乎和自己编译的recovery.img有关）

```
adb: error: connect failed: device unauthorized.
This adb server's $ADB_VENDOR_KEYS is not set
Try 'adb kill-server' if that seems wrong.
Otherwise check for a confirmation dialog on your device.
```

解决方法是将`~/.android/adbkey.pub`存放到手机设备的`/data/misc/adb/adb_keys`（或者相反），方法可以通过USB，e-mail，或者临时文件上传服务。

> 参考[How to Fix ADB Unauthorized Error](http://www.neuraldump.net/2017/05/how-to-fix-adb-unauthorized-error/)

首先将手机中设备密钥下载

```
adb pull /data/misc/adb/adb_keys
```

然后将`adbkey.pub`内容复制到`adb_keys`再上传回手机

```
cat ~/.android/adbkey.pub >> ~/adb_keys
```

```
adb push ~/adb_keys /data/misc/adb/adb_keys
```

# 使用sideload方式刷入ROM(成功)

* 启动手机到Recovery模式

* 使用菜单擦除cache,system,然后又选择了factory reset - 实际上把整个系统完全擦除干净了（也导致无法从`/sdcard/`目录安装）

> 根据提示，有一个sideload方式

* 进入update系统菜单

`Apply update > Apply from ADB`

提示可以`adb sideload`，所以在终端执行

```
adb sideload lineage-14.1-20171201_032348-UNOFFICIAL-hammerhead.zip
```

相当于完全重新刷新系统

# 安装Open GApps

> 参考[opengapps FAQ](https://github.com/opengapps/opengapps/wiki/FAQ) - 官方仅支持[TWRP Recovery](https://twrp.me/)，其他Recovery方式都不是officially supported的。看来，我前面采用自己编译的`recovery.img`确实存在冲突，所以还是回滚到最初步骤，重新安装一次[TWRP Recovery](https://twrp.me/)和重新刷一次LineageOS。

## 使用sideload方法安装`open_gapps`（失败）

> 由于使用apply update方法安装Google Apps失败，所以尝试sideload方法

```
adb sideload open_gapps-arm-7.1-pico-20171201.zip
```

但是提示错误信息：

```
Finding update package...
Opening update package...
Verifying update package...
Update package verification took 16.1 s (result 0).
Installing update...
E:Failed to find META-INF/com/android/metadata in update package.
...
Open GApps pico 7.1 - 20171201

- Mounting
- Gathering devices & ROM information
- Performing system space calculations

Insufficient storage space available in System partition. Your may want to use a smaller Open GApps package or consider removing some apps using gapps-config.
See:'/sideload/open_gapps_log.txt'
for complete details and information.

- Copying Log to /sideload
- NO changes were made to your device

Installer will now exit...

Error Code: 70
- Unmounting

E:Installation error in /sideload/package.zip
(Status 70)

Restarting adbd...
Installation aborted.
```

## 使用`adb`推送google gapps

在Lineage OS的 `About Phone > Build number` 上连续点击7次，开启了developer模式。

然后在`Developer options`中设置以下项目：

* Android debugging - 即开启ADB接口
* Debugging notify - 可选

然后在手机端确认信任主机连接。

之后，使用`adb devices`就可以看到设备：

```
$ adb devices
List of devices attached
02211e9ec9623837        device
```

此时推送gapps就可以完成

```
adb push open_gapps-arm-7.1-pico-20171201.zip /sdcard/
```

但是，通过recovery模式安装这个zip包，依然不能成功。

# 参考

* [Install LineageOS on hammerhead](https://wiki.lineageos.org/devices/hammerhead/install)