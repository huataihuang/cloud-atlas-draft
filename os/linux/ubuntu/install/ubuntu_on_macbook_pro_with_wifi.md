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

# 参考

* [WifiDocs/Driver/bcm43xx](https://help.ubuntu.com/community/WifiDocs/Driver/bcm43xx)