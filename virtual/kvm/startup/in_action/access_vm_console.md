发行版为了系统安全，默认在物理服务器上不能访问KVM虚拟机，所以使用`virsh console vm_name`是没有任何输出内容的。

# 虚拟机串口

默认libvirt创建虚拟机的串口设备如下，保证了串口可以访问的硬件设备基础：

```xml
    <serial type='pty'>
      <source path='/dev/pts/1'/>
      <target type='isa-serial' port='0'>
        <model name='isa-serial'/>
      </target>
      <alias name='serial0'/>
    </serial>
    <console type='pty' tty='/dev/pts/1'>
      <source path='/dev/pts/1'/>
      <target type='serial' port='0'/>
      <alias name='serial0'/>
    </console>
```

如果要从硬件上关闭虚拟机console访问，可以将串口设备重定向到文件，这样就可以避免系统管理员访问（安全隐患），同时提供系统日志输出：

```xml
      <serial type='file'>
        <source path='/var/log/libvirt/vm_console/example-vm.log'/>
        <target port='0'/>
      </serial>
      <console type='file'>
        <source path='/var/log/libvirt/vm_console/example-vm.log'/>
        <target type='serial' port='0'/>
      </console>
```

----

# RHEL/CentOS 7

在虚拟机内部，在`/boot/grub2/grub.cfg`最后添加`console=ttyS0`

```
grubby --update-kernel=ALL --args="console=ttyS0"
```

> 上述命令是直接在`/boot/grub2/grub.cfg`配置的`linux16 /vmlinuz-3.10...`行最后添加上`console=ttyS0`，但并不会修改`/etc/default/grub`文件

或者编辑`/etc/default/grub`文件，在`GRUB_CMDLINE_LINUX`变量值中添加`console=ttyS0`，然后再执行命令`grub2-mkconfig -o /boot/grub2/grub.cfg`

然后重启操作系统

----

# 通过内核参数设置串口输出

CentOS/Debian/Ubuntu等Linux都支持通过内核参数来设置串口输出，基本方法就是在内核参数添加`console=tty0 console=ttyS0,115200n8`。

> 注意：网上有些早期文档建议设置`serial=tty0 console=ttyS0,115200n8`，但是实践发现，通过VNC访问虚拟时会导致控制台输出在serial串口，VNC无法访问。只有订正为`console=tty0 console=ttyS0,115200n8`才能解决。
>
> 类似亚马逊AWS的虚拟机内核参数都是使用了`console=tty0 console=ttyS0,115200n8`，能够保证串口输出内容记录到物理服务器，提供故障排查。

## CentOS 7使用grub2

* 编辑`/etc/default/grub`在`GRUB_CMDLINE_LINUX`行添加`serial=tty0 console=ttyS0,115200n8`，案例如下

```
GRUB_CMDLINE_LINUX="crashkernel=auto rhgb quiet net.ifnames=0 console=tty0 console=ttyS0,115200n8"
```

* 执行以下命令生成`grub.cfg`配置

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

重启虚拟机生效。

## CentOS 6.x

> 在CentOS 6上使用grub

* 直接编辑`/boot/grub/menu.lst`

```
    kernel /boot/vmlinuz-2.6.32-642.11.1.el6.x86_64 ... console=tty0 console=ttyS0,115200n8
```

重启虚拟机。

## Ubuntu 16

> Ubuntu 16 使用GRUB2，和CentOS7 类似

* 编辑`/etc/default/grub`在`GRUB_CMDLINE_LINUX`行添加`console=tty0 console=ttyS0,115200n8`，案例如下

```
GRUB_CMDLINE_LINUX=" net.ifnames=0 console=tty0 console=ttyS0,115200n8"
```

* 执行以下命令更新`grub.cfg`配置

```
update-grub
```

重启虚拟机生效。

----

# 已经测试：RHEL可以使用`systemctl`来激活`serial-getty@ttyS0.service`

RHEL/CentOS7和Ubuntu 15.04都使用了`systemd`，所以也可以直接使用`systemctl`来启用Guest虚拟机的控制台，方法相同

```
systemctl enable serial-getty@ttyS0.service
systemctl start serial-getty@ttyS0.service
```

此时可以直接在Host物理服务器使用`virsh console my_vm`直接访问虚拟机控制台，非常方便。

# Debian/Ubuntu

> 记录但未验证

* 复制出`ttyS0.conf`

```
sudo cp /etc/init/tty1.conf /etc/init/ttyS0.conf
```

然后编辑`ttyS0.conf`修改如下行

```
exec /sbin/getty -8 115200 ttyS0 xterm
```

> 当前应该也是通过内核设置来输出串口

编辑`/etc/default/grub`设置

```
GRUB_CMDLINE_LINUX_DEFAULT=”console=ttyS0″
```

然后执行

```
sudo update-grub2
```

# Ubuntu 15

* 首先为Guest定义一个console设备

```
virsh ttyconsole my_vm
```

输出类似`/dev/pts/41`则表明Guest已经有了串口设备

否则就要使用`virsh edit`添加设备

```
<console type='pty'>
  <target port='0'/>
</console>
```

* 在Guest中配置串口

对于Ubuntu 15.04，使用`systemctl`命令

```
systemctl enable serial-getty@ttyS0.service
systemctl start serial-getty@ttyS0.service
```

对于早期版本则编辑`/etc/init/ttyS0.conf`

```
# ttyS0 - getty
#
# This service maintains a getty on ttyS0 from the point the system is
# started until it is shut down again.

start on stopped rc RUNLEVEL=[2345]
stop on runlevel [!2345]

respawn
exec /sbin/getty -L 115200 ttyS0 xterm
```

然后执行以下命令初始化串口

```
sudo start ttyS0
```

# 参考

* [RHEL7: Access a virtual machine’s console](https://www.certdepot.net/rhel7-access-virtual-machines-console/)
* [How to access the text console of a virtual KVM guest from within virsh](How to access the text console of a virtual KVM guest from within virsh)
* [Direct terminal access via Serial Console](https://help.ubuntu.com/community/KVM/Access) 官方帮助文档