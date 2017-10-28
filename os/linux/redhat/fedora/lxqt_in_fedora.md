作为Linux系统管理员和后端服务软件开发人员，压榨系统的每一分潜力用于运算和服务是乐此不疲的游戏。对于桌面，不追求过分的铉酷，追求简洁美观且尽可能轻量级的图形交互，是一种本能的审美观。

在工作桌面中，选择过Xfce（Linus的选择）也使用过LXDE，最终权衡兼容（兼容Gnome和KDE）以及速度，选择LXDE的演进版本LXQt。

> [What are the best Linux desktop environments for developers?](https://www.slant.co/topics/4345/~linux-desktop-environments-for-developers)有一个投票推荐给开发人员使用的桌面，排首位的是Xfce，其次是LXDE，LXQt排在第五。不过，这个网站的评选倒是能让人了解一些常用的桌面。如果希望美观和轻量级，偏向于模拟Mac的话，可以选择[Pantheon](https://elementary.io/)（elementary OS的默认桌面，和macOS非常相近）。
>
> [Linux桌面环境终极指南](http://developer.51cto.com/art/201503/467300.htm)编译了Network World网站内的Linux老牌拥护者Bryan Lunduke对比桌面系统的评测，推荐的就是elementary OS的Pantheon。

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
* 默认使用PCManFM文件管理器打开文件目录

> 在安装了Visual Stuido Code（VSC）之后，会为目录添加一个快捷方式使用VSC来打开，由于VSC在PCManFM文件管理器之后安装，所以优先级会高于PCManFM，导致Firefox/Chromium浏览器都使用VSC去显示文件目录非常不便。
> 
> 解决方法是在PCManFM文件管理器中鼠标右击一次目录图标，然后选择`Open with...` => `Other Application`，并在对话框中选择PCManFM，并勾选`Set selected application as default action of this file type`就可以了。

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

* 截屏软件

为了实现轻量级截图，采用ImageMagick结合LXQt桌面快捷键实现截屏，非常快速方便。

```
yum install ImageMagick
```

只需要执行简单的命令就可以截取鼠标划出的窗口区域内容

```
import /home/huatai/snapshot/`date +%Y-%m-%d_%H:%M:%S`.png
```

> 详细方法和脚本参考 [使用ImageMagick截屏](snapshot_with_imagemagick)

如果需要完善的截屏并编辑图片，则选择[shutter](http://shutter-project.org/preview/screenshots/)。如果只是截图，则可以参考[使用ImageMagick截屏](snapshot_with_imagemagick)

```
yum install shutter
```

> [HotShots: A Lightweight and Useful Screen Capture Tool For Linux](https://www.maketecheasier.com/hotshots-screen-capture-tool-linux/) 推荐了轻量级的截屏软件[HotShots](https://sourceforge.net/projects/hotshots/)，并且[Seven reasons why you should try HotShots](http://www.techrepublic.com/blog/linux-and-open-source/seven-reasons-why-you-should-try-hotshots/)提供了编译安装的方法和使用方法介绍。不过，HotShots似乎停止了开发，原官网也无法访问。（依赖的软件包较多，放弃）
>
> [Kaption](https://www.linux-apps.com/content/show.php/Kaption?content=139302)是KDE环境的截屏处理软件，但是也没有继续开发。
>
> [5 Tools to Take or Capture Desktop Screenshots in Ubuntu Linux](https://www.tecmint.com/take-or-capture-desktop-screenshots-in-ubuntu-linux/)介绍了5个截屏软件，但是除了shutter较为完善，ImageMagick可以定制外，其他并没有达到我的要求。可能采用ImageMaigck结合快捷键并且发送到合适的简易图片编辑软件是一个解决方法。
>
> [gscreenshot](https://github.com/thenaterhood/gscreenshot)是一个轻量级gtk前端截屏软件，并且可以通过快捷键发送给图片编辑软件。
>
> 相关软件在[archlinux:Taking a screenshot](https://wiki.archlinux.org/index.php/taking_a_screenshot)有一个汇总简介，可以参考。此外，图片编辑软件在[Simple image editor?](https://askubuntu.com/questions/164473/simple-image-editor)一文有推荐和介绍，[Pinta](https://pinta-project.com/pintaproject/pinta/)是一个替代gimp的图片编辑软件，适合作简单绘图编辑。

* 安装字符串发送工具（节约生命）`xdotool` - 参考[向X window程序发送字符串](../../x/send_string_to_x)

```
yum install xdotool
```

* 安装电子书转换和阅读软件

```
yum install calibre
```

> Linux上没有原生的Kindle，所以即使购买了正版kindle电子书，却只能在Kindle设备或者Windows/Mac/iOS上阅读，实在是非常不便。可以在购买了kindle电子书后，通过calibre转换成去除DRM的`mobi.`或`epub.`电子书，就能够在Linux上自由阅读。**注意：请尊重版权，只对自己购买的正版书籍转换并只用于自己阅读！**
>
> 参考[使用calibre去除kindle DRM](../read/calibre_remove_drm)
>
> FBreader是跨平台的轻量级epub/mobi阅读软件；也可以选择KDE环境的[Okular](http://okular.kde.org/)界面更为美观。 - 参考[Linux版EPUB阅读器](https://linux.cn/article-4943-1.html)。不过，FBreader在打开较大的epub文件时有时会缓慢甚至不刷新;Okular则在显示calibre转换的epub图片排版存在一些异常。所以，如果已经安装了calebre，则还是直接选择使用calibre自带的epub阅读器。

* 安装其他必要应用软件

```bash
yum install wget sysstat keepassx
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

# 应用软件的web替换

作为小众操作系统，Linux桌面还缺乏一些重量级并且难以离弃的应用软件。但是，比较幸运的是，如果你使用的是一些大厂的App，则通常他们的web App做得也很不错，基本达到原声App的水准：

* [微信](https://wx.qq.com/)
* [[qq]](http://w.qq.com/)
* [钉钉](https://im.dingtalk.com/)
* [icloud](https://www.icloud.com/)
* [印象笔记](https://www.evernote.com)

# 参考

* [archlinux: LXQt](https://wiki.archlinux.org/index.php/LXQt)
* [Fedora 15/16 安装后需要做的28件事](http://liyi593730139.blog.163.com/blog/static/176474247201332691139165/)
* [My Experiences Installing and Using LXQt-desktop in Lubuntu](http://www.emmestech.com/linux/lxqt.html)
* [Linux下LCD屏幕字体显示优化--dpi设置及sub-pixel次像素微调](http://xxb.is-programmer.com/2008/7/25/dpi.4260.html) - 这篇文档对dpi有详细解释