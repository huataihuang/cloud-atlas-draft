在维护kvm虚拟机时候，有时候需要修改vm内部文件系统内容，此时需要访问虚拟机磁盘镜像。

> 本文是对虚拟机镜像修改的一个实践，涉及`NBD`、`libguestfs`等开源工具。通过翻译加实践，了解KVM虚拟机磁盘resize的原理和实现，有助于我们理解虚拟化磁盘的底层原理。

# RHEL/CentOS 5虚拟机镜像访问

有多种方式可以访问虚拟机磁盘镜像，在RHEL 常用的方法是使用`kpartx`工具，将虚拟机文件系统作为一个loop设备，这样就可以在物理服务器上访问。`kpartx`可以从分区表撞见磁盘设备映像，每个虚拟机存储映像有一个分区表和这个文件相关。

```
yum install kpartx
```

> `警告`：在物理服务器上修改虚拟机磁盘，一定要在虚拟机offline状态下才可以操作。
> 
> **RHEL/CentOS 6和7以后，请不要使用`kpartx`，改为使用`guestfish`工具**。

* 使用`kpartx`列出分区设备映射到基于存储镜像的文件，以下案例使用的映像文件是`guest1.img`

```
kpartx -l /var/lib/libvirt/images/guest1.img
```

显示输出是

```
loop0p1 : 0 409600 /dev/loop0 63
loop0p2 : 0 10064717 /dev/loop0 409663
```

> 注意：在CentOS7上使用`kpartx -l /var/lib/libvirt/images/centos6.img`有可能无法工作，显示输出类似`loop deleted : /dev/loop2`而不是设备映像信息。

* 添加分区映像到`/dev/mapper/`下设备

```
kpartx -a /var/lib/libvirt/images/guest1.img
```

* 检查磁盘分区映射

```
ls /dev/mapper/
```

可以看到挂载的分区设备

```
loop0p1
loop0p2
```

* 然后就可以使用目录来loop设备，如果需要则创建目录

```
# mkdir /mnt/guest1
# mount /dev/mapper/loop0p1 /mnt/guest1 -o loop,ro
```

* 完成镜像的文件系统修改之后，可以去除分区映射的镜像文件连接：

```
# kpartx -d /var/lib/libvirt/images/guest1.img
```

# RHEL/CentOS 6/7 虚拟机镜像访问

> RHEL/CentOS 6提供的虚拟机镜像访问方法和 RHEL/CentOS 7是一致的，本文实践是在CentOS 7上完成

访问、修改和创建虚拟机磁盘或磁盘镜像的方式有：

* 查看或下载位于虚拟机磁盘中的文件
* 编辑或上传虚拟机磁盘中的文件
* 读写虚拟机配置
* 准备新磁盘镜像包含文件、目录、文件系统、分区、逻辑卷和其他
* 紧急救援或修复guest虚拟机启动故障或其他需要修改启动配置
* 监控虚拟机的磁盘使用
* 审计guest虚拟机的符合组织安全标准情况
* 通过克隆或修改模板来部署guest虚拟机
* 读取CD/DVD ISO或软盘磁盘镜像

> `警告`：**`永远不要`**在guest虚拟机运行或磁盘映像连接在运行虚拟机的时候使用工具写入虚拟机磁盘，甚至不要使用读模式打开这样的磁盘镜像。如果错误操作会导致guest虚拟机的磁盘损坏。工具会尝试阻止你这样误操作，然而有可能工具不能覆盖所有场景。

> `libguestfs`和它的工具集文档可参考man手册。API是通过`guestfs(3)`文档提供。`guestfish`文档在`guestfish(1)`，虚拟工具则在各自的man手册，例如`virt-df(1)`。有关troubleshooting，请参考[libguestfs Troubleshooting](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/sect-Troubleshooting-libguestfs_troubleshooting.html)

# 使用远程连接的注意点

一些RHEL 7的virt命令允许你远程访问libvirt连接，但是在RHEL 7上的`libguestfs`则不能访问远程`libvirt` guest的磁盘，并且并且类似使用远程URL的指令都不能工作，例如：

```
virt-df -c qemu://remote/system -d Guest
```

然而，从RHEL 7开始，`libguestfs`可以通过`NBD`访问远程磁盘源。也就是能够通过`qemu-nbd`命令访问远程主机磁盘，并通过`nbd://` URL来访问磁盘。不过要注意远程服务器开启防火墙允许访问端口`10809`。

具体操作案例如下（以下是实践经验，补充了原文档中缺少的一些细节（需要指定`--format=raw`的nbd磁盘格式），详细请参考[使用libguestfs+NBD远程访问磁盘镜像](libguestfs_nbd_remote_access_image)）

