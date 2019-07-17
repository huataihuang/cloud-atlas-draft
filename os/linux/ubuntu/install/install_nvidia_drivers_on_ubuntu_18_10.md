在MacBook Pro 2015笔记本使用的是Nvidia GeForce GT 750M显卡，默认Ubuntu 18.10安装的显卡驱动是开源的 `nouveau`。

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

虽然`nouveau`开源驱动使用上没有太大问题，但是我发现系统日志会大量滚动输出:

```
3月 06 23:45:28 xcloud kernel: nouveau 0000:01:00.0: fifo: PBDMA0: 80006000 [GPFIFO GPPTR SIGNATURE] ch 3 [007f849000
3月 06 23:45:28 xcloud systemd-journald[563]: Missed 8 kernel messages
```

并且在使用挂起到磁盘的Hibernate功能时，图形界面会冻结无响应。

> 从 [The NVIDIA vs. Open-Source Nouveau Linux Driver Benchmarks For Summer 2018](https://www.phoronix.com/scan.php?page=article&item=nouveau-summer-2018&num=4) 来看，Nvdia的官方闭源驱动性能要远好于开源的nouveau。此外， [Mesa vs Nouveau vs Nvidia Proprietary](https://www.linuxquestions.org/questions/debian-26/mesa-vs-nouveau-vs-nvidia-proprietary-4175609592/) 讨论中可以看到，nouveau的性能不佳，而要使用OpenGL之类的显卡加速只能采用Nvidia官方闭源驱动。

# 自动从标准Ubuntu软件仓库安装

* 检查硬件驱动

最简单且常用的安装驱动方法是检查硬件型号并安装建议驱动，在Ubuntu中只需要执行:

```
ubuntu-drivers devices
```

此时会显示输出可用的驱动（闭源和开源），并提供了建议:

```
== /sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0 ==
modalias : pci:v000010DEd00000FE9sv0000106Bsd00000130bc03sc00i00
vendor   : NVIDIA Corporation
model    : GK107M [GeForce GT 750M Mac Edition]
driver   : nvidia-driver-390 - distro non-free recommended
driver   : nvidia-340 - distro non-free
driver   : xserver-xorg-video-nouveau - distro free builtin

== /sys/devices/pci0000:00/0000:00:1c.2/0000:03:00.0 ==
modalias : pci:v000014E4d000043A0sv0000106Bsd00000134bc02sc80i00
vendor   : Broadcom Limited
model    : BCM4360 802.11ac Wireless Network Adapter
driver   : bcmwl-kernel-source - distro non-free
```

## 安装最新的驱动

* 采用 `graphics-drivers` PPA仓库，提供了beta版本的显卡驱动（nvidia-driver-418）:

> 这个软件仓库也是由ubuntu维护，但是提供了最新的Nvidia驱动

```
sudo add-apt-repository ppa:graphics-drivers/ppa
ubuntu-drivers devices
```

* 自动安装

`ubuntu-drivers`命令也提供了安装所有建议驱动的方法：

```
sudo ubuntu-drivers autoinstall
```

> 不过，目前测试升级到418版本nvidia驱动，依然没有实现 `vbetool dpms off` ，需要再探索。

安装完成后，再次检查 `lspci -vvv` 可以看到驱动替换成闭源驱动

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1) (prog-if 00 [VGA controller])
	Subsystem: Apple Inc. GK107M [GeForce GT 750M Mac Edition]
	Control: I/O+ Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0
	Interrupt: pin A routed to IRQ 52
	Region 0: Memory at c0000000 (32-bit, non-prefetchable) [size=16M]
	Region 1: Memory at 80000000 (64-bit, prefetchable) [size=256M]
	Region 3: Memory at 90000000 (64-bit, prefetchable) [size=32M]
	Region 5: I/O ports at 1000 [size=128]
	[virtual] Expansion ROM at c1000000 [disabled] [size=512K]
	Capabilities: <access denied>
	Kernel driver in use: nvidia
	Kernel modules: nvidiafb, nouveau, nvidia_drm, nvidia

03:00.0 Network controller: Broadcom Inc. and subsidiaries BCM4360 802.11ac Wireless Network Adapter (rev 03)
	Subsystem: Apple Inc. BCM4360 802.11ac Wireless Network Adapter
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort+ <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0, Cache Line Size: 256 bytes
	Interrupt: pin A routed to IRQ 18
	Region 0: Memory at c1a00000 (64-bit, non-prefetchable) [size=32K]
	Region 2: Memory at c1800000 (64-bit, non-prefetchable) [size=2M]
	Capabilities: <access denied>
	Kernel driver in use: wl
	Kernel modules: bcma, wl
```

# Hibernate

在安装了Nvidia的驱动之后，尝试使用Hibernate，发现 `s2disk` 之后，再次按下电源按钮resume系统，在启动恢复磁盘镜像之后，操作系统确实不死机了（因为可以通过ssh远程登陆），但是屏幕黑屏，从远程ssh登陆检查 `top` 可以看到 Xorg出现异常的100%消耗CPU：

```
top - 10:12:11 up 18 min,  3 users,  load average: 0.97, 0.57, 0.26
Tasks: 359 total,   2 running, 357 sleeping,   0 stopped,   0 zombie
%Cpu(s): 12.5 us,  0.0 sy,  0.0 ni, 87.4 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  15948.8 total,  14183.9 free,    976.7 used,    788.2 buff/cache
MiB Swap:   9216.0 total,   9216.0 free,      0.0 used.  14640.8 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1919 root      20   0  906564 223816  78632 R 100.0   1.4   3:18.98 Xorg
 4326 huatai    20   0   34500   4276   3396 R   0.3   0.0   0:00.28 top
    1 root      20   0  195088   9268   6660 S   0.0   0.1   0:02.72 systemd
