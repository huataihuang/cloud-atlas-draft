# 案例

本案例是处理故障磁盘 `/dev/sdh` ，先下线磁盘之后，维修替换新磁盘，然后再识别磁盘

```
df -h
```

```
...
/dev/sdg1             1.8T  568G  1.3T  31% /mnt/disk6
/dev/sdh1             1.8T  568G  1.3T  31% /mnt/disk7
/dev/sdi1             1.8T  566G  1.3T  31% /mnt/disk8
...
```

# 卸载磁盘方法

* 首先将文件系统卸载

```
sudo umount /mnt/disk7
```

* 此时已经可以安全拔掉故障磁盘 `/dev/sdh` 了。不过，为了更为小心些，可以执行以下命令，将磁盘设备从内核中注销掉

```
echo 1 > /sys/block/sdh/device/delete
```

上述步骤可以确保当拔除磁盘`/dev/sdh`时没有进程在使用该设备。此时你会听到磁盘磁头停止（park）的声音，此时内核已经告知磁盘准备断电。如果你使用的是AHCI控制器，它可以自行处理设备拔出响应操作，所以会非常顺畅。

# 识别新添加的磁盘

当新磁盘插入，需要在操作系统中扫描识别磁盘。

检查磁盘

```
$sudo lsscsi
...
[0:0:6:0]    disk    ATA      WDC WD2000FYYZ-0 1K01  /dev/sdg
[0:0:8:0]    disk    ATA      WDC WD2000FYYZ-0 1K01  /dev/sdi
...
[0:0:12:0]   enclosu LSI CORP Bobcat           0800  -
```

可以看到磁盘添加以后并没有被识别出来，没有找到新磁盘。

* 强制SCSI BUS扫描和发现设备

