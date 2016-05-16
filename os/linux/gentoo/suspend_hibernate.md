# suspend模式

当前有3种suspend模式：

* `suspend to RAM`（`suspend`）：状态保存和恢复都在内存中，节约的主机的电能。对于在电池状态运行的笔记本或者合上屏幕的笔记本推荐使用。
* `suspend to disk`（`hibernate`）：状态保存在`swap`空间并完全关闭主机。当主机电源启动，状态从`swap`恢复。这也是完全没有电能消耗的模式。
* `hybrid suspend`（`suspend to both`）：状态保存在`swap`，但是并不关闭主机电源。相反，它激活`suspend to RAM`。这样，如果电池没有耗尽时，就会从RAM中恢复主机状态。如果电池耗尽，则可以从磁盘恢复，此时恢复的时间比`suspend to RAM`较长，但是不会丢失数据。

# 要求

* （按照文档要求）软件包要求

```bash
emerge --ask sys-power/suspend
emerge --unmerge sys-power/upower
emerge --ask sys-power/upower-pm-utils
```

> 必须卸载掉`sys-power/upower`并安装`sys-power/upower-pm-utils`，这样才会在桌面环境出现`Suspend`和`Hibernate`按钮。另一种替代选择是使用`sys-power/hibernate-script`，这种方式适用于打过`swsusp`和`TuxOnIce`补丁包的内核。

* 内核配置

```bash
Power management and ACPI options --->
    [*] Suspend to RAM and standby
    [*] Hibernation (aka 'suspend to disk')
```

# 可用的suspend模式

通过以下命令检查可用的`suspend`模式

```bash
cat /sys/power/state
```

显示输出

```
freeze mem disk
```

# suspend to RAM

使用以下命令执行`suspend`

```bash
pm-suspend
```

或者

```bash
s2ram
```

或者

```bash
hibernate
```

也可以通过底层方式

```bash
echo mem > /sys/power/state
```

或者(对于Tol)

```bash
echo 3 > /sys/power/tuxonice/powerdown_method
```

或者(对于TuxOnIce)

```bash
echo > /sys/power/tuxonice/do_hibernate
```

# suspend to disk

要能够suspend to disk需要确保系统中有swap分区或者swap文件，并且swap文件要在使用前激活

## 使用`sys-power/pm-utils` suspend to disk

* 首先检查是否具备swap分区

```bash
swapon -s
```

假设使用`/dev/sdc2`分区

编辑`/etc/default/grub`并添加`GRUB_CMDLINE_LINUX_DEFAULT`选项有关swap分区

```bash
GRUB_CMDLINE_LINUX_DEFAULT="resume=/dev/sdc2"
```

重建grub2配置

```bash
grub2-mkconfig -o /boot/grub/grub.cfg
```

更新`initramfs`

```bash
genkernel --install initramfs
```

添加以下行到`/etc/pm/config.d/gentoo`

```bash
SLEEP_MODULE="kernel"
```

重启系统

```bash
reboot
```

然后就可以尝试

```bash
pm-hibernate
```

## 使用swap文件suspend to disk

> 对于我自己的实践，我是采用[Mac双启动方式](../../../develop/mac/dual_boot_linux_on_mac.md)来[在MacBook上安装Gentoo Linux](install_gentoo_on_macbook.md)。由于分区限制，只划分了一个分区给Gentoo Linux，所以实际是采用swap文件来实现hibernate的。

* 创建swap文件

```bash
mkdir /swap
dd if=/dev/zero of=/swap/file0 bs=512M count=32
mkswap /swap/file0
```

显示输出

```bash
Setting up swapspace version 1, size = 16 GiB (17179865088 bytes)
no label, UUID=1a6170e7-a38d-4829-be72-90f185e94289
```

* 查出swap文件所在磁盘分区的UUID

```bash
blkid /dev/sda4
```

显示输出

```bash
/dev/sda4: LABEL="Gentoo" UUID="6d6de45b-52b9-4c13-81b2-aff34a6791bd" TYPE="ext4" PARTLABEL="Gentoo" PARTUUID="ce1d1c89-8ca1-48b0-b4ef-5a312ae8c710"
```

* 计算出swap文件的偏移量

```bash
swap-offset /swap/file0
```

显示输出

```bash
resume offset = 5382144
```

> `man swap-offset`可以看到`swap-offset`命令的解释是`program to calculate the offset of a swap file in a partition`，所以这里我使用的是`/dev/sda4`分区的UUID

* 修改GRUB配置`/etc/defaults/grub`（我没有进行这步，仅供使用grub的用户参考；我使用的是rEFInd的EFI bootloader，没有使用grub2）

```bash
GRUB_CMDLINE_LINUX_DEFAULT="resume=UUID=6d6de45b-52b9-4c13-81b2-aff34a6791bd resume_offset=5382144"
```

然后重建GRUB配置

```bash
grub2-mkconfig -o /boot/grub/grub.cfg
```

然后重启系统尝试`hibernate`

* 我使用的是EFI bootloader `rEFInd` ，所以跳过刚才的配置GRUB步骤（如果你是用GRUB，没有使用`rEFInd`可以忽略这步），配置`EFI/refind/refind.conf`

```bash
menuentry cloud_partuuid_hibernate {
    icon EFI/refind/icons/os_gentoo.png
    loader EFI/gentoo/vmlinuz-4.5.0-gentoo-r1-cloud
    options "ro root=PARTUUID=ce1d1c89-8ca1-48b0-b4ef-5a312ae8c710 resume=UUID=6d6de45b-52b9-4c13-81b2-aff34a6791bd resume_offset=5382144 rootfstype=ext4 init=/usr/lib/systemd/systemd"
}
```

> 这里添加的配置就是 `resume=UUID=6d6de45b-52b9-4c13-81b2-aff34a6791bd resume_offset=5382144`

**不过，实际我测试还是没有成功**，日志中显示

```bash
Thu Apr  7 22:50:44 CST 2016: performing hibernate
s2disk: Could not stat the resume device file. Reason: No such file or directory
```

待探索！！！

# xfce和suspend

**我使用xfce桌面环境，其内置的`xfce-extra/xfce4-power-manager`则依赖`sys-power/upower`而且不能很好地和`upower-pm-utils`协作（休眠后会不断亮起screensaver），所以前述设置仅供参考**

最终我还是卸载了`upower-pm-utils`软件包，而采用xfce内建的`xfce4-power-manager`（依赖`sys-power/upower`软件包）。

```bash
emerge --unmerge sys-power/suspend
emerge --unmerge sys-power/upower-pm-utils
emerge --ask sys-power/upower
```

使用`suspend to RAM`方式

# 参考

* [Suspend and hibernate](https://wiki.gentoo.org/wiki/Suspend_and_hibernate)
* [Power management/Suspend and hibernate](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate)