* 远程系统启动nbd，此时`qemu-nbd`运行在前台，打开了服务等待客户端连接（不返回桌面）

```
qemu-nbd -t /var/lib/libvirt/images/centos6.img
```

* 本地系统(可以在kvm虚拟机中安装`libguestfs-tools`工具包)先启动`libvirtd`

```
systemctl start libvirtd
```

* 本地系统执行如下命令

```
virt-df --format=raw -a nbd://192.168.122.1
```

> `注意`：一定要使用`--format=raw` - 虽然远程主机上`centos6.img`实际是`qcow2`格式，但是`qemu-nbd`是使用`raw`方式打开该文件的，所以参数是`--format=raw`，否则会报告磁盘格式不正确

此时就可以在本地系统看到远程输出的`nbd`磁盘的详细空间信息输出，例如：

```
192.168.122.1:/dev/vg_centos6/lv_root
                                       8649736    2475860    5711440   29%
```

此时就可以使用以下`libguestfs`命令：

```
guestfish
guestmount
virt-alignment-scan
virt-cat
virt-copy-in
virt-copy-out
virt-df
virt-edit
virt-filesystems
virt-inspector
virt-ls
virt-rescue
virt-sysprep
virt-tar-in
virt-tar-out
virt-win-reg
```

# libguestfs概念

* `libguestfs (GUEST FileSystem LIBrary)` - 底层C库提供了基本点打开磁盘镜像，读取和写入文件等等基本功能。可以编写C程序来访问API
* `guestfish (GUEST Filesystem Interactive SHell` - 交互的shell用于在命令行或者shell脚本使用。`guestfish`输出了libguestfs API所有的功能。
* 许多virt工具都基于`libguestfs`，提供了执行特定单一任务的命令行方法。工具包括`virt-df`，`virt-rescue`，`virt-resize`和`virt-edit`。
* `augeas`是用于编辑Linux配置文件的库，虽然这个库和`libguestfs`是相互独立的，但是很多`libguestfs`都结合了这个工具。
* `guestmount`是一个结合`libguestfs`和`FUSE`的接口，主要用于在物理服务器上挂载磁盘镜像的文件系统。这个功能不是必须的，但是非常有用。

# 安装`libguestfs`

安装`libguestfs`,`guestfish`和`libguestfs`工具，及`guestmount`:

```
yum install libguestfs libguestfs-tools libguestfs-winsupport
```

要安装`libguestfs`相关软件包，包括语言绑定，使用如下命令：

```
yum install "*guestf*"
```

# `guestfish` SHELL

`guestfish`是命令行或者shell脚本中用于访问guest虚拟机文件系统的交互shell。这个shell提供了所有`libguestfs` API的功能。

> 以下案例以`centos6.img`为案例实践

要查看或编辑虚拟机磁盘镜像，输入如下命令：

```
guestfish --ro -a /var/lib/libvirt/images/centos6.img
```

这里`--ro`表示以只读方式打开磁盘镜像。这个模式总是安全的但是不允许写入操作。只有在`确定`guest虚拟机么有运行或磁盘镜像没有连接到运行中的guest虚拟机时才可以省略这个参数。`绝不可以`使用libguestfs来编辑运行中guest虚拟机，否则会导致不可逆转的虚拟磁盘损坏。

这里磁盘文件路径可以是一个文件，或者物理主机逻辑卷（例如`/dev/VG/LV`），物理主机设备（`/dev/cdrom`）或SAN LUN（`/dev/sdf3`）。

> **注意**
>
> `libguestfs`和`guestfish`不需要root权限，只需要确保磁盘镜像具有读写权限即可。

上述交互模式启动`guestfish`会提示

```
Welcome to guestfish, the guest filesystem shell for
editing virtual machine filesystems and disk images.

Type: 'help' for help on commands
      'man' to read the manual
      'quit' to quit the shell

><fs>
```

在这个提示符下，输入`run`命令来初始化库以及连接磁盘镜像。首次运行可能会花费30秒钟时间，后续则完成快很多。

> **注意**
>
> `libguestfs`使用硬件虚拟化加速，例如KVM(如果有的话)来加速处理进程。

> `guestfish`的提示符是`><fs>`，后续案例中，这个提示符请不要在命令行输入，只表示该行是输入的命令。

一旦`run`命令执行完成，其他命令就可以使用。

## 使用`guestfish`查看文件系统

### 手工列出和查看

`list-filesystems`将列出`libguestfs`找到的文件系统：

```
><fs> list-filesystems
/dev/sda1: ext4
/dev/vg_centos6/lv_root: ext4
/dev/vg_centos6/lv_swap: swap
```

