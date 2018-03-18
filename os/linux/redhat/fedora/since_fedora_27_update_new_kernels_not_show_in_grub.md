> **`警告`**
>
> 本人实践中遇到问题，导致Mac / Fedora双启动无进入Fedora Linux系统。由于时间精力不足，暂时采用macOS工作，这个问题以后有时间或机会再排查。
>
> **请勿直接采用本文方法，仅供参考**

[使用dnf对Fedora进行系统大版本升级](os/linux/redhat/fedora/fedora_system-upgrade_by_dnf.md)后，操作系统从Fedora 26升级到了Fedora 27，但是发现每次内核安装新版本之后都不更新grub，导致内核版本始终停留在原先Fedora 26所使用的内核。

解决的方法是重新安装`grub2-tools`，然后再次运行`grub2-mkconfig -o /boot/grub2/grub.cfg`:

* 首先删除`grub2-tools-minimal`

```
dnf remove grub2-tools-minimal
```

上述操作会删除掉相关软件包`grub2-pc`以及`grubby`，以及没有使用的依赖`grub2-tools`。

* 然后重新安装`grub2-efi`(参考[Fedora wiki: GRUB 2](https://fedoraproject.org/wiki/GRUB_2))

```
dnf install grub2-efi shim
```

> 安装`grub2-efi`会依赖安装`grub2-tools`，也就获得了`grub2-mkconfig`

* 注意：对于UEFI系统的GRUB2，一定要确保有一个使用GPT label的EFI系统分区，UEFI firmware会从这个EFI系统分区启动。在`gdisk`中，类似如下分区：

```
Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048          264191   128.0 MiB   EF00  EFI System
```

* 如果需要修复`grub`则执行重新安装grub（如果无需修复，则跳过这步；我在Mac系统上双启动采用是Mac的bootloader，所以忽略这步）

```
grub2-install /dev/sda
```

* 重新生成`grub`配置文件

对于普通的BIOS，使用如下命令

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

对于UEFI的系统，使用如下命令

```
grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
```

`grub2-mkconfig`会扫描`/boot`目录查看内核并生成对应配置项。

* 注意检查生成的配置文件`/boot/efi/EFI/fedora/grub.cfg`，看是否创建了对应的启动项。如果缺少启动项，则需要手工修改。

幸运的是`shim`会自动完成bootstrap。EFI程序`/boot/efi/EFI/BOOT/fallback.efi`将查看在ESP中的`BOOT.CSV`并加入相应的启动项。如果这个对象不存在，`shim`提供`BOOT.CSV`文件来为`grub2-efi`添加内容。所以只需要使用EFI脚本来调用`fallback.efi`。

如果有错误的启动项，则需要修改`BOOT.CSV`删除它

* 要将其他操作系统加入到GRUB2菜单中，请参考 http://www.gnu.org/software/grub/manual/grub.html#Multi_002dboot-manual-config

# 参考

* [Since Fedora 27 update new kernels not showing in grub](https://ask.fedoraproject.org/en/question/115999/since-fedora-27-update-new-kernels-not-showing-in-grub/)