在使用vim开发程序时，经常需要对同一个源代码文件不同部分进行查看和编辑，如何实现同一个文件不同部分同时展示，并且能够编辑不同部分？

vim支持viewport（视点）的分割，可以将视图区域分割，然后编辑同一个或多个文件。这个视图分割不仅支持水平分割，也支持垂直分割。

| 指令 | 说明 |
| ---- | ---- |
| `:sp` | 水平分割，即将窗口分为上下两部分。也可以写成 `:split` |
| `:vsp` | 垂直分割，将窗口分割成左右两部分。也可以写成 `:vsplit` |
| `Ctrl-w Ctrl-w` | 在分割视图窗口间切换 |
| `Ctrl-w j` | 移动到下方视点 |
| `Ctrl-w k` | 移动到上方视点 |
| `Ctrl-w h` | 移动到左方视点 |
| `Ctrl-w l` | 移动到右方视点 |
| `Ctrl-w =` | 重新设置视点窗口到相等大小 |
| `Ctrl-w -` | 减小当前视点窗口，每次减少一行 |
| `Ctrl-w +` | 增大当前视点窗口，每次增加一行 |
| `Ctrl-w q` | 关闭激活的窗口 |
| `Ctrl-w r` | 将窗口旋转到右方 |
| `Ctrl-w R` | 将窗口旋转到左方 |

# shell交互窗口

[Conque-Shell](https://github.com/jewes/Conque-Shell)插件提供了在分割窗口中的交互shell。[conque.vim](https://github.com/wkentaro-archive/conque.vim)是使用说明。不过这个功能需要安装插件，并非所有vim都可以直接使用。

> 比较简单的方法还是在screen中使用vim，利用screen的窗口分割功能来使用 shell。

# 参考

* [Vim tips: Using viewports](https://www.linux.com/learn/vim-tips-using-viewports)
* [VIM的分屏功能](https://coolshell.cn/articles/1679.html)