其他有用的命令是`list-devices`，`list-partitions`，`lvs`，`pvs`，`vfs-type`和`file`。可以通过`help COMMAND`来查看详细的帮助：

```
><fs> list-devices
/dev/sda

><fs> list-partitions
/dev/sda1
/dev/sda2

><fs> lvs
/dev/vg_centos6/lv_root
/dev/vg_centos6/lv_swap

><fs> pvs
/dev/sda2

><fs> vfs-type /dev/sda1
ext4

><fs> vfs-type /dev/sda2
LVM2_member
```

要查看一个文件系统的实际内容，该文件系统必须被挂载。

可以使用`guestfish`命令如`ls`，`ll`，`cat`等

> `注意`
>
> 在`guestfish`中没有当前工作目录这个概念。和原始的shell不同，不能使用`cd`命令更改目录。所有路径必须是从顶部开始带有一个`/`字符的完全路径。可以使用`TAB`键来补完路径。

要退出`guestfish` ，可以输入`exit`或者`Ctrl+d`。

### 通过`guestfish`检查(inspection)

除了手工列出和挂载文件系统，可以可以使用`guestfish`自身检查镜像和挂载文件系统，就像是在guest虚拟机内部操作一样。要实现检查，在命令行添加一个`-i`参数：

```
guestfish --ro -a /var/lib/libvirt/images/centos6.img -i
```

这里和没有`-i`参数的情况相比，多了以下提示：

```
Operating system: CentOS release 6.9 (Final)
/dev/vg_centos6/lv_root mounted on /
/dev/sda1 mounted on /boot

><fs>
```

> 此时磁盘镜像已经和guest虚拟机内部一样挂载好了文件系统，可以直接检查`/`就相当于检查guest虚拟机内部的`/`文件系统。

```
><fs> ll /
total 114
dr-xr-xr-x. 22 root root  4096 Apr 14 04:07 .
drwxr-xr-x  19 root root  4096 Apr 18 01:59 ..
-rw-r--r--.  1 root root     0 Apr 14 04:07 .autofsck
dr-xr-xr-x.  2 root root  4096 Apr 11 14:00 bin
dr-xr-xr-x.  5 root root  1024 Apr 11 12:59 boot
drwxr-xr-x.  2 root root  4096 Apr 11 12:54 dev
...
```

由于`guestfish`需要启动`libguestfs`后端来执行检查和挂载，所以当使用`-i`的时候不再需要执行`run`命令。这个`-i`参数可以用于大多数常用Linux guest虚拟机。

### 通过名字访问guest虚拟机

guest虚拟机可以通过指定和libvirt相同虚拟机名字的命令来访问（也就是通过`virsh list --all`查看的虚拟机名字）。使用`-d`参数来通过虚拟机名字访问磁盘设备，此时可以使用`-i`选项也可以不使用。

```
guestfish --ro -d centos6 -i
```

上述通过指定虚拟机名字方法访问虚拟机磁盘可以直接等同启动虚拟机访问磁盘文件系统。

### 使用`guestfish`添加文件

要使用`guestfish`添加一个文件，需要使用完整的URI。被访问的虚拟机磁盘文件必须是本地文件，或者是一个网络块设备（NBD）或者一个远程块设备(RBD)。

以下是一些URI例子，对于本地文件，使用`///`：

```
guestfish -a disk.img
guestfish -a file:///directory/disk.img
guestfish -a nbd://example.com[:port]
guestfish -a nbd://example.com[:port]/exportname
guestfish -a nbd://?socket=/socket
guestfish -a nbd:///exportname?socket=/socket
guestfish -a rbd:///pool/disk
guestfish -a rbd://example.com[:port]/pool/disk 
```

### 使用`guestfish`修改文件

要针对一个guest虚拟机修改文件，创建目录或者其他修改，首先必须确保虚拟机是关闭状态的。使用`guestfish`编辑或修改运行中的磁盘将导致磁盘损坏。当确定了guest虚拟机已经关闭，则可以不使用`--ro`参数：

```
guestfish -d centos6 -i
```

此时可以直接使用`vi`来编辑修改文件，例如

```
><fs> ls /boot/grub/menu.lst
```

### 其他`guestfish`命令

和虚拟机中操作文件系统类似，可以直接格式化文件系统，创建分区，创建和调整LVM逻辑卷，使用名林类似 `mkfs`，`part-add`，`lvresize`，`lvcreate`，`vgcreate`和`pvcreate`。

### 在Shell脚本中使用guestfish

