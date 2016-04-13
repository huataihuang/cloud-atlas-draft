由于使用nVidia开源驱动`nouveau`驱动感觉显示刷新有些缓慢，但是使用[闭源nVidia驱动](nvcidia.md)又存在无法正常启动的问题，所以准备切换到Intel开源驱动。

# Apple MacBook Pro

当启动到Linux中，使用命令`lspci | grep -i VGA`会只看到nVidia GeForce显卡，看不到Intel显卡（虽然MacBook Pro实际上是双显卡的）

```bash
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1)
```

这个原因也是为何我编译内核如果不包含开源`nouveau`，只包含`intel`显卡驱动，却无法启动的原因?

参考 [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013)) 提到了如果要使用Intel显卡，需要启动到OSX操作系统，并使用`gfxCardStatus`来强制Intel显卡，然后使用`vga_switcheroo`来关闭Nvidia显卡。不过，Intel显卡不支持多显示器，所以如果不使用多显示器情况下，是建议使用Intel显卡以便解约电池使用。

# 参考

* [intel](https://wiki.gentoo.org/wiki/Intel)
* [Apple Macbook Pro Retina 15-inch (early 2013)](https://wiki.gentoo.org/wiki/Apple_Macbook_Pro_Retina_15-inch_(early_2013))