# S.M.A.R.T.

S.M.A.R.T.（Self-Monitoring, Analysis and Reporting Technology）意思是自我监控，分析和报告技术，也常常写成SMART。SMART是计算机硬盘驱动器（HDDs）和固态驱动器（SSDs）的监控系统，用来对许多驱动器可靠性的许多指标进行检测和报告，以便能够预测硬件故障。

当前多数存储设备内建了S.M.A.R.T.附件来监控、存储和分析其设备操作的健康程度。通过软件搜集温度、重新分配的扇区、寻道错误等状态数据，软件可以用来度量设备等健康状况。当S.M.A.R.T.数据预测到驱动器可能的故障，运行在主机上的软件可能会通知用户复制数据到其他驱动器，避免数据丢失以及可以替换驱动器。

> 本文实践记录是在Inspur（浪潮）SA5212H2服务器上验证，服务器使用了12块 2TB `HGST HUS724020AL`磁盘 (HGST即日立环球存储技术公司，2011年被西部数据收购)
>
> 存储控制器`Serial Attached SCSI controller: LSI Logic / Symbios Logic SAS2308 PCI-Express Fusion-MPT SAS-2 (rev 05)`

# smartmontools

`smartmontools`软件包包含了2个工具程序来分析和监控存储设备：`smartctl`和`smartd`。

设备必须支持SMART功能并且激活每个存储设备的SMART，这样才能有效使用工具。可以使用`smartctl`来检查是否激活了SMART支持，然后运行测试和检查测试结果。另外，可以使用`smartd`在自动运行测试和进行email通知。

## 安装smartmontools

* Debian

		apt-get install smartmontools

* CentOS/RHEL

		yum install smartmontools



## smartctl

`smartctl`是一个命令行工具"控制大多数ATA/SATA和SCSI/SAS硬盘和固态存储内建的SMART"。

`--info`或`-i`参数将打印一个设备的信息参数，包括是否支持SMART以及是否激活了该功能。

	smartctl -i /dev/sda

显示输出（包括了型号、序列号、Firmware版本、容量、扇区、接口等信息，最后两行参数显示支持SMART）

	=== START OF INFORMATION SECTION ===
	Device Model:     HGST HUS724020ALA640
	Serial Number:    PN2134P6HJG1AP
	LU WWN Device Id: 5 000cca 22dd59228
	Firmware Version: MF6OAB70
	User Capacity:    2,000,398,934,016 bytes [2.00 TB]
	Sector Size:      512 bytes logical/physical
	Rotation Rate:    7200 rpm
	Device is:        Not in smartctl database [for details use: -P showall]
	ATA Version is:   ATA8-ACS T13/1699-D revision 4
	SATA Version is:  SATA 3.0, 6.0 Gb/s (current: 6.0 Gb/s)
	Local Time is:    Tue Feb  2 23:08:43 2016 CST
	SMART support is: Available - device has SMART capability.
	SMART support is: Enabled

如果设备没有激活SMART，可以使用命令

	smartctl --smart=on /dev/sda

有可能需要指定设备类型，如 `--device=ata` 以便通知`smartctl`设备类型，避免使用SCSI命令

> `--smart=off` 可关闭设备的SMART功能

# 运行测试

有3种类型的自我测试（所有的测试都是用户数据安全的）：

* `short` (检查设备的高概率问题)
* `extended` （或者称为`long`测试，将进行完整的磁盘表面快速检查）
* `conveyance` （在设备的传输过程中标示是否存在损坏）

> `conveyance` 表示"运输"

`-c`参数（或者`--capabilities`）输出设备支持的测试以及每个测试需要花费的时间

	smartctl -c /dev/sda

输出

	=== START OF READ SMART DATA SECTION ===
	General SMART Values:
	Offline data collection status:  (0x82)	Offline data collection activity
						was completed without error.
						Auto Offline Data Collection: Enabled.
	Self-test execution status:      (   0)	The previous self-test routine completed
						without error or no self-test has ever
						been run.
	Total time to complete Offline
	data collection: 		(   24) seconds.
	Offline data collection
	capabilities: 			 (0x5b) SMART execute Offline immediate.
						Auto Offline data collection on/off support.
						Suspend Offline collection upon new
						command.
						Offline surface scan supported.
						Self-test supported.
						No Conveyance Self-test supported.
						Selective Self-test supported.
	SMART capabilities:            (0x0003)	Saves SMART data before entering
						power-saving mode.
						Supports SMART auto save timer.
	Error logging capability:        (0x01)	Error logging supported.
						General Purpose Logging supported.
	Short self-test routine
	recommended polling time: 	 (   1) minutes.
	Extended self-test routine
	recommended polling time: 	 ( 317) minutes.
	SCT capabilities: 	       (0x003d)	SCT Status supported.
						SCT Error Recovery Control supported.
						SCT Feature Control supported.
						SCT Data Table supported.

