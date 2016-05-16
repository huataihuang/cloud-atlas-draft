
当 `mpt2sas` SAS卡连接的磁盘设备出现故障，会在 `/var/log/kern` 中看到类似如下报错

```bash
Feb 15 20:05:28 host1.example.com kernel: : mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: timing out command, waited 360s
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] Unhandled error code
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] Result: hostbyte=DID_BUS_BUSY driverbyte=DRIVER_OK
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] CDB: Write(10): 2a 00 93 9d de ff 00 00 08 00
Feb 15 20:05:28 host1.example.com kernel: : end_request: I/O error, dev sdl, sector 2476596991
Feb 15 20:05:28 host1.example.com kernel: : mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: timing out command, waited 360s
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] Unhandled error code
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] Result: hostbyte=DID_BUS_BUSY driverbyte=DRIVER_OK
Feb 15 20:05:28 host1.example.com kernel: : sd 0:0:11:0: [sdl] CDB: Write(10): 2a 00 b2 c8 c5 e7 00 00 08 00
Feb 15 20:05:28 host1.example.com kernel: : end_request: I/O error, dev sdl, sector 2999502311
```

此时需要检查和处理磁盘 `/dev/sdl` ，将该磁盘对应的文件系统挂载卸除（如果仍然有io，还需要通过 `lsiutil` 将磁盘`offline`）

首先检查磁盘io，确定故障磁盘是否存在磁盘读写，具体数值见 `avgqu-sz`

输入`iostat`命令

```bash
$iostat -xm 1 /dev/sdl
```

输出显示

```bash
Linux 2.6.32.36xen (host1.example.com) 	02/15/2016 	_x86_64_	(8 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           6.11    0.11   11.13    4.02    0.57   78.06

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sdl               0.19    54.14    3.40    6.05     0.26     0.24   107.94     0.01    3.78    5.50    2.82   3.83   3.62

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.48    0.92    5.59   17.06    0.21   73.74

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sdl               0.00     0.00    0.00    0.00     0.00     0.00     0.00    42.00    0.00    0.00    0.00   0.00 100.00

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           4.18    0.81    7.91   21.98    0.22   64.91
```

> 上述输出显示`avgqu-sz`

使用`umonut`命令卸载磁盘

```bash		   
sudo umount -l /dev/sdl1 && echo 1 | sudo tee /sys/block/sdl/device/delete
```

此时用`df -h`检查磁盘 `/dev/sdl` 已经卸载


不过，还要使用 `iostat -xm 1 sdl` 检查一下，确保`/dev/sdl`设备符消失(不再显示输出)。否则需要借助SAS工具来设置磁盘`offline`。

例如这里再次使用 `iostat -xm 1 sdl` 发现输出中依然有 `sdl` 行:

```bash
Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sdl               0.00     0.00    0.00    0.00     0.00     0.00     0.00    42.00    0.00    0.00    0.00   0.00 100.00

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.84    0.78    6.88   15.39    0.21   73.90

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util
sdl               0.00     0.00    0.00    0.00     0.00     0.00     0.00    42.00    0.00    0.00    0.00   0.00 100.00

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           4.21    0.93    6.21   18.70    0.14   69.81
```

使用 `lsiutil` 工具来 `offline` 磁盘

首先使用`lsscsi`来显示`sdl`磁盘对应的设备通道

```bash
lsscsi
```

显示输出

```bash
[0:0:0:0]    disk    ATA      ST2000NM0011     SN02  /dev/sda
[0:0:1:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdb
[0:0:2:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdc
[0:0:3:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdd
[0:0:4:0]    disk    ATA      ST2000NM0011     SN02  /dev/sde
[0:0:5:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdf
[0:0:6:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdg
[0:0:7:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdh
[0:0:8:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdi
[0:0:9:0]    disk    ATA      ST2000NM0011     SN02  /dev/sdj
[0:0:10:0]   disk    ATA      ST2000NM0011     SN02  /dev/sdk
[0:0:12:0]   enclosu SAS/SATA  Expander        RevA  -
```

这里看不到`/dev/sdl`（已经在操作系统中卸载了），但是可以看出按照顺序， `/dev/sdl` 对应的是 `[0:0:11:0]`

## `lsiutil`交互程序

> `sudo lsiutil` ，交互式下依次输入`1` 、`16`，找到`11`对应的`Handle` （4位字符串）

以下是交互案例

```bash
sudo lsiutil
```

```bash
LSI Logic MPT Configuration Utility, Version 1.67, September 15, 2011

1 MPT Port found

     Port Name         Chip Vendor/Type/Rev    MPT Rev  Firmware Rev  IOC
 1.  ioc0              LSI Logic SAS2308 B0      200      0a640600     0

Select a device:  [1-1 or 0 to quit]
```

这里输入 `1` 则显示下级菜单

```bash
 1.  Identify firmware, BIOS, and/or FCode
 2.  Download firmware (update the FLASH)
 4.  Download/erase BIOS and/or FCode (update the FLASH)
 8.  Scan for devices
10.  Change IOC settings (interrupt coalescing)
13.  Change SAS IO Unit settings
16.  Display attached devices
20.  Diagnostics
21.  RAID actions
23.  Reset target
42.  Display operating system names for devices
43.  Diagnostic Buffer actions
45.  Concatenate SAS firmware and NVDATA files
59.  Dump PCI config space
60.  Show non-default settings
61.  Restore default settings
66.  Show SAS discovery errors
69.  Show board manufacturing information
97.  Reset SAS link, HARD RESET
98.  Reset SAS link
99.  Reset port
 e   Enable expert mode in menus
 p   Enable paged mode
 w   Enable logging

Main menu, select an option:  [1-99 or e/p/w or 0 to quit]
```

