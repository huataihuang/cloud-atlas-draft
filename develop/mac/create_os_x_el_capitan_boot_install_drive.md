Mac OS X支持在线安装操作系统：在按下电源的同时安装`option`建，就可以选择无线网络，通过在线方式启动进行安装恢复操作系统，不需要使用传统的安装U盘。不过，有时候为了能够方便反复安装，也可以现在OS X系统制作U盘。

从App Store下载的操作系统，是存储在本机的，需要转换到U盘。

* 重命名U盘:

可以使用Disk Utility工具将U盘格式化成一个命名为`ElCapInstaller`的U盘符

* 在终端输入如下命令创建启动安装U盘

```bash
sudo /Applications/Install\ OS\ X\ El\ Capitan.app/Contents/Resources/createinstallmedia --volume /Volumes/ElCapInstaller --applicationpath /Applications/Install\ OS\ X\ El\ Capitan.app --nointeraction
```


# 参考

* [How to Create a OS X El Capitan Boot Installer USB Flash Drive](http://osxdaily.com/2015/09/30/create-os-x-el-capitan-boot-install-drive/)