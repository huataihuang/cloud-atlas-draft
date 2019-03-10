# 问题

在 MacBook Pro上安装Ubuntu Server遇到的问题有：

* 启动安装是字符界面，并且没有提供MacBook Pro的默认网卡驱动，导致无法连接Internet

参考 [no WiFi networks on Ubuntu Macbook (Broadcom)](https://ubuntuforums.org/showthread.php?t=2391053&page=2) 采用的是通过有线连接，安装驱动:

```
sudo apt purge bcmwl-kernel-source
sudo apt install firmware-b43-installer
sudo apt purge broadcom-sta-dkms
sudo modprobe -r wl
sudo modprobe b43
```

# 实践

* 安装过程采用USB网卡连接有线网络，先完成mini安装