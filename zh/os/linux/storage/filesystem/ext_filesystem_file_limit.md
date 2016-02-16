# EXT文件系统的文件数量限制

以下引用[How many files can I put in a directory?](http://stackoverflow.com/questions/466521/how-many-files-can-i-put-in-a-directory)，仅作参考，以实际实践为准。

**强烈建议在一个目录层下不要存放大量的文件，如果要存放大量文件，一定要采用目录层次结构，使得单个目录层下文件数量得到控制。**

实践证明，通过合理的存储结构，例如使用哈希方法创建合理子目录结构，文件系统是可以存放海量文件并且性能不会损失太大。如果在单个目录层次下存放数万文件，会导致目录无法存放新文件，并且无法使用`ls`等命令维护。**在编写程序时，需要考虑实际生产环境，才能开发出真实可靠的软件！**

```bash
FAT32:

    Maximum number of files: 268,173,300
    Maximum number of files per directory: 216 - 1 (65,535)
    Maximum file size: 2 GiB - 1 without LFS, 4 GiB - 1 with

NTFS:

    Maximum number of files: 232 - 1 (4,294,967,295)
    Maximum file size
        Implementation: 244 - 26 bytes (16 TiB - 64 KiB)
        Theoretical: 264 - 26 bytes (16 EiB - 64 KiB)
    Maximum volume size
        Implementation: 232 - 1 clusters (256 TiB - 64 KiB)
        Theoretical: 264 - 1 clusters

ext2:

    Maximum number of files: 1018
    Maximum number of files per directory: ~1.3 × 1020 (performance issues past 10,000)
    Maximum file size
        16 GiB (block size of 1 KiB)
        256 GiB (block size of 2 KiB)
        2 TiB (block size of 4 KiB)
        2 TiB (block size of 8 KiB)
    Maximum volume size
        4 TiB (block size of 1 KiB)
        8 TiB (block size of 2 KiB)
        16 TiB (block size of 4 KiB)
        32 TiB (block size of 8 KiB)

ext3:

    Maximum number of files: min(volumeSize / 213, numberOfBlocks)
    Maximum file size: same as ext2
    Maximum volume size: same as ext2

ext4:

    Maximum number of files: 232 - 1 (4,294,967,295)
    Maximum number of files per directory: unlimited
    Maximum file size: 244 - 1 bytes (16 TiB - 1)
    Maximum volume size: 248 - 1 bytes (256 TiB - 1)
```

# 参考

* [How many files can I put in a directory?](http://stackoverflow.com/questions/466521/how-many-files-can-i-put-in-a-directory)
* [kernelnewbies](http://kernelnewbies.org)网站提供了[Ext4](http://kernelnewbies.org/Ext4)文件系统的内核相关信息
* [WikiPedia:Ext4](https://en.wikipedia.org/wiki/Ext4) 非常详细的特性解说