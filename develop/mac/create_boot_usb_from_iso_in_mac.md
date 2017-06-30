> 本文摘自 [在Mac上安装Gentoo Linux](../../os/linux/gentoo/install_gentoo_on_macbook) 中有关启动U盘制作部分，专注于制作操作系统安装U盘。

```
hdiutil convert -format UDRW -o CentOS-7-x86_64-DVD-1611.img CentOS-7-x86_64-DVD-1611.iso
```

* 检查U盘挂载

```
$ df -h
...
/dev/disk2s1                        30Gi   11Mi   30Gi     1%       0          0  100%   /Volumes/U
```

* 卸载U盘

```
diskutil umountDisk /Volumes/U
```

* 执行镜像写入

```
sudo dd if=CentOS-7-x86_64-DVD-1611.img.dmg of=/dev/rdisk2 bs=10m
```