和 [在Gentoo中使用broadcom无线网卡](../../gentoo/broadcom_wifi) 类似，在初次安装使用Fedora操作系统时，是不能识别Broadcom BCM4360无线网卡的。

[Broadcom b43驱动](https://wireless.wiki.kernel.org/en/users/Drivers/b43)可以用于 Broadcom SoftMAC chipsets 但是不支持 BCM4360芯片。可以使用wl驱动来代替。

# 方法一：编译（该方法未测试成功）

安装方法参考[No wifi after kernel upgrade](https://ask.fedoraproject.org/en/question/69411/no-wifi-after-kernel-upgrade/)即：

* 安装akmod，使用它来重建模块

```
# akmods --force 
Checking kmods exist for 4.0.4-303.fc22.x86_64             [  OK  ] 
Building and installing wl-kmod

# modprobe wl
```

确系统中有wl驱动加载

# 方法二：脚本（未验证）

[Broadcom BCM4360 not working in Fedora 24](https://www.reddit.com/r/Fedora/comments/4t3psm/broadcom_bcm4360_not_working_in_fedora_24/)提供了一个安装BCM4360驱动方法：


* 通过脚本安装

```bash
dnf update -y
wget http://git.io/vuLC7 -v -O fedora23_broadcom_wl_install.sh
sh ./fedora23_broadcom_wl_install.sh
```

`fedora23_broadcom_wl_install.sh`脚本如下

```bash
#/usr/bin/env bash

# Install some pacakages we'll need to compile the driver below.
sudo dnf install gcc kernel-devel -y

# Create working dir for Broadcom driver files and patches.
mkdir hybrid_wl_f23

# Change to working dir.
cd hybrid_wl_f23

if [ 'x86_64' == `uname -m` ]; then
	# 64-bit driver files.
	FILE='hybrid-v35_64-nodebug-pcoem-6_30_223_271.tar.gz'
else
	# 32-bit driver files.
	FILE='hybrid-v35-nodebug-pcoem-6_30_223_271.tar.gz'
fi

# Download Broadcom Linux Wi-Fi driver.
wget http://www.broadcom.com/docs/linux_sta/$FILE

# Extract driver files.
tar zxvf $FILE

# Compile driver.
make clean && make

# Install driver.
sudo make install

# Update available drivers.
sudo depmod -a

# Unload conflicting drivers.
sudo rmmod b43 ssb bcma

# Load the driver.
sudo modprobe wl

# Blacklist conflicting drivers.
printf 'blacklist b43\nblacklist ssb\nblacklist bcma\n' | sudo tee /etc/modprobe.d/wl.conf

# Load driver automatically at boot time.
echo 'wl' | sudo tee /etc/modules-load.d/wl.conf

# Connect to a Wi-Fi network via NetworkManager...
```

# 方法三：wl驱动（非常简便，推荐）

参考 [Running Broadcom BCM4630 on Fedora 19](https://ask.fedoraproject.org/en/question/34399/running-broadcom-bcm4630-on-fedora-19/)

安装闭源驱动：从 http://www.rpmfusion.org/  non-free repo 下载wl 安装软件包 `kmod-wl`

> [RPM Fusion](https://rpmfusion.org/)是提供Fedora和Red Hat没有发行版发布的软件，这些软件是预先编译好提供给所有Fedora版本和RHEL及clone版本。

针对Fedora 26需要下载和安装以下两个软件包：

* [akmod-wl](http://download1.rpmfusion.org/nonfree/fedora/releases/26/Everything/x86_64/os/repoview/akmod-wl.html)
* [kmod-wl](http://download1.rpmfusion.org/nonfree/fedora/releases/26/Everything/x86_64/os/repoview/kmod-wl.html)

> 上述两个软件包依赖非常多，所以需要通过添加repo方式来安装

* 添加rpmfusion repo源

```bash
yum localinstall http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
yum localinstall http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

或者使用命令（参考[在Fedora中播放mp4视频](play_with_mp4_in_fedora)）：

```
su -c 'dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm'
```

* 更新系统

```
yum update
```

* 重启

```
reboot
```

* 安装网卡驱动

```
yum install kernel-devel akmod-wl

sudo akmods
```

* 完成后如果没有wifi设备，手动加载

检查模块

```
sudo lsmod | grep wl
```

如果模块没有加载则执行命令

```
sudo modprobe wl
```


# 参考

* [(Macbook Air)BCM4360网卡Linux(Ubuntu/Fedora)驱动安装总结](http://m.aichengxu.com/linux/1111974.htm) - 推荐：实践验证该文档Fedora 26上可行
* [Broadcom BCM4360 not working in Fedora 24](https://www.reddit.com/r/Fedora/comments/4t3psm/broadcom_bcm4360_not_working_in_fedora_24/)
* [No wifi after kernel upgrade](https://ask.fedoraproject.org/en/question/69411/no-wifi-after-kernel-upgrade/)
* [Broadcom b43驱动](https://wireless.wiki.kernel.org/en/users/Drivers/b43)
* [How To: Wireless LAN with Broadcom BCM4312 in Fedora 11](https://gofedora.com/how-to-wireless-lan-broadcom-bcm4312-fedora-11/)