使用`-t`(或者`--test=<test_name>`)参数来运行一个测试

	smartctl -t short /dev/<device>
	smartctl -t long /dev/<device>
	smartctl -t conveyance /dev/<device>

# 查看测试结果

可以使用`-H`参数来查看设备的健康概况。 **"如果设备报告`failing health`状态，就意味着设备已经故障，或者设备预测自己将在24小时内故障。这种情况下要尽可能快地将设备上的数据导出到安全的存储中"**

	smartctl -H /dev/<device>

可以列出最近的测试结果以及设备的详细信息

	smartctl -l selftest /dev/<device>
	smartctl -a /dev/<device>

# 快速测试案例

启动一个短暂的自测试

    sudo smartctl -t short /dev/sda

如果要中断测试（**没有必要的话不要自行中断命令**）

	smartctl -X

短暂自测试大约2分钟，然后用下面的命令查看测试结果

	sudo smartctl -l selftest /dev/sda

显示结果类似

	=== START OF READ SMART DATA SECTION ===
	SMART Self-test log structure revision number 1
	Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
	# 1  Short offline       Completed without error       00%     14591         -
	# 2  Short offline       Completed without error       00%     14591         -
	# 3  Extended offline    Completed without error       00%         8         -

直接查看磁盘的健康状况

	smartctl --health /dev/sda

显示

	=== START OF READ SMART DATA SECTION ===
	SMART Health Status: OK

输出详细的设备信息

    smartctl -a /dev/sda

