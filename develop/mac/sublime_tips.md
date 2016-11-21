完整的Sublime Text学习资料可以参考[Sublime Text全程指南](http://www.kancloud.cn/digest/sublime-text-complete-guide)，这个指南覆盖了Sublime Text的常用功能和使用案例，适合入门参考。

> [Sublime Text全程指南](http://www.kancloud.cn/digest/sublime-text-complete-guide)的作者使用[ScreenToGif](http://screentogif.codeplex.com)来录制屏幕制作GIF，适合做编程IDE操作介绍，值得参考。

# 插件安装

Package Control组件安装安装：

按`Ctrl+``调出console粘贴以下代码到底部命令行并回车：

```
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```

重启Sublime Text 3。如果在`Perferences->package settings`中看到`package control`这一项，则安装成功。按下`Ctrl+Shift+P`调出命令面板输入`install` 调出 `Install Package` 选项并回车，然后在列表中选中要安装的插件。

> 安装的插件包同样可以卸载: 按下`Ctrl+Shift+P`调出命令面板输入`remove` 调出 `Remove Package` 选项并回车，然后在列表中选中要安装的插件。

## Terminal插件

同时按下`option`+`command`+`shift`+`t` 可以在当前目录唤起Terminal程序

# 编辑

> Sublime Text常用的Windows平台快捷键`Ctrl`在Mac平台对应使用`command`建

* （多重）选择

`⌘`+`d` 选择当前光标所在的词并高亮所有该词所有出现的位置，再次按下`⌘`+`d`则光标住现在下一个位置。这样可以在文章中选择多处同时编辑，如果某个词不想选择，则按下`⌘`+`k`进行跳过，使用`⌘`+`u`进行回退，使用`Esc`退出多重编辑。

* 多行同时编辑

按下`⌘`然后使用光标定位多个位置，则可以选择多个位置同时编辑。

如果需要将多行连接起来，则选择多处，并按下`⌘`+`j`。

# 查找和替换

# 转跳

* 转跳到文件

`

# Mac下特殊符号输入

请参考以下两篇文档，对于文本编辑输入特殊符号非常有帮助：

* [Mac——如何输入⌘、⌥、⇧、⌃、⎋等特殊字符](http://newping.cn/447)
* [Mac——键盘输入符号的技巧](http://newping.cn/414)

在Mac中，一些符号有特定意义：

```
⌘（command）、⌥（option）、⇧（shift）、⇪（caps lock）、⌃（control）、↩（return）、⌅（enter）
```

# 参考

* [如何优雅地使用Sublime Text](http://www.cnblogs.com/jadeboy/p/5049340.html)
* [Sublime Text全程指南](http://www.kancloud.cn/digest/sublime-text-complete-guide)