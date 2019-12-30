# macOS中的'Other'和'Purgeable'存储空间

在使用macOS时，你会发现磁盘空间似乎很容易使用满，但是当你通过 Apple 菜单 `` 选择 `Storage` 面板检查，可以看到磁盘空间有一部分显示为 `Other Volumes` ，并且仔细观察可以看到可用存储空间 `Available` 显示值比实际可用空间 `Free` 要大一些，其中有一部分看不到的空间被标记为 `purgeable`。

![other storage in macos](../../img/develop/mac/macos_storage_other.png)

举例：

60.46 GB的磁盘，显示的 `Free` 空间是 40.45 GB，这个free空间通过 `df -h` 命令也可以看到：

```
Filesystem      Size   Used  Avail Capacity iused               ifree %iused  Mounted on
/dev/disk1s1    56Gi   17Gi   38Gi    31%  495970 9223372036854279837    0%   /
```

可以看到虽然 Disk Utility显示可用磁盘空间 49.5 GB (9.05 GB purgeable)，但是实际上这部分空间macOS没有释放出来。

根据苹果官方的Help文档 [What is 'Other' and 'Purgeable' in About This Mac?](https://support.apple.com/en-us/HT202867) 说明如下:

* 在OS X EI Capitan及早期版本， `Other` 文件只Mac认为不属于任何其他分类的文件，包括在磁盘镜像或者归档的文件，存储在应用（如Contacts或Calendar）中的数据，以及应用插件或扩展。当Mac处于[Safe Mode](https://support.apple.com/kb/HT201262)，所有这些文件都被认为是`Other`。
* 从macOS Sierra开始，`Purgeable`内容是指你开启了 [Optimize Mac Storage](https://support.apple.com/kb/HT206996) ，这些可以清除的空间会在需要存储空间的时候由macOS自动释放出来。实际上，当在macOS中删除文件，被删除的文件都会进入`Purgeable`状态，直到存储空间真正需要时候会自动释放出这部分隐含文件。

# 手工清理'Purgeable'空间

对于强迫症用户，或者说，需要调整磁盘空间，来安装Linux操作系统，就可能希望主动释放出这部分 `Purgeable` 存储空间。

释放的方法有两部分：

* 做TimeMachine备份，释放出本地自动存储的快照镜像。另外一种方法是手工删除本地TimeMachine备份，并关闭掉自动TM备份，避免TM占用磁盘。 - [调整macOS的apfs容器空间](resize_apfs_container_on_macos.md)
* 在系统中创建一个极大的文件，以便macOS认为存储空间不足，就会自动回收释放出purgeable空间

## 通过人为占用磁盘空间来强制reclaim purgeable（对APFS失效）

* 手工创建一个大文件来占满磁盘空间

```
dd if=/dev/zero of=~/stupidfile.cap bs=1024m
```

> 添加了`bs=1024m`可以加快磁盘文件生成，达到150MB/s以上

* 直到系统出现磁盘满提示，此时在终端中生成的`~/stupidfile.cap`也会停止，在终端中会提示信息

```
dd: /Users/huatai/stupidfile.cap: No space left on device
```

* 注意，此时`purgeable`空间还没有释放。在Finder文件管理器中选择这个文件`stupidfile.crap`，然后按下`cmd-d`来复制文件。此时macOS就会开始删除purgeable空间，此时在终端上删除掉这个`~/stupidfile.cap`及其clone的文件。

> 不过，从High Sierra版本开始，使用了APFS文件系统不会直接复制文件，这导致上述方法失效。

* 关闭掉 iCloud 中的 `Optimize Mac Storage` 功能，这样后续就不会重新出现purgeable情况。

> 具体解决方法我还需要探索，从一些磁盘管理工具来看，例如 [
Purgeable Space](https://daisydiskapp.com/manual/4/en/Topics/PurgeableSpace.html) 应该是有系统API方法可以释放出这部分空间的，但是具体方法我还没有找到。（我不想为了这个单一功能去购买磁盘文件管理工具，而是想掌握这种macOS底层使用技术）

# 解决思路

* 需要清理掉本地TimeMachine备份

对于macOS各个版本都具有本地TimeMachine快照，所以会占用很多空间（如果你长时间不备份TM的话）。这个问题比较好解决，就是:

```
tmutil  listlocalsnapshotdates / |grep 20|while read f; do tmutil deletelocalsnapshots $f; done
```

* APFS不会释放Purgealbe空间，目前还是没有找到方法。目前看，好像和container有关：

```
$ diskutil apfs list
APFS Container (1 found)
|
+-- Container disk1 B554F71B-0A1D-4AC9-AA0D-3E1A11A9A47A
    ====================================================
    APFS Container Reference:     disk1
    Size (Capacity Ceiling):      250685575168 B (250.7 GB)
    Capacity In Use By Volumes:   228808245248 B (228.8 GB) (91.3% used)
    Capacity Not Allocated:       21877329920 B (21.9 GB) (8.7% free)
    |
    +-< Physical Store disk0s2 88C0CDB5-E83E-48CA-B69F-7AEAE29F29DA
    |   -----------------------------------------------------------
    |   APFS Physical Store Disk:   disk0s2
    |   Size:                       250685575168 B (250.7 GB)
    |
    +-> Volume disk1s1 E638F291-9F37-41AF-BBC1-04AC3D4A1ED2
    |   ---------------------------------------------------
    |   APFS Volume Disk (Role):   disk1s1 (No specific role)
    |   Name:                      Macintosh HD (Case-insensitive)
    |   Mount Point:               /
    |   Capacity Consumed:         217350287360 B (217.4 GB)
    |   FileVault:                 No (Encrypted at rest)
    |
    +-> Volume disk1s2 568DFEFA-0E0E-4780-AA0E-787FDBB37EF8
    |   ---------------------------------------------------
    |   APFS Volume Disk (Role):   disk1s2 (Preboot)
    |   Name:                      Preboot (Case-insensitive)
    |   Mount Point:               Not Mounted
    |   Capacity Consumed:         109453312 B (109.5 MB)
    |   FileVault:                 No
    |
    +-> Volume disk1s3 78264670-BB65-47D9-AC43-F0575DE32E79
    |   ---------------------------------------------------
    |   APFS Volume Disk (Role):   disk1s3 (Recovery)
    |   Name:                      Recovery (Case-insensitive)
    |   Mount Point:               Not Mounted
    |   Capacity Consumed:         1545162752 B (1.5 GB)
    |   FileVault:                 No
    |
    +-> Volume disk1s4 7C476F30-AE0D-4C7A-9746-9011F2BA84AB
        ---------------------------------------------------
        APFS Volume Disk (Role):   disk1s4 (VM)
        Name:                      VM (Case-insensitive)
        Mount Point:               /private/var/vm
        Capacity Consumed:         9664970752 B (9.7 GB)
        FileVault:                 No (Encrypted at rest)
```

有可能通过 `diskutil apfs deleteContainer disk__` 可以清理出空间。不过看上述APFS的卷都是系统必须的卷，应该无法清理出空间了。

> 参考 [I deleted 80gb, but I still have the same storage space](https://forums.macrumors.com/threads/i-deleted-80gb-but-i-still-have-the-same-storage-space.2128785/)

# 参考

* [What is 'Other' and 'Purgeable' in About This Mac?](https://support.apple.com/en-us/HT202867)
* [Mac OS Remove Purgeable in High Sierra](https://www.jackenhack.com/mac-os-remove-purgeable-high-sierra/)