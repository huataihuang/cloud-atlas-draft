在[CentOS 7环境部署kvm虚拟化](deploy_kvm_on_centos)时，默认的VM镜像存储在`/var/lib/libvirt/images`目录。不过，对于服务器部署环境，`/var`目录直接建立在`/`根文件系统上，该分区只提供了20G左右的空闲空间，无法满足生产环境使用。

[Btrfs](../../../os/linux/storage/filesystem/btrfs/btrfs_startup)是Linux平台的下一代文件系统，结合了卷管理和多项文件系统优势，也是最接近ZFS的GPL开源文件系统。

为了能够充分发挥存储性能，提供高效(支持压缩)和高性能的存储特性，通过本文实践，将KVM的镜像存储目录`/var/libvirt`转换成Btrfs文件系统。

> 磁盘分区

* 通过`fdisk`或`parted`磁盘工具划分好一个`primary`分区作为Btrfs文件系统所使用的分区，此处使用的分区是 `/dev/sda4`。

# 部署Btrfs

* 安装btrfs工具包

```
yum install btrfs-progs -y
```

* 使用Btrfs格式化文件系统

```
mkfs.btrfs -f /dev/sda4
```

> 这里使用`-f`参数是因为`sda4`分区原先创建过其他文件系统，这里需要强制创建以忽略提示分区中有其他分区表信息的报错。

* 检查btrfs文件系统

```
btrfs filesystem show /dev/sda4
```

显示输出

```
Label: none  uuid: e9191083-94ea-4709-a776-218c473c2bc1
	Total devices 1 FS bytes used 112.00KiB
	devid    1 size 1.04TiB used 2.04GiB path /dev/sda4
```

* 挂载btrfs文件系统方法

```
mkdir /data
mount /dev/sda4 /data
```

# 复制`/var/libvirt`目录

* 首先检查系统中当前是否有访问 `/var/libvirt` 的文件句柄处于打开状态，例如`libvirtd`服务需要关闭以便能够迁移目录

```
lsof | grep libvirt | grep var
```

> 如果有虚拟机在运行，则需要先停止虚拟机
>
> 此外需要停止`libvirtd`和`virtlogd.socket`

```
systemctl stop libvirtd
systemctl stop virtlogd.socket
```

完成后再次检查是否还有进程在访问 `/var/libvirt` 目录，确定没有以后则可以执行下一步

* 重命名`/var/lib/libvirt`目录

```
mv /var/lib/libvirt /var/lib/libvirt.bak
```

# 创建Btrfs `/data/libvirt`子卷

* 创建`/data/libvirt`子卷，这个子卷将挂载为`/var/lib/libvirt`

```
btrfs subvolume create /data/libvirt
```

* 创建`/var/lib/libvirt`

```
mkdir /var/lib/libvirt
```

* 配置`/etc/fstab`

```
/dev/sda4        /data        btrfs        defaults      0 0
/dev/sda4        /var/lib/libvirt    btrfs        subvol=libvirt,defaults,noatime    0 0
```

* 挂载`/data`

```
mount /data
```

* 挂载`/var/lib/libvirt`

```
mount /var/lib/libvirt
```

# 复制`/var/lib/libvirt`

采用如下命令将原先备份恢复

```
(cd /var/lib/libvirt.bak && tar cf - .)|(cd /var/lib/libvirt && tar xf -)
```

# 恢复虚拟化服务

```
systemctl start libvirtd
systemctl start virtlogd.socket
```

启动对应的虚拟机，例如

```
virsh start centos7
```

# 部署思考

作为生产系统，可以采用将数据存放在 `/var` 目录下的子目录，从服务器开始安装部署就将 `/var` 作为一个Btrfs卷，为后续部署做好准备。

例如，RHEL/CentOS/Debian发行版会将web目录默认存放在 `/var/www/html` 目录；虚拟化数据存放在 `/var/lib/libvirt` 目录。