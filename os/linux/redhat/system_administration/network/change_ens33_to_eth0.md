安装升级CentOS7之后，系统的网卡命名可能已经不是传统的eth0了，例如在VMware workstion中，默认设备是 `ens33` ，对于一些应用运行环境，可能已经在环境脚本、license模块使用了`eth0`这样的网卡命名，不太容易修改。所以需要将这种非传统`ethX`命名恢复回去。

在Fedora19以上版本，包括CentOS7，最简单的恢复旧内核/modules/udev命名以太网方法是传递内核参数：

- `net.ifnames=0`
- `biosdevname=0`

> 如果Fedora 18或更早版本，则只需要传递 `biosdevname=0`

具体操作步骤：

- 修改 `/etc/default/grub` 
- 在 `GRUB_CMDLINE_LINUX` 行添加 `net.ifnames=0 biosdevname=0`
- 重新生成grub配置:

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

- 重启系统
- 修订 `/etc/sysconfig/network-scripts/ifcfg-*` 配置文件，需要重命名而且修订配置中的设备名

# 有关eth0和新的网卡命名

freedesktop.org开发了systemd系统，从systemd的v197版本开始，修改了网卡命名方式，以便能够获得本地网卡，WLAN，WWAN接口的稳定命名。

对于udev原生命名方式：

* Names incorporating Firmware/BIOS provided index numbers for on-board devices (example: eno1)
* Names incorporating Firmware/BIOS provided PCI Express hotplug slot index numbers (example: ens1)
* Names incorporating physical/geographical location of the connector of the hardware (example: enp2s0)
* Names incorporating the interfaces's MAC address (example: enx78e7d1ea46da)
* Classic, unpredictable kernel-native ethX naming (example: eth0)

默认，从systemd v197开始，将依次按照上述规律进行设备命名。首先firmware提供索引名字则使用策略1，不行的话就使用策略2，也就是针对Firmware/BIOS提供PCIE热插拔插口索引命名设备；不行话再使用策略3，依次类推。

在 [Red Hat Enterprise Linux 7 Networking Guide - CHAPTER 11. CONSISTENT NETWORK DEVICE NAMING](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/ch-consistent_network_device_naming#sec-Naming_Schemes_Hierarchy) 也解释了网卡命名原则。

# 参考

* [How can I change the default “ens33” network device to old “eth0” on Fedora 19?](https://unix.stackexchange.com/questions/81834/how-can-i-change-the-default-ens33-network-device-to-old-eth0-on-fedora-19)