```

另外，发现黑屏时候，键盘无响应，所以推测是Xorg相关的键盘输入设备驱动存在问题。

从 `/var/log/Xorg.0.log` 日志来看也许和modset有关

```
[    39.491] (WW) Falling back to old probe method for modesetting
[    39.491] (WW) Falling back to old probe method for fbdev
```

* 尝试关闭modeset

编辑 /etc/default/grub 添加

```
GRUB_CMDLINE_LINUX="nomodeset"
```

然后执行

```
sudo update-grub
```

不过这个方法没有生效

> Nvidia驱动还支持NVIDIA SLI FrameRendering和NVDIS Multi-GPU FrameRendering（在一块网卡上集成多个GPU核心）

另外可以尝试一下 `nvidia-settings`

## 排查Hibernate

目前没有解决NVIDIA的图形界面Hibernate，所以改为默认切换到字符界面，当需要Hibernate时候，通过 `s2disk` 来实现。

如果需要图形界面，则手工启动 startx

```
sudo systemctl set-default multi-user.target

echo "export XDG_CURRENT_DESKTOP=Budgie:GNOME" > ~/.xinitrc
echo "exec budgie-desktop" >> ~/.xinitrc
```

不过，存在的问题是启动X图形界面之后，如果使用 ``s2disk`` 再恢复以后Xorg会一直100%无法恢复。只有字符界面能够实现Hibernate。这个问题可能和Ubuntu 18.10的Xorg有关，我改为采用Ubuntu 18.4来避免这个问题。

### 排查过程启用字符界面的方法

- 修改 `/etc/default/grub` 设置启动时显示终端内容

```
#GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
#GRUB_CMDLINE_LINUX=""
GRUB_CMDLINE_LINUX_DEFAULT=""
GRUB_CMDLINE_LINUX="no_console_suspend initcall_debug"
```

- 执行更新grub::

```
update-grub
```

由于图形界面冻结，所以怀疑和显卡驱动或Xorg相关。虽然 [nouveau FAQ](https://nouveau.freedesktop.org/wiki/FAQ/#index18h3) 提到Suspend to RAM可以工作，suspend to disk应该也能够工作。 

[这个问答](https://superuser.com/questions/205632/with-nouveau-driver-resume-from-hibernate-or-suspend-results-in-wrong-color-dis?rq=1) 提到nouveau驱动需要卸载掉nvidia blob并且在启动时nouveau驱动没有取得控制钱不要进行modeset。

参考 [Suspend-resume problems on Ubuntu 18.04](https://www.dell.com/community/Inspiron/Suspend-resume-problems-on-Ubuntu-18-04/td-p/6072410) 可以采用如下方法关闭nouveau的modeset

```
GRUB_CMDLINE_LINUX="no_console_suspend initcall_debug nouveau.modeset=0"
```

从 [The NVIDIA vs. Open-Source Nouveau Linux Driver Benchmarks For Summer 2018](https://www.phoronix.com/scan.php?page=article&item=nouveau-summer-2018&num=4) 来看，Nvdia的官方闭源驱动性能要远好于开源的nouveau。

此外， [Mesa vs Nouveau vs Nvidia Proprietary](https://www.linuxquestions.org/questions/debian-26/mesa-vs-nouveau-vs-nvidia-proprietary-4175609592/) 讨论中可以看到，nouveau的性能不佳，而要使用OpenGL之类的显卡加速只能采用Nvidia官方闭源驱动。

安装Nvida官方闭源驱动（会自动build相关nvdia模块并屏蔽掉nouveau）:

```
#列出建议驱动
ubuntu-drivers devices
#自动安装所有建议驱动
sudo ubuntu-drivers autoinstall
```

安装后重启系统。

此时Hibernate依然会导致Xorg负载100%和黑屏，重新生成Xorg配置::

```
nvidia-settings
```

并且关闭内核的modeset功能，即内核参数传递 `nomodeset`。不过，实际我没有解决，还是回退Ubuntu 18.4。

# NVIDIA Optimus

[NVIDIA Optimus](https://wiki.archlinux.org/index.php/NVIDIA_Optimus#Using_nvidia-xrun) 是一种允许Intel集成GPU和独立的NVIDIA GPU切换的技术。

不过，默认没有开启切换显卡的功能，所以以下命令

```
lspci | egrep 'VGA|3D'
```

只显示

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1)
```

# 参考

* [How to install the NVIDIA drivers on Ubuntu 18.10 Cosmic Cuttlefish Linux](https://linuxconfig.org/how-to-install-the-nvidia-drivers-on-ubuntu-18-10-cosmic-cuttlefish-linux)
* [BinaryDriverHowto/Nvidia](https://help.ubuntu.com/community/BinaryDriverHowto/Nvidia)