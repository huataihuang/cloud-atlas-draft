exFAT(Extended File Allocation Table)是微软针对闪存(flash memory)如USB盘和SSD固态硬盘于2006年推出的文件系统。最初是作为Windows CE 6.0引入到嵌入式Windows操作系统的。

exFAT可以用于NTFS文件系统不适合的环境（如U盘），提供了跨越Windows/Mac/Linux的兼容性。文件最大支持16EB，适合大容量硬盘。每个目录支持单个目录2,796,202文件。

由于版权原因，默认发行版没有包含exFAT支持，需要安装第三方[rpmfusion-free](https://rpmfusion.org/Configuration)，然后执行：

```
sudo dnf -y install fuse-exfat
```

安装以后就直接挂载（实际是通过fuse方式）

```
sudo mount.exfat /dev/sdb1 /mnt
```

# 参考

* [how do I access exfat files](https://ask.fedoraproject.org/en/question/107689/how-do-i-access-exfat-files/)
* [exFAT](https://en.wikipedia.org/wiki/ExFAT)