在熟悉了`guestfish`交互命令之后，可以按需将其加入shell脚本。一下是一个简单的在guest虚拟机增加新MOTD(message of the day)：

```
#!/bin/bash -
set -e
guestname="$1"

guestfish -d "$guestname" -i <<'EOF'
  write /etc/motd "Welcome to Acme Incorporated."
  chmod 0644 /etc/motd
EOF
```

### Augeas 和 `libguestfs` 脚本

结合Augeas使用`libguestfs`可以方便编写操作Linux guest虚拟机配置的脚本。例如，以下脚本使用Augeas来准备guest虚拟机的键盘配置，并且打印输出键盘布局。注意，这个脚本只适合工作在运行Red Hat Enterprise Linux的虚拟机：

```
#!/bin/bash -
 set -e
 guestname="$1"

 guestfish -d "$1" -i --ro <<'EOF'
   aug-init / 0
   aug-get /files/etc/sysconfig/keyboard/LAYOUT
 EOF
```

Augeas也可以用来修改配置文件，可以用来修改键盘布局：

```
#!/bin/bash -
 set -e
 guestname="$1"

 guestfish -d "$1" -i <<'EOF'
   aug-init / 0
   aug-set /files/etc/sysconfig/keyboard/LAYOUT '"gb"'
   aug-save
 EOF
```

注意上述连个脚本的3个修改之处：

* `--ro`选项在第二个案例中去除，这样就可以写入guest虚拟机
*  `aug-get`命令被修改成`aug-set`来修改值而不是获取只。此时新的"gb"值写入。
* `aug-save`命令将修改写入磁盘

以下案例创建磁盘镜像：

```
guestfish -N fs
```

或者从磁盘镜像复制整个目录

```
><fs> copy-out /home /tmp/home
```

## 其他命令

以下命令是简化等同于`guestfish`来查看和修改guest虚拟机磁盘镜像：

* `virt-cat`是模拟`guestfish`的`download`命令。该命令下载和显示一个简单的文件。例如：

```
virt-cat RHEL3 /etc/ntp.conf | grep ^server
```

* `virt-edit`是模拟`guestfish`的`edit`命令，用于和guest虚拟机的单个文件交互。例如，需要修改Linux虚拟机的`grub.conf`配置

```
virt-edit LinuxGuest /boot/grub/grub.conf
```

`virt-edit`还有一个简单的非交互方式修改文件。也就是使用`-e`参数，例如，以下命令修改(去除)Linux guest虚拟机的root密码：

```
virt-edit LinuxGuest /etc/passwd -e 's/^root:.*?:/root::/'
```

* `virt-ls`是模拟`guestfish`的`ls`命令，`ll`以及`find`命令，用于递归显示目录。例如，以下命令将递归列出files和`/home`目录下目录：

```
virt-ls -R LinuxGuest /home/ | less
```

## `virt-rescue`: 救援shell

`virt-rescue`可以视为类似虚拟机的救援CD。它可以启动虚拟机进入救援shell，这样就可以修复虚拟机错误。

在`virt-rescue`和`guestfish`有部分功能充电。重要的区别是不同的使用方式，`virt-rescue`是交互方式，`ad-hoc`修改使用原始的Linux文件系统工具。`virt-rescue`不能脚本化，主要适用于在guest虚拟机故障时候修复。

### 运行`virt-rescue`

> 这里案例使用`centos6`

在针对guest虚拟机使用`virt-rescue`前，确保guest虚拟机没有运行，否则磁盘会发生损坏。在确定guest虚拟机没有运行后，可以输入如下命令：

```
virt-rescue -d centos6
```

> 这里`centos6`是libvirt识别的虚拟机的名字，作为举例

这里会看到系统启动了一个救援Linux系统，可以使用很多Linux工具，就像启动了一个救援CD一样。注意，这时的根目录是rescue系统，还需要手工挂载虚拟机磁盘到`/sysroot`目录下处理

```
virt-rescue: warning: virt-rescue doesn't work with the libvirt backend
at the moment.  As a workaround, forcing backend = 'direct'.
supermin: mounting /proc
supermin: ext2 mini initrd starting up: 5.1.16 glibc
Starting /init script ...
starting version 219
specified group 'input' unknown
[    0.796109] intel_rapl: no valid rapl domains found in package 0
Cannot find device "eth0"
Cannot find device "eth0"
RTNETLINK answers: Network is unreachable
mdadm: No arrays found in config file or automatically
  WARNING: Failed to connect to lvmetad. Falling back to device scanning.
  2 logical volume(s) in volume group "vg_centos6" now active
/init: line 136: ldmtool: command not found

------------------------------------------------------------

Welcome to virt-rescue, the libguestfs rescue shell.

Note: The contents of / are the rescue appliance.
You have to mount the guest's partitions under /sysroot
before you can examine them.

><rescue>
```

