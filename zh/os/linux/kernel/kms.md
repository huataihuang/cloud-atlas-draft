# 什么是KMS

内核模式设置（Kernel Mode Setting, KMS）是一种在内核空间而不是用户空间设置显示分辨率和颜色深度的方式。

Linux内核在frameibuffer上实现KMS激活原生的分辨率并允许即时控制台（tty）切换。KMS还激活了新技术（例如DRI2）以减少延迟和增加3D性能，甚至内核空间节能。

> NVIDIA和catalyst驱动也在内核模式实现KMS，但是它们并不使用内建的内核实现，它们缺少一种针对高分辨率控制台的fbdev驱动。

# KMS背景

最初，设置显卡的工作是由X server完成的。由于这个原因，很难在虚拟控制台设置图形，并且每次从X切换到虚拟控制台（ctrl+Alt+F1），X Server需要将显卡控制权返回给内核，这将导致缓慢和闪烁。当控制权从控制台返回给X Server也存在相同问题。

使用Kernel Mode Setting（KMS），内核可以直接设置显卡模式。这使得X切换加快。

# 安装

注意，以下选项应该在使用KMS时候禁止：

* 任何 vga= 启动参数都会和通过KMS设置原生屏幕分辨率冲突
* 任何 video= 启动配置framebuffer都会和驱动冲突
* 任何其他 framebuffer 驱动

# KMS启动

Intel， Nouveau 和 ATI 驱动总是自动激活所以芯片的KMS，所以不需要手工安装。

私有的 NVIDIA 和 AMD Catalyst驱动不能用于开源驱动堆栈。要使用KMS，你需要用开源驱动来替代私有驱动。

为了在启动过程中容易加载KMS，需要将 radeon （ATI/AMD显卡）， i915 （Intel集成显卡）或者 nouveau（Nvidia显卡）加入到 /etc/mkinitcpio.conf 配置文件的 MODULES 行，例如

    MODULES="... i915 ..."

> 注意：Intel用户可能需要将 intel_agp 设置添加在 i915 之前，以便能够支持ACPI errors。

如果你使用定制的EDID文件（不能在内建分辨率调整），你可以将其嵌入到initramfs 。配置 /etc/mkinitcpio.conf 如下

    FILES="/usr/lib/firmware/edid/your_edid.bin"

然后重建内核映像

    mkinitcpio -p <name of your kernel preset; e.g. linux>

# 参考

* [Arch Linux - Kernel mode setting](https://wiki.archlinux.org/index.php/Kernel_mode_setting)
