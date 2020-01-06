苹果公司提供了macOS的免费升级，并且每次升级都会带来全新的功能改进和bug修复。苹果的MacBook有一个特殊的recovery分区，能够通过网络自动恢复破坏的操作系统，不过，这个修复只限于最近安装的操作系统版本。也就是说，一旦操作系统升级，就如果iOS升级一样，想要回退到之前的旧版本，则非常困难。

总有一些情况下，我们需要回退到旧版本操作系统：或许因为有应用程序需要旧版本macOS支持，或者因为硬件性能有限，或者如我对旧版本的拟物化风格有一种怀旧的迷恋。

# 不同情况下降级macOS的思路

## 运行High Sierra

如果运行High Sierra 10.12.4 或更高版本，如果你想要回到之前和你售卖的硬件时候搭载的macOS版本，则非常幸运，可以轻易做到：

* 重启Mac，同时按住 `Shift+Option+Command+R` 按键 （通常的网络修复安装是组合按键 `Option+Command+R` ，这里多加一个 `Shift` 键 ）
* 当看到macOS Utilities屏幕，直接选择 'Reinstall macOS' 并点击 'Continue' 就可以选择启动盘机型安装

## 通过Time Machine备份恢复

如果早期操作系统有Time Mahine备份，则恢复非常容易。

## 如果以上条件都不满足

如果你运行的不是 High Sierra或更高版本，也没有通过Time Machine备份过之前的低版本macOS，则降级macOS比较麻烦，需要自制一个启动安装U盘。此时你需要从AppStore中下载早期版本macOS(例如Mac OS X Snow Leopard)。

但是，如果你从来没有在App Store上下载过对应的macOS版本，就无法再次下载。此时就需要找一个曾经下载安装过对应macOS的朋友来爱在并提供你完整的安装包。

ISORIVER 提供了 [Mac OS X Mavericks 10.9 ISO and DMG Image Download](https://isoriver.com/mac-os-x-mavericks-10-9-iso-dmg-image/) ，可下载并参考 [创建macOS启动安装U盘](create_macos_boot_install_drive) 。请注意，早期macOS和iOS都不支持两步验证的方式，会导致无法登陆Apple账号。所以，在安装低版本macOS和iOS之前，需要参考[从两步验证切换至双重认证](https://support.apple.com/zh-cn/HT207198)中的有关关闭两步验证的方法，先关闭两步验证才能继续安装。

# Apple ID

macOS降级到低于OS X El Capitan，iOS降级到低于iOS 9，都会面临一个困难，就是系统不支持Apple ID的双重验证。

由于我的MacBook Air 11 2011版本，随机是的Lion版本OS X。目前iOS 9和OS X El Capitan都开始支持[Apple ID 的双重认证](https://support.apple.com/zh-cn/HT204915)，并且账号双重验证一旦开启将[无法关闭双重验证](https://discussionschinese.apple.com/thread/250536330)。所以，如果你都账号已经启用了双重验证，则旧设备旧无法使用该账号，必须重新注册一个新的Apple ID。

然后通过[网络recovery安装macOS](reinstall_macos_from_recovery)方法重新安装最初的Lion版本 - 遗憾的是，实践下来发现App Store已经关闭了Lion版本的下载，所以无法恢复安装MacBook Air 2011版本随机的Lion系统。

> 我感觉还是需要找到能够制作启动U盘的老系统，制作一个旧版本安装U盘才能解决这个问题。

完成后，再通过 ISORIVER 提供 [Mac OS X Mavericks 10.9 ISO and DMG Image Download](https://isoriver.com/mac-os-x-mavericks-10-9-iso-dmg-image/) 安装升级dmg。为了干净安装，特别[创建macOS启动安装U盘](create_macos_boot_install_drive)重头开始重新安装一遍。

## 美区Apple ID申请

应用软件最丰富的是美区，并且美区账号的iCloud数据不会保存在国内的云上贵州。申请美区账号方法，请参考 [如何申请美区苹果App Store账户？](https://www.zhihu.com/question/26458172)，其中特别推荐 "syl小虫" 的答案（提供了详细的自助找到美国地址的方法）。

* [部署OpenConnect VPN](../../security/vpn/openconnect/deploy_openconnect_vpn_server_ocserv_with_certificate)翻墙，这个目的是为了更新账号时采用美国IP地址。如果你不方便自己部署VPN，也可以采用比较简单的[ssh端口转发](../../service/ssh/ssh_port_forwarding)方法，使得浏览器访问苹果服务器验证显示为美国IP地址。当然，如果你不是技术工作者，或者对技术细节不感兴趣，则可以购买一个VPN账号来实现这个功能。
* 访问 [Google 地图](https://www.google.com/maps) ，通过卫星地图随便找一个房子，就能够看到对应地址，以及邮编。
* 从 [美国国际区号](https://cn.mip.chahaoba.com/美国) 可以查到地址对应的区号，至于电话号码，则为 xxx-xxxx 大概编写一个就是了。

## 应用软件购买

申请到美区账号以后，实际上由于没有绑定信用卡，是不能直接购买收费软件的。不过，苹果支持Gift Card，可以直接在美亚上购买充值，就可以购买需要的软件的。

> 很遗憾，实际上由于苹果全面转向64位系统，并且平面化风格以后，大多数iOS软件已经无法在旧版本6.1.x上运行了。需要采用第三方平台通过越狱安装。不过，如果有一个古老的[Mac OS X Mavericks和iOS 6组合(体验最后的拟物化苹果生态)](mac_os_x_mavericks_and_ios_6)也是一个神奇的体验。

# 参考

* [How to downgrade to an earlier version of macOS](https://www.chriswrites.com/how-to-downgrade-to-an-earlier-version-of-macos/)