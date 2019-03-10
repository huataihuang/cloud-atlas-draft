# 安装前

运行KVM前，需要确定处理器是否支持硬件虚拟化，Intel或AMD处理器分别称其为`VT-x`和`AMD-V`

```
egrep -c '(vmx|svm)' /proc/cpuinfo
```

如果上述输出显示为`0`表明处理器不支持硬件虚拟化。`1`或以上责表示处理器支持，但是依然需要在BIOS中开启。

默认情况，如果启动到XEN内核，就不会显示`svm`或`vmx`标记，此时在XEN环境需要使用如下方法：

```
cat /sys/hypervisor/properties/capabilities
```

同样需要在输出中看到`hvm`标记。

或者使用`kvm-ok`命令检查，输入类似：

```
INFO: /dev/kvm exists
KVM acceleration can be used
```

如果输出显示如下：

```
INFO: Your CPU does not support KVM extensions
KVM acceleration can NOT be used
```

则依然可以运行虚拟机，但是没有KVM扩展支持则运行缓慢。

* 使用64位内核

> 32为操作系统会限制VM只能使用2G内存，并且在32位操作系统中无法运行64位虚拟机。

要检查处理器是否是64位，可以使用如下方法：

```
egrep -c ' lm ' /proc/cpuinfo
```

输出计数大于`0`就是64位处理器。

检查内核是否是64位，使用命令：

···
uname -m
···

> 输出`x86_64`表示运行64位内核。如果输出i386, i486, i586 或 i686责位32位内核。

# 安装KVM

## 安装必要软件包

采用如下安装方法

Ubuntu 18.10及以上版本

```
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst
```

Ubuntu 16.04及以上版本

```
sudo apt install qemu-kvm libvirt-bin virtinst
```

> 以下为原文档推荐安装软件包，但我实际没有采用这个安装方法（主要是采用了redhat的`virt-install`安装工具）

Lucid (10.04) 及以后版本

```
sudo apt-get install qemu-kvm libvirt-bin ubuntu-vm-builder bridge-utils
```

Karmic (9.10) 或早期版本

```
sudo aptitude install kvm libvirt-bin ubuntu-vm-builder bridge-utils
```

安装将部署：

* `libvirt-bin`提供`libvirtd`用于通过libvirt管理qemu和kvm
* 后端使用`qemu-kvm`（早期Kamic及更早版本使用`kvm`）
* `ubuntu-vm-builder`命令行工具提供构建虚拟机，这个工具并不好用，还是使用`virt-install`(通过`virtinst`软件包)较为方便
* `bridge-utils`提供虚拟机网络的网桥

## 添加用户到用户组

* Karmic(9.10)及以后版本（但不包括14.04 LTS）需要确保用户已经添加到组`libvirtd`中

```
sudo adduser `id -un` libvirtd
```

然后需要重新登陆系统以便`libvirtd`用户组成员身份生效。这个组的成员可以运行虚拟机。

* Karmic(9.10)之前版本责加入`kvm`组

```
sudo adduser `id -un` kvm
```

`重新登陆系统`后用户就成为`kvm`和`libvirtd`用户组的有效成员，可以运行虚拟机。

```
$ virsh list --all
 Id    Name                           State
----------------------------------------------------
```

如果看到报错，例如无法访问sock文件，可以检查`/var/run/libvirt/libvirt-sock`文件权限：

```
$ sudo ls -la /var/run/libvirt/libvirt-sock
srwxrwx--- 1 root libvirtd 0 Mar 15 04:20 /var/run/libvirt/libvirt-sock
```

注意：上述`libvirt-sock`文件对于`libvirtd`组用户是可以读写执行的，所以才能够以普通用户身份运行`virsh`命令。

此外可能在创建虚拟机时遇到问题，则检查`kvm`设备的属主：

```
$ ls -lh /dev/kvm
crw-rw----+ 1 root kvm 10, 232 Mar 15 04:20 /dev/kvm
```

可以看到`kvm`设备的组属主是`kvm`用户组，则需要调整成`libivrtd`组（因为前面我们将自己的账号放入了`libvirtd`组），或者将自己账号再放入到`kvm`组：

```
sudo adduser `id -un` kvm
```

注意：如果你采用修改`/dev/kvm`设备属主，则需要重新启动内核模块或者`relogin`

```
rmmod kvm
modprobe -a kvm
```

# 参考

* [KVM/Installation](https://help.ubuntu.com/community/KVM/Installation)