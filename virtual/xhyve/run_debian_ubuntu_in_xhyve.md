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

> 可能在部分和内核相关应用的运行上会有一些异常（docker？），待后续再升级改进。

* 为了能够始终访问控制台，建议使用screen来运行xhyve的终端，也就是先运行`screen`成勋再执行`xhyve`运行虚拟机，以便能够随时访问终端。

* 由于内核升级会导致虚拟机无法运行，所以需要[暂时关闭Kernel update](../../os/linux/ubuntu/install/prevent_ubuntu_kernel_upgrade)

----

## `以下是尝试安装Ubuntu 18的失败记录，待后续继续排查`

---- 


# Ubuntu 18安装（失败）

> 实践是安装Ubuntu 18 LTS版本

* xhyve使用文件作文本地磁盘，可能需要使用raw磁盘，`qcow`磁盘可能比较难以加载。

```
dd if=/dev/zero of=ubuntu18.img bs=1g count=16
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
cp /Volumes/Ubuntu-Server\ 18/casper/vmlinux .
cp /Volumes/Ubuntu-Server\ 18/casper/initrd .
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
initrd
ubuntu18.img
ubuntu-18.04.1.0-live-server-amd64.iso
vmlinuz
```

```bash
#!/bin/bash
KERNEL="vmlinuz"
INITRD="initrd"
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

运行安装脚本

```
sh install.sh
```

显示启动内核

```
[    0.000000] Linux version 4.15.0-29-generic (buildd@lgw01-amd64-057) (gcc version 7.3.0 (Ubuntu 7.3.0-16ubuntu3)) #31-Ubuntu SMP Tue Jul 17 15:39:52 UTC 2018 (Ubuntu 4.15.0-29.31-generic 4.15.18)
[    0.000000] Command line: earlyprintk=serial console=ttyS0
...
```

但是报错

```
[    0.561407] Failed to execute /init (error -2)
[    0.562123] Kernel panic - not syncing: No working init found.  Try passing init= option to kernel. See Linux Documentation/admin-guide/init.rst for guidance.
[    0.564210] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 4.15.0-29-generic #31-Ubuntu
[    0.565318] Hardware name:  BHYVE, BIOS 1.00 03/14/2014
[    0.566097] Call Trace:
[    0.566494]  dump_stack+0x63/0x8b
[    0.566989]  ? rest_init+0xa0/0xb0
[    0.567493]  panic+0xe4/0x244
[    0.567972]  ? putname+0x4c/0x60
[    0.568511]  ? rest_init+0xb0/0xb0
[    0.569018]  kernel_init+0xf0/0x110
[    0.569535]  ret_from_fork+0x35/0x40
[    0.570184] Kernel Offset: 0x10600000 from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)
[    0.571731] ---[ end Kernel panic - not syncing: No working init found.  Try passing init= option to kernel. See Linux Documentation/admin-guide/init.rst for guidance.
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