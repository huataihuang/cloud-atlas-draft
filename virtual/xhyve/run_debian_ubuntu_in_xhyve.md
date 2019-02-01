部署xhyve参考[在OS X中部署xhyve](deploy_xhyve_in_macos)

# 在xhyve中运行Ubuntu

## 安装Ubuntu 16.04（成功）

* xhyve使用文件作文本地磁盘，可能需要使用raw磁盘，`qcow`磁盘可能比较难以加载。

```
dd if=/dev/zero of=ubuntu18.img bs=1g count=16
```

* 获取需要的内核文件

xhyve从本地文件系统加载内核和initrd镜像 -- 需要从本地挂载的iso中提取以便能够启动一个安装cd。先下载一个iso，然后将iso挂载到mac中并复制出kernel文件。

为了能够挂载iso，需要构建一个兼容副本（也就是最前面到2k块是空白），然后挂载副本：

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=ubuntu-16.04.5-server-amd64.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

* 从挂载的卷中复制出内核文件:

```
cp /Volumes/Ubuntu-Server\ 16/install/vmlinux .
cp /Volumes/Ubuntu-Server\ 16/install/initrd.gz .
```

* 安装脚本`install.sh`指定16.04镜像：

```bash
#!/bin/bash
KERNEL="vmlinuz"
INITRD="initrd.gz"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
MEM="-m 2G"
IMG_CD="-s 1,ahci-cd,ubuntu-16.04.5-server-amd64.iso"
IMG_HDD="-s 2,virtio-blk,ubuntu.img"
NET="-s 3:0,virtio-net,en0"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo xhyve $ACPI $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

顺利启动安装，整个过程非常快速。

* 安装完成后不要马上重启，而是`Go Back` 然后选择 `Execute a shell`，因为此时我们需要将安装的initrd 和 linux（内核）复制出到macOS中，以便能够让xhyve启动系统：

```
cd /target
sbin/ifconfig
tar c boot | nc -l -p 1234
```

> 在使用 `sbin/ifconfig` 可以看到虚拟机的IP地址，例如 `192.168.64.2`

然后在macOS上执行

```
nc <IP from above> 1234 | tar x
```

此时可以看到在macOS上，增加了一个 `boot` 目录包含了ubuntu虚拟机的`/boot`目录下所有文件。之后我们将使用这个目录中内核来启动虚拟机。

* 启动虚拟机脚本 `run.sh`

```bash
KERNEL="boot/vmlinuz-4.4.0-131-generic"
INITRD="boot/initrd.img-4.4.0-131-generic"
CMDLINE="earlyprintk=serial console=ttyS0 acpi=off root=/dev/vda1 ro"
UUID="-U 8e7af180-c54d-4aa2-9bef-59d94a1ac572" # A UUID will ensure we get a consistent ip address assigned
# Guest Config
MEM="-m 3G"
IMG_HDD="-s 2,virtio-blk,ubuntu.img"
NET="-s 3:0,virtio-net,en0"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo xhyve $UUID $ACPI $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

运行启动脚本，启动进入Ubuntu 16操作系统控制台，启动速度极快

```bash
sh run.sh
```

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

## 能对比测试（vmware .vs xhyve）

采用 unixbench 简单对比两种不同虚拟化的性能差异

> * 安装编译工具参考 [Debian最小化安装后的软件包安装建议](../../os/linux/debian/package/debian_mini_install_packages_suggest)
> * 安装使用Unixbench参考 [Unixbench性能测试工具](../../performance/utilities/unixbench)

* xhyve中运行1c2g规格虚拟机测试结果

```
========================================================================
   BYTE UNIX Benchmarks (Version 5.1.3)

   System: ubuntu-x: GNU/Linux
   OS: GNU/Linux -- 4.4.0-131-generic -- #157-Ubuntu SMP Thu Jul 12 15:51:36 UTC 2018
   Machine: x86_64 (x86_64)
   Language: en_US.utf8 (charmap="UTF-8", collate="UTF-8")
   CPU 0: Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz (4414.8 bogomips)
          Hyper-Threading, x86-64, MMX, Physical Address Ext, SYSENTER/SYSEXIT, SYSCALL/SYSRET
   21:21:40 up 17 min,  1 user,  load average: 0.01, 0.00, 0.00; runlevel 5

------------------------------------------------------------------------
Benchmark Run: Tue Dec 11 2018 21:21:40 - 21:49:37
1 CPU in system; running 1 parallel copy of tests

Dhrystone 2 using register variables       42176293.4 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     4983.5 MWIPS (9.2 s, 7 samples)
Execl Throughput                               4321.8 lps   (29.7 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks       1038948.3 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          282236.5 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       2592193.7 KBps  (30.0 s, 2 samples)
Pipe Throughput                             1499265.4 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 189564.5 lps   (10.0 s, 7 samples)
Process Creation                              15991.4 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                  10052.3 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                   1327.9 lpm   (60.0 s, 2 samples)
System Call Overhead                        1238503.5 lps   (10.0 s, 7 samples)

System Benchmarks Index Values               BASELINE       RESULT    INDEX
Dhrystone 2 using register variables         116700.0   42176293.4   3614.1
Double-Precision Whetstone                       55.0       4983.5    906.1
Execl Throughput                                 43.0       4321.8   1005.1
File Copy 1024 bufsize 2000 maxblocks          3960.0    1038948.3   2623.6
File Copy 256 bufsize 500 maxblocks            1655.0     282236.5   1705.4
File Copy 4096 bufsize 8000 maxblocks          5800.0    2592193.7   4469.3
Pipe Throughput                               12440.0    1499265.4   1205.2
Pipe-based Context Switching                   4000.0     189564.5    473.9
Process Creation                                126.0      15991.4   1269.2
Shell Scripts (1 concurrent)                     42.4      10052.3   2370.8
Shell Scripts (8 concurrent)                      6.0       1327.9   2213.1
System Call Overhead                          15000.0    1238503.5    825.7
                                                                   ========
System Benchmarks Index Score                                        1559.3
```

