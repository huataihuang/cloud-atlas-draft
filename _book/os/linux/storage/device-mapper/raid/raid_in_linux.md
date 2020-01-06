> 本文是记录在服务器上通过Soft RAID实现合并多块磁盘组建大存储的操作步骤。构建的RAID是RAID10同时设置一块hot spare磁盘，以满足一定的容灾和性能要求。

硬件设备检查

    lspci | grep -E 'SCSI|SATA'

显示磁盘硬件如下

    00:1f.2 SATA controller: Intel Corporation Patsburg 6-Port SATA AHCI Controller (rev 06)
    03:00.0 Serial Attached SCSI controller: LSI Logic / Symbios Logic SAS2308 PCI-Express Fusion-MPT SAS-2 (rev 05)
    09:00.0 Serial Attached SCSI controller: Intel Corporation Patsburg 4-Port SATA Storage Control Unit (rev 06)

> 服务器只有SATA ACHI磁盘控制器，没有硬件RAID功能

磁盘列表

    fdisk -l | grep sd

    Disk /dev/sda: 480.1 GB, 480103981056 bytes
    /dev/sda1   *           1          33      261120   83  Linux
    /dev/sda2              33        6560    52428800   83  Linux
    /dev/sda3            6560        6821     2097152   83  Linux
    /dev/sda4            6821       58370   414063448    5  Extended
    /dev/sda5            6821       58370   414061568   83  Linux
    Disk /dev/sdb: 480.1 GB, 480103981056 bytes
    Disk /dev/sdc: 480.1 GB, 480103981056 bytes
    Disk /dev/sdd: 480.1 GB, 480103981056 bytes
    Disk /dev/sde: 480.1 GB, 480103981056 bytes
    Disk /dev/sdf: 480.1 GB, 480103981056 bytes
    Disk /dev/sdg: 480.1 GB, 480103981056 bytes
    Disk /dev/sdh: 480.1 GB, 480103981056 bytes
    Disk /dev/sdi: 480.1 GB, 480103981056 bytes
    Disk /dev/sdj: 480.1 GB, 480103981056 bytes
    Disk /dev/sdk: 480.1 GB, 480103981056 bytes
    Disk /dev/sdl: 480.1 GB, 480103981056 bytes

* 创建磁盘分区并标记为soft raid

> 以`/dev/sdb`为例

    parted -s /dev/sdb mkpart primary 0% 100%
    parted -s /dev/sdb set 1 raid on

对于上述`sdb`到`sdl`磁盘，可以使用以下命令一次完成

    for i in {b..l};do (parted -s /dev/sd$i mkpart primary 0% 100% && parted -s /dev/sd$i set 1 raid on);done

> 上述对磁盘进行分区并且加上raid这个FLAG很重要，我的同事在做Soft RAID的时候，操作命令中少了这步分区和设置flag步骤，虽然构建RAID时候没有报错，并且也能够对RAID设备进行文件系统创建。但是操作系统重启后，md设备丢失（无法挂载文件系统）。推测是没有标记raid分区，系统重启后就无法扫描到RAID标记来激活md设备。

> 此外，我发现这里使用 `parted` 命令有没有使用 `-a optimal` 都没有区别，分区以后显示都是相同位置，不确定在底层是否需要这个参数。或许还是加上比较好。注意，可以使用以下命令检查分区是否对齐:

```
parted /dev/sda
align-check opt n
```

* 创建RAID10

> 这里 `/dev/sd{b..k}1` 是shell展开为 `/dev/sdb1 到 /dev/sdk1`

    mdadm --create /dev/md0 --name=metadata --level=10 --raid-devices=10 /dev/sd{b..k}1 --spare-devices=1 /dev/sdl1

> 这里使用参数 `--name=metadata` 可以体现在`mdadm --detail`信息输出以及`/etc/mdadm.conf`配置中，方便后续维护

    -N, --name=
      Set a name for the array.  This is currently only effective when creating an
      array with a version-1 superblock, or an array in a DDF container.  The name
      is  a  simple  textual  string that can be used to identify array components
      when assembling.  If name is needed but not specified, it is taken from  the
      basename   of  the  device  that  is  being  created.   e.g.  when  creating
      /dev/md/home the name will default to home.

