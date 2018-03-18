# 概述

在Ubuntu上创建KVM虚拟机有以下集中方式：

* [virt-manager](http://virt-manager.et.redhat.com/): GUI工具
* [virt-install](http://www.howtoforge.com/installing-kvm-guests-with-virt-install-on-ubuntu-8.10-server): Red Hat开发的python脚本，需要安装`virtinst`包
* ubuntu-vm-builder

> 推荐使用[virt-install](https://help.ubuntu.com/16.04/serverguide/libvirt.html#libvirt-virt-install)，主要原因是通用性 - 这个工具是RedHat开发，可以在RHEL和Ubuntu上使用，并且Ubuntu Server手册主要介绍这个工具。
> 
> [ubuntu-vm-builder](http://manpages.ubuntu.com/manpages/xenial/man1/ubuntu-vm-builder.1.html)现在只是[vmbuilder](https://help.ubuntu.com/community/JeOSVMBuilder)（属于`pyton-vm-builder`包）的wrpper，主要维护用于兼容旧的脚本。

# 创建虚拟机

参考[在CentOS中部署KVM](../startup/in_action/deploy_kvm_on_centos)

## 终端安装模式

```bash
virt-install \
  --network bridge:virbr0 \
  --name centos7 \
  --ram=1024 \
  --vcpus=1 \
  --disk path=/var/lib/libvirt/images/centos7.img,size=10 \
  --graphics none \
  --location=http://mirrors.163.com/centos/7/os/x86_64/ \
  --extra-args="console=tty0 console=ttyS0,115200"
```

> 最初我使用的参数是`--extra-args="console=tty0 console=ttyS0,115200"` （模拟原先设置KVM虚拟机串口输出的参数）
>
> 报错`WARNING  Did not find 'console=ttyS0' in --extra-args, which is likely required to see text install output from the guest.`
>
> 参考 [KVM Guest installed from console. But how to get to the guest's console?](https://serverfault.com/questions/257962/kvm-guest-installed-from-console-but-how-to-get-to-the-guests-console) 和 [KVM Install from Console](https://arstechnica.com/civis/viewtopic.php?f=16&t=1165804) 应该改成 `--extra-args="console=tty0"`。
>
> 不过依然报错，但是只有终端输出没有终端输入。

上述采用了控制台方式安装

但是出现报错

```
[   76.466689] dracut-initqueue[585]: umount: /run/initramfs/squashfs: not mounted
[   76.470503] dracut-initqueue[585]: /sbin/dmsquash-live-root: line 273: printf: write error: No space left on device
[  241.174832] dracut-initqueue[584]: Warning: dracut-initqueue timeout - starting timeout scripts
...  不断打印这行超时日志
```

在打印超时日志后，进入终端修复模式

```
[  304.659694] dracut-initqueue[584]: Warning: Could not boot.
[  304.949309] dracut-initqueue[584]: Warning: /dev/root does not exist
         Starting Dracut Emergency Shell...
Warning: /dev/root does not exist

Generating "/run/initramfs/rdsosreport.txt"


Entering emergency mode. Exit the shell to continue.
Type "journalctl" to view system logs.
You might want to save "/run/initramfs/rdsosreport.txt" to a USB stick or /boot
after mounting them and attach it to a bug report.


dracut:/#
```

* 删除重建虚拟机

```
virsh destroy centos7
virsh undefine centos7
```

尝试

```
virt-install \
--name centos7 \
--ram 1024 \
--vcpus 1 \
--disk path=/var/lib/libvirt/images/centos7.img,size=10 \
--os-type linux \
--os-variant rhl7.3 \
--network bridge=virbr0 \
--graphics none \
--console pty,target_type=serial \
--location 'http://mirrors.163.com/centos/7/os/x86_64/' \
--extra-args 'console=ttyS0,115200n8 serial'
```

> 如果使用`--os-variant centos7`会出现 `ERROR    Error validating install location: Distro 'centos7' does not exist in our dictionary`报错，原来这个参数是根据`osinfo-query os`输出确定的。可以使用`rhl7.3`
>
> 参考 [Installing Virtual Machines with virt-install, plus copy pastable distro install one-liners](https://raymii.org/s/articles/virt-install_introduction_and_copy_paste_distro_install_commands.html)

----

改为采用VNC方式，通过图形界面处理：

```
virt-install \
  --network bridge:virbr0 \
  --name centos7 \
  --ram=2048 \
  --vcpus=1 \
  --os-type linux \
  --os-variant rhl7.3 \
  --disk path=/var/lib/libvirt/images/centos7.img,size=10 \
  --graphics vnc \
  --location=http://mirrors.163.com/centos/7/os/x86_64/
```

但是这次没有启动consle，只显示

```
WARNING  Graphics requested but DISPLAY is not set. Not running virt-viewer.
WARNING  No console to launch for the guest, defaulting to --wait -1
```

# 参考

* [KVM/CreateGuests](https://help.ubuntu.com/community/KVM/CreateGuests)