# 如何获取Android 7 Nougat

Android 7.1.1 Nougat当前已经由[google官方提供镜像给Pixel, Nexus 5X, Nexus 6P, Nexus 9 和 Pixel C](https://developers.google.com/android/images)，如果非官方支持的，则或者是[厂商支持](http://www.androidcentral.com/will-my-phone-get-updated-android-nougat)或者通过[开源社区支持升级](http://www.theandroidsoul.com/cm14-release-date/)。

# 通过工厂镜像刷机获取Android 7 Nougat

## 下载刷机的工具

刷入工厂镜像的首要工具是活的Android SDA，特别是需要`adb`和`fastboot`工具，可以从Android Studio portal下载

* 访问[Android Studio](https://developer.android.com/studio/index.html)，页面滚动到最下端，查找对应操作系统的命令行工具`command line tools`
* 下载`command line tools`压缩包，并解压缩，重命名为`~/android-sdk`。在这个目录的`bin`子目录下，有一个[sdkmanager](https://developer.android.com/studio/command-line/sdkmanager.html)是用来管理Android SDK的命令行工具，可以用来安装，更新和卸载Android SDK。如果是用Android Studio，可以不使用这个工具，而是[通过Android Studio IDE来管理SDK包](https://developer.android.com/studio/intro/update.html#sdk-manager)
![通过IDE管理Android SDK](/img/develop/android/sdk-manager-tools_2-0_2x.jpeg)

* 使用`sdkmanager`安装adb 和 fastboot

```
sdkmanager "platforms;android-25"
```

不过，比较奇怪，显示安装完成，但是我没有找到 `platform-tools`目录。使用`sdkmanager --list`检查显示

```
Installed packages:
  Path                 | Version | Description             | Location
  -------              | ------- | -------                 | -------
  platforms;android-25 | 3       | Android SDK Platform 25 | platforms/android-25/

Available Packages:
  Path                              | Version      | Description
  -------                           | -------      | -------
  add-ons;addon-g..._apis-google-15 | 3            | Google APIs
  add-ons;addon-g..._apis-google-16 | 4            | Google APIs
...
platform-tools                    | 25.0.3       | Android SDK Platform-Tools 25.0.3
...
platforms;android-25              | 3            | Android SDK Platform 25
...
tools                             | 25.2.4       | Android SDK Tools 25.2.4
```

参考 [Android Debug Bridge]() `adb`工具是位于 `android_sdk/platform-tools/`，所以又安装一次`platform-tools`:

```
sdkmanage "platform-tools"
```

> `platform-tools`包含了`adb`工具

仔细找了一下，发现`sdk-manager`是将SDK软件包安装到了HOME目录下，也就是把`platform-tools`和`platform`都安装到了`/Users/huatai`目录下（我的个人目录），所以我重新通过`sdkmanager`设置一次`sdk-root`目录，然后重新安装一遍



> 如果需要更新，则执行 `sdkmanager --update`



* 如果使用IntelliJ IDEA安装Android Development环境，参考[Getting Started with Android Development](https://www.jetbrains.com/help/idea/2016.3/getting-started-with-android-development.html)
  * 使用`⌘;`打开`Configure`(参考[Configuring Global, Project and Module SDKs](https://www.jetbrains.com/help/idea/2016.3/configuring-global-project-and-module-sdks.html))

> 如果在配置Android新项目时遇到报错显示Android SDK没有找到（例如我以前安装配置过，但是SDK目录被删除）"You can configure you SDK via Configure | Project Defaults | Project Structure | SDKs"。则按下`⌘;`打开`Project Structure`（也可以通过菜单`File => Project Structure ...`访问），然后点击`SDKs`，并添加`Android SDK`以选择对应目录。


## 激活开发者模式和USB debugging

* 访问Nexus设备的`Settings => About Phone/Tablet`
* 连续点击`Build number` `7次`直到对话框提示你现在已经是一个开发者（`developer`）
* 再次访问Nexus设备的`Settings => Developer options`
* 确保这个`Developer options`中设置了`on`并且`USB debugging`已经开启
* 激活`OEM unlock`
* 将手机通过USB连接到电脑上，并在提示你`Allow USB debugging`对话框中点击`OK`

> 只有激活了USB debugging之后才能在`adb devices`中看到连接设备

> 以上步骤完成后，就需要unlock手机的bootloader

## Unlock手机的bootloader

Unlock手机的bootloader并不复杂，但是要注意：`手机将执行factory reset，并且手机中所有应用程序和个人数据都将丢失，所以**务必确保在这个步骤执行前备份好设备中的数据**。`

* 关闭手机
* 同时按住`电源键`和`音量减小键`
* 在电脑上打开`Command Prompt`(Windows)或Terminal(Mac)，进入到Platform tools目录下，然后执行

```
./fastboot flashing unlock
```

* 同时按下`音量增加键`和`电源键`来确认bootloader unlock
* 在电脑上执行以下命令重启手机

```
./fastboot reboot
```

## 刷Android 7.1.1工厂镜像

[Factory Images for Nexus and Pixel Devices](https://developers.google.com/android/images)是google提供的原厂镜像

* 在中断进入`Platform tools`目录，执行以下命令检查手机是否正确查看

```
./adb devices
```

> 手机首先要解锁能够看到桌面正常使用，然后再次插入电脑的USB，确认已经进入`debug`模式，这样才能使用`adb devices`查看到连接设备

* 执行刷机: 解压缩下载的工厂镜像，在这个目录下有一个`flash-all.sh`执行就可以开始刷机

```
./flash-all.sh
```

如在Mac平台执行有问题，可以参考[How to manually update your Nexus or Pixel](http://www.androidcentral.com/how-manually-upgrade-your-nexus)

* 首先确保电脑和手机正确连接，关闭手机，然后**同时按下`电源键+音量减小键`进入bootloader模式**，这样使用`fastboot`命令才能看到连接设备的序列号（`adb`不需要进入bootloader模式就可以看到设备）

```
fastboot devices
```

> 一定要进入bootloader模式，否则使用`fastboot devices`看不到设备

* 首先刷入bootloader

```
fastboot flash bootloader [bootloader file].img
```

瞬间显示完成

```
target reported max download size of 494927872 bytes
sending 'bootloader' (3532 KB)...
OKAY [  0.102s]
writing 'bootloader'...
OKAY [  0.209s]
finished. total time: 0.311s
```

* 上述bootloader文件刷入以后需要重启回bootloader已确保所有工作正常

```
fastboot reboot-bootloader
```

* 然后更新基带（flash the updated radios)

```
fastboot flash radio [radio file].img
```

显示

```
target reported max download size of 494927872 bytes
sending 'radio' (48728 KB)...
OKAY [  1.301s]
writing 'radio'...
OKAY [  2.173s]
finished. total time: 3.474s
```

然后再次启动bootloader

```
fastboot reboot-bootloader
```

* 最后刷入正轨系统镜像

> **注意** 以下命令将擦除整个设备数据，如果不希望擦除设备，则不要使用`-w`参数，则不会删除用户数据

```
fastboot -w update [image file].zip
```

上述工作完成后，则重启手机，正常开始使用

# OTA更新镜像

如果不希望`unlock`你的`bootloader`，则需要`sideload`一个OTA更新。OTA更新比较简单，通过Platform Tools目录下的`adb`直接将镜像更新推送到手机里

```
./adb devices

./adb reboot bootloader

./adb sideload [OTA file].zip
```

# 参考

* [How to Install and Use ADB, the Android Debug Bridge Utility](http://www.howtogeek.com/125769/how-to-install-and-use-abd-the-android-debug-bridge-utility/)
* [How do I get Android 7.1.1 Nougat on your Nexus phone right now?](http://www.androidcentral.com/how-get-android-70-nougat-your-nexus-right-now)