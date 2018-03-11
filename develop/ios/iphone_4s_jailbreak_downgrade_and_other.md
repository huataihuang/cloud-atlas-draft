# 折腾

> 运营商实在可恶，苹果好好的全网通手机，硬生生阉割成只能捆绑某个运营商的功能受限手机。即使多年以后，别人转增给我的早已超出当年签约期的手机，也无法使用其他电信网络。

花费了2个半天，最终我还是放弃iPhone 4S，主要原因如下

* 这台iPhone 4S的信号功能存在问题，使用联通卡时候经常没有信号，应该是天线硬件存在故障（网上有说法是天线金属片和外壳接触导致的）
* 虽然能够通过[Phinex](http://www.redmondpie.com/jailbreak-ios-9.3.5-32-bit-devices-with-phoenix-ipa-heres-how-download/)越狱iPhone 4s iOS9.3.5，但是找不到合适的电信补丁，无法使用电信卡。
* 苹果于2018年除开放了iPhone 4S的6.1.3降级通道，实测可以完成降级，但是降级破解软件不能在高版本iTunes上运行，要找到合适版本操作系统（重装）实在太花费时间了。
* iOS 6相关的补丁包已经找不到了（可以使用电信卡的补丁）。
* 降级到iOS 6.1.3之后，由于无法找到运行破解的操作系统环境（主要是iTunes需要11.1.5版本），所以放弃了破解。

> 多方因素叠加，最终放弃了iPhone 4S。其实，有合适的经济条件，购买自己经济能力范围内的最好的iPhone就好。节约自己的生命。

# A1431使用电信卡的解决思路

A1431实际上是硬件支持国内的三大运营商CDMA网络，早期iOS版本都是跨运营商运行的。但是自从进入中国以后，由于和电信运营商签订了合约，后期升级系统后软件区分了运营商。

软件是通过运营商plist区分网络，有签名，所以需要越狱以后修改。最主要是找到运营商的plist重写。

# iOS 9.3.5 iPhone 4S JailBreak

iPhone 4S是32位芯片，不能直接使用目前主流的盘古破解（运行在64位），可以使用 [Phonix]()

> 完全没有必要使用所谓的”同步推”这种捆绑别人开发的越狱成果来实现盗版的垃圾软件。实际上只要你正确使用google就能够找到合适的原版“越狱工具”。

经过实践，结合[Phonix4.ipa](http://pangu8.com/files/Phoenix4.ipa)和[Cydia impactor](http://www.cydiaimpactor.com/)就可以实现破解软件的安装。

> 虽然[Pangu 8 Phoenix Jailbreak](http://pangu8.com/tools/phoenix/)提供了zJailbreak可以在线安装需要的破解软件，但是实践发现运行破解存在无响应问题。最终还是通过在Mac平台直接结合[Phonix4.ipa](http://pangu8.com/files/Phoenix4.ipa)和[Cydia impactor](http://www.cydiaimpactor.com/)完成安装Phoenix来实现破解。
>
> [Pangu 8 Phoenix Jailbreak](http://pangu8.com/tools/phoenix/)提供的zJailbreak是一个需要捐款后才能正常安装Pigsy Online JB，略坑。

* 运行Cydia Impactor

将Phoenix IPA文件拖放到Cydia Impactor窗口，此时会弹出窗口要求输入Apple ID和passord发送给Apple来签名软件。
￼
> 注意：
>
> * 发送给Apple的是你的Apple账号名和一个在 http://appleid.apple.com 网站生成的`APP-SPECIFIC PASSWORD`，这个是用来签名应用软件的 账号和密码，绝不是你登陆Apple网站账号密码。切记！！！
> * 你应该首先访问 http://appleid.apple.com ，先创建好APP-SPECIFIC PASSWORD之后再来使用Lydia Impactor打包签名Phoenix IPA文件。
> * 签名实际上就是用你的个人证书为这个程序签名，这样这个程序即使没有在AppStore中，也可以安装到你的手机。类似开发者账号安装自己开发的软件。

使用Cydia Impactor签名Phoenix IPA会遇到几个问题：

密码错误问题：最初我错误输入了Apple账号密码，反复提示错误。最后发现原来是需要在AppleID网站 http://appleid.apple.com 创建自己的`APP-SPECIFIC PASSWORD`才可使用。（参考[Fix For “provision.cpp” Cydia Impactor Error When Jailbreaking iOS 9.3.3](http://www.redmondpie.com/fix-for-“provision.cpp-cydia-impactor-error-when-jailbreaking-ios-9.3.3/)）

如果Apple 修改了协议，还需要在开发者网站统一同意最新协议才能签名。

# 降级方法

https://ipsw.me/ 上可以查询到，当前iPhone 4s可以降级到6.1.3
￼
> 降级过程需要在 https://appleid.apple.com/account/manage 暂时关闭两步验证功能（验证始终无法输入通过），完成iPhone 4s 降级到6.1.3激活手机之后，再恢复两步验证。

# iOS 6.1.3 越狱（未尝试）

> p0sixspwn提供了iOS 6.1.3 - 6.1.5版本的完美越狱

不过，由于年代久远加上一些不明原因，很难找到可用的p0sixspwn。虽然通过google搜素到最新的1.0.8，这个版本可以运行，但是在jailbreak过程中，连接Apple网站下载必要软件时会异常退出，所以没有解决。

http://findmyjailbreak.com 可以帮助根据版本来找Jailbreak工具，但是很不幸，能够找到的越狱工具依然是p0sixspwn，这个版本可能需要比较低的操作系统才能运行。

> 搜索到 [iClarified 提供的P0sixspwn](http://www.iclarified.com/37176/where-to-download-p0sixspwn-from)有最新的 1.0.8 版本。

我运行p0sixspwn的1.0.8版本，在macOS Sierra上会crash，和 [p0sixspwn crashes in macOS Sierra, can't Jailbreak iPad 2,3 iOS6.1.3](https://www.reddit.com/r/LegacyJailbreak/comments/5tobeh/question_p0sixspwn_crashes_in_macos_sierra_cant/) 情况相同。原因是需要iTunes 11.1.5，其他版本iTunes不能工作。或许我需要找一个旧版本的Mac来尝试。(也可以使用Windows 7平台来运行) - [p0sixspwn GitHub项目issue #8](https://github.com/p0sixspwn/p0sixspwn/issues/8)介绍了这个问题。

> [Troubleshooting – How to fix p0sixspwn jailbreak errors iOS 6.1.3 – 6.1.6](http://cydiainstaller.net/p0sixspwn-jailbreak-errors/)提供了这个问题解决建议，并提供了iTunes 11.1.5下载链接(不过是Windows版本)

> 神奇的网站 [oldapps](http://www.oldapps.com) 提供各种旧版本软件下载

* 如果能够 JailBreak之后，或许可以参考 [Verizon版无锁iPhone4S完美软解使用电信卡](http://iphone.anqu.com/yueyu_524/13980/)来实现使用电信SIM卡
* 添加源http://iphone.tgbus.com/cydia/，备份iPhone系统目录/System/Library/Carrier Bundles/iPhone/Unkonwn.bundle下所有文件，然后安装源中的电信Bundle文件(搜索电信Bundle)
* 在http://v.backspace.jp/repo源中安装CommCenter补丁。(搜索commcenter)

> 不过，通过浏览器访问 http://iphone.tgbus.com/cydia/ 发现很多软件已经被移除，有可能无法完成。

尝试 http://pangu8.com/jailbreak/iphone/ 提供的在线 jailbreak 工具，不过，非常头疼的是，在墙内虽然可以安装zJailbreak工具，但是运行时无法连接服务器（被GFW屏蔽）。

此时又遇到一个问题：虽然以前Apple ID曾经安装过旧版本软件（兼容iOS 6），从苹果的AppStore中可以看到旧版兼容，而且iOS 6.1.3的AppStore软件也提示需要安装一个兼容版本App。但是，实际上苹果已经去除了iOS6及以下版本的App下载，所以依然无法安装软件。

解决的App的方法是先越狱，然后安装旧版本的91助手（注意一定不能升级91助手），然后通过91助手安装旧版本软件。

# 参考

* [Download Phoenix To Jailbreak iOS 9.3.5 On 32-Bit Devices, Here’s How](http://www.redmondpie.com/jailbreak-ios-9.3.5-32-bit-devices-with-phoenix-ipa-heres-how-download/)
* [How to Fix ‘provision.cpp:168’ Error in Cydia Impactor While Jailbreaking iOS 10 – iOS 10.2 Using Yalu](http://www.iphonehacks.com/2017/07/fix-provision-cpp168-error-cydia-impactor-yalu-jailbreak-10-2.html)
* [国行A1431或港行A1387使用电信卡新方法，因为没有终端，请FY们测试一下](https://bbs.feng.com/forum.php?mod=viewthread&tid=7730301&archive=1&extra=&page=1) - 这个方法是应该在iOS 7版本可行，原理是模拟Verizon手机漫游电信网络，但是原先提供Verizon iPhon4S补丁的Cydia源网站 apt.appvv.com 已经挂掉了
* [iPhone知識_iOS8.1.1 v版a1533破解中國電信4g簡單方式教程](http://www.wiki101.com.tw/archives/145334#.WqPaqWaB2L4) - 台湾人在重庆测试的方法
* [How to Jailbreak iOS 6.1.5, iOS 6.1.4, iOS 6.1.3 with p0sixspwn](http://www.iphonehacks.com/2014/01/jailbreak-ios-6-1-5-6-1-4-6-1-3-p0sixspwn.html)
* [Verizon版无锁iPhone4S完美软解使用电信卡](http://iphone.anqu.com/yueyu_524/13980/)