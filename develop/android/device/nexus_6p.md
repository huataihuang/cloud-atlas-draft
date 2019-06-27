Nexus 6P是Google在Nexus品牌转换到Pixel之前最后一款Nexus手机，可以说是Nexus的绝唱（虽然存在很多不足）。

> 强烈建议你不要购买这款手机（即使二手非常便宜），在国内无法使用移动4G的volte。高版本的Android更新后会自动激活volte，然而运营商的volte配置没有包含，意味着这款手机只能通过2G语音通话（因为现在移动的2G/3G网络覆盖极差）升级到高版本自动启用的4G volte也是聋子的耳朵。
> 
> 以上为自己切身体验。

> 参考 [Nexus6p国际版本完整支持移动网络，大家怎么看？](https://www.zhihu.com/question/36037687) 国际版是支持移动全波段的。但是参考 [Nexus 6P (H1512) can't use VoLTE on China Mobile(CMCC)](https://support.google.com/nexus/forum/AAAANseOu18-fE4S8hNXNM/?hl=en&gpf=%23!msg%2Fnexus%2F-fE4S8hNXNM%2F_ql706WJAgAJ&msgid=_ql706WJAgAJ) 可以看到Nexus 6P无法开启VoLTE，所以使用价值大大降低。

> 我个人的使用体验来说：Nexus 6P国际版使用中国移动网络的LTE 4G功能完全没有问题，上网速度正常（较快）。但是不能开启VoLTE使得这款手机不适合作为主力机使用，如果电话量少且不在意因2G语音通话问题，可以考虑作为阅读、上网的备用机。

警告：这款手机的电池消耗极大，由于用户投诉不断，Google已经对官网渠道购买的这款手机作出赔偿。然而，这个利好消息对海淘的我们没有用处，悲伤。

# 优点

- 大屏幕（废话）

屏幕是暖色系列，偏黄。刚开始拿到手我非常不习惯，因为看惯了偏冷色系的iPhone屏幕，突然见到暖屏非常不习惯。不过各有所好，据说暖色对人眼比较友好。

- Nexus系列少有的金属机身，制作工艺较好

裸奔的手感还可以，虽然手机偏大，但和现在前后全面玻璃的重手机相比还算比较轻巧。

- 原生Android系统（废话）

由于Android社区的分裂，很多手机厂商的手机在整个生命周期都不会得到系统升级。Google的亲儿子Nexus和Pixel则较为幸运，可以得到原生升级。

然而，Google比Apple对自家设备的支持差太远了，只承诺设备上架后2年内可以得到原生升级（安全补丁），实际上版本升级只有一年（第二年只有安全补丁），这使得设备的使用价值大打折扣。

> 苹果的iOS操作系统，通常能够得到5年左右的版本升级。例如 iPhone 5是2012年9月上市（最初操作系统是iOS 6），最后一版iOS支持是2017年7月发布的10.3.3系统。基本上现有主流应用都能够使用。
>
> 从环保和实用价值来看，苹果的系统要远好于google，不论是硬件工艺和操作系统稳定性和延续性都比Android系列超出一筹。
>
> 不过，现代人对物欲的追求已经被商品经济推动到疯狂的地步了，已经忘记我们使用移动设备的目的是为了获取知识和信息。所以，不断更换手机追求酷炫外观已经使得苹果这些隐形的优势被喧嚣的国产Android机海所掩盖，甚为可惜可叹！

# 缺点

- 极差的电池

实际上Nexus 6P这款手机的电池工艺有缺陷，耗电非常迅速，导致电池衰竭非常严重。基本上一年多以后电池就报废了。甚至由于用户投诉不断，Google不胜烦扰，宣布北美和Google官网购买的Nexus 6P可以免费获得Pixel 2手机替换或者最高400美金赔偿。

> 唉，可惜我们国内通过非正常渠道购买的水货，无法享受美帝的良心赔偿了。

- 原生支持已终结

[Google已宣布放弃Nexus系列](https://www.ifanr.com/852010)，当然即使google不放弃，Nexus 6P的最后官方更新也将于2018年9月终止。不过，有一点好消息是[最后更新版本延续到了2018年12月](https://9to5google.com/2018/11/07/nexus-6p-and-5x-final-guaranteed-updates/)，所以还可以再战一程。

所以，Nexus 6P的最后官方版本是 Android 8.1 Oreo （对应LineageOS 15.1）。

之后，等 [LineageOS](https://lineageos.org/) 提供第三方支持的 Pie 9.0 系列，则可以转战LineageOS，相对可以延续使用周期。

# 官方OTA镜像升级

Google的Android官方提供了[Full OTA Images for Nexus and Pixel Devices](https://developers.google.com/android/ota)

针对Nexus 6P，可以下载到最新的 8.1.0 (OPM7.181205.001, Dec 2018) ，通过刷机方式获得最新版本。

* 下载文件验证SHA-256

```
shasum -a 256 angler-ota-opm7.181205.001-abb36a2f.zip
```

> 参考 [How to verify checksum on a Mac - MD5, SHA1, SHA256, etc](https://www.dyclassroom.com/howto-mac/how-to-verify-checksum-on-a-mac-md5-sha1-sha256-etc)

* 将设备引导到recovery状态

```
adb reboot recovery
```

如果不能通过adb完成recovery状态，可以使用启动组合键来实现（请参考 [Booting into fastboot mode](https://source.android.com/setup/build/running#booting-into-fastboot-mode)）。例如，对于Nexus 6P是同时安装`电源键`和和`音量-键`，进入recovery状态后，进入sideload模式，选择选贤 `Apply update from ADB`

这里我遇到一个问题，就是选择了`Recovery Mode` ，并没有进入sideload，而是出现一个 "No command" 界面。参考 [“No Command” Error In Recovery Mode On Android](http://www.androiddata-recovery.com/blog/solved-no-command-error-in-recovery-mode-on-android) 。应该在选择 `Recovery Mode` 之后，看到 `no cmmand` 界面，此时应该按住电源键不放，然后按一下（按下后马上释放）音量增加键，但是持续按住电源键。

此时会看到多个命令选项，其中一个选项就是 `Apply update from ADB` （也有命令选项可以擦除数据恢复出厂状态）。

* 执行以下命令确保设备显示的是 `sideload`

```
$ adb devices
List of devices attached
KYV7N15C03000136	sideload
```

* 在确保 `sideload` 状态下，就可以执行以下命令将OTA包刷入

```
adb sideload angler-ota-opm7.181205.001-abb36a2f.zip
```

# 黑域

Android设备最大的缺陷，或者说国内流氓软件最恶心的地方，就是自动启动偷跑流量以及贪婪的权限要求。国产应用"全家桶"采用强制唤起自身应用，不断连带运行消耗了大量的系统资源，使得Android设备及其不稳定和耗电。

[黑域](https://play.google.com/store/apps/details?id=me.piebridge.brevent&hl=zh)是专治国产Android应用「全家桶」的最佳应用。

黑阈支持 Android 5.0 到 9.0，不需要 root，但是依赖“开发者选项”中的“USB调试”。如果设备支持网络调试，开启之后黑阈会自动激活。

* 开启开发者选项（在system设置中，选择About phone，然后连续点击7次Build Number，即系统版本）中启用USB调试
* 使用数据线将手机和主机连接，此时手机上会提示是否信任主机，选择信任，这样就可以从主机上使用adb命令
* 启动黑域，然后在看过引导后进入`enjoy`页面，并启动黑域。此时程序会提示你使用方法
* 在主机上执行 `adb devices` 确保看到设备

```
$ adb devices
List of devices attached
KYV7N15C03000136	device
```

* 执行以下命令

```
adb -d shell sh /data/data/me.piebridge.brevent/brevent.sh
```

* 使用时只需要选择应用（长按应用图标），然后点击 `加入黑域` 就可以


# Nexus 6P的问题

* 4G无法打电话问题（实际是无法使用中国移动VoLTE，只能使用2G通话）

Nexus 6P硬件支持VoLTE，并且在国外运营商使用证实是可以正常使用VoLTE。但是很不幸，这个功能和大陆用户无关，原因是Android系统中没有包含大陆运营商的VoLTE配置，至少中国移动是完全无法使用VoLTE。

# 参考

* [[Update: Not dead yet] Death of the Nexus: Final guaranteed OTA updates hit Nexus 6P and 5X](https://9to5google.com/2018/11/07/nexus-6p-and-5x-final-guaranteed-updates/)
* [告别Android卡顿、耗电——黑域使用教程](https://zhuanlan.zhihu.com/p/28118279) - 详细使用黑域方法参考 https://jianyv.com/br/br.pdf
* [Pixel中文网：Nexus 6p](http://www.pixcn.cn/nexuspress/nexus6p/)