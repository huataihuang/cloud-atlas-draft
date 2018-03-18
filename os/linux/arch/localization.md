# 基本中文支持

要正确显示中文，必需设置正确的locale并安装合适的中文字体。

## ocale设置

### 安装中文locale

Linux中通过locale来设置程序运行的不同环境。

推荐使用`UTF-8`的locale。对于`glibc（>=2.3.6）`，需要修改`/etc/locale.gen`文件来设定系统中可以使用的`locale`（取消对应项前的注释符号「#」即可）：

```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```

> 我实际只使用`en_US.UTF-8 UTF-8`

然后执行`locale-gen`命令，便可以在系统中使用这些`locale`。可以通过`locale`命令来查看当前使用的`locale`：亦可通过`locale -a`命令来查看目前可以使用的`locale`。

### 用中文locale

Arch Linux中，通过`/etc/locale.conf`文件设置全局有效的locale：

```
LANG=en_US.UTF-8
```

对于特定用户，还可以在`~/.bashrc`、`~/.xinitrc`或`~/.xprofile`中设置自己的用户环境。不同之处在于：

* `.bashrc`: 每次终端登录时读取并运用里面的设置。
* `.xinitrc`: 每次startx启动X界面时读取并运用里面的设置
* `.xprofile`: 每次使用gdm等图形登录时读取并运用里面的设置

# 中文字体

可以使用`wqy-microhei`或者其他开源字体。

系统字体将默认安装到`/usr/share/fonts`。如果没有root权限或只打算自己使用某些字体，可以直接复制这些字体到`~/.fonts`目录（或其子目录）下面，并把该路径加入`/etc/fonts/local.conf`中。

# 参考

* [Arch Linux Localization (简体中文)](https://wiki.archlinux.org/index.php/Arch_Linux_Localization_(简体中文))