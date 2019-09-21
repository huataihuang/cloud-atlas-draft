在执行 `apt update && apt upgrade` 时提示:

```
The following packages have been kept back:
  libnvidia-cfg1-418 libnvidia-compute-418 libnvidia-decode-418 libnvidia-encode-418
  libnvidia-fbc1-418 libnvidia-gl-418 libnvidia-ifr1-418 nvidia-compute-utils-418 nvidia-dkms-418
  nvidia-driver-418 nvidia-kernel-source-418 nvidia-utils-418 xserver-xorg-video-nvidia-418
0 upgraded, 0 newly installed, 0 to remove and 13 not upgraded.
```

建议不要直接执行 `sudo apt-get distt-upgrade` ，会导致系统不稳定。需要单独安装每个软件包，在安装过程中，依赖会自动安装。

* 首先列出可以升级的软件包

```
apt list --upgradable
```

显示

```
Listing... Done
libnvidia-cfg1-418/bionic-updates 430.26-0ubuntu0.18.04.2 amd64 [upgradable from: 418.56-0ubuntu0~gpu18.04.1]
libnvidia-compute-418/bionic-updates 430.26-0ubuntu0.18.04.2 amd64 [upgradable from: 418.56-0ubuntu0~gpu18.04.1]
...
```

* 开始安装第一个列出的软件包:

```
sudo apt install libnvidia-cfg1-418
```

这个安装会自动处理依赖的安装。这个安装实际上是先安装你指定的 libnvidia-cfg1-418 ，然后系统具备了这个软件包后，会根据 upgradable 再自动升级到更高的最新版本  libnvidia-cfg1-430 。依次类推。

* 上述过程结束后执行:

```
apt list --upgradable
```

查看还缺少的软件包，例如，这里还有一个 `libnvidia-gl-418` 继续安装

* 然后执行清理，并再次升级:

```
sudo apt-get autoclean

sudo apt-get update && sudo apt-get dist-upgrade
```

# 参考

* [apt says packages have been kept back, what to do?](https://superuser.com/questions/1107334/apt-says-packages-have-been-kept-back-what-to-do)