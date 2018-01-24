对于Linux平台的Google Chrome和Mozilla Firefox浏览器，直接安装RPM版本的Adobe Flash Player，就嫩够正常播放Flash内容。但是，对于Chromium浏览器（开源测试版本），则Adobe的RPM包不能工作。

目前Adobe已经玄布了[Adobe Flash Player支持的终止时间](http://www.linuxnov.com/adobe-flash-player-reach-end-life-2020-html5-usage-growing-over-time/)并建议使用开放的HTML5和WebGL标准。

为了能够在Chromium中查看Flash，需要使用PPAPI flash plugin "Pepper"软件包来代替使用Yum或RPM的软件包。

从Adobe的下载网站 https://get.adobe.com/flashplayer/otherversions/ 下载`PPAPI`版本的 `tar.gz` 格式软件包（`PPAPI`是Google开发的开源播放flash）

执行一下指令将插件解压缩：

```
sudo tar -xf flash_player_ppapi_linux.x86_64.tar.gz -C /usr/lib64/chromium-browser/PepperFlash
```

然后重启chromium，就可以观看flash。

打开chromium浏览器，访问： chrome://flash 可以看版本信息：

```
About Flash
Chromium	63.0.3239.108 (Fedora Project)
OS	Linux
Flash plugin	28.0.0.137 /usr/lib64/chromium-browser/PepperFlash/libpepflashplayer.so
```

# 参考

* [How To Install Adobe Flash Player for Chromium Web Browser on Fedora 26](https://www.linuxnov.com/how-to-install-adobe-flash-player-for-chromium-web-browser-on-fedora-26/)