从2017年开始，苹果发布了新的Apple File System，也称为APFS，作为iOS 10.3 和 macOS 10.12.4的默认文件系统。并且，所有的Apple Products都使用同一个文件系统，包括macOS, iOS, tvOS , watchOS。

APFS针对Falsh和SSD存储做了优化，替代了使用了超过30年的[Apple's HFS+](https://en.wikipedia.org/wiki/HFS_Plus)。

APFS提供了更好的[全盘加密功能](https://support.apple.com/kb/PH21750?locale=en_US&viewlocale=en_US)，包括的改进有：

* [64位 inode值](https://developer.apple.com/library/prerelease/content/documentation/FileManagement/Conceptual/APFS_Guide/GeneralCharacteristics/GeneralCharacteristics.html)比原先HFS+的32位文件ID支持增强，可以支持单卷的极大存储。
* 提供了稀疏文件的存储节约功能，并使用copy-on-write元数据方案以避免文件系统crash时的安全性。

> APFS不支持[Apple's Fusion Drives](https://en.wikipedia.org/wiki/Fusion_Drive)，并且不能被OS X 10.11 Yosemite及之前版本支持。
>
> 无须重新安装操作系统，升级macOS时会自动转换文件系统到APFS

# 参考

* [Everything you need to know about the new Apple File System](http://www.cultofmac.com/435718/apfs-new-apple-file-system/)