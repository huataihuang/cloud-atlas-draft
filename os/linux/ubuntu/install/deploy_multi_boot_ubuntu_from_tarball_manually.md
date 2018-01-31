# 方案概述

服务器已经安装了CentOS操作系统，由于不能满足开发需求，准备将服务器转换成Ubuntu Server 16.04 LTS。但是，远程服务器依然想保留CentOS作为测试使用，所以部署双操作系统多重启动方案。

远程服务器安装和直接可以物理接触的桌面系统不同，不方便从光盘镜像开始从头安装。所以规划如下安装方案：

* 如果原操作系统占据了整个磁盘，则通过PXE启动到无盘，然后通过resize方法缩小现有文件系统分区（具体方法和文件系统相关）
* 空出足够安装新Ubuntu操作系统的分区
* 线下通过kvm或virtualbox这样的全虚拟化安装一个精简的Ubuntu操作系统，然后通过tar打包方式完整备份整个Ubuntu操作系统
* 将备份的Ubuntu操作系统tar包上传，并解压缩到对应服务器分区
* 修订CentOS的grub2配置，加入启动Ubuntu的配置
* 重启操作系统，选择进入Ubuntu

> 以上方法避免了在服务器上重新安装Ubnntu的步骤，并且可以作为今后快速部署Ubuntu的方案。

# 实施步骤

# 准备

* 检查操作系统分区划分

```
#fdisk -l /dev/sda
WARNING: fdisk GPT support is currently new, and therefore in an experimental phase. Use at your own discretion.

Disk /dev/sda: 240.1 GB, 240057409536 bytes, 468862128 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: gpt


#         Start          End    Size  Type            Name
 1         2048         8191      3M  BIOS boot parti 
 2         8192      2105343      1G  EFI System      
 3      2105344    106962943     50G  Microsoft basic 
 4    106962944    111157247      2G  Microsoft basic 
 5    111157248    468860927  170.6G  Microsoft basic
```

```
#df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda3        50G  3.2G   44G   7% /
devtmpfs        126G     0  126G   0% /dev
tmpfs           126G  156K  126G   1% /dev/shm
tmpfs           126G  996K  126G   1% /run
tmpfs           126G     0  126G   0% /sys/fs/cgroup
/dev/sda2       976M  160M  750M  18% /boot
```

```
#cat /etc/fstab 
LABEL=/boot             /boot           ext4            defaults        1 2
LABEL=/         /               ext4            defaults        1 1
LABEL=SWAP             swap            swap            defaults        0 0
...
```

可以看到当前运行的CentOS操作系统使用了`/dev/sda3`分区，`/dev/sda4`分区是swap，而`/dev/sda5`分区虽然划分，但是实际上未被挂载使用。

所以准备删除掉`/dev/sda4`（需要`swapoff /dev/sda4`并注释掉`/etc/fstab`中`swap`配置行）和`/dev/sda5`分区，然后再独立创建`/dev/sda4`分区提供给Ubuntu操作系统使用。

# 在kvm环境安装Ubuntu系统

```
virt-install \
  --network bridge:virbr0 \
  --name ubuntu16 \
  --ram=4096 \
  --vcpus=2 \
  --disk path=/var/lib/libvirt/images/ubuntu16.img,size=20 \
  --graphics vnc \
  --cdrom=/var/lib/libvirt/images/ubuntu-16.04.3-server-amd64.iso
```

* 整个安装在一个`/dev/vda1`分区

* 使用备份方法参考[通过tar备份和恢复整个Linux操作系统](backup_and_restore_system_by_tar)

> `<backuphost>`为备份服务器的IP地址，已设置ssh密钥登陆，这样可以免密钥登陆

首先确保能够从虚拟机内部登陆到远程服务器`<backuphost>`

```
tar -cvpz --one-file-system / | ssh <backuphost> "( cat > ubuntu16_backup.tar.gz )"
```

> 使用`tar -cvpz --one-file-system`备份整个操作系统会跳过`/proc`，`/sys`等目录

# 恢复ubuntu分区

* 登陆到目标需要恢复ubuntu的服务器，首先调整空出`/dev/sda4`（如上所述）

* 恢复备份

挂载作为ubuntu恢复分区文件系统

```
mount /dev/sda4 /media
```

使用以下命令恢复

```
sudo tar -xvpzf /root/ubuntu16_backup.tar.gz -C /media --numeric-owner
```

> `-C`参数告诉`tar`命令先变更目录到`/media`再开始解压缩

* 修订恢复的ubuntu分区中的`/etc/fstab`，这里实际上是修订`/media/etc/fstab`，使其能够挂载`/dev/sda4`分区

首先使用`blkid`获取分区磁盘信息

```
blkid
```

