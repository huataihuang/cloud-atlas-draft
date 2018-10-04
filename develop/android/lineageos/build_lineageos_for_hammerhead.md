# 安装SDK

* 从[Google下载platform-tools](https://dl.google.com/android/repository/platform-tools-latest-linux.zip)

```
unzip platform-tools-latest-linux.zip -d ~
```

此时就具备了`adb`和`fastboot`工具，则将这些工具的路径添加到`~/.profile`(或者`/etc/profile`)中：

```
# add Android SDK platform tools to path
if [ -d "$HOME/platform-tools" ] ; then
    PATH="$HOME/platform-tools:$PATH"
fi
```

然后执行 `source ~/.profile` 使得环境生效。

# 安装build包

要编译LineageOS，需要以下软件包

* `bc bison build-essential curl flex g++-multilib gcc-multilib git gnupg gperf imagemagick lib32ncurses5-dev lib32readline-dev lib32z1-dev libesd0-dev liblz4-tool libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-dev libxml2 libxml2-utils lzop pngcrush rsync schedtool squashfs-tools xsltproc zip zlib1g-dev`

对于Fedora平台，安装如下软件包参考

```
sudo dnf install screen java-1.8.0-openjdk-devel git schedtool ncurses-devel \
ncurses-libs ncurses-compat-libs ImageMagick-devel libstdc++-devel bison gnupg lzma
```

> 不同的LineageOS需要不同的JDK：

```
LineageOS 11.0-13.0: OpenJDK 1.7 (install openjdk-7-jdk)
LineageOS 14.1-15.1: OpenJDK 1.8 (install openjdk-8-jdk)
```

# 创建目录

需要设置一些目录用于build环境：

```
mkdir -p ~/bin
mkdir -p ~/android/lineage
```

> 这里`~/bin`目录用户包含`git-repo`工具（通常称为"repo"），而`~/android/lineage`目录则包含LineageOS的源代码。

# 安装`repo`命令

使用以下命令下载`repo`程序并使之可执行：

```
curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
chmod a+x ~/bin/repo
```

# 将`~/bin`目录添加到可执行路径

在`~/.profile`中（或`/etc/profile`）添加如下

```
# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi
```

执行`source ~/.profile`使环境生效。

# 初始化LineageOS源代码仓库

以下是支持Google Nexus 5的官方分支： cm-14.1

```
cd ~/android/lineage
repo init -u https://github.com/LineageOS/android.git -b cm-14.1
```

[Nexus 5 hammerhead 支持lineage os 15 (Android 8 oro)](https://www.getdroidtips.com/lineage-os-15-nexus-5/) 或者 [Nexus 5 hammerhead 支持lineage os 16 (Android 9 Pie)](https://alldroidtips.com/install-android-9-pie-on-nexus-5/) ，可以直接下载已经编译的ROM。不过，当前lineage os 16版本对nexus 5支持存在问题。（[Nexus 5 AOSP 9.0.0 r3 Pie(alpha)](https://forum.xda-developers.com/google-nexus-5/development/rom-nexus-5-aosp-9-0-0-r3-pie-t3834390)）

当前可以安装

```
repo init -u git://github.com/LineageOS/android.git -b lineage-15.1
```

# 下载源代码

使用以下命令下载源代码：

```
repo sync
```

LineageOS manifests包括repo的默认合理配置，建议使用。例如，默认配置`-j 4`和`-c`。这里`-j 4`表示4个并发线程/连接。如果同步存在问题，可以降低这个设置，如`-j 3`或`-j 2`。另外，`-c`则告诉repo只下载GitHub中当前分支而不是所有的分支代码。

> `repo sync`指令用于从LineageOS和Google更新最新的源代码。每隔即天就可以运行这个命令来同步最新的代码。

# 准备设备相关代码

源代码下载完成后，确保当前工作在源代码目录中（`cd ~/android/lineage`），然后输入如下命令：

```
source build/envsetup.sh
breakfast hammerhead
```

编译15.1遇到报错，暂时未解决。所以最后采用 [UNOFFICIAL LineageOS 15.1 for Nexus 5](https://forum.xda-developers.com/google-nexus-5/development/rom-lineageos-15-1-nexus-5-t3756643)提供的ROM刷新安装

```
build/make/core/product_config.mk:234: error: Can not locate config makefile for product "lineage_hammerhead".
```

> 与aosp编译类似，编译前同样需要引入环境，所以要执行`source build/envsetup.sh`，这样才能准备好编译，包括`croot`和`brunch`

> 上述命令将下载[设备的特定配置](https://github.com/LineageOS/android_device_lge_hammerhead)和[内核](https://github.com/LineageOS/android_kernel_lge_hammerhead)。

> 一些设备需要供应商目录，如果上述指令出现错误，则查看一下[Extract proprietary blobs](https://wiki.lineageos.org/devices/hammerhead/build#extract-proprietary-blobs)。完成后再回来再次运行[breakfast](https://wiki.lineageos.org/devices/hammerhead/build#prepare-the-device-specific-code)。

# Extract proprietary blobs

> **`注意`**在已经运行最新的LineageOS的设备上需要本步骤。如果没有这样的设备，则参考[Extracting proprietary blobs from installable zip](https://wiki.lineageos.org/extracting_blobs_from_zips.html)。(或者见下一段落编译文章)
>
> 由于我是第一次编译安装lineageOS，所以采用的是下一段`Extracting proprietary blobs from LineageOS zip files`中所用的方法。

确保Nexus 5已通过USB连接到电脑，使用ADB并且激活root。然后在`~/android/lineage/device/lge/hammerhead`目录下运行`extract-files.sh`脚本：

```
./extract-files.sh
```

此时blobs会拉到`~/android/lineage/vendor/lge`目录中。

# Extracting proprietary blobs from LineageOS zip files

> 原文见[Extracting proprietary blobs from installable zip](https://wiki.lineageos.org/extracting_blobs_from_zips.html)

专利程序（proprietary blobs）可以从一个已经运行LineageOS设备中获取，或者从一个LineageOS安装zip文件获取。

> block-based OTAs 和 file-based OTAs的区别：
>
> 在基于文件的OTA，系统分区的内容是通过名为`system`的zip文件中的一个文件夹提供的。在基于块的OTA则系统分区是存储在一个二进制数据的文件中。如果你的zip没有`system`文件夹或者根本是一个空的`system`文件夹，则一个名为`system.transfer.list`文件位于根目录，这表示你使用的是一个基于块的OTAs。这种情况下，请使用下文`"Extracting proprietary blobs from block-based OTAs"`。如果在`system`文件夹中有完整的system分区内容，并且没有`system.transfer.list`，则表明是基于文件的OTA，请参考下文的`"Extracting proprietary blobs from file-based OTAs"`

## Extracting proprietary blobs from block-based OTAs（实践记录）

* 创建临时目录并进入该目录：

```
mkdir ~/android/system_dump/
cd ~/android/system_dump/
```

* 从可安装的LineageOS zip包中解压缩出`system.transfer.list`和`system.new.dat`

```
unzip path/to/lineage-*.zip system.transfer.list system.new.dat
```

这里`path/to/`是安装zip文件所在的目录。

> 实际操作案例: Nexus 5安装 - [Info about hammerhead](https://wiki.lineageos.org/devices/hammerhead)

从 [LineageOS Downloads: Builds for hammerhead](https://download.lineageos.org/hammerhead) 下载最新的LineageOS zip包：

```
cd ~/Downloads
wget https://caesar.ftp.acc.umu.se/mirror/lineageos/full/hammerhead/20171129/lineage-14.1-20171129-nightly-hammerhead-signed.zip

mkdir ~/android/system_dump/
cd ~/android/system_dump/

unzip ~/Downloads/lineage-14.1-20171129-nightly-hammerhead-signed.zip system.transfer.list system.new.dat
```

* 现在需要`sdat2img`脚本，这个脚本可以转换基于块的OTA的内容成为可以挂载的dump：

```
git clone https://github.com/xpirt/sdat2img
```

* 执行以下命令转换system image:

```
python sdat2img/sdat2img.py system.transfer.list system.new.dat system.img
```

* 此时得到的名为`system.img`的文件，用如下命令挂载：

```
mkdir system/
sudo mount system.img system/
```

* 在完成了镜像挂载之后，进入到设备的源代码根目录下，然后运行`extract-files.sh`命令：

```
cd ~/android/lineage/device/lge/hammerhead
./extract-files.sh ~/android/system_dump/
```

以上命令告知`extract-files.sh`脚本从挂载的系统dump中获取文件，而不是从一个连接设备获取文件。

* 一旦完成私有文件的提取，则可以umount system dump，然后删除不需要的文件:

```
sudo umount ~/android/system_dump/system
rm -rf ~/android/system_dump/
```

## Extracting proprietary blobs from file-based OTAs（未实践）

* 创建临时目录：

```
mkdir ~/android/system_dump/
cd ~/android/system_dump/
```

* 从zip文件中提取`system`文件夹：

```
unzip path/to/lineage-*.zip system/*
```

* 这里`path/to/`是安装zip文件的路径

* 在提取了`system`文件夹之后，进入设备对应的源代码目录下，然后运行`extract-files.sh`脚本如下：

```
/extract-files.sh ~/android/system_dump/
```

* 完成后删除从zip提取的文件

```
rm -rf ~/android/system_dump/
```

# 开启缓存加速编译

确保使用[ccache](https://ccache.samba.org/)，如果想对所有子build加速，执行以下命令：

```
export USE_CCACHE=1
```

并将上述命令添加到`~/.bashrc`中。然后设置你希望使用的多大磁盘用于`ccache`（在android目录下）：

```
cd ~/lineage
prebuilts/misc/linux-x86/ccache/ccache -M 50G
```

这里使用50GB用于缓存。命令只需要运行一次。如果只为一个设备编译，则通常用25GN~50GB。如果为多个时被编译，并且不共享内核源代码，则需要75GB~100GB。更详细信息参考Google的[Android build environment initialization page](https://source.android.com/source/initializing.html#setting-up-ccache)

也可以激活可选的`ccache`压缩，这样会有轻微的性能下降，但是可以增加缓存中的文件数量：

```
export CCACHE_COMPRESS=1
```

# 配置jack

[jack](http://source.android.com/source/jack.html)是当前用于编译LineageOS 14.1的Java工具链。注意如果没有正确配置有可能运行时会出现out of memory，可以通过以下命令简单修复：

```
export ANDROID_JACK_VM_ARGS="-Dfile.encoding=UTF-8 -XX:+TieredCompilation -Xmx4G"
```

将上述命令添加到`~/.bashrc`中，这样就会配置Jack允许分配4GB内存。其中，`-Xmx`设置的是可申请的最大内存范围，按实际要求设置，如我是16G内存，就可以设置为12G（根据实际情况，我是通过`top`查看可用内存）。

# 开启ROOT

* 默认构建的是userdebug版本，但奇怪的是lineage居然不自带root，也没有su命令
* 如果需要支持root，需要在开始构建前设置变量

```
export WITH_SU=true
```

# 开始build

```
croot
brunch hammerhead
```

> 如果要对Build包签名，则参考[Signing Builds](https://wiki.lineageos.org/signing_builds.html)

# 安装build

编译完成后，执行以下命令进入编译包的输出目录

```
cd $OUT
```

在目录下可以找到以下两个文件：

* `recovery.img` - 即LineageOS recover镜像
* `lineage-14.1-20171201_032348-UNOFFICIAL-hammerhead.zip` - LineageOS安装包

> 接下来，则[在Nexus 5上刷自己编译的LineageOS ROM](install_lineageos_on_hammerhead)

# 遇到的错误排查

## `/bin/bash: prebuilts/misc/linux-x86/bison/bison: No such file or directory`

报错

```
FAILED: /bin/bash -c "prebuilts/misc/linux-x86/bison/bison -d  --defines=/home/huatai/android/lineage/out/host/linux-x86/obj/STATIC_LIBRARIES/libaidl-common_intermediates/aidl_language_y.h -o /home/huatai/android/lineage/out/host/linux-x86/obj/STATIC_LIBRARIES/libaidl-common_intermediates/aidl_language_y.cpp system/tools/aidl/aidl_language_y.yy"
/bin/bash: prebuilts/misc/linux-x86/bison/bison: No such file or directory
```

实际上检查却发现文件是存在的

```
$ ls -lh prebuilts/misc/linux-x86/bison/bison
-rwxrwxr-x. 1 huatai huatai 1.4M Dec  1 02:33 prebuilts/misc/linux-x86/bison/bison
```

参考 [/bin/bash: prebuilts/misc/linux-x86/bison/bison: No such file or directory](http://blog.csdn.net/uestcyms/article/details/50384779) 和 [prebuilts/misc/linux-x86/bison/bison: 没有那个文件或目录](http://blog.csdn.net/lanzhiwen/article/details/49049171) 需要安装32位兼容库。参考 [android-7.1.2_r12: prebuilts/misc/linux-x86/bison/bison: No such file or directory](https://groups.google.com/forum/?hl=id#!topic/android-building/tQ4Q0lL2R9k)，可以知道，根本原因是`prebuilts/misc/linux-x86/bison/bison`是一个非常古老的程序（32位程序），所以运行依赖32位的库文件环境：

```
$ file prebuilts/misc/linux-x86/bison/bison
prebuilts/misc/linux-x86/bison/bison: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.8, with debug_info, not stripped
```

而我们现在常用的操作系统已经运行在64位环境，参考 [What about 32bit program support on fedora 26 x86_64 installation?](https://ask.fedoraproject.org/en/question/108167/what-about-32bit-program-support-on-fedora-26-x86_64-installation/)

```
sudo dnf install glibc.i686
```

然后又出现缺少`prebuilts/misc/linux-x86/bison/bison: error while loading shared libraries: libstdc++.so.6: cannot open shared object file: No such file or directory`，则对应安装

```
sudo dnf install libstdc++.i686
```

# 参考

* [Build for hammerhead](https://wiki.lineageos.org/devices/hammerhead/build)
* [Compile LineageOS for Oneplus 3 on Fedora 25](https://uwot.eu/blog/compile-lineageos-for-oneplus-3-on-fedora-25/)
* [Build LineageOS under Fedora](http://www.demonk.cn/2017/01/23/build-lineageos-under-fedora/)