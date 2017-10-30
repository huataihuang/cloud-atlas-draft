
服务器重启后无法显示zfs rpool

```
#zfs list
no datasets available
```

显示zfs模块已经加载

```
#lsmod | grep zfs
zfs                  1230460  3
zunicode              331251  1 zfs
zavl                   15010  1 zfs
zcommon                51321  1 zfs
znvpair                93262  2 zfs,zcommon
spl                   290129  5 zfs,zavl,zunicode,zcommon,znvpair
```

系统日志中显示zfs的rpool不能导入：

```
Jul 18 11:15:53 testtfs-1-1 zpool: cannot import 'rpool': one or more devices are already in use
Jul 18 11:15:53 testtfs-1-1 systemd: zfs-import-cache.service: main process exited, code=exited, status=1/FAILURE
Jul 18 11:15:53 testtfs-1-1 systemd: Failed to start Import ZFS pools by cache file.
Jul 18 11:15:53 testtfs-1-1 systemd: Unit zfs-import-cache.service entered failed state.
Jul 18 11:15:53 testtfs-1-1 systemd: Starting Mount ZFS filesystems...
...
Jul 18 11:15:53 testtfs-1-1 systemd: Started Mount ZFS filesystems.
Jul 18 11:15:53 testtfs-1-1 systemd: Mounted NFSD configuration filesystem.
Jul 18 11:15:54 testtfs-1-1 multipathd: sda: add path (uevent)
Jul 18 11:15:54 testtfs-1-1 multipathd: sda: spurious uevent, path already in pathvec
Jul 18 11:15:54 testtfs-1-1 multipathd: sda: No SAS end device for 'end_device-0:0'
Jul 18 11:15:54 testtfs-1-1 kernel: device-mapper: table: 253:21: multipath: error getting device
Jul 18 11:15:54 testtfs-1-1 kernel: device-mapper: ioctl: error adding target to table
Jul 18 11:15:54 testtfs-1-1 multipathd: HGST_HUS724020ALA640_PN2134P6HKEADP: failed in domap for addition of new path sda
Jul 18 11:15:54 testtfs-1-1 multipathd: uevent trigger error
```

对比了正常服务器

```
[root@testtfs-1-2 /root]
#zfs list
NAME           USED  AVAIL  REFER  MOUNTPOINT
rpool          117G  4.99T   198K  /rpool
rpool/data    90.9G  4.99T  90.9G  /data
rpool/docker  25.6G  4.99T  25.6G  /var/lib/docker

[root@testtfs-1-2 /root]
#lsmod | grep zfs
zfs                  2784547  6
zunicode              331170  1 zfs
zavl                   15236  1 zfs
zcommon                55411  1 zfs
znvpair                89086  2 zfs,zcommon
spl                    92203  3 zfs,zcommon,znvpair
```

异常服务器再次重启，这次启动以后能够看到zfs的卷，但是发现docker目录下空

检查系统日志

```
Jul 18 11:38:10 testtfs-1-1 zfs: cannot mount '/var/lib/docker': directory is not empty
Jul 18 11:38:10 testtfs-1-1 systemd: zfs-mount.service: main process exited, code=exited, status=1/FAILURE
Jul 18 11:38:10 testtfs-1-1 systemd: Failed to start Mount ZFS filesystems.
Jul 18 11:38:10 testtfs-1-1 systemd: Dependency failed for ZFS startup target.
Jul 18 11:38:10 testtfs-1-1 systemd:
Jul 18 11:38:10 testtfs-1-1 systemd: Dependency failed for ZFS file system shares.
Jul 18 11:38:10 testtfs-1-1 systemd:
Jul 18 11:38:10 testtfs-1-1 systemd: Unit zfs-mount.service entered failed state.
```

在这个日志前有

```
Jul 18 11:38:08 testtfs-1-1 multipathd: sdc: No SAS end device for 'end_device-0:0'
Jul 18 11:38:08 testtfs-1-1 kernel: device-mapper: table: 253:2: multipath: error getting device
Jul 18 11:38:08 testtfs-1-1 kernel: device-mapper: ioctl: error adding target to table
...
Jul 18 11:38:08 testtfs-1-1 kernel: device-mapper: table: 253:12: multipath: error getting device
Jul 18 11:38:08 testtfs-1-1 kernel: device-mapper: ioctl: error adding target to table
Jul 18 11:38:08 testtfs-1-1 multipathd: HGST_HUS724020ALA640_PN2134P6HKEADP: failed in domap for addition of new path sda
Jul 18 11:38:08 testtfs-1-1 multipathd: uevent trigger error
```

# 检查ZFS文件系统

* 检查存储池

```
#zfs list
NAME           USED  AVAIL  REFER  MOUNTPOINT
rpool          117G  5.07T   198K  none
rpool/data    87.6G  5.07T  87.6G  /data
rpool/docker  29.7G  5.07T  29.7G  /var/lib/docker

#zfs list rpool
NAME    USED  AVAIL  REFER  MOUNTPOINT
rpool   117G  5.07T   198K  none

#zfs list -r rpool
NAME           USED  AVAIL  REFER  MOUNTPOINT
rpool          117G  5.07T   198K  none
rpool/data    87.6G  5.07T  87.6G  /data
rpool/docker  29.7G  5.07T  29.7G  /var/lib/docker
```

* 检查数据一致性：先发起一个存储池所有数据的explicit scrubbing，然后检查状态

```
#zpool scrub rpool

#zpool status -v rpool
  pool: rpool
 state: ONLINE
status: Some supported features are not enabled on the pool. The pool can
	still be used, but some features are unavailable.
action: Enable all features using 'zpool upgrade'. Once this is done,
	the pool may no longer be accessible by software that does not support
	the features. See zpool-features(5) for details.
  scan: none requested
config:

	NAME        STATE     READ WRITE CKSUM
	rpool       ONLINE       0     0     0
	  raidz1-0  ONLINE       0     0     0
	    sdb     ONLINE       0     0     0
	    sdc     ONLINE       0     0     0
	    sdd     ONLINE       0     0     0
	    sde     ONLINE       0     0     0

errors: No known data errors
```

对比正常的服务器节点

```
rpool/data                                                                                  5.1T   91G  5.0T   2% /data
rpool                                                                                       5.0T  128K  5.0T   1% /rpool
rpool/docker                                                                                5.1T   26G  5.0T   1% /var/lib/docker
```

可以看到这个服务器没有正常挂载zfs，该服务器挂载显示如下

```
rpool/data      5.2T   88G  5.1T   2% /data
```

由于zfs卷 `rpool/docerk` 挂载失败，显示目录中有存在文件，所以尝试先移除`/var/lib/docker`目录然后挂载

```
cd /var/lib
mv docker docker.bak

zfs mount rpool/docker
```

这样完成挂载数据恢复成功。

> 详细磁盘故障问题排查，参考[ZFS故障磁盘替换](zfs_replace_disk)

# 参考

* [Resolving ZFS File System Problems](https://docs.oracle.com/cd/E26505_01/html/E37384/gbbbc.html)
