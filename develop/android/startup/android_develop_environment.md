# 注册Android手机

如果在首次Android开机的时候没有注册Google Account（原生Android预装了GMS），则需要在`设置>账户>添加账户>Google`注册手机。前提条件是手机已经翻墙！

# 使用Google Play开发者控制台

* 注册Google Play开发者账号

# IDEA Intellij安装Android SDK

## 使用`sdk-manager`

从[Download Android Studio and SDK Tools](https://developer.android.com/sdk/index.html#top)下载最新版本的独立的[SDK Tools](https://developer.android.com/sdk/index.html#Other)。

我使用的是Mac OS X，所以下载的`android-sdk_r24.4.1-macosx.zip`解压缩以后目录是`android-sdk-macosx`，将这个目录存放到`~/`下（选择自己的HOME目录是为了方便普通用户身份访问）。

在Intellij中创建一个新项目，选择Android

![Intellij中创建一个新Android项目](/img/develop/android/intellij_new_android_project.png)

点击`Next`，在下一步设置`Android SDK Location`时填写前面下载的SDK Tools目录，例如这里`/Users/huatai/android-sdk-macosx`

![Intellij中设置Android SDK位置](/img/develop/android/intellij_android_sdk_location.png)

在下一步选择`Launch SDK Manager`

![Intellij中launch SDK Manager](/img/develop/android/intellij_launch_sdk_manager.png)

在`SDK Manager`中，默认选择安装SDK 6，使用默认安装的软件包就可以开发Android 6的应用软件了，其中也包含了`Android SDK Platform-tools`。

> 上述安装过程即满足了刷新Android Image需求，同时也是准备Android开发环境。

## 安装Androd Studio

在macOS上安装Android Studio，选择默认安装，其中有一个安装HAXM组件失败：

```
Running Intel® HAXM installer
2018-04-05 21:51:03.098 HAXM installation[74586:4581895] Copy Rights Failed: -60006
2018-04-05 21:51:03.099 HAXM installation[74586:4581895] Cannot grant admin right for HAXM installation!
HAXM installation failed. To install HAXM follow the instructions found at: https://software.intel.com/android/articles/installation-instructions-for-intel-hardware-accelerated-execution-manager-mac-os-x
```

# 配置离线构建环境

Android Studio默认需要连接Google才能使用，因为使用过程中需要下载很多组件。但是在瓷器国，在线更新非常麻烦，需要搭建翻墙梯子，效率很低。

Android Studio也提供了离线部署开发环境的方法，请参考 [配置离线构建依赖项](https://developer.android.com/studio/intro/studio-config#offline)

# 参考

* [怎么在安卓手机上注册谷歌账号? ](https://www.zhihu.com/question/26397758)
* [如何使用 Google Play 开发者控制台](https://support.google.com/googleplay/android-developer/answer/6112435?hl=zh-Hans)
* [SDK Manager](http://developer.android.com/tools/help/sdk-manager.html)