Xpra是一个开源多平台远程显示管理服务器和客户端的组合，可以将远程应用显示在本地。

我的理解是这是一个X11远程显示管理工具，方便我们实现将远程X11 client应用程序显示在本地X11 server中。此外，Xpra还加入支持了VNC, NX, RDP协议，这样还可以访问Windows桌面(RDP和macOS桌面(VNC)。不过，从总体上来来说，这个工具不是一个突破性实现，应该是一个集成工具。

目前我在Linux平台上使用 Remmina 工具，暂时没有使用Xpra的经验。并且，我感觉只有Linux服务器上的X11程序才能seamless方式运行在本地，实在有些鸡肋，因为Linux上的大型桌面程序和macOS/Windows有较大差距，这样的应用场景应该不多。

不过，Jetbrains的系列开发工具是支持Linux的，实际上可以在服务器上运行Jetbrains工具，将图形界面显示在本地，这样可以充分利用远程服务器的强大计算能力，来实现大型程序的编译和开发。这也是一个开发环境搭建的思路，例如 [GUIDE: Work remotely on a Linux server from local Mac/Windows](https://medium.com/@summitkwan/guide-work-remotely-on-a-linux-server-from-local-mac-windows-f05cdc6db0e0) 完整介绍了一个在远程Linux服务器上构建数据分析（强大的CPU+GPU环境）显示在本地macOS笔记本上的工作环境，值得借鉴。

[Ubuntu社区文档 - Xpra](https://help.ubuntu.com/community/Xpra) 提供了使用案例。

[Window Switch](http://winswitch.org/) 是Xpra的图形客户端，可以方便我们使用。

# 参考

* [Xpra官方网站](https://xpra.org)