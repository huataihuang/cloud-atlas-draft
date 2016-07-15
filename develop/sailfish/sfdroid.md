[sfdroid](https://wiki.merproject.org/wiki/Adaptations/libhybris/sfdroid)可以说是非常黑科技的技术，其本质是Sailfish系统，但是提供了在Sailfish中运行Android程序的能力（`Android-in-a-Window`）。日常使用以SailfishOS为主，提供了在一个APP中完整的Android UI，实现了运行Android软件的的功能。

sfdroid支持的手机型号有两款：Nexus 4 和 Nexus 5。基本的步骤是：

* 先刷CM底包(当前采用[CyanogenMod 11.0 M11](http://www.cyanogenmod.org/blog/cyanogenmod-11-0-m11)相当于Android 4.4.4)
* 不wipe覆盖，再刷入Sailfish包
* 启动后使用的是Sailfish，但是可以在Sailfish中APP运行CM底包中的Android程序

# 基本信息

官方文档参考 [Adaptations/libhybris/Install SailfishOS for hammerhead](https://wiki.merproject.org/wiki/Adaptations/libhybris/Install_SailfishOS_for_hammerhead)。当前（20160716）较为稳定支持在CyanogenMod 11 snapshot M11之上安装Sailfish OS for Nexus 5。

详细的讨论贴见 [Sailfish OS for Nexus 5](http://forum.xda-developers.com/google-nexus-5/development/rom-sailfish-os-alpha-t2841266):

* 如果喜欢折腾，可以采用[Sailfish/Mer image build scripts](https://github.com/mer-hybris/build-script)自己来编译最新版本的SailfishOS，结合自己编译CyanogenMod CM12.1(Android 5.1)，应该更具有可玩性。
* 当前已经开始alpha状态支持base CM12.1，不过尚未release，所以建议等待官方发布base CM12.1再刷较好。 - [Do not flash sfdroid until there is a release explicitly for cm12.1 based SFOS](http://piratepad.net/bhP8fbzYgT)，[SailfishOS 2.0 Nexus 5 CM12.1 Alpha1 | Sfdroid Pre-Alpha/Early Preview](https://talk.maemo.org/showthread.php?t=96932)，不过，很多功能尚未正常工作
* [[SFOS] [DEV] sfdroid: run android in a window](http://talk.maemo.org/showthread.php?t=95631) 提供了基于CM11的SFOS 2.0.0.10

# 安装

* 有两种安装，一种是[native](https://wiki.merproject.org/wiki/Adaptations/libhybris/Install_SailfishOS_for_hammerhead#Steps_to_install)另一种是使用[multirom](https://wiki.merproject.org/wiki/Adaptations/libhybris/Install_SailfishOS_for_hammerhead#MultiROM)，后者支持多种操作系统启动。如果使用multirom，确保使用一种比较老的支持"Flash Zip"兼容Sailfish的旧版本recovery，当前推荐[TWRP_multirom_hammerhead_20150630.img](https://s.basketbuild.com/filedl/devs?dev=Tassadar&dl=Tassadar/multirom/hammerhead/TWRP_multirom_hammerhead_20150630.img)

> 参考 [SailfishOS 2.0 Nexus 5 CM12.1 Alpha1 | Sfdroid Pre-Alpha/Early Preview](https://talk.maemo.org/showthread.php?t=96932)

* 一定要在你不需要的ROM上刷SailfishOS，一旦刷机原有的ROM就不可用了

* [MultiROM v33](http://forum.xda-developers.com/google-nexus-5/orig-development/mod-multirom-v24-t2571011) 支持 Nexus5安装多个操作系统

* [How to Install CyanogenMod on the Google Nexus 5 ("hammerhead")](http://wiki.cyanogenmod.org/w/Install_CM_for_hammerhead)介绍如何在Nexus 5上安装CyanogenMod
