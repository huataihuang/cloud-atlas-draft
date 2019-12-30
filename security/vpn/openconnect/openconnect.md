[OpenConnect](www.infradead.org/openconnect)是Cisco AnyConnect SSL VPN的一个开源客户端，支持Cisco多个系列IOS 12.4(9)T及更高版本的Cisco SR500, 870, 880, 1800, 2800, 3800, 7200 Series 和 Cisco 7301，以及ASA 5500系列。

OpenConnnect也可以配合[OpenConnect VPN Server - ocserv](deploy_ocserv_vpn_server.md)来实现便捷的翻墙。

# Linux使用openconnect

* Gentoo安装

可以安装 `openconnect` 以及 `networkmanager-openconnect`，然后就可以通过`nm-applet`（network manager的托盘图标）来配置。注意，安装以后需要重启 `NetworkManager.service`。

```bash
emerge --ask net-misc/openconnect
```

* Ubuntu安装

```
sudo apt-get install openconnect
```

# 连接

```bash
openconnect vpnserver
```

然后输入帐号和密码就可以。

> 注意：VPN需要使用 `tun` 设备，内核需要支持，否则会报错 `Failed to open tun device: No such device Set up tun device failed`

```bash
    Device Drivers ->  Network device support
        <*>   Universal TUN/TAP device driver support
```

# Mac上使用OpenConnect

通过[homebrew](https://brew.sh)安装OpenConnect

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
brew install openconnect
```

> 要升级openconnect，则使用 `brew upgrade openconnect`

以前需要安装[Mac OS X TUN/TAP](http://tuntaposx.sourceforge.net/) ？：当前tuntap已经不支持最新macOS。不过，现在macOS包含了utun设备，所以你应该不需要再安装tun/tap设备，当前openconnect应该是直接使用macOS提供的原生utun设备。

> 请参考 []

如果已经安装了[Mac OS X TUN/TAP](http://tuntaposx.sourceforge.net/)，参考其安装文档可以卸载:

```
sudo rm -rf /Library/Extensions/tap.kext
sudo rm -rf /Library/Extensions/tun.kext
sudo rm -rf /Library/LaunchDaemons/net.sf.tuntaposx.tap.plist
sudo rm -rf /Library/LaunchDaemons/net.sf.tuntaposx.tun.plist
```

运行openconnect需要sudo，因为它需要修改DNS，可以通过以下方法加上无需密码的sudo权限

```bash
sudo visudo -f /etc/sudoers
```

添加

```bash
%admin  ALL=(ALL) NOPASSWD: /usr/local/bin/openconnect
```

为避免访问自签名服务器出现的告警，可以通过将服务器证书导出存放到客户端`~/.ssh/<certificate name>.pem`，然后通过命令访问

```bash
sudo openconnect --user=<VPN username> --cafile=<.pem file from step 4.3> <your vpn hostname>
```

## macOS连接OpenConnect报错

* 连接成功，但是一会就显示操作无效

```
DTLS handshake failed: Resource temporarily unavailable, try again.
Failed to connect utun unit: Operation not permitted
Failed to open tun device: Operation not permitted
Set up tun device failed
Unknown error; exiting.
```

这个问题是因为访问 `utun` 设备需要root权限，虽然 `sudo` 可以执行，但是在后续应该还有访问 `utun` 设备，此时似乎后台没有使用root身份。最终我的解决方法是，先切换到root身份，然后再执行 `openconnect` 就不再报错:

```
# FIRST switch to root
sudo su -
# THEN create vpn as root
openconnect vpn.example.com
```

我把这个方法comment到了 [OpenConnect VPN on Mac OS X](https://gist.github.com/moklett/3170636)

# 参考

* [OpenConnect](https://wiki.archlinux.org/index.php/OpenConnect)
* [OpenConnect VPN on Mac OS X](https://gist.github.com/moklett/3170636)
* [How can I connect to the MIT VPN using openconnect on Mac OS X?](http://kb.mit.edu/confluence/pages/viewpage.action?pageId=152588205) - 这篇文档非常详细，建议参考
* [vpn: compiling openconnect for macOS](http://mixablehodgepodge.blogspot.com/2019/01/vpn-compiling-openconnect-for-macos.html)