由于工作需要，我需要运行一个macOS虚拟机，主要有几种方法运行macOS虚拟机：

* 在KVM虚拟机中运行macOS，运行在远程Linux服务上，目标是部署需要macOS支持的macOS Server，以及远程开发
* 在MacBook Pro笔记本上安装Ubuntu系统，通过KVM虚拟机运行macOS系统，运行图形应用程序，例如Office等等
* 在MacBook Pro笔记本上，先物理硬件运行macOS，并在这个物理机直接运行的macOS中运行VMware Fusion，并且VMware虚拟机中运行macOS

本文记录第三种运行方式

# 设置VM

* 创建新VM，并且选择 `Create a custom virtual machine` ，此时就可以选择 Apple OS X 类型，并选择要安装的操作系统版本。

* 通过App Store下载需要安装的macOS版本，例如 `Mojave`

* 创建一个临时的虚拟磁盘文件，然后将这个虚拟磁盘挂载：

```
hdiutil create -o /tmp/Mojave.cdr -size 12000m -layout SPUD -fs HFS+J
# 这里提示创建了文件 /tmp/Mojave.cdr.dmg

hdiutil attach /tmp/Mojave.cdr.dmg -noverify -mountpoint /Volumes/install_build
```

* 将从Mojave下载中解压缩并创建一个安装镜像：

```
sudo /Applications/Install\ macOS\ Mojave.app/Contents/Resources/createinstallmedia --volume /Volumes/install_build
```

* 完成后将这个虚拟磁盘重命名

```
mv /tmp/Mojave.cdr.dmg ~/Desktop/InstallSystem.dmg
```

* 卸载挂载

```
hdiutil detach /Volumes/Install\ macOS\ Mojave
```

*  最后一步是将安装镜像`InstallSystem.dmg`转换成iso文件:

```
hdiutil convert ~/Desktop/InstallSystem.dmg -format UDTO -o ~/Desktop/Mojave.iso
```

# 安装系统

* 回到VMware fusion，配置虚拟机的`CD/DVD (SATA)`设备，选择创建的`~/Desktop/Mojave.iso.cdr`文件

* 启动虚拟机，开始操作系统安装

注意：安装完虚拟机macOS之后，一定要安装 VMware Tools软件包（驱动更新），方法是在VMware管理窗口菜单 `Virtual Machine > Install VMware Tool` ，这样可以加速虚拟机图形界面运行。

# 参考

* [How to set-up a OSX Mojave VM in VMware Fusio](https://www.huibdijkstra.nl/how-to-set-up-a-osx-mojave-vm-in-vmware-fusion/)