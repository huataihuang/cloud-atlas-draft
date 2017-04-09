# 概述

检查磁盘健康度主要通过：

* SMART检查
* 磁盘扇区检查

# SMART

```
sudo smartctl -a /dev/sda | less
```

`smartctl`提供了充分的磁盘健康情况信息，`smartd`也可以用来监控磁盘自身健康库监控。如果要做性能测试和检查所有的扇区是否存在损坏，则可以选择使用`badblocks`工具。

SMART检查是开始检测硬件问题较好的初始检查工具。

> 要确定磁盘是否支持SMART，可以使用命令 `sudo smartctl -i /dev/sda`

* 首先估算一下检查时间（`-c`）

```
sudo smartctl -c /dev/sda
```

可以看到输出

```
Short self-test routine
recommended polling time:        (   1) minutes.
Extended self-test routine
recommended polling time:        ( 286) minutes.
Conveyance self-test routine
recommended polling time:        (   2) minutes.
```

可以通过以下方法检查

```
sudo smartctl -t <short|long|conveyance|select> /dev/sda
```

> 检查过程中随时可以使用命令 `smartctl -X` 终止检查

* 完整检查

```
sudo smartctl -t long /dev/sda
```

提示信息

```
Sending command: "Execute SMART Extended self-test routine immediately in off-line mode".
Drive command "Execute SMART Extended self-test routine immediately in off-line mode" successful.
Testing has begun.
Please wait 286 minutes for test to complete.
Test will complete after Wed Apr  5 20:01:40 2017
```

* 检查完成后查看结果

```
sudo smartctl -a /dev/sda
```

检查结果主要关注以下部分

```
...
SMART Attributes Data Structure revision number: 10
Vendor Specific SMART Attributes with Thresholds:
ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE
  1 Raw_Read_Error_Rate     0x000f   084   063   044    Pre-fail  Always       -       243848519
  3 Spin_Up_Time            0x0003   092   092   000    Pre-fail  Always       -       0
  4 Start_Stop_Count        0x0032   100   100   020    Old_age   Always       -       8
  5 Reallocated_Sector_Ct   0x0033   100   100   036    Pre-fail  Always       -       0    <= 重分配扇区
  7 Seek_Error_Rate         0x000f   088   060   030    Pre-fail  Always       -       772187812
  9 Power_On_Hours          0x0032   065   065   000    Old_age   Always       -       31165
 10 Spin_Retry_Count        0x0013   100   100   097    Pre-fail  Always       -       0    <= 转轴重试次数
 12 Power_Cycle_Count       0x0032   100   100   020    Old_age   Always       -       8
184 End-to-End_Error        0x0032   100   100   099    Old_age   Always       -       0    <= 数据路径中错误
187 Reported_Uncorrect      0x0032   100   100   000    Old_age   Always       -       0    <= 不能硬件ECC修复的错误数
188 Command_Timeout         0x0032   100   100   000    Old_age   Always       -       0    <= HDD超时放弃操作次数
189 High_Fly_Writes         0x003a   100   100   000    Old_age   Always       -       0
190 Airflow_Temperature_Cel 0x0022   073   063   045    Old_age   Always       -       27 (Min/Max 23/28)
191 G-Sense_Error_Rate      0x0032   100   100   000    Old_age   Always       -       0
192 Power-Off_Retract_Count 0x0032   100   100   000    Old_age   Always       -       7
193 Load_Cycle_Count        0x0032   100   100   000    Old_age   Always       -       8
194 Temperature_Celsius     0x0022   027   040   000    Old_age   Always       -       27 (0 23 0 0 0)
195 Hardware_ECC_Recovered  0x001a   030   004   000    Old_age   Always       -       243848519
197 Current_Pending_Sector  0x0012   100   100   000    Old_age   Always       -       0    <= "不稳定"扇区数量(不可修复)
198 Offline_Uncorrectable   0x0010   100   100   000    Old_age   Offline      -       0    <= 扇区不可纠正错误的次数
199 UDMA_CRC_Error_Count    0x003e   200   200   000    Old_age   Always       -       0    <= 不能纠正的软件读错误数

SMART Error Log Version: 1
No Errors Logged

SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Extended offline    Completed without error       00%     31145         -
# 2  Extended offline    Completed without error       00%         9         -
...
```

