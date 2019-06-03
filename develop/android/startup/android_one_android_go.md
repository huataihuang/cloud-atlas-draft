原生Android，Android One和Android Go，这三种Android系统是Google针对不同设备采用的不同策略，分别聚焦于开源软件的选择，软件更新更新方式的释放手段以及预装软件的差异。

原生Android是指Google推出的Nexus系列和Pixel系列。由于2017年Google终止了Nexus项目，所以当前原生Android通常指Pixel系列搭载的系统。

由于Android是开源系统，核心操作系统源代码项目Android Open Source Project (AOSP)，任何人都可以基于这些代码为手机或任何其他设备做周边开发。但是，Google提供的Google Play Store，Youtube和地图等服务，但他们实际上并不属于安卓开源项目的一部分。所以，为获得“正常”的安卓手机，你不仅要从Google那里使用源代码，同样还需要取得从Google移动服务项目取得授权才能正常使用他们的软件服务。

> 2019年5月20日，美国政府把华为公司列入“实体名单”后，Google暂停与华为公司的商业往来（包括硬件和软件转让与提供技术的服务），但可以通过公开资源获取的服务除外。这意味着华为手机在海外市场由于无法提供完整Android生态环境，其欧洲市场手机业务可能"中止"。
>
> 国内由于特殊的GFW存在，所有安卓系统都是剥离了Google提供服务，从Google开源的AOSP开始构建的，结合了大量的土生软件，封闭的生态环境。

# 原生Android

针对Nexus和Pixel系列设备，原生Android直接从Google官方获取，所以能够得到最快的系统升级和更新。而且，原生Android没有臃肿的定制（大多数手机厂商定制都是为了推送广告，带来极大的系统无谓消耗），能够得到最好的Android体验，是Android爱好者最爱并且逐渐得到中重度使用者的青睐。

原生Android可以从Google官方 https://www.android.com/ 获得。

# Android One

Android One是Google推出2014年发布于印度的系统，最初面向中低端手机，但目前逐步成为更高端定位。对于安装了Android One的设备，Google实际上是提供了部分软件的开发服务给到生产厂商。例如，有些厂商不擅长软件，只有硬件制造能力，则Google提供软件服务，即Android One系统，并承诺在一段时间内直接向手机终端推送系统更新和安全补丁。

最新的Android One介绍：https://www.android.com/one/

> Google会向OEM公司（如Nokia，MOTO等一些Android One计划的主要合作厂商）收取部分费用来处理他们的软件需求。

# Android Go

Android Go取代了最初的Android One计划，专门用于推广低端设备。由于它的“缩水”的版本特性，也相对应的没有了众多的预装软件并专门开发了相应的“lite”或“Go”的Google轻应用版本，如Maps Go和Gmail Go，以便让低端设备运行更加流畅。

Android Go和Android One的主要区别在于，Android Go不由Google直接推送，而是间由厂商在收到谷歌的推送后再释放升级和系统更新，这也自然的造成了Android Go相比于Android One和原生安卓的一些延迟。

最新的Android Go介绍：https://www.android.com/versions/go-edition/

> Android Go实际上是原生Android通过recovery刷入enable或disable两个包来开启和关闭Android Go功能。请参考 [轻量版的原生 Android 好用吗？我用自己的手机体验了 Android Go](https://zhuanlan.zhihu.com/p/33890271) 。
>
> 我准备使用[Nexus 5定制Android Go](../lineageos/build_nexus_5_android_go) 来体验轻量级的Android Go系统。

# 总结

* 原生安卓——Google为自家安卓设备Pixel系列提供的系统，由谷歌负责安全补丁升级和系统更新；

* Android One——Google为非Google硬件提供的原生安卓，由谷歌负责安全补丁升级和系统更新；

* Android Go——取代Android One成为专为低端设备优化的安卓系统，由OEM厂商在接受Google推送后负责安全补丁升级和系统更新。

# 参考

* [原生安卓，Android One，Android Go简介](https://zhuanlan.zhihu.com/p/42548333)
* [Android Go是什么系统？Android Go和Android有什么差别](http://android.poppur.com/News/7865.html)