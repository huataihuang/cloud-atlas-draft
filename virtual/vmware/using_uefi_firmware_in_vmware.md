VMware在虚拟机中支持使用EFI/UEFI firmware。EFI(Extensible Firmware interface,可扩展固件接口)是系统firmware的总称，EFI存储在ROM或Flash RAM，由CPU首次初始化硬件和传递控制给操作系统或启动加载器。EFI/UEFI是传统的PC BIOS的升级替代。UEFI（Unified Extensible Firmware interface，统一可扩展固件接口）和EFI是等同的概念。

在VMware中，host主机和guest虚拟机的BIOS或UEFI不必一致，相互无关。

由于以下原因，请选择EFI/UEFI:

* UEFI是计算机标准的未来，从2010年开始广泛使用
* 当需要启动 `>2TB` 磁盘时，需要使用EFI来支持GPT（GUID Partition Table）
* UEFI支持跟多预启动环境变量。例如，最新的macOS(10.7+)需要使用全磁盘加密
* UEFI可以感知文件系统 - 支持FAT/FAT32文件系统读写，这样可以在UEFI中重新配置bootloader，也就是如果系统不能启动，还是能够使用内建的文本编辑器修改`grub.conf`
* UEFI可以从USB启动，而传统的BIOS实现由于兼容原因不能支持USB启动

坚持使用BIOS而不使用UEFI的情况：

* UEFI比BIOS需要消耗更多内存：例如VMware虚拟机使用BIOS只需要增加4MB内存，而使用UEFI则需要预分配96MB内存
* VMware在实现UEFI上比BIOS稳定性差一些
* 从操作系统角度来看，支持BIOS的种类更多一些，例如FreeBSD在VMware UEFI上不能工作
* UEFI支持的工业标准比BIOS少，例如PXE服务器可能不知道如何处理EFI客户端，某些镜像工具不能处理GUID分区表

# 参考

* [Using EFI/UEFI firmware in a VMware Virtual Machine](https://communities.vmware.com/docs/DOC-28494)