输出结果类似

	=== START OF INFORMATION SECTION ===
	Device Model:     HGST HUS724020ALA640
	Serial Number:    PN2134P6HJG1AP
	LU WWN Device Id: 5 000cca 22dd59228
	Firmware Version: MF6OAB70
	User Capacity:    2,000,398,934,016 bytes [2.00 TB]
	Sector Size:      512 bytes logical/physical
	Rotation Rate:    7200 rpm
	Device is:        Not in smartctl database [for details use: -P showall]
	ATA Version is:   ATA8-ACS T13/1699-D revision 4
	SATA Version is:  SATA 3.0, 6.0 Gb/s (current: 6.0 Gb/s)
	Local Time is:    Tue Feb  2 23:30:41 2016 CST
	SMART support is: Available - device has SMART capability.
	SMART support is: Enabled

	=== START OF READ SMART DATA SECTION ===
	SMART overall-health self-assessment test result: PASSED

	General SMART Values:
	Offline data collection status:  (0x82)	Offline data collection activity
						was completed without error.
						Auto Offline Data Collection: Enabled.
	Self-test execution status:      (   0)	The previous self-test routine completed
						without error or no self-test has ever
						been run.
	Total time to complete Offline
	data collection: 		(   24) seconds.
	Offline data collection
	capabilities: 			 (0x5b) SMART execute Offline immediate.
						Auto Offline data collection on/off support.
						Suspend Offline collection upon new
						command.
						Offline surface scan supported.
						Self-test supported.
						No Conveyance Self-test supported.
						Selective Self-test supported.
	SMART capabilities:            (0x0003)	Saves SMART data before entering
						power-saving mode.
						Supports SMART auto save timer.
	Error logging capability:        (0x01)	Error logging supported.
						General Purpose Logging supported.
	Short self-test routine
	recommended polling time: 	 (   1) minutes.
	Extended self-test routine
	recommended polling time: 	 ( 317) minutes.
	SCT capabilities: 	       (0x003d)	SCT Status supported.
						SCT Error Recovery Control supported.
						SCT Feature Control supported.
						SCT Data Table supported.

	SMART Attributes Data Structure revision number: 16
	Vendor Specific SMART Attributes with Thresholds:
	ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE
	  1 Raw_Read_Error_Rate     0x000b   100   100   016    Pre-fail  Always       -       0
	  2 Throughput_Performance  0x0005   137   137   054    Pre-fail  Offline      -       77
	  3 Spin_Up_Time            0x0007   142   142   024    Pre-fail  Always       -       429 (Average 450)
	  4 Start_Stop_Count        0x0012   100   100   000    Old_age   Always       -       20
	  5 Reallocated_Sector_Ct   0x0033   100   100   005    Pre-fail  Always       -       0
	  7 Seek_Error_Rate         0x000b   100   100   067    Pre-fail  Always       -       0
	  8 Seek_Time_Performance   0x0005   145   145   020    Pre-fail  Offline      -       24
	  9 Power_On_Hours          0x0012   098   098   000    Old_age   Always       -       16133
	 10 Spin_Retry_Count        0x0013   100   100   060    Pre-fail  Always       -       0
	 12 Power_Cycle_Count       0x0032   100   100   000    Old_age   Always       -       20
	192 Power-Off_Retract_Count 0x0032   100   100   000    Old_age   Always       -       666
	193 Load_Cycle_Count        0x0012   100   100   000    Old_age   Always       -       666
	194 Temperature_Celsius     0x0002   181   181   000    Old_age   Always       -       33 (Min/Max 20/45)
	196 Reallocated_Event_Count 0x0032   100   100   000    Old_age   Always       -       0
	197 Current_Pending_Sector  0x0022   100   100   000    Old_age   Always       -       0
	198 Offline_Uncorrectable   0x0008   100   100   000    Old_age   Offline      -       0
	199 UDMA_CRC_Error_Count    0x000a   200   200   000    Old_age   Always       -       0

	SMART Error Log Version: 1
	No Errors Logged

	SMART Self-test log structure revision number 1
	Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
	# 1  Short offline       Completed without error       00%     16133         -
	# 2  Short offline       Completed without error       00%     16132         -

	SMART Selective self-test log data structure revision number 1
	 SPAN  MIN_LBA  MAX_LBA  CURRENT_TEST_STATUS
	    1        0        0  Not_testing
	    2        0        0  Not_testing
	    3        0        0  Not_testing
	    4        0        0  Not_testing
	    5        0        0  Not_testing
	Selective self-test flags (0x0):
	  After scanning selected spans, do NOT read-scan remainder of disk.
	If Selective self-test is pending on power-up, resume after 0 minute delay.

# smartd

