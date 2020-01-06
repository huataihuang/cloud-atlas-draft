# Ubuntu Hibernate休眠

在使用笔记本电脑模拟出集群进行集群技术的实践，由于经常需要把笔记本携带在身边，每次都需要开关电脑，实际上就会不断重启虚拟机。对于恢复工作环境非常麻烦。

Linux支持 `Suspend` (挂起到内存) 和 `Hibernate` (挂起到磁盘) ，建议使用 `Hibernate` ，这样可以把内存中数据完全存储到磁盘，就可以断开电源，也不会出现因电能不足而关机。最主要的优点是，如果你的笔记本安装了双操作系统，例如Windows+Linux或者macOS+Linux，则可以无缝在两个操作系统切换而随时恢复上次工作环境。

# 测试Ubuntu Hibernate(未成功)

* 检查内核是否支持Hibernate

   cat /sys/power/state

输出中包含 `disk` 就表明支持Hibernate

   freeze mem disk

要验证当前系统是否已经支持Hibernate，只需要执行如下命令

   sudo systemctl hibernate

如果系统能够自动保存所有当前状态，并且在按下电源键自动恢复原先的工作状态则表明已经支持了hibernate。不过，很不幸，默认的系统验证下来是直接关机了。

* 激活Hibernate使用swap

在hibernate状态（HTD或ACPI S4）主机的状态需要写入磁盘，这样就无需电力维持。这个状态是通过写入swap分区或swap文件实现的。

> 不要使用BTRFS尝试使用swap文件，这会导致文件系统损坏！！！

swap分区或swap文件需要和RAM一样大小，或者至少 2/5的内存大小，参考 [About swap partition/file size](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate#About_swap_partition.2Ffile_size) 可以看到 `/sys/power/image_size` 设置了suspend-to-disk创建映像的大小，默认这个值设置的是内存的2/5大小。

如果将数值 `0` 写入到 `/sys/power/image_size` 则系统会尽可能缩小suspend镜像。通过调整 `/sys/power/image_size` 你可以使得suspend镜像尽可能小，或者增加这个值以便hibernate处理速度更快。

> 这里建议可以设置swap分区至少 2/5 的内存大小是假设系统内存足够，这样一般情况下系统不会使用swap，所以就可以把所有swap都用于hibernate，也就是默认的 2/5 内存大小的swap应该也够用于保存内存状态。
>
> 实际我采用了 `2/5 内存 + 2G` 的swap大小，这是因为默认Ubuntu安装就设置了2G的swap文件，我再加上 2/5 的内存大小swap文件来做保障。我的笔记本是16G内存，所以，我设置了 `/swapfile` 文件 2G， `/swapfile1` 文件 7G。

上述通过 `systemctl hibernate` 失败的原因是: 没有在GRUB启动参数中指定使用swap来实现resume，这个需要传递参数 `resume=/dev/sda3` 这样的参数。

> 传递的 `resume=` 参数是指磁盘设备名，通常是磁盘swap分区。如果使用swap文件，则需要指定swap文件所在的磁盘分区，同时加上这个磁盘文件的物理偏移量（ `physical_offset` ）

- 如果使用swap文件，还需要先检查swap文件的 `physical_offset` ::

   sudo filefrag -v /swapfile1

输出显示::

   Filesystem type is: ef53
   File size of /swapfile1 is 7516192768 (1835008 blocks of 4096 bytes)
    ext:     logical_offset:        physical_offset: length:   expected: flags:
      0:        0..   32767:     952320..    985087:  32768:
      1:    32768..   65535:     985088..   1017855:  32768:
      2:    65536..   96255:    1017856..   1048575:  30720:
      3:    96256..  120831:    1112064..   1136639:  24576:    1048576:

则还需要传递内核参数 `resume_offset=952320` （即第一行的第一个 `physical_offset` )

