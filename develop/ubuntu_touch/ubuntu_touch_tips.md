# 截屏

> 参考 [How to take a screenshot on Ubuntu Touch](https://askubuntu.com/questions/272349/how-to-take-a-screenshot-on-ubuntu-touch/603318)

* 最简单的截屏方法

同时按下`音量增加键`和`音量减小键`，直到听到`picture`声音并看到`screenshot`闪烁了一下。截屏文件被保存在`/home/phablet/Picture/Screenshots`目录。

* 使用命令行

`phablet-screenshot`命令可以在`phablet-tools`软件包中找到，可以通过USB线缆连接到Ubuntu设备进行截图：

```
phablet-screenshot foo.png
```

# 对https网站提示ssl证书错误，无法加载

浏览器在访问 https://www.baidu.com 和 https://amazon.com.cn 时候都会提示ssl证书错误：`site security certificate is not trusted`。虽然在其他的Linux桌面上使用浏览器访问这些网站都是正常的。

开始我还以为是类似 [webbrowser only partially loads some https sites](https://bugs.launchpad.net/ubuntu/+source/webbrowser-app/+bug/1656551) 这个问题，后来发现多应用不能正常工作（例如，`OpenStore`打开时空白），突然发现，原来是手机系统的时间设置错误。原先因为网络不通，所以手工设置了时钟。但是最近一次重启手机后，时间又错误了。

改为自动设置时钟（通过ntp），则上述ssl证书错误问题解决。


# 常用应用

我个人不玩游戏，对手机最主要的用途是阅读电子书、RSS新闻和使用Evernote。虽然Ubuntu Touch缺乏商业软件，但是开源的有不少针对网络服务的客户端（例如Telecom原生客户端）以及结合一些网络服务的WEB访问，能够满足90%以上的需求。

## Everntoe

Ubuntu Touch的Notes通过Evernote账号添加后可以支持直接和Evernote同步，对于轻度使用Evernote是一个很好的客户端。

> 不过，由于我在Evernote中积累了大量从WEB中存储的文档，导致Notes同步存在缓慢的问题，或许后续需要做整理才能流畅使用。

> 原本想尝试采用WEB方式使用Evernote，但是Evernote提示不支持Android browser访问WEB，所以暂时无法使用此方法。

## Feedly

* 采用WEB方式使用Feedly

> Ubuntu Touch OpenStore有一个非常轻量级的Shorter应用，提供了RSS订阅的功能。不过需要手工添加RSS，适合精简方式筛选最重要的RSS订阅。

## 电子书

* epub是通用的电子书格式，使用Beru可以非常完美支持。

> 个人在Amazon购买的正版电子书可以通过[使用calibre去除kindle DRM](../../read/calibre_remove_drm)然后转成`epub`格式传输到Ubuntu Touch中使用Beru阅读，能够充分利用Ubuntu Touch系统。

## 钉钉

* 企业交流软件[钉钉WEB版](https://im.dingtalk.com)对浏览器支持非常好，在Ubuntu Touch下可以流畅使用。

> 竖屏使用钉钉WEB字体缩放会过小，转为横屏则比较清晰。应急时候可以使用，最好外接蓝牙键盘使用。
>
> 在Linux桌面版本，可以非常顺畅使用[钉钉WEB版](https://im.dingtalk.com)，丝毫不影响工作。

## 微信

* 微信有[网页版微信](https://wx.qq.com/)

> [网页版微信](https://wx.qq.com/)默认会检查浏览器版本，如果是移动手机版浏览器会拒绝访问，提示"Please visit on computer browsers"。需要能够修改浏览器agent版本，暂时放弃。

## 豆瓣音乐

虽然没有QQ音乐和Apple Music这样版权丰富的音乐客户端，不过，豆瓣音乐作为小众音乐客户端居然也开发了Ubuntu Touch版本，能否把几年前的音乐列表再次拾起也是欣慰。

> 好在我听的大多数是非常老的歌曲，也聊胜于无。