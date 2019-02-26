最近macOS升级到 Mojave 10.14.3，考虑到内核框架有所升级，加上搜索到最新的xhyve已经能够支持启动4.17内核，所以想再次尝试在xhyve中运行Ubuntu 18的系统。

[在xhyve中运行Debian/Ubuntu](run_debian_ubuntu_in_xhyve)一文中记录了我的多次尝试和失败，不过也渐渐摸索到了线索：

* 需要使用github中xhyve的最新源代码编译，目前在HomeBrew中的二进制软件包可能没有修复支持高版本内核运行问题。
* 启动安装存在挂载ISO镜像问题，也就是能够用标准安装光盘镜像中的高版本内核启动，但是在挂载ISO镜像时提示镜像损坏无法读取。已经测试过，采用netinstall方式，绕过读取ISO镜像文件的方法可以完全从网络安装，且过程无异常。
* 从磁盘启动之后，遇到了磁盘读取缓慢hung问题，如果是virtio-blk问题，那么可能暂时无法解决。如果是上次安装选择了非默认到btrfs文件系统导致，或许可以通过选择EXT4来绕过这个问题。

# 安装xhyve

* 下载最新源代码，按照官方README编译

```
git clone https://github.com/machyve/xhyve.git
cd xhyve
xcodebuild
```

编译后执行程序位于 `build/Release/xhyve`。 在最新的 macOS Mojave 10.14.1 编译成功，但是非常奇怪，在该目录下直接运行 `./xhyve -h`失败，显示

```
Killed: 9
```

* 修改编译方法

```
git clone https://github.com/machyve/xhyve.git
cd xhyve
make clean #这个命令会清理掉上次编译输出的build目录
make
```

使用 make 编译生成的 `build/xhyve` 可以运行

```
/Users/huatai/github/xhyve/build/xhyve -h
```

# 通过Ubuntu 18的mini.iso安装

