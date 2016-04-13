由于使用nVidia开源驱动`nouveau`驱动感觉显示刷新有些缓慢，但是使用[闭源nVidia驱动](nvcidia.md)又存在无法正常启动的问题，所以准备切换到Intel开源驱动。

[MacBookPro11,x](https://wiki.archlinux.org/index.php/MacBookPro11,x) 提到了建议安装Microcode(`intel-ucode`)，特别是使用Nvidia驱动，建议参考[Microcode](https://wiki.archlinux.org/index.php/Microcode)

# 背景知识

* [Intel GMA](https://en.wikipedia.org/wiki/Intel_GMA)和[Intel HD and Iris Graphics](https://en.wikipedia.org/wiki/Intel_HD_and_Iris_Graphics)

Intel Graphics Media Accelerator, GMA ，是 Intel 2004年开始引入到集成显示处理器中的技术，代替了早期的Intel Extreme Graphics系列技术。在2010年，Intel通过和CPU一样的制程技术发布了Intel HD Graphics，并在2013年的Haswell处理器引入了Intel Iris Graphics和Intel Iris Pro Graphics作为HD Graphics的高端版本。

* [在MacBook Pro上实现Linux GPU切换](http://www.phoronix.com/scan.php?page=news_item&px=Linux-MacBook-GPU-Switching)

参考[混合显卡切换](os/linux/gentoo/vga_switcheroo)

# Apple MacBook Pro

当启动到Linux中，使用命令`lspci | grep -i VGA`会只看到nVidia GeForce显卡，看不到Intel显卡（虽然MacBook Pro实际上是双显卡的）

```bash
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1)
```

这个原因也是为何我编译内核如果不包含开源`nouveau`，只包含`intel`显卡驱动，却无法启动的原因? 参考[Linux GPU Switching For Apple's MacBook Pro, Revised](http://www.phoronix.com/scan.php?page=news_item&px=Linux-MacBook-GPU-Switching)"在MBPs，面板不是直接连接到gpu中的某个，而是连接到gmux芯片（也就是`vga_switcheroo`通讯的处理器）。初始状态下，gmux是切换到独立的gpu的（也就是nVidia显卡）。这样在启动时集成的i915 gpu就不能检测到LVDS（或eDP）连接器并且如果切换到集成的gpu会导致黑屏。解决的方法是在读取EDID的时候临时切换DDC连线到集成的gpu，也就是gmux所做的操作。没有这个支持"

参考 [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013)) 提到了如果要使用Intel显卡，需要启动到OSX操作系统，并使用`gfxCardStatus`来强制Intel显卡，然后使用`vga_switcheroo`来关闭Nvidia显卡。不过，Intel显卡不支持多显示器，所以如果不使用多显示器情况下，是建议使用Intel显卡以便解约电池使用。

# 参考

* [intel](https://wiki.gentoo.org/wiki/Intel)
* [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013))
* [MacBookPro11,x](https://wiki.archlinux.org/index.php/MacBookPro11,x)