可以使用`df`命令

```
><rescue> df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            96M  116K   96M   1% /run
/dev            236M     0  236M   0% /dev
```

可以使用`fdisk`命令显示磁盘

```
><rescue> fdisk -l

Disk /dev/sda: 10.7 GB, 10737418240 bytes, 20971520 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x0007a2ab

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     1026047      512000   83  Linux
/dev/sda2         1026048    20971519     9972736   8e  Linux LVM

Disk /dev/sdb: 4294 MB, 4294967296 bytes, 8388608 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/vg_centos6-lv_root: 9135 MB, 9135194112 bytes, 17842176 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/vg_centos6-lv_swap: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes

><rescue>
```

现在我们可以非常方便地将虚拟机磁盘挂载到`/sysroot`下，进行下一步排查

```
><rescue> mount /dev/mapper/vg_centos6-lv_root /sysroot/

><rescue> df -h
Filesystem                      Size  Used Avail Use% Mounted on
tmpfs                            96M  116K   96M   1% /run
/dev                            236M     0  236M   0% /dev
/dev/mapper/vg_centos6-lv_root  8.3G  2.4G  5.5G  31% /sysroot
```

* `virt-rescure`还支持很多命令选项，特别有用的是：
  * `--ro` - 只读模式操作虚拟机，这样就不会误修改虚拟机，特别是只做检查。当退出时，所有修改都会放弃。
  * `--network` - 激活rescue shell的网络访问，这样就可以下载或通过网络复制文件。

## `virt-df`: 监视磁盘使用

`virt-df`命令特别适合在物理服务器上直接检查虚拟机内部的磁盘使用率，这样就不用ssh登录到虚拟机内部就可以检查磁盘使用情况。

```
virt-df -h -a /var/lib/libvirt/images/centos6.img
```

> `-h` 选项类似 `df` 命令的`-h`选项，表示`human-readable`模式，方便查看
>
> 也可以使用`-i`参数显示inode

显示输出类似

```
Filesystem                                Size       Used  Available  Use%
centos6.img:/dev/sda1                     476M        39M       408M    9%
centos6.img:/dev/vg_centos6/lv_root       8.2G       2.4G       5.4G   29%
```

> `注意`
>
> 使用`virt-df`命令对于运行中的虚拟机也是安全的，因为它是只读访问。不过，对于运行时的虚拟机执行`virt-df`每次看到的磁盘使用情况会轻微不同。

`virt-df`是设计用来集成监控工具的。允许系统管理员生成磁盘使用率的报告。并且支持`CSV`格式输出方便后续集成到程序中分析

```
virt-df --csv -d centos6
```

## `virt-resize`：离线改变guest虚拟机磁盘大小

`virt-resize`是一个扩展或收缩guest虚拟机磁盘的工具。这个工具只能在虚拟机offline（关闭）时使用。`virt-resize`工作时会复制guest虚拟磁盘镜像并保留原始镜像不修改。这样就可以将原始镜像作为备份，不过这样需要平衡占用两倍磁盘空间。

### 扩展磁盘镜像

> 这里案例使用`centos6`虚拟机完成

* 首先通过`virsh dumpxml centos6`查看libvirt中guest虚拟机的磁盘位置

```
virsh dumpxml centos6
```

输出显示磁盘文件

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/centos6.img'/>
      <target dev='hda' bus='ide'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
