Android Go是面向低端设备的轻量级优化Android系统，能够在1GB 或以下设备上提供更加流畅的体验；且同时也更节省存储空间以及数据流量。

我非常喜欢Nexus 5手机，不仅屏幕素质高，而且手感轻巧使用舒适。不过，由于这款手机已经推出时间太久，使用者逐渐减少，即使著名的lineageOS也已经放弃官方维护ROM了。

不过，既然Android系统是开源的，并且[lineageos](https://lineageos.org)也提供了[How to build LineageOS for the Google Nexus 5](https://wiki.lineageos.org/devices/hammerhead/build)指导手册。我[已经成功从源代码构建了lineageos for hammerhead](build_lineageos_for_hammerhead)，本次我将尝试再次构建，并通过开启[Low-RAM Property Patcher](https://forum.xda-developers.com/android/software-hacking/mod-low-ram-property-patcher-android-t3737373/post75250716#post75250716)将Android 8.1 变成 Android Go。

> [How-to Automate Your ROM Build Process Using Jenkins - Setup Nightlies](https://forum.xda-developers.com/showthread.php?t=2467004)和[Setting up Jenkins for building nightlies](https://docs.omnirom.org/Setting_up_Jenkins_for_building_nightlies) 可以作为参考，通过持续集成平台来实现自动编译Android

# 参考

* [轻量版的原生 Android 好用吗？我用自己的手机体验了 Android Go](https://zhuanlan.zhihu.com/p/33890271)