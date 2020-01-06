> 和 [添加和动态调整虚拟机数据磁盘](add_resize_virtual_disk_to_guest_on_fly) 类似，本次实践是调整虚拟机的磁盘和文件系统（根文件系统）的大小，以便能够让虚拟机在[CentOS7的嵌套虚拟化(nested virtualization)](../../nested_virtualization/nested_virtualization_kvm_centos7)中有足够磁盘空间运行。

# resize Linux磁盘

> **注意**：只有`raw`格式支持双向resize（扩大或缩小），`qcow2`版本2或`qcow2`版本3的镜像只支持扩大(grown)不支持缩小(shrunk)

```
qemu-img resize filename [+|-]size[K|M|G|T]
```

* 将磁盘文件扩容到30G

```
qemu-img resize /var/lib/libvirt/images/dev7-data.img 30G
```


# 参考

* [How to Resize / Expand a Btrfs Volume / Filesystem](https://www.thegeekdiary.com/how-to-resize-expand-a-btrfs-volume-filesystem/)
* [Resizing a btrfs file system](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Storage_Administration_Guide/ch06s03.html)
* [How to resize/extend a btrfs formatted root partition](https://www.suse.com/support/kb/doc/?id=7018329)