# 虚拟机crash

当使用`kill -9`杀掉libvirt管理的kvm进程后，使用`virsh domstate --reason <name>` 可以看到输出是 `shut off (crashed)`

在代码libvirt代码 `include/libvirt/libvirt.h.in` 定义了vm关闭的原因对应的id：

```c
typedef enum {
    VIR_DOMAIN_SHUTOFF_UNKNOWN = 0,     /* the reason is unknown */
    VIR_DOMAIN_SHUTOFF_SHUTDOWN = 1,    /* normal shutdown */
    VIR_DOMAIN_SHUTOFF_DESTROYED = 2,   /* forced poweroff */
    VIR_DOMAIN_SHUTOFF_CRASHED = 3,     /* domain crashed */
    VIR_DOMAIN_SHUTOFF_MIGRATED = 4,    /* migrated to another host */
    VIR_DOMAIN_SHUTOFF_SAVED = 5,       /* saved to a file */
    VIR_DOMAIN_SHUTOFF_FAILED = 6,      /* domain failed to start */
    VIR_DOMAIN_SHUTOFF_FROM_SNAPSHOT = 7, /* restored from a snapshot which was
                                           * taken while domain was shutoff */
#ifdef VIR_ENUM_SENTINELS
    VIR_DOMAIN_SHUTOFF_LAST
#endif
} virDomainShutoffReason;
```

任何crash转换domain进入shutoff状态（qemu进程退出），libvirt就知道这个crash。要区分是qemu panic事件还是由于`kill -9`杀掉qemu，需要使用`pvpanic`设备。

如果没有启用`pvpanic`驱动，当guest内部出现kernel panic，则在host主机上使用 `virsh domstate --reason <name>` 却只能显示 `running (booted)`。

