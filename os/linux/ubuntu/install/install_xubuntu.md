在遇到多个有趣的应用软件只有Ubuntu版本的情况下，我决定逐步将跟人工作平台从Fedora切换到Ubuntu。

> 很平庸，不是么？虽然折腾过Gentoo系统，目前也在定制LFS，但是依然有很多大型应用开发软件，必须依赖特定的发行版才能运行，所以不得不选择最为流行的Ubuntu。

但是，对于Gnome 3这样沉重的桌面系统，我仅仅使用开发和远程管理，实在太浪费资源了。我尝试了LXQt平台，虽然非常轻量级，但是LXQt似乎还缺乏一些桌面特性，往往需要通过hack方式来模拟出一些成熟平台最基本的功能（例如窗口并列，截图，字符串快捷键），也浪费了不少精力。

实际上，对于开发人员来说，如果不是追求桌面绚烂，而期望简朴简洁的平台，往往会选择Xfce平台。（这也是Linus的选择）

Ubuntu有一个基于Xfce的发行版 - [Xubuntu](https://xubuntu.org/) 平衡了轻量级和丰富的桌面特性，目前是我首选的工作桌面。

> 我依然会定制Linux From Scratch来实现一个精简的工作桌面，同时使用LFS和Xubuntu相互印证。

# 问题

Xubuntu的安装非常简单，然而也有一些不太适合我的需求之处：

* 默认安装了LibreOffice，而我通常不需要工作在Office平台（主要的工作都是WEB化的）
* 甚至我不需要Thirdbird邮件客户端
* 作为墙内用户，所有米国流行的即时软件都与我们无关

# 卸载不需要的软件

* 卸载libreoffice - 参考 [How to uninstall LibreOffice?](https://askubuntu.com/questions/180403/how-to-uninstall-libreoffice)

```
sudo apt-get remove --purge libreoffice*
sudo apt-get clean
sudo apt-get autoremove
```

* 卸载雷鸟, pidgin

```
sudo apt-get remove --purge thunderbird pidgin
```

# 安装软件

* 安装中文输入法ibus

```
sudo apt-get install ibus ibus-libpinyin
```

> 

启动

```
ibus-daemon -drx
```

设置切换：

```
cat << EOF > ~/.xprofile
export GTK_IM_MODULE=ibus
export QT_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
EOF
```

实际简单操作 `sudo apt-get install ibus ibus-pinyin`

> 注意：拼音输入法设置中，`Initial state`一定要选择`Half/full width`为`Full`，否则会导致选词问题。

* 注意：`ibus-pinyin`已经被废弃，应该使用`ibus-libpinyin`替代，否则输入时候会提示`[Invalid UTF-8]`

> 参考[“Invalid UTF-8” in Chinese input](https://askubuntu.com/questions/565676/invalid-utf-8-in-chinese-input)

* 安装必要工具

```
sudo apt-get install screen
```

* 安装openconnect

```
sudo apt-get install openconnect
```

* 安装VNC Server（可选），目的是为了有时候能够在另一台桌面系统上访问这个工作平台

```
sudo apt-get install tightvncserver
```

> 详细设置参考[配置Ubuntu平台VNC服务](../../x/vnc_on_ubuntu)

* 安装keepassxc - keepassxc是跨平台兼容keepassx的社区版本（推荐代替keepassx，因为ubuntu官方仓库已经不更新keepassx）

```
sudo snap install keepassxc
```

> 使用snap安装避免对系统过多影响，目前使用的是Xfce环境，主要基于GTK运行；keepassxc基于QT5
>
> 如果希望安装KeePass2，可以参考 [Install the Latest KeePass2 2.35 in Ubuntu 16.04, 16.10, 14.04](http://ubuntuhandbook.org/index.php/2017/04/install-the-latest-keepass2-2-35-in-ubuntu-16-04-16-10-14-04/)从第三方PPA仓库安装：

```
sudo add-apt-repository ppa:jtaylor/keepass
sudo apt-get update
sudo apt-get install keepass2
```

卸载也和容易：

```
sudo apt-get install ppa-purge && sudo ppa-purge ppa:jtaylor/keepass
```

* 安装dropbox - 采用Headless模式运行，因为官方提供的deb软件包依赖gnome，而我实际使用的是Xfce环境，不希望安装过多无用的依赖包

```
cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
~/.dropbox-dist/dropboxd
```

> 下载这个 [Python 脚本](https://www.dropbox.com/download?dl=packages/dropbox.py)，通过命令行控制 Dropbox。

# 参考

* [Installing Ubuntu Linux 16.04 LTS on Macbook Air 7,2 (2015) and getting it to work properly](http://lesavik.net/post/getting-ubuntu-linux-to-work-on-macbook-air-7.2/)
* [Xubuntu on MacBook Air](https://trailingwhitespace.com/articles/linux-desktop/)