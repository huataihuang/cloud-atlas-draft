`bigalloc`特性（`EXT4_FEATURE_RO_COMPAT_BIGALLOC`）修改了ext4来使用族分配，这样ext4块分配位图（block allocation bitmap）的每一个位映射成一系列块。例如，如果文件系统主要存储4-32兆范围的大文件，则可以设置cluster是1MB。这样在块分配位图中每一个bit就对应了256个4k大小的块。这样的话在2T文件系统中块分配位图的总大小就从64MB缩减到256KB，这意味着一个块族映射32GB而不是128MB，也缩减了元数据的消耗。

传统ext4文件系统分配的最大单位是4KB，块大小控制在512B~4KB之间，具体块大小在格式化的时候确定。因为Linux内存管理的限制，ext4文件系统不能处理大于4KB的文件系统块。但是对于文件系统中大部分文件都是大文件的情况，希望能够处理多个块，减少文件系统中用于管理Block的开销。ext4新的bigalloc特性管理的单位称为`cluster`（族），每个cluster有原先多个block组成，这样原先block bitmap中管理的大小由block变成了cluster。不过，这个特性在小文件很多的情况下会造成磁盘碎片很多，最后性能会骤然下降。

v3.2内核首先引入了`bigalloc`特性，不过，截止到内核v3.7，如果激活内核的`delayed allocation`（[delalloc](https://ext4.wiki.kernel.org/index.php/Frequently_Asked_Questions#What_is_delayed_allocation_.28delalloc.29.3F_What_are_its_advantages_in_Ext4.3F)）则会引发`bigalloc`的一些问题，特别是文件系统接近满的时候。

> `delayed allocation(delalloc)`是减轻文件系统碎片化的一种技术，因为一个大文件的所有块（或者大量的块）是同时分配的。在知道每个文件的块总是时候，可以允许块分配器（`block allocator`,`mballoc`）找到每个文件的合适的空闲空间的块。这个技术可以减轻块分配的CPU消耗，相比较没有延迟分配的时候文件的每个块写入都要搜索和查找。此外也可能对短时间存在文件避免了磁盘更新元数据。

`bigalloc`特性是3.2以上内核才有的特性，[淘宝的董昊](http://blog.donghao.org)将这个功能backport到了[淘宝内核](http://kernel.taobao.org/git/?p=taobao-kernel.git;a=summary) 2.6.32上。注意：要使用`bigalloc`还需要使用最新的`e2fsprogs`工具(建议使用`1.42.x`最新的维护发行版)。注意启用了`bigalloc`的文件系统需要小心使用resize调整文件系统（不管是online还是offline的resize都不要轻易使用），因为没有经过严格的测试。

如果在开启了`bigalloc`的文件系统上使用旧版本的`fsck`进行扫描，会出现如下报错（使用的命令是 `fsck.ext4 -y /dev/sdb1`）

```
/dev/sdb1 has unsupported feature(s): FEATURE_R9
e2fsck: Get a newer version of e2fsck!
```

此时，如果文件系统确实存在损坏需要修复的话，使用旧版本`fsck`会出现提示文件系统`clean`，但是同时又提示`[FAILED]`，这样会导致系统无法正常启动进入维护状态。

* 启用`bigalloc`特性的方法（也可以在`/etc/fstab`中配置）

```
mke2fs -O extent,bigalloc -C 65536 /dev/sda
mount -t ext4 /dev/sda /test/
```

#  参考

* [Bigalloc](https://ext4.wiki.kernel.org/index.php/Bigalloc)
* [ext4文件系统特性浅析](http://www.cnblogs.com/linghuchong0605/p/4515732.html)
* [怎样用上ext4 bigalloc](http://www.udpwork.com/item/8149.html)