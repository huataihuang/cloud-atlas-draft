> 安装shadowsocks客户端原本是比较简单的事情，但是在墙内是需要一些技巧。此外，不同的平台，依赖的环境不同，本文根据自己的实践提供一些经验。

# Mac OS X

## Python版本shadowsocks命令行客户端

> 安装参考[pip包管理](../../../develop/python/startup/pip.md)通过Python虚拟环境来安装部署。默认macOS中安装的是Python 2

```bash
sudo easy_install virtualenv
cd ~
virtualenv venv2
cd venv2
source bin/activate
pip install shadowsocks
```

# iOS

## 自己编译shadowsocsk-iOS

从github下载[shadowsocks-iOS](https://github.com/herzmut/shadowsocks-iOS)自行编译，并通过开发者证书安装到自己的手机中。

## 第三方服务Wingy

在iOS平台，App Store中的[Wingy](https://itunes.apple.com/us/app/wingy-http-s-socks5-proxy-utility/id1178584911)可以购买流量套餐。

> [Wingy](https://itunes.apple.com/us/app/wingy-http-s-socks5-proxy-utility/id1178584911)是翻墙服务。不过，在App Store中国区该软件已经下架，取而代之的是其他类似的软件（通过搜索wingy关键字）。
>
> 如果不信任第三方服务，需要自己编译[shadowsocks-iOS](https://github.com/herzmut/shadowsocks-iOS)。

# 参考

* [shadowsocks: clients](https://shadowsocks.org/en/download/clients.html)
* [shadowsocks: clients Quick Guide](https://shadowsocks.org/en/config/quick-guide.html)