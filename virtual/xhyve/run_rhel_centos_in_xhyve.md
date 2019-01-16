部署xhyve参考[在OS X中部署xhyve](deploy_xhyve_in_macos)

# 在xhyve中运行CentOS 7

> 实践是安装CentOS 7.6.1810

* 创建磁盘镜像文件：

```
dd if=/dev/zero of=centos7.img bs=1g count=16
```

* 构建兼容iso

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=CentOS-7-x86_64-Minimal-1810.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

* 复制内核

```
cp /Volumes/CentOS\ 7\ x86_64/isolinux/{vmlinuz,initrd.img} ~/vms/
```

* 启动脚本 `install_centos.sh`

```
touch install_centos.sh
chmod +x install_centos.sh
```

```bash
#!/bin/bash

KERNEL="vmlinuz"
INITRD="initrd.img"
CMDLINE="earlyprintk=serial console=ttyS0 acpi=off sshd=1"

MEM="-m 1G"
NET="-s 2:0,virtio-net"
IMG_CD="-s 3,ahci-cd,rhel-8.0-beta-1-x86_64-dvd.iso"
IMG_HDD="-s 4,virtio-blk,rhel8.img"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"

sudo xhyve $MEM $SMP $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

启动执行报错：

```
[    1.897212] md: Waiting for all devices to be available before autodetect
[    1.898360] md: If you don't use raid, use raid=noautodetect
[    1.899362] md: Autodetecting RAID arrays.
[    1.900060] md: autorun ...
[    1.900482] md: ... autorun DONE.
[    1.901046] List of all partitions:
[    1.901573] No filesystem could mount root, tried:
[    1.902354] Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)
[    1.903555] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 3.10.0-957.el7.x86_64 #1
[    1.904602] Hardware name:   BHYVE, BIOS 1.00 03/14/2014
[    1.905373] Call Trace:
[    1.905748]  [<ffffffff93161dc1>] dump_stack+0x19/0x1b
[    1.906500]  [<ffffffff9315b4d0>] panic+0xe8/0x21f
[    1.907198]  [<ffffffff93786761>] mount_block_root+0x291/0x2a0
[    1.908051]  [<ffffffff937867c3>] mount_root+0x53/0x56
[    1.908806]  [<ffffffff93786902>] prepare_namespace+0x13c/0x174
[    1.909699]  [<ffffffff937863df>] kernel_init_freeable+0x1f8/0x21f
[    1.910651]  [<ffffffff93785b1f>] ? initcall_blacklist+0xb0/0xb0
[    1.911522]  [<ffffffff9314fec0>] ? rest_init+0x80/0x80
[    1.912292]  [<ffffffff9314fece>] kernel_init+0xe/0x100
[    1.913070]  [<ffffffff93174c37>] ret_from_fork_nospec_begin+0x21/0x21
[    1.914023]  [<ffffffff9314fec0>] ? rest_init+0x80/0x80
[    1.914912] Kernel Offset: 0x11a00000 from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)
```

[Virtual Machine Kernel Panic : Not Syncing : VFS : Unable To Mount Root FS On Unknown-Block (0,0)](https://www.techcrumble.net/2018/04/virtual-machine-kernel-panic-not-syncing-vfs-unable-to-mount-root-fs-on-unknown-block-00/) 提到了一个解决思路是采用回退内核版本的方法。也许应该先采用旧版本内核启动安装，安装后再尝试更新。至少目前来看，网上的经验 CentOS 7 1511版本安装应该是正常的。

[Kernel panic not syncing VFS after updating Ubuntu server 17.10.1](https://askubuntu.com/questions/1026220/kernel-panic-not-syncing-vfs-after-updating-ubuntu-server-17-10-1) 情况相同。

# 在xhyve中运行RHEL 8 （未成功）

> 实践是安装RHEL 8 beta版本

* xhyve使用文件作文本地磁盘

```
dd if=/dev/zero of=rhel8.img bs=1g count=16
```

* 构建兼容iso

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=rhel-8.0-beta-1-x86_64-dvd.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

* 复制

```
cp /Volumes/RHEL-8-0-BaseOS-/isolinux/{vmlinuz,initrd.img} ~/vms/
```

* 启动脚本 `install_centos.sh`

```
touch install_centos.sh
chmod +x install_centos.sh
```

```bash
#!/bin/bash

KERNEL="vmlinuz"
INITRD="initrd.img"
CMDLINE="earlyprintk=serial console=ttyS0 acpi=off sshd=1"

MEM="-m 1G"
NET="-s 2:0,virtio-net"
IMG_CD="-s 3,ahci-cd,rhel-8.0-beta-1-x86_64-dvd.iso"
IMG_HDD="-s 4,virtio-blk,rhel8.img"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"

sudo xhyve $MEM $SMP $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

运行

```
./install_centos.sh
```

报错

```
vm exit[0]
reason		VMX
rip		0x000000000009e019
inst_length	3
status		0
exit_reason	33
qualification	0x0000000000000000
inst_type		0
inst_error	0
install_centos.sh: line 15: 11756 Abort trap: 6
sudo xhyve $ACPI $MEM $SMP $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

是否对RHEL 8的内核支持有问题？

改成安装CentOS 7.x

# 参考

* [Virtualization on Mac OS X using Vagrant (Part 2)](https://medium.com/@fiercelysw/virtualization-on-mac-os-x-using-vagrant-part-2-3173efc754a8)
* [Running centos 7 on xhyve](https://www.notfound.me/archives/18/)