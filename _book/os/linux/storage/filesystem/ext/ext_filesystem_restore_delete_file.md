如果在ext3/4文件系统上误删除文件，可以通过

```bash
$sudo debuge4fs -R 'stat aa' /dev/sdb1
debuge4fs 1.41.12 (17-May-2010)
Inode: 29   Type: regular    Mode:  0644   Flags: 0x80000
Generation: 103055362    Version: 0x00000000:00000001
User: 51222   Group:   100   Size: 4096
File ACL: 0    Directory ACL: 0
Links: 1   Blockcount: 8
Fragment:  Address: 0    Number: 0    Size: 0
 ctime: 0x573188ac:a614d100 -- Tue May 10 15:07:24 2016
 atime: 0x573188b9:13ee61cc -- Tue May 10 15:07:37 2016
 mtime: 0x573188ac:a614d100 -- Tue May 10 15:07:24 2016
crtime: 0x57317278:4aa2a91c -- Tue May 10 13:32:40 2016
Size of extra inode fields: 28
EXTENTS:
(0): 44149788
```

上述输出中的最后一行 `44149788` 就是文件偏移量

对于小于4k的文件，可以直接用下面命令复制恢复文件

```bash
sudo dd if=/dev/sdb1 of=/tmp/recover_file bs=4k count=1 skip=44149788
```

然后就可以检查`/tmp/recover_file`这个恢复出的文件。