.. note::

   使用 `swap-offset /swapfile1` 也可以检查出swap文件的 `physical_offset` （ `swap-offset` 工具包含在 `uswsusp` 软件包中 )

- 修改 `/etc/default/grub`

   GRUB_CMDLINE_LINUX="resume=/dev/sda2 resume_offset=952320"

> `GRUB_CMDLINE_LINUX=` 的参数之前不需要空一个空格，我发现这个 `GRUB_CMDLINE_LINUX=` 参数加入到 `/boot/grub/grub.cfg` 时候已经添加了一个空格。当然多加一个空格也没有关系。

> 如果要确定的swap文件所在分区，可以使用UUID，例如 `blkid /dev/sda2` 显示输出::

      /dev/sda2: UUID="decda038-1b51-4483-9491-15c3a640e133" TYPE="ext4" PARTUUID="278660a2-e48d-411f-ada4-ffd3ac9eb213"

> 则配置可以修改成:

      GRUB_CMDLINE_LINUX="resume=UUID=decda038-1b51-4483-9491-15c3a640e133 resume_offset=952320"

> 为了能耦在系统启动时候检查启动参数和查看启动信息，建议移除 `quiet` 和 `splash` 参数，并添加 `initcal_debug` 和 `no_console_suspend` 以便init系统调用能够打印到控制代，这样就可以参看是否发生错误::

      #GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
      #GRUB_CMDLINE_LINUX=""
      GRUB_CMDLINE_LINUX_DEFAULT=""
      GRUB_CMDLINE_LINUX="resume=/dev/sda2 resume_offset=952320 no_console_suspend initcall_debug"

- 然后执行以下命令更新grub::

   sudo update-grub

- 重启系统，然后测试::

   sudo systemctl hibernate

# 问题排查

