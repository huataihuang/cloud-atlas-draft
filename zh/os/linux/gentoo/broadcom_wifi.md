
最简单构建内核是使用 `genkernel all` 命令，提示如下
 
```bash
* kernel: Using config from /usr/share/genkernel/arch/x86_64/generated-config
*         Previous config backed up to .config--2016-04-05--22-55-47.bak
```

> 这个内核采用通用配置，不是自定义内核，虽然通用性更好，但是并不是针对自己的硬件编译的。

# 驱动选择

要选择可以配合主机Broadcom无线网卡芯片的驱动，可以通过检查 `device ID` 和芯片名称来确定。对于我使用的MacBook Pro 2013 late版本，无线网卡是 `BCM4360 802.11ac` ，由于这个网卡不是 `802.11n` 类型，所以不能使用 `brcm80211` 驱动，只能使用 `b43` 或者 `broadcom-sta` 驱动。


# 使用闭源broadcom-sta驱动

2008年7月，Broadcom发布了`802.11 Linux STA驱动`，这个采用了限制授权的驱动不支持隐含ESSID。

编译内核

```bash
make && make modules_install
emerge --ask net-wireless/broadcom-sta
make install
```
安装firmware

```bash
emerge sys-firmware/b43-firmware
```

> 一定要安装`b43-firmware`（我开始以为是使用`linux-firmware`就可以包含所有的必要firmware，实际不是这样的），否则启动`dhcpcd`服务还是会看不到任何数据包通过无线网卡，只有安装了`b43-firmware`后，才会有数据包通讯。
>
> 注意：每次使用新内核源代码，或者编译内核模块创建新目录（例如修改了内核版本后缀名），则需要重新安装`broadcom-sta`驱动，这样才能重新编译`wl`内核模块安装到新的内核模块目录`/lib/modules/XXXX`中。

# 使用开源`b43`驱动

`b43` 开源驱动是早期通过反向工程实现的驱动


# 使用开源`brcm80211`驱动

2010年8月，Broadcom发布了完全开源的驱动[brcm80211](http://wireless.kernel.org/en/users/Drivers/brcm80211)，被集成到内核2.6.37中，并在2.6.39版本划分为`brcmsmac`和`brcmfmac`驱动。

# 配置 `wpa_supplicant`

* 配置 `/etc/wpa_supplicant/wpa_supplicant.conf`

```bash
ctrl_interface=/var/run/wpa_supplicant
ctrl_interface_group=root
ap_scan=1

network={
key_mgmt=IEEE8021X
eap=PEAP
phase1="peaplabel=0"
phase2="auth=MSCHAPV2"
identity="USERNAME"
password="PASSWORD"
}

network={
ssid="free_wifi"
key_mgmt=NONE
priority=-999
}
```

> 为防止密码泄露，请使用 `chmod 600 /etc/wpa_supplicant/wpa_supplicant.conf` 将该配置文件摄制成对普通用户无法访问

> 注意，不需要手工启动`wpa_supplicant`服务，当前Gentoo提供的`dhcpcd`带有hook可以支持直接操作`wap_supplicant`。所以，可以按照下面的配置使用方法。

* 配置 `/etc/conf.d/net`

```bash
modules_wlp3s0="wpa_supplicant"
wpa_supplicant_wlp3s0="-Dnl80211 -d -f /var/log/wpa_supplicant.log"
config_wlp3s0="dhcp"
```

> 这里 `wlp3s0` 网络设备名称是启动操作系统后，通过`ifconfig -a`命令查看的无线网卡的命名

* 启动服务

```bash
systemctl start dhcpcd
```

此时会看到`dhcpcd`启动并且网卡获得分配的IP地址

# 参考

* [Broadcom wireless](https://wiki.archlinux.org/index.php/Broadcom_wireless)
* [wpa_supplicant](https://wiki.gentoo.org/wiki/Wpa_supplicant)
