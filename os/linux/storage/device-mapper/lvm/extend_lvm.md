> 这是很久以前一个项目工作案例：由于用户数据增长过快，导致一个LVM卷文件文件系统爆满，用户无法存储数据。紧急将原先项目预留的空间划分给该逻辑卷。
>
> 存储设备是一台外置的SCSI RAID存储器，在项目最初部署的时候，对存储裸磁盘采用LVM构建了卷管理，以便能够根据项目用户数据使用情况灵活调整。

# LVM卷说明

项目有一个存储卷空间爆满

```bash
df -h
```

显示输出存储卷已经爆满：

```
Filesystem            Size  Used Avail Use% Mounted on
/dev/mapper/VGdata-LVe3
                      493G  468G     0 100% /email/e3
```

> 不过在以前建设的时候，实际上已经预留了空间。（存储有1.2T空间预留）

* VG检查

```
vgdisplay
```

显示VG中

```
  --- Volume group ---
  VG Name               VGdata
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  7
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                4
  Open LV               4
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               3.59 TB
  PE Size               4.00 MB
  Total PE              940543
  Alloc PE / Size       614400 / 2.34 TB
  Free  PE / Size       326143 / 1.24 TB
  VG UUID               pald22-Q2AX-XuIZ-hk47-i5hv-wZ0j-zJb5JW
```

这里可以看到`Free  PE`显示存储有大约1.2T空间预留。


* LV检查 - 可以看到 `/dev/mapper/VGdata-LVe3` 这个逻辑卷 （`LV Name                /dev/VGdata/LVe3`）当前空间是500G（`LV Size                500.00 GB`）

```
lvdisplay
```

```
  --- Logical volume ---
  LV Name                /dev/VGdata/LVe3
  VG Name                VGdata
  LV UUID                om73A6-cmv6-tbRK-od8I-KgKL-r9E5-UQdayr
  LV Write Access        read/write
  LV Status              available
  # open                 1
  LV Size                500.00 GB
  Current LE             128000
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0
```

# 扩展逻辑卷

* 给卷`LVe3`添加300G空间

```bash
lvextend -L+300G /dev/VGdata/LVe3
```

* 停止挂载该卷的NFS服务（针对案例可选，需要确保无读写访问文件系统才能卸载该卷上的文件系统）

> 扩展ext文件系统的时候，需要先umount文件系统，此时需要停止访问这个文件系统

修改 `/etc/exports` 注释掉 `/email/e3` 卷输出

```
#/email/e3  10.1.1.0/24(rw,sync,no_root_squash)
```

重新输出NFS

```
exportfs -r
```

* 然后卸载文件系统挂载

```
umount /email/e3
```

* 扩展文件系统

```
resize2fs /dev/VGdata/LVe3
```

如果时间宽裕，不采用任何参数的`resize2fs`命令会提示需要先`fsck`磁盘设备。

但是，由于是故障抢修，并且有把握存储服务器没有出现过意外断电等非常情况，文件系统可以保证完整的，则可以跳过`fsck`过程。

> 注：对于邮件存储海量文件系统，500G的存储空间进行fsck是一个非常漫长的过程，在故障抢修过程中可能是不愿意花费这个时间的（前提是文件系统是可靠的，否则还是不要冒险忽略这个fsck过程）。

添加`-f`参数来使用`resize2fs`命令以忽略`fsck`过程：

```
resize2fs -f /dev/VGdata/LVe3
```

* 扩展完成后再挂载文件系统

```
mount -t ext3 /dev/VGdata/LVe3 /email/e3
```

# Ext4文件系统支持在线扩展

参考[Resizing an Ext4 File System](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/storage_administration_guide/ext4grow):

`ext4`文件系统支持在线（`mounted`）扩展，但是如果要收缩（`decrease`）文件系统，则需要先卸载（`umounted`）。但是，需要注意，扩展`mounted`在线状态的ext4文件系统，需要确保已经激活了`resize_inode`共嫩，否则就需要先卸载才能`resize2fs` （[Extending a Mounted Ext4 File System on LVM in Linux](https://www.systutorials.com/5621/extending-a-mounted-ext4-file-system-on-lvm-in-linux/)）。

以下命令检查逻辑卷是否支持`resize_inode`

```
sudo tune2fs -l /dev/mapper/fedora-home | grep resize_inode
```

输出显示特性有`resize_inode`

```
Filesystem features:      has_journal ext_attr resize_inode dir_index filetype needs_recovery extent 64bit flex_bg sparse_super large_file huge_file uninit_bg dir_nlink extra_isize
```

# 参考

* [Extending a logical volume](http://tldp.org/HOWTO/LVM-HOWTO/extendlv.html)