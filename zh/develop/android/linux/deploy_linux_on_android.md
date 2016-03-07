# 简介

[Linux Deploy](https://github.com/meefik/linuxdeploy)是在Android通过chroot方式部署各种Linux发行版本的开源工具，并且在Google Play市场上提供了一个安装程序，非常方便将手机操作系统转换成完整的Linux系统：

* 支持各种发行版本：Debian, Ubuntu, Kali Linux, Arch Linux, Fedora, CentOS, Gentoo, openSUSE, Slackware, RootFS (tgz, tbz2, txz)
* 支持各种CPU结构：ARM, ARM64, x86, x86_64, emulation mode (ARM ~ x86)
* 多种控制界面：CLI, SSH, VNC, X, framebuffer
* 多种环境：XTerm, LXDE, Xfce, GNOME, KDE, other (manual configuration)

# 安装Debian

## 初始化要求

* 首先要[root Android设备](../startup/root_android_on_nexus_5.md)

> 检查自己设备是否成功root，可以参考[How to Check If Your Android is Rooted](https://www.oneclickroot.com/root-android/how-to-check-if-your-android-is-rooted/) ，从[Google Play Store下载安装joeykrim Root Checker](https://play.google.com/store/apps/details?id=com.joeykrim.rootcheck&hl=en)，这个工具只用来检查是否成功root，不会对系统做任何修改，是一个安全的工具。

* 从Google Play Store安装Linux Deploy软件包，然后启动`Linux Deploy`，按照其引导介绍界面，点击Install [BusyBox](https://play.google.com/store/apps/details?id=ru.meefik.busybox&hl=en)

* 从Google Play Store安装BusyBox，安装完应用程序，需要先点击应用程序图标

* 我需要的是比较简单的字符终端，所以特意选择去掉了安装LXDE图形界面，也不需要安装VNC，只要安装 SSH Server

* 确保网络联通情况下，点击`'Install'`，安装过程是自动的，最后可以看到`<<< end: install`表示安装完成。

> 默认启动的账户是`android`密码是`changeme`，请立即修改帐号密码。



# 参考

* [Linux Deploy:Installing Debian](https://github.com/meefik/linuxdeploy/wiki/Installing-Debian)