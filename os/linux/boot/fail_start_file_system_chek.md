从我厂自制的OS 7u2升级转换到CentOS 7u2操作系统，总是发生内核一旦升级，就无法正常启动。这个问题困扰了我很久，往往退而求其次，避开升级内核。但是，伪处女座，不能忍啊！

从带外检查启动输出显示

```
         Starting udev Kernel Device Manager...
[  OK  ] Started udev Kernel Device Manager.
         Starting udev Coldplug all Devices...
         Mounting Configuration File System...
[  OK  ] Mounted Configuration File System.
[  OK  ] Started udev Coldplug all Devices.
[  OK  ] Reached target System Initialization.
[    5.378473] megasas:IOC Init cmd success
         Starting drac[  OK  ] Started Show Plymouth Boot Screen.
[  OK  ] Reached target Paths.
[  OK  ] Reached target Basic System.
[    5.425533] megasas: INIT adapter done
[  OK  ] Found device P[    5.843292] systemd-fsck[522]: Failed to detect devic/
ERC_H710P /.
 [    5.852940] systemd[1]: Failed to start File System Check on /dev/disk/by-l.
        Starting[    5.862951] systemd[1]: Dependency failed for /sysroot.
 File System Che[    5.870309] systemd[1]: Dependency failed for Initrd Root Fi.
ck on /dev/disk/[    5.879141] systemd[1]: Dependency failed for Reload Configu.
by-label/\x2f...
[FAILED] Failed to start File System Check on /dev/disk/by-label/\x2f.
See 'systemctl status sys
Generating "/run/initramfs/rdsosreport.txt"


Entering emergency mode. Exit the shell to continue.
Type "journalctl" to view system logs.
You might want to save "/run/initramfs/rdsosreport.txt" to a USB stick or /boot
after mounting them and attach it to a bug report.
```

报错显示和磁盘的label有关，也就是升级以后，设备文件无法找到原先按照`label`标记的磁盘设备。我遇到过以往升级后，磁盘设备完全是被为UUID的情况，所以推测有可能类似情况又发生了。

* 切换到磁盘操作系统

```
mkdir /mnt
mount /dev/sda2 /mnt
mount /dev/sda1 /mnt/boot
mount -t proc proc /mnt/proc
mount --rbind /sys /mnt/sys
mount --make-rslave /mnt/sys
mount --rbind /dev /mnt/dev
mount --make-rslave /mnt/dev
chroot /mnt /bin/bash
source /etc/profile
```

* 检查系统设备

```
cd /dev/disk/by-label
ls -lh
```

显示输出

```
total 0
lrwxrwxrwx 1 root 0 10 Jul 16 10:52 SWAP -> ../../sda3
lrwxrwxrwx 1 root 0 10 Jul 16 10:52 \x2f -> ../../sda2
lrwxrwxrwx 1 root 0 10 Jul 16 10:52 \x2fboot -> ../../sda1
```

看来是设备文件`by-label`识别的时候原先的`/`符号被识别成了`\x2f` - 通过挂载`/dev/sda2`(挂载命令 `mkdir /mnt;mount /dev/sda2 /mnt`)检查这个磁盘设备下的文件 `etc/fstab` 可以看到，原先设置是

```
LABEL=/boot		/boot		ext4		defaults	1 2
LABEL=/		/		ext4		defaults	1 1
LABEL=SWAP		swap		swap		defaults	0 0
```

凡是带`/`开头的符号都被识别成了`\x2f`，所以需要修改磁盘挂载。

可以采用以下方法之一：
* 使用旧版本内核启动，然后从新对磁盘分区进行`label`，去除掉不兼容的`/`符号。然后再重启到新内核
* 直接修改`etc/fstab`，将`LABEL=`识别磁盘的方式更改为使用UUID识别方式

# `label`标记分区

