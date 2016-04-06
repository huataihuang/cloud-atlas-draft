> 以下记录是我[在MacBook上安装Gentoo](install_gentoo_on_macbook.md)之后，安装轻量级桌面[Xfce](http://www.xfce.org/)的摘要笔记。对于技术工作者，追求典雅和精简的桌面系统，尽可能将性能用于开发和服务调试。

# 应用程序

应用程序选择轻量级为主，并且只选择GTK系列（对gnome依赖越少越好）：

* midori(已放弃) - 使用WebKit引擎的轻量级浏览器，非常接近chromium，不过稳定性有所欠缺
* chromium - 最好的浏览器，对比之下，综合稳定性还是胜过了midori（编译时USE设置：`hidpi -hangouts -hotwording`）
* geany - 轻量级开发用编辑器
* meld - 文件对比
* vlc - 视频和音频播放器
* evince - pdf阅读器
* 钉钉 - 使用[web版本钉钉](https://im.dingtalk.com/)，已经非常完备，推荐在Linux下使用
* 旺旺 - 虽然有 [web版本旺旺](http://h5.m.taobao.com/ww/index.htm) 但是不支持群功能，无法用于工作。最终采用手机`旺信`替代！
* wireshark - 网络数据包分析工具
* keepass - 密码管理器，需要使用mono（minimal），有些沉重。所以改成在手机Android中使用KeePassDroid
* tmux - 工作必须的多终端管理器
* ansible - 工作必须的批量处理
* gitbook - 文档笔记

> midori在加载网页的时候，`X`服务会一直占用cpu资源，这个可能需要考虑使用更好的X驱动（使用nVidia闭源驱动？）

> 轻量级应用程序选择可以参考 [Best Linux apps for non-Gnome, non-KDE desktops](http://www.dedoimedo.com/computers/linux-apps-non-gnome-kde.html)

# 中文环境

在使用ibus时，要修改默认的`key`，将`space`修改成`l`，即`Next input method`组合键修改成`<Alt><Shift>l`，这样可以避免`Terminal`中无法使用`space`空格键。

ibus中文拼音输入法已经停止维护`ibus-pinyin`，应该使用`ibus-libpinyin`代替(似乎不能够自定义词语，可以尝试`ibus-sunpinyin`)。

建议使用`ibus-rime`（中州输入法），支持更多的输入方法并且跨平台，并且更为灵活：

* 安装rime后，默认配置是繁体中文输入，按组合键 **Ctrl+`** 呼出输入法方案选单，切换为「汉字」就可以输入简体了。配置文件位于`~/.config/ibus/rime`，定制方法见[Rime定制指南](https://github.com/rime/home/wiki/CustomizationGuide)

> [archlinux: IBus](https://wiki.archlinux.org/index.php/IBus)

# themes

xfce4主持多种window theme，其中以下两种主题和Mac OS X非常相近，也非常简洁：

`Platinum` 类似早期的Mac OS X 7
`Agualemon` 类似Mac OS X 10

> 我选择使用 `Platinum` 作为图形窗口风格，有点复古的Mac风范。
