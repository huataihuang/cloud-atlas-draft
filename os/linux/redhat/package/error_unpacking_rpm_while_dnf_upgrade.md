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