```

可以看到磁盘文件是 `/var/lib/libvirt/images/centos6.img`

* 检查虚拟磁盘使用情况：使用`virt-df -h`和`virt-filesystems`来检查虚拟机磁盘

```
virt-df -h -a /var/lib/libvirt/images/centos6.img
```

输出显示

```
Filesystem                                Size       Used  Available  Use%
centos6.img:/dev/sda1                     476M        39M       408M    9%
centos6.img:/dev/vg_centos6/lv_root       8.2G       2.4G       5.4G   29%
```

```
virt-filesystems -a /var/lib/libvirt/images/centos6.img --all --long -h
```

输出显示

```
Name                    Type       VFS  Label MBR Size Parent
/dev/sda1               filesystem ext4 -     -   500M -
/dev/vg_centos6/lv_root filesystem ext4 -     -   8.5G -
/dev/vg_centos6/lv_swap filesystem swap -     -   1.0G -
/dev/vg_centos6/lv_root lv         -    -     -   8.5G /dev/vg_centos6
/dev/vg_centos6/lv_swap lv         -    -     -   1.0G /dev/vg_centos6
/dev/vg_centos6         vg         -    -     -   9.5G /dev/sda2
/dev/sda2               pv         -    -     -   9.5G -
/dev/sda1               partition  -    -     83  500M /dev/sda
/dev/sda2               partition  -    -     8e  9.5G /dev/sda
/dev/sda                device     -    -     -   10G  -
```

#### 扩展磁盘（raw格式）

> 第一次实践时，使用了`truncate`命令构建新的虚拟磁盘，则`virt-resize`之后虚拟机磁盘就不再是`qcow2`格式，相应还要修改`centos6`虚拟机定义（`virsh edit centos6`），否则无法进一步使用`guestfish`和启动个虚拟机。
>
> 第二次实践，改为使用`qemu-img`命令来扩展虚拟机磁盘镜像，这样新的虚拟磁盘镜像格式不变，依然是`qcow2`，就没有这个问题。见后文！

* 先将源磁盘文件镜像重命令

```
mv /var/lib/libvirt/images/centos6.img /var/lib/libvirt/images/centos6.img-origin
```

* 使用`truncate`命令构建一个新的虚拟磁盘(注意：这个磁盘镜像格式是`raw`)

****

```
truncate -s 15G /var/lib/libvirt/images/centos6.img
```

* 使用`virt-reize`从备份的源镜像`centos6.img-old`扩展成新镜像`centos6.img`

```
virt-resize /var/lib/libvirt/images/centos6.img-origin /var/lib/libvirt/images/centos6.img --expand /dev/sda2 --LV-expand /dev/vg_centos6/lv_root
```

输出显示成功完成磁盘扩展(这里我们扩展了虚拟内部LVM卷的`/dev/vg_centos6/lv_root`)

```
[   0.0] Examining /var/lib/libvirt/images/centos6.img-old
**********

Summary of changes:

/dev/sda1: This partition will be left alone.

/dev/sda2: This partition will be resized from 9.5G to 14.5G.  The LVM PV
on /dev/sda2 will be expanded using the 'pvresize' method.

/dev/vg_centos6/lv_root: This logical volume will be expanded to maximum
size.  The filesystem ext4 on /dev/vg_centos6/lv_root will be expanded
using the 'resize2fs' method.

**********
[   3.0] Setting up initial partition table on /var/lib/libvirt/images/centos6.img
[   3.3] Copying /dev/sda1
 100% ⟦▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒⟧ 00:00
[   8.6] Copying /dev/sda2
 100% ⟦▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒⟧ 00:00
[  55.6] Expanding /dev/sda2 using the 'pvresize' method
[  55.6] Expanding /dev/vg_centos6/lv_root using the 'resize2fs' method

Resize operation completed with no errors.  Before deleting the old disk,
carefully check that the resized disk boots and works correctly.
```

* 检查验证磁盘镜像

```
qemu-img info /var/lib/libvirt/images/centos6.img
```

显示磁盘15G

```
image: /var/lib/libvirt/images/centos6.img
file format: raw
virtual size: 15G (16106127360 bytes)
disk size: 2.5G
```

> `注意`：如果使用了`truncate`命令构建一个新的虚拟磁盘，会导致新的磁盘镜像是`raw`格式，就需要修订`virsh edit centos6`将磁盘类型修改成`raw`类似

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='raw'/>
      <source file='/var/lib/libvirt/images/centos6.img'/>
      <target dev='hda' bus='ide'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
```

否则会导致启动`guestfish -d centos6`再次尝试attach磁盘时候报错

```
libguestfs: error: could not create appliance through libvirt.

Try running qemu directly without libvirt using this environment variable:
export LIBGUESTFS_BACKEND=direct

Original error from libvirt: internal error: process exited while connecting to monitor: 2017-04-19T08:07:53.468712Z qemu-kvm: -drive file=/var/lib/libvirt/images/centos6.img,format=qcow2,if=none,id=drive-scsi0-0-0-0,cache=writeback: could not open disk image /var/lib/libvirt/images/centos6.img: Image is not in qcow2 format [code=1 int1=-1]
```

再次检查虚拟磁盘是否扩容成15G

```
virt-filesystems -a /var/lib/libvirt/images/centos6.img --all --long -h
```

输出显示虚拟磁盘内部LVM卷已经扩展成15G

