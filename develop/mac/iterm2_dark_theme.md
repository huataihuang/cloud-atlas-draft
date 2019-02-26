自从macOS Mojave开始提供Dark Apperance之后，确实对长时间面向屏幕的程序员友好了很多。[iTerm2](https://www.iterm2.com)也支持Dark Theme，使得整体风格非常协调。

不过，终端显示中的`Color Presets`（`Preferences > Profiles > Colors`）虽然可以选择`Dark Background`模式，但是我发现，在macOS中，`ls -G`显示的目录颜色是非常深邃的蓝色，在黑色背景下看起来非常吃力。

> 在macOS中使用的是BSD版本的`ls`，所以不支持`ls --color`这样的彩色输出参数，但是可以使用`-G`参数来显示彩色。详细的macOS环境终端彩色设置请参考 [How to enable colorized output for ls command in MacOS X Terminal](https://www.cyberciti.biz/faq/apple-mac-osx-terminal-color-ls-output-option/)。

# Dracula

[Dracula](https://draculatheme.com/iterm/) 提供了iTerm的dark theme，比默认的dark theme要明快一些，目前默认采用这个风格。

![Dracula theme](../../img/develop/mac/iterm.png)

* 安装通过Git:

```
git clone https://github.com/dracula/iterm.git
```

* 然后激活这个theme
  * iTerm2 > Preferences > Profiles > Colors Tab
  * 下拉菜单`Color Presets...`
  * 选择`Import...`
  * 选择`Dracula.itermcolors`文件
  * 然后再次从`Color Presets...`中选择`Dracula`使风格生效

