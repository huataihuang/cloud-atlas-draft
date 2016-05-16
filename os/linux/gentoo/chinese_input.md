# 中文显示

只需要安装中文字体，并结合设置环境使用`UTF-8`就可以正常显示中文了

```bash
emerge --ask media-fonts/wqy-zenhei media-fonts/wqy-microhei
```

编辑`/etc/locale.gen`内容如下

```bash
en_US ISO-8859-1
en_US.UTF-8 UTF-8
```

然后执行`locale-gen`，最后再重新加载环境 `env-update && source /etc/profile`。

并且我使用 `eselect locale list` 和 `eslect locale set 5`设置`en_US.utf8`作为`LANG`环境。实际是创建了`/etc/env.d/02locale`配置文件，该文件中只有一行

```bash
LANG="en_US.utf8"
```

> 由于我喜欢英文界面，所以在设置`locale`时候，只设置了`en_US.UTF-8`
> 
> 上述设置已经可以满足桌面环境显示中文了。不过，对于部分应用程序，如果不设置`LC_CTYPE`环境变量为`zh_CN.UTF-8`就不能输入中文（如chromium），见后文。

# 输入法

```bash
emerge --ask ibus ibus-rime
```

在使用ibus时，要修改默认的`key`，将`space`修改成`l`，即`Next input method`组合键修改成`<Alt><Shift>l`，这样可以避免`Terminal`中无法使用`space`空格键。

ibus中文拼音输入法已经停止维护`ibus-pinyin`，应该使用`ibus-libpinyin`代替(似乎不能够自定义词语，可以尝试`ibus-sunpinyin`)。

建议使用`ibus-rime`（中州输入法），支持更多的输入方法并且跨平台，并且更为灵活：

* 安装rime后，默认配置是繁体中文输入，按组合键 **Ctrl+`** 呼出输入法方案选单，切换为「汉字」就可以输入简体了。配置文件位于`~/.config/ibus/rime`，定制方法见[Rime定制指南](https://github.com/rime/home/wiki/CustomizationGuide)

> [archlinux: IBus](https://wiki.archlinux.org/index.php/IBus)

## chromium无法输入中文的解决

意外发现在chromium中无法使用ibus输入中文（不管怎么切换输入的都是英文），开始我以为是编译chromium的时候没有指定gtk支持。但是参考 [Fcitx (简体中文)](https://wiki.archlinux.org/index.php/Fcitx_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))，其中提到 `当 locale 为英文时，在 GTK+2 程序中有可能无法正常使用 Fcitx，例如 Chromium (简体中文) 或 Firefox (简体中文) 等。`。

参考 [chromium中文显示不了的解决办法](http://blog.csdn.net/kimffy/article/details/7851037)，修改`/etc/env.d/02locale`，添加一行`LC_CTYPE="zh_CN.UTF-8"`，即类似如下

```bash
LANG="en_US.utf8"
LC_CTYPE="zh_CN.UTF-8"
```

然后再执行`env-update && source /etc/profile`，此时系统会在`/etc/profile.env`中添加一行`LC_CTYPE='zh_CN.UTF-8'`，则再登录一次系统，就会看到这个环境变量

```bash
LANG=en_US.utf8
LC_CTYPE=zh_CN.UTF-8
```

再启动chromium，就可以看到能够输入中文了。

> 此外，还发现原先在`xfce4-terminal`中无法切换中文输入，现在也可以输入中文了。并且还保留了英文的界面，非常完美。