> Apple 的APFS文件系统似乎非常类似Solaris的ZFS，提供了容器文件系统功能，在存储上可以不断添加容器卷，容器卷的空间和存储池相同，相互间隔离，但是又可以动态调整空间大小。

我的诉求比较简单，主要是能够调整出一个空闲的空间给Linux使用。

* 当前的APFS分区

```
# diskutil list
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *121.3 GB   disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                 Apple_APFS Container disk1         120.5 GB   disk0s2

/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +120.5 GB   disk1
                                 Physical Store disk0s2
   1:                APFS Volume MacBook_Air             14.1 GB    disk1s1
   2:                APFS Volume Preboot                 42.3 MB    disk1s2
   3:                APFS Volume Recovery                1.0 GB     disk1s3
   4:                APFS Volume VM                      1.1 GB     disk1s4
```

可以看到`/dev/disk0s2`就是 `Apple_APFS Container disk` 有120G空间。这个空间需要缩小，让出部分给Linux使用。

> `/dev/disk1`实际上是`Container disk`的映射，可以看到注释中写明了`Physical Store disk0s2`。如下：

```
   2:                 Apple_APFS Container disk1         120.5 GB   disk0s2
   ...
   0:      APFS Container Scheme -                      +120.5 GB   disk1
                                 Physical Store disk0s2
```

# 收缩APFS分区释放空间

* 收缩Container空间，从120.5G缩小到20.5G

```
sudo diskutil apfs resizeContainer disk0s2 20.5g
```

如果要在收缩空间的同时再空闲空间创建journaled HFS+分区，例如50G则可以：

```
sudo diskutil apfs resizeContainer disk0s2 20.5g jhfs+ Extra 50g
```

执行`sudo diskutil apfs resizeContainer disk0s2 20.5g`出现报错：

```
Shrinking APFS data structures
APFS Container Resize error code is 49153
Error: -69606: A problem occurred while resizing APFS Container structures
```

可以参考 [调整APFS文件系统出现"APFS Container Resize error code is 49153"](resize_apfs_error_code_49153) ，也就是先关闭掉TimeMachine功能，并删除备份(没有删除TimeMachine备份前无法收缩)，然后就可以缩小空间：

```
# tmutil listlocalsnapshots /
com.apple.TimeMachine.2018-03-13-160409
# tmutil deletelocalsnapshots 2018-03-13-160409
Deleted local snapshot '2018-03-13-160409'
```

然后再次执行上述收缩磁盘指令就可以了。

# 参考

* [How to Resize Your APFS Container on macOS High Sierra](https://www.macobserver.com/tips/deep-dive/resize-your-apfs-container/)