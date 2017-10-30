# 再次故障

重启发生再此rpool丢失，此时

```
#zfs list
no datasets available
```

尝试修复rpool，也失败

```
#zpool scrub rpool
cannot open 'rpool': no such p
```

尝试导入rpool，但是显示这个pool状态是DEGRADED，说明存在磁盘异常


```
[root@testtfs-1-1 /var/log]
#zpool import -a

[root@testtfs-1-1 /var/log]
#zpool list
NAME    SIZE  ALLOC   FREE  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
rpool  7.25T   161G  7.09T         -     0%     2%  1.00x  DEGRADED  -
```

检查存储池问题

```
#zpool status -v rpool
  pool: rpool
 state: DEGRADED
status: One or more devices could not be used because the label is missing or
        invalid.  Sufficient replicas exist for the pool to continue
        functioning in a degraded state.
action: Replace the device using 'zpool replace'.
   see: http://zfsonlinux.org/msg/ZFS-8000-4J
  scan: scrub repaired 0 in 0h19m with 0 errors on Tue Jul 18 12:15:21 2017
config:

        NAME                                      STATE     READ WRITE CKSUM
        rpool                                     DEGRADED     0     0     0
          raidz1-0                                DEGRADED     0     0     0
            8555117260269250814                   UNAVAIL      0     0     0  was /dev/sdb1
            HGST_HUS724020ALA640_PN2134P6HJEZMP1  ONLINE       0     0     0
            HGST_HUS724020ALA640_PN2134P6HKPSKP1  ONLINE       0     0     0
            HGST_HUS724020ALA640_PN2134P6HLLU0X1  ONLINE       0     0     0

errors: No known data errors
```

这个问题和[how to recover degraded zpool](https://forums.freebsd.org/threads/28084/)非常相像

这里出现的raidz中有一块磁盘UNAVAIL了

```
8555117260269250814                   UNAVAIL      0     0     0  was /dev/sdb1
```

解决的方法是剔除掉故障磁盘：

```
zpool replace rpool 8555117260269250814 sdb1
```

然后重新恢复存储池

```
zpool scrub rpool
```

> 仔细看上面`zpool status -v rpool`输出就可以看到如何处理

```
 state: DEGRADED
status: One or more devices could not be used because the label is missing or
        invalid.  Sufficient replicas exist for the pool to continue
        functioning in a degraded state.
action: Replace the device using 'zpool replace'.
   see: http://zfsonlinux.org/msg/ZFS-8000-4J
  scan: scrub repaired 0 in 0h19m with 0 errors on Tue Jul 18 12:15:21 2017
```

* 实践记录

> 再次重启服务器，可以看到rpool已经被导入，并且磁盘挂载正常了

```
#zpool list
NAME    SIZE  ALLOC   FREE  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
rpool  7.25T   161G  7.09T         -     0%     2%  1.00x  DEGRADED  -
#zfs list
NAME           USED  AVAIL  REFER  MOUNTPOINT
rpool          117G  5.07T   198K  none
rpool/data    87.6G  5.07T  87.6G  /data
rpool/docker  29.7G  5.07T  29.7G  /var/lib/docker

#df -h
Filesystem      Size  Used Avail Use% Mounted on
...
rpool/data      5.2T   88G  5.1T   2% /data
rpool/docker    5.1T   30G  5.1T   1% /var/lib/docker
```

不过，此时故障磁盘还存在

尝试替换

```
#zpool replace rpool 8555117260269250814 sdb1

invalid vdev specification
use '-f' to override the following errors:
/dev/sdb1 is part of active pool 'rpool'

#zpool replace -f rpool 8555117260269250814 sdb1

invalid vdev specification
the following errors must be manually repaired:
/dev/sdb1 is part of active pool 'rpool'
```

* 先将故障磁盘 offline 掉

```
zpool offline rpool 8555117260269250814
```

此时检查故障磁盘已经offline掉了

```
#zpool status rpool
  pool: rpool
 state: DEGRADED
status: One or more devices has been taken offline by the administrator.
        Sufficient replicas exist for the pool to continue functioning in a
        degraded state.
action: Online the device using 'zpool online' or replace the device with
        'zpool replace'.
  scan: scrub repaired 0 in 0h18m with 0 errors on Mon Oct 30 12:23:26 2017
config:

        NAME                                      STATE     READ WRITE CKSUM
        rpool                                     DEGRADED     0     0     0
          raidz1-0                                DEGRADED     0     0     0
            8555117260269250814                   OFFLINE      0     0     0  was /dev/sdb1
            HGST_HUS724020ALA640_PN2134P6HJEZMP1  ONLINE       0     0     0
            HGST_HUS724020ALA640_PN2134P6HKPSKP1  ONLINE       0     0     0
            HGST_HUS724020ALA640_PN2134P6HLLU0X1  ONLINE       0     0     0

errors: No known data errors
```

* 联系机房更换磁盘

> 磁盘依旧划分一个分区`/dev/sdb1`

* 尝试替换故障磁盘

```
zpool replace rpool 8555117260269250814 sdb1
```

# 参考

* [how to recover degraded zpool](https://forums.freebsd.org/threads/28084/)
* [Determining the Health Status of ZFS Storage Pools](https://docs.oracle.com/cd/E19253-01/819-5461/gamno/index.html) - 这篇手册详细介绍检查和处理故障方法