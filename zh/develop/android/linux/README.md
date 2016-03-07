现代手机的硬件性能已经超过几年前的笔记本电脑了，实际上很多时候硬件性能并没有充分利用，特别是对于我个人而言，不玩游戏，多数情况下只是用来阅读。考虑到平时主要使用iPad Pro作为移动工作，同时又希望能够有一个Linux环境作为开发和调试，所以就想使用Nexus 5作为自己的移动Linux工作平台。

[Linux Deploy](https://github.com/meefik/linuxdeploy)是在Android通过chroot方式部署各种Linux发行版本的开源工具，并且在Google Play市场上提供了一个安装程序，非常方便将手机操作系统转换成完整的Linux系统：

* 支持各种发行版本：Debian, Ubuntu, Kali Linux, Arch Linux, Fedora, CentOS, Gentoo, openSUSE, Slackware, RootFS (tgz, tbz2, txz)
* 支持各种CPU结构：ARM, ARM64, x86, x86_64, emulation mode (ARM ~ x86)
* 多种控制界面：CLI, SSH, VNC, X, framebuffer
* 多种环境：XTerm, LXDE, Xfce, GNOME, KDE, other (manual configuration)