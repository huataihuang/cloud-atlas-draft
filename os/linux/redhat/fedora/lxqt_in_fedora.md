作为Linux系统管理员和后端服务软件开发人员，压榨系统的每一分潜力用于运算和服务是乐此不疲的游戏。对于桌面，不追求过分的铉酷，追求简洁美观且尽可能轻量级的图形交互，是一种本能的审美观。

在工作桌面中，选择过Xfce（Linus的选择）也使用过LXDE，最终权衡兼容（兼容Gnome和KDE）以及速度，选择LXDE的演进版本LXQt。

# 基础操作系统

```bash
yum clean all
yum upgrade
```

* 安装rpmfusion (这是必要的第三方Fedora软件仓库，包含了大量nonfree软件包，例如，很多硬件厂商的闭源驱动)

```
yum localinstall http://download1.rpmfusion.org/nofree/fedora/rpmfusion-nofree-release-$(rpm -E %fedora).noarch.rpm
yum localinstall http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

* 安装Broadcom BCM4360无线网卡驱动

```
yum install kernel-devel akmod-wl
```

# 系统设置

在MacBook Pro上运行LXQt桌面主要遇到的问题是屏幕分辨率太高导致字体过小，这里涉及到Qt/GTK不同版本的字体设置，以后要逐步总结。这里提供一些建议：

* 桌面字体使用`文泉驿微米黑` 12号字体
* Font hinting设置Slight, Resoution(DPI) 125 （参考 [设置Linux桌面环境，实现HiDPI显示支持](http://www.linuxidc.com/Linux/2014-08/105997.htm)）
* 

# 应用软件安装

* 安装vpn客户端

```
yum install openconnect
```

* 安装浏览器

```bash
yum install firefox chromium
```

> chrome用于日常工作，firefox可以灵活设置proxy并且有downloadthemall插件 -- 体法双修 ^_^

* 安装其他必要应用软件

```bash
yum install wget
```

* 安装微软Visual Studio Code - 微软拥抱开源提供的一款跨平台非常优秀的轻量级代码编辑器

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'

dnf check-update
sudo dnf install code
```

* 安装Dropbox

```bash
cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
~/.dropbox-dist/dropboxd
```

> 上述tgz包安装可以避免rpm包安装以来重量级的nautius

注意提示：`Unable to monitor entire Dropbox folder hierarchy. Please run "echo fs.inotify.max_user_watches=100000 | sudo tee -a /etc/sysctl.conf; sudo sysctl -p" and restart Dropbox to fix the problem.`

# 参考

* [archlinux: LXQt](https://wiki.archlinux.org/index.php/LXQt)
* [Fedora 15/16 安装后需要做的28件事](http://liyi593730139.blog.163.com/blog/static/176474247201332691139165/)
* [My Experiences Installing and Using LXQt-desktop in Lubuntu](http://www.emmestech.com/linux/lxqt.html)
* [Linux下LCD屏幕字体显示优化--dpi设置及sub-pixel次像素微调](http://xxb.is-programmer.com/2008/7/25/dpi.4260.html) - 这篇文档对dpi有详细解释