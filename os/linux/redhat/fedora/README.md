> 工作平台切换到Fedora 26，选择桌面是轻量级的LXQt，提供一些经验和建议。

之所以选择LXQt桌面主要是基于以下因素：

* 轻量级 - 将主机最大的资源用于计算、编程、虚拟化模拟
* 现代化的交互界面，兼容主流的GTK/Qt程序 - 有些商用软件还是需要Gnome/KDE支持的，LXQt在轻量级基础上可以提供兼容
* LXQt采用了GTK3和Qt5，比原先的LXQE（GTK2）提供了更多面向未来软件的可能；并且现在LXQE和LXQt项目已经合并，未来发展即为LXQt。

# 参考

* [Lubuntu LXQT Now Available as a Daily Build](https://linuxlove.eu/lubuntu-with-lxqt-now-available-as-a-daily-build/)

----

维基百科：

* [轻量级Linux发行版](https://zh.wikipedia.org/wiki/%E8%BD%BB%E9%87%8F%E7%BA%A7Linux%E5%8F%91%E8%A1%8C%E7%89%88)可参考选择轻量级的桌面发行版本。
* [Linux发行版比较](https://zh.wikipedia.org/wiki/Linux%E5%8F%91%E8%A1%8C%E7%89%88%E6%AF%94%E8%BE%83)对很多发行版进行了比较，不过该文档已经比较陈旧。


如果要尝试各种桌面，可以试试[sparkylinux](https://sparkylinux.org/)，这个发行版内置众多桌面，可以切换尝试。

> [Numix](http://numixproject.org/)项目提供了一种theme定制的方式来提供不同的界面观感，基本风格是类似Google Material的简约设计。其[numix-gtk-theme](https://github.com/numixproject/numix-gtk-theme)可以用于各种发行版本。

----

# 未来的可能

## LFS

所有的发行版或许都不如自己打造的...

如果有勇气和精力，会尝试[Linux from scratch](http://www.linuxfromscratch.org/)，从0开始构建。

> 最重要的是能够适应完全终端的工作，用vim来实现开发...

## elementary OS（基于Ubuntu模拟MacOS）

[elementary os](https://elementary.io/)是基于Ubuntu开发的Linux发行版，其桌面是基于GNOME的名为Pantheon的桌面环境。深度集成了其他elementary OS应用程序，如Plank（一个基于Docky的Dock）、Midori（默认的网页浏览器）或Scratch（一个简单的文本编辑器）。该发行版使用基于Mutter的Gala作为其窗口管理器。 -- [维基百科：elementary OS](https://zh.wikipedia.org/wiki/Elementary_OS)

> 主要是兼容Ubuntu，并且桌面设计非常美观，类似MacOS。这样可以兼容运行大量的应用程序，并且Gnome的程序基础非常广泛。

[elementaryOS A collection of 9 posts](https://decathorpe.com/tag/elementaryos/)提供了有关在Fedora上移植elementary+Panthoen的进度，从2017年4月的[progress of elementary+Pantheon on fedora (Apr. 2017)](https://decathorpe.com/2017/04/29/progress-of-elementary-pantheon-on-fedora-apr-2017/)看已经可用：

> The latest versions of all Pantheon desktop components are available on fedora 25+.

找到一个安装方法[How to install Pantheon in Fedora](https://gist.github.com/danrabbit/bebcd4b5c3c10274bdd0997e85610bb3)

```
sudo dnf install appcenter audience maya-calendar noise pantheon-calculator pantheon-files pantheon-files pantheon-photos pantheon-terminal scratch-text-editor screenshot-tool snap-photobooth switchboard elementary-icon-theme elementary-theme pandora-wallpapers plank gala pantheon-agent-polkit pantheon-session-settings slingshot-launcher wingpanel
```

然而，系统模拟Mac既是优点也是缺点：其实现在使用Mac笔记本已经非常普及，Mac在图形界面上的造诣以及和手机、iCloud的无缝融合已经远不是单纯一个Linux发行版能够达到的高度。所以，对elementary OS采用的跟随策略（以及采用自己的App Store分成）并不看好。

## 具有Android风格的发行版

* [Papyros](http://papyros.io/) 采用Google Material Design的发行版，基于Arch Linux
* [Liri](https://liri.io/) 同样采用Google Material Design风格，基于Arch Linux

> 甚至会以为自己在使用ChromeOS

## 三大发行系列之三：Arch Linux

Arch的文档非常丰富，采用的是开源社区最主流的上游软件版本，纯粹而没有额外的补丁和整合内容，所以如果遇到问题，往往可以从上游得到支持。

除了[Gentoo]()

## Enlightenment(底层库非GTK/QT，受众面狭窄)

[Enlightenment](https://www.enlightenment.org/)则是一个非常小众的发行版本，界面是非常神秘的黑色，属于独辟蹊径的轻量级桌面操作系统。最早是从Tizen发展出来，和三星有着千丝万缕的关系。

> Enlightenment采用了[EFL](https://www.enlightenment.org/about-efl)作为开发库，所以发展会比较局限。