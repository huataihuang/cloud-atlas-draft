# 安装JDK

```bash
emerge --ask virtual/jdk
```

如果只安装运行环境jre，则使用`emerge --ask virtual/jre`

由于一些JDK和JRE包括了Sun软件包，需要接受最终用户协议，所以如果其license（`dlj-1.1`）没有包含在`/etc/portage/make.conf`中的话，就不能自动安装。为避免受限的license，可以考虑安装`icedtea-bin`，这个是OpenJDK项目的开源Java实现。

对于在服务器上于行的Java环境，通常不需要GUI，图形，声卡或者打印等功能，则可以安装一个简化版本（也称为headless）JRE，添加USE flag 如下：

```bash
virtual/jre headless-awt -alsa -cups
```

```bash
emerge --pretend --verbose virtual/jre
```

## 配置java虚拟环境

```bash
java-config --list-available-vms
```

可以显示当前系统安装的JDK版本，并通过如下方式选择（如sun-jdk）

```bash
java-config --set-system-vm sun-jdk-1.6
```

## 安装Java浏览器插件

```bash
eselect java-nsplugin list
```

设置选择`sun-jre-bin`

```bash
eselect java-nsplugin set sun-jre-bin-1.6
```

# 安装IntelliJ IDEA

[IntelliJ IDEA](https://www.jetbrains.com/idea/)，最好的IDE，支持Gentoo Linux的Xfce桌面（实测验证并非需要官方文档要求的KDE或Gnome环境）。

下载 `tar.gz` 安装包后，解压缩到 `/opt` 目录下，然后执行程序安装目录的`bin`子目录下 `idea.sh` 就可以启动并按照指引初始化环境，之后就可以开始开发工作了。

# 参考

* [Gentoo Java](https://wiki.gentoo.org/wiki/Java)
* [Install Java JRE/JDK in gentoo and sabayon](http://www.unixmen.com/install-java-jrejdk-in-gentoo-and-sabayon/)