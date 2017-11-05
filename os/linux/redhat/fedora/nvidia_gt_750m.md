在MacBook Pro上安装了Fedora 26之后，我最为关心的是能否充分发挥出这台2013年底15寸高配版的Nvdia GT 750M显卡的性能，能否使用这块入门级GPU实现CUDA计算开发，甚至使用它来完成一些Deep Learning。

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1)
```

# 驱动

Nvdia对开源不是很友好，所以开源驱动无法充分发挥硬件的性能。

* 检查nVidia卡的支持

```bash
lspci | grep -E "VGA|3D"
```

显示内容如下

```
01:00.0 VGA compatible controller: NVIDIA Corporation GK107M [GeForce GT 750M Mac Edition] (rev a1)
```

如果主机支持[NVIDIA Optimus技术](http://www.nvidia.com/object/optimus_technology.html)，有可能可以在BIOS中关闭Intel Graphics/NVDIA Optimus(一种切换显卡降低能耗技术，用于笔记本电脑)，则指南中内容可能不能工作。可参考[Tumbleweed开源项目](https://bumblebee-project.org/)

# 下载安装包

从 http://www.nvidia.com/Download/Find.aspx?lang=en-us 找到最新安装包：

* Fedora 26 [384.90 (September 21, 2017)](http://us.download.nvidia.com/XFree86/Linux-x86_64/384.90/NVIDIA-Linux-x86_64-384.90.run)

* 设置nVidia安装程序可执行

```
chmod +x /path/to/NVIDIA-Linux-*.run
```

* 切换到root身份

```
su -
```

* 确保系统软件更新到最新内核

```
## Fedora 26/25/24/23/22 ##
dnf update

## Fedora 21 ##
yum update
```

> 如果升级了内核务必重启系统使之生效

* 安装需要的依赖包

```
## Fedora 26/25/24/23/22 ##
dnf install kernel-devel kernel-headers gcc dkms acpid libglvnd-glx libglvnd-opengl libglvnd-devel pkgconfig

## Fedora 21 ##
yum install kernel-devel kernel-headers gcc dkms acpid
```

* 禁用nouveau驱动 - 编辑或创建 `/etc/modprobe.d/blacklist.conf` 添加 `blacklist nouveau`

```bash
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf
```

* 编辑 `/etc/sysconfig/grub` 在 `GRUB_CMDLINE_LINUX="…"` 行末尾添加 `d.driver.blacklist=nouveau`

```bash
## Example row ##
GRUB_CMDLINE_LINUX="rd.lvm.lv=fedora/swap rd.lvm.lv=fedora/root rhgb quiet rd.driver.blacklist=nouveau"
```

* 更新grub2.conf

```bash
## BIOS ##
grub2-mkconfig -o /boot/grub2/grub.cfg

## UEFI ##
grub2-mkconfig -o /boot/efi/EFI/fedora/grub.cfg
```

* 删除 `xorg-x11-drv-nouveua`

```bash
## Fedora 26/25/24/23/22 ##
dnf remove xorg-x11-drv-nouveau

## Fedora 21 ##
yum remove xorg-x11-drv-nouveau
```

* 如果在`/etc/dnf/dnf.conf` 配置中有如下行，则删除它

```
exclude=xorg-x11*
```

* 生成initramfs

```
## Backup old initramfs nouveau image ##
mv /boot/initramfs-$(uname -r).img /boot/initramfs-$(uname -r)-nouveau.img
 
## Create new initramfs image ##
dracut /boot/initramfs-$(uname -r).img $(uname -r)
```

* 重启进入运行级别3

> 注意：从这里开始需要运行在级别3,即字符界面，所以后面部分没有图形桌面，文档建议打印或在其他设备查看

```
systemctl set-default multi-user.target

reboot
```

* 以root身份登陆：

```
su -
## OR ##
sudo -i
```

* 运行nVidia二进制软件包

```
./NVIDIA-Linux-*.run

## OR full path / full file name ##

./NVIDIA-Linux-x86_64-375.66.run

/path/to/NVIDIA-Linux-x86_64-381.22.run

/path/to/NVIDIA-Linux-x86_64-340.102-patched.run

/home/<username>/Downdloads/NVIDIA-Linux-x86_64-304.135-patched.run
```

* 按照提示安装完成

* 重启回运行级别5（图形界面）

```bash
systemctl set-default graphical.target

reboot
```

* VDPAU/VAAPI支持 - 激活视频加速（需要Geforce 8或更高版本，这个显卡芯片是2005年的老产品）

```
## Fedora 26/25/24/23/22 ##
dnf install vdpauinfo libva-vdpau-driver libva-utils

## Fedora 21 ##
yum install vdpauinfo libva-vdpau-driver libva-utils
```

* 如果安装成功，则可以输出如下命令

```
nvidia-installer -v |grep version

uname -a

lspci |grep -E "VGA|3D"
```

> 注意：如果安装过nVidia驱动，需要升级驱动，驱动安装程序会要求切换到终端界面才可进行，可以采用前述`systemctl set-default multi-user.target`切换到字符见面，完成升级后再systemctl set-default graphical.target`。也可以参考[启动进入终端模式](../system_administration/grub2/boot_in_terminal_mode)在启动时临时进入终端模式。

## 内核启动后如果加载nVidia驱动失败

如果新内核启动后加载nVida驱动失败，可以先启动到终端模式，然后使用以下命令针对当前内核重新编译安装驱动

```
sudo sh ./<DRIVER>.run -k
```

安装完成后重启系统就可以正确针对当前内核加载nVidia驱动。

# DKMS和nVidia驱动随内核更新

每次升级内核都要手工重新编译安装nVidia驱动是非常繁琐的，解决方法是nVidia > 304版本后，可以将驱动模块注册到DKMS，这样DKMS就会管理和在每次安装新内核时候编译nVidia驱动。

* 安装DKMS（也可能系统已经安装）

```
sudo dnf install dkms
```

* 重新以DKMS宣咸安装nVidia驱动

```
sudo sh ./<DRIVER>.run --dkms
```

此后就不再需要手工安装驱动了，每次升级内核都会自动编译并安装对应内核的驱动。

检查DKMS是否正常：

```
dkms status
```

输出类似

```
nvidia, 384.98, 4.13.10-200.fc26.x86_64, x86_64: installed
nvidia, 384.98, 4.13.9-200.fc26.x86_64, x86_64: installed
```

> 其他nVidia驱动安装工具的参数可以通过 `sh ./<DRIVER>.run --advanced-options`检查。

# 参考

* [Fedora 26/25/24 nVidia Drivers Install Guide](https://www.if-not-true-then-false.com/2015/fedora-nvidia-guide/)
* [nVidia driver reset after each kernel update](https://askubuntu.com/questions/492217/nvidia-driver-reset-after-each-kernel-update)