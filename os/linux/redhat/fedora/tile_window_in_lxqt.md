LXQt是已经轻量级的桌面环境，默认使用的Openbox作为窗口管理器，Openbox没有内建平铺窗口的功能，所以实现类似Windows的平铺窗口比较折腾。

[Tiling windows in GNOME](https://unix.stackexchange.com/questions/305/tiling-windows-in-gnome)介绍了一些解决思路：

* 将窗口管理器替换成compiz，则可以利用Compiz Settings manager和插件Grid来实现，这样就可以非常方便使用`Ctrl+Alt`结合数字键移动和改变窗口贴合格子。
* 如果不使用compiz则可以使用[x-tile](http://www.giuspen.com/x-tile/)，这个工具介绍显示适用于多种桌面环境，包括LXDE。但是，我在LXQt环境中会遇到Segment Fault。

[Poor man's Tiling Window manager](https://bbs.archlinux.org/viewtopic.php?id=64100)绍了一个[stiler.py](http://github.com/soulfx/stiler)通用的平铺窗口python脚本，其工作原理是通过wmctrl（一种命令行获取窗口和桌面信息以及管理窗口的工具）来平铺窗口。适用于兼容wm窗口的窗口管理器，例如pekwm, openbox, metacity 和 compiz。

* 从 http://github.com/soulfx/stiler 下载stiler.py，存放到/usr/bin目录

```
Standard layout_options:
simple          - The basic tiling layout . 1 Main + all other at the side.
swap            - Will swap the active window to master column
cycle           - Cycle all the windows in the master pane
vertical        - Simple vertical tiling
horizontal 	    - Simple horizontal tiling
maximize        - Maximize the active window/ for openbox which doesn't permit resizing of max windows
max_all         - Maximize all windows

Grid layout_options:

The following grid options mimic the functionality of compiz's grid plugin which in turn mimics the functionality of winsplit revolution.

top_left        - Place the active window in the top left corner of the screen
top             - Place the active window along the top of the screen
top_right       - Place the active window in the top right corner of the screen
left,right      - Does the new windows7 ish style of sticking to the sides.
middle          - Place the active window in the middle of the screen
bottom_left     - Place the active window in the bottom left corner of the screen
bottom          - Place the active window along the bottom of the screen
bottom_right    - Place the active window in the bottom right corner of the screen
swap_grid       - Swap the active window with the largest window
```

* 安装依赖软件`wmctrl`

```
yum install wmctl
```

* 使用LXDE内建的快捷键来驱动平铺模式

> 不过，在LXQt中使用上述方式平铺窗口，窗口定位不是非常准确，有可能需要连续按2次才能正确定位。

> 我最终将工作平台转换到Xfce，xfce桌面内建支持平铺窗口，只需要定义快捷键就能非常方便地使用，所以更为推荐xfce。