## SMART输出分析

| ID | 属性名 | 原则 | 描述 |
| ---- | ---- | ---- | ---- |
| 01 0x01 | `Raw_Read_Error_Rate` | 值越低越好 | 和厂商有关。当从磁盘表面读取数据时，存储数据和硬件读错误率有关。这个`raw`值对于不同厂商具有不同安逸，所以不能理解为十进制数值。 |
| 03 0x03 | `Spin_Up_Time` | 值越低越好 | 磁盘轴启动的平均时间（从0转速到全速工作的花费时间，单位是毫秒） |
| 04 0x04 | `Start_Stop_Count` | | 磁盘轴启动和停止圈数。（没理解，似乎是磁盘轴开始转动以及从上一状态转到休眠状态的转动圈数） |
| 05 0x05 | **`Reallocated_Sector_Ct`** | 值越低越好 | 重新分配的扇区数量。这里的`raw`值表示已经被发现并重新映射的坏扇区数量。也就是，这个值越高，磁盘的越多扇区被重映射。这个值主要用来度量磁盘的预期寿命。当一个磁盘开始出现任何重分配的扇区，则表明这个磁盘将在今后数月内出现故障。 |
| 07 0x07 | `Seek_Error_Rate` |  | 和厂商有关。磁头寻道错误率。如果在机械位置系统出现部分故障，则寻道错误将出现。这种错误有可能和多个因素有关，例如伺服故障，或者硬盘热扩散。这个`raw`值对于不同厂商的含义不同，所以通常不是一个十进制数值。 |
| 08 0x08 | `Seek Time Performance` | 值越高越好 | 磁头的寻道操作平均性能。如果这个参数值降低，则表明机械子系统出现了故障信号。 |
| 09 0x09 | `Power_On_Hours` | | 磁盘加电状态的试驾。这个属性的`raw`值是表示磁盘的通电小时数。(默认情况，硬盘的预期寿命是5年，相当于1825天或者43800小时) |
| 10 0x0A | **`Spin_Retry_Count`**  | 值越低越好 | 转轴启动尝试的重试次数。这个属性存储了磁盘轴启动来达到全速运行的尝试次数（在这种情况下第一次尝试是不成功的）。当这个属性值增加就意味着硬盘机械子系统故障的信号。 |
| 11 0x0B | Recalibration Retries 或 Calibration Retry Count | 值越低越好 | 这个属性表示重新校准的重请求次数（这种情况下第一次尝试是失败的）。当这个参数的值增长则表明硬盘的机械子系统出现故障的信号 |
| 12 0x0c | `Power_Cycle_Count` | | 这个属性是完整磁盘加电和断电循环的次数 |
| 13 0x0D | `Soft Read Error Rate` | 值越低越好 | 操作系统报告的不可纠正读错误 |
| 183 0xB7 | **`End-to-End_Error`** / `IOEDC` | 值越低越好 | 这个属性值是HP的SMART IV技术，作为其他厂商的IO Error Dection and Correction schemas(IO错误检测和修复机制)，它包含了校验错误的计数，也就是通过驱动器的缓存RAM发生在到介质的数据路径上的校验错误 |
| 187 0xBB | **`Reported_Uncorrect`** | 值越低越好 | 这个属性表示不能通过硬件ECC修复的错误数量 |
| 188 0xBC | **`Command_Timeout`** | 值越低越好 | 这个数值表示HDD超时放弃操作的计数。通常这个数值应该等于 0 |
| 196 0xC4 | **`Reallocation Event Count`** | 值越低越好 | 扇区重映射操作技术。这个参数值的raw值表示尝试从重分配扇区到空闲区域尝试传递数据的次数。成功或失败的尝试都会计算 |
| 197 0xC5 | `Current_Pending_Sector` | 值越低越好 | "不稳定"扇区数量（等待重映射，因为不可修复的读错误）。如果一个不稳定的扇区在后续读取中成功，这个扇区就会重映射并且这个数值就会降低。当扇区读取错误，这个扇区就不会被立即重映射（因为正确值读取不出来，所以这个重映射值是不可知的，但也可能在以后可以读取出数据）；相反，驱动器的firmware会记得这个扇区需要重映射，并且会在它下次写的时候重映射。然而，一些驱动器不会在写这种扇区的时候立即重映射；相反，驱动器会首先尝试写入故障的扇区，并且如果写入操作成功就标记这个扇区是好的（这种情况下`Reallocation Event Count (0xC4)`将不会降低）。这是一个缺点，此时驱动器会包含由于成功写入但实际上存在隐患的扇区，而扇区后续故障将再也不能重映射。 |
| 198 0xC6 | **`(Offline) Uncorrectable Sector Count`** | 值越低越好 | 当读写一个扇区时候不可纠正错误的次数。这个数值上升表示磁盘表面存在瑕疵以及机械子系统故障 |
| 201 0xC9 | **`Soft Read Error Rate`或`TA Counter Detected`** | 值越低越好 | 计数表示不能纠正的软件读错误数量 |

