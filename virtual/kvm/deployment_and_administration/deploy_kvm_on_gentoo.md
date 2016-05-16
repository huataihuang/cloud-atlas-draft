# QEMU

QEMU(**Q**uick **EMU**lator)是一个通用的开源虚拟主机软件，通常和Type-I hypervisor如KVM（Kernel-based Virtual Machine）或Xen的加速器结合使用。如果没有使用加速器，QEMU就完全运行在用户空间，使用自己的二进制转换TCG（微代码生成器）。单纯使用QEMU而不使用加速器是非常低效和缓慢的。

# 安装

在Gentoo Linux上安装部署KVM

## BIOS和UEFI firmware

要使用KVM，处理器必须支持`Vt-x`或`AMD-V`（两者分别是Intel和AMD的虚拟化技术，允许在处理器中运行多个操作系统）。

要检查硬件的虚拟化支持功能

```bash
grep --color -E "vmx|svm" /proc/cpuinfo
```

当系统支持KVM，在设备文件目录有`/dev/kvm`设备

## 内核

在内核选项中激活以下配置

```bash
[*] Virtualization  --->
    <*>   Kernel-based Virtual Machine (KVM) support
    <*>   KVM for Intel processors support
```

> 如果是AMD处理器，则激活 `<*>   KVM for Intel processors support`

在USE flag中建议使用能够`vhost-net`配置

```bash
[*] Virtualization  --->
    <*>   Host kernel accelerator for virtio net
```

可选的高级网络支持

```bash
Device Drivers  --->
    [*] Network device support  --->
        [*]   Network core driver support
        <*>   Universal TUN/TAP device driver support
```

需要激活802.1d以太网桥支持

```bash
[*] Networking support  --->
        Networking options  --->
            <*> The IPv6 protocol
            <*> 802.1d Ethernet Bridging
```

在USE flag中需要激活`python`来支持文件捕获功能

```bash
Kernel hacking  --->
        Compile-time checks and compiler options  --->
            [*] Debug Filesystem
```

在使用ext4文件系统，激活`filecaps` USE flag来支持stats

```bash
File systems  --->
    <*> The Extended 4 (ext4) filesystem
    [*]   Ext4 Security Labels
```

## USE flags

| USE flag | 说明 | 范围 |
| ---- | ---- | ---- |
| `accessibility` | 支持使用brltty的braille显示 | 本地 |
| `aio` | 支持Linux异步IO | 本地 |
| `alsa` | 支持声音模拟的alsa输出 | 本地 |
| `bluetooth` | 支持蓝牙 | 全局 |
| `caps` | 使用Linux库来控制权限 | 全局 |
| `curl` | 支持通过HTTP或HTTPS来设置ISOs/ -cdrom | 本地 |
| `debug` | 激活debug的扩展 | 全局 |

> 详细USE flag见原文[QEMU](https://wiki.gentoo.org/wiki/QEMU)

## 安装

```bash
emerge --ask app-emulation/qemu
```

# 配置

## 网络

### IPv6


有关IPv6网络参考[IPv6 subarticle](https://wiki.gentoo.org/wiki/QEMU/KVM_IPv6_Support)

### 权限

要运行一个KVM加速的虚拟机而无需登录root帐号，需要将普通用户帐号添加到`kvm`组，执行以下命令将`<username>`替换成相应的用户名

```bash
gpasswd -a <username> kvm
```

### Front ends（前端）

为了方便使用QEMU，可以使用一些前端工具来维护

| 程序 | 软件包 | 官方网站 | 说明 |
| ---- | ---- | ---- | ---- |
| [AQEMU](https://wiki.gentoo.org/wiki/AQEMU) | `app-emulation/aqemu` | [http://sourceforge.net/projects/aqemu](http://sourceforge.net/projects/aqemu) | 图形界面管理QEMU和KVM，使用Qt4编写 |
| libvirt | `app-emulation/libvirt` | [http://www.libvirt.org](http://sourceforge.net/projects/aqemu) | C编写的维护虚拟机的工具 |
| [[QtEmu](https://wiki.gentoo.org/wiki/QtEmu) | `app-emulation/qtemu` | [http://qtemu.sourceforge.net/](http://qtemu.sourceforge.net/) | 图形界面管理QEMU，使用Qt4编写 |
| virt-manager | `app-emulation/virt-manager` | [http://virt-manager.org/](http://virt-manager.org/) | 管理虚拟机的图形工具 |

### `kvm: already loaded the other module`

如果遇到启动时候报错`kvm: already loaded the other module`则表明内核中同时激活了Intel和AMD的虚拟机设置。要修正这个错误，可以将Intel和AMD的虚拟机支持编译成内核，或者根据系统的处理器类型指定特定的虚拟机支持（`CONFIG_KVM_INTEL`或`CONFIG_KVM_AMD`）。

# 参考

* [KVM on Gentoo](http://www.linux-kvm.org/page/KvmOnGentoo)
* [QEMU](https://wiki.gentoo.org/wiki/QEMU)