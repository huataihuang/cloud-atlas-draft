> 设置Hibernate休眠模式关键点是设置足够存储笔记本内存内容的swap空间，否则会导致hibernate失败。

我的笔记本安装了双操作系统，有时候希望能够切换到MacOS平台，同时在切换回Linux时候能够保持离开时的工作桌面。

本文是参考Arch Linux文档[Power management/Suspend and hibernate (简体中文)](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))和[Enabling Hibernation in Fedora 23](https://baldpenguin.blogspot.com/2016/03/enabling-hibernation-in-fedora-23.html)的一个摘要笔记和实践记录。

实现了Hibernate之后，在双操作系统之间切换非常方便，hibernate之后会切断电源，这样启动时候也是grub界面，但是进入桌面时候就会看出差异：和MacOS一样，每次都回到最初的工作状态，实在是居家旅行编码的一大利器！

# 挂起、睡眠和休眠的区别

暂停并保存当前系统运行状态（前后台进程服务，不包含buff和cache等）有三种方法：

* 挂起到内存：suspend to ram(简称str）

通常被称为挂起，设备通电，低功耗。

挂起也被称为暂停或待机，一般系统一段时间没有操作，系统就会挂起（到内存中），多数外围设备会关闭，某些设备会运行（如键盘鼠标），可以快速响应这些设备从而唤醒系统。 

* 挂起到磁盘：suspend to disk(简称std)

通常被称为休眠，设备断电，即设备会关机。 

休眠也被称为冬眠（hibernate实为冬眠之意），保存运行状态存到硬盘中，然后关机。下次开机后，系统从硬盘中读取存储的数据并恢复到关机前的状态。 

* 混合挂起：suspend to ram and disk(简称strd)

通常被称为睡眠，设备通电，低功耗。

睡眠更准确的名称应该是混合睡眠，所谓混合即存储方式上包含了挂起和休眠两种方式，唤醒时会优先从内存中读取数据，如果设备在此状态下断电（例如笔记本电脑在睡眠时外部电源断掉，而睡眠一段时间后内部电源耗尽），就和休眠一样了。 

> `suspend`(挂起到内存)基本无需设置，默认合上笔记本屏幕就是`suspend`。除了电源按钮有些别扭（按一下就关机），但也可参考[修改ACPI事件：更改电源键默认操作](../../../kernel/cpu/acpi_events_change_handlepowerkey_action)进行修改。

# 休眠设置

当前比较新的发行版采用了`systemd`来管理系统，通常可以使用`systemd`休眠管理。此外，也可以选择[pm-utils](https://wiki.archlinux.org/index.php/Pm-utils_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))实现。

## 开启休眠

### 划分合适大小的swap分区

休眠（hibernate）需要将内存中的内容写入磁盘的swap分区，如果swap分区大小比当前休眠所需空间小，则无法保证能够正确地休眠。具体的swap的大小根据个人使用情况（要休眠时的内存占用）而定。 

> 在初次安装Fedora操作系统的时候，只划分了内存的一半大小的swap分区。所以我在实践中，首先采用了[缩小lvm卷](../../../storage/lvm/decrease_lvm)将部分分配给`home`逻辑卷的空间划分给`swap`卷，以实现swap空间满足大于内存空间。

### 添加swap到fstab

> 如果fstab中没有swap磁盘设置则要添加。注意：如果你和我一样对LVM卷做了调整，并且重新执行过`mkswap`，则swap的UUID会修改，使用以下命令获取当前swap的UUID：

```
blkid /dev/mapper/fedora-swap
```

输出类似

```
/dev/mapper/fedora-swap: UUID="f08e5108-ede1-4a51-b479-bf53b1aa5852" TYPE="swap"
```

* 将上述swap的uuid配置添加到`/etc/fstab`：

```
UUID=f08e5108-ede1-4a51-b479-bf53b1aa5852 swap swap defaults 0 0
```

> 不过，实际我的系统在安装Fedora是已经设置过swap，所以默认有一个配置无需修改：

```
/dev/mapper/fedora-swap swap                    swap    defaults        0 0
```

### 配置 initramfs的resume钩子

#### 在Arch Linux中配置initramfs

* 对于`Arch Linux`，采用编辑编辑`/etc/mkinitcpio.conf`，在HOOKS行中添加`resume`钩子

 例如该行原有内容是： 

```
HOOKS="base udev autodetect modconf block filesystems keyboard fsck"
```

添加resume后就是：

```
HOOKS="base udev resume autodetect modconf block filesystems keyboard fsck"
```

> 注意: 如果使用`lvm`分区，需要将`resume`放在`lvm`后面，使用lvm的示例：

```
HOOKS="base udev autodetect modconf block lvm2 resume filesystems keyboard fsck"
```
* 重新生成 initramfs 镜像:

```
mkinitcpio -p linux
```

#### 在Fedora中配置initramfs

> Fedora使用[Dracut](https://fedoraproject.org/wiki/Dracut)来维护initramfs。详细的信息参考[kernel wiki: dracut](https://dracut.wiki.kernel.org/index.php/Main_Page)。这里简述操作过程，没有涉及Dracut的架构和原理。

* 检查`initramfs`是否包含从hibernation中`resume`

> 注意：Fedora的`dracut`模块已经确保了`resume`位于`lvm`模块之后，类似前述在Arch Linux中设置initramfs所要求的：

执行命令：

```
lsinitrd | less
```

可以看到`dracut`模块包含如下内容

```
dracut modules:
...
lvm
resume
...
```

如果上述`lsinitrd`输出中没有包含上述内容，则针对当前运行的内核执行以下命令：

```
dracut -f -v
```

此时输出将包含`resume`模块

### 在bootloader中增加resume内核参数

* 编辑 `/etc/default/grub` 在`GRUB_CMDLINE_LINUX_DEFAULT`中添加`resume=/dev/mapper/fedora-swap`

```
GRUB_CMDLINE_LINUX="rd.lvm.lv=fedora/root rd.lvm.lv=fedora/swap rhgb quiet rd.driver.blacklist=nouveau resume=/dev/mapper/fedora-swap"
```

> 如果swap空间在其他分区，例如`sda3`，则可以配置`resume=/dev/sda3`

假如该行的原有内容是：

```
GRUB_CMDLINE_LINUX_DEFAULT=”quiet intel_pstate=enable”
```

添加resume参数后就是：

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_pstate=enable resume=/dev/sda3"
```

* 更新 grub 配置：

如果系统使用EFI

```
grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
```

如果系统使用BIOS（非EFI）

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

> 不过，在Fedora中，`/boot/grub2/grubenv`是一个软链接到`../efi/EFI/fedora/grubenv`，所以上述两个命令在EFI环境可能是等同的。

检查验证`/boot/grub2/grub.cfg`内容有：

```
        linuxefi /vmlinuz-4.14.8-300.fc27.x86_64 root=/dev/mapper/fedora-root ro rd.lvm.lv=fedora/root rd.lvm.lv=fedora/swap rhgb quiet rd.driver.blacklist=nouveau resume=/dev/mapper/fedora-swap
        initrdefi /initramfs-4.14.8-300.fc27.x86_64.img
```

### 重启系统

```
systemctl reboot
```

如果重启成功，则尝试hibernate

```
systemctl hibernate
```

或者混合睡眠（结合内存和磁盘，优先从内存加载）

```
systemctl hybrid-sleep
```

# 参考

* [Power management/Suspend and hibernate (简体中文)](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [Enabling Hibernation in Fedora 23](https://baldpenguin.blogspot.com/2016/03/enabling-hibernation-in-fedora-23.html) 这篇文章的情况和我相同，非常详细的设置lvm swap卷作为Hibernate