```
Name                    Type       VFS  Label MBR Size Parent
/dev/sda1               filesystem ext4 -     -   500M -
/dev/vg_centos6/lv_root filesystem ext4 -     -   14G  -
/dev/vg_centos6/lv_swap filesystem swap -     -   1.0G -
/dev/vg_centos6/lv_root lv         -    -     -   14G  /dev/vg_centos6
/dev/vg_centos6/lv_swap lv         -    -     -   1.0G /dev/vg_centos6
/dev/vg_centos6         vg         -    -     -   15G  /dev/sda2
/dev/sda2               pv         -    -     -   15G  -
/dev/sda1               partition  -    -     83  500M /dev/sda
/dev/sda2               partition  -    -     8e  15G  /dev/sda
/dev/sda                device     -    -     -   15G  -
```

> 这里有个疑问`sda1+sda2=15.5G`，大于`sda`的15G?

```
dev/sda1               partition  -    -     83  500M /dev/sda
/dev/sda2               partition  -    -     8e  15G  /dev/sda
/dev/sda                device     -    -     -   15G  -
```

实际启动虚拟机后验证，在虚拟机内部通过`lvdisplay`可以看到`/dev/vg_centos6/lv_root`的`LV Size                13.51 GiB`。

> 使用`virt-resize`指令扩展虚拟机磁盘大小以及

> `注意`
>
> 如果是LVM卷作为虚拟机的磁盘，则先创建一个大于现有LVM逻辑卷的LVM卷，然后通过`virt-resize`将原先的卷复制扩展到新的卷上实现虚拟机磁盘扩展，详细可参考RHEL手册[virt-resize: Resizing Guest Virtual Machines Offline](virt-resize: Resizing Guest Virtual Machines Offline)，原理是相同的。

#### 扩展磁盘（qcow2格式）

前述使用`truncate`命令构建一个新的虚拟磁盘后，导致`virt-resize`新的磁盘镜像是`raw`格式。现在改为保留原有`qcow2`格式再次做磁盘resize。使用命令`qemu-img resize`命令可以直接调整`qcow2`磁盘大小。

* 先将源磁盘文件镜像备份/重命名(这里重新执行扩展操作，假设前一个扩展raw格式磁盘没有操作过，全新开始，所以这里`centos6.img`还是最初原始的`qcow2`磁盘)，这个备份是要作为后续`virt-resize`的源数据盘的

```
mv /var/lib/libvirt/images/centos6.img /var/lib/libvirt/images/centos6.img-origin
```

* 使用`qemu-img`创建一个新的空`qcow2`磁盘映像文件

```
qemu-img create -f qcow2 /var/lib/libvirt/images/centos6.img 15G
```

输出显示

```
Formatting '/var/lib/libvirt/images/centos6.img', fmt=qcow2 size=16106127360 encryption=off cluster_size=65536 lazy_refcounts=off
```

> 也可以先从`centos6.img-origin`复制一个`centos6.img`出来，然后再使用`qemu-img resize`调整大小。不过这个复制过程很缓慢。既然`virt-resize`就是从`centos6.img-origin`为基础resize到新的磁盘镜像，不如先创建一个空的`qcow2`磁盘镜像再使用`virt-resize`。

* 检查验证虚拟磁盘镜像

```
qemu-img info /var/lib/libvirt/images/centos6.img
```

显示`qcow2`文件虚拟容量15G，实际目前是空的稀疏文件，所以只占用了`196K`空间

```
image: /var/lib/libvirt/images/centos6.img
file format: qcow2
virtual size: 15G (16106127360 bytes)
disk size: 196K
cluster_size: 65536
Format specific information:
    compat: 1.1
    lazy refcounts: false
```

* 检查`centos6.img-origin`磁盘分区，确定我们要扩展的分区（LVM卷）

```
virt-filesystems -a /var/lib/libvirt/images/centos6.img-origin --all --long -h
```

输出显示

```
Name                    Type       VFS  Label MBR Size Parent
/dev/sda1               filesystem ext4 -     -   500M -
/dev/vg_centos6/lv_root filesystem ext4 -     -   8.5G -
/dev/vg_centos6/lv_swap filesystem swap -     -   1.0G -
/dev/vg_centos6/lv_root lv         -    -     -   8.5G /dev/vg_centos6
/dev/vg_centos6/lv_swap lv         -    -     -   1.0G /dev/vg_centos6
/dev/vg_centos6         vg         -    -     -   9.5G /dev/sda2
/dev/sda2               pv         -    -     -   9.5G -
/dev/sda1               partition  -    -     83  500M /dev/sda
/dev/sda2               partition  -    -     8e  9.5G /dev/sda
/dev/sda                device     -    -     -   10G  -
```

* 使用`virt-resize`从`centos6.img-origin`为基础扩展到新的`centos6.img`磁盘文件

```
virt-resize /var/lib/libvirt/images/centos6.img-origin /var/lib/libvirt/images/centos6.img --expand /dev/sda2 --LV-expand /dev/vg_centos6/lv_root
```

