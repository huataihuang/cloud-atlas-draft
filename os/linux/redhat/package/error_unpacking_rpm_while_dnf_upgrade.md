最近一次`dnf upgrade`时候，有一个软件包显示加压缩错误

```
...
  Upgrading        : grub2-efi-x64-1:2.02-22.fc27.x86_64                                                                                 1/2 
Error unpacking rpm package grub2-efi-x64-1:2.02-22.fc27.x86_64
Error unpacking rpm package grub2-efi-x64-1:2.02-22.fc27.x86_64
error: unpacking of archive failed on file /boot/efi/EFI/fedora/fonts/unicode.pf2;5a850496: cpio: open
grub2-efi-x64-1:2.02-22.fc27.x86_64 was supposed to be installed but is not!
  Verifying        : grub2-efi-x64-1:2.02-22.fc27.x86_64                                                                                 1/2 
grub2-efi-x64-1:2.02-19.fc27.x86_64 was supposed to be removed but is not!
  Verifying        : grub2-efi-x64-1:2.02-19.fc27.x86_64                                                                                 2/2 

Failed:
  grub2-efi-x64.x86_64 1:2.02-22.fc27                                                                                                        

Error: Transaction failed
```

参考[Bug 1506704 - Nothing in Fedora 27+ grub2 obsoletes/provides grub2-efi-modules (breaks upgrades)](https://bugzilla.redhat.com/show_bug.cgi?id=1506704)


不过，我感觉我在双启动Mac OSX 和 Fedora中可能不许要这个软件包，因为启动时候通过Mac电脑掉`option`键可以切换系统。所以删除这个软件包后测试依然可以通过`option`键启动时切换Mac OSX和Fedora。
