在使用KVM运行的虚拟机，当VNC客户端连接服务器，例如Windows桌面，会发现实际鼠标移动和桌面上的鼠标移动不协调，且有偏移。

解决的方法是在启动guest的时候，qemu加上参数`-usb –usbdevice tablet`，例如：

```
qemu-kvm -smp 4 -m 2048 -hda /images/Win7.img -usb -usbdevice tablet
```

这个方法在Xen和KVM中都是通用的。

在Xen启动guest，配置中添加如下两行：

```
usb=1 
usbdevice='tablet'
```

如果是采用libvirtd启动虚拟机，在虚拟机的xml配置的`<input type='mouse' bus='ps2'/>`项前面中添加如下配置：

```xml
    <input type='tablet' bus='usb'>
        <alias name='input0'/>
    </input>
    <input type='mouse' bus='ps2'/>
```

然后重新启动虚拟机（不需要destroy，只需要shutdown然后start），在终端中检查qemu进程，可以看到参数如下：

```
/usr/bin/qemu-kvm -name win2016 -kvmdev /dev/kvm0 -S -machine pc-i440fx-2.1,accel=kvm,usb=off ... -device usb-tablet,id=input0 ...
```

# 参考

* [Xen/KVM中解决鼠标移动问题](http://smilejay.com/2012/06/xen-kvm-cursor-movement/)
* [VNCViewer连接KVM虚机鼠标不同步问题](https://blog.csdn.net/submorino/article/details/40982807)