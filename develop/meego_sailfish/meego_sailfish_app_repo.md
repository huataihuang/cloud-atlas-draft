悲伤的Meego系统，现在已经没有官方支持了。然而，Meego是一个非常精巧的手机操作系统，即使于2011年被官方（微软收购了诺基亚手机部门之后）宣判死刑，直到今天（2019年3月）依然能够流畅地运行在Nokia N9上。

# 开启Nokia N9开发者模式

需要开启开发者模式以便能够使用RepoMirror第三方软件仓库源：选择`Settings => Security => Developer` ，然后激活 `Developer mode`。

在下载了基础包之后，手机重启，此时会发现一些扩展程序，包括Terminal。

此时再次访问 `Settings => Security => Developer` 可以安装相关开发工具包。

# 激活第三方安装允许

选择 `Settings => Applications => Installations` ，然后激活 `Allow installations form non-Store sources`

# 第三方软件仓库

由于官方关闭了软件仓库，需要从第三方软件仓库下载安装软件： [openrepos](https://openrepos.net) 提供了Meego和Sailfish的应用软件，而且提供了仓库客户端。

不过，存在的问题是安装的软件仓库客户端 Warehouse 访问仓库总是报错： `General error: 404 ` 没有找到任何应用软件。

参考 [Nokia N9 browser can't access openrepos.net (and many others wabsites)](https://talk.maemo.org/showthread.php?t=100360) 似乎和不能使用最新的TLS有关。这个俄帖子报告，在执行了 PR 1.3 reset之后，这个问题修复了。

我尝试了一下reset 恢复默认配置，Warehouse的首页依然报错，不过很奇怪，按照分类可以正常显示，而且可以搜索找到软件，也就不影响使用了。

# 开启开发者模式（可选）

第三方源，直接下载安装以下程序，就可以直接开启开发者模式

https://openrepos.net/sites/default/files/packages/721/n9repomirror_0.7.2_armel.deb

# 应用软件

* [vpnc](https://openrepos.net/content/rzr/vpnc) - cisco兼容vpn客户端
* [vpn9c](https://openrepos.net/content/too/vpn9c) - vpnc的图形界面
* [Ionic](https://openrepos.net/content/hooddy/ionic-e-book-reader) - 电子书
* [Nokia N9开启开发者模式](https://www.cnblogs.com/carlsplace/p/6266359.html)