> 在[suse 文档：创建复杂 RAID 10](https://www.suse.com/zh-cn/documentation/sles11/stor_admin/data/raidmdadmr10cpx.html) 使用了以下参数

* `--run` 强制运行，对于某些属于其他array的组件也确认执行，由于我们是空白的存储，所以不需要这个参数
* `--chunk=4` （也就是4k的条带大小），这个对性能有比较大的影响，以后需要调优

    -R, --run
      Insist that mdadm run the array, even if some of the components appear to be
      active  in another array or filesystem.  Normally mdadm will ask for confir-
      mation before including such components in an  array.   This  option  causes
      that question to be suppressed.

    -c, --chunk=
      Specify  chunk  size  of  kibibytes.   The default when creating an array is
      512KB.  To ensure compatibility with  earlier  versions,  the  default  when
      Building  and array with no persistent metadata is 64KB.  This is only mean-
      ingful for RAID0, RAID4, RAID5, RAID6, and RAID10.
      
      RAID4, RAID5, RAID6, and RAID10 require the chunk size to be a power  of  2.
      In any case it must be a multiple of 4KB.
      
      A  suffix  of  'M'  or  'G'  can be given to indicate Megabytes or Gigabytes
      respectively.

* 检查RAID配置

        mdadm --detail /dev/md0

输出显示如下
    
    /dev/md0:
            Version : 1.2
      Creation Time : Mon Nov  9 20:22:07 2015
         Raid Level : raid10
         Array Size : 2344240640 (2235.64 GiB 2400.50 GB)
      Used Dev Size : 468848128 (447.13 GiB 480.10 GB)
       Raid Devices : 10
      Total Devices : 11
        Persistence : Superblock is persistent
    
        Update Time : Mon Nov  9 20:23:24 2015
              State : active, resyncing
     Active Devices : 10
    Working Devices : 11
     Failed Devices : 0
      Spare Devices : 1
    
             Layout : near=2
         Chunk Size : 512K
    
      Resync Status : 6% complete
    
               Name : zpullmsg-31-40:0  (local to host zpullmsg-31-40)
               UUID : 70cdd7d5:26452869:0d62a14d:889fa256
             Events : 1
    
        Number   Major   Minor   RaidDevice State
           0       8       17        0      active sync   /dev/sdb1
           1       8       33        1      active sync   /dev/sdc1
           2       8       49        2      active sync   /dev/sdd1
           3       8       65        3      active sync   /dev/sde1
           4       8       81        4      active sync   /dev/sdf1
           5       8       97        5      active sync   /dev/sdg1
           6       8      113        6      active sync   /dev/sdh1
           7       8      129        7      active sync   /dev/sdi1
           8       8      145        8      active sync   /dev/sdj1
           9       8      161        9      active sync   /dev/sdk1
    
          10       8      177        -      spare   /dev/sdl1

* 生成`mdadm`的配置文件，这样系统启动时候回自动启动软raid

    mdadm -Ds >> /etc/mdadm.conf

或者等同命令

    mdadm --detail --scan >> /etc/mdadm.conf

* 检查RAID的build进度

> SoftRAID在sync的时候就可以直接使用（创建文件系统和挂载），即使此时显示正在进行`resync`还没有完成 

    cat /proc/mdstat

输出类似

    Personalities : [raid10]
    md0 : active raid10 sdl1[10](S) sdk1[9] sdj1[8] sdi1[7] sdh1[6] sdg1[5] sdf1[4] sde1[3] sdd1[2] sdc1[1] sdb1[0]
          2344240640 blocks super 1.2 512K chunks 2 near-copies [10/10] [UUUUUUUUUU]
          [=>...................]  resync =  8.4% (198401920/2344240640) finish=173.2min speed=206451K/sec

# 创建文件系统并挂载

* `/dev/md0`磁盘分区

> 由于`/dev/md0`磁盘设备大于2T，所以不能使用`fdisk`，需要使用`parted`分区并设置为`GPT`分区表

    parted -s /dev/md0 mklabel gpt
    parted -a optimal -s /dev/md0 mkpart primary 1% 100%

> 分区对齐方式

    -a alignment-type, --align alignment-type
        Set alignment for newly created partitions, valid alignment types are:
        none   Use the minimum alignment allowed by the disk type.
        
      cylinder
        Align partitions to cylinders.
        
      minimal
        Use minimum alignment as given by the disk topology information. This
        and the opt value will use layout information provided by the disk to
        align the logical partition table addresses to actual physical blocks
        on  the disks.  The min value is the minimum aligment needed to align
        the partition properly to physical blocks, which  avoids  performance
        degradation.
        
      optimal
        Use optimum alignment as given by the disk topology information. This
        aligns to a multiple of the physical block size in a way that guaran-
        tees optimal performance.

使用`fdisk -l`可以看到分区信息

    WARNING: GPT (GUID Partition Table) detected on '/dev/md0'! The util fdisk doesn't support GPT. Use GNU Parted.
    
    
    Disk /dev/md0: 2400.5 GB, 2400502415360 bytes
    255 heads, 63 sectors/track, 291844 cylinders
    Units = cylinders of 16065 * 512 = 8225280 bytes
    Sector size (logical/physical): 512 bytes / 4096 bytes
    I/O size (minimum/optimal): 524288 bytes / 2621440 bytes
    Disk identifier: 0x00000000
    
        Device Boot      Start         End      Blocks   Id  System
    /dev/md0p1               1      267350  2147483647+  ee  GPT
    Partition 1 does not start on physical sector boundary.

> 注意：这里提示GPT分区不是物理扇区边界开始，这个警告可能不正确

* `/dev/md0p1`创建文件系统`ext4`

> `ext4`文件系统目前对SSD磁盘支持较好，并且稳定可靠
    
    mkfs -t ext4 /dev/md0p1

* 挂载 `/dev/md0p1`

> 由于是`Ext4`分区性能提升，使用`noatime`

    echo "/dev/md0p1  /metadata  ext4  defaults,noatime  0 0" >> /etc/fstab

> 原先对`/metadata`目录需要移除，重建空目录挂载

    mv /metadata /metadata.old
    mkdir /metadata
    mount /metadata

# 简单汇总脚本

    for i in {b..l};do (parted -s /dev/sd$i mkpart primary 0% 100% && parted -s /dev/sd$i set 1 raid on);done
    mdadm --create /dev/md0 --name=metadata --level=10 --raid-devices=10 /dev/sd{b..k}1 --spare-devices=1 /dev/sdl1
    mdadm -Ds >> /etc/mdadm.conf
    parted -s /dev/md0 mklabel gpt
    parted -a optimal -s /dev/md0 mkpart primary 0% 100%
    mkfs -t ext4 /dev/md0p1
    echo "/dev/md0p1  /metadata  ext4  defaults,noatime  0 0" >> /etc/fstab
    mv /metadata /metadata.old
    mkdir /metadata
    mount /metadata

# 通过LVM实现Soft RAID

LVM可以实现Soft RAID的功能，但是要求较新版本（参考 [⁠4.4.16. RAID Logical Volumes](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Logical_Volume_Manager_Administration/raid_volumes.html) 和 [⁠4.4.3. Creating Mirrored Volumes](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Logical_Volume_Manager_Administration/mirror_create.html)）

> Red Hat Enterprise Linux 6.3开始 LVM 支持 RAID4/5/6 和 raid1
>
> Red Hat Enterprise Linux 6.4开始 LVM 支持 raid10

为了稳妥起见，应该升级到RHEL最新 6.7 版本，以便能够实现LVM下的Soft RAID。

使用LVM实现RAID注意点：

* 新的raid1在每个镜像磁盘保存了完成的冗余位图（fully redundant bitmap），增加了故障处理能力
* 镜像可以临时分裂然后再合并回RAID
* 新的镜像实现支持快照（类似高层次的RAID实现）
* 新的RAID实现不支持cluster-aware

# 参考

* [Software RAID and LVM](https://wiki.archlinux.org/index.php/Software_RAID_and_LVM)
* [Ubuntu – Howto Easily Setup RAID 5 with LVM](http://dtbaker.net/random-linux-posts/ubuntu-howto-easily-setup-raid-5-with-lvm/)
* [⁠4.4.3. Creating Mirrored Volumes](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Logical_Volume_Manager_Administration/mirror_create.html)
* [⁠4.4.16.8. Setting a RAID fault policy](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Logical_Volume_Manager_Administration/raid-faultpolicy.html)