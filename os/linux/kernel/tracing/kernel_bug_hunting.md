内核bug报告通常包含了一个堆栈dump类似如下

```
------------[ cut here ]------------
WARNING: CPU: 1 PID: 28102 at kernel/module.c:1108 module_put+0x57/0x70
Modules linked in: dvb_usb_gp8psk(-) dvb_usb dvb_core nvidia_drm(PO) nvidia_modeset(PO) snd_hda_codec_hdmi snd_hda_intel snd_hda_codec snd_hwdep snd_hda_core snd_pcm snd_timer snd soundcore nvidia(PO) [last unloaded: rc_core]
CPU: 1 PID: 28102 Comm: rmmod Tainted: P        WC O 4.8.4-build.1 #1
Hardware name: MSI MS-7309/MS-7309, BIOS V1.12 02/23/2009
 00000000 c12ba080 00000000 00000000 c103ed6a c1616014 00000001 00006dc6
 c1615862 00000454 c109e8a7 c109e8a7 00000009 ffffffff 00000000 f13f6a10
 f5f5a600 c103ee33 00000009 00000000 00000000 c109e8a7 f80ca4d0 c109f617
Call Trace:
 [<c12ba080>] ? dump_stack+0x44/0x64
 [<c103ed6a>] ? __warn+0xfa/0x120
 [<c109e8a7>] ? module_put+0x57/0x70
 [<c109e8a7>] ? module_put+0x57/0x70
 [<c103ee33>] ? warn_slowpath_null+0x23/0x30
 [<c109e8a7>] ? module_put+0x57/0x70
 [<f80ca4d0>] ? gp8psk_fe_set_frontend+0x460/0x460 [dvb_usb_gp8psk]
 [<c109f617>] ? symbol_put_addr+0x27/0x50
 [<f80bc9ca>] ? dvb_usb_adapter_frontend_exit+0x3a/0x70 [dvb_usb]
 [<f80bb3bf>] ? dvb_usb_exit+0x2f/0xd0 [dvb_usb]
 [<c13d03bc>] ? usb_disable_endpoint+0x7c/0xb0
 [<f80bb48a>] ? dvb_usb_device_exit+0x2a/0x50 [dvb_usb]
 [<c13d2882>] ? usb_unbind_interface+0x62/0x250
 [<c136b514>] ? __pm_runtime_idle+0x44/0x70
 [<c13620d8>] ? __device_release_driver+0x78/0x120
 [<c1362907>] ? driver_detach+0x87/0x90
 [<c1361c48>] ? bus_remove_driver+0x38/0x90
 [<c13d1c18>] ? usb_deregister+0x58/0xb0
 [<c109fbb0>] ? SyS_delete_module+0x130/0x1f0
 [<c1055654>] ? task_work_run+0x64/0x80
 [<c1000fa5>] ? exit_to_usermode_loop+0x85/0x90
 [<c10013f0>] ? do_fast_syscall_32+0x80/0x130
 [<c1549f43>] ? sysenter_past_esp+0x40/0x6a
---[ end trace 6ebc60ef3981792f ]---
```

这样的堆栈跟踪提供了足够的定位内核源代码发生bug的信息。取决于问题的严重程度，它也可能包含了关键字`Oops`，类似：

```
BUG: unable to handle kernel NULL pointer dereference at   (null)
IP: [<c06969d4>] iret_exc+0x7d0/0xa59
*pdpt = 000000002258a001 *pde = 0000000000000000
Oops: 0002 [#1] PREEMPT SMP
...
```

尽管是一个Oops或者其他类型的堆栈跟踪，违规行通常对于标识和处理bug非常有用。本文中"Oops"标识所有需要分析的堆栈跟踪。

> `注意`
>
> 从2.6及以上版本内核已经不能使用`ksymoops`。请使用Oops的原始格式（从dmesg或类似获取）。应忽略所有引用文档中"解码Oops"或"通过ksymoops运行"。如果你在2.6+内核通过运行`ksymoops`来提交Oops，通常会被要求重新提交。

# Oops消息定位的位置？

通常Oops消息是从`klogd`的内核缓冲区(kernel buffers)中读取并由`syslogd`负责写入到syslog文件，通常是`/var/log/messages`（根据`/etc/syslog.conf`配置）。在使用`systemd`的系统中，可能也通过`journald`服务来存储，并通过`journalctl`命令访问。

