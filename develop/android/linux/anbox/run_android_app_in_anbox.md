# 安装Anbox

> 当前官方只支持在Ubuntu 16.04 LTS中运行Anbox，其他Ubuntu环境有可能不能正常工作。Fedora目前没有找到何时的运行方法。主要原因是：Anbox使用了定制的内核，需要启用[DKMS](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support)内核模块。

```bash
snap install --classic anbox-installer && anbox-installer
```

# 安装应用程序

目前是通过[Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb.html)来安装：

```bash
adb install path/to/my-app.apk
```