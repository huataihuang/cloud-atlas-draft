# 问题

服务器宕机重启后，在OOB看到如下提示

```
u*f*r 16****w*g*\4*fFf**f***  f**
: Inconsistent filesystem structure                                      

Press any key to continue...
```

但是，按下回车后又返回到grub启动内核选择界面

选择另一个旧内核尝试启动，原来第一行内容是

```
Error 16: Inconsistent filesystem structure
```

# 排查

带外启动无盘状态，检查磁盘

```
#smartctl -i /dev/sda
smartctl 6.2 2013-07-26 r3841 [x86_64-linux-2.6.32-220.el6.x86_64] (local build)
Copyright (C) 2002-13, Bruce Allen, Christian Franke, www.smartmontools.org

=== START OF INFORMATION SECTION ===
Device Model:     SAMSUNG MZ7WD480HCGM-00003
Serial Number:    S1G1NEAG601815
LU WWN Device Id: 5 002538 550459ba3
Firmware Version: DXM9203Q
User Capacity:    480,103,981,056 bytes [480 GB]
Sector Size:      512 bytes logical/physical
Rotation Rate:    Solid State Device
Device is:        Not in smartctl database [for details use: -P showall]
ATA Version is:   ACS-2, ATA8-ACS T13/1699-D revision 4c
SATA Version is:  SATA 3.1, 6.0 Gb/s (current: 6.0 Gb/s)
Local Time is:    Tue Feb 21 16:42:39 2017 CST
SMART support is: Available - device has SMART capability.
SMART support is: Enabled
```

快速检查

```
smartctl -t short /dev/sda
```

再次测试发现超时

```
#smartctl -t short /dev/sda
smartctl 6.2 2013-07-26 r3841 [x86_64-linux-2.6.32-220.el6.x86_64] (local build)
Copyright (C) 2002-13, Bruce Allen, Christian Franke, www.smartmontools.org

Read SMART Data failed: Connection timed out
```

再重复一次`smartctl -t short /dev/sda`居然提示磁盘无法找到

```
Smartctl open device: /dev/sda failed: No such Device
```

尝试查看另外一个`/dev/sdk`

```
smartctl -t short /dev/sdk
```

检查大约2分钟，然后查看报告

```
sudo smartctl -l selftest /dev/sdk
```

```
=== START OF READ SMART DATA SECTION ===
SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Short offline       Completed without error       00%     10225         -
```

大致计算了一下`10225小时`折合成天，也就是`426天`，看了一下服务器购买时间到现在已经有`431天`，似乎预期寿命时间到了。

又检查了一下同样型号的`/dev/sdl` SSD设备，显示磁盘寿命也到终点了 - 同样的输出

```
SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Short offline       Completed without error       00%     10226
```

由于没有检查出磁盘`sdk`问题，尝试采用一次完整检查

```
smartctl -t long /dev/sdk
```

# SSD寿命和健康检查