[ Installation/MinimalCD](https://help.ubuntu.com/community/Installation/MinimalCD) 提供了网络安装下载：

* 下载 [Ubuntu 18.04 "Bionic Beaver"](http://archive.ubuntu.com/ubuntu/dists/bionic/main/installer-amd64/current/images/netboot/mini.iso) 的网络安装镜像 mini.iso

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=mini.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso

mkdir install
cp /Volumes/CDROM/linux ./install/
cp /Volumes/CDROM/initrd.gz ./install/

# After finish copy
umount /Volumes/CDROM
```

* 创建磁盘镜像文件

```
dd if=/dev/zero of=ubuntu18.img bs=1g count=16
```

* 创建安装脚本 install.sh

```
#!/bin/bash
KERNEL="install/linux"
INITRD="install/initrd.gz"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_CD="-s 3:0,ahci-cd,mini.iso"
IMG_HDD="-s 4:0,virtio-blk,ubuntu18.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

* 运行安装

```
sh install.sh
```

# 安装

## 过程Tips

* 安装全程采用字符终端交互，通过TAB键切换，主要是选择语言（English）和locate，我都采用默认。在选择安装下载的镜像网站则选择中国。

* 磁盘分区需要使用整个磁盘分区并设置为EXT4文件系统。我测试了使用`/dev/vda2`采用btrfs文件系统，但是启动失败（见下文记述的失败经历）

* 只选择安装OpenSSH server，这样镜像是最基本系统，后续再不断叠加按需安装

* 安装最后的 `Finish the installation -> Installation complete` 步骤，注意不要直接回车 `<Continue>` ，而是要选择 `<Go Back>`

```
   ┌───────────────────┤ [!!] Finish the installation ├────────────────────┐
   │                                                                       │
  ┌│                         Installation complete                         │
  ││ Installation is complete, so it is time to boot into your new system. │
  ││ Make sure to remove the installation media (CD-ROM, floppies), so     │
  ││ that you boot into the new system rather than restarting the          │
  ││ installation.                                                         │
  ││                                                                       │
  └│     <Go Back>                                          <Continue>     │
   │                                                                       │
   └───────────────────────────────────────────────────────────────────────┘
```

选择菜单 `Execute a shell`，然后获取IP地址：

```
ip addr   # 检查虚拟机的IP地址，例如 192.168.64.5
```

再执行以下命令，在虚拟机内部启动一个nc命令，准备传输内核启动目录`/boot`

```
cd /target
tar c boot | nc -l -p 1234
```

回到macOS中（Host主机），执行以下命令，将虚拟机中`/boot`目录传出

```
nc 192.168.64.5 1234 | tar x
```

此时在物理机macOS目录下就有了一个`boot`子目录

* 返回xhyve虚拟机内部，选择`Finish the installation`结束安装

# 运行

* `run.sh`脚本

```
#!/bin/bash
KERNEL="boot/vmlinuz-4.15.0-45-generic"
INITRD="boot/initrd.img-4.15.0-45-generic"
#DON'T use 'acpi=off', refer https://github.com/machyve/xhyve/issues/161
#CMDLINE="earlyprintk=serial console=ttyS0 acpi=off root=/dev/vda1 ro" 
CMDLINE="earlyprintk=serial console=ttyS0 root=/dev/vda1 ro"
UUID="-U 8e7af180-c54d-4aa2-9bef-59d94a1ac572" # A UUID will ensure we get a consistent ip address assigned
# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_HDD="-s 4:0,virtio-blk,ubuntu18.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $UUID $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

* 运行

```
sh run.sh
```

**以上测试成功，目前可以运行Ubuntu 18操作系统了**

* 恢复虚拟机网络的脚本`masq.sh`

在macOS物理主机上运行任何VPN程序，在退出VPN时候会导致虚拟机网路无法连接，则通过如下脚本恢复网络

```bash
#!/bin/bash
interfaces=( $(netstat -in | egrep 'utun\d .*\d+\.\d+\.\d+\.\d+' | cut -d ' ' -f 1) )
rulefile="rules.tmp"
echo "" > $rulefile
sudo pfctl -a com.apple/tun -F nat
for i in "${interfaces[@]}"
do
  RULE="nat on ${i} proto {tcp, udp, icmp} from 192.168.64.0/24 to any -> ${i}"
  echo $RULE >> $rulefile
done
sudo pfctl -a com.apple/tun -f $rulefile
```

----

**以下仅供参考，实际上是失败的经历**

# 失败经历记录

* 我测试了`CMDLINE`包含了`acpi=off`会出现有时候hung有时候无法识别磁盘

```
Begin: Loading essential drivers ... done.
Begin: Running /scripts/init-premount ... done.
Begin: Mounting root file system ... Begin: Running /scripts/local-top ... done.
Begin: Running /scripts/local-premount ... done.
Begin: Waiting for root file system ... Begin: Running /scripts/local-block ... done.
done.
Gave up waiting for root file system device.  Common problems:
 - Boot args (cat /proc/cmdline)
   - Check rootdelay= (did the system wait long enough?)
 - Missing modules (cat /proc/modules; ls /dev)
ALERT!  /dev/vda1 does not exist.  Dropping to a shell!


BusyBox v1.27.2 (Ubuntu 1:1.27.2-2ubuntu3) built-in shell (ash)
Enter 'help' for a list of built-in commands.
```

```
[  241.235803]  ? 0xffffffffc0237000
[  241.236381]  register_virtio_driver+0x20/0x30
[  241.237135]  init+0x56/0x1000 [virtio_blk]
[  241.237859]  do_one_initcall+0x52/0x19f
[  241.238524]  ? __vunmap+0x81/0xb0
[  241.239200]  ? _cond_resched+0x19/0x40
[  241.239753]  ? kmem_cache_alloc_trace+0xa6/0x1b0
[  241.240611]  ? do_init_module+0x27/0x209
[  241.241331]  do_init_module+0x5f/0x209
[  241.241995]  load_module+0x191e/0x1f10
[  241.242675]  ? ima_post_read_file+0x96/0xa0
[  241.243401]  SYSC_finit_module+0xfc/0x120
[  241.244096]  ? SYSC_finit_module+0xfc/0x120
[  241.244823]  SyS_finit_module+0xe/0x10
[  241.245490]  do_syscall_64+0x73/0x130
[  241.246105]  entry_SYSCALL_64_after_hwframe+0x3d/0xa2
[  241.247028] RIP: 0033:0x7f11d685f839
[  241.247753] RSP: 002b:00007ffe6654b418 EFLAGS: 00000246 ORIG_RAX: 0000000000000139
[  241.249393] RAX: ffffffffffffffda RBX: 000056370ac648c0 RCX: 00007f11d685f839
[  241.250649] RDX: 0000000000000000 RSI: 00007f11d653e145 RDI: 0000000000000005
[  241.251819] RBP: 00007f11d653e145 R08: 0000000000000000 R09: 000056370ac4ea30
[  241.253024] R10: 0000000000000005 R11: 0000000000000246 R12: 0000000000000000
[  241.254192] R13: 000056370ac5ae90 R14: 0000000000020000 R15: 000056370ac648c0
```

从hung住内核来看，像是 virtio 驱动问题。但是，为何安装光盘中的内核启动安装过程如丝般滑顺，难道安装镜像中使用的virtio版本和运行时内核使用的virtio版本不同？

# 尝试不同虚拟机内核

* http://cdimage.ubuntu.com/netboot/18.10/ 提供了最新的 18.10 网络安装镜像

启动时显示有`vda`设备

```
starting version 239
[    1.265614] virtio_blk virtio1: [vda] 33554432 512-byte logical blocks (17.2 GB/16.0 GiB)
[    1.273177] do_IRQ: 1.37 No irq handler for vector
[    1.283656] virtio_net virtio0 enp0s2: renamed from eth0
```

但是启动依然出现相同的响应缓慢挂起问题

```
[  242.685509]  driver_register+0x70/0xc0
[  242.686154]  ? 0xffffffffc0302000
[  242.686732]  register_virtio_driver+0x20/+0x56/0x1000 [virtio_blk]
[  242.688236]  do_one_initcall+0x4a/0x1c4
[  242.689037]  ? free_pcp_prepare+0x4f/0xd0
[  242.689826]  ? _cond_resched+0x19/0x30
[  242.690658]  ? kmem_cache_alloc_trace+0xb8/0x1d0
[  242.691645]  ? do_init_module+0x27/0x220
[  242.692408]  do_init_module+0x60/0x220
[  242.693130]  load_module+0x14f4/0x1890
[  242.693948]  __do_sys_finit_module+0xbd/0x120
[  242.694732]  ? __do_sys_finit_module+0xbd/0x120
[  242.695528]  __x64_sys_finit_module+0x1a/0x20
[  242.696341]  do_syscall_64+0x5a/0x110
[  242.697074]  entry_SYSCALL_64_after_hwframe+0x44/0xa9
[  242.698102] RIP: 0033:0x7fcf8ad1c219
[  242.698912] Code: Bad RIP value.
[  242.699490] RSP: 002b:00007ffcf51060e8 EFLAGS: 00000246 ORIG_RAX: 0000000000000139
[  242.701108] RAX: ffffffffffffffda RBX: 000055f8ee2907a0 RCX: 00007fcf8ad1c219
[  242.702334] RDX: 0000000000000000 RSI: 00007fcf8ac00cad RDI: 0000000000000005
[  242.703691] RBP: 00007fcf8ac00cad R08: 0000000000000000 R09: 000055f8ee27aa70
[  242.705025] R10: 0000000000000005 R11: 0000000000000246 R12: 0000000000000000
[  242.706218] R13: 000055f8ee28e240 R14: 0000000000020000 R15: 000055f8ee2907a0
```

上述问题通过 去除`acpi=off`参数启动 正常，请参考 [Install Ubuntu 18 by netinstall is good, but boot from virtio_blk vda hang #161](https://github.com/machyve/xhyve/issues/161)

# 去除`acpi=off`参数启动

这次我参考我提交issue的 John-K 答复，去除了 `acpi=off` 参数启动，不过，我使用的是btrfs文件系统，挂载为`/dev/vda2`

```bash
#!/bin/bash
KERNEL="boot/vmlinuz-4.15.0-45-generic"
INITRD="boot/initrd.img-4.15.0-45-generic"
#CMDLINE="earlyprintk=serial console=ttyS0 acpi=off root=/dev/vda1 ro"
CMDLINE="earlyprintk=serial console=ttyS0 root=/dev/vda2 ro"
UUID="-U 8e7af180-c54d-4aa2-9bef-59d94a1ac572" # A UUID will ensure we get a consistent ip address assigned
# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_HDD="-s 4:0,virtio-blk,ubuntu18.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $UUID $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

但是启动时能够扫描到磁盘设备，但是挂载设备失败。不过磁盘设备正常，所以我再次尝试采用整个磁盘划分一个分区，格式化EXT4验证是正常的。所以，需要放弃使用btrfs文件系统。

```
[    2.130618] Btrfs loaded, crc32c=crc32c-intel
Scanning for Btrfs filesystems
[    2.138923] BTRFS: device label rootfs devid 1 transid 4736 /dev/vda2
done.
Begin: Will now check root file system ... fsck from util-linux 2.31.1
[/bin/fsck.btrfs (1) -- /dev/vda2] fsck.btrfs -a /dev/vda2
done.
[    2.156745] BTRFS info (device vda2): disk space caching is enabled
[    2.157698] BTRFS info (device vda2): has skinny extents
done.
Begin: Running /scripts/local-bottom ... done.
Begin: Running /scripts/init-bottom ... mount: mounting /dev on /root/dev failed: No such file or directory
mount: mounting /dev on /root/dev failed: No such file or directory
done.
mount: mounting /run on /root/run failed: No such file or directory
run-init: opening console: No such file or directory
Target filesystem doesn't have requested /sbin/init.
run-init: opening console: No such file or directory
run-init: opening console: No such file or directory
run-init: opening console: No such file or directory
run-init: opening console: No such file or directory
run-init: opening console: No such file or directory
No init found. Try passing init= bootarg.
[    2.231328] clocksource: Switched to clocksource tsc


BusyBox v1.27.2 (Ubuntu 1:1.27.2-2ubuntu3) built-in shell (ash)
Enter 'help' for a list of built-in commands.

(initramfs)
```