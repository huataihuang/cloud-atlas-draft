使用Fedora作为工作桌面，实现中文输入是关键的环节。由于我选择了LXQt这个混合了Qt和GTK+的轻量级桌面，所以选择中文输入法也主要考虑轻量级：快速且功能简洁。对比了ibus,fcitx的一些网上文档，最终选择fcitx作为输入法:

* 以往使用Linux桌面，对fcitx的性能印象较好，ibus早期版本输入速度较慢耗资源（后期版本有很大改善，和Gnome兼容性较好）
* ibus对Qt支持可能存在一些不足 （参考[archlinux: IBus](https://wiki.archlinux.org/index.php/IBus)）
* Ubuntu 15及以上版本默认推荐使用fcitx替代早期版本中默认使用的ibus（参考[Ubuntu Chinese Setup](http://www.pinyinjoe.com/linux/ubuntu-12-chinese-setup.htm)）

> 非KDE环境可能安装`fcitx-module-kimpanel`会导致fcitx输入中文时不显示候选词框，需要移除。（参考[Ubuntu安装Fcitx以及Fcitx输入中文不显示候选词框的解决办法](http://blog.csdn.net/qq_21397217/article/details/52447263)，记录未验证）

# 安装fcitx

* 安装fcitx-qt5和fcitx就可以默认安装相关软件包

```bash
yum install fcitx-qt5 fcitx fcitx-configtool fcitx-libpinyin
```

> `fcitx-configtool`是基于GTK的配置工具，非常好用，避免手工编辑配置文件。`fcitx-libpinyin`是代替了sunpinyin的改进版本，性能较好功能够用。

# 配置fcitx

* 编辑 `~/.xprofile`

```bash
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
```

* 设置正确的`LC_CTYPE`（**非常重要的步骤，特别是对于选择英文交互界面**）

编辑`/etc/locale.conf` 添加一行`LC_CTYPE`配置类似如下（第一行`LANG`配置表示使用英文系统）

```
LANG="en_US.UTF-8"
LC_CTYPE="zh_CN.UTF-8"
```

> 一定要设置正确的`LC_CTYPE`否则会导致`ctrl+space`快捷键无法切换中文输入法（如firefox/chromium等程序），导致只有leafpad这样简单的gtk程序才能使用中文输入。

* 由于使用的是xdg兼容桌面LXQt（其他如Gnome/KDE/LXDE/Xfce），所以通过复制桌面自动启动配置就可以在登陆图形界面时自动启动fcitx

```bash
cp /usr/share/applications/fcitx.desktop ~/.config/autostart/fcitx.desktop
```

# switch to ibus

最近一次Fedora升级后fcitx无法正常呼出，所以切换到ibus输入法：

> 参考[What is the Preferred Method for Installing a Chinese Input Method Editor (IME) in Fedora 22?](https://ask.fedoraproject.org/en/question/69947/what-is-the-preferred-method-for-installing-a-chinese-input-method-editor-ime-in-fedora-22/)


```
dnf remove fcitx-qt5 fcitx fcitx-configtool fcitx-libpinyin
mv ~/.xprofile ~/.xprofile.bak
rm -f ~/.config/autostart/fcitx.desktop

sudo dnf install ibus-setup ibus-pinyin ibus-qt

cat << EOF > ~/.xprofile
export GTK_IM_MODULE=ibus
export QT_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
EOF

ibus-setup
```

> 另外，需要设置`ibus-daemon`在桌面系统启动时启动。

# 参考

* [fcitx官方wiki:配置（其他）](https://fcitx-im.org/wiki/Configure_(Other)/zh-hans) - 本文设置主要参考该文档
* [archlinux: Fcitx (简体中文)](https://wiki.archlinux.org/index.php/Fcitx) - arch的文档较为完善，不仅包含设置也提供了排查方法
* [Ubuntu安装Fcitx以及Fcitx输入中文不显示候选词框的解决办法](http://blog.csdn.net/qq_21397217/article/details/52447263)