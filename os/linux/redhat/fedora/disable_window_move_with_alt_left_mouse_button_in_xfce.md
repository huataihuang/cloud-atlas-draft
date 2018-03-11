最近将Fedora的工作桌面由LXQt切换到Xfce，确实感觉桌面环境相对较为完善一些，比较省时省心。不过，意外发现，Xfce默认采用`Alt+鼠标左键`来拖放窗口。这个快捷键实际上和Jegbrains系列开发工具是冲突的，因为Jetbrains使用`Alt+鼠标左键`来实现列编辑功能。

比较简单的方法是使用Xfce设置功能：

`settings > settings manager > window manager tweaks > accessibility` 就可以设置替换alt键来移动窗口，或真就选择`None`来关闭这个功能。

![关闭Alt+鼠标右键移动窗口](../../../../img/os/linux/redhat/fedora/gxcFx.png)

或者也可以使用`xfconf-query`来设置`easy_click`成`none`或其他键：

```
xfconf-query -c xfwm4 -p /general/easy_click -s none
```

# 参考

* [How do I disable window move with alt + left mouse button in Xubuntu?](https://askubuntu.com/questions/270032/how-do-i-disable-window-move-with-alt-left-mouse-button-in-xubuntu)