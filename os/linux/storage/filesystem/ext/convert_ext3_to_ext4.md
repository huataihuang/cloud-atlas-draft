EXT4文件系统和EXT3兼容，如果需要先验证测试一下EXT4文件系统，甚至不需要做任何转换，只需要修改`/etc/fstab`将原先文件系统挂载类型`ext3`更改成`ext4`然后重启系统就可以使用。

这样就可以在任何时候回退到使用ext3文件系统。这种方式比较适合在正式转换到使用ext4文件系统前先测试，不过此时只能使用ext4中完全兼容ext3部分的特性，但是无法使用类似extens等主要改进功能。

# 迁移到ext4

> `警告`：在文件系统转换前请先完整备份文件系统，转换可能导致系统无法启动和数据丢失（虽然概率很低^_^）

> `警告`：文件系统从ext3转换成ext4之后将不再兼容，所以在转换前务必确保支持ext4文件系统的工具已经安装升级完成，包括`bootloader`，`e2fsprogs`，`mount`以及最新的内核。

## 转换非根文件系统（non-root filesystem）到ext4

这里转换`/dev/xvdb1`磁盘挂载的`/home`目录ext3文件系统

* umount 分区

```
umount /dev/xvdb1
```

* 使用`fsck`检查文件系统，由于此时依然是`ext3`文件系统：

```
fsck.ext3 -pf /dev/xvdb1
```

* 激活文件系统的`ext4`新属性

```
tune2fs -O extents,uninit_bg,dir_index /dev/xvdb1
```

> `extents`选项激活文件系统使用`extents`来代替文件的`bitmap`映射
>
> `uninit_bg`通过只检查磁盘使用部分来减少文件系统检查时间
>
> `dir_index`允许将大型目录内容存储在htree中加快访问，这个`dir_index`在`ext3`文件系统中冶支持，所以可能不需要使用它，但是启用这个选线没有任何问题。

* 再次使用`ext4`文件系统方式运行一次磁盘文件系统检查，这个检查会发现错误的，这是正常现象，可以让`fsck`自动修复错误。可以`运行2次fack`以确保文件系统完全干净：

```
fsck.ext4 -yfD /dev/xvdb1
```

> `-D`选项通过重建目录索引来实际激活`dir_index`。这个rebuild也可以在以后通过使用这个参数的fsck检查来执行。

* 编辑`/etc/fstab`使用`ext4`代替`ext3`参数

```
/dev/xvdb1 /home ext4 defaults 0 2
```

# 参考

* [Migrating a live system from ext3 to ext4 filesystem](https://debian-administration.org/article/643/Migrating_a_live_system_from_ext3_to_ext4_filesystem)