输出类似

```
...
/dev/sda4: UUID="79140412-5137-45cc-81a5-58a8a7dac4d9" TYPE="ext4" PARTUUID="a7bfb616-ae18-46a0-9bcc-4207418af8cf" 
...
```

注意：在`/etc/fstab`中使用的是`UUID`（对比了原先的虚拟机中磁盘命名），所以修改`/media/etc/fstab`如下：

```
UUID=79140412-5137-45cc-81a5-58a8a7dac4d9 /               ext4    errors=remount-ro 0       1
```

## 恢复GRUB

> Ubuntu 16.4采用了传统的GRUB，可以直接编辑配置文件`/boot/grub/menu.lst`，比CentOS 7使用的GRUB 2要简便许多。通过在Ubuntu 16.4中添加CentOS分区中的`/boot`启动目录下内核，可以在同一个启动菜单中切换不同操作系统。

这里会提示在`/etc/default/grub`中添加参数，为了能够在串口输出控制台，参考 [SerialConsoleHowto](https://help.ubuntu.com/community/SerialConsoleHowto)

> 设置串口配置方法和Ubuntu版本有关，获取版本信息的方法是`lsb_release -a`，可以看到Ubuntu 16.4代码是`xenial`

* 增加ubuntu分区的`/etc/init/ttyS0.conf`（实际修改`/media/etc/init/ttyS0.conf`） - 针对Karmic和更新版本的方法如下

```bash
# ttyS0 - getty
#
# This service maintains a getty on ttyS0 from the point the system is
# started until it is shut down again.

start on stopped rc RUNLEVEL=[12345]
stop on runlevel [!12345]

respawn
exec /sbin/getty -L 115200 ttyS0 vt102
```

> 针对`Edgy/Feisty/Jaunty`需要设置`/etc/event.d/ttyS0`，而针对`Darpper`或更古老版本则修改`/etc/inittab`。这里忽略旧版本设置方法，详细请参考[SerialConsoleHowto](https://help.ubuntu.com/community/SerialConsoleHowto)


* 要使得系统能够启动，需要恢复grub，这里需要编辑`/etc/default/grub`（实际配置`/media/etc/default/grub`）

```
# If you change this file, run 'update-grub' afterwards to update
# /boot/grub/grub.cfg.
 
GRUB_DEFAULT=0
GRUB_TIMEOUT=1
GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
GRUB_CMDLINE_LINUX="console=tty0 console=ttyS0,115200n8"
 
# Uncomment to disable graphical terminal (grub-pc only)
GRUB_TERMINAL=serial
GRUB_SERIAL_COMMAND="serial --speed=115200 --unit=0 --word=8 --parity=no --stop=1"
 
# The resolution used on graphical terminal
# note that you can use only modes which your graphic card supports via VBE
# you can see them in real GRUB with the command `vbeinfo'
#GRUB_GFXMODE=640x480
 
# Uncomment if you don't want GRUB to pass "root=UUID=xxx" parameter to Linux
#GRUB_DISABLE_LINUX_UUID=true
```

* 通过chroot方式运行ubuntu的grub配置

```
sudo -s
for f in dev dev/pts proc ; do mount --bind /$f /media/$f ; done
chroot /media
```

* 手工修改`/boot/grub/menu.lst`设置如下

```
title           Ubuntu 16.04.3 LTS, kernel 4.10.0-28-generic
root            (hd0)
kernel          /boot/vmlinuz-4.10.0-28-generic root=UUID=b513f893-96ca-494c-8634-0ce8eb7dc135 ro console=tty0 console=ttyS0,115200n8
initrd          /boot/initrd.img-4.10.0-28-generic

title           Ubuntu 16.04.3 LTS, kernel 4.10.0-28-generic (recovery mode)
root            (hd0)
kernel          /boot/vmlinuz-4.10.0-28-generic root=UUID=b513f893-96ca-494c-8634-0ce8eb7dc135 ro  single console=tty0 console=ttyS0,115200n8
initrd          /boot/initrd.img-4.10.0-28-generic

title           CentOS (3.10.0-327.el7.x86_64) 7.2 (Paladin)
root            (hd0)
kernel          /boot/vmlinuz-3.10.0-327.el7.x86_64 root=UUID=96219e3e-c371-47a9-baaf-cc2b1b9f8b33 ro crashkernel=auto console=tty0 console=ttyS1,115200
initrd          /boot/initramfs-3.10.0-327.el7.x86_64.img
```

> 最后一项是原CentOS 7搬迁过来的GRUB配置

* 重新安装一次grub，覆盖原先CentOS的GRUB - 这里参考[RecoveringUbuntuAfterInstallingWindows](https://help.ubuntu.com/community/RecoveringUbuntuAfterInstallingWindows)

```
sudo grub-install /dev/sda
```

* 重启系统，通过Ubuntu BRUB菜单验证切换操作系统

# 异常排查

* 启动提示`error: file /boot/grub/i386-pc/normal.mod' not found.`

检查分区

```
grub rescue> ls                                                                 
(hd0) (hd0,gpt4) (hd0,gpt3) (hd0,gpt2) (hd0,gpt1) (hd1)

grub rescue> set                                                                
cmdpath=(hd0)                                                                   
prefix=(hd0,gpt4)/boot/grub                                                     
root=hd0,gpt4
```

尝试启动 - 参考 [ AndersonIncorp/fix.sh](https://gist.github.com/AndersonIncorp/3acb1d657cb5eba285f4fb31f323d1c3)

```                                                  
grub rescue> set prefix=(hd0,gpt4)/usr/lib/grub
grub rescue> insmod normal
```

但是依然报错

```
grub rescue> insmod normal                                                      
error: file `/usr/lib/grub/i386-pc/normal.mod' not found.
```

参考 [GRUB rescue problem after deleting Ubuntu partition!](https://askubuntu.com/questions/493826/grub-rescue-problem-after-deleting-ubuntu-partition) 尝试检查文件系统分区

```
grub rescue> ls (hd0,gpt1)                                                      
(hd0,gpt1): Filesystem is unknown.                                              
grub rescue> ls (hd0,gpt2)                                                      
(hd0,gpt2): Filesystem is ext2.                                                 
grub rescue> ls (hd0,gpt3)                                                      
(hd0,gpt3): Filesystem is ext2.                                                 
grub rescue> ls (hd0,gpt4)                                                      
(hd0,gpt4): Filesystem is ext2.
```

尝试启动grub

```
grub rescue> set root=(hd0,gpt4)
grub rescue> set prefix=(hd0,gpt4)/usr/lib/grub
grub rescue> insmod normal                                                      
error: file `/boot/grub/i386-pc/normal.mod' not found.
```

如果错误，则重新设置`root`和`prefix`，再次尝试上述步骤

```
grub rescue> set root=(hd0,gpt3)
grub rescue> set prefix=(hd0,gpt3)/usr/lib/grub
grub rescue> insmod normal 
```

这次成功了！！！ 这个`(hd0,gpt3)`分区是原先`CentOS`的系统分区

继续按照

```
grub rescue > normal
```

检查分区UUID（可以看到UUID确实是`CentOS`的系统分区）

```
grub> ls (hd0,gpt3)                                                             
        Partition hd0,gpt3: Filesystem type ext* - Label `/' - Last             
modification time 2018-01-29 06:43:17 Monday, UUID                              
96219e3e-c371-47a9-baaf-cc2b1b9f8b33 - Partition start at 1052672KiB - Total    
size 52428800KiB                                                                
grub>
```

设置启动内核及root分区UUID

```
linux /boot/vmlinuz-3.10.0-327.el7.x86_64 root=UUID=96219e3e-c371-47a9-baaf-cc2b1b9f8b33 ro console=tty0 console=ttyS1,115200
```

但是这里遇到问题，系统始终报告`error: file `/boot/vmlinuz-3.10.0-327.el7.x86_64' not found.`

尝试了多次，突然想起来，原先系统安装时候，独立了一个`/boot`分区，位于`/dev/sda2`而不是这里的`UUID=96219e3e-c371-47a9-baaf-cc2b1b9f8b33`对应的`/dev/sda3`。

所以重新尝试Ubuntu分区

```
set root=(hd0,gpt4)
set prefix=(hd0,gpt4)/usr/lib/grub
insmod normal
normal
```

继续加载

linux /boot/vmlinuz-4.10.0-28-generic root=UUID=b513f893-96ca-494c-8634-0ce8eb7dc13 ro 

```
kernel          /boot/vmlinuz-4.10.0-28-generic root=UUID=b513f893-96ca-494c-8634-0ce8eb7dc135 ro console=tty0 console=ttyS0,115200n8
initrd          /boot/initrd.img-4.10.0-28-generic
```

3.10.0-327.ali2014.alios7.x86_64

linux16 /vmlinuz-3.10.0-327.ali2014.alios7.x86_64 root=UUID=96219e3e-c371-47a9-baaf-cc2b1b9f8b33 ro console=tty0 console=ttyS1,115200

# 参考

* [AndersonIncorp/fix.sh](https://gist.github.com/AndersonIncorp/3acb1d657cb5eba285f4fb31f323d1c3)
* [GRUB rescue problem after deleting Ubuntu partition! [duplicate]](https://askubuntu.com/questions/493826/grub-rescue-problem-after-deleting-ubuntu-partition)