> 上述属性表仅摘录了主要表述磁盘故障（**`加粗字体`**）情况的属性

# 检查坏块

在完成了SMART检查之后，可以对磁盘进行扇区的详细扫描和检查，采用工具`badblocks`来完成。

```
sudo badblocks -v /dev/sdb | tee /tmp/bad-blocks_sdb.txt
```

> 这里检查磁盘坏块的时候将日志记录输出到另外一块磁盘，例如`/dev/sdc`所挂载的目录

# 通知操作系统不使用坏块

上述`badblocks`工具检查完成后，如果有报告坏的扇区，则可以通过`e2fsck`命令通知操作系统不要使用坏块存储数据。

注意，在使用`e2fsck`命令之前，需要先卸载掉磁盘（umount）

```
sudo e2fsck -l /tmp/bad-blocks_sdb.txt /dev/sdb
```

# 调整服务器挂载次数的`fsck`

`tune2fs`命令可以检查和调整磁盘scan的计划安排，例如

```
sudo tune2fs -l /dev/sda1
```

可以看到输出

```
Mount count:              1
Maximum mount count:      38
Last checked:             Wed Mar 29 04:02:35 2017
Check interval:           15552000 (6 months)
Next check after:         Mon Sep 25 04:02:35 2017
```

假设想调整成挂载次数50次以后检查，可以使用`-c`参数

```
sudo tune2fs -c 50 /dev/sda1
```

# 参考

* [How to check the health of a hard drive](https://superuser.com/questions/171195/how-to-check-the-health-of-a-hard-drive)
* [The Beginner’s Guide to Linux Disk Utilities](https://www.howtogeek.com/howto/37659/the-beginners-guide-to-linux-disk-utilities/)
* [Check Hard drive for bad sectors or bad blocks in linux](http://www.linuxtechi.com/check-hard-drive-for-bad-sector-linux/)
* [SMART tests with smartctl](https://www.thomas-krenn.com/en/wiki/SMART_tests_with_smartctl)
* [Monitoring Hard Disks with SMART](http://www.linuxjournal.com/magazine/monitoring-hard-disks-smart?page=0,1)
* [ATA S.M.A.R.T. attributes](https://en.wikipedia.org/wiki/S.M.A.R.T.#ATA_S.M.A.R.T._attributes) - 这是详细的SMART属性解释文档