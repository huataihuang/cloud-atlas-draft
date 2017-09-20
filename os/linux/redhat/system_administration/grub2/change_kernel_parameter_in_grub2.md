在[在grub2中切换默认启动内核](os/linux/redhat/system_administration/grub2/switch_default_kernel_in_grub2)中介绍了如何切换启动内核的方法，但是升级操作系统内核会继承原先旧内核的参数，如果需要修改内核参数该如何操作。

在RedHat中，内核参数配置在 `/etc/default/grub` ，其中有一行

```
GRUB_CMDLINE_LINUX="XXXX"
```

就是传递给内核的参数

# 修改启动参数

* 修改`/etc/default/grub`的`GRUB_CMDLINE_LINUX`行：

如果要显示完整启动信息，则删除`rhgb quiet`，如果要查看标准的启动信息，则删除`rhgb`

* 执行一下命令使修改生效

```
grub2-mkconfig -o /boot/grub2/grub.cfg
```

# 参考

* [Set default kernel in GRUB](https://unix.stackexchange.com/questions/198003/set-default-kernel-in-grub)
* [Setting Up grub2 on CentOS 7](https://wiki.centos.org/HowTos/Grub2)