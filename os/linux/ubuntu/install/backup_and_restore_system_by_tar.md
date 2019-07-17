为了能够编译LFS([Linux From Scratch(LFS)](../../lfs/README))，我尝试[在U盘上安装Ubuntu](install_ubuntu_to_usb_stick)但是尚未成功，所以改成先安装到笔记本的本地磁盘，然后再通过TAR方式备份恢复到U盘运行。

# 备份前准备

在备份系统前，最好先清空“垃圾箱”并删除所有不许要的文件和程序:

* 清理掉浏览器缓存，密码
* 清理掉邮件帐号
* 清理掉密码、私钥和私有文件

# 备份

```
cd /
tar -cvpzf backup.tar.gz --exclude=/backup.tar.gz --exclude=/home/huatai/Dropbox --one-file-system /
```

参数解释：

* `c` - 创建新的备份归档
* `v` - 详细模式，`tar`命令将在屏幕显示所有过程
* `p` - 保留归档文件的权限设置
* `z` - 使用gzip压缩
* `f <filename>` - 指定存储的备份文件名
* `--exclude=/example/path` 备份中不包括指定的文件
* `--one-file-system` - 不包含其他文件系统中文件。如果你需要其他文件系统，例如独立的`/home`分区，或者也想包含`/media`挂载的扩展目录中文件，则要么单独备份这些文件，要么不使用这个参数。如果不使用这个参数，就需要使用`--exclude=`参数一一指定不包含的目录。这些不包含的目录有`/proc`，`/sys`，`/mnt`，`/media`，`/run`和`/dev`目录。

以下时手工设置不备份目录的方法，例如：

```
cd / # THIS CD IS IMPORTANT THE FOLLOWING LONG COMMAND IS RUN FROM /
tar -cvpzf backup.tar.gz \
--exclude=/backup.tar.gz \
--exclude=/proc \
--exclude=/tmp \
--exclude=/mnt \
--exclude=/dev \
--exclude=/sys \
--exclude=/run \ 
--exclude=/media \ 
--exclude=/var/log \
--exclude=/var/cache/apt/archives \
--exclude=/usr/src/linux-headers* \ 
--exclude=/home/*/.gvfs \
--exclude=/home/*/.cache \ 
--exclude=/home/*/.local/share/Trash /
```

如果需要将备份文件分割成小文件：

```
tar -cvpz <put options here> / | split -d -b 3900m - /name/of/backup.tar.gz. 
```

# 通过网络备份

## 使用Netcat通过网络备份

netcat提供了非常方便的网络备份：

* 在接收服务器上：

```
nc -l 1024 > backup.tar.gz
```

* 发送服务器上：

```
tar -cvpz <all those other options like above> / | nc -q 0 <receiving host> 1024 
```

## 使用SSH通过网络备份

```
tar -cvpz <all those other options like above> / | ssh <backuphost> "( cat > ssh_backup.tar.gz )"
```

# 恢复

假设需要恢复的目录挂载在`/media`目录：

```
sudo tar -xvpzf /path/to/backup.tar.gz -C /media/whatever --numeric-owner
```

* `x` 告诉tar解压缩
* `-C <directory>` 告知tar在解压缩文件之前先进入指定`<directory>`目录，这样就会恢复在这目录下。这里的案例是将文件恢复到`/media/whatever`目录，也就是挂载分区的目录
* `--numeric-owner` 告诉tar恢复文件的owner帐号数字，而不是匹配用于恢复系统的用户名帐号。

## 恢复步骤

* 如果你能够通过live-cd启动主机，建议采用chroot方式进入恢复后的操作系统目录（这里假设`/media/sda5`）

```
mount -t proc proc /media/sda5/proc
mount --rbind /sys /media/sda5/sys
mount --make-rslave /media/sda5/sys
mount --rbind /dev /media/sda5/dev
mount --make-rslave /media/sda5/dev
```

> `--make-rslave`参数在后面安装的systemd支持所需

进入Ubuntu系统

```
chroot /media/sda5 /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

>（实际可忽略）恢复之后可能还需要恢复没有包含在`--one-file-system`中的一些系统目录

```
cd /media/sda5
mkdir proc sys mnt media
```

* 如果是在不同的主机上恢复系统，需要修改`/etc/fstab`以及`/boot/grub`

例如`/boot/grub/grub.cfg`中所有原 `root=UUID=3db306b6-2d5e-4e4c-8d22-4fe70ce0d0a4` 需要修改成新的分区UUID `root=`

## 恢复GRUB

```
sudo -s
for f in dev dev/pts proc ; do mount --bind /$f /media/whatever/$f ; done
chroot /media/whatever
dpkg-reconfigure grub-pc
```

遇到无法启动的问题则需要确保：

* UEFI启动的分区必须是FAT32，独立分区（`/dev/sda1`），并且挂载到`/boot`，这样才能够启动
* 如果是多Linux操作系统启动，需要把多个操作系统到启动内核都复制到同一个`/boot`分区
* 设置内核启动参数中`root=PARTUUID=5e878358-02`，应该使用的是分区UUID，这个分区UUID是`parted`划分分区时候创建的标记

> 详细参考我的实践

> [How to Repair, Restore, or Reinstall Grub 2 with a Ubuntu Live CD or USB](http://howtoubuntu.org/how-to-repair-restore-reinstall-grub-2-with-a-ubuntu-live-cd)提供了一个修复方法：

```
grub-install /dev/sdX

grub-install --recheck /dev/sdX

update-grub
```

此外，在CentOS论坛有一篇[multi boot with Ubuntu](https://www.centos.org/forums/viewtopic.php?t=15774)可以参考，方法是先安装CentOS，然后再安装Ubntu。最后在Ubuntu的`/etc/grub.d/40_custom`中添加CentOS内容

```bash
#!/bin/sh
exec tail -n +3 $0
# This file provides an easy way to add custom menu entries.  Simply type the
# menu entries you want to add after this comment.  Be careful not to change
# the 'exec tail' line above.
###
menuentry "Centos-5.4" {
set root=(hd0,[b]1[/b])
chainloader +1
}
```

然后执行`sudo update-grub`或者`sudo update-grub2`就可以双启动。

# 从网络恢复

* 接收服务器

> 以下案例假设恢复到分区`/dev/sda5`

确保接收服务器已经挂载磁盘`/dev/sda5`目录`/media/sda5`

```
mkdir /media/sda5
mount /dev/sda5 /media/sda5
```

```
nc -l 1024 | sudo tar -xvpzf - -C /media/sda5
```

> 这个命令中`-`字符表示`tar`接收从标准输入而不是一个文件，这里的标准输入是从pipe管道

这里如果出现报错`Ncat: socket: Address family not supported by protocol QUITTING.`请检查一下服务器是否禁止了`IPv6`，默认情况下`nc`会尝试同时使用`IPv4`和`IPv6`。

* 发送服务器

```
cat backup.tar.gz | nc -q 0 <receiving host> 1024
```

> 备份文件解压缩通过管道经`nc`发送给远程服务器的1024端口

# 参考

* [BackupYourSystem/TAR](https://help.ubuntu.com/community/BackupYourSystem/TAR)
