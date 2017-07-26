对于MacBook Pro笔记本，采用了混合显卡，也就是集成显卡(intel)和外接显卡（nVidia），需要使用[vga_switcheroo](http://gentoo-en.vfose.ru/wiki/Vga_switcheroo)进行管理和切换。不过，在Linux下，当前还不支持在X运行情况下切换显卡，但是可以在命令行进行切换。

# 内核配置

```bash
Linux Kernel Configuration: VGA Switcheroo
Device Drivers --->
  Graphics Support --->
    [*] Laptop Hybrid Graphics - GPU switching support
    <*> Direct Rendering Manager --->
      <*> ATI Radeon
        [*] Enable modesetting on radeon by default
      <*> Intel 8xx/9xx/G3x/G4x/HD Graphics
        [*] Enable modesetting on intel by default
    Console display driver support --->
      -*- Framebuffer Console support
        [*] Map the console to the primary display device
Kernel hacking --->
  [*] Debug Filesystem
```

> [debugfs](https://www.kernel.org/doc/Documentation/filesystems/debugfs.txt)

# Hprofile

安装了支持`GPU switching support`的内核后，就具备了切换的能力，但是，需要安装`hprofile`来完成配置切换

```bash
emerge hprofile
```

然后创建配置文件

```bash
mkdir -p /etc/hprofile/profiles/graphics
```

在上述目录下创建`/etc/hprofile/profiles/graphics/profiles`

```bash
nvidia
intel
```

# 参考

* [Hprofile](https://wiki.gentoo.org/wiki/Hprofile)