# 在host主机上访问vm的控制台

* kvm虚拟机的XML配置中设置设备（以下两种配置方法皆可）：

如下(host操作系统CentOS 7)

```xml
    <controller type='virtio-serial' index='0'>
      <alias name='virtio-serial0'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>
    </controller>
    ...
    <serial type='pty'>
      <source path='/dev/pts/0'/>
      <target port='0'/>
      <alias name='serial0'/>
    </serial>
    <console type='pty' tty='/dev/pts/0'>
      <source path='/dev/pts/0'/>
      <target type='serial' port='0'/>
      <alias name='serial0'/>
    </console>
```

或者如下（host操作系统Fedora 26/27）

```xml
    <controller type='virtio-serial' index='0'>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x05' function='0x0'/>
    </controller>
    ...
    <serial type='pty'>
      <target port='0'/>
    </serial>
    <console type='pty'>
      <target type='serial' port='0'/>
    </console>
```

此外，vitio控制台设备`/dev/hvc[0-7]`输出到guest中（参考 http://fedoraproject.org/wiki/Features/VirtioSerial ）

```xml
  <console type='pty'>
    <source path='/dev/pts/5'/>
    <target type='virtio' port='0'/>
  </console>
```

> 这里的虚拟机设备`'/dev/pts/0'`默认在libvirt创建虚拟机的时候就会添加，并且会随着虚拟机的增加，设备编号从`0`开始递增。
>
> 通常情况下不需要手工设置。

# guest虚拟机内部设置串口输出

* kvm虚拟机（guest）内部设置GRUB，向内核传递如下参数

```
kernel ..... serial=tty0 console=ttyS0,115200n8
```

或者（实际设置效果相同）

```
kernel ..... console=ttyS0,115200
```

## CentOS 7 grub2 设置串口输出

> 在CentOS 7上使用GRUB2

* 首先编辑`/etc/default/grub`设置如下

```
GRUB_CMDLINE_LINUX="crashkernel=auto rd.lvm.lv=centos/root rd.lvm.lv=centos/swap serial=tty0 console=ttyS0,115200n8 rhgb quiet"
```

* 然后执行

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

重启虚拟机，如果使用`sudo virsh console centos7`连接控制台报错 (这里假设虚拟机名字是`centos7`)

```
error: operation failed: Active console session exists for this domain
```

则表明已经有其他`virsh console`指令连接到了这个控制台，可以通过`ps aux | grep console`检查一下host主机中是否存在`virsh console centos7`

* kvm虚拟机（guest）内部编辑`/etc/securetty`添加如下行，允许`root`从`ttyS0`设备登陆：

```
ttyS0
```

> 在`CentOS 7`中默认已设置

## CentOS 6 grub 设置串口输出

> 在CentOS 6上使用grub

* 直接编辑`/boot/grub/menu.lst`

```
    kernel /boot/vmlinuz-2.6.32-642.11.1.el6.x86_64 ... serial=tty0 console=ttyS0,115200n8
```

重启虚拟机即生效

# guest虚拟机控制台输出到host主机日志

为了排查guest出现的内核crash问题，通常可以采用在guest操作系统内部启用kdump，或者采用[libvirt pvpanic](..qemu/libvirt_pvpanic)。此外，也可以通过将虚拟控制台的信息输出到host主机日志，方便从host主机上分析vm crash原因。

* 在host主机上编辑虚拟机XML，添加如下内容

```xml
    <!--serial type='pty'>
      <target port='0'/>
    </serial>
    <console type='pty'>
      <target type='serial' port='0'/>
    </console-->
    <serial type='file'>
      <source path='/var/log/libvirt/vm/vm-serial.log'/>
      <target port='0'/>
      <alias name='serial0'/>
    </serial>
    <console type='file'>
      <source path='/var/log/libvirt/vm/vm-serial.log'/>
      <target type='serial' port='0'/>
      <alias name='serial0'/>
    </console>
```

> 注意：需要去除原先设置的console登陆的配置，改为定向到host的文件。
>
> 如果没有注释掉`<serial type='pty'>`和`<console type='pty'>`，则会提示：

```
error: unsupported configuration: Only the first console can be a serial port
```

则控制台输出可以记录到host主机的`/var/log/libvirt/vm/vm-serial.log`文件中。

> 注意：必须确保`/var/log/libvirt/vm`目录存在，否则虚拟机无法启动。

不过，上述配置也带来`libvirtd.log`日志中记录：

```
2017-11-27 06:05:11.258+0000: 14058: error : qemuDomainOpenConsole:16181 : internal error: character device console0 is not using a PTY
```

代码

```c
if (chr->source.type != VIR_DOMAIN_CHR_TYPE_PTY) {
    virReportError(VIR_ERR_INTERNAL_ERROR,
                   _("character device %s is not using a PTY"),
                   NULLSTR(dev_name));
    goto cleanup;
}
```

# 参考

* [Consoles, serial, parallel & channel devices](https://libvirt.org/formatdomain.html#elementsConsole)
* [What reason could prevent console output from “virsh -c qemu:///system console guest1”?](https://askubuntu.com/questions/1733/what-reason-could-prevent-console-output-from-virsh-c-qemu-system-console-g)