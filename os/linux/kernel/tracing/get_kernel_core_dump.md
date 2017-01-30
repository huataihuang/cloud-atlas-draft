# 快速设置内核core dump方法

> 如果你没有耐心完整阅读本文，这里有一个快速设置指南

* 安装`kexec-tools`

```
yum install kexec-tools
```

* 配置`/etc/kdump.conf`内容如下

```
path /var/crash
core_collector makedumpfile -l --message-level 1 -d 31
```

* 激活kdump在操作系统启动时启动

```
service enable kdump
```

* 如果是CentOS 6 则编辑`/boot/grub/grub.conf`配置在内核参数中添加 `crashkernel=auto` 类似如下

```
    kernel /vmlinuz-2.6.32-xxx.el6.x86_64 ro root=LABEL=/ crashkernel=auto ...
```

* 如果是CentOS 7 则编辑`/etc/default/grub`修改`GRUB_CMDLINE_LINUX`行添加 `crashkernel=auto` 类似如下

```
GRUB_CMDLINE_LINUX="crashkernel=auto ..."
```

然后还需要在CentOS 7中执行命令`grub2-mkconfig -o /boot/grub2/grub.cfg`生成配置

* 如果你遇到服务器极不稳定，需要在系统hung住时候立即crash掉系统生成kernel core dump，则需要使用NMI watchdog，则需要在内核参数中再加上 `nmi_watchdog=1` 激活watchdog（这样就不需要时时盯着服务器来手工触发core）

* 重启服务器使得以上配置生效

* 如果想手工触发kernel core dump 可以使用方法一：登录服务器使用`SysRq`方法（也可以通过串口）

```
echo 1 | sudo tee /proc/sys/kernel/sysrq
echo c | sudo tee /proc/sysrq-trigger
```
* 如果想手工触发kernel core dump 也可以使用方法二：使用unknown NMI panic

先登录到服务器上激活`unkown_nmi_panic`

```
echo 1 | sudo tee /proc/sys/kernel/unkown_nmi_panic
```

接下来就可以通过网络使用IPMI远程发送`unknown_nmi_panic`信号给服务器触发kernel core dump

```
ipmitool -I lanplus -U <username> -P <password> -H <oobip> chassis power diag
```

----

# 启用kdump

Red Hat Enterprise Linux 5 引入了 kdump，通过kexec来启动另一个完成的Linux内核到一个保留的内存区域。当发生crash的时候，第二内核接管系统并将内存页复制到crash dump指定位置。

* 安装`kexec-tools`
* 配置内核参数`crashkernel=$value` - RHEL 7可以直接使用`crashkernel=auto`

`crashkernel=`配置语法

```
crashkernel=<range1>:<size1>[,<range2>:<size2>,...][@offset]
264     range=start-[end]
```

举例：

```
crashkernel=512M-2G:64M,2G-:128M
```

以上配置表示如果内存小于512M，则不保留（这是`rescue`情况）；如果内存512M到2G(不包括2G)则保留64M；如果内存大于2G，则保留128M

举例：

```
crashkernel=64M@16M
```

以上表示系统内核保留64M内存，保留内存位置起始于`0x01000000`（16MB）来执行dump-capture kernel。

对于x86和x86_64，使用`crashkernel=64M@16M`

> 参考 [kdump.txt](https://www.kernel.org/doc/Documentation/kdump/kdump.txt)

* 确保服务器在捕获dump的时候不被中断 - HP Automated Server Recovery提供了`hpasmcli`来设置超时时间，Red Hat High Availability Add-On（Power fencing) 可以通过`fence_kdump`来隔离设备
* 重启服务器，确保`crashkernel=$value`生效
* 重启`kdump`服务并配置其自动启动

## kdump配置选项

`kdump`配置选项位于 `/etc/kdump.conf`，可以将`vmcore`本地保存或发送到网络。

* 本地选项包括使用文件系统或者raw设备可以使用如下配置

```
ext3 /dev/sda3
raw /dev/sda4
```

* 通过NFS或SSH可以使用

```
net nfs.example.com:/export/vmcores
net kdump@ssh.example.com
```