提示信息

```
[   0.0] Examining /var/lib/libvirt/images/centos6.img-origin
**********

Summary of changes:

/dev/sda1: This partition will be left alone.

/dev/sda2: This partition will be resized from 9.5G to 14.5G.  The LVM PV
on /dev/sda2 will be expanded using the 'pvresize' method.

/dev/vg_centos6/lv_root: This logical volume will be expanded to maximum
size.  The filesystem ext4 on /dev/vg_centos6/lv_root will be expanded
using the 'resize2fs' method.

**********
[   2.8] Setting up initial partition table on /var/lib/libvirt/images/centos6.img
[   3.0] Copying /dev/sda1
 100% ⟦▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒⟧ 00:00
[   8.2] Copying /dev/sda2
 100% ⟦▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒⟧ 00:00
[  44.0] Expanding /dev/sda2 using the 'pvresize' method
[  44.0] Expanding /dev/vg_centos6/lv_root using the 'resize2fs' method

Resize operation completed with no errors.  Before deleting the old disk,
carefully check that the resized disk boots and works correctly.
```

* 验证扩容后的`centos6.img`镜像：

```
qemu-img info /var/lib/libvirt/images/centos6.img

virt-filesystems -a /var/lib/libvirt/images/centos6.img --all --long -h
```

验证和原始磁盘镜像`centos6.img-origin`一致。

## `virt-inspector`: 诊断guest虚拟机

`virt-inspector`是一个诊断磁盘镜像检查使用的是哪种操作系统。该工具包含在`libguestfs-tools`软件包中。

### 运行`virt-inspector`

`virt-inspector`可以针对磁盘镜像或者虚拟机

```
virt-inspector -a /var/lib/libvirt/images/centos6.img > report.xml

virt-inspector -d centos6 > report.xml
```

`report.xml`内容类似

```
<?xml version="1.0"?>
<operatingsystems>
  <operatingsystem>
    <root>/dev/vg_centos6/lv_root</root>
    <name>linux</name>
    <arch>x86_64</arch>
    <distro>centos</distro>
    <product_name>CentOS release 6.9 (Final)</product_name>
    <major_version>6</major_version>
    <minor_version>9</minor_version>
    <package_format>rpm</package_format>
    <package_management>yum</package_management>
    <hostname>centos6</hostname>
    <format>installed</format>
    <mountpoints>
      <mountpoint dev="/dev/vg_centos6/lv_root">/</mountpoint>
      <mountpoint dev="/dev/sda1">/boot</mountpoint>
    </mountpoints>
    <filesystems>
      <filesystem dev="/dev/sda1">
        <type>ext4</type>
        <uuid>9c30133a-6c16-4d8c-9486-e52b1eaa5f22</uuid>
      </filesystem>
...
```


RHEL 7有一个`xpath`命令行工具(位于`perl-XML-XPath.noarch`软件包中)可以用来解读xml

```
virt-inspector -d centos6 | xpath //filesystem/@dev
```

输出显示

```
Found 3 nodes:
-- NODE --
 dev="/dev/sda1"-- NODE --
 dev="/dev/vg_centos6/lv_root"-- NODE --
 dev="/dev/vg_centos6/lv_swap"
```

# 参考

* [RHEL 5 Virtualization Guide: Accessing data from a guest disk image](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/5/html/Virtualization/sect-Virtualization-Troubleshooting_Xen-Accessing_data_on_guest_disk_image.html) - RHEL 5文档关于离线修改guest文件系统
* [RHEL 6 Virtualization Administration Guide: Guest Virtual Machine Disk Access with Offline Tools](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Virtualization_Administration_Guide/chap-Virtualization_Administration_Guide-Guest_Disks_libguestfs.html) - RHEL 6文档 关于离线修改guest磁盘
* [RHEL 7 Virtualization Deployment and Administration Guide: Guest Virtual Machine Disk Access with Offline Tools](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Virtualization_Deployment_and_Administration_Guide/chap-Guest_virtual_machine_disk_access_with_offline_tools.html) - RHEL 7文档 关于离线修改guest磁盘
* [Resizing a QEMU KVM Linux image using virt-resize in CentOS 6.4](https://dnaeon.github.io/resizing-a-kvm-disk-image-on-lvm-the-easy-way/)
* [virt-resize –shrink now works](https://rwmj.wordpress.com/2010/09/27/virt-resize-shrink-now-works/)
* [How to Resize a qcow2 Image and Filesystem with Virt-Resize](https://fatmin.com/2016/12/20/how-to-resize-a-qcow2-image-and-filesystem-with-virt-resize/)