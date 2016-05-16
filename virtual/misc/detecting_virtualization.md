实际工作中遇到一个需要检查当前主机是物理服务器还是虚拟机的问题，这里讨论检查的方法。

# 原理

要检测当前登录的主机是虚拟机还是物理服务器，可以通过系统工具 `dmidecode` 来检测

```bash
dmidecode -s system-product-name
```

`-s` 参数表示 `--string KEYWORD` ，即只显示指定DMI字符串

对于物理服务器，该字符串`system-product-name`会输出服务器厂商的型号，例如

Dell:

```
PowerEdge R620
```

HP:

```
ProLiant DL380p Gen8
```

如果是虚拟机，常见虚拟技术：

* VMware Workstation

```
VMware Virtual Platform
```

* VirtualBox

```
VirtualBox
```

* Qemu with KVM

```
KVM
```

* Xen

可能没有输出内容

# 参考

* [How to detect virtualization](http://www.dmo.ca/blog/detecting-virtualization-on-linux/)
* [Easy way to determine virtualization technology](http://unix.stackexchange.com/questions/89714/easy-way-to-determine-virtualization-technology)