从[qemu 1.6](https://wiki.qemu.org/ChangeLog/1.6) （ [libvirt 从 1.2.1支持加入isa设备pvpanic](https://libvirt.org/formatdomain.html#elementsPanic)）开始实现了`-device pvpanic`（可以激活或者关闭）：qemu将pvpanic设备输出给guest，Linux guest可以在出现kernel panic时候写入这个设备，此时qemu就转发这个crash事件给libvirt。libvirt可以控制如何响应这个事件：重启或关闭guest，执行core dump等。

> 检查`qemu`版本：`qemu-kvm --version`。不过参考 [Re: [libvirt] virsh domstate output when kvm killed vs guest OS panic](https://www.redhat.com/archives/libvir-list/2013-September/msg00322.html) ：qemu 1.6不能很好处理pvpanic，所以可能需要进一步检查各个版本代码和release note。

libvirt有一个机制可以自动保存guest crash dump到指定目录（可以在`/etc/libvirt/qemu.conf`配置存储dump位置，默认是`/var/lib/libvirt/qemu/dump`目录），当为guest实例激活了panic device时，就不需要在guest系统内部运行kdump，可以直接在host上获取到虚拟机的crash dump。注意： **如果在guest同时激活了kdump和pvpanic，则kdump优先于pvpanic。**

同样原理，在virtio驱动中提供了windows驱动，这样windows guest也能够触发qemu event - [pvpanic/: QEMU pvpanic device driver (build virtio-win-0.1.103-2 and later) ](https://fedoraproject.org/wiki/Windows_Virtio_Drivers) - 该版本是 2015年5月5日发布

> 检查Windows使用的virtio驱动版本方法参考[how to find which virtio drivers version is installed in windows?](https://forum.proxmox.com/threads/solved-how-to-find-which-virtio-drivers-version-is-installed-in-windows.16174/):
>
> 在Windows虚拟机内部使用`Device Manager`管理器，找到`Storage controllers`下的`Red Hat VirtIO SCSI controller`设备，然后双击打开，并查看`Driver`面板中显示的`Driver Version`(驱动版本)，例如`62.61.101.58001`(`Driver Date`是`8/3/2016`)，对应的virtio驱动iso就是可以查看 http://www.linux-kvm.org/page/WindowsGuestDrivers/Download_Drivers

## pvpanic环境要求

| 软件 | 版本 | 说明 |
| ---- | ---- | ---- |
| qemu | 1.6 | |
| libvirt | 1.2.1 | |
| virtio |  virtio-win-0.1.103-2 | 2015年5月5日发布 |

# qemu pvpanic

pvpanic设备是一个模拟的ISA设备，通过这个设备guest panic事件被发送给qemu，并且生成一个QMP事件。这允许管理程序（例如，libvirt）被通知并响应这个事件。

管理程序有一个选项来等待`GUEST_PANICKED`事件，并且/或 polling `guest-panicked`运行状态，来获取何时出现pvpanic设备被panic事件触发。

## ISA接口

`pvpanic` 输出一个简单的I/O端口，默认是 `0x505`。读取时，通过设置设备的位来识别。软件可以忽略这个设置位。写入时，这个设置位不能省略。软件只能自己和设备识别两者来设置位。当前，只有位0是使用的，设置这个设置位就标志着发生了guest panic。

## ACPI接口

`pvpanic` 设备使用ACPI ID "QEMU0001" 来定义。定制方法：

* RDPT: 决定是否支持guest panic通知
* Arguments: 无
* 返回：返回一个字节，位0用于标志支持guest panic通知。其他位是保留的并且被忽略。

* WRPT: 用于发送一个guest panic事件
* Arguments: Arg0是一个字节，其中位0设置用于标记已经发生了guest panic。其他位是保留的，并且应该清空。
* 返回：无

ACPI设备在被修改时将自动引用正确的端口。

# libvirt panic device

libvirt从1.2.1开始，只针对QEMU和KVM提供了panic设备，可以从QEMU guest接收panic通知。

这个功能对于以下类型guest总是激活：

* pSeries guests，因为是通过guest firmware实现的
* S390 guests，因为是作为S390架构的集成部分

对于以上guest类型，libvirt自动在domain XML中添加了一个`panic`元素。

使用panic配置案例：

```
...
<devices>
  <panic model='hyperv'/>
  <panic model='isa'>
    <address type='isa' iobase='0x505'/>
  </panic>
</devices>
...
```

## model

选项`model`属性执行了提供panic设备的类型，当缺乏基于hypervisor和guest架构的这个属性，则使用panic model:

* `isa` - 针对ISA pvpanic设备
* `pseries` - 默认只针对pSeries guests
* `hyperv` - 针对Hyper-V crash CPU特性，从1.3.0开始提供给QEMU和KVM
* `s390` - 默认这对S390 guests，从1.3.5开始提供

## address

panic的地址，默认是`0x505`。大多数用户不需要指定地址，并且对于`s390`，`pseres`和`hyperv` models是不可使用的这个参数。

# 参考

* [qemu/docs/specs/pvpanic.txt](https://github.com/qemu/qemu/blob/master/docs/specs/pvpanic.txt)
* [[PATCH 0/2 v3] kvm: notify host when guest panicked](https://groups.google.com/forum/#!topic/linux.kernel/B2oUcSONMkY)
* [virsh domstate output when kvm killed vs guest OS panic](https://www.redhat.com/archives/libvir-list/2013-September/msg00322.html)
* [libvirt: panic device](https://libvirt.org/formatdomain.html#elementsPanic)
* [Libvirt: Enable Panic Device Notification](https://blueprints.launchpad.net/nova/+spec/libvirt-enable-pvpanic)
* [OpenStack: libvirt-pvpanic.rst](https://review.openstack.org/#/c/275219/1/specs/newton/approved/libvirt-pvpanic.rst)
* [Windows Virtio Drivers](https://fedoraproject.org/wiki/Windows_Virtio_Drivers)
* [how to find which virtio drivers version is installed in windows?](https://forum.proxmox.com/threads/solved-how-to-find-which-virtio-drivers-version-is-installed-in-windows.16174/)