然后使用 `service kdump propogate` 来设置 SSH key

# 修改core dump存储位置

`/proc/sys/kernel/core_pattern` 设置了生成core文件的路径，参考 `man core`

```
echo '/tmp/core_%e.%p' | sudo tee /proc/sys/kernel/core_pattern
```

上述命令可以使得core文件保存在`/tmp`目录下的 `core_[program].[pid]`

# 设置sysrq和nmi

* 启用sysrq - 这个命令设置未知NMI触发panic

```
echo 1 | sudo tee /proc/sys/kernel/unknown_nmi_panic
```

* 激活 Magic SysKey - 这样可以通过键盘或串口控制台发送SysRq键（`SysRq+c`）来触发core dump

```
echo 1 | sudo tee /proc/sys/kernel/sysrq
```

* 报告所有D住进程以及完整的kernel task trace到`/var/log/messages`

```
echo w | sudo tee /proc/sysrq-trigger
```

* `实际操作只需要这一步就可以触发core dump!!!` 触发crash - 此时会生成vmcore （注意：一定要配置好kdump才能使用这个功能，否则无法生成vmcore）

```
echo c | sudo tee /proc/sysrq-trigger
```

* 也可以通过ipmi再次发送nmi（终极大招）

```
ipmitool -I lanplus -H <OOB_IP> -U <USERNAME> -P <PASSWORD> chassis power diag
```

> [排查XEN服务器hang机core dump](analysis_xen_hang_core_dump)的一个实战案例

# 操作案例

## CentOS 7 core dump

* 安装kdump工具

```
yum install kexec-tools
```

* 编辑`/etc/default/grub`（CentOS 7），在`GRUB_CMDLINE_LINUX`配置行添加`crashkernel=auto`

> 如果是CentOS6则直接编辑`/boot/grub/grub.conf`

```
GRUB_CMDLINE_LINUX="crashkernel=auto rhgb quiet"
```

> 如果要显示完整的启动消息，可以去除`rhgb quiet`

然后执行 `grub2-mkconfig -o /boot/grub2/grub.cfg` 生成grub配置。