参考 [Label a Linux Partition](http://www.cyberciti.biz/faq/linux-partition-howto-set-labels/) 使用 `e2label` 命令

* 显示分区标记

```
cd /sbin
./e2label /dev/sda1
```

输出显示

```
/boot
```

* 修改分区标记

```
./e2label /dev/sda1 BOOT
```

同样再修改 `/dev/sda2`

```
./e2label /dev/sda2 ROOT
```

* 修改`etc/fstab`配置如下

```
LABEL=BOOT		/boot		ext4		defaults	1 2
LABEL=ROOT		/		ext4		defaults	1 1
LABEL=SWAP		swap		swap		defaults	0 0
```

但是很奇怪，重启依然没有找到`by-label`设备。

汗，忘记修改 grub 启动中的配置了！原先的配置中还遗留着对`/dev/disk/by-label/\x2f`的引用！

编辑 `/mnt/boot/grub2/grub.cfg` 可以看到，这个文件不是直接编辑的，是通过编辑模板`/etc/grub.d`目录下模板和 `/etc/default/grub`后，然后通过`grub2-mkconfig`生成的。在斌即过`/etc/fstab`之后（更换`label`或者从`label`转换到`uuid`或相反），需要执行一次`grub2-mkconfig`来生成新的配置文件。

> 检查 `/boot/grub2/grub.cfg` 可以看到如下配置显示是采用`root=LABEL=/`

```
#grep "root=LABEL" grub.cfg
	linux16 /vmlinuz-0-rescue-0b784259b076423083282fb71ecc7fa9 root=LABEL=/ ro crashkernel=auto vconsole.font=latarcyrheb-sun16 vconsole.keymap=us biosdevname=0 ipv6.disable=1 console=tty0 console=ttyS0,115200 scsi_mod.scan=sync LANG=en_US.UTF-8
	linux16 /vmlinuz-3.10.0-327.22.2.el7.x86_64 root=LABEL=/ ro crashkernel=auto vconsole.font=latarcyrheb-sun16 vconsole.keymap=us biosdevname=0 ipv6.disable=1 console=tty0 console=ttyS0,115200 scsi_mod.scan=sync LANG=en_US.UTF-8
```

上述两行就是新安装内核自动添加按照磁盘`LABEL=/`来挂载启动盘。虽然后面订正了`/etc/fstab`，但是`grub.cfg`没有订正。

```
cp grub.cfg grub.cfg.bak
grub2-mkconfig
```

不过，再次启动，依然存在问题，显示

```
[    5.468314] megasas: INIT adapter done
[ TIME    94.982368] systemd[1]: Timed out waiting for device dev-disk-by\x2dlabel-\x5cx2f.device.
0m] Timed out wa[   94.982696] systemd[1]: Dependency failed for /sysroot.
iting for device dev-disk-by\x2d[   95.000182] systemd[1]: Dependency failed for Initrd Root File System.
label-\x5cx2f.de[   95.010574] systemd[1]: Dependency failed for Reload Configuration from the Real Root.
vice.
[[   95.020962] systemd[1]: Dependency failed for File System Check on /dev/disk/by-label/\x2f.
DEPEND] Dependency failed foWarning: /dev/disk/by-label/x2f does not exist

Generating "/run/initramfs/rdsosreport.txt"


Entering emergency mode. Exit the shell to continue.
Type "journalctl" to view system logs.
You might want to save "/run/initramfs/rdsosreport.txt" to a USB stick or /boot
after mounting them and attach it to a bug report.
...

[  128.769627] dracut-initqueue[466]: Warning: dracut-initqueue timeout - starting timeout scripts
[  129.292098] dracut-initqueue[466]: Warning: dracut-initqueue timeout - starting timeout scripts
...
[  189.812708] dracut-initqueue[466]: Warning: Could not boot.
[  189.815089] dracut-initqueue[466]: Warning: /dev/disk/by-label/x2f does not exist
[  189.826322] dracut-initqueue[466]: Failed to start dracut-emergency.service: Transaction is destructive.
[  189.829207] dracut-initqueue[466]: Warning: Not all disks have been found.
[  189.829534] dracut-initqueue[466]: Warning: You might want to regenerate your initramfs.
```

**这步不需要**：按照提示我尝试创建`initramfs`文件来修正磁盘启动 - 对于RHEL/CentOS 6/7 ，需要使用 `dracut` 工具(不过这个步骤看来无效，应该还是需要手工订正`/boot/grub2/grub.cfg`)

```
cd /boot
cp initramfs-3.10.0-327.22.2.el7.x86_64.img initramfs-3.10.0-327.22.2.el7.x86_64.img.bak
dracut -f /boot/initramfs-3.10.0-327.22.2.el7.x86_64.img 3.10.0-327.22.2.el7.x86_64
```

> 如果是ubuntu/debian，则参考 [UsingUUID](https://help.ubuntu.com/community/UsingUUID)，编辑 `/etc/initramfs-tools/conf.d/resume` 将这个文件中的UUID或者label订正成正确的值并保存。再执行命令 `sudo update-initramfs -u`

不过，执行之后依然没有解决系统启动后还是在寻找`/dev/disk/by-label/x2f`，报错依然相同。我本来以为`grub2-mkconfig`命令会自动按照`/etc/fstab`中设置来创建`/boot/grub2/grub.cfg`，但是发现执行后`grub.cfg`中依然是保留了原来的`root=LABEL=/`，所以需要手工订正这个配置文件，将 `root=LABEL=/` 修改成 `root=LABEL=ROOT`。

果然，最终是手工通过修正`/boot/grub2/grub.cfg`来解决启动时候启动分区识别

# UUID

除了上述通过`e2label`修正磁盘设备的`label`，另一种方法是使用磁盘设备的UUID。参考 [How To Use UUID To Mount Partitions / Volumes Under Ubuntu Linux](http://www.cyberciti.biz/faq/linux-finding-using-uuids-to-update-fstab/)：

* 检查磁盘UUID

```
cd /sbin
./blkid
```

显示输出

```
/dev/sda1: LABEL="BOOT" UUID="ac7453fb-aa2a-4bc2-9114-78bd9fb62cb5" TYPE="ext4"
/dev/sda2: LABEL="ROOT" UUID="37d96a70-ae3f-4591-91de-e29145faad8d" TYPE="ext4"
/dev/sda3: LABEL="SWAP" UUID="23e9c8b6-22fd-46b4-8e2f-78eb33127dcd" TYPE="swap"
```

* 修改`etc/fstab`如下

```
UUID=ac7453fb-aa2a-4bc2-9114-78bd9fb62cb5  /boot  ext4  defaults  1 2
UUID=37d96a70-ae3f-4591-91de-e29145faad8d  /      ext4	defaults  1 1
UUID=23e9c8b6-22fd-46b4-8e2f-78eb33127dcd  swap   swap  defaults  0 0
```

* 同样，需要手工修改 `/boot/grub2/grub.cfg` 将原先启动参数 `root=LABEL=/` 修改成 `root=UUID=37d96a70-ae3f-4591-91de-e29145faad8d`

# 小结

当修改磁盘的DISK label时，需要修改2个位置：

* `/etc/fstab` 对应更改`LABEL`或者`UUID`
* 修改`/boot/grub2/grub.cfg`将启动参数中`root=LABEL=/`修改成都应的`LABEL`或者`UUID`