[OpenConnect](www.infradead.org/openconnect)是Cisco AnyConnect SSL VPN的一个开源客户端，支持Cisco多个系列IOS 12.4(9)T及更高版本的Cisco SR500, 870, 880, 1800, 2800, 3800, 7200 Series 和 Cisco 7301，以及ASA 5500系列。

OpenConnnect也可以配合[OpenConnect VPN Server - ocserv](deploy_ocserv_vpn_server.md)来实现便捷的翻墙。

# Linux使用openconnect

可以安装 `openconnect` 以及 `networkmanager-openconnect`，然后就可以通过`nm-applet`（network manager的托盘图标）来配置。注意，安装以后需要重启 `NetworkManager.service`。

```bash
emerge --ask net-misc/openconnect
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

通过[homebrew](http://mxcl.github.com/homebrew/)安装OpenConnect

```bash
brew update
brew install openconnect
```

安装[Mac OS X TUN/TAP](http://tuntaposx.sourceforge.net/)

运行openconnect需要sudo，因为它需要修改DNS，可以通过以下方法加上无需密码的sudo权限

```bash
sudo visudo -f /etc/sudoers
```

添加

```bash
%admin  ALL=(ALL) NOPASSWD: /usr/local/bin/openconnect
```

为避免访问自签名服务器出现的高进，可以通过将服务器证书导出存放到客户端`~/.ssh/<certificate name>.pem`，然后通过命令访问

```bash
sudo openconnect --user=<VPN username> --cafile=<.pem file from step 4.3> <your vpn hostname>
```

# 参考

* [OpenConnect](https://wiki.archlinux.org/index.php/OpenConnect)
* [OpenConnect VPN on Mac OS X](https://gist.github.com/moklett/3170636)
