每天背着笔记本移动办公已经成为常态，然而对身体却是沉重的负担，并且也没法利用上下班途中做些锻炼。

其实，最好的移动办公是通过"云"来实现的，以下是我的一些建议，我准备用一周的时间来实践并适应这样的移动生活：

* DropBox作为主要文档同步云: 

# DropBox作为主要文档同步云

最好的云存储同步可能还是第三方云：

* DropBox同步迅速准确，不会出现文件保存很久其他设备上依然没有同步获取数据的情况。虽然苹果的iCloud已经有了长足的进步，但是在文件同步上似乎没有做到实时，很多时候保存的文件很久依然没有同步到云上，导致合上笔记本后（休眠），在另外的设备上却没有最新的副本。
* DropBox跨平台特性将文件同步带到了Linux/Windows/Mac上，使得我这样在Mac/Linux平台切换工作的人如鱼得水。

> 我有时候也会在FreeBSD上工作，不过，没有原生支持FreeBSD的DropBox客户端。[Dropbox on FreeBSD](https://icesquare.com/wordpress/dropbox-with-freebsd/)提供了一些可行的思路：
  * 使用Linux作为服务器同步DropBox，然后通过FreeBSD的NFS客户端挂载Linux输出的DropBox目录，这样文件也就可以直接在FreeBSD上读写访问了。
  * 现在的FreeBSD已经开始支持类似KVM的虚拟化技术，所以应该能够比较平滑地运行一个轻量级的Linux来作为DropBox云存储客户端。