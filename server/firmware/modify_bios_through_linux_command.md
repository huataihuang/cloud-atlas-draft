# Dell

Dell Poweredge可以通过一个名为`syscfg`工具来修改BIOS配置，并且可以批量修改，无需直接访问服务器。（[How to change Dell’s BIOS settings from a Linux command-line](https://www.colino.net/wordpress/archives/2008/05/21/how-to-change-dells-bios-settings-from-a-linux-command-line/)）

安装软件包

	# cd ; wget -q -O – http://linux.dell.com/repo/hardware/bootstrap.cgi | bash
	# yum install srvadmin-hapi
	# wget ftp://ftp.us.dell.com/sysman/dtk_2.5_80_Linux.iso
	# mkdir dtk
	# mount -o loop dtk_2.5_80_Linux.iso dtk/
	# cd dtk/isolinux/
	# cp  SA.2 ~/SA.2.gz
	# cd; gunzip SA.2.gz
	# mkdir stage2
	# cd stage2
	# cpio -i < ../SA.2
	# cd lofs
	# mkdir dell
	# mount -o loop dell.cramfs dell/
	# mkdir -p /usr/local/sbin ; cp dell/toolkit/bin/syscfg /usr/local/sbin/
	# umount dell
	# cd
	# umount dtk

使用syscfg

	# /usr/local/sbin/syscfg –biosver
	biosver=1.5.1
	# /usr/local/sbin/syscfg –virtualization=enable
	virtualization=enable

# HP

HP提供了全面的主机管理解决方案，结合Intel LANDESK Client Management，可以管理大量的服务器。

> 参考 [HP Download & Install Drivers / BIOS](http://www8.hp.com/us/en/ads/clientmanagement/drivers-bios.html)

HP System Software Manager (SSM)是通过网络检查和更新BIOS，设备驱动以及管理agent版本的工具 － [Read the Release Notes and download SSM](http://ftp.hp.com/pub/caps-softpaq/cmit/HP_SSM.html)

HP BIOS Configuration Utility (BCU)是免费的提供管理BIOS设置的工具 － [Read the Release Notes and download BCU](http://ftp.hp.com/pub/caps-softpaq/cmit/HP_BCU.html)

# Inventec （英业达）

# 联想/浪潮（AMI）

联想和浪潮使用AMI的BIOS，可参考联想[Configuring the HX Series appliance](http://systemx.lenovofiles.com/help/index.jsp?topic=%2Fcom.lenovo.conv.8689.doc%2Ft_configuring_hx_appliance.html)手册来修订BIOS

```
./SCELNX_64 /o /s ./nvram_script.txt 
```

然后将模版文件复制到需要修改BIOS配置的目标服务器上（要求模版服务器和被修改服务器完全一致的硬件配置），然后执行导入：

```
./SCELNX_64 /i /s nvram_script.txt
```

这里有一个[排查CPU核心丢失](cpuinfo_miss_core)的案例，就是通过AMI BIOS设置来解决的。

联想提供了 [Lenovo ToolsCenter Suite CLI](https://pcsupport.lenovo.com/us/en/solutions/ht116433?LinkTrack=Solr)来帮助管理firmware,硬件以及CMM,IMM和Flex-IOM的系统，支持多种操作系统：

> Lenovo ToolsCenter Suite CLI is a command line based 
> utility, which covers the server management scope includes 
> firmware configuration, system inventory.

并且 [Lenovo Diagnostic Solutions: Diagnose & Fix](https://pcsupport.lenovo.com/us/en/lenovodiagnosticsolutions/diagnose)提供了服务器诊断和修复工具。

# Sun

[Sun服务器命令行工具和IPMI使用指南](http://docs.oracle.com/cd/E19690-01/821-0997/toc.html) 有关 [BIOS Configuration Tool](http://docs.oracle.com/cd/E19690-01/821-0997/gjokh.html) 介绍了一个`biosconfig`命令

# American Megatrends BIOS

AMI是主流的BIOS厂商，提供了BIOS/UEFI工具来设置相应配置（提供了各种操作系统版本），可参考 [BIOS/UEFI Utilities for Aptio and AMIBIOS](http://www.ami.com/products/bios-uefi-tools-and-utilities/bios-uefi-utilities/)相关信息。

[AMIBIOS Setup Utility System Parameters and Standard Settings](https://computinghardware.web.cern.ch/ComputingHardware/doc/NEC/P570/BIOS-Settings/MS1421_164x_bios_rev0_01.pdf)手册介绍了AMI BIOS设置方法 － [本地文档](img/server/BIOS/MS1421_164x_bios_rev0_01.pdf)

[Aptio UEFI Firmware tool](http://www.tempusfugit.ca/techwatch.ca/aptio.html) 提供了相关连接

不过，没有找到AMI网站直接提供的工具，通常采用的是各个服务器厂商的维护工具来实现AMI BIOS修改。例如，国内的联想、浪潮服务器都使用AMI的BIOS，工具应该是通用的。

> 启动时按`F2`进入AMI BIOS设置

> 浪潮Inspur服务器使用了AMI的BIOS，可以通过工具设置

# Linux通用BIOS查看命令`biosdecode`

`biosdecode`是Linux平台提供的BIOS设置处理的命令行工具，可以打印其所致的所有结构化信息。

可以使用`biosdecode`输出如下硬件信息

	=> IPMI Device
	=> Type of memory and speed
	=> Chassis Information
	=> Temperature Probe
	=> Cooling Device
	=> Electrical Current Probe
	=> Processor and Memory Information
	=> Serial numbers
	=> BIOS version
	=> PCI / PCIe Slots and Speed
	=> Much more

可以使用`biosdecode`输出如下BIOS配置

	=> SMBIOS (System Management BIOS)
	=> DMI (Desktop Management Interface, a legacy version of SMBIOS)
	=> SYSID
	=> PNP (Plug and Play)
	=> ACPI (Advanced Configuration and Power Interface)
	=> BIOS32 (BIOS32 Service Directory)
	=> PIR (PCI IRQ Routing)
	=> 32OS (BIOS32 Extension, Compaq-specific)
	=> VPD (Vital Product Data, IBM-specific)
	=> FJKEYINF (Application Panel, Fujitsu-specific)

`dmidecode` 是读取`biosdecode`数据已可阅读格式输出，以下命令是输出BIOS keywords

    dmidecode --type {KEYWORD / Number}

需要处理以下字符对

* bios
* system
* baseboard
* chassis
* processor
* memory
* cache
* connector
* slot

所有的DMI类型可以使用 `dmidecode --type {number}` 显示

	#dmidecode --type
	dmidecode: option `--type' requires an argument
	Type number or keyword expected
	Valid type keywords are:
	  bios
	  system
	  baseboard
	  chassis
	  processor
	  memory
	  cache
	  connector
	  slot

可用类型包括

	# Type	Short Description
	0	BIOS
	1	System
	2	Base Board
	3	Chassis
	4	Processor
	5	Memory Controller
	6	Memory Module
	7	Cache
	8	Port Connector
	9	System Slots
	10	On Board Devices
	11	OEM Strings
	12	System Configuration Options
	13	BIOS Language
	14	Group Associations
	15	System Event Log
	16	Physical Memory Array
	17	Memory Device
	18	32-bit Memory Error
	19	Memory Array Mapped Address
	20	Memory Device Mapped Address
	21	Built-in Pointing Device
	22	Portable Battery
	23	System Reset
	24	Hardware Security
	25	System Power Controls
	26	Voltage Probe
	27	Cooling Device
	28	Temperature Probe
	29	Electrical Current Probe
	30	Out-of-band Remote Access
	31	Boot Integrity Services
	32	System Boot
	33	64-bit Memory Error
	34	Management Device
	35	Management Device Component
	36	Management Device Threshold Data
	37	Memory Channel
	38	IPMI Device
	39	Power Supply

例如，电源信息

    dmidecode --type 39

# 参考

* [How to change Dell’s BIOS settings from a Linux command-line](https://www.colino.net/wordpress/archives/2008/05/21/how-to-change-dells-bios-settings-from-a-linux-command-line/)
* [HP Client Management Solutions](http://www8.hp.com/us/en/ads/clientmanagement/overview.html?404m=rt404Mb,newcclltow1en)