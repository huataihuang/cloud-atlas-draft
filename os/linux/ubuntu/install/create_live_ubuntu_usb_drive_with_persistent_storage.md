# `mkusb`工具

[mkusb - tool to create boot drives](https://help.ubuntu.com/community/mkusb)是一个易于使用的clone iso镜像或压缩镜像文件到U盘的工具。底层使用`dd`工具，目标设备是固态存储设备，通常时USB设备。

这个该哦那句提供了一种将iso文件clone到存储设备并使之能够作为启动设备，提供一种混合iso文件。

> 注意：目标设备的数据会被完全抹去！！！

* 添加mkusb PPA

对于标准Ubuntu发行版，需要添加`universe`软件仓库，不过Kubuntu，Lubuntu...Xubuntu都已经默认激活，可以忽略这步：

```
sudo add-apt-repository universe  # only for standard Ubuntu
```

以下是安装过程

```
sudo add-apt-repository ppa:mkusb/ppa  # and press Enter
sudo apt-get update
sudo apt-get install mkusb mkusb-nox usb-pack-efi
```

## 使用`mkusb`

当前`mkusb`工具已经改进成名为`dus`系列工具：

* `dus-live` - clone标准模式，适合所有hybrid iso文件
* `dus-persistent` - 创建持久化live驱动设备，具备一个`casper-rw`分区用于数据持久化。这个方法只在Debian Jessie和当前的Ubuntu版本测试过，对其他linux发行版可能不能工作。设备可以同时使用UEFI和BIOS模式启动。
* `dus`也可以创建Windows 7-10的启动安装U盘
* `dus-wipe` 擦除设备

不过，使用`guidus`比较方便：

```
guidus xubuntu-16.04.3-desktop-amd64.iso
```

当传递ISO文件作为参数的时候，`dus`就会提供一个选项`p`，也就时`Persistent live`。如果没有任何参数，这个选项会看不到。

## `dus`是如何实现存储持久化的？

最初我以为`dus`只是在iso镜像中添加了一些挂载分区和软链接功能方便从LiveCD启动后保存一些文件。实际上，`dus`非常巧妙地采用了和`Docker`一样的层次化文件系统`AUFS`，这样底层的ISO文件系统是只读的，上层文件系统是U盘中可读写分区：

```
Filesystem      Size  Used Avail Use% Mounted on
udev            1.8G     0  1.8G   0% /dev
tmpfs           370M  6.0M  364M   2% /run
/dev/sdb4       1.3G  1.3G     0 100% /cdrom
/dev/loop0      1.2G  1.2G     0 100% /rofs
aufs            108G  206M  103G   1% /
tmpfs           1.9G  164K  1.9G   1% /dev/shm
tmpfs           5.0M  4.0K  5.0M   1% /run/lock
tmpfs           1.9G     0  1.9G   0% /sys/fs/cgroup
tmpfs           1.9G  8.0K  1.9G   1% /tmp
tmpfs           370M   36K  370M   1% /run/user/999
```

这样启动后就可以直接在Live环境读写，并且可以安装软件修改配置，所有的系统修改在下次重启后依然存在。几乎就可以认为是一个完整的操作系统了，非常方便做一些定制修改（例如安装一个`openssh-server`方便远程登录操作），以便能够重复使用作为安装U盘。

> 以上测试在MacBook Air上构建Xubuntu 16.04.3 LTS版本LiveCD persistent模式成功，非常赞！

# 其他

> [LinuxLive USB Creator](http://www.linuxliveusb.com/en/home)是非常有用的Linux Live USB工具 -- 和常用的LiveCD不同的是，创建U盘启动不仅是安装盘，同时也提供了持久化的存储空间，以便能够通过Live方式启动主机，同时保存数据。
>
> 这个工具是Windows平台工具，开源。不过，我没有尝试过。

# 参考

* [How to make a live usb persistent](https://askubuntu.com/questions/772744/how-to-make-a-live-usb-persistent)
* [How to Create a Live Ubuntu USB Drive With Persistent Storage](https://www.howtogeek.com/howto/14912/create-a-persistent-bootable-ubuntu-usb-flash-drive/)