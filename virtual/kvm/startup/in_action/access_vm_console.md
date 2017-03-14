发行版为了系统安全，默认在物理服务器上不能访问KVM虚拟机，所以使用`virsh console vm_name`是没有任何输出内容的。

# RHEL/CentOS 7

在虚拟机内部，在`/boot/grub2/grub.cfg`最后添加`console=ttyS0`

```
grubby --update-kernel=ALL --args="console=ttyS0"
```

> 上述命令是直接在`/boot/grub2/grub.cfg`配置的`linux16 /vmlinuz-3.10...`行最后添加上`console=ttyS0`，但并不会修改`/etc/default/grub`文件

或者编辑`/etc/default/grub`文件，在`GRUB_CMDLINE_LINUX`变量值中添加`console=ttyS0`，然后再执行命令`grub2-mkconfig -o /boot/grub2/grub.cfg`

然后重启操作系统

## 已经测试：RHEL可以使用`systemctl`来激活`serial-getty@ttyS0.service`

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