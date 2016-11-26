> 本文是在CentOS 7上实践部署Btrfs文件系统，实现单磁盘卷管理和RAID功能

# 安装工具包

* RedHat EPEL / CentOS

```
yum install btrfs-progs -y
```

* debian / ubuntu

```
apt-get install btrfs-tools -y
```

# 单磁盘btrfs操作

对于构建分布式文件系统的底层文件系统，不需要构建RAID，可以采用单盘操作。这里的案例是采用 `/dev/sda4`主分区作为btrfs

```
fdisk /dev/sda
```

创建磁盘分区 `/dev/sda4`

* 使用Btrfs格式化文件系统

```
mkfs.btrfs /dev/sda4
```

此时提示

```
/dev/sda4 appears to contain a partition table (dos).
Error: Use the -f option to force overwrite.
```

这是因为这个分区是一个以前删除的包含文件系统的分区（最早这个分区是ext4文件系统分区），所以重新创建同一位置的分区而没有事先擦除过（可以使用 `dd if=/dev/zero of=/dev/sda4 bs=512 count=1024`或者使用`wipefs`），就会报告上述错误。实际是一种提示你可能划分错分区的告警。如果确定分区没有错误，可以强制创建新文件系统（`mkfs.btrfs -f /dev/sda4`），或者使用`wipefs`工具来完成旧分区信息擦除。

```
wipefs -a -f /dev/sda4
```

```
Options:
 -a, --all           wipe all magic strings (BE CAREFUL!)
 -f, --force         force erasure
```

此时提示

```
/dev/sda4: 2 bytes were erased at offset 0x000001fe (dos): 55 aa
/dev/sda4: calling ioclt to re-read partition table: Invalid argument
```

再次执行`partprobe`扫描分区，然后重新创建btrfs文件系统就可以成功。可以看到输出提示如下

```
Turning ON incompat feature 'extref': increased hardlink limit per file to 65536
Turning ON incompat feature 'skinny-metadata': reduced-size metadata extent refs
fs created label (null) on /dev/sda4
	nodesize 16384 leafsize 16384 sectorsize 4096 size 1.04TiB
```

