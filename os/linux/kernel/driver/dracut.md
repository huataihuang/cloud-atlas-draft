CentOS7虚拟机启动后，发现负载很高

```
top - 14:06:36 up 17 min,  1 user,  load average: 0.96, 1.42, 1.13
Tasks: 126 total,   3 running, 123 sleeping,   0 stopped,   0 zombie
%Cpu0  : 42.5 us, 10.4 sy,  0.0 ni, 45.1 id,  0.3 wa,  0.0 hi,  1.6 si,  0.0 st
%Cpu1  :  0.0 us,  6.6 sy,  0.0 ni, 90.7 id,  0.0 wa,  0.0 hi,  2.7 si,  0.0 st
%Cpu2  :  2.6 us,  2.6 sy,  0.0 ni, 93.8 id,  0.0 wa,  0.0 hi,  1.0 si,  0.0 st
%Cpu3  : 50.3 us,  3.9 sy,  0.0 ni, 44.8 id,  0.0 wa,  0.0 hi,  1.0 si,  0.0 st
KiB Mem :  8012776 total,  7462748 free,   188116 used,   361912 buff/cache
KiB Swap:  1048572 total,  1048572 free,        0 used.  7554876 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
    9 root      20   0       0      0      0 R  13.7  0.0   3:34.19 rcu_sched
 7618 root      20   0   15196    228    152 R   9.0  0.0   0:00.29 sed
 7523 root      20   0  159760   2244   1524 R   3.7  0.0   0:03.07 top
 2259 root      20   0       0      0      0 S   1.9  0.0   0:08.44 kworker/1:0
 ```

检查发现有一个 `dracut-install`在工作中，消耗了资源：

```
/usr/lib/dracut/dracut-install -D /var/tmp/dracut.RHtiqP/initramfs -a mount mknod mkdir sleep chroot sed ls flock cp mv dmesg rm ln rmmod mkfifo umount readlink setsid
```

# dracut简介

`dracut`是一个事件驱动initramfs架构。dracut(工具)通过从一个已经安装的系统复制工具和文件来创建一个`initramfs`镜像并且将它和dracut框架结合，通常可以在`/usr/lib/dracut/modules.d`找到。

和显存的`initramfs`不同，`dracut`框架尝试尽可能少在initramfs中硬编码。initramfs的基本目标是使得rootfs可以挂载以便我们能够转换到真实的rootfs。这个initramfs包含了所有的驱动，然而，替代脚本硬编码完成不同的工作，dracut的initramfs基于udev来创建动态链接到设备节点，并且只在rootfs设备节点出现时创建，挂载并切换根目录。哲扬可以使得initramfs尽可能小，并且快速启动。

# 参考

* [dracut](https://dracut.wiki.kernel.org/index.php/Main_Page)