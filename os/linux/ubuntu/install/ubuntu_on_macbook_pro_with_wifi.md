# BCM 43xx

Broadcom BCM43xx 无线网卡，在Ubuntu中默认不会激活使用（licence），可以通过 `System > Administration > Hardware/Additional Drivers` 来激活使用。如果存在驱动问题，可以详细参考本文设置。

在MacBook Pro 2015版本上安装Ubuntu 18.10，遇到第一个问题是，安装以后无法识别网卡。

通过 `lspci` 可以看到网卡硬件配置:

```
Broadcom Inc. and subsidiaries BCM4360 802.11ac Wireless Network Adapter (rev 03)
```

详细的信息可以采用如下命令：

```
lspci -vvnn | grep -A 9 Network 
```

正确安装了Braodcom STA无线驱动之后会显示如下信息:

```
03:00.0 Network controller [0280]: Broadcom Inc. and subsidiaries BCM4360 802.11ac Wireless Network Adapter [14e4:43a0] (rev 03)
	Subsystem: Apple Inc. BCM4360 802.11ac Wireless Network Adapter [106b:0112]
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0, Cache Line Size: 256 bytes
	Interrupt: pin A routed to IRQ 18
	Region 0: Memory at c1a00000 (64-bit, non-prefetchable) [size=32K]
	Region 2: Memory at c1800000 (64-bit, non-prefetchable) [size=2M]
	Capabilities: <access denied>
	Kernel driver in use: wl
	Kernel modules: bcma, wl
```

# Ubuntu提供的驱动

## Broadcom STA无线驱动（私有）

私有的Broadcom STA无线驱动由Broadcom在上游维护。这个驱动是闭源的，如果存在问题可能只能由Broadcom提供修复。为了方便使用，Ubuntu提供两个版本的驱动：