* vmware中运行1c2g规格虚拟机测试结果

```
========================================================================
   BYTE UNIX Benchmarks (Version 5.1.3)

   System: ubuntu-v: GNU/Linux
   OS: GNU/Linux -- 4.4.0-131-generic -- #157-Ubuntu SMP Thu Jul 12 15:51:36 UTC 2018
   Machine: x86_64 (x86_64)
   Language: en_US.utf8 (charmap="UTF-8", collate="UTF-8")
   CPU 0: Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz (4415.4 bogomips)
          x86-64, MMX, Physical Address Ext, SYSENTER/SYSEXIT, SYSCALL/SYSRET
   22:01:16 up 0 min,  1 user,  load average: 0.22, 0.08, 0.03; runlevel 5

------------------------------------------------------------------------
Benchmark Run: Tue Dec 11 2018 22:01:16 - 22:29:13
1 CPU in system; running 1 parallel copy of tests

Dhrystone 2 using register variables       43864153.4 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     5037.2 MWIPS (9.3 s, 7 samples)
Execl Throughput                               5868.0 lps   (30.0 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks        992851.0 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          272753.8 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       2681322.4 KBps  (30.0 s, 2 samples)
Pipe Throughput                             1412794.5 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 181744.6 lps   (10.0 s, 7 samples)
Process Creation                              15334.7 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                  11895.7 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                   1577.4 lpm   (60.0 s, 2 samples)
System Call Overhead                        1292161.5 lps   (10.0 s, 7 samples)

System Benchmarks Index Values               BASELINE       RESULT    INDEX
Dhrystone 2 using register variables         116700.0   43864153.4   3758.7
Double-Precision Whetstone                       55.0       5037.2    915.9
Execl Throughput                                 43.0       5868.0   1364.7
File Copy 1024 bufsize 2000 maxblocks          3960.0     992851.0   2507.2
File Copy 256 bufsize 500 maxblocks            1655.0     272753.8   1648.1
File Copy 4096 bufsize 8000 maxblocks          5800.0    2681322.4   4623.0
Pipe Throughput                               12440.0    1412794.5   1135.7
Pipe-based Context Switching                   4000.0     181744.6    454.4
Process Creation                                126.0      15334.7   1217.0
Shell Scripts (1 concurrent)                     42.4      11895.7   2805.6
Shell Scripts (8 concurrent)                      6.0       1577.4   2629.0
System Call Overhead                          15000.0    1292161.5    861.4
                                                                   ========
System Benchmarks Index Score                                        1632.4
```

从UnixBench测试来看，vmware环境运行的ubuntu性能比 xhyve 略好：`vmware比xhyve性能约高 5%`

## 升级 Ubuntu 16.04 到 18.04

前面已经完成了Ubuntu 16.04在xhyve中的系统安装，就考虑既然直接安装Ubuntu 18.04的iso失败，难么能否在现有已经安装成功的Ubuntu 16.04基础上升级到18.04？

参考 [升级Ubuntu系统到18.04 LTS Bionic Beaver](../../os/linux/ubuntu/install/upgrade_ubuntu_to_18.04)

```
sudo apt update 
sudo apt upgrade
sudo apt dist-upgrade
sudo apt autoremove
sudo apt install update-manager-core
sudo do-release-upgrade
```

不过，升级完成后，同样方法，将镜像中的最新版本内核复制到macOS系统中通过 xhyve 加载方式启动（如之前`run.sh`启动脚本），但是启动和直接使用Ubuntu 18.04 iso镜像安装一样报错

