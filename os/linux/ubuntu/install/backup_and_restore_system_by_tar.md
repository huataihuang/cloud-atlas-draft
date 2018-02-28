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

* 恢复之后还需要恢复没有包含在`--one-file-system`中的一些系统目录

```
mkdir /proc /sys /mnt /media
```

## 恢复GRUB

```
sudo -s
for f in dev dev/pts proc ; do mount --bind /$f /media/whatever/$f ; done
chroot /media/whatever
dpkg-reconfigure grub-pc
```

# 从网络恢复

* 接收服务器

确保接收服务器已经挂载磁盘目录`/mnt/disk`

```
nc -l 1024 | sudo tar -xvpzf - -C /media/whatever
```

> 这个命令中`-`字符表示`tar`接收从标准输入而不是一个文件，这里的标准输入是从pipe管道

* 发送服务器

```
cat backup.tar.gz | nc -q 0 <receiving host> 1024
```

> 备份文件解压缩通过管道经`nc`发送给远程服务器的1024端口

# 参考

* [BackupYourSystem/TAR](https://help.ubuntu.com/community/BackupYourSystem/TAR)
