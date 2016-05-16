**bcache** （即 `block cache`）是Linux内核的块层的一个缓存，其使用第二个存储设备。bcache通常使用一个锅多个快速的存储设备，如固态硬盘SSD作为较慢的存储设备（如硬盘）的缓存，这种创建混合卷提供了更好的读写性能。

围绕SSD的高性能，bcache也通过避免随机写和合并随机写转为顺序写实减轻了存储的写入放大（write amplification）。这种合并I/O操作是通过缓存和主存储同时实现的，也增加了基于闪存设备的使用寿命，并且提高了写性能敏感主存储的性能，如RAID5等设备。

bcache由Kent Overstreet在2010年7月发布（[官方网站](https://bcache.evilpiepirate.org)），并且在2013年6月被合并到内核3.10，已经属于稳定状态，可以用于生产环境。

# 参考

* [WikiPedia: bcache](https://en.wikipedia.org/wiki/Bcache)