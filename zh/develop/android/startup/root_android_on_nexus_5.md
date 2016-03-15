> 对于Android开发，是不需要Root Android就可以进行，只需要开启"Developr options"就可以了。Root Android的目的是为了增加可玩性，例如在Android上[部署Linux](../../../develop/android/linux/deploy_linux_on_android.md)

Root Android和苹果设备的Jailbreak不是一个概念

# 通过Wug's Nexus Root Toolkit实现root android

[Rooting your Android](http://www.androidcentral.com/root)文档提供了各种Android设备的Root方法的索引，其中[How to root your Nexus 5](http://forums.androidcentral.com/nexus-5-rooting-roms-hacks/395976-how-root-your-nexus-5-a.html?_ga=1.178022885.1748389412.1454345441#post3686843)介绍如何root Nexus 5设备。

如果是Windows操作系统，[Wug's Nexus Root Toolkit](http://www.wugfresh.com/nrt/)，可以非常方便实现快速的Root。不过，对于Mac/Linux用户，可以参考[Is there a version of your toolkit for Mac/Linux yet?](http://www.wugfresh.com/faqs/is-there-a-mac-nexus-root-toolkit/)，其实就是通过虚拟机来运行Windows系统，再运行这个Root Toolkit。

# 通过ADB方式手工root android

上述的root android依赖特定工具，实际上隐藏了技术细节。如果是Mac/Linux系统，可以通过手工方法，使用ADB来传输root镜像实现root Android目的。

通过root android，可以在系统级别调优，甚至可以完全替换操作系统。此外，通过root Android，将获得在Linux内核上运行桌面OS的权限，也就是可以修改系统或者安装unapproved组件。当获得root访问权限之后，可以对设备进行完整的备份和恢复，意味着可以将系统完整复制到新的手机或者平板中。同时也具有了安装自定义ROM，如[CyanogenMod](http://www.cyanogenmod.org/)或者[Paranoid Android](http://www.paranoidandroid.co/)（一种定制ROM用于扩展和增强Android）。

## 如何Root Android

root过程要根据不同的设备来调整，但是，第一个步骤都是相同的，即unlock，也就是绕过bootloader。bootloader是设备启动时第一个运行的程序，它会验证所有运行在手机上的软件。所以要安装root软件包，需要首先屏蔽bootloader。

注意：请先备份数据，unblock bootloaders将擦除设备上的内容！

* 下载和安装[Android SDK](http://developer.android.com/sdk/index.html)并安装USB驱动包和Android tools

> 请参考 [升级Nexus 5系统](nexus_5_update.md) 中相关步骤完成上述安装过程

**使用Android Debug Bridge (ADB)**

* 将设备通过USB连接到主机

```bash
adb devices
```

需要看到设备清单

```
List of devices attached
02211e9ec9623837	device
```

* 使用`adb tool`在设备启动的状态下执行如下命令

```bash	
adb reboot bootloader
```

* 通过以下命令将设备的`bootloader`解锁

```bash
fastboot oem unlock
```

这时设备会提示确认屏幕(unlock以后，可以安装定制的操作系统) **注意，确认后设备上的所有`用户`数据被清除** ，此时系统会回到出厂状态（相当于新的手机）。

使用`音量键`将高亮确认键移动到`Yes`上，然后按下`电源键`确认执行`unlock`

此时设备屏幕上显示`LOCK STATE - unlocked`一行小`红字`，表示解锁成功，现在就是解锁状态的`FASTBOOT MODE`了。可以开始刷入新系统了。

> 上述步骤我在[升级Nexus 5系统](nexus_5_update.md)时候已经全部做过了，所以当前操作都跳过这些。如果你是第一次操作，则需要完成上述步骤。

* 在电脑上下载 [TWRP recovery](http://teamw.in/project/twrp2) **或者** [ClockWorkMod](http://www.clockworkmod.com/rommanager)（需要根据不同设备进行下载）以及[SuperSU](http://forum.xda-developers.com/apps/supersu)软件包（可以从xda developers论坛SuperSU板块找到最新版本）。

> [TWRP Manager (Requires ROOT)](https://play.google.com/store/apps/details?id=com.jmz.soft.twrpmanager)也可以从Google Play Store安装
>
> [ROM Manager](https://play.google.com/store/apps/details?id=com.koushikdutta.rommanager)也可以从Google Play Store安装 （版本似乎旧一些）
>
> [SuperSU](https://play.google.com/store/apps/details?id=eu.chainfire.supersu) 也可以从Google Play Store安装

从Google Play Store安装的免费版本有内购（主要是用于去除广告），但功能不受影响，所以可以直接安装使用。

SuperSU是在rooted之后才能安装使用，实际进行root的是TWRP或ClockWorkMod。

从 [[BETA][2016.02.28] SuperSU v2.68](http://forum.xda-developers.com/apps/supersu/2014-09-02-supersu-v2-05-t2868133) 看，推荐使用TWRP。[TWRP是一个开源的社区项目](https://github.com/omnirom/android_bootable_recovery/)，并且持续活跃开发。通过TWRP，可以安装完全定制的ROM，如[OmniROM](http://omnirom.org/)，这是一个非常有意思的开源项目。

我的实际操作如下：

* 下载 http://download.chainfire.eu/supersu-stable ，然后通过ADB将文件传输到手机设备中
* 从 [TWRP device list](https://twrp.me/Devices/) 下载对应于设备的文件，例如，我使用的[LG Nexus 5 (hammerhead)](https://twrp.me/devices/lgnexus5.html)，请参考其中文档下载[twrp-3.0.0-0-hammerhead.img](https://dl.twrp.me/hammerhead/twrp-3.0.0-0-hammerhead.img)，然后使用如下方法刷入手机

```bash
adb reboot bootloader
fastboot flash recovery twrp-3.0.0-0-hammerhead.img
```

* 断开手机和主机连接，然后使用音量键滚动选择`Recovery mode`（从`Start` => `Restart bootloader` => `Recovery mode`），然后按下电源键确认进入Recovery模式。此时手机会再次启动，启动后就会看到`TWRP`界面

`TWRP`会提示允许是否允许修改分区

![TWRP](/img/develop/android/twrp-1.jpg)

此时滑动最下方的`Swipe to Allow Modifications`，进入安装TWRP更改页面，并点击`Install`按钮

![TWRP](/img/develop/android/twrp-2.jpg)

滚动页面，选择前面传输到手机设备中的`supersu.zip`文件（具体文件名根据下载版本会不同），然后点击`Install Image`按钮

![TWRP](/img/develop/android/twrp-3.jpg)

在确认页面滑动`Swipe to confirm Flash`按钮，确认进行刷新

![TWRP](/img/develop/android/twrp-4.jpg)

刷新成功后，就可以点击`Reboot System`重启系统

![TWRP](/img/develop/android/twrp-5.jpg)

> 注意：一定要在`fastboot flash recovery twrp.img`后马上启动到Recovery模式，立即安装`SuperSU.zip`。因为很多设备第一次启动时会自动替换掉定制的recovery(`TWRP`)，就会导致前面的步骤白做了。一旦TWRP启动，TWRP就会对ROM进行补丁来避免ROM替换掉TWRP。如果你忘记了这个步骤，需要重复前面所述的安装步骤，再重头来一次。

> 今后再安装升级，可以下载最新的TWRP image存放到手机，然后再次进入Recovery模式，使用原先安装的TWRP进行`Install`就可以升级到最新版本的TWRP。

* 验证Root是否成功

在Google Play Store中安装[Root Checker](https://play.google.com/store/apps/details?id=com.joeykrim.rootcheck&hl=en)应用程序，执行这个程序来检查。该程序不会对系统做任何修改，只是验证获取Root权限是否能够成功，所以是一个安全的程序。

看到以下验证界面就表示Root设备成功了

![TWRP](/img/develop/android/twrp-6.jpg)

# root后Android升级

root过之后的Android运行和使用没有任何问题，但是会遇到一个问题，就是当Google推送系统升级的时候，每次系统启动开始打补丁总是不成功，进入Android系统之后，依然看到系统提示你要更新软件包。

在`TWRP`启动时候，注意观察，可以看到启动报错是在安装`/cache/update.zip`包时候返回了一个`Status 7`错误：

```bash
Updter process ended with ERROR: 7
Error installing zip file '/cache/update.zip'
```

截图如下：

上述`Status 7`错误的原因是因为更新软件包中的`updater-script`脚本中有一部分是检查设备型号是否和安装的ROM兼容，这部分的`updater-script`有一个称为`asserts`的部分是用来校验的。

* 将 `update.zip` 文件复制出来（对于系统目录下文件复制，需要su权限，见下文）解压缩

```bash
adb shell su
exit
adb pull /cache/update.zip
```

* 解压缩以后，进入`META-INF/com/google/android`目录，将`updater-script`复制成`updater-script.txt`，然后使用文本编辑器编辑这个文件
* 删除`assert`开头的所有行（也就是对文件进行校验的命令），然后保存文件
* 再将`updater-script.txt`重命名会`updater-script`
* 重新将文件压缩成原先的`update.zip`，并传输回

```bash
zip -r update.zip META-INF patch
adb push update.zip /cache/update.zip
```

> 上述方法对于OTA方式升级新的Android系统或者补丁包都是适用的

## 具体操作步骤

* 使用`adb`工具将Nexus 5中已经下载的`update.zip`复制出来

> `adb`使用方法参考[ADB Shell](http://adbshell.com/commands/adb-root)

检查连接设备

```bash
adb devices
```

显示输出

```bash
List of devices attached
02211e9ec9623837	device
```

检查目录

```bash
adb shell ls
```

可以看到 

```bash
...
cache
...
```

但是，尝试列出`/cache`目录文件会被拒绝

```bash
adb shell ls /cache
```

提示权限不足

```bash
opendir failed, Permission denied
```

原来要浏览设备中所有文件需要满足两个条件

* Android设备已经被root或者是使用开发设备
* 需要以root模式运行ADB，也就是执行`adb root`

> 参考 [Why do I get access denied to data folder when using adb?](http://stackoverflow.com/questions/1043322/why-do-i-get-access-denied-to-data-folder-when-using-adb)

不过，我尝试

```bash
adb root
```

提示错误

```bash
adbd cannot run as root in production builds
```

解决的方法是使用

```bash
adb shell
su
```

此时在手机屏幕上会提示是否允许授予`root`访问，点击授予权限。授权之后，就可以使用 `adb shell su`命令来执行`root`才能访问的文件了。

> 注意，如果前面补丁失败，再正常启动系统，会清理掉 `/cache` 下文件，需要重新下载 `update.zip` （通过 `Setting => About phone => System updates`）

# 参考

* [Rooting your Android](http://www.androidcentral.com/root) - 介绍通过[Wug's Nexus Root Toolkit](http://www.wugfresh.com/nrt/)快速完成
* [How to Root Android](http://www.maximumpc.com/how-root-android-2013/) - 介绍了手工操作完成root Android方法，适用所有Android设备，推荐阅读
* [How to Fix Status 7 Error While Installing OTA Update or Custom ROMs](http://www.droidviews.com/fix-status-7-error-while-installing-ota-update-or-roms/)