* [bcmwl-kernel-source](https://help.ubuntu.com/community/WifiDocs/Driver/bcm43xx)软件包专注提供最新版本
* [broadcom-sta](https://help.ubuntu.com/community/WifiDocs/Driver/bcm43xx)提供早期版本

## 其他开源版本

* b43 driver (Open-source) - 适合 BCM 4306 (rev 03), 4311, 4312, 4318, 4322, 4331, 43224 and 43225.

b43架构包含两部分。第一部分是[firmware-b43-installer](https://launchpad.net/ubuntu/+source/b43-fwcutter)，这是一个脚本用于安装驱动firmware，由ubuntu社区维护。第二部分是[b43](http://wireless.kernel.org/en/users/Drivers/b43)驱动，由Linux kernel社区维护。

* b43legacy driver (Open-source) - 适合 BCM 4301, 4306 (rev 02), and 4309.

b43legacy架构同样也是两部分组成。第一部分是[firmware-b43legacy-installer](https://launchpad.net/ubuntu/+source/b43-fwcutter)，用于安装b43legacy驱动firmware，由ubuntu社区维护。第二部分是[b43](http://wireless.kernel.org/en/users/Drivers/b43)驱动，由Linux kernel社区维护。

* brcmsmac driver (Open-source) - 适合 BCM 4313, 43224 and 43225.

这个brcmsmac驱动是从[linux](https://launchpad.net/ubuntu/+source/linux)内核包中的brcm80211模块提供PCIe设备驱动，由上游[Linux kernel社区](http://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/MAINTAINERS)维护。

* brcmfmac driver (Open-source) - 适合 SDIO: For Chip ID BCM 4329, 4330, 4334, 4335, 4354, 43143, 43241, and 43362. 以及 USB: For Chip ID BCM 43143, 43242, 43566, and 43569. 

* rndis_wlan driver (Open-source) - 适合 BCM 4320

* ndiswrapper (Open-source) - For all chip IDs. 

实际上这个 [ndiswrapper](https://launchpad.net/ubuntu/+source/ndiswrapper)软件包使用了Windows闭源驱动来激活[WIFI](https://help.ubuntu.com/community/WiFi)网卡，有上游[维护](http://sourceforge.net/projects/ndiswrapper/)。有关介绍，请参考[WifiDocs/Driver/Ndiswrapper](https://help.ubuntu.com/community/WifiDocs/Driver/Ndiswrapper)

# 安装STA驱动

## STA - 如果可以访问Internet

如果有办法让电脑访问Internet（例如，先通过有线连接网络），可以比较方便地安装

```
sudo apt-get update
sudo apt-get --reinstall install bcmwl-kernel-source
```

注意：如果你看到消息 `Module build for the currently running kernel was skipped since the kernel source for this kernel does not seem to be installed` 则表明你忘记安装了相应的 `linux-header` 软件包。

测试驱动（无需重启主机）：

```
sudo modprobe -r b43 ssb wl brcmfmac brcmsmac bcma
sudo modprobe wl
```

此时可以看到网络管理器可以扫描到网卡并且尝试连接。

`bcmwl-kernel-source`软件包会自动屏蔽掉开源驱动，这样可以确保只使用STA驱动。

## STA - 没有Internet访问

如果无法访问Internet，则可以从Ubuntu安装介质的 `../pool/restricted/b/bcmwl` 目录下的 `restricted` 目录下找到 `bcmwl-kernel-source` 软件包。

注意： `bcmwl-kernel-source` 软件包依赖 `linux-headers` 软件包，所以可能需要首先从[在线仓库](http://packages.ubuntu.com/lucid/bcmwl-kernel-source)获取响应软件包。一个运行的 LiveCD/LiveUSB环境及具备这些软件包的（所以也可以让无线网卡工作），但是安装系统则可能没有。确保你安装了符合当前内核版本的`linux-headers`软件包，加上相应的generic header软件包，这样就可以执行内核升级。

* 找到内核版本:

```
uname -r
```

显示输出 `4.18.0-10-generic`

要找到需要安装的linux-headers软件包，可以执行

```
dpkg --get-selections | grep headers
```

显示输出

```
linux-headers-4.18.0-10             install
linux-headers-4.18.0-10-generic     install
linux-headers-generic               install
```

可以将安装光盘添加作为软件包安装源（这个方法非常巧妙，利用了安装光盘中具备的所有必要软件包）：

```
mkdir /media/cdrom
mount -t iso9660 -o loop /mnt/ubuntu-budgie-18.10-desktop-amd64.iso /media/cdrom
apt-cdrom -m -d /media/cdrom add

sudo apt-get update
sudo apt-get --reinstall install bcmwl-kernel-source
```

不过，目前启动时候 `dmesg -T` 依然有一个内核call trace：

```
[三 3月  6 14:18:32 2019] IPv6: ADDRCONF(NETDEV_CHANGE): wlp3s0: link becomes ready
[三 3月  6 14:18:41 2019] WARNING: CPU: 7 PID: 578 at net/wireless/sme.c:945 cfg80211_roamed+0x217/0x230 [cfg80211]
[三 3月  6 14:18:41 2019] Modules linked in: rfcomm xt_CHECKSUM iptable_mangle ipt_MASQUERADE iptable_nat nf_nat_ipv4 nf_nat nf_conntrack_ipv4 nf_defrag_ipv4 xt_conntrack nf_conntrack ipt_REJECT nf_reject_ipv4 xt_tcpudp bridge stp llc ebtable_filter ebtables devlink ip6table_filter ip6_tables iptable_filter bpfilter cmac bnep nls_iso8859_1 snd_hda_codec_hdmi joydev applesmc input_polldev intel_rapl x86_pkg_temp_thermal intel_powerclamp coretemp kvm_intel kvm irqbypass crct10dif_pclmul crc32_pclmul ghash_clmulni_intel pcbc snd_hda_codec_cirrus snd_hda_codec_generic aesni_intel aes_x86_64 crypto_simd snd_hda_intel cryptd glue_helper wl(POE) snd_hda_codec snd_hda_core snd_hwdep btusb btrtl snd_pcm btbcm btintel bluetooth snd_seq_midi snd_seq_midi_event snd_rawmidi intel_cstate snd_seq ecdh_generic bcm5974 input_leds
[三 3月  6 14:18:41 2019]  intel_rapl_perf snd_seq_device snd_timer snd bdc_pci cfg80211 soundcore mei_me mei acpi_als kfifo_buf apple_gmux sbs industrialio mac_hid apple_bl sbshc sch_fq_codel parport_pc ppdev lp parport ip_tables x_tables autofs4 btrfs zstd_compress raid10 raid456 async_raid6_recov async_memcpy async_pq async_xor async_tx xor raid6_pq libcrc32c raid1 raid0 multipath linear hid_apple hid_generic usbhid hid nouveau gpio_ich mxm_wmi wmi i2c_algo_bit ttm drm_kms_helper syscopyarea sysfillrect sysimgblt uas fb_sys_fops ahci drm usb_storage libahci lpc_ich thunderbolt video
[三 3月  6 14:18:41 2019] CPU: 7 PID: 578 Comm: wl_event_handle Tainted: P           OE     4.18.0-15-generic #16-Ubuntu
[三 3月  6 14:18:41 2019] Hardware name: Apple Inc. MacBookPro11,3/Mac-2BD1B31983FE1663, BIOS 149.0.0.0.0 09/17/2018
[三 3月  6 14:18:41 2019] RIP: 0010:cfg80211_roamed+0x217/0x230 [cfg80211]
[三 3月  6 14:18:41 2019] Code: 00 00 00 49 8d 4d 70 4c 89 f7 45 0f b6 85 90 00 00 00 6a 02 48 8b 36 e8 37 95 fd ff 48 89 43 08 5a 48 85 c0 0f 85 2f fe ff ff <0f> 0b eb 82 0f 0b 48 8b 73 08 49 8b 7d 00 e8 56 90 fd ff e9 6e ff
[三 3月  6 14:18:41 2019] RSP: 0018:ffffb7f9027d3db0 EFLAGS: 00010246
[三 3月  6 14:18:41 2019] RAX: 0000000000000000 RBX: ffffb7f9027d3e00 RCX: 0000000000000002
[三 3月  6 14:18:41 2019] RDX: 0000000000000002 RSI: 00000000fffffe01 RDI: ffffffffc098e916
[三 3月  6 14:18:41 2019] RBP: ffffb7f9027d3de0 R08: 000000000000000b R09: 0000000000000000
[三 3月  6 14:18:41 2019] R10: ffffb7f9027d3e00 R11: ffff96d8a4dd6f7a R12: 00000000006000c0
[三 3月  6 14:18:41 2019] R13: ffff96d8a2962400 R14: ffff96d8a4dd62e0 R15: dead000000000100
[三 3月  6 14:18:41 2019] FS:  0000000000000000(0000) GS:ffff96d8bf3c0000(0000) knlGS:0000000000000000
[三 3月  6 14:18:41 2019] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[三 3月  6 14:18:41 2019] CR2: 00005645356ca378 CR3: 0000000224e0a004 CR4: 00000000001606e0
[三 3月  6 14:18:41 2019] Call Trace:
[三 3月  6 14:18:41 2019]  wl_bss_roaming_done.isra.25+0xd6/0x110 [wl]
[三 3月  6 14:18:41 2019]  ? wl_bss_roaming_done.isra.25+0xd6/0x110 [wl]
[三 3月  6 14:18:41 2019]  wl_notify_roaming_status+0x44/0x60 [wl]
[三 3月  6 14:18:41 2019]  ? down_interruptible+0x33/0x60
[三 3月  6 14:18:41 2019]  wl_event_handler+0x6c/0x150 [wl]
[三 3月  6 14:18:41 2019]  kthread+0x120/0x140
[三 3月  6 14:18:41 2019]  ? wl_notify_scan_status+0x230/0x230 [wl]
[三 3月  6 14:18:41 2019]  ? kthread_bind+0x40/0x40
[三 3月  6 14:18:41 2019]  ret_from_fork+0x35/0x40
[三 3月  6 14:18:41 2019] ---[ end trace b08b28e0c4c50fa4 ]---
[三 3月  6 14:18:53 2019] WARNING: CPU: 1 PID: 578 at net/wireless/sme.c:945 cfg80211_roamed+0x217/0x230 [cfg80211]
[三 3月  6 14:18:53 2019] Modules linked in: rfcomm xt_CHECKSUM iptable_mangle ipt_MASQUERADE iptable_nat nf_nat_ipv4 nf_nat nf_conntrack_ipv4 nf_defrag_ipv4 xt_conntrack nf_conntrack ipt_REJECT nf_reject_ipv4 xt_tcpudp bridge stp llc ebtable_filter ebtables devlink ip6table_filter ip6_tables iptable_filter bpfilter cmac bnep nls_iso8859_1 snd_hda_codec_hdmi joydev applesmc input_polldev intel_rapl x86_pkg_temp_thermal intel_powerclamp coretemp kvm_intel kvm irqbypass crct10dif_pclmul crc32_pclmul ghash_clmulni_intel pcbc snd_hda_codec_cirrus snd_hda_codec_generic aesni_intel aes_x86_64 crypto_simd snd_hda_intel cryptd glue_helper wl(POE) snd_hda_codec snd_hda_core snd_hwdep btusb btrtl snd_pcm btbcm btintel bluetooth snd_seq_midi snd_seq_midi_event snd_rawmidi intel_cstate snd_seq ecdh_generic bcm5974 input_leds
[三 3月  6 14:18:53 2019]  intel_rapl_perf snd_seq_device snd_timer snd bdc_pci cfg80211 soundcore mei_me mei acpi_als kfifo_buf apple_gmux sbs industrialio mac_hid apple_bl sbshc sch_fq_codel parport_pc ppdev lp parport ip_tables x_tables autofs4 btrfs zstd_compress raid10 raid456 async_raid6_recov async_memcpy async_pq async_xor async_tx xor raid6_pq libcrc32c raid1 raid0 multipath linear hid_apple hid_generic usbhid hid nouveau gpio_ich mxm_wmi wmi i2c_algo_bit ttm drm_kms_helper syscopyarea sysfillrect sysimgblt uas fb_sys_fops ahci drm usb_storage libahci lpc_ich thunderbolt video
[三 3月  6 14:18:53 2019] CPU: 1 PID: 578 Comm: wl_event_handle Tainted: P        W  OE     4.18.0-15-generic #16-Ubuntu
[三 3月  6 14:18:53 2019] Hardware name: Apple Inc. MacBookPro11,3/Mac-2BD1B31983FE1663, BIOS 149.0.0.0.0 09/17/2018
[三 3月  6 14:18:53 2019] RIP: 0010:cfg80211_roamed+0x217/0x230 [cfg80211]
[三 3月  6 14:18:53 2019] Code: 00 00 00 49 8d 4d 70 4c 89 f7 45 0f b6 85 90 00 00 00 6a 02 48 8b 36 e8 37 95 fd ff 48 89 43 08 5a 48 85 c0 0f 85 2f fe ff ff <0f> 0b eb 82 0f 0b 48 8b 73 08 49 8b 7d 00 e8 56 90 fd ff e9 6e ff
[三 3月  6 14:18:53 2019] RSP: 0018:ffffb7f9027d3db0 EFLAGS: 00010246
[三 3月  6 14:18:53 2019] RAX: 0000000000000000 RBX: ffffb7f9027d3e00 RCX: 0000000000000012
[三 3月  6 14:18:53 2019] RDX: 0000000000000002 RSI: 00000000fffffe01 RDI: ffffffffc098e916
[三 3月  6 14:18:53 2019] RBP: ffffb7f9027d3de0 R08: 000000000000000b R09: 0000000000000000
[三 3月  6 14:18:53 2019] R10: ffffb7f9027d3e00 R11: ffff96d8a4dd6f7a R12: 00000000006000c0
[三 3月  6 14:18:53 2019] R13: ffff96d8a2962400 R14: ffff96d8a4dd62e0 R15: dead000000000100
[三 3月  6 14:18:53 2019] FS:  0000000000000000(0000) GS:ffff96d8bf240000(0000) knlGS:0000000000000000
[三 3月  6 14:18:53 2019] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[三 3月  6 14:18:53 2019] CR2: 00007f3ca2d9c000 CR3: 0000000224e0a005 CR4: 00000000001606e0
[三 3月  6 14:18:53 2019] Call Trace:
[三 3月  6 14:18:53 2019]  wl_bss_roaming_done.isra.25+0xd6/0x110 [wl]
[三 3月  6 14:18:53 2019]  ? wl_bss_roaming_done.isra.25+0xd6/0x110 [wl]
[三 3月  6 14:18:53 2019]  wl_notify_roaming_status+0x44/0x60 [wl]
[三 3月  6 14:18:53 2019]  ? down_interruptible+0x33/0x60
[三 3月  6 14:18:53 2019]  wl_event_handler+0x6c/0x150 [wl]
[三 3月  6 14:18:53 2019]  kthread+0x120/0x140
[三 3月  6 14:18:53 2019]  ? wl_notify_scan_status+0x230/0x230 [wl]
[三 3月  6 14:18:53 2019]  ? kthread_bind+0x40/0x40
[三 3月  6 14:18:53 2019]  ret_from_fork+0x35/0x40
[三 3月  6 14:18:53 2019] ---[ end trace b08b28e0c4c50fa5 ]---
[三 3月  6 14:20:47 2019] aufs 4.18-20180910
[三 3月  6 14:20:47 2019] kauditd_printk_skb: 31 callbacks suppressed
[三 3月  6 14:20:47 2019] audit: type=1400 audit(1551853247.918:43): apparmor="STATUS" operation="profile_load" profile="unconfined" name="docker-default" pid=4011 comm="apparmor_parser"
[三 3月  6 14:20:47 2019] Bridge firewalling registered
[三 3月  6 14:20:47 2019] Initializing XFRM netlink socket
[三 3月  6 14:20:47 2019] IPv6: ADDRCONF(NETDEV_UP): docker0: link is not ready
```

由于报错中有 IPv6 相关，所以尝试关闭IPv6:

* 配置 `/etc/sysctl.d/10-ipv6-disalbe.conf` 内容如下:

```
net.ipv6.conf.all.disable_ipv6 = 1
```

然后执行

```
sysctl -p /etc/sysctl.d/10-ipv6-disalbe.conf
```

此时再检查 `ip addr` 可以看到所有接口的IPv6地址都消失。

# 参考

* [WifiDocs/Driver/bcm43xx](https://help.ubuntu.com/community/WifiDocs/Driver/bcm43xx)