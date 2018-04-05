> 扩大VM卷分区的操作参考[扩展lvm卷](decrease_lvm)

本文是为了实现[通过systemd设置fedora系统hibernate休眠](os/linux/redhat/system_administration/systemd/hibernate_with_fedora_in_laptop)，预先准备足够的swap分区空间。

> 最初在安装Fedora操作系统时，只设置了内存一半大小的swap分区。后来考虑实现Hibernate时发现需要足够的swap空间，则尝试通过缩小`/dev/mapper/fedora-home`逻辑卷，扩展`/dev/mapper/fedora-swap`逻辑卷来实现。本文为实践笔记。

注意：`ext4`文件系统支持`在线扩展`和`离线收缩`，但是`XFS`文件系统当前不支持收缩。

> 有关Linux卷管理的概念及基本操作，请参考[Linux卷管理](linux_lvm)

# LVM Resize

要实现`decrease`或者`shrink`，即缩LVM逻辑卷（分区）则首先要完成LVM逻辑卷上层的文件系统的缩减，否则会导致数据丢失。

## 收缩root卷

root volume通常是挂载在`/`的逻辑卷。由于在运行操作系统时不能umount根目录，所以如果要缩小根文件系统所在的文件系统，需要使用LiveCD来启动主机。一旦从LiveCD启动后，首先将磁盘中的 LVM 卷导入（从硬盘启动时是自动由操作系统完成的，但是从LiveCD启动需要手工执行）：

```
vgchange -a y
```

## 收缩`非`root卷

本文的案例是收缩`/home`目录所在的`/dev/mapper/fedora-home`逻辑卷

```
/dev/mapper/fedora-home  165G  119G   39G  76% /home
```

```
$ sudo lvdisplay

  --- Logical volume ---
  LV Path                /dev/fedora/home
  LV Name                home
  VG Name                fedora
  LV UUID                MMkPEv-s16T-OGme-bndz-wwge-qcDr-CipZqW
  LV Write Access        read/write
  LV Creation host, time DevStudio, 2017-10-18 16:31:25 +0800
  LV Status              available
  # open                 1
  LV Size                168.25 GiB
  Current LE             43073
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:2
   
  --- Logical volume ---
  LV Path                /dev/fedora/swap
  LV Name                swap
  VG Name                fedora
  LV UUID                6gTE0r-9MZr-nv4v-NMkG-UhKV-aks3-SjuNhg
  LV Write Access        read/write
  LV Creation host, time DevStudio, 2017-10-18 16:31:27 +0800
  LV Status              available
  # open                 2
  LV Size                <7.86 GiB
  Current LE             2011
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:1
```

* 退出所有会访问`/home`目录的账号（普通用户），然后以`root`身份登陆系统。这样可以确保没有进程访问`/home`，就可以卸载：

```
umount /home
```

* 检查文件系统一致性

在缩减LVM卷之前，必须运行文件系统检查。如果没有做文件系统检查，会遇到不能进一步处理的错误信息。这将使得resize文件系统的步骤进入一个会导致数据丢失的错误状态。使用`-f`参数是强制进行检查，即使文件系统看上去是干净的，而使用`-y`参数表示如果有发现文件系统问题则直接修复

```
e2fsck -fy /dev/mapper/fedora-home
```

* 缩小文件系统

为了能够安全缩减逻辑卷，建议将逻辑卷上的文件系统缩小到比将要缩小的逻辑卷更小一点。这样可以避免LVM逻辑卷比文件系统更小而导致数据丢失。此外，不用担心，最后步骤会回收这部分空间。

```
resize2fs /dev/mapper/fedora-home 157G
```

> 这里将`fedora-home`逻辑卷缩小到`157G`，比原先小11GB，以便能够把空间加给`fedora-swap`逻辑卷。

* 缩减逻辑卷

```
lvreduce -L 158G /dev/mapper/fedora-home
```

> 这里设置LVM逻辑卷比文件系统大1G，避免数据损坏。也可以使用如下命令表示减小10G（即168-10）

```
lvreduce -L -10G /dev/mapper/fedora-home
```

* 完成了LVM卷缩减以后，可以看到文件系统比LVM卷小，这样就浪费了一点空间。解决的方法是再次使用`resize2fs`命令，但是不带任何参数，则会自动把文件系统扩展到和LVM卷一样大小，就不会浪费空间了。


```
resize2fs /dev/mapper/fedora-home
```

* 最后在挂载上文件系统

```
mount /dev/mapper/fedora-home /home
```

> 同样的操作也针对`/dev/mapper/swapper`操作，扩展swap空间:

```
swapoff /dev/fedora/swap
lvextend -L +10.25G /dev/fedora/swap
mkswap /dev/fedora/swap
swapon /dev/fedora/swap
```

# 参考

* [LVM Resize – How to Decrease an LVM Partition](https://www.rootusers.com/lvm-resize-how-to-decrease-an-lvm-partition/)