安装完Jetson Nano操作系统，首次执行更新出现以下报错:

```bash
Processing triggers for initramfs-tools (0.130ubuntu3.11) ...
update-initramfs: Generating /boot/initrd.img-4.9.201-tegra
Warning: couldn't identify filesystem type for fsck hook, ignoring.
I: The initramfs will attempt to resume from /dev/zram3
I: (UUID=cfbff822-57a3-4537-ad2d-e8079068994b)
I: Set the RESUME variable to override this.
/sbin/ldconfig.real: Warning: ignoring configuration file that cannot be opened: /etc/ld.so.conf.d/aarch64-linux-gnu_EGL.conf: No such file or directory
/sbin/ldconfig.real: Warning: ignoring configuration file that cannot be opened: /etc/ld.so.conf.d/aarch64-linux-gnu_GL.conf: No such file or directory
Processing triggers for ca-certificates (20210119~18.04.1) ...
Updating certificates in /etc/ssl/certs...
0 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...
done.
Processing triggers for nvidia-l4t-kernel (4.9.201-tegra-32.5.1-20210219084526) ...
Errors were encountered while processing:
 vpi1-demos
E: Sub-process /usr/bin/dpkg returned an error code (1)
```

再次执行依然报错

```bash
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
1 not fully installed or removed.
After this operation, 0 B of additional disk space will be used.
Do you want to continue? [Y/n]
Setting up vpi1-demos (1.0.15) ...
ln: failed to create symbolic link '/usr/local/share:/usr/share:/var/lib/snapd/desktop/applications/vpi1_demos': No such file or directory
dpkg: error processing package vpi1-demos (--configure):
 installed vpi1-demos package post-installation script subprocess returned error exit status 1
Errors were encountered while processing:
 vpi1-demos
E: Sub-process /usr/bin/dpkg returned an error code (1)
```

原因应该是我清理了桌面上的Nvidia的demo程序，看起来这个软件包影响不大，所以我采用卸载方式去除

```
apt remove vpi1-demos
```

另外，我也移除了 `nvidia-l4t-graphics-demos` 释放一些空间。