```
[    1.068740] Failed to execute /init (error -2)
[    1.069469] Kernel panic - not syncing: No working init found.  Try passing init= option to kernel. See Linux Documentation/admin-guide/init.rst for guidance.
[    1.071615] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 4.15.0-42-generic #45-Ubuntu
[    1.072822] Hardware name:  BHYVE, BIOS 1.00 03/14/2014
[    1.073610] Call Trace:
[    1.073983]  dump_stack+0x63/0x8b
[    1.074476]  ? rest_init+0x20/0xb0
[    1.075021]  panic+0xe4/0x244
[    1.075465]  ? putname+0x4c/0x60
[    1.075947]  ? rest_init+0xb0/0xb0
[    1.076457]  kernel_init+0xf0/0x110
[    1.076974]  ret_from_fork+0x35/0x40
[    1.077636] Kernel Offset: 0x3e00000 from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)
[    1.079182] ---[ end Kernel panic - not syncing: No working init found.  Try passing init= option to kernel. See Linux Documentation/admin-guide/init.rst for guidance.
```

看来目前xhyve尚不能启动最新的 `4.15.0` 系列内核，实际测试回退到 `4.4.0` 内核（即Ubuntu 16.04所用内核）则可以正常启动。所以，目前我在xhyve中使用的Ubuntu 18.04系统运行的内核版本为 `4.4.0-131`。

