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

> 上述安装过程即满足了刷新Android Image需求，同时也是[准备Android开发环境](prepare_android_develop_environment.md)的过程


# 参考

* [怎么在安卓手机上注册谷歌账号? ](https://www.zhihu.com/question/26397758)
* [如何使用 Google Play 开发者控制台](https://support.google.com/googleplay/android-developer/answer/6112435?hl=zh-Hans)
* [SDK Manager](http://developer.android.com/tools/help/sdk-manager.html)