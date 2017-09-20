# 介绍

`virsh`是一个使用[libvirt](http://libvirt.org/)来管理KVM虚拟主机的命令行工具。

# 使用

* 查看主机信息

```bash
virsh nodeinfo
```

显示输出

```
CPU model:           x86_64
CPU(s):              8
CPU frequency:       1995 MHz
CPU socket(s):       2
Core(s) per socket:  4
Thread(s) per core:  1
NUMA cell(s):        1
Memory size:         4056256 kB
```

## 查看guest信息

* 显示已经定义的guest主机

```bash
virsh list --all
```

* 显示一个guest主机的信息

```bash
virsh dominfo guest_name
```
## 启动和停止guest

* 启动一个guest

```bash
virsh start guest_name
```

* 关闭一个guest

```bash
virsh shutdown guest_name
```

* 强制关闭一个guest

```bash
virsh destroy guest_name
```

* 挂起一个guest

```bash
virsh suspend guest_name
```

* 继续一个guest运行

```bash
virsh resume guest_name
```

# 虚拟机链接

# 参考

* [How To Manage KVM Virtual Machines Using Virsh](http://acidborg.wordpress.com/2010/02/19/how-to-manage-kvm-virtual-machines-using-virsh/)
* [Virsh Command Reference](http://libvirt.org/sources/virshcmdref/html-single/)