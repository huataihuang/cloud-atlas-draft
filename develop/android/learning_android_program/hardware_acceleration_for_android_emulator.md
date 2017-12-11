Android模拟器可以使用一些硬件加速功能来提高性能。通常在安装Android Studio时会提示你安装相应的软件以及配置开发主机。以下是如何优化图形和虚拟机加速设置。如果需要，则手工安装VM加速软件。

# 配置图形加速

# 配置VM加速

大多数现代CPU都提供了硬件加速虚拟机的支持，运行要求如下：

* 最新的Android SDK Tools（至少版本17以上）
* 使用基于x86的系统镜像的AVD，在Android 2.3.3(API level 10)或更高版本。

使用`ARM-`或者`MIPS-`镜像的AVDs不能使用以下的虚拟机加速配置。

# 参考

* [Configure Hardware Acceleration for the Android Emulator](https://developer.android.com/studio/run/emulator-acceleration.html)