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

> 安装对网络有要求（景德镇访问非常不稳定），实际上我安装了多次才成功

> 默认启动的账户是`android`密码是`changeme`，请立即修改帐号密码。

* 安装后通过ssh登录手机中运行的`Debian Jesssie`，可以看到系统占用了4G空间，对于一些常规的使用已经足够

可以在平时采用iPad Pro登录到Nexus 5手机的Linux操作系统，使用这个环境来做一些相关的维护和开发工作。

## 安装完成后的一些简单维护

作为服务器爱好者，安装的debian系统自然是选择最小化安装，安装完成后，可以做一些简单的包管理配置以便完善系统

```bash
apt-get update
apt-get upgrade
apt-get install dnsutils
```

> 由于网络不稳定等原因，在线安装debian的时候，有可能部分软件包安装存在问题，可以通过[debian在线搜索软件包](https://www.debian.org/distrib/packages)找到对应包进行补充安装。

主机名修改

```bash
hostname nexus5
echo nexus5 > /etc/hostname
sed -i 's/localhost/localhost nexus5/g' /etc/hosts
```

----

# ARMHF versus ARMEL

参考 [ARMHF versus ARMEL](http://www.xappsoftware.com/wordpress/2013/01/31/armhf-versus-armel/)

* armel 二进制程序是兼容性较好的浮点计算模式，但是速度较慢。支持ARMv4指令集
* armel 提供了直接的硬件浮点支持，速度比armel快，但是不兼容老的架构。支持ARMv7平台

# Init system

Deploy Linux 2.0开始支持[init](https://en.wikipedia.org/wiki/Init) system，可以在启动时执行服务脚本。分为以下两种方式：

* [run-parts](http://manpages.ubuntu.com/manpages/wily/man8/run-parts.8.html) - run scripts or programs in a directory
* sysv

# 安装Kali Linux

请参考 [If you have issues, read this post. !!! [L.Deploy Kali Linux Mini Documentation] #183](https://github.com/meefik/linuxdeploy/issues/183)

官方文档参考 [Kali Linux Mini Documentation](https://github.com/meefik/linuxdeploy/wiki/Kali-Linux-Mini-Documentation)

* 手机必须ROOT
* Installation Type : File
* File syste: ext2
* 选择桌面环境，VNC，SSH Server，以及X Server作为可选包。但是不要选择Kali Components
* 不要将用户名修改成 root
* 可以挂载Android文件系统，方便进行开发：但是不要挂载`/data`目录，该目录下很多系统目录会导致`df`命令显示`/cache`等目录无法访问。所以，该为挂载`/data/data`目录，就可以访问Android中的很多应用数据。
* `安装以后不要直接用启动按钮启动`，使用终端模拟器运行以下代码：

```
su
/data/data/ru.meefik.linuxdeploy/bin/linuxdeploy shell
sudo apt-get update
```

此时还没有完成安装，Kali Linux有一个meta包（ https://www.kali.org/news/kali-linux-metapackages/ ）需要安装：

```
sudo apt-get install kali-linux-full
```

请参考 [Kali Linux Metapackages](https://www.kali.org/news/kali-linux-metapackages/) ，Kali Linux提供了多种安装模式：

  * kali-linux-full 所有你熟悉的Kali工具
  * kali-linux-top10 每个子类提供最常用的10个工具
  * kali-linux-gpu 依赖GPU来完成的一些特定工具，如果选择 kali-linux-all 也会包含这个子集

> 这个`kali-linux-full`需要占用4G以上空间，而Deploy Linux最初只给这个Linux镜像文件提供了2G的空间，所以会导致无法继续安装。

参考 [How to change image size #395](https://github.com/meefik/linuxdeploy/issues/395)提供了一个重新调整镜像文件大小的方法：

例如，增加4G空间

```
dd if=/dev/zero bs=1048576 count=4096 >> /mnt/sdcard/linux.img
e2fsck -y -f /mnt/sdcard/linux.img
resize2fs /mnt/sdcard/linux.img 6144M
```

> 注意：这里`resize2fs`需要给出实际设置的更改文件系统大小，例如这里是`6144M`（6GB），否则还是会保持原来的空间大小。（测试了在`linuxdeploy`设置安装镜像文件设置成6G，但是实际安装时候依然生成了2G的空间（BUG？），还是通过上述方法调整的镜像文件系统大小。）
>
> 参考[How to resize ext3 image files](https://unix.stackexchange.com/questions/36123/how-to-resize-ext3-image-files)
>
> 上述问题可能也是resize2fs的版本问题，从[How to Grow an ext2/3/4 File System with resize2fs](https://access.redhat.com/articles/1196353)文档看不加参数应该也是可行的。


## 始终报错`E: Failed getting release file`

在安装Kali Linux时，总是遇到不能下载Release文件或者其他文件。虽然从浏览器访问 http://http.kali.org/kali/dists/kali-rolling/Release 实际上都正常。

在 [Fails to download the release file #84](https://github.com/meefik/linuxdeploy/issues/84) 有一个建议是把网站镜像下来，然后修改DNS解析，从自己的服务器安装。这个思路可以借鉴。

创建Kali Linux镜像网站的方法参考 [How to create a mirror repository from kali](https://forums.kali.org/showthread.php?33422-How-to-create-a-mirror-repository-from-kali)

也可以尝试Kali Linux的镜像网站列表 https://http.kali.org/README.mirrorlist ，最后，采用 http://mirrors.ocf.berkeley.edu/kali/ ，虽然速度不快，但是比较稳定，最终完成安装。

# 参考

* [Linux Deploy:Installing Debian](https://github.com/meefik/linuxdeploy/wiki/Installing-Debian)