这里再输入 `16` 显示连接的设备

```bash
SAS2308's links are 6.0 G, 6.0 G, 6.0 G, 6.0 G, 6.0 G, 6.0 G, 6.0 G, 6.0 G

 B___T     SASAddress     PhyNum  Handle  Parent  Type
        5cccc81f16727000           0001           SAS Initiator
        5cccc81f16727001           0002           SAS Initiator
        5cccc81f16727002           0003           SAS Initiator
        5cccc81f16727003           0004           SAS Initiator
        5cccc81f16727004           0005           SAS Initiator
        5cccc81f16727005           0006           SAS Initiator
        5cccc81f16727006           0007           SAS Initiator
        5cccc81f16727007           0008           SAS Initiator
        500e004aaaaaaa3f     0     0009    0001   Edge Expander
 0   0  500e004aaaaaaa00     0     000a    0009   SATA Target
 0   1  500e004aaaaaaa01     1     000b    0009   SATA Target
 0   2  500e004aaaaaaa02     2     000c    0009   SATA Target
 0   3  500e004aaaaaaa03     3     000d    0009   SATA Target
 0   4  500e004aaaaaaa04     4     000e    0009   SATA Target
 0   5  500e004aaaaaaa05     5     000f    0009   SATA Target
 0   6  500e004aaaaaaa06     6     0010    0009   SATA Target
 0   7  500e004aaaaaaa07     7     0011    0009   SATA Target
 0   8  500e004aaaaaaa08     8     0012    0009   SATA Target
 0   9  500e004aaaaaaa09     9     0013    0009   SATA Target
 0  10  500e004aaaaaaa0a    10     0014    0009   SATA Target
 0  10  500e004aaaaaaa0b    11     0015    0009   SATA Target
 0  12  500e004aaaaaaa3e    24     0016    0009   SAS Initiator and Target

Type      NumPhys    PhyNum  Handle     PhyNum  Handle  Port  Speed
Adapter      8          0     0001  -->   16     0009     0    6.0
                        1     0001  -->   17     0009     0    6.0
                        2     0001  -->   18     0009     0    6.0
                        3     0001  -->   19     0009     0    6.0
                        4     0001  -->   20     0009     0    6.0
                        5     0001  -->   21     0009     0    6.0
                        6     0001  -->   22     0009     0    6.0
                        7     0001  -->   23     0009     0    6.0

Expander    25          0     0009  -->    0     000a     0    6.0
                        1     0009  -->    0     000b     0    6.0
                        2     0009  -->    0     000c     0    6.0
                        3     0009  -->    0     000d     0    6.0
                        4     0009  -->    0     000e     0    6.0
                        5     0009  -->    0     000f     0    6.0
                        6     0009  -->    0     0010     0    6.0
                        7     0009  -->    0     0011     0    6.0
                        8     0009  -->    0     0012     0    6.0
                        9     0009  -->    0     0013     0    6.0
                       10     0009  -->    0     0014     0    6.0
					   11     0009  -->    0     0015     0    6.0
                       16     0009  -->    0     0001     0    6.0
                       17     0009  -->    1     0001     0    6.0
                       18     0009  -->    2     0001     0    6.0
                       19     0009  -->    3     0001     0    6.0
                       20     0009  -->    4     0001     0    6.0
                       21     0009  -->    5     0001     0    6.0
                       22     0009  -->    6     0001     0    6.0
                       23     0009  -->    7     0001     0    6.0
                       24     0009  -->   24     0016     0    6.0

Enclosure Handle   Slots       SASAddress       B___T (SEP)
           0001      8      5cccc81f16727000
           0002      0      500e004aaaaaaa00    0  12

Main menu, select an option:  [1-99 or e/p/w or 0 to quit]
```

可以看到其中有一行对应`PhyNum`数值`11`的设备的`Handle`数值串是`0015`

```bash
 0  10  500e004aaaaaaa0b    11     0015    0009   SATA Target
```

这个`0015`的`Handle`就是后续我们要`offline`的设备

再输入命令对应的数值`80`表示要`offline`设备

```bash
Main menu, select an option:  [1-99 or e/p/w or 0 to quit] 80

Enter handle:  [0000-FFFF or RETURN to quit]
```

输入坏盘的`Handle`数值，也就是输入`0015` 。

看到`Setting SAS phy offline` 表示完成

连续输入`0`、`0` 退出`lsiutil`

此时再输入一次检查磁盘

```bash
iostat -xm 1 sdl
```

这时看到输出中`avgqu-sz`的输出就是空白了，表示这个磁盘已经被 `lsiutil` 成功 `offline`

```bash
Linux 2.6.32.36xen (host1.example.com) 	02/15/2016 	_x86_64_	(8 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           6.11    0.11   11.13    4.02    0.57   78.06

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           5.98    0.76   10.82   35.17    0.23   47.05

Device:         rrqm/s   wrqm/s     r/s     w/s    rMB/s    wMB/s avgrq-sz avgqu-sz   await r_await w_await  svctm  %util

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           3.48    0.65    7.98   36.26    0.22   51.41
```

踢盘成功后，日志kern显示 `device sdl1` 错误消失

```bash
Feb 15 20:05:43 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 14366
Feb 15 20:05:43 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 6082
Feb 15 20:05:43 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 5970
Feb 15 20:05:44 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 14242
Feb 15 20:05:44 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 6030
Feb 15 20:05:44 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 14230
Feb 15 20:05:44 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_discard_preallocations: Error in loading buddy information for 14252
Feb 15 20:05:44 host1.example.com kernel: : EXT4-fs error (device sdl1): ext4_put_super: Couldn't clean up the journal
```

故障处理结束！


