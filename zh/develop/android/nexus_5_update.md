# Nexus 5

2016年初，在Nexus 5发布2年之后，终于拿到了这款原生手机，可以追随Google Android的版本前进的脚步了。

> Google服务已经被墙，以下所有操作都需要首先确保已经正确翻墙。

# 强制升级

开机以后，因为网络没发就绪（在公司内网需要安装802.1x认证的安全软件），所以跳过了Google注册。网络就绪以后，通过[VPN翻墙连接到Goolge注册账号](prepare_android_develop_environment.md)，完成后依然发现在`Setting => About phone => System updates`中显示

	Your system is up to date.
	Last checked for update on 1/1/1970

这个问题的原因是因为`Google Services Framework`中的残留数据使得系统认为自己已经检查过最新的软件版本（我怀疑和最初手机没有连接网络使用ntp进行同步时钟有关，或者是对时间判断的bug，因为`System updates`检查的时间停留在Unix元年。

处理的方法参考[How To Force Your Nexus 4 or Android Device To Update To Jelly Bean 4.2.2](http://www.techfleece.com/2013/02/16/how-to-force-your-nexus-4-to-update-to-jelly-bean-4-2-2/)，下文图片采用的是该参考文档中图片，实际操作以系统为准。

* 从下拉快捷方式中点击`settings`

![nexus 5 升级 1](/img/develop/android/nexus_5_update_1.png)

* 选择`Apps`菜单

![nexus 5 升级 2](/img/develop/android/nexus_5_update_2.png)

* 然后选择`ALL`（需要选择所有程序进程才能找到`Google Services Framework`）

![nexus 5 升级 3](/img/develop/android/nexus_5_update_3.png)

* 点击`Clear data`按钮清除数据

![nexus 5 升级 4](/img/develop/android/nexus_5_update_4.png)

* 清理完数据以后，再点击`Force stop`按钮停止`Google Service Framework`（这样下次`System updates`检查才会启动一个新的进程）

![nexus 5 升级 5](/img/develop/android/nexus_5_update_5.png)

* 返回到`Setting => About phone => System updates`，从新点击一次`Check now`按钮，强制再次启动版本更新检查

![nexus 5 升级 5](/img/develop/android/nexus_5_update_6.png)

此时就会看到检查到Android新版本 5.0.1 ，则可以升级到 Android 5.x，再升级到后续的新版本。

> 有关[Nexus 5升级Android 6.0.1评测](http://www.gottabemobile.com/2016/01/12/nexus-5-android-6-0-1-update-january/)，看来这款老硬件升级到最新系统还是很流畅的

# 通过`Factory Images for Nexus Devices`升级系统

由于OTA升级方式需要翻墙，网络速度非常缓慢，并且需要先升级到5.0.1，才能再升级到6.x。整个下载过程过于缓慢，几乎无法完成。所以最后还是采用从 [Factory Images for Nexus Devices](https://developers.google.com/android/nexus/images?hl=en) 下载对应 Nexus 5 的镜像来安装。

要实现使用系统镜像来刷新设备，需要使用`fastboot`工具，可以从以下两种方式之一来获得：

* 从[Android Open Source Project](https://source.android.com/)获取完整的开发版本
* 从[Android SDK](https://developer.android.com/sdk)的`platform-tools/`下获取该工具。确保从[SDK Manager](http://developer.android.com/tools/help/sdk-manager.html)获取了最新的 **Android SDK Platform-tools**

> 参考[IntelliJ IDEA 15.0 Help: Prerequisites for Android Development](https://www.jetbrains.com/idea/help/prerequisites-for-android-development.html)，由于我已经安装和使用了IntelliJ IDEA，所以只需要下载`SDK Tools`

## 使用`sdk-manager`

从[Download Android Studio and SDK Tools](https://developer.android.com/sdk/index.html#top)下载最新版本的独立的[SDK Tools](https://developer.android.com/sdk/index.html#Other)。

我使用的是Mac OS X，所以下载的`android-sdk_r24.4.1-macosx.zip`解压缩以后目录是`android-sdk-macosx`，将这个目录存放到`~/`下（选择自己的HOME目录是为了方便普通用户身份访问）。

在Intellij中创建一个新项目，选择Android

![Intellij中创建一个新Android项目](/img/develop/android/intellij_new_android_project.png)

点击`Next`，在下一步设置`Android SDK Location`时填写前面下载的SDK Tools目录，例如这里`/Users/huatai/android-sdk-macosx`

![Intellij中设置Android SDK位置](/img/develop/android/intellij_android_sdk_location.png)

在下一步选择`Launch SDK Manager`

![Intellij中launch SDK Manager](/img/develop/android/intellij_launch_sdk_manager.png)

在`SDK Manager`中，默认选择安装SDK 6，使用默认安装的软件包就可以开发Android 6的应用软件了，其中也包含了`Android SDK Platform-tools`

![Android SDK Platform-tools](/img/develop/android/sdk_manager_platform-tools.png)

> 上述安装过程即满足了刷新Android Image需求，同时也是[准备Android开发环境](prepare_android_develop_environment.md)的过程

如果使用Mac(如我)在 `~/.bash_profile` 配置中添加

	if [ -d "<path-to-sdk>/platform-tools" ] ; then
	  export PATH="<path-to-sdk>/platform-tools:$PATH"
	fi

> 注意：`<path-to-sdk>`要换成实际的SDK目录。对于Window/Linux用户，请参考 [Installing adb & fastboot](https://wiki.cyanogenmod.org/w/Doc:_adb_intro#Installing_adb_.26_fastboot)

然后执行`. ~/.bash_profile`或退出重新登录使环境生效

此时，执行

	adb devices

应该看到连接在USB上的Nexus设备。如果没有看到连接设备，则参考下一步`激活USB Debugging`步骤

## 激活Nexus设备的`USB debugging`模式

执行`adb devices`时候可能遇到报错`error: no devices found`

> 很多在Windows平台刷机的建议都是重新安装驱动（[How to fix: Error device not found with ADB.exe](http://stackoverflow.com/questions/10705089/how-to-fix-error-device-not-found-with-adb-exe)）或者尝试升级Windows驱动/将`USB Computer connection`更改成`Camera (PTP)`模式（[ADB No Devices Found](http://stackoverflow.com/questions/15721778/adb-no-devices-found)）

尝试重新adb服务

	ps aux | grep adb | grep -v grep

可以看到如下`adb`服务

	huatai          48149   1.3  0.0  2475576   3872 s003  S    12:54AM   1:22.39 adb -P 5037 fork-server server --reply-fd 4

停止服务

	adb kill-server

再次启动服务

	adb start-server

不过，实际的原因是 **需要在Nexus设备先激活开发者模式（`developer options`），然后再启用`USB debugging`或`Android Debug Bridge`（** 

* [激活开发者模式方式](https://wiki.cyanogenmod.org/w/Doc:_developer_options)方法如下：
	* 在`Settings`中，选择`About phone`
	* 连续点击`Build number`项`7`次，此时会有一个提示`You are now a developer.`
	* 返回`Settings`，此时就多了一个`Developer options`
* 在`Developer options`点击选择`USB debugging`激活Debug模式，此时会提示具有风险（可以直接通过USB安装软件），确认激活

此时，在此使用`adb devices`命令检查设备，可以看到

	List of devices attached
	02211e9ec9623837	device

## 使用`adb`更新设备系统

* 将设备通过USB连接到主机
* 使用以下方式之一将设备启动到`fastboot`模式
	* 使用`adb tool`在设备启动的状态下执行如下命令
	
			adb reboot bootloader
	* 使用设备组合键：关闭设备电源，在启动设备时迅速按下[相关键](https://source.android.com/source/building-devices.html#booting-into-fastboot-mode)。例如，对于Nexus 5设备，启动时同时按下`音量的上下键`和`电源键`

使用`adb reboot bootloader`命令之后，Nexus设备会显示一个躺着打开前胸面板的Android机器人，并且提示

	FASTBOOT MODE
	...
	SECURE ROOT - enabled
	LOCK STATE - locked

上述界面表示正处于锁定状态，则执行下一步 "通过以下命令将设备的`bootloader`解锁"

* 通过以下命令将设备的`bootloader`解锁

		fastboot oem unlock

> 解锁bootloader对于开发者和玩家很有用，可以直接访问设备的个人数据定制个人ROM，详细步骤参考[How to unlock Nexus 5 bootloader: the first step for modding](https://www.androidpit.com/how-to-unlock-nexus-5-bootloader)

这时设备会提示确认屏幕(unlock以后，可以安装定制的操作系统) **`注意，确认后设备上的所有数据被清除`**

使用`音量键`将高亮确认键移动到`Yes`上，然后按下`电源键`确认执行`unlock`

此时设备屏幕上显示`LOCK STATE - unlocked`一行小`红字`，表示解锁成功，现在就是解锁状态的`FASTBOOT MODE`了。可以开始刷入新系统了。

* 打开一个终端窗口，进入到已经解压缩镜像的目录
* 执行`flash-all`脚本，这个脚本将安装必要的`bootloader`，`baseband firmware(s)`和操作系统

	./flash-all.sh

> 刷机时间约2分钟

* 重启设备
* 设备重启后，处于安全原因，可以重新锁定`bootloader`

		fastboot oem lock

# 启动无法通过`Checking connection...`

刷机后启动，在首次启动时，需要连接Google服务进行注册。但是由于在景德镇，`Checking connection...`页面会一直卡住无法跳过。参考[Can't get past Lollipop Tap & Go setup screen](http://forum.xda-developers.com/nexus-7/help/past-lollipop-tap-setup-screen-t2937814)

    From Lollipop, Google wants user has a working net connection to boot up. 
    Prob 1, Your wifi has an active firewall to prevent accessing google servers.
    Prob 2, You don't have a sim card or data plan.

解决的方法是：插入一张SIM卡，即使这张SIM卡无法使用（例如，我发现电信的4G卡无法使用，扫描不到2G/3G/4G网络），只要Nexus识别到有SIM卡，就会允许跳过WIFI方式连接Google服务，这样也就避免了最初设备初始化时候尴尬的页面。

# 参考

* [How To Force Your Nexus 4 or Android Device To Update To Jelly Bean 4.2.2](http://www.techfleece.com/2013/02/16/how-to-force-your-nexus-4-to-update-to-jelly-bean-4-2-2/)
* [cyanogenmod: adb intro - "Device not found" errors](https://wiki.cyanogenmod.org/w/Doc:_adb_intro#.22Device_not_found.22_errors)
* [How to unlock Nexus 5 bootloader: the first step for modding](https://www.androidpit.com/how-to-unlock-nexus-5-bootloader)