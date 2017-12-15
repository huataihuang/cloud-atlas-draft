创建Android模拟器时，需要下载和安装Android System Image。但是在墙内，这个安装过过程是非常缓慢甚至难以完成的。

所以考虑通过手工翻墙下载镜像文件后，再在离线方式安装。

> 下载镜像的URL链接是通过启动AVD创建时从下载过程日志记录可以找到。

Android的x86镜像是由Intel提供的，参考[Intel® Atom™ x86 Image for Android* 4.4 KitKat Installation Instructions - Manually](https://software.intel.com/en-us/android/articles/intel-atom-x86-image-for-android-4-4-kitkat-installation-instructions-manually)，手工安装的方法是将下载的镜像zip文件解压缩到`~/Android/Sdk/system-images`目录下。


* x86_64-25_r10.zip - `~/Android/Sdk/system-images`

```
mv x86_64-25_r10.zip ~/Android/Sdk/system-images/android-25/
cd ~/Android/Sdk/system-images/android-25/
unzip x86_64-25_r10.zip
```

然后再通过`Tools => SDK Manager`查看，并勾选`Show Package Details`就可以看到系统已经安装了`Google APIs Intel x86 Atom_64 System Image`

> 以下以此类推

* x86-26_r07.zip

```
mv x86-26_r07.zip ~/Android/Sdk/system-images/android-26/
cd ~/Android/Sdk/system-images/android-26/
unzip x86-26_r07.zip
```

* x86-27_r02.zip

```
mv x86-27_r02.zip ~/Android/Sdk/system-images/android-27/
cd ~/Android/Sdk/system-images/android-27/
unzip x86-27_r02.zip
```

> 但是尚未解决Fedora 27 x86_64平台运行Android模拟器crash的问题，暂时直接使用真机测试。

# 参考

* [Installing Intel x86 Atom System Images offline (manually) for Android](https://stackoverflow.com/questions/23024685/installing-intel-x86-atom-system-images-offline-manually-for-android)