参考 [Suspend Issues on Ubuntu 18.04 (and other flavours) – Troubleshooting and Fixes](https://ubuntuforums.org/showthread.php?t=2395562) 看来如果要在nouveau上实现Hibernate，需要关闭modeset，所以需要设置:

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash nouveau.modeset=0"
```

然后执行 `sudo update-grub`

# 使用Nvidia闭源显卡驱动

```
ubuntu-drivers devices
ubuntu-drivers devices
```

> 使用Nvidia闭源驱动，在使用 `s2disk` 之后再次恢复，发现Xorg的CPU占用100%，屏幕黑屏键盘无响应（不过系统没有死机，可以ssh登陆）

当使用 Nvidia 闭源显卡驱动（性能更好）则需要注意需要调整 `/etc/X11/xorg.conf` 在 `Device` 部分添加选项参数 `NvAGP` 设置为 `1`:

```
Section "Device"
    Identifier     "my id"
    Driver         "my dr"
    VendorName     "my vendor"
    BoardName      "my board name"
    Option         "NvAGP" "1"
EndSection
```

然后在内核模块屏蔽掉 `intel_agp` 模块，即编辑 `/etc/modprobe.d/blacklist.conf` 添加：

```
blacklist intel_agp
```

不过，上述方法可能是手工解决方法，有一个比较简单的解决方法我从 [Blank screen after suspend on 17.10 using NVIDIA and xfce](https://askubuntu.com/questions/1002385/blank-screen-after-suspend-on-17-10-using-nvidia-and-xfce) 看到有两种可能：

* 关闭 modeset

修改 `/etc/default/grub` 添加 `nomodeset`

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash nomodeset"
```

然后执行 `sudo update-grub`

但是我发现这个方法无效，启动以后系统依然切换了字符分辨率。所以参考 [Is nomodeset still required?](https://askubuntu.com/questions/747314/is-nomodeset-still-required) 尝试修改成 `nomodeset` 依然无效。

不过，提到了激活NVIDIA的[Direct Rendering Manager Kernel Mode](https://askubuntu.com/questions/1048274/ubuntu-18-04-stopped-working-with-nvidia-drivers/1048488#1048488)功能，所以尝试

```
GRUB_CMDLINE_LINUX_DEFAULT=""
GRUB_CMDLINE_LINUX="ipv6.disable=1 nvidia-drm.modeset=1 no_console_suspend initcall_debug"
```

不过，我测试启用DRM功能并没有解决Hibernate问题。

* 参考Debian的 [Kernel ModeSetting (short: KMS)](https://wiki.debian.org/KernelModesetting#Disabling_KMS) 原来Nvdia关闭KMS不仅需要传递内核参数，还需要屏蔽nouveau内核模块，以及创建最小化xorg.conf来指定特定显卡驱动

> 不过，关闭KMS可能不是一个好的方法

[Official driver 384.59 with GeForce 1050m doesn't work on openSUSE Tumbleweed KDE](https://devtalk.nvidia.com/default/topic/1022670/linux/official-driver-384-59-with-geforce-1050m-doesn-t-work-on-opensuse-tumbleweed-kde/post/5203910/#5203910) 提供了一个激活KMS的方法：

  * 内核参数添加： `nvidia-drm.modeset=1`
  * 执行 `sudo update-initramfs -u`  （这个指令是用于全盘加密情况下才需要使用）
  * 重启检查 `sudo cat /sys/module/nvidia_drm/parameters/modeset` 输出是Y

但是没有解决问题

* 参考 [Driver does not wake GPU properly after suspend (Ubuntu 18.10 with branch 390, 410 and 415)](https://devtalk.nvidia.com/default/topic/1044633/driver-does-not-wake-gpu-properly-after-suspend-ubuntu-18-10-with-branch-390-410-and-415-/) Ubuntu 18.10需要复杂的Nvidia参数:

```
GRUB_CMDLINE_LINUX="no_console_suspend initcall_debug ipv6.disable=1 nouveau.blacklist=1 acpi_rev_override=1 acpi_osi=Linux nouveau.modeset=0 pcie_aspm=force drm.vblankoffdelay=1 scsi_mod.use_blk_mq=1 nouveau.runpm=0 mem_sleep_default=deep"
```

不过，我测试这个参数组合并没有结局返回以后Xorg大量占用CPU的问题。目前测试下来，只是远程是正常的，Xorg依然无法在唤醒后工作。

但是我测试了，如果强制杀掉 `Xorg` 和 `budgie-wm` ，则由lightdm重新拉起Xorg是可以继续工作的。看来还是Xorg存在问题。

暂时没有解决，我改成默认进入字符界面，然后需要时再启动Xorg:

```
sudo systemctl
```

# 尝试升级驱动（无效）

* 另一种方法可能和升级切换到 Nvidia 驱动需要重新生成xorg配置有关，即简单运行:

```
nvidia-settings
```

然后保存配置到 `/etc/X11/xorg.conf` 或者 `/usr/share/X11/xorg.conf.d/` 目录下到配置。

> 这个方法实际上是调用了NVIDIA X Server Settings的图形管理界面，管理工具生成的 `xorg.conf` 配置如下:

```
# nvidia-settings: X configuration file generated by nvidia-settings
# nvidia-settings:  version 390.77  (buildd@lgw01-amd64-035)  Thu Aug  2 14:55:24 UTC 2018

Section "ServerLayout"
    Identifier     "Layout0"
    Screen      0  "Screen0" 0 0
    InputDevice    "Keyboard0" "CoreKeyboard"
    InputDevice    "Mouse0" "CorePointer"
    Option         "Xinerama" "0"
EndSection

Section "Files"
EndSection

Section "Module"
    Load           "dbe"
    Load           "extmod"
    Load           "type1"
    Load           "freetype"
    Load           "glx"
EndSection

Section "InputDevice"
    # generated from default
    Identifier     "Mouse0"
    Driver         "mouse"
    Option         "Protocol" "auto"
    Option         "Device" "/dev/psaux"
    Option         "Emulate3Buttons" "no"
    Option         "ZAxisMapping" "4 5"
EndSection

Section "InputDevice"
    # generated from default
    Identifier     "Keyboard0"
    Driver         "kbd"
EndSection

Section "Monitor"
    # HorizSync source: edid, VertRefresh source: edid
    Identifier     "Monitor0"
    VendorName     "Unknown"
    ModelName      "Apple Color LCD"
    HorizSync       111.1 - 111.1
    VertRefresh     60.0
    Option         "DPMS"
EndSection

Section "Device"
    Identifier     "Device0"
    Driver         "nvidia"
    VendorName     "NVIDIA Corporation"
    BoardName      "GeForce GT 750M"
EndSection

Section "Screen"
    Identifier     "Screen0"
    Device         "Device0"
    Monitor        "Monitor0"
    DefaultDepth    24
    Option         "Stereo" "0"
    Option         "nvidiaXineramaInfoOrder" "DFP-3"
    Option         "metamodes" "nvidia-auto-select +0+0"
    Option         "SLI" "Off"
    Option         "MultiGPU" "Off"
    Option         "BaseMosaic" "off"
    SubSection     "Display"
        Depth       24
    EndSubSection
EndSection
```

不过，我检查了现在系统采用的配置方法位于默认系统配置 `/usr/share/X11/xorg.conf.d/` 目录下，分为不同的配置文件。上述方法似乎没有必要执行。 

## 使用最新的闭源驱动

由于使用标准仓库的闭源驱动没有解决问题，所以改成最新的闭源驱动仓库

```
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt update
```

```
ubuntu-drivers devices
sudo ubuntu-drivers autoinstall
```

# 发现可能和18.10的图形稳定性有关

当我使用字符界面，然后 `startx` 进入 budgie 之后，如果选择logout，就不能返回终端界面。在系统日志中显示:

```
[四 3月  7 23:27:51 2019] show_signal_msg: 31 callbacks suppressed
[四 3月  7 23:27:51 2019] budgie-daemon[3328]: segfault at 0 ip 00007f23d03d50de sp 00007ffc0fda8b30 error 6 in libwnck-3.so.0.3.0[7f23d03cc000+24000]
[四 3月  7 23:27:51 2019] Code: 49 8b 44 24 18 48 8b 78 60 e8 7e 6f ff ff 49 8b 44 24 18 48 c7 40 60 00 00 00 00 49 8b 44 24 18 48 63 10 48 8b 05 2a c1 02 00 <48> c7 04 d0 00 00 00 00 49 8b 44 24 18 48 8b 78 70 e8 2c 7b ff ff
[四 3月  7 23:27:51 2019] budgie-polkit-d[3330]: segfault at 55adcb383008 ip 00007fdf8ddecced sp 00007ffc0effdea0 error 4 in libglib-2.0.so.0.5800.1[7fdf8ddd8000+7d000]
[四 3月  7 23:27:51 2019] Code: 14 52 48 8d 54 d0 e8 48 39 d0 0f 87 41 ff ff ff 3b 5f 08 74 19 0f 1f 84 00 00 00 00 00 48 83 c0 18 48 39 c2 0f 82 27 ff ff ff <3b> 18 75 ef 48 8b 58 08 4c 8b 60 10 48 39 c2 74 11 f3 0f 6f 02 0f
```

而尝试了Xfce4界面，虽然没有core dump，但是一旦退出也是出现无法返回终端问题。所以，从总体来看18.10的Xorg可能存在比较大问题。

# Xubuntu系统Hibernate

重新安装了完整的Xubuntu系统，按照上述方法（也整理记录在 [Ubuntu Hibernate休眠](https://github.com/huataihuang/cloud-atlas/blob/master/source/studio/ubuntu_hibernate.rst) )，使用的是 Xfce4 桌面（不过，这次直接使用Xubuntu发行版所以 Xfce4 桌面组件会比较完整）。

在使用了 `s2disk` 能够正常保存状态到磁盘，但是启动同样也出现了返回到图形界面后冻结无响应的现象（已经看到完整的桌面图形界面）。

检查了系统日志，发现系统依然去加载 `nouveau` 驱动出现报错，但是我明明已经[安装了Nvdia的闭源驱动](../install/install_nvidia_drivers_on_ubuntu_18_10)来取代 `nouveau` 驱动的:

```
3月 14 08:57:11 xcloud kernel: sd 1:0:0:0: [sda] Starting disk
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: fault 01 [WRITE] at 000000000048e000 engine 05 [BAR2] clien
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: fault 01 [WRITE] at 000000000048c000 engine 05 [BAR2] clien
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80044000 [GPPTR PBENTRY SIGNATURE] ch 3 [007f8a7000
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80004000 [GPPTR SIGNATURE] ch 3 [007f8a7000 Xorg[17
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 3 [007f8a7000 Xorg[1745]] s
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: fault 00 [READ] at 0000000000000000 engine 07 [HOST0] clien
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: channel 3: killed
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: runlist 0: scheduled for recovery
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: usb 2-4: Disable of device-initiated U1 failed.
3月 14 08:57:11 xcloud kernel: usb 2-4: Disable of device-initiated U2 failed.
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 08:57:11 xcloud kernel: ata1: SATA link up 6.0 Gbps (SStatus 133 SControl 300)
3月 14 08:57:11 xcloud kernel: ata1.00: unexpected _GTF length (8)
3月 14 08:57:11 xcloud kernel: ata1.00: unexpected _GTF length (8)
3月 14 08:57:11 xcloud kernel: ata1.00: configured for UDMA/133
3月 14 08:57:11 xcloud kernel: nouveau 0000:01:00.0: DRM: GPU lockup - switching to software fbcon
3月 14 08:57:11 xcloud kernel: usb 1-8: reset full-speed USB device number 2 using xhci_hcd
3月 14 08:57:11 xcloud kernel: usb 1-12: reset full-speed USB device number 3 using xhci_hcd
3月 14 08:57:11 xcloud kernel: usb 1-8.3: reset full-speed USB device number 6 using xhci_hcd
3月 14 08:57:11 xcloud kernel: Restarting kernel threads ...
```

参考 完全卸载掉nouveau:

```
sudo apt-get --purge remove xserver-xorg-video-nouveau
```

然后执行`sudo apt autoremove`卸载掉无需的程序包:

```
libxatracker2 libxvmc1 xserver-xorg-video-amdgpu xserver-xorg-video-ati xserver-xorg-video-fbdev
  xserver-xorg-video-intel xserver-xorg-video-qxl xserver-xorg-video-radeon xserver-xorg-video-vesa
  xserver-xorg-video-vmware
```

检查了一下系统还有一个名字和nouveau可能有关的软件包 `apt list --installed | grep nouveau`：

```
libdrm-nouveau2/cosmic,now 2.4.95-1 amd64 [installed,automatic]
```

不过根据 `apt list --installed | grep cosmic | grep drm` 搜索，似乎每个显卡驱动都会有这样一个cosmic包，这个包可能是针对nvidia显卡的，所以不动它。

重新测试了一次`s2disk`，然后按下电源按钮恢复，在出现了Xfce的淡紫色背景奔跑的耗子之后，屏幕切换到终端节点，显示了一行字符串:

```
s2disk: returned to userspace
```

此时能够通过ssh远程登陆主机，但是主机的界面停留在这行字符串，并没有返回到图形界面。

检查日志发现启动日志依然有调用 `nouveau` 的提示：

```
3月 14 09:32:19 xcloud kernel: ACPI: EC: event unblocked
3月 14 09:32:19 xcloud kernel: ACPI: button: The lid device is not compliant to SW_LID.
3月 14 09:32:19 xcloud kernel: sd 1:0:0:0: [sda] Starting disk
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: fault 01 [WRITE] at 0000000000487000 engine 05 [BAR2] clien
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 2 [007f8e3000 Xorg[1749]] s
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 2 [007f8e3000 Xorg[1749]] s
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 2 [007f8e3000 Xorg[1749]] s
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80000000 [SIGNATURE] ch 2 [007f8e3000 Xorg[1749]] s
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: resetting error on 0:b.
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: 0:b: hotplug: scanning
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: 0:b: hotplug: no switch found
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: resetting error on 0:c.
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: 0:c: hotplug: scanning
3月 14 09:32:19 xcloud kernel: thunderbolt 0000:08:00.0: 0:c: hotplug: no switch found
3月 14 09:32:19 xcloud kernel: usb 2-4: Disable of device-initiated U1 failed.
3月 14 09:32:19 xcloud kernel: usb 2-4: Disable of device-initiated U2 failed.
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: ata1: SATA link up 6.0 Gbps (SStatus 133 SControl 300)
3月 14 09:32:19 xcloud kernel: ata1.00: unexpected _GTF length (8)
3月 14 09:32:19 xcloud kernel: ata1.00: unexpected _GTF length (8)
3月 14 09:32:19 xcloud kernel: ata1.00: configured for UDMA/133
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: DRM: GPU lockup - switching to software fbcon
3月 14 09:32:19 xcloud kernel: usb 1-12: reset full-speed USB device number 3 using xhci_hcd
3月 14 09:32:19 xcloud kernel: usb 1-8: reset full-speed USB device number 2 using xhci_hcd
3月 14 09:32:19 xcloud kernel: usb 1-8.3: reset full-speed USB device number 6 using xhci_hcd
3月 14 09:32:19 xcloud kernel: input: bcm5974 as /devices/pci0000:00/0000:00:14.0/usb1/1-12/1-12:1.2/input/input15
3月 14 09:32:19 xcloud kernel: Restarting kernel threads ...
...
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: SCHED_ERROR 01 []
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: fault 00 [READ] at 0000005fa0a4b000 engine 0b [HOST4] clien
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: channel 0: killed
3月 14 09:32:19 xcloud kernel: nouveau 0000:01:00.0: fifo: runlist 4: scheduled for recovery
...
```

奇怪，难道需要在内核上完全屏蔽加载`nouveau`驱动么？

检查发现系统确实自动加载了 `nouveau` 内核驱动（即使我已经安装了`nvidia`驱动):

```
$ lsmod | grep nouveau
nouveau              1875968  3
mxm_wmi                16384  1 nouveau
wmi                    24576  2 mxm_wmi,nouveau
i2c_algo_bit           16384  1 nouveau
ttm                   106496  1 nouveau
drm_kms_helper        172032  1 nouveau
drm                   458752  6 drm_kms_helper,ttm,nouveau
video                  45056  2 apple_gmux,nouveau
```

再仔细检查了一下 `lspci -vvv` 输出，发现当前实际上使用的是 `nouvuau` 驱动，奇怪，我明明安装了nvidia:

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1) (prog-if 00 [VGA controller])
	Subsystem: Apple Inc. GK107M [GeForce GT 750M Mac Edition]
	Control: I/O+ Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0, Cache Line Size: 256 bytes
	Interrupt: pin A routed to IRQ 50
	Region 0: Memory at c0000000 (32-bit, non-prefetchable) [size=16M]
	Region 1: Memory at 80000000 (64-bit, prefetchable) [size=256M]
	Region 3: Memory at 90000000 (64-bit, prefetchable) [size=32M]
	Region 5: I/O ports at 1000 [size=128]
	Expansion ROM at c1000000 [disabled] [size=512K]
	Capabilities: <access denied>
	Kernel driver in use: nouveau
	Kernel modules: nvidiafb, nouveau
```

汗，我忘记重装了Xubuntu之后，并没有重新安装Nvidia驱动。

## 切换到字符界面

* 编辑 `/etc/default/grub`

```
#GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX_DEFAULT="text"
GRUB_CMDLINE_LINUX="ipv6.disable=1 acpi_osi=Windows"
```

> 这里的 `acpi_osi=Windows` 应该是我上次就添加的，目前看这个参数是有效的，启动以后不再包BIOS错误

然后执行 `sudo update-grub`

* 修改systemd启动级别:

```
rm /etc/systemd/system/default.target
ln -s /lib/systemd/system/runlevel3.target /etc/systemd/system/default.target
```

* 重启系统

```
sudo shutdown -r now
```

* 重新安装Nvidia驱动

```
sudo apt install ubuntu-drivers-common
ubuntu-drivers devices
sudo ubuntu-drivers autoinstall
```

安装了Nvidia驱动之后，可以检查 `/etc/modprobe.d/` 目录下配置。不过我没有发现 nouveau 加入blacklist，但是发现 nvidiafb 被加入balcklist。不过，确实没有加载nouveau内核模块:

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1) (prog-if 00 [VGA controller])
	Subsystem: Apple Inc. GK107M [GeForce GT 750M Mac Edition]
	Control: I/O+ Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 16
	Region 0: Memory at c0000000 (32-bit, non-prefetchable) [size=16M]
	Region 1: Memory at 80000000 (64-bit, prefetchable) [size=256M]
	Region 3: Memory at 90000000 (64-bit, prefetchable) [size=32M]
	Region 5: I/O ports at 1000 [size=128]
	[virtual] Expansion ROM at c1000000 [disabled] [size=512K]
	Capabilities: <access denied>
	Kernel driver in use: nvidia
	Kernel modules: nvidiafb, nouveau, nvidia_drm, nvidia
```

果然，现在可以正常从 `s2disk` 恢复过来。不过，字符界面`startx`启动X之后，虽然能够`s2disk`，但是退出X会导致黑屏，这个我怀疑是我图形界面设置问题，恢复改成默认图形界面运行级别可以规避这个问题。

## 集成到systemd（失败）

* 编辑 hibernate 服务:

   sudo systemctl edit systemd-hibernate.service

* 复制粘贴以下代码::

   [Service]
   ExecStart=
   ExecStartPre=-/bin/run-parts -v -a pre /usr/lib/systemd/system-sleep
   ExecStart=/usr/sbin/s2disk
   ExecStartPost=-/bin/run-parts -v --reverse -a post /usr/lib/systemd/system-sleep

.. note::

   配置会添加到 ``/etc/systemd/system/systemd-hibernate.service.d/override.conf``

> 这个方法实际上是 [archlinux:hibernate](https://wiki.archlinux.org/index.php/Uswsusp#With_pm-utils) 文档中提供的。

* 重新加载并测试

```
sudo systemctl daemon-reload
sudo systemctl hibernate
```

测试发现失败返回时候黑屏，检查发现实际上系统缺少 `/usr/lib/systemd/system-sleep`。参考 [systemd-suspend.service](https://www.freedesktop.org/software/systemd/man/systemd-suspend.service.html)，应该需要安装对应软件包。



# 集成到 pm-utils



# 参考

* [How can I hibernate on Ubuntu 16.04](https://askubuntu.com/questions/768136/how-can-i-hibernate-on-ubuntu-16-04) 其中最重要的一个解决方案是 "Hibernation using systemctl and getting it working in tough cases" ，在这篇问答的第2个回答中。
* [Cannot hibernate Ubuntu Budgie 17.04](https://askubuntu.com/questions/913517/cannot-hibernate-ubuntu-budgie-17-04?noredirect=1#comment1438642_913517) 这个方法有报告实践可以成功
* [Suspend Issues on Ubuntu 18.04 (and other flavours) – Troubleshooting and Fixes](https://ubuntuforums.org/showthread.php?t=2395562)
* [HOWTO hibernate in 18.04](https://ubuntuforums.org/showthread.php?t=2392205) - 提供了很多排查建议