> 本文是一个介绍大页内存在KVM虚拟化中的实践方法，内容比较简略，以实用为主。后续再补充详细技术文档。

大页内存(Huge Page)也称为[hugetlbpage](https://www.kernel.org/doc/Documentation/vm/hugetlbpage.txt)，是采用大内存块，可以提高虚拟机的性能。

> 在Linux x86_64系统中，大页内存的块大小是2048kB，也就是2MB。当需要分配给虚拟机大页内存，则将需要分配的内存大小除以2，就是需要保留的大页内存块数量。

> 注意：针对大页内存，当前有两种技术，一种是本文所介绍的hugetlbpage，另一种称为透明大页(Transparent Hugepage)。有关透明大页，请参考[透明大页内存技术](transparent_hugepage)，在Red Hat Enterprise Linux 6/7上默认启用了透明大页支持。

# 注意

* 大页内存需要显式设置（启动时），并且需要应用程序配合才能使用，所以应用不是很广泛。但是对性能有很大提升，所以常用于数据库应用。例如，Oracle数据库就使用了HugePage进行加速，并且Oracle明确说明其 **Oralce数据库只使用大页内存，但不使用透明大页内存** 。- [Oracle Database Release 18 - Disabling Transparent HugePages](https://docs.oracle.com/en/database/oracle/oracle-database/18/ladbi/disabling-transparent-hugepages.html#GUID-02E9147D-D565-4AF8-B12A-8E6E9F74BEEA)
* Red Hat Enterprise Linux 6/7 默认启用了透明大页技术（小于1G内存默认关闭），但是如果出现异常无法分配内存情况，请尝试关闭透明大页。 - []

# 参考

* [Arch Linux: KVM - Enabling huge pages](https://wiki.archlinux.org/index.php/KVM#Enabling_huge_pages)
* [hugetlbpage.txt](https://www.kernel.org/doc/Documentation/vm/hugetlbpage.txt)