`smartd` daemon监控SMART状态，并在发生问题时邮件通知。这个服务可以通过`systemd`管理，并且使用`/etc/smartd.conf`配置文件。不过这个配置文件非常晦涩难懂，详细配置可以参考 `man 5 smartd.conf` 或者[smartd.conf info](http://www.smartmontools.org/browser/trunk/smartmontools/smartd.conf.5.in)

## 管理smartd服务

启动、检查状态、以及激活自启动和查看最近的日志

	systemctl start smartd
	systemctl status smartd
	systemctl enable smartd
	journalctl -u smartd

## 定义监控的设备

要监控所有可能SMART错误，则配置`/etc/smartd.conf`（在CentOS 7是`/etc/smartmontools/smartd.conf`）

	DEVICESCAN -a

如果要只监控指定的磁盘，例如

	/dev/sda -a
	/dev/sdb -a

也可以对外接的磁盘（如通过USB连接的备份用磁盘），需要通知SMARTd设备的UUID，这是因为每次重启设备的`/dev/sdX`可能变化

要获取需要监控的磁盘的UUID，可以使用`ls -lah /dev/disk/by-uuid/` 来查看需要监控的磁盘。以下配置在`smartd.conf`中的配置就是针对USB磁盘

	/dev/disk/by-uuid/820cdd8a-866a-444d-833c-1edb0f4becac -a

## 使用电子邮件通知潜在的问题

要在故障或新的错误发生时通知，使用`-m`参数

	DEVICESCAN -m address@domain.com

要发送给外部的email地址，需要确保系统有MTA(Mail Transport Agent)或者MUA(Mail User Agent)并且已经正确配置。通常MTU是sendmail和Postfix。

如果设置了`-M test`就会在smartd服务启动时发送一个测试邮件

	DEVICESCAN -m address@domain.com -M test

由于电子邮件投递需要很长时间，而通常期望硬盘故障时立即被通知到以便采取措施。则可以定义执行一个脚本来替代email

	DEVICESCAN -m address@domain.com -M exec /usr/local/bin/smartdnotify

### CentOS默认配置

检查了CentOS 7默认配置的`/etc/smartmontools/smartd.conf`，配置内容实际只有一行

	DEVICESCAN -H -m root -M exec /usr/libexec/smartmontools/smartdnotify -n standby,10,q

> 这里通知是发送给系统的`root`用户，并且执行了脚本 `/usr/libexec/smartmontools/smartdnotify` 这个脚本实现了email通知，同时将消息写到终端上

	#! /bin/sh

	# Send mail
	echo "$SMARTD_MESSAGE" | mail -s "$SMARTD_FAILTYPE" "$SMARTD_ADDRESS"

	# Notify desktop user
	MESSAGE="WARNING: Your hard drive is failing"

	# direct write to terminals, do not use 'wall', because we don't want its ugly header
	for t in $(who | awk '{ print $2; }' | grep -e '^tty' -e '^pts/')
	do
	  echo "$MESSAGE
	$SMARTD_MESSAGE" >/dev/$t 2>/dev/null ||:
	done

## 电源管理

可以用smartd来处理磁盘的低电压模式，这样可以通过smartd来响应SMART命令，磁盘转速。没有这个参数，磁盘可能在低电压情况下仍然高速旋转：

    DEVICESCAN -n standby,15,q

> 详细参考 [smartmontools wiki](http://www.smartmontools.org/wiki/Powermode)

## 周期自测

smartd可以告诉磁盘定期执行自检，以下配置设置磁盘每天早上2-3点进行short self-test，在每个周六的早上3-4点进行详细自测

    DEVICESCAN -s (S/../.././02|L/../../6/03)

## 温度改变时告警

smartd可以跟踪磁盘问题并且在磁盘温度太快升高或者达到阀值时高进。以下配置在发生4度温度变化，或者温度达到35度，进行日志，在温度达到40度时日志和邮件告警

    DEVICESCAN -W 4,35,40

> 可以使用命令检查当前磁盘温度 `smartctl -A /dev/<device> | grep Temperature_Celsius`

## 完整的`smartd.conf`配置

以下配置将上述所有配置集成

DEVICESCAN (smartd scans for disks and monitors all it finds)

* -a (monitor all attributes)
* -o on (enable automatic online data collection)
* -S on (enable automatic attribute autosave)
* -n standby,q (do not check if disk is in standby, and suppress log message to that effect so as not to cause a write to disk)
* -s ... (schedule short and long self-tests)
* -W ... (monitor temperature)
* -m ... (mail alerts)

配置如下

    DEVICESCAN -a -o on -S on -n standby,q -s (S/../.././02|L/../../6/03) -W 4,35,40 -m <username or email>

> 这个配置非常完善，可参考

# GSmartControl图形管理工具

`GSmartControl`是smartctl的的图形前端，显示所有的SMART数值，并且高亮显示那些旧值或者即将故障，可以按照需要运行测试

	GSmartControl main window



# 参考

* [Wikipedia: S.M.A.R.T.](https://en.wikipedia.org/wiki/S.M.A.R.T.)
* [archlinux: S.M.A.R.T.](https://wiki.archlinux.org/index.php/S.M.A.R.T.) - 本文主要参考
* [Monitoring Hard Disks with SMART](http://www.linuxjournal.com/magazine/monitoring-hard-disks-smart)
* [Get the disk health status with SMART monitor tools on Debian and Ubuntu Linux](http://www.linuxjournal.com/magazine/monitoring-hard-disks-smart)
* [Using smartctl to get SMART status information on your hard drives](http://www.techrepublic.com/blog/linux-and-open-source/using-smartctl-to-get-smart-status-information-on-your-hard-drives/)
* [ubuntu: Smartmontools](https://help.ubuntu.com/community/Smartmontools) - 本文主要参考，提供了监控个人电脑和服务器的脚本以及处理经验
* [SMART tests with smartctl](https://www.thomas-krenn.com/en/wiki/SMART_tests_with_smartctl)
* [Monitoring Hard Drive Health on Linux with smartmontools](https://blog.shadypixel.com/monitoring-hard-drive-health-on-linux-with-smartmontools/)