有时候`klogd`死掉，此时可以运行`dmesg > file`来读取内核buffer的数据并保存。或者直接`cat /proc/kmsg > file`，不过你需要手工终止，因为`kmsg`是一个"never ending"文件。

如果主机很不幸crash了，此时不能输入命令或者磁盘不可访问，你有3种方式：

* 硬复制屏幕上的文本并在主机重启后输入。如果你没有规划好crash的处理，这可能是唯一的选项。(有可能使用`vesafb`驱动可以在屏幕显示更多的信息)
* 启动时附带串口（参考[Documentation/admin-guide/serial-console.rst](https://01.org/linuxgraphics/gfx-docs/drm/admin-guide/bug-hunting.html)），在另外一个主机使用null modem来捕获输出信息。
* 使用`kdump`(参考`Documentation/kdump/kdump.txt`)，通过使用dmesg `gdbmacro`(参考`Documentation/kdump/gdbmacros.txt`)从旧内存中提取kernel ring buffer。 

# 找到bug的位置

报告内核bug的最好方法是指出内核源代码文件的bug位置。有两种方法可以做到。通常，使用`gdb`较为简单，但是内核必须预先编译了debug info支持。

## gdb

GNU debug(`gdb`)是最好的从`vmlinux`文件的OOPS指出准确代码文件和行号的工具。

在编译支持`CONFIG_DEBUG_INFO`的内核，通过运行以下命令设置：

```
$ ./scripts/config -d COMPILE_TEST -e DEBUG_KERNEL -e DEBUG_INFO
```

在编译支持`CONFIG_DEBUG_INFO`的内核，可以简单复制OOPS的EIP值，例如

```
EIP:    0060:[<c021e50e>]    Not tainted VLI
```

并使用`gdb`来转换可读形式：

```
$ gdb vmlinux
(gdb) l *0xc021e50e
```

如果你没有激活`CONFIG_DEBUG_INFO`，则使用OOPS的功能偏移

```
EIP is at vt_ioctl+0xda8/0x1482
```

并且使用激活`CONFIG_DEBUG_INFO`重新编译内核

```
$ ./scripts/config -d COMPILE_TEST -e DEBUG_KERNEL -e DEBUG_INFO
$ make vmlinux
$ gdb vmlinux
(gdb) l *vt_ioctl+0xda8
0x1888 is in vt_ioctl (drivers/tty/vt/vt_ioctl.c:293).
288   {
289           struct vc_data *vc = NULL;
290           int ret = 0;
291
292           console_lock();
293           if (VT_BUSY(vc_num))
294                   ret = -EBUSY;
295           else if (vc_num)
296                   vc = vc_deallocate(vc_num);
297           console_unlock();
```

或者你希望更繁琐一些

```
(gdb) p vt_ioctl
$1 = {int (struct tty_struct *, unsigned int, unsigned long)} 0xae0 <vt_ioctl>
(gdb) l *0xae0+0xda8
```

或者，你可以使用object文件：

```
$ make drivers/tty/
$ gdb drivers/tty/vt/vt_ioctl.o
(gdb) l *vt_ioctl+0xda8
```

如果有一个call trace，例如

```
Call Trace:
 [<ffffffff8802c8e9>] :jbd:log_wait_commit+0xa3/0xf5
 [<ffffffff810482d9>] autoremove_wake_function+0x0/0x2e
 [<ffffffff8802770b>] :jbd:journal_stop+0x1be/0x1ee
 ...
```

这显示了问题可能在`:jbd:`模块，你可以加载这个模块并列出相关代码：

```
$ gdb fs/jbd/jbd.ko
(gdb) l *log_wait_commit+0xa3
```

> `注意`
>
> 也可以在stack trace上执行任何相似功能，例如

```
[<f80bc9ca>] ? dvb_usb_adapter_frontend_exit+0x3a/0x70 [dvb_usb]
```

> 则这也可以查看调用发生情况：

```
$ gdb drivers/media/usb/dvb-usb/dvb-usb.o
(gdb) l *dvb_usb_adapter_frontend_exit+0x3a
```

## objdump

要调试内核，使用`objdump`并从crash输出来查看十六进制偏移来找到代码/汇编的正确行。没有debug符号表，你需要参阅所示例程（routine shown）的汇编代码，但是如果你内核已经有debug符号表(debug symbols)，则C代码也可以显示。（Debug symbols可以在内核编译菜单的`kernel hacking`菜单中找到）。例如：

```
$ objdump -r -S -l --disassemble net/dccp/ipv4.o
```

# 实践

## EXT4文件系统`io-error-guard`

系统crash前，出现`io-error-guard: catch 1 continuous bio error.`，然后出现Oops如下

```
2017-04-08 03:34:51    [29201245.714153] io-error-guard: catch 1 continuous bio error.
2017-04-08 03:34:51    [29201245.722046] Buffer I/O error on device sdc, logical block 0
...
2017-04-08 03:34:51    [29201245.781675] BUG: unable to handle kernel NULL pointer dereference at 0000000000000008
2017-04-08 03:34:51    [29201245.790380] IP: [] netoops+0x125/0x2a0
2017-04-08 03:34:51    [29201245.796262] PGD 371206d067 PUD 1c17f34067 PMD 0 
2017-04-08 03:34:51    [29201245.801494] Oops: 0000 [#1] SMP 
...
2017-04-08 03:34:51    [29201245.941654] Pid: 21606, comm: sh Tainted: GF          ---------------    2.6.32-358.23.2.ali1233.el5.x86_64 #1 Inspur SA5212M4/YZMB-00370-109
2017-04-08 03:34:51    [29201245.955245] RIP: 0010:[]  [] netoops+0x125/0x2a0
...
2017-04-08 03:34:51    [29201246.085431] Call Trace:
2017-04-08 03:34:51    [29201246.088422]   
2017-04-08 03:34:51    [29201246.091092]  [] kmsg_dump+0x113/0x180
2017-04-08 03:34:51    [29201246.096875]  [] bio_endio+0x12a/0x1b0
2017-04-08 03:34:51    [29201246.102652]  [] req_bio_endio+0x90/0xc0
2017-04-08 03:34:51    [29201246.108601]  [] blk_update_request+0x262/0x480
2017-04-08 03:34:51    [29201246.115165]  [] blk_update_bidi_request+0x27/0x80
2017-04-08 03:34:51    [29201246.121984]  [] blk_end_bidi_request+0x2f/0x80
2017-04-08 03:34:51    [29201246.128542]  [] blk_end_request+0x10/0x20
2017-04-08 03:34:51    [29201246.134665]  [] blk_end_request_err+0x33/0x60
2017-04-08 03:34:51    [29201246.141140]  [] scsi_io_completion+0x2db/0x5b0
2017-04-08 03:34:51    [29201246.147699]  [] scsi_finish_command+0xc3/0x120
2017-04-08 03:34:51    [29201246.154258]  [] scsi_softirq_done+0x101/0x170
2017-04-08 03:34:51    [29201246.160734]  [] blk_done_softirq+0x83/0xa0
2017-04-08 03:34:51    [29201246.166944]  [] __do_softirq+0xbf/0x220
2017-04-08 03:34:51    [29201246.172895]  [] call_softirq+0x1c/0x30
2017-04-08 03:34:51    [29201246.178757]  [] do_softirq+0x65/0xa0
2017-04-08 03:34:51    [29201246.184451]  [] irq_exit+0x7c/0x90
2017-04-08 03:34:51    [29201246.189968]  [] smp_call_function_single_interrupt+0x34/0x40
2017-04-08 03:34:51    [29201246.198017]  [] call_function_single_interrupt+0x13/0x20
2017-04-08 03:34:51    [29201246.205438]   
2017-04-08 03:34:51    [29201246.208106]  [] ? wait_for_rqlock+0x24/0x40
2017-04-08 03:34:51    [29201246.214403]  [] do_exit+0x5e6/0x8d0
2017-04-08 03:34:51    [29201246.220003]  [] do_group_exit+0x41/0xb0
2017-04-08 03:34:51    [29201246.225957]  [] sys_exit_group+0x17/0x20
2017-04-08 03:34:51    [29201246.231996]  [] system_call_fastpath+0x16/0x1b
```

* 找到对应内核的debuginfo软件包 kernel-debuginfo-2.6.32-358.xxxx.el5.x86_64.rpm ，并解压出对应的`vmlinux`

```
rpm2cpio kernel-debuginfo-2.6.32-358.xxxx.el5.x86_64.rpm | cpio -idv ./usr/lib/debug/lib/modules/2.6.32-358.xxxx.el5.x86_64/vmlinux
```

* 将`vmlinux`放到源代码目录下

```
cp ./usr/lib/debug/lib/modules/2.6.32-358.xxxx.el5.x86_64/vmlinux tmp/linux-2.6.32-358.23.2.el5/
```

* 进入源代码目录，使用gdb分析

```
cd tmp/linux-2.6.32-358.23.2.el5
gdb vmlinux
```

* 转换Oops中的Call Trace中函数源代码位置

```
(gdb) l *bio_endio+0x12a
```

就可以定位到出现故障时候源代码的位置

```
0xffffffff811b292a is in bio_endio (fs/bio.c:1474).
1469				}
1470			}
1471		}
1472		spin_unlock(&eio->lock);
1473		if (sysctl_enable_bio_netoops)
1474			kmsg_dump(KMSG_DUMP_SOFT, NULL);
1475	}
1476
1477	/**
1478	 * bio_endio - end I/O on a bio
(gdb)
```

> 注意：如果使用了错误版本的源代码，会导致`gdb`定位到错误的代码（行号依然是`1484`）

## 用户虚拟机crash分析

在 [AY1307061945475866c5 crash分析](https://aone.alibaba-inc.com/issue/10613682)，用户的虚拟机crash的core文件通过`crash`工具检查可以看到`PANIC: "Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: ffffffffa016087c"`。

从 `dmesg` 日志可以看到

```
Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: ffffffffa016087c

Pid: 23983, comm: AliHids Not tainted 2.6.32-279.el6.x86_64#1
Call Trace:
 [<ffffffff814fd11a>] ? panic+0xa0/0x168
 [<ffffffff8127cdb0>] ? sprintf+0x40/0x50
 [<ffffffff8106b85b>] ? __stack_chk_fail+0x1b/0x30
```

* 准备工具

CentOS-7 执行

```
yum install rpm-build redhat-rpm-config asciidoc hmaccalc perl-ExtUtils-Embed pesign xmlto
yum install audit-libs-devel binutils-devel elfutils-devel elfutils-libelf-devel
yum install ncurses-devel newt-devel numactl-devel pciutils-devel python-devel zlib-devel
```

CentOS-6 执行

```
yum install rpm-build redhat-rpm-config asciidoc bison hmaccalc patchutils perl-ExtUtils-Embed xmlto
yum install audit-libs-devel binutils-devel elfutils-devel elfutils-libelf-devel
yum install newt-devel python-devel zlib-devel
```

* 下载CentOS源代码 - 参考 [我需要内核的源代码](https://wiki.centos.org/zh/HowTos/I_need_the_Kernel_Source)，注意将`N`或`N.YYMM`替换成对应版本好
  * CentOS-6: http://vault.centos.org/6.N/os/Source/SPackages/ 或 http://vault.centos.org/6.N/updates/Source/SPackages/
  * CentOS-7: http://vault.centos.org/7.N.YYMM/os/Source/SPackages/ 或 http://vault.centos.org/7.N.YYMM/updates/Source/SPackages/

```
mkdir -p ~/rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
echo '%_topdir %(echo $HOME)/rpmbuild' > ~/.rpmmacros
rpm -i http://vault.centos.org/6.3/os/Source/SPackages/kernel-2.6.32-279.el6.src.rpm 2>&1 | grep -v exist
```

* 解压缩和准备源代码文件

```
cd ~/rpmbuild/SPECS
rpmbuild -bp --target=$(uname -m) kernel.spec
```

* 同样下载kernel-debuginfo-2.6.32-279.el6.x86_64.rpm，解压缩vmlinux

```
rpm2cpio kernel-debuginfo-2.6.32-279.el6.x86_64.rpm | cpio -idv ./usr/lib/debug/lib/modules/2.6.32-279.el6.x86_64/vmlinux
```

# 参考

* 原文见[The Linux kernel user's and administrator's guide: Bug hunting](https://01.org/linuxgraphics/gfx-docs/drm/admin-guide/bug-hunting.html)，本文翻译自这个指南文档并补充实践记录