参考 [hyperkit fails to boot 4.17 and 4.18 kernel (based on Linuxkit) ](https://github.com/moby/hyperkit/issues/226) 信息，导致高版本内核运行异常是因为一些较新的内核触发的VMEXIT没有被hyperkit正确处理。qemu 3.0可以工作在内核4.17的hvf模式 （`-accel hvf -cpu host`），最新版本的hyperkit/xhyve已经可以启动Fedora 29，即 [machyve/xhyve@cc672d5](https://github.com/machyve/xhyve/commit/cc672d5363766e7c2bf10e02ca12efbeda74c487) 可能已经解决。

* 为了能够始终访问控制台，建议使用screen来运行xhyve的终端，也就是先运行`screen`成勋再执行`xhyve`运行虚拟机，以便能够随时访问终端。

* 由于内核升级会导致虚拟机无法运行，所以需要[暂时关闭Kernel update](../../os/linux/ubuntu/install/prevent_ubuntu_kernel_upgrade)

# Ubuntu 18安装（失败）

> 实践是安装Ubuntu 18 LTS版本

* xhyve使用文件作文本地磁盘，可能需要使用raw磁盘，`qcow`磁盘可能比较难以加载。

```
dd if=/dev/zero of=ubuntu.img bs=1g count=16
```

* 获取需要的内核文件

xhyve从本地文件系统加载内核和initrd镜像 -- 需要从本地挂载的iso中提取以便能够启动一个安装cd。先下载一个iso，然后将iso挂载到mac中并复制出kernel文件。

为了能够挂载iso，需要构建一个兼容副本（也就是最前面到2k块是空白），然后挂载副本：

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=ubuntu-18.04.1.0-live-server-amd64.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

此时提示该镜像挂载：

```
/dev/disk2          	                               	/Volumes/Ubuntu-Server 18
```

然后，从挂载的卷中复制出内核文件:

```
mkdir boot
cp /Volumes/Ubuntu-Server\ 18/casper/vmlinuz boot/
cp /Volumes/Ubuntu-Server\ 18/casper/initrd boot/
```

> 上述方法可以参考 [PXE boot of 18.04 ISO](https://askubuntu.com/questions/1029017/pxe-boot-of-18-04-iso) ，也就是可以从 18.04 ISO文件中解压缩出必要的文件来构建一个PXE启动，方法适用于 16.04 , 17.10 和 18.04 等不同版本。

如果是早期的 16.04 版本，上述镜像内核文件位于ISO根目录中，类似方法：

```
cp /Volumes/CDROM/linux .
cp /Volumes/CDROM/initrd.gz .
```

此时就可以删除临时的 tmp.iso 文件了

```
umount /Volumes/Ubuntu-Server\ 18
rm -f tmp.iso
```

* 现在需要启动安装器，也即是如下 `install.sh` 脚本

> 注意：我的安装目录位于 `~/vms` 目录下，这个目录下包含了前面解压缩出来的内核文件，以及iso安装文件：

```
boot/initrd
boot/vmlinuz
ubuntu18.img
ubuntu-18.04.1.0-live-server-amd64.iso
```

以下改自ubuntu 16的安装脚本在启动ubuntu 18的安装过程，会有响应缓慢问题，似乎和总线有关

```bash
#!/bin/bash
KERNEL="boot/vmlinuz"
INITRD="boot/initrd"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
MEM="-m 2G"
IMG_CD="-s 1,ahci-cd,ubuntu-18.04.1.0-live-server-amd64.iso"
IMG_HDD="-s 2,virtio-blk,ubuntu.img"
NET="-s 3:0,virtio-net,en0"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $ACPI $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

运行安装脚本

```
sh install.sh
```

报错：

```
Could not open backing file: No such file or directory
Could not open backing file: No such file or directory
```

这个报错参考 [Could not open backing file: No such file or directory #143](https://github.com/machyve/xhyve/issues/143)，原来是我写错了镜像名字导致的。

修改安装脚本（参考 [Ubuntu 18 on xhyve on MacOS X failed again](https://houraku365.hatenablog.com/entry/2019/01/06/ubuntu18-on-xhyve-on-macosx-failed-again) ）将不同的设别分设到不同的总线端口上

```
#!/bin/bash
KERNEL="boot/vmlinuz"
INITRD="boot/initrd"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_CD="-s 3:0,ahci-cd,ubuntu-18.04.1.0-live-server-amd64.iso"
IMG_HDD="-s 4:0,virtio-blk,ubuntu.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

但是，上述安装脚本遇到了启动后内核无法识别设备问题：

```
Begin: Running /scripts/init-premount ... done.
Begin: Mounting root file system ... Begin: Running /scripts/local-top ... done.
Begin: Running /scripts/local-premount ... [    3.978710] Btrfs loaded, crc32c=crc32c-intel
Scanning for Btrfs filesystems
done.
Warning: fsck not present, so skipping unknown file system
mount: can't find /root in /etc/fstab
done.
Begin: Running /scripts/local-bottom ... done.
Begin: Running /scripts/init-bottom ... mount: mounting /dev on /root/dev failed: No such file or directory
mount: mounting /dev on /root/dev failed: No such file or directory
done.
mount: mounting /run on /root/run failed: No such file or directory
run-init: current directory on the same filesystem as the root: error 0
Target filesystem doesn't have requested /sbin/init.
run-init: current directory on the same filesystem as the root: error 0
run-init: current directory on the same filesystem as the root: error 0
run-init: current directory on the same filesystem as the root: error 0
run-init: current directory on the same filesystem as the root: error 0
run-init: current directory on the same filesystem as the root: error 0
No init found. Try passing init= bootarg.


BusyBox v1.27.2 (Ubuntu 1:1.27.2-2ubuntu3) built-in shell (ash)
Enter 'help' for a list of built-in commands.

(initramfs)
```

## 尝试16.04.5安装iso中内核启动

这个方法是参考 [Ubuntu 18 on xhyve on MacOS X failed again](https://houraku365.hatenablog.com/entry/2019/01/06/ubuntu18-on-xhyve-on-macosx-failed-again) ，也遇到了相同的问题：

* 使用 16.04.5 版本的iso中复制出来的 vmlinuz 和 initrd.gz 启动，配置使用 18.04.1 版本的iso进行安装，在启动之后也是在检测和挂载CD-ROM阶段出现报错

```
┌───────────────────┤ [!!] Detect and mount CD-ROM ├────────────────────┐
│                                                                       │
│ Your installation CD-ROM couldn't be mounted. This probably means     │
│ that the CD-ROM was not in the drive. If so you can insert it and try │
│ again.                                                                │
│                                                                       │
│ Retry mounting the CD-ROM?                                            │
│                                                                       │
│     <Yes>                                                    <No>     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

但是，退到shell中检查，可以看到CDROM是挂载的

```
/bin # df -h
Filesystem                Size      Used Available Use% Mounted on
none                    200.0M     36.0K    200.0M   0% /run
devtmpfs                991.7M         0    991.7M   0% /dev
/dev/sr0                812.0M    812.0M         0 100% /cdrom
```

尝试做了一次`umount /cdrom`之后，然后重新执行 `Detect and mount CD-ROM` 发现，这个镜像重新挂载，但是依然报错。

从 `Check the CD-ROM(s) integrity` 功能来看，提示信息

```
     ┌───────────────┤ [!] Check the CD-ROM(s) integrity ├───────────────┐
     │                                                                   │
     │                       Integrity test failed                       │
     │ The ./.disk/info file failed the MD5 checksum verification. Your  │
     │ CD-ROM or this file may have been corrupted.                      │
     │                                                                   │
     │                            <Continue>                             │
     │                                                                   │
     └───────────────────────────────────────────────────────────────────┘
```

所以，我推测安装工具是做了MD5校验来确定是否CDROM正确挂载，而在xhyve安装中修改ISO会导致校验失败。

**或许和CentOS一样能够通过netinstall方式来安装可以绕过这个问题？**

## 通过Ubuntu 18的mini.iso安装（网络安装），接近成功

[ Installation/MinimalCD](https://help.ubuntu.com/community/Installation/MinimalCD) 提供了网络安装下载：

* 下载 [Ubuntu 18.04 "Bionic Beaver"](http://archive.ubuntu.com/ubuntu/dists/bionic/main/installer-amd64/current/images/netboot/mini.iso) 的网络安装镜像 mini.iso

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=mini.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso

cp /Volumes/CDROM/linux boot/
cp /Volumes/CDROM/initrd.gz boot/
```

* 果然通过netinstall方式可以绕过奇怪的无法挂载CDROM问题

```
#!/bin/bash
#KERNEL="boot/vmlinuz"
#INITRD="boot/initrd.gz"
KERNEL="boot/linux"
INITRD="boot/initrd.gz"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_CD="-s 3:0,ahci-cd,ubuntu-18.04.1.0-live-server-amd64.iso"
IMG_HDD="-s 4:0,virtio-blk,ubuntu.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

这里有一个疏忽，忘记将 `ubuntu-18.04.1.0-live-server-amd64.iso` 替换成 `mini.iso` ，但是没有想到，实际上使用了 `mini.iso` 中的内核 `linux` 和 `initrd.gz` 之后，启动安装就会通过网络获取相关软件包，不再需要使用iso镜像中的文件，所以并没有遇到问题。

不过，我虽然安装成功，但是启动运行出现磁盘hung，导致无法访问，准备再次使用默认的EXT4文件系统进行安装。

* 磁盘分区和文件系统我没有采用默认的ext4文件系统，而是采用了比较激进的btrfs:

`/dev/sda1`设置为xfs文件系统，挂载为`/boot`

```
  ┌────────────────────────┤ [!!] Partition disks ├─────────────────────────┐
  │                                                                         │
  │ You are editing partition #1 of Virtual disk 1 (vda). No existing       │
  │ file system was detected in this partition.                             │
  │                                                                         │
  │ Partition settings:                                                     │
  │                                                                         │
  │              Use as:         XFS journaling file system                 │
  │                                                                         │
  │              Mount point:    /boot                                      │
  │              Mount options:  defaults                                   │
  │              Label:          bootfs                                     │
  │              Bootable flag:  on                                         │
  │                                                                         │
  │              Delete the partition                                       │
  │              Done setting up the partition                              │
  │                                                                         │
  │     <Go Back>                                                           │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
```

`/dev/sda2`设置为btrfs文件系统，挂载为`/`

```
  ┌────────────────────────┤ [!!] Partition disks ├─────────────────────────┐
  │                                                                         │
  │ You are editing partition #2 of Virtual disk 1 (vda). No existing       │
  │ file system was detected in this partition.                             │
  │                                                                         │
  │ Partition settings:                                                     │
  │                                                                         │
  │             Use as:         btrfs journaling file system                │
  │                                                                         │
  │             Mount point:    /                                           │
  │             Mount options:  defaults                                    │
  │             Label:          rootfs                                      │
  │             Bootable flag:  off                                         │
  │                                                                         │
  │             Delete the partition                                        │
  │             Done setting up the partition                               │
  │                                                                         │
  │     <Go Back>                                                           │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
```

最后的磁盘分区情况如下：

```
  │         Virtual disk 1 (vda) - 17.2 GB Virtio Block Device   ▒          │
  │         >     #1  primary  382.7 MB  B  f  xfs      /boot    ▒          │
  │         >     #2  primary   16.8 GB     f  btrfs    /        ▒          │
```

开始安装了，进展顺利，激动。。。

* 最后安装完成，暂时不要直接退出安装界面，而是把磁盘镜像`/boot`目录下的内核复制出来：

`Go Back` 然后选择 `Execute a shell`，因为此时我们需要将安装的initrd 和 linux（内核）复制出到macOS中，以便能够让xhyve启动系统：

```
cd /target
ip addr
tar c boot | nc -l -p 1234
```

> 在使用 `ip addr` 可以看到虚拟机的IP地址，例如 `192.168.64.4`

然后在macOS上执行

```
nc <IP from above> 1234 | tar x
```

此时可以看到在macOS上，增加了一个 `boot` 目录包含了ubuntu虚拟机的`/boot`目录下所有文件。之后我们将使用这个目录中内核来启动虚拟机。

* 启动运行脚本

```
#!/bin/bash
KERNEL="boot/vmlinuz-4.15.0-45-generic"
INITRD="boot/initrd.img-4.15.0-45-generic"
CMDLINE="earlyprintk=serial console=ttyS0 acpi=off root=/dev/vda1 ro"
UUID="-U 8e7af180-c54d-4aa2-9bef-59d94a1ac572" # A UUID will ensure we get a consistent ip address assigned
# Guest Config
CPU="-c 2"
MEM="-m 2G"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
NET="-s 2:0,virtio-net,en0"
IMG_HDD="-s 4:0,virtio-blk,ubuntu.img"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo /Users/huatai/github/xhyve/build/xhyve $UUID $ACPI $CPU $MEM $PCI_DEV $LPC_DEV $NET $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

遇到一个诡异问题，虽然安装过程正常顺利，但是启动运行出现任务挂起。启动非常缓慢，出现报错。一种可能是虚拟化磁盘读取响应问题，另一种可能是选择的文件系统问题。

```
[  122.419366] Btrfs loaded, crc32c=crc32c-intel
Scanning for Btrfs filesystems

[  232.551260] random: fast init done


[  244.558704] INFO: task systemd-udevd:142 blocked for more than 120 seconds.
[  244.561156]       Not tainted 4.15.0-45-generic #48-Ubuntu
[  244.562703] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
[  244.564657] systemd-udevd   D    0   142    135 0x80000004
[  244.565958] Call Trace:
[  244.566478]  __schedule+0x291/0x8a0
[  244.567257]  schedule+0x2c/0x80
[  244.567913]  io_schedule+0x16/0x40
[  244.568621]  do_read_cache_page+0x3b5/0x580
[  244.569480]  ? blkdev_writepages+0x40/0x40
[  244.570322]  ? page_cache_tree_insert+0xe0/0xe0
[  244.571331]  read_cache_page+0x15/0x20
[  244.572057]  read_dev_sector+0x2d/0xd0
[  244.572784]  read_lba+0x134/0x220
[  244.573427]  ? efi_partition+0x122/0x7a0
[  244.574184]  efi_partition+0x140/0x7a0
[  244.574910]  ? snprintf+0x45/0x70
[  244.575570]  ? is_gpt_valid.part.5+0x420/0x420
[  244.576431]  check_partition+0x130/0x230
[  244.577238]  ? check_partition+0x130/0x230
[  244.578024]  rescan_partitions+0xaa/0x350
[  244.578853]  ? down_write+0x12/0x40
[  244.579523]  __blkdev_get+0x31c/0x4c0
[  244.580241]  blkdev_get+0x129/0x320
[  244.580905]  ? unlock_new_inode+0x4b/0x60
[  244.581658]  ? bdget+0x108/0x120
[  244.582281]  device_add_disk+0x3f9/0x440
[  244.582999]  ? ioread8+0x1a/0x40
[  244.583610]  virtblk_probe+0x536/0x769 [virtio_blk]
[  244.584494]  virtio_dev_probe+0x172/0x230
[  244.585229]  driver_probe_device+0x31e/0x490
[  244.586006]  __driver_attach+0xa7/0xf0
[  244.586746]  ? driver_probe_device+0x490/0x490
[  244.587584]  bus_for_each_dev+0x70/0xc0
[  244.588299]  driver_attach+0x1e/0x20
[  244.588932]  bus_add_driver+0x1c7/0x270
[  244.589653]  ? 0xffffffffc0117000
[  244.590316]  driver_register+0x60/0xe0
[  244.591012]  ? 0xffffffffc0117000
[  244.591612]  register_virtio_driver+0x20/0x30
[  244.592506]  init+0x56/0x1000 [virtio_blk]
[  244.593335]  do_one_initcall+0x52/0x19f
[  244.594112]  ? _cond_resched+0x19/0x40
[  244.594812]  ? kmem_cache_alloc_trace+0xa6/0x1b0
[  244.595631]  ? do_init_module+0x27/0x209
[  244.596321]  do_init_module+0x5f/0x209
[  244.596979]  load_module+0x191e/0x1f10
[  244.597637]  ? ima_post_read_file+0x96/0xa0
[  244.598346]  SYSC_finit_module+0xfc/0x120
[  244.599041]  ? SYSC_finit_module+0xfc/0x120
[  244.599749]  SyS_finit_module+0xe/0x10
[  244.600388]  do_syscall_64+0x73/0x130
[  244.601010]  entry_SYSCALL_64_after_hwframe+0x3d/0xa2
[  244.601862] RIP: 0033:0x7f625178e839
[  244.602452] RSP: 002b:00007ffced9c5488 EFLAGS: 00000246 ORIG_RAX: 0000000000000139
[  244.603698] RAX: ffffffffffffffda RBX: 000055b35dd118c0 RCX: 00007f625178e839
[  244.604823] RDX: 0000000000000000 RSI: 00007f625146d145 RDI: 0000000000000005
[  244.605947] RBP: 00007f625146d145 R08: 0000000000000000 R09: 000055b35dcfba30
[  244.607086] R10: 0000000000000005 R11: 0000000000000246 R12: 0000000000000000
[  244.608179] R13: 000055b35dd0c820 R14: 0000000000020000 R15: 000055b35dd118c0
[  244.609296] INFO: task btrfs:158 blocked for more than 120 seconds.
[  244.610228]       Not tainted 4.15.0-45-generic #48-Ubuntu
[  244.611102] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
[  244.612286] btrfs           D    0   158    156 0x00000000
[  244.613131] Call Trace:
[  244.613514]  __schedule+0x291/0x8a0
[  244.614061]  schedule+0x2c/0x80
[  244.614554]  schedule_preempt_disabled+0xe/0x10
[  244.615265]  __mutex_lock.isra.2+0x18c/0x4d0
[  244.615908]  ? kobj_lookup+0x111/0x160
[  244.616468]  __mutex_lock_slowpath+0x13/0x20
[  244.617101]  ? __mutex_lock_slowpath+0x13/0x20
[  244.617757]  mutex_lock+0x2f/0x40
[  244.618251]  __blkdev_get+0x71/0x4c0
[  244.618820]  blkdev_get+0x129/0x320
[  244.619344]  ? bdget+0x3e/0x120
[  244.619813]  blkdev_open+0x95/0xf0
[  244.620400]  do_dentry_open+0x1c2/0x310
[  244.620971]  ? __inode_permission+0x5b/0x160
[  244.621603]  ? bd_acquire+0xd0/0xd0
[  244.622125]  vfs_open+0x4f/0x80
[  244.622595]  path_openat+0x66e/0x1770
[  244.623141]  do_filp_open+0x9b/0x110
[  244.623689]  ? __check_object_size+0xaf/0x1b0
[  244.624335]  ? __alloc_fd+0x46/0x170
[  244.624869]  do_sys_open+0x1bb/0x2c0
[  244.625444]  ? do_sys_open+0x1bb/0x2c0
[  244.626023]  ? _cond_resched+0x19/0x40
[  244.626618]  SyS_openat+0x14/0x20
[  244.627117]  do_syscall_64+0x73/0x130
[  244.627674]  entry_SYSCALL_64_after_hwframe+0x3d/0xa2
[  244.628433] RIP: 0033:0x7f85238f6d2b
[  244.629015] RSP: 002b:00007fff8c2d0fe0 EFLAGS: 00000246 ORIG_RAX: 0000000000000101
[  244.630132] RAX: ffffffffffffffda RBX: 00005621f3b9f940 RCX: 00007f85238f6d2b
[  244.631181] RDX: 0000000000080000 RSI: 00005621f3b9f9c0 RDI: 00000000ffffff9c
[  244.632220] RBP: 00005621f3b9f270 R08: 00005621f3b9fa00 R09: 0000000000000000
[  244.633258] R10: 0000000000000000 R11: 0000000000000246 R12: 00007f8524409944
[  244.634402] R13: 00000000dc531383 R14: 0000000000000000 R15: 00007f85241f66a8
[  366.325117] INFO: task systemd-udevd:142 blocked for more than 120 seconds.
[  366.326496]       Not tainted 4.15.0-45-generic #48-Ubuntu
[  366.327679] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
[  366.329170] systemd-udevd   D    0   142    135 0x80000004
[  366.330235] Call Trace:
[  366.330722]  __schedule+0x291/0x8a0
[  366.331396]  schedule+0x2c/0x80
[  366.332008]  io_schedule+0x16/0x40
[  366.332723]  do_read_cache_page+0x3b5/0x580
[  366.333591]  ? blkdev_writepages+0x40/0x40
[  366.334447]  ? page_cache_tree_insert+0xe0/0xe0
[  366.335346]  read_cache_page+0x15/0x20
[  366.336052]  read_dev_sector+0x2d/0xd0
[  366.336906]  read_lba+0x134/0x220
[  366.337611]  ? efi_partition+0x122/0x7a0
[  366.338484]  efi_partition+0x140/0x7a0
[  366.339249]  ? snprintf+0x45/0x70
[  366.339849]  ? is_gpt_valid.part.5+0x420/0x420
[  366.340644]  check_partition+0x130/0x230
[  366.341361]  ? check_partition+0x130/0x230
[  366.342131]  rescan_partitions+0xaa/0x350
[  366.342855]  ? down_write+0x12/0x40
[  366.343484]  __blkdev_get+0x31c/0x4c0
[  366.344148]  blkdev_get+0x129/0x320
[  366.344775]  ? unlock_new_inode+0x4b/0x60
[  366.345578]  ? bdget+0x108/0x120
[  366.346159]  device_add_disk+0x3f9/0x440
[  366.346855]  ? ioread8+0x1a/0x40
[  366.347432]  virtblk_probe+0x536/0x769 [virtio_blk]
[  366.348301]  virtio_dev_probe+0x172/0x230
[  366.349041]  driver_probe_device+0x31e/0x490
[  366.349831]  __driver_attach+0xa7/0xf0
[  366.350544]  ? driver_probe_device+0x490/0x490
[  366.351359]  bus_for_each_dev+0x70/0xc0
[  366.352070]  driver_attach+0x1e/0x20
[  366.352699]  bus_add_driver+0x1c7/0x270
[  366.353372]  ? 0xffffffffc0117000
[  366.353985]  driver_register+0x60/0xe0
[  366.354622]  ? 0xffffffffc0117000
[  366.355210]  register_virtio_driver+0x20/0x30
[  366.355955]  init+0x56/0x1000 [virtio_blk]
[  366.356684]  do_one_initcall+0x52/0x19f
[  366.357366]  ? _cond_resched+0x19/0x40
[  366.358021]  ? kmem_cache_alloc_trace+0xa6/0x1b0
[  366.358853]  ? do_init_module+0x27/0x209
[  366.359648]  do_init_module+0x5f/0x209
[  366.360287]  load_module+0x191e/0x1f10
[  366.360987]  ? ima_post_read_file+0x96/0xa0
[  366.361717]  SYSC_finit_module+0xfc/0x120
[  366.362395]  ? SYSC_finit_module+0xfc/0x120
[  366.363106]  SyS_finit_module+0xe/0x10
[  366.363727]  do_syscall_64+0x73/0x130
[  366.364335]  entry_SYSCALL_64_after_hwframe+0x3d/0xa2
[  366.365164] RIP: 0033:0x7f625178e839
[  366.365736] RSP: 002b:00007ffced9c5488 EFLAGS: 00000246 ORIG_RAX: 0000000000000139
[  366.366947] RAX: ffffffffffffffda RBX: 000055b35dd118c0 RCX: 00007f625178e839
[  366.368045] RDX: 0000000000000000 RSI: 00007f625146d145 RDI: 0000000000000005
[  366.369142] RBP: 00007f625146d145 R08: 0000000000000000 R09: 000055b35dcfba30
[  366.370237] R10: 0000000000000005 R11: 0000000000000246 R12: 0000000000000000
[  366.371348] R13: 000055b35dd0c820 R14: 0000000000020000 R15: 000055b35dd118c0
[  366.372569] INFO: task btrfs:158 blocked for more than 120 seconds.
[  366.373576]       Not tainted 4.15.0-45-generic #48-Ubuntu
[  366.374497] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
[  366.375648] btrfs           D    0   158    156 0x00000000
[  366.376454] Call Trace:
[  366.376829]  __schedule+0x291/0x8a0
[  366.377365]  schedule+0x2c/0x80
[  366.377838]  schedule_preempt_disabled+0xe/0x10
[  366.378497]  __mutex_lock.isra.2+0x18c/0x4d0
[  366.379151]  ? kobj_lookup+0x111/0x160
[  366.379798]  __mutex_lock_slowpath+0x13/0x20
[  366.380532]  ? __mutex_lock_slowpath+0x13/0x20
[  366.381261]  mutex_lock+0x2f/0x40
[  366.381844]  __blkdev_get+0x71/0x4c0
[  366.382437]  blkdev_get+0x129/0x320
[  366.382975]  ? bdget+0x3e/0x120
[  366.383452]  blkdev_open+0x95/0xf0
[  366.383972]  do_dentry_open+0x1c2/0x310
[  366.384543]  ? __inode_permission+0x5b/0x160
[  366.385177]  ? bd_acquire+0xd0/0xd0
[  366.385715]  vfs_open+0x4f/0x80
[  366.386186]  path_openat+0x66e/0x1770
[  366.386729]  do_filp_open+0x9b/0x110
[  366.387262]  ? __check_object_size+0xaf/0x1b0
[  366.387906]  ? __alloc_fd+0x46/0x170
[  366.388472]  do_sys_open+0x1bb/0x2c0
[  366.389050]  ? do_sys_open+0x1bb/0x2c0
[  366.389610]  ? _cond_resched+0x19/0x40
[  366.390194]  SyS_openat+0x14/0x20
[  366.390690]  do_syscall_64+0x73/0x130
[  366.391234]  entry_SYSCALL_64_after_hwframe+0x3d/0xa2
[  366.391975] RIP: 0033:0x7f85238f6d2b
[  366.392507] RSP: 002b:00007fff8c2d0fe0 EFLAGS: 00000246 ORIG_RAX: 0000000000000101
[  366.393623] RAX: ffffffffffffffda RBX: 00005621f3b9f940 RCX: 00007f85238f6d2b
[  366.394671] RDX: 0000000000080000 RSI: 00005621f3b9f9c0 RDI: 00000000ffffff9c
[  366.395708] RBP: 00005621f3b9f270 R08: 00005621f3b9fa00 R09: 0000000000000000
[  366.396744] R10: 0000000000000000 R11: 0000000000000246 R12: 00007f8524409944
[  366.397803] R13: 00000000dc531383 R14: 0000000000000000 R15: 00007f85241f66a8
```

## 尝试18.10

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=ubuntu-18.10-live-server-amd64.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

## 尝试从16.04的iso中提取启动内核安装18.04(失败)

```
dd if=/dev/zero bs=2k count=1 of=tmp.iso
dd if=ubuntu-16.04.5-server-amd64.iso bs=2k skip=1 >> tmp.iso
hdiutil attach tmp.iso
```

复制内核

```
cp /Volumes/Ubuntu-Server\ 16/install/vmlinuz ./
cp /Volumes/Ubuntu-Server\ 16/install/initrd.gz ./
```

启动内核脚本采用16.04的内核，但是安装镜像iso文件则选择18.04

```
#!/bin/bash
KERNEL="vmlinuz"
INITRD="initrd.gz"
CMDLINE="earlyprintk=serial console=ttyS0"

# Guest Config
MEM="-m 2G"
IMG_CD="-s 1,ahci-cd,ubuntu-18.04.1.0-live-server-amd64.iso"
IMG_HDD="-s 2,virtio-blk,ubuntu18.img"
NET="-s 3:0,virtio-net,en0"
PCI_DEV="-s 0:0,hostbridge -s 31,lpc"
LPC_DEV="-l com1,stdio"
ACPI="-A"

# and now run
sudo xhyve $ACPI $MEM $PCI_DEV $LPC_DEV $NET $IMG_CD $IMG_HDD -f kexec,$KERNEL,$INITRD,"$CMDLINE"
```

果然，这样启动安装可以进行，顺利见到了安装界面。但是很不幸，出现了`load addition module`无法复制问题，init之后指定复制文件不能匹配。

# 参考

* [macOS Ubuntu](https://github.com/rimusz-lab/xhyve-ubuntu)
* [Set up xhyve with Ubuntu 16.04](https://gist.github.com/mowings/f7e348262d61eebf7b83754d3e028f6c)