> 参考[Setting Up grub2 on CentOS 7](https://wiki.centos.org/HowTos/Grub2)

* 配置Dump文件存放的位置 - `/etc/kdump.conf`

`kdump.conf`配置文件是在安装`kexec-tools`时候自动创建的，以下是去除了注释之后的默认配置

```
path /var/crash
core_collector makedumpfile -l --message-level 1 -d 31
```

要将dump文件存储到裸设备，例如，可以使用`raw /dev/sda5`；也可以将`path /var/crash`指向其他位置；或者使用NFS或SSH方式输出。

* 使用BtrFS存储core文件 - 参考 [Btrfs文件系统快速起步](../linux/storage/filesystem/btrfs/btrfs_startup)

```
mkfs.btrfs -f /dev/sda4
mkdir /data
mount /dev/sda4 /data
btrfs subvolume create /data/crash
echo "/dev/sda4        /var/crash    btrfs        subvol=crash,defaults,noatime    0 0" >> /etc/fstab
mkdir /var/crash
mount /var/crash
```

* 在`/etc/kdump.conf`中配置Kdump中的core collector，这是从捕获的core文件中压缩数据以及过滤掉不需要的信息非常重要的一步：

```
core_collector makedumpfile -c --message-level 1 -d 31
```

> `makedumpfile`使得`core_collector`实际通过压缩数据来创建一个较小的DUMPFILE
>
> makedumpfile提供了两种DUMPFILE格式（ELF格式和kdump-compressed格式）
>
> 默认`makedumpfile`创建的DUMPFILE使用kdump-compressed格式；`kdump-compressed`格式只能使用`crash`工具来读取，并且小于ELF格式，因为其支持压缩。
>
> ELF格式则可以使用GDB或者crash工具读取
>
> `-c`参数保湿压缩每个页面
>
> `-d`参数是不需要和可忽略的页数

* 重启 kdump

```
systemctl restart kdump
```

* 设置`kdump`默认启动 - 这步很重要，因为默认并没有启动kdump

```
sudo systemctl enable kdump
```

* 触发Core Dump

默认`SysRQ`设置值是`16`，可以通过`cat /proc/sys/kernel/sysrq`观察到。修改这个值为`1`激活`SysRq`来触发core dump

```
echo 1 > /proc/sys/kernel/sysrq
echo c > /proc/sysrq-trigger
```

此时在带外可以看到

```
[1290981.013642] SysRq : Trigger a crash
[1290981.018405] BUG: unable to handle kernel NULL pointer dereference at           (null)
[1290981.028007] IP: [<ffffffff813ed756>] sysrq_handle_crash+0x16/0x20
```

然后切换到kdump内核并进行 vmcore 存储

```
         Starting Kdump Vmcore Save Service...
[    7.200189] BTRFS info (device sda4): disk space caching is enabled

kdump: saving to /kdumproot/data//127.0.0.1-2017-01-18-23:33:42/
kdump: saving vmcore-dmesg.txt
kdump: saving vmcore-dmesg.txt complete
kdump: saving vmcore
Copying data                       : [100.0 %] \
kdump: saving vmcore complete
```

但是比较奇怪，存储在 `/kdumproot/data//127.0.0.1-2017-01-18-23:33:42` 并没有像我设置那样存储在`/var/crash`目录下(即挂载在`/data`目录下的)，而是存储在 `/data/127.0.0.1-2017-01-18-23:33:42`。看来在kdump需要直接的卷挂载，而不能dump到BtrFS的子卷上（此时可能还没有挂载子卷）

* 启用unknown NMI panic

> 注意，在使用unkonwn NMI panic触发crah的之前，同样要现如前述配置好系统kdump

```
sudo systemctl restart kdump
```

然后激活`unknown_nmi_panic`

```
echo 1 | sudo tee /proc/sys/kernel/unknown_nmi_panic
```

> 如果没有准备好kdump，则unknown nmi panic 信号收到之后只会在messages日志中记录如下几行内容，并且非常奇怪地再也不能响应unknown NMI panic信号

```
Jan 19 00:06:19 test-server kernel: Uhhuh. NMI received for unknown reason 31 on CPU 0.
Jan 19 00:06:19 test-server kernel: Do you have a strange power saving mode enabled?
Jan 19 00:06:19 test-server kernel: Dazed and confused, but trying to continue
```

* 远程通过 ipmitool 发送 unknwon nmi 给服务器，触发crash core dump

```
ipmitool -I lanplus -U <username> -P <password> -H <oobip> chassis power diag
```

此时会看到带外输出 panic 信息并立即执行了kdump

# 参考

* [Changing location of core dump](http://stackoverflow.com/questions/16048101/changing-location-of-core-dump)
* [Generating an NMI through IPMI](http://www.ibm.com/support/knowledgecenter/linuxonibm/liaai.crashdump/liaaicrashdumpnmiipmi.htm)
* [How to trigger SysRq from ipmitool and ipmiconsole using the SysRq magic keys over an HP iLO4 ?](How to trigger SysRq from ipmitool and ipmiconsole using the SysRq magic keys over an HP iLO4 ?)
* [How to do SOL (Serial Over LAN aka Console Redirection) on Dell Servers](https://www.symantec.com/connect/articles/how-do-sol-serial-over-lan-aka-console-redirection-dell-servers)
* [Creating and Evaluating Kernel Crash Dumps](http://www.admin-magazine.com/Articles/Analyzing-Kernel-Crash-Dumps)
* [Red Hat Enterprise Linux Kernel Crash Capture and Analysis](http://www.slideshare.net/PaulVNovarese/linux-crash-dump-capture-and-analysis)
* [How to use kdump for Linux Kernel Crash Analysis](http://www.thegeekstuff.com/2014/05/kdump)
* [How to analyze vmcore crash dump ? [RHEL6.6]](http://sasi1212.blogspot.com/2015/07/how-to-analyse-vmcore-crash-dump-rhel66.html)
* [Collecting and analyzing Linux kernel crashes - crash](http://www.dedoimedo.com/computers/crash.html)
* [Chapter 31. The kdump Crash Recovery Service](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Deployment_Guide/ch-kdump.html)