每天背着笔记本移动办公已经成为常态，然而对身体却是沉重的负担，并且也没法利用上下班途中做些锻炼。

其实，最好的移动办公是通过"云"来实现的，以下是我的一些建议，我准备用一周的时间来实践并适应这样的移动生活：

* DropBox作为主要文档同步云：日常活跃编辑的文档都存放在DropBox目录，实现近乎实时的精确同步。
* iCloud作为辅助文档同步云
* 文档阅读和积累通过EverNote实现
* 浏览器使用同步：Tabs和BookMark同步，FireFox和Safari都支持较为完善

# DropBox作为主要文档同步云

最好的云存储同步可能还是第三方云：

* DropBox同步迅速准确，不会出现文件保存很久其他设备上依然没有同步获取数据的情况。虽然苹果的iCloud已经有了长足的进步，但是在文件同步上似乎没有做到实时，很多时候保存的文件很久依然没有同步到云上，导致合上笔记本后（休眠），在另外的设备上却没有最新的副本。
* DropBox跨平台特性将文件同步带到了Linux/Windows/Mac上，使得我这样在Mac/Linux平台切换工作的人如鱼得水。

> 我有时候也会在FreeBSD上工作，不过，没有原生支持FreeBSD的DropBox客户端。[Dropbox on FreeBSD](https://icesquare.com/wordpress/dropbox-with-freebsd/)提供了一些可行的思路：
  * 使用Linux作为服务器同步DropBox，然后通过FreeBSD的NFS客户端挂载Linux输出的DropBox目录，这样文件也就可以直接在FreeBSD上读写访问了。
  * 现在的FreeBSD已经开始支持类似KVM的虚拟化技术，所以应该能够比较平滑地运行一个轻量级的Linux来作为DropBox云存储客户端。

# iCloud作为辅助文档同步云

虽然iCloud使用体验较差，同步不是很及时。但是其具备了和操作系统紧密结合的特性，并且iPhoto相册同步也较为完善（支持在云端保存原始文件，本地智能保存原文件或缩略文件）。对于使用苹果全系列产品更有巨大优势：文件可以跨iOS/MacOS访问，对于日常摄影非常方便。

此外，苹果iCloud存储价格较DropBox经济，所以尽管文件同步不是很迅速，但是在国内墙掉了DropBox和Google Drive的情况下，算是综合较好的云存储。

使用`rsync`工具，定时将`DropBox`目录中的文件同步到`Documents`目录下，iCloud就能够同步到云上，这样相当于同时在DropBox和iCloud中做了云备份。

结合本地局域网的苹果非常完善的TimeMachine备份，就可以实现整个操作系统的再备份。这样重要数据可以实现4个备份 - DropBox / iCloud / 家中的TimeMachine备份 / 公司的TimeMachine备份，数据安全性就比较高了。

# 文档阅读和积累通过EverNote实现

EverNote是跨Windows/Mac的文档管理平台，并且支持浏览器完整文档保存，以及第三方程序文档共享保存（例如我最常用的RSS阅读工具）。这对搜集资料非常有用，而且支持移动设备，随时随地可以查看和修改，同步迅速。

# 浏览器使用同步

主要使用Safari和Firefox，两者都支持通过云同步Tabs和BookMark。使用方法类似，以下对Safari进行详细解释。

只要在不同设备中都登录了相同的iCloud账号，Safari就自动开始Tabs和BookMark同步。

不过，并不是在所有设备中同时打开完全相同的Tabs（这里有些不直观），而是在点击`Tabs`缩略图按钮时，滚动到最下方，就会显示出不同设备上当前打开的Tabs列表。每点击一个Tabs就会打开一个别的设备上当前打开的页面。不过，并没有提供一次打开所有其他设备上的Tabs的方法。

这里有一个变通的方便地打开多个其他设备上Tabs方法（参考 [Open all iCloud tabs from iPhone on Mac](http://apple.stackexchange.com/questions/266288/open-all-icloud-tabs-from-iphone-on-mac)）

* 添加iCloud Tabs按钮到Safari工具条上（可能需要使用`Customize Toolbar...`功能）
* 点击`iCloud Tabs icon`，然后在按下 `⌘` 键的同时，依次点击列表中的各个tab，这样就会相对方便地打开其他设备上当前正在使用的页面

> FireFox也支持类似的Tabs同步，不过相对Safari的完善同步功能，FireFox似乎只支持了一个Window中的多个Tabs同步，如果同时开了多个FireFox窗口，则并不是所有窗口中的Tabs都同步。Safari没有这个问题。