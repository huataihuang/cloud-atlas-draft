# xm/xend主机使用usb设备

> 注意：XEN 4.2之后废弃了`xend/xm`，并且从Xen 4.5开始已经不可使用这个方法。本方法适用于xen 4.x 早期版本

`xend`支持模拟USB和PVUSB。但是要注意模拟USB和PVUSB是不同的命令，以及hotplug和配置文件。

## 在xm/xend中模拟USB

为了使用模拟USB，需要在配置文件中激活`usb=1`

可以在配置文件中指定设备，但是不幸的是`xend`的`usbdevice`语法只允许设置一个USB设备：

```
usb=1
usbdevice=host:1.6
```

幸运的是，可以在虚拟机启动以后，使用热插拔方式添加或去除usb设备：

```
xm usb-add domain host:xx.yy
xm usb-del domain host:xx.yy
```

> 注意：`xend`只支持USB 1.1，这是因为`xm/xend`只支持`qemu-dm-traditional`。而USB 2.0和USB 3.0只在上游qemu和XL中支持

## 实践

* 虚拟机检查

```
sudo xm list
```

```
Name                                        ID   Mem
...
xen-guest_example                        67  8192     4     -b----   1102.0
```

* 检查usb设备

```
$sudo lsusb
Bus 002 Device 010: ID 14d6:3002
```

* 添加设备

语法：

```
xm usb-add domain host:xx.yy
```

举例：(迅即名字是`xen-guest_example`)

```
xm usb-add xen-guest_example host:14d6:3002
```

此时看到物理服务器 `/var/log/xen/qemu-dm-xen-guest_example.log` 日志中有对应

```
dm-command: usb-add a usb device
dm-command: usb-add a usb device: host:14d6:3002
husb: open device 1.3
husb: config #1 need -1
husb: 1 interfaces claimed for configuration 1
husb: grabbed usb device 1.3
dm-command: finish usb-add a usb device:host:14d6:3002
```

* 删除设备

语法：

```
xm usb-del domain host:xx.yy
```

举例：

```
xm usb-del xen-guest_example host:14d6:3002
```

# 参考

* [Xen USB Passthrough](https://wiki.xenproject.org/wiki/Xen_USB_Passthrough)