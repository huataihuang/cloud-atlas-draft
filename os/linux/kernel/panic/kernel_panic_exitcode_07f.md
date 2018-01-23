
虚拟机出现Kernel Panic，显示exit code是`0x7f`（127）

```
[    2.427517] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00007f00
[    2.427517] 
[    2.429668] CPU: 0 PID: 1 Comm: systemd Not tainted 3.10.0-514.26.2.el7.x86_64 #1
[    2.431437] Hardware name: Alibaba Cloud Alibaba Cloud ECS, BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
[    2.434249]  ffffffff818c9460 00000000546b98ce ffff88003da37e28 ffffffff81687133
[    2.436091]  ffff88003da37ea8 ffffffff8168053a ffffffff00000010 ffff88003da37eb8
[    2.438007]  ffff88003da37e58 00000000546b98ce ffffffff81e6c100 0000000000007f00
[    2.439875] Call Trace:
[    2.440461]  [<ffffffff81687133>] dump_stack+0x19/0x1b
[    2.441678]  [<ffffffff8168053a>] panic+0xe3/0x1f2
[    2.442867]  [<ffffffff8108c8ad>] do_exit+0xa3d/0xa40
[    2.444091]  [<ffffffff8108c92f>] do_group_exit+0x3f/0xa0
[    2.445378]  [<ffffffff8108c9a4>] SyS_exit_group+0x14/0x20
[    2.446679]  [<ffffffff81697809>] system_call_fastpath+0x16/0x1b
```

# 分析

* `systemd`不断引发Kernel Panic - `PID: 1 Comm: systemd Not tainted`

这里显示启动`init`采用了`systemd`并不断引发内核异常

观察虚拟机的VNC控制台，可以看到操作系统启动时瞬间crash，没有启动其他服务过程。

* 参考[Kernel panic - not syncing (Linux Mint 15)](https://forums.linuxmint.com/viewtopic.php?t=145252)，`exitcode=0x00007f00`可能是由于文件系统错误，可以尝试采用Live-CD启动后做fsck修复：

通过Live-CD启动系统

修复文件系统

```bash
mount  ## tells mounted medias
sudo blkid  ### tells partitions
... if your root partition is /dev/sda1 for example, run
sudo fsck -fyc /dev/sda1
... and so on
```

# core dump分析

* 从host主机可以获取到core dump

> 参考 [vmcore分析案例："kernel BUG at fs/buffer.c:1270"](../tracing/vmcore_example_bug_at_fs_buffer_c)

```bash
os_version=7
kernel_version=3.10.0-514.26.2
wget http://debuginfo.centos.org/$os_version/x86_64/kernel-debuginfo-$kernel_version.el$os_version.x86_64.rpm
rpm2cpio kernel-debuginfo-$kernel_version.el$os_version.x86_64.rpm |cpio -idv ./usr/lib/debug/lib/modules/$kernel_version.el$os_version.x86_64/vmlinux

crash ./usr/lib/debug/lib/modules/$kernel_version.el$os_version.x86_64/vmlinux /vm/corefile/vm-1_corefile
```

显示信息

```
...
     RELEASE: 3.10.0-514.26.2.el7.x86_64
     VERSION: #1 SMP Tue Jul 4 15:04:05 UTC 2017
     MACHINE: x86_64  (2499 Mhz)
      MEMORY: 1 GB
       PANIC: "Kernel panic - not syncing: Attempted to kill init! exitcode=0x00007f00"
         PID: 1
     COMMAND: "systemd"
        TASK: ffff88003da38000  [THREAD_INFO: ffff88003da34000]
         CPU: 0
       STATE:  (PANIC)
```

在`crash`调试中通过`dmesg`指令可以看到完整的启动信息，其中可以看到`Kernel Panic`之前有两行信息，显示`systemd-journald`出现的问题和`vda1`文件系统挂载有关，证实Kernel Panic确实可能和文件系统有关：

```
[    1.672693]  vda: vda1
[    1.680503] virtio-pci 0000:00:03.0: irq 28 for MSI/MSI-X
[    1.681571] virtio-pci 0000:00:03.0: irq 29 for MSI/MSI-X
[    1.681642] virtio-pci 0000:00:03.0: irq 30 for MSI/MSI-X
[    2.835832] EXT4-fs (vda1): mounted filesystem with ordered data mode. Opts: (null)
[    3.121321] systemd-journald[87]: Received SIGTERM from PID 1 (systemd).
[    3.549142] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00007f00
               
[    3.551532] CPU: 0 PID: 1 Comm: systemd Not tainted 3.10.0-514.26.2.el7.x86_64 #1
[    3.553592] Hardware name: Alibaba Cloud Alibaba Cloud ECS, BIOS rel-1.7.5-0-ge51488c-20140602_164612-nilsson.home.kraxel.org 04/01/2014
[    3.556901]  ffffffff818c9460 000000008c5cd7b9 ffff88003da37e28 ffffffff81687133
[    3.559078]  ffff88003da37ea8 ffffffff8168053a ffffffff00000010 ffff88003da37eb8
[    3.561112]  ffff88003da37e58 000000008c5cd7b9 ffffffff81e6c100 0000000000007f00
[    3.563005] Call Trace:
[    3.563621]  [<ffffffff81687133>] dump_stack+0x19/0x1b
[    3.564842]  [<ffffffff8168053a>] panic+0xe3/0x1f2
[    3.565985]  [<ffffffff8108c8ad>] do_exit+0xa3d/0xa40
[    3.567185]  [<ffffffff8108c92f>] do_group_exit+0x3f/0xa0
[    3.568484]  [<ffffffff8108c9a4>] SyS_exit_group+0x14/0x20
[    3.569793]  [<ffffffff81697809>] system_call_fastpath+0x16/0x1b
crash>
```

# 其他

* 软件包修复方法：

如果文件系统中缺少一些文件或者需要更新修复软件包，则可以采用chroot方式访问磁盘中的操作系统，然后尝试修复软件包：

挂载根文件案系统：

```bash
sudo mount /dev/sda7 /mnt
sudo mount --bind /dev /mnt/dev
sudo mount --bind /sys /mnt/sys
sudo mount --bind /proc /mnt/proc
```

chroot到磁盘上的操作系统

```bash
sudo chroot /mnt
apt-get update
apt-get upgrade
exit
```

卸载chroot环境

```
sudo umount /mnt/proc
sudo umount /mnt/sys
sudo umount /mnt/dev
sudo umount /mnt
```

# 参考

* [Kernel panic - not syncing (Linux Mint 15)](https://forums.linuxmint.com/viewtopic.php?t=145252)
* [Kernel panic - not syncing : attempted to kill int ! exit code=0x00007f00](https://askubuntu.com/questions/706349/kernel-panic-not-syncing-attempted-to-kill-int-exit-code-0x00007f00)