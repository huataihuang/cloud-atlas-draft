在Mac OS X（或者最新的macOS），快速锁定屏幕可以使用快捷键。此外，为了安全原因，以及节约电能（如果移动办公），快速锁定屏幕也不失为一个好方法。

要锁定屏幕，以及使用快捷键，售现需要激活macOS的Lock Screen功能。这个功能在

`System Preferences` => `Security & Privacy` => `General`面板

* 点击选择`Require password after sleep or screen saver begins`，并且在下拉选项中选择`immediately`（推荐）或者`5 seconds`作为要求密码的时间间隔。

![激活Lock Screen](../../img/develop/mac/require-password-lock-screen-mac.jpg)

# 快捷键锁屏

激活Lock Screen之后就可以使用快捷键启用锁屏

* 早期macOS版本和macbook版本：
  * 如果系统有`enject`键，就使用`Control+Shift+Eject`
  * 如果系统使用`Power`键，就使用`Control+Shift+Power`

* *macOS High Sierra 10.13或更高版本开始，快捷键有所改变：
  * `Ctrl + Command + Q` 系统自带锁屏快捷键

# 通过Hot Corner来锁屏

macOS还提供了通过Hot Corner来锁屏，也就是当鼠标移动到屏幕角上的时候触发一些动作，可以是设置锁屏或者将屏幕睡眠。

设置功能在 `System Preferences` => `Mission Control` => `Hot Corners`按钮

![激活Hot Corners](../../img/develop/mac/locking-screen-with-hot-corners.jpg)

# 通过Multi-Touch Bar

MBP 2016版取消了Power键， 无法使用锁屏快捷键Ctrl+Shift+Power。可以自定义Multi-Touch Bar，将锁屏按钮直接放到Touch Bar上，方便快捷。

方法：“系统偏好设置”>“键盘”>“自定Control Strip…”，将“锁定屏幕”图标拖拽到Touch Bar上即可。

# 参考

* [Lock a Mac Screen](http://osxdaily.com/2011/01/17/lock-screen-mac/)
* [Mac OS X 如何才能用快捷键锁屏？](https://www.zhihu.com/question/20094264)