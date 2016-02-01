# 传输文件

默认的Android 4.x，当USB连接到主机时，有两种模式：

* Media device(MTP)
* Camera(PTP)

使用Camera模式的时候，Android(Nexus)表现为类似一个数码相机，可以用来传输照片。

不过，要传输文件到Nexus手机中，需要使用MTP模式，并且需要下载[android filetransfer](https://www.android.com/filetransfer)安装：

* 安装Android File Transfer
* 启动Android File Transfer，如果提示找不到Device，则打开Nexus手机，从下拉快捷菜单选择`Touch for other USB options`项，将`Camera(PTP)`模式修改成`Media device(MTP)`模式，就可以看到自动打开了文件管理器，可以拖动文件传输到设备中。

> 最高支持4GB文件传输

# 参考

* [Transfer music from a computer to a device](https://support.google.com/googleplay/answer/1101500?hl=en)