> 参考 [Error when creating BTRFS Filesystem](http://unix.stackexchange.com/questions/128512/error-when-creating-btrfs-filesystem)

# 检查btrfs文件系统

```
btrfs filesystem show /dev/sdb4
```

显示输出

```
Label: none  uuid: e9191083-94ea-4709-a776-218c473c2bc1
	Total devices 1 FS bytes used 112.00KiB
	devid    1 size 1.04TiB used 2.04GiB path /dev/sda4
```

# 挂载btrfs文件系统

* 挂载btrfs文件系统方法

```
mkdir /data
mount /dev/sda4 /data
```

* 如果要启用btrfs的压缩功能（默认是`zlib`），可以使用`-o compress=`参数。默认的`zlib`压缩方式的压缩比较高，如使用`lzo`压缩方式则速度较快且CPU负载较轻。使用压缩模式，特别是`lzo`压缩模式，可以提高数据通过性能。注意，btrfs不会压缩已经在应用层压缩过的文件（如视频，音乐，图像等）

```
mount -o compress=lzo /dev/sda4 /data
mount -o compress=zlib /dev/sda4 /data
mount -o compress /dev/sda4 /data
```

然后添加`/etc/fstab`设置如下

```
/dev/sda4    /data    btrfs    defaults,compress=lzo  0    1
```

# 文件系统故障恢复

如果有一个btrfs文件系统故障，可以通过`recovery`挂载参数挂载，此时会尝试seek并找找寻文件系统根的可用副本：

```
mount -o recovery /dev/sda4 /data
```

# 扩容和缩容btrfs文件系统

* 缩小2G空间

```
btrfs filesystem resize -2g /data
```

* 缩小500M空间

```
btrfs filesystem resize -500m /data
```

* 扩大1g空间

```
btrfs filesystem resize +1g /data
```

# 多磁盘btrfs

Btrfs也支持多块磁盘构建RAID

* meta磁盘可以采用单磁盘

```
mkfs.btrfs -m single /dev/sdb
```

> `-m`表示`metadata`

* 如果要构建RAID0模式的metadata磁盘（这样性能更好）

```
mkfs.btrfs -m raid0 /dev/sdb /dev/sdc /dev/sdd
```

* 如果要构建冗余的数据磁盘（RAID1）同时构建没有冗余的单metadata磁盘

```
mkfs.btrfs -m raid0 -d raid1 /dev/sdb /dev/sdc /dev/sdd
```

* 如果需要构建同时数据冗余的metadata磁盘和数据磁盘，则只要使用`-d raid1`就可以，因为`meatdata`磁盘默认就是RAID1

```
mkfs.btrfs -d raid1 /dev/sdb /dev/sdc /dev/sdd
```

* 也可以使用RAID10（`-m raid10`或`-d raid10`），此时需要至少4快磁盘。不过，对于btrfs，不强制要求磁盘容量一样大小。

# 增加或删除物理磁盘

可以在线增加磁盘或者删除磁盘，非常方便

```
btrfs device add /dev/sde /data
```

然后检查文件系统

```
btrfs filesystem show /dev/sde
```

此时可以看到`/dev/sde`设备虽然被添加，但是还没有被使用。如果使用的是**非**`RAID0`模式，可以使用`balance`命令来重新平衡数据和metadata

```
btrfs filesystem balance /data
```

可以删除掉`没有损坏`(**intact**)的硬盘（但是剔除故障磁盘会比较麻烦，见后述）

```
btrfs device delete /dev/sdc /data
```

## 剔除故障磁盘

要移除一个`故障`（**failed**）的磁盘，先umount文件系统，

```
umount /data
```

然后挂载成降级模式

```
mount -o degraded /dev/sdb /mnt
```

这样就可以移除故障的磁盘。

如果构建了RAID的磁盘需要一定数量的磁盘（例如RAID1要求双磁盘，RAID10要求4块磁盘），可需要先添加一块`intact`磁盘 - 这里添加一块替换磁盘`/dev/sdf`

```
btrfs device add /dev/sdf /data
```

**只有确保有足够的`intact`设备才可以执行以下的替换命令**

```
btrfs device delete missing /data
```

# 更改RAID级别

Btrfs支持在线更改RAID级别，例如最初数据和metadata是RAID0，可以在线更改成RAID1

```
btrfs blance start -dconvert=raid1 -mconvert=raid1 /data
```

# 创建子卷

* 可以在现有卷下创建子卷

在btrfs中，可以创建卷的子卷，并且可以创建子卷的快照，或者挂载子卷来替换上层的卷

```
btrfs subvolume create /data/libvirt
```

显示输出

```
Create subvolume '/data/libvirt'
```

此时可以看到在 `/data` 目录下创建了一个子目录 `libvirt`

```
ls -lh /data
```

显示输出

```
total 0
drwxr-xr-x 1 root root 0 Nov 22 17:58 libvirt
```

> 注意：这个是子卷，这个`libvirt`子卷的`subvolid`是257

* 检查 `/data` 的子卷

```
btrfs subvolume list /data
```

显示输出

```
ID 257 gen 6 top level 5 path libvirt
```

* 可以创建子卷的子卷

```
btrfs subvolume create /data/libvirt/images
```

此时显示

```
Create subvolume '/data/libvirt/images'
```

* 此时检查卷`/data`可以看到显示出新的子卷`libvirt/images`

```
btrfs subvolume list /data
```

显示输出

```
ID 257 gen 8 top level 5 path libvirt
ID 258 gen 8 top level 257 path libvirt/images
```

# 挂载子卷

> Btrfs支持直接挂载子卷而不需要挂载父卷

* 可以使用`subvolid`来挂载子卷

```
mount -o subvolid=258 /dev/sda4 /var/lib/libvirt/images
```

* 也支持`subvol`来挂载子卷

```
mount -o subvol=libvirt/images /dev/sda4 /var/lib/libvirt/images
```

挂载之后，可以检查文件系统挂载，会发现和ZFS类似的磁盘设备`/dev/sda4`挂载模式

```
/dev/sda4       1.1T   21G  1.1T   2% /data
/dev/sda4       1.1T   21G  1.1T   2% /var/lib/libvirt/images
```

* 设置默认挂载子卷

如果希望子卷 `258` subvolid 默认挂载到`/data`目录（而不是`/dev/sda4`），则使用如下命令

```
btrfs subvolume set-default 258 /data
```

这样就不需要每次都输入`-o subvolid=258`参数了

如果要恢复原先的top-level volume作为挂载，则设置`subvolid=0`

```
btrfs subvolume set-default 0 /data
```

# 删除子卷

子卷可以在**卷**路径挂载的时候被删除，例如

删除前检查`/data`卷的子卷

```
btrfs subvolume list /data
```

显示如下

```
ID 257 gen 8 top level 5 path libvirt
ID 258 gen 82 top level 257 path libvirt/images
```

现在删除子卷 `libvirt/images`

```
btrfs subvolume delete /var/lib/libvirt/images
```

提示报错

```
Delete subvolume (no-commit): '/var/lib/libvirt/images'
ERROR: cannot delete '/var/lib/libvirt/images' - Inappropriate ioctl for device
```

我发现不应该使用挂载的路径作为删除路径，而是应该使用 `/data/libvirt/images` 即卷路径来删除。

```
btrfs subvolume delete /data/libvirt/images
```

提示报错

```
Delete subvolume (no-commit): '/data/libvirt/images'
ERROR: cannot delete '/data/libvirt/images' - Device or resource busy
```

这次显示至少表明**卷**路径是正确的，只是设备繁忙（其实就是还没有umount卷挂载）。所以还是采用先`umount`掉卷挂载，然后删除子卷

```
umount /var/lib/libvirt/images
btrfs subvolume delete /data/libvirt/images
```

这次显示输出正确

```
Delete subvolume (no-commit): '/data/libvirt/images'
```

再检查`/data`卷可以看到只有子卷`libvirt`了

```
#btrfs subvolume list /data
ID 257 gen 85 top level 5 path libvirt
```

# 使用`/etc/fstab`挂载btrfs

> 请参考[在btrfs文件系统上部署kvm](../../../../../virtual/kvm/deployment_and_administration/deploy_kvm_using_btrfs)，下文我们挂载`/data/libvirt`子卷到`/var/lib/libvirt`目录，以这个`/data/libvirt`作为测试。

* 挂载`/data/libvirt`子卷（实际操作参考[在btrfs文件系统上部署kvm](../../../../../virtual/kvm/deployment_and_administration/deploy_kvm_using_btrfs)，需要做一些辅助步骤确保数据腾挪到`/data/libvirt`子卷）

* 配置`/etc/fstab`

```
/dev/sda4        /data        btrfs        defaults      0 1
/dev/sda4        /var/lib/libvirt    btrfs        subvol=/data/libvirt,defaults,noatime    0 1
```

* 挂载`/data`

```
mount /data
```

* 挂载`/var/lib/libvirt`

```
mount /var/lib/libvirt
```

出现报错

```
mount: mount(2) failed: No such file or directory
```

但是发现将 `/data/libvirt` 这个btrfs子卷修改成对应的`subvolid`却能够正常挂载

```
/dev/sda4        /data        btrfs        defaults,noatime      0 0
/dev/sda4        /var/lib/libvirt    btrfs        subvolid=257,defaults,noatime    0 0
```

挂载后

```
/dev/sda4       1.1T   21G  1.1T   2% /data
/dev/sda4       1.1T   21G  1.1T   2% /var/lib/libvirt
```

仔细检查了一下使用`mount`命令的参数`-o subvol`，原来这个子卷参数不能包含`top-level`的目录，应该使用

```
mount -o subvol=libvirt /dev/sda4 /var/lib/libvirt
```

而 **不是**

```
mount -o subvol=/data/libvirt /dev/sda4 /var/lib/libvirt
```

所以正确的`/etc/fstab`应该配制成

```
/dev/sda4        /var/lib/libvirt    btrfs        subvol=libvirt,defaults,noatime    0 0
```

# 快照

Btrfs最有用的功能是在线创建子卷快照，这个功能可以实现系统回滚以及创建一致性的备份。

> 对于大数据磁盘的备份，一个非常关键的要求就是数据一致性：在备份时间点需要获取整个磁盘的瞬间快照，确保完整的备份包含了这个时间点的所有数据。

* 在创建快照前，先准备2个测试文件

```
touch /var/lib/libvirt/test1 /var/lib/libvirt/test2
```

* 现在创建一个当前时间点的快照

```
btrfs subvolume snapshot 
```

# 参考

* [A Beginner's Guide To btrfs](https://www.howtoforge.com/a-beginners-guide-to-btrfs)
* [Managing BTRFS in CentOS 7](https://jamesnbr.wordpress.com/2016/06/05/managing-btrfs-in-centos-7/)
* [Chapter 3. Btrfs (Technology Preview)](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Storage_Administration_Guide/ch-btrfs.html)
