在一些日常维护操作中，会经常反复输入相同的命令，让人很是厌烦。

如何能够偷懒，使用较少的击键（如桌面快捷键）就完成一长串的文字输入呢？

X window平台提供了一个[xdotool](http://www.semicomplete.com/projects/xdotool/xdotool.xhtml)工具，可以神奇地节约不少重复击键的时间。

以下脚本存储为 `~/bin/sendtext.sh`

```bash
#!/usr/bin/bash
windowid=$(xdotool getwindowfocus)
sleep 0.1 && xdotool windowactivate --sync $windowid type 'text'
```

在LXQt管理桌面快捷键中创建一个新的快捷键`Meta-t`，则在Windows或Mac系统按下`Window`键/`Command`键加上`t`键，就会向当前窗口发送`text`这个字符串。只需要修改一下脚本，替换成你希望输入的大段文本，就可以一键输入大量的文字，堪称节约生命的神器。

# 参考

* [Keyboard Shortcut To Send Text Strings To Program](https://unix.stackexchange.com/questions/36922/keyboard-shortcut-to-send-text-strings-to-program)