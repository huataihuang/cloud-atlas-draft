screen和tmux都是Unix/Linux上著名的多路复用终端管理程序，不过，我个人感觉使用还是有些复杂和不太方便，不仅`ctrl-a`快捷键非常拗手，而且需要做一些定制配置才能舒适地使用。

[byobu](http://byobu.org/)是一个更为易用的screen/tmux包装脚本，用于加载基于文本的窗口管理器（既可以是screen，也可以是tmux）。默认就在状态栏提供系统信息显示，以及状态通知。也激活了多tab终端绘画，而且提供了简洁的快捷键。

> 如果在byobu中按下`ctrl+a`，则会立即提示你希望使用screen还是emacs的快捷键，非常人性化。我选择screen，则后续就完全兼容screen的快捷键。甚至你可以忘记在使用byobu，而以为自己在使用screen。

byobu默认使用`tmux`作为后端，但是可以通过工具`byobu-select-backend`修改。

byobu默认快捷键：

* F2 - create a new window
* F3 - Go to the prev window
* F4 - Go to the next window
* F5 - Reload profile
* F6 - Detach from the session
* F7 - Enter scrollback mode
* F8 - View all keybindings
* F9 - Configure screen-profiles
* F12 - Lock this terminal

在[Byobu](http://byobu.org/)官方网站提供了一个视频详细介绍了使用方法，非常直观：

[Byobu使用视频](https://youtu.be/NawuGmcvKus)

# 参考

* [What are useful .screenrc settings?](https://serverfault.com/questions/3740/what-are-useful-screenrc-settings)
* [Ubuntu Jaunty Testing: screen-profiles](http://blog.dustinkirkland.com/2009/01/ubuntu-jaunty-testing-screen-profiles.html) - byobu在早期版本名为screen profiles