要明确知道自己的设备SCSI BUS编号，可以使用如下命令 - 参考[Rescanning your SCSI bus to see new storage](https://blogs.it.ox.ac.uk/oxcloud/2013/03/25/rescanning-your-scsi-bus-to-see-new-storage/）

```
grep mpt /sys/class/scsi_host/host?/proc_name
```

可以看到输出如下

```
/sys/class/scsi_host/host0/proc_name:mpt2sas
```

所以这里就证明使用的设备是 `host0`

使用以下命令扫描新添加的设备

```
echo "- – -" > /sys/class/scsi_host/host<n>/scan
```

这里`<n>`是SCSI BUS的编号。可以看到前面案例的SCSI BUS是0，所以这里使用命令

```
echo "- – -" > /sys/class/scsi_host/host0/scan
```

`"- - -"`表示所有的控制器，所有的通道和所有的LUN

不过上述命令没有生效，再次使用 `lsscsi` 还是看不到设备。


> 参考 [Vmware Linux Guest Add a New Hard Disk Without Rebooting Guest](https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html)

> 要想知道SCSI的路径，可以通过命令 `cat /proc/scsi/scsi` 检查详细的通道

```
Attached devices:
......
Host: scsi0 Channel: 00 Id: 06 Lun: 00
  Vendor: ATA      Model: WDC WD2000FYYZ-0 Rev: 1K01
  Type:   Direct-Access                    ANSI  SCSI revision: 06
Host: scsi0 Channel: 00 Id: 08 Lun: 00
  Vendor: ATA      Model: WDC WD2000FYYZ-0 Rev: 1K01
  Type:   Direct-Access                    ANSI  SCSI revision: 06
......
Host: scsi0 Channel: 00 Id: 12 Lun: 00
  Vendor: LSI CORP Model: Bobcat           Rev: 0800
  Type:   Enclosure                        ANSI  SCSI revision: 05
```

可以看到依然没有识别磁盘。

> 参考文档[How do I make Linux recognize a new SATA /dev/sda drive I hot swapped in without rebooting?](http://serverfault.com/questions/5336/how-do-i-make-linux-recognize-a-new-sata-dev-sda-drive-i-hot-swapped-in-without)提到需要在BIOS中激活`Hot Swap = enabled/disabled`，否则不能识别新添加的磁盘。

不过在[buzilla.kernel.org #11619](https://bugzilla.kernel.org/show_bug.cgi?id=11619) 中提出了 `kernels >= 2.6.37` 不再出现这个问题。

# 使用lsiutil

参考 [LSI Fusion MPT SAS](http://hwraid.le-vert.net/wiki/LSIFusionMPT)

LSI提供了一个工具用来处理其提供的存储设备卡 - `lsiutil`

```
#lsiutil

LSI Logic MPT Configuration Utility, Version 1.67, September 15, 2011

1 MPT Port found

     Port Name         Chip Vendor/Type/Rev    MPT Rev  Firmware Rev  IOC
 1.  ioc0              LSI Logic SAS2308 05      200      0f000000     0

Select a device:  [1-1 or 0 to quit] 1   <= 这里选择1表示选择设备端口 ioc0

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

Main menu, select an option:  [1-99 or e/p/w or 0 to quit] 8  <= 输入8表示扫描磁盘设备

SAS2308's links are 6.0 G, 6.0 G, 6.0 G, 6.0 G, down, down, down, down

 B___T___L  Type       Vendor   Product          Rev      SASAddress     PhyNum
 0   0   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116468     8
 0   1   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116469     9
 0   2   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf00011646a    10
 0   3   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf00011646b    11
 0   4   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf00011646c    12
 0   5   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf00011646d    13
 0   6   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf00011646e    14
 0   8   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116470    16
 0   9   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116471    17
 0  10   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116472    18
 0  11   0  Disk       ATA      WDC WD2000FYYZ-0 1K01  56c92bf000116473    19
 0  12   0  EnclServ   LSI CORP Bobcat           0800  56c92bf00011647d    20

Main menu, select an option:  [1-99 or e/p/w or 0 to quit] 42

ioc0 is SCSI host 0

 B___T___L  Type       Operating System Device Name
 0   0   0  Disk       /dev/sda    [0:0:0:0]
 0   1   0  Disk       /dev/sdb    [0:0:1:0]
 0   2   0  Disk       /dev/sdc    [0:0:2:0]
 0   3   0  Disk       /dev/sdd    [0:0:3:0]
 0   4   0  Disk       /dev/sde    [0:0:4:0]
 0   5   0  Disk       /dev/sdf    [0:0:5:0]
 0   6   0  Disk       /dev/sdg    [0:0:6:0]
 0   8   0  Disk       /dev/sdi    [0:0:8:0]
 0   9   0  Disk       /dev/sdj    [0:0:9:0]
 0  10   0  Disk       /dev/sdk    [0:0:10:0]
 0  11   0  Disk       /dev/sdl    [0:0:11:0]
 0  12   0  EnclServ

Main menu, select an option:  [1-99 or e/p/w or 0 to quit] 16  <= 输入16显示所有设备详细信息

SAS2308's links are 6.0 G, 6.0 G, 6.0 G, 6.0 G, down, down, down, down

 B___T     SASAddress     PhyNum  Handle  Parent  Type
        56c92bf0000424ed           0001           SAS Initiator
        56c92bf0000424ee           0002           SAS Initiator
        56c92bf0000424ef           0003           SAS Initiator
        56c92bf0000424f0           0004           SAS Initiator
        56c92bf0000424f1           0005           SAS Initiator
        56c92bf0000424f2           0006           SAS Initiator
        56c92bf0000424f3           0007           SAS Initiator
        56c92bf0000424f4           0008           SAS Initiator
        56c92bf00011647f     0     0009    0001   Edge Expander
 0   0  56c92bf000116468     8     000a    0009   SATA Target
 0   1  56c92bf000116469     9     000b    0009   SATA Target
 0   2  56c92bf00011646a    10     000c    0009   SATA Target
 0   3  56c92bf00011646b    11     000d    0009   SATA Target
 0   4  56c92bf00011646c    12     000e    0009   SATA Target
 0   5  56c92bf00011646d    13     000f    0009   SATA Target
 0   6  56c92bf00011646e    14     0010    0009   SATA Target
 0   8  56c92bf000116470    16     0012    0009   SATA Target
 0   9  56c92bf000116471    17     0013    0009   SATA Target
 0  10  56c92bf000116472    18     0014    0009   SATA Target
 0  11  56c92bf000116473    19     0015    0009   SATA Target
 0  12  56c92bf00011647d    20     0016    0009   SAS Initiator and Target

Type      NumPhys    PhyNum  Handle     PhyNum  Handle  Port  Speed
Adapter      8          0     0001  -->    0     0009     0    6.0
                        1     0001  -->    1     0009     0    6.0
                        2     0001  -->    2     0009     0    6.0
                        3     0001  -->    3     0009     0    6.0

Expander    22          0     0009  -->    0     0001     0    6.0
                        1     0009  -->    1     0001     0    6.0
                        2     0009  -->    2     0001     0    6.0
                        3     0009  -->    3     0001     0    6.0
                        8     0009  -->    0     000a     0    6.0
                        9     0009  -->    0     000b     0    6.0
                       10     0009  -->    0     000c     0    6.0
                       11     0009  -->    0     000d     0    6.0
                       12     0009  -->    0     000e     0    6.0
                       13     0009  -->    0     000f     0    6.0
                       14     0009  -->    0     0010     0    6.0
                       16     0009  -->    0     0012     0    6.0
                       17     0009  -->    0     0013     0    6.0
                       18     0009  -->    0     0014     0    6.0
                       19     0009  -->    0     0015     0    6.0
                       20     0009  -->    0     0016     0    6.0

Enclosure Handle   Slots       SASAddress       B___T (SEP)
           0001      8      56c92bf0000424ed
           0002     12      56c92bf00011647f    0  12

Main menu, select an option:  [1-99 or e/p/w or 0 to quit]
```

但是扫描以后依然没有识别出设备 `0 7 0` （B T L），对于操作系统来说，还是没有看到 `/dev/sdh

> 对于`lsiutil`工具，交互命令`80`是用来`Set port offline`的，赌赢有一个`81`是`Set port online`，但是我尝试了失败

```
Main menu, select an option:  [1-99 or e/p/w or 0 to quit] 81

Enter handle:  [0000-FFFF or RETURN to quit] 0011

Invalid handle!

Main menu, select an option:  [1-99 or e/p/w or 0 to quit]
```


# sas2ircu 工具

`sas2ircu` 是LSI提供的工具进行卷管理的工具，不过没有使用RAID卷可能无法使用

* 检查LSI存储卡

```
sas2ircu LIST
```

显示输出

```
LSI Corporation SAS2 IR Configuration Utility.
Version 10.00.00.00 (2011.05.12)
Copyright (c) 2009-2010 LSI Corporation. All rights reserved.


         Adapter      Vendor  Device                       SubSys  SubSys
 Index    Type          ID      ID    Pci Address          Ven ID  Dev ID
 -----  ------------  ------  ------  -----------------    ------  ------
   0     SAS2308_1     1000h    86h   00h:04h:00h:00h      1000h   0086h
SAS2IRCU: Utility Completed Successfully.
```

没有建立RAID似乎无法使用

```
#sas2ircu 0 STATUS
LSI Corporation SAS2 IR Configuration Utility.
Version 10.00.00.00 (2011.05.12)
Copyright (c) 2009-2010 LSI Corporation. All rights reserved.

SAS2IRCU: there are no IR volumes on the controller!
SAS2IRCU: Error executing command STATUS.
```

# 参考

* [How do I make Linux recognize a new SATA /dev/sda drive I hot swapped in without rebooting?](http://serverfault.com/questions/5336/how-do-i-make-linux-recognize-a-new-sata-dev-sda-drive-i-hot-swapped-in-without)
* [How can I safely remove a SATA disk from a running system?](http://unix.stackexchange.com/questions/43413/how-can-i-safely-remove-a-sata-disk-from-a-running-system)
* [LSIUtil Configuration Utility](https://www.thomas-krenn.com/de/wikiDE/images/4/44/Lsi_userguide_2006_20130528.pdf)