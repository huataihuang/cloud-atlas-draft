复制VMware虚拟机是进行虚拟机备份的最根本方法，详细的备份虚拟机，请参考[备份VMware虚拟机](backup_vmware_vm)。

> 必需在虚拟机关机情况下备份整个虚拟机，备份方法就是复制 `.vmwarevm` 包（Virtual Machines文件夹中的对象）

* 关闭虚拟机
* 找到虚拟机捆绑包：捆绑包是一系列文件组成的包，包括虚拟机的磁盘（数据）和配置文件。默认虚拟机捆绑包位于 ` Macintosh HD/Users/User_name/Documents/Virtual Machines` - [在 VMware Fusion 中查找虚拟机捆绑包 (1007599)](https://kb.vmware.com/s/article/1007599?lang=zh_CN)
* 按住`option`键拖放捆绑包，表示复制文件，这样macOS就会复制捆绑包奥。

> 在使用了APFS文件系统的macOS中，使用`option`键拖放复制可以实现秒速复制，实际上是copy-on-write，可以极大节约磁盘消耗。（不过，在终端中使用`cp -R`命令是实际复制，暂时没有找到命令行方案）

* 然后使用VMware Fusion打开这个新虚拟机，此时Fusion会询问是否已经移动或复制该虚拟机。选择`已移动该虚拟机`，则表示该虚拟机从新位置启动同一个虚拟机，所有设置不便。如果选择`已复制该虚拟机`，将生成新的 UUID 和 MAC 地址，这可导致 Windows 需要重新激活，还可能会导致出现网络问题。

VMware Fusion Pro版本支持链接clone虚拟机，实际测试发现确实能够大大节约磁盘空间消耗。

# 参考

* [在 VMware Fusion 中复制虚拟机 (1001524)](https://kb.vmware.com/s/article/1001524?lang=zh_CN)