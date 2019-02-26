在[在MacBook Pro上运行ubuntu设置WIFI](ubuntu_on_macbook_pro_with_wifi)遇到一个问题：初始安装的Ubuntu由于licence原因，并没有安装Broadcom 43XX的网卡驱动，导致无法连接网络。而最方便安装网卡私有驱动STA的方法就是联网通过Internet安装。

这个鸡和蛋的问题看起来有点麻烦，不过还好，可以通过将安装.iso镜像复制到硬盘中，然后转换成软件仓库模式，以便能够[手工安装STA私有驱动](ubuntu_on_macbook_pro)。

> 注意：挂载光盘的目录固定是 `/media/cdrom` ，我实践发现挂载其他目录会在导致 `apt install`时候，依然要求挂载光盘到 `/media/cdrom`

```
mkdir /media/cdrom
mount -t iso9660 -o loop /mnt/ubuntu-budgie-18.10-desktop-amd64.iso /media/cdrom
apt-cdrom -m -d /media/cdrom add
```

注意：

* `apt-cdrom`的参数 `-d /media/cdrom` 表示挂载cdrom的目
* `add` 指令表示添加到仓库
* `-m` 参数表示不需要`apt-cdrom`重新挂载磁盘镜像，否则会umount掉第二步挂载iso的目录

此时 apt-cdrom 会修改 `/etc/apt/sources.list` ，如果要删除掉  cdrom 作为安装源，只需要从 `/etc/apt/sources.list` 中移除 "deb cdrom:" 行。

注意：

在 ubuntu-budgie-18.10-desktop-amd64.iso 中实际上只有少量软件包，因为这个iso文件实际上是LiveDVD。而要安装软件，需要从LiveDVD中复制出根文件系统到存储上，并安装这些软件包到存储。

```
grep ^Package: /var/lib/apt/lists/Ubuntu*Packages | awk '{ print $2 }'
```

而 ubuntu 的server版本iso则具有大量的软件包，但是没有桌面环境包。如果需要更多的软件包，可以改为使用server版本的来构建repositry。

接下来就是安装需要的软件包了，例如我需要安装一个支持Broadcom网卡的驱动：

```
sudo apt-get update
sudo apt-get --reinstall install bcmwl-kernel-source
```

# 参考

* [Ubuntu 16.04: Install package from DVD](https://www.hiroom2.com/2016/08/12/ubuntu-16-04-install-package-from-dvd/) - 不仅提供了本文描述的方法，而且还完整介绍了通过DVD制作本地安装的软件仓库方法（不过这个我没有实践，有待后续大规模部署内部服务器的时候测试）