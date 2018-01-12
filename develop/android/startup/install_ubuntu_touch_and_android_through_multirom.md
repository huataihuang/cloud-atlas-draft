> 我非常喜欢与众不同的手机操作系统，也非常享受Linux能够全面自由的掌握更多的技能的快感。Ubuntu Touch是一个纯Linux的开源手机操作系统，虽然商业运作失败，但是依然是具有吸引力的系统。
>
> 然而，生活和工作中，暂时无法离开的支付宝、Kindle商业软件以及依赖Android生态的开发工作使得我们不得不使用Android系统。显然，对于拮据且Geek的开发者来说，能够在一个手机中是先多个操作系统切换，甚至融合（如[在Ubuntu Touch中运行Android程序](../../ubuntu_touch/run_android_in_ubuntu_with_anbox)和[在Android中运行Linux](../../develop/android/linux/deploy_linux_on_android)）都是令人期待的功能。

MultiROM是一种针对Nexus 5的多重启动mod，可以启动任何Android ROM以及其他系统，如Ubntu Touch，FireFox OS, SailfishOS。除了能够从设备的内部存储启动，MultiROM还可以从通过OTG线缆连接设备的USB驱动器启动。

MultiROM的主要部分是启动管理器，每次设备启动都会让你选择需要启动的ROM。ROM是通过修改过的TWRP recovery来安装和管理的。可以通过标准的ZIP文件来安装第二个Android ROM，并且MultiRPM甚至有自己的安装器系统（通过其他Linux系统发行）。

# 安装

有以下两种安装方法：

* 通过MultiROM Manager app

最简单的安装MultiROM所需的所有组件的方法是是使用[Google Play应用商店提供的MultiROM Manager](https://play.google.com/store/apps/details?id=com.tassadar.multirommgr)，并选择MultiROM然后选择从Install/Update卡片recoery。如果状态card显示红色的"Kernel:doesn't have kexec-hardboot patch!"，则你需要安装一个已经打过补丁的内核 - 或者选择Install/Update card中的某个内核，或者从XDA下载第三方内核。你需要选择针对你主要ROM的内核，`不要`用任何你作为第二个ROM的内核，所以选择正确版本，点击"Install"将Install/Update card中所选内核安装。

> 从上述方法来看，MultiROM是采用了Linux现代内核中一种称为[kexec](https://en.wikipedia.org/wiki/Kexec)的技术来从当前运行的内核上启动一个新的内核。这个技术跳过了bootloader阶段和通过系统firmware(BIOS或UEFI)执行的硬件初始化过程，直接加载新的内核。

* 手工安装 - 分为以下三部分安装：
  * MultiROM
  * 修改过的recovery工具（TWRP_multirom_hammerhead_YYYYMMDD.img） - 使用fastboot或者[Flashify app](https://play.google.com/store/apps/details?id=com.cgollner.flashify)刷入
  * 补丁过的内核

> 手工安装方法可参考[Multi-Booting the Nexus 7 Tablet](http://www.linuxjournal.com/content/multi-booting-nexus-7-tablet?page=0,0)