# Android Studio

从 http://developer.android.com/sdk/ 下载最新的Android Studio

> 需要先安装Java Development Kit (JDK 8)：可以从 www.oracle.com 下载安装。对于Fedora，安装JDK 8非常容易：

```
sudo dnf install java-1.8.0-openjdk
```

将下载的`android-studio-ide-171.4443003-linux.zip`存放到`HOME`目录下然后解压缩，解压缩后的文件目录就是`android-studio`

```
cd android-studio/bin
./studio.sh
```

> 需要翻墙直接访问google的服务器下载相关的sdk和emulator - 在Linux平台，Android Studio会提示可以使用KVM（Kernel-mode Virtual Machine）软件来运行虚拟机加速Android模拟。详细设置参考[Android KVM Linux Installation](http://developer.android.com/r/studio-ui/emulator-kvm-setup.html)。

## 启动第一个Android项目

初始安装后，Android Studio会引导创建一个新项目，下载对应的SDK和emulator。

遇到报错

```
6:27 AM	Gradle sync started

6:41 AM	Gradle sync failed: Failed to find target with hash string 'android-26' in: /home/huatai/Android/Sdk
				Consult IDE log for more details (Help | Show Log) (13m 57s 417ms)
```

上述报错参考 [Failed to find target with hash string 'android-25'](https://stackoverflow.com/questions/40457524/failed-to-find-target-with-hash-string-android-25) 原因是没有通过Android SDK Manager下载SDK for API 25。通过`Settings => System Settings => Android SDK`选择对应的Android 8.0 (Android SDK Platform 26)后就可以解决这个问题。

![通过System Settings安装Android SDK](android_sdk_install_through_settings.png)

> 此外，还需要安装`Build Tools revision 26.0.2`，方法相同

# 下载早期的SDK版本

Android Studio提供了最新平台的SDK和模拟器镜像。不过，当需要在早期Android环境中测试应用时，需要使用 Android SDK Manager下载早期版本的SDK。

> 如果创建过项目，则在菜单`Tools => Android => SDK Manager`找到SDK Manager。如果还没有创建项目，则使用菜单`File => Settings => Appearance & Behavior => System Settings => Android SDK`找到SDK Manager入口。

