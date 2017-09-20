在Linux内核包含了一个SMBIOS解码器，允许系统管理员检查系统硬件配置并激活或禁用一些特定系统来修复问题，这个方法是基于SMBIOS信息。用户命令工具`dmidecode`和这个检查这个内核数据。

# 检查处理器信息

`dmidecode -t 4`提供了检查CPU信息的功能：

例如要要想知道有多少内核，可以grep 这个信息输出中的`Core`部分：

```
sudo dmidecode -t 4 | grep Core
```

输出可以看到48核输出信息

```
	Core Count: 24
	Core Enabled: 24
		Multi-Core
	Core Count: 24
	Core Enabled: 24
		Multi-Core
```

也可以检查CPU类型

```
$sudo dmidecode -t 4 | grep CPU
	Socket Designation: CPU0
	Version: Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz
	Socket Designation: CPU1
	Version: Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz
```

# 检查内存信息

`dmidecode -t memory` 指令可以用来检查内存规格信息，例如主频等：

```
Handle 0x0046, DMI type 17, 34 bytes
Memory Device
	Array Handle: 0x0036
	Error Information Handle: Not Provided
	Total Width: 72 bits
	Data Width: 64 bits
	Size: 16384 MB
	Form Factor: DIMM
	Set: None
	Locator: CPU1_D1
	Bank Locator: CPU1_Bank7
	Type: DDR3
	Type Detail: Registered (Buffered)
	Speed: 1600 MHz
	Manufacturer: Hynix Semiconducto
	Serial Number: 24CFB72A
	Asset Tag: Dimm7_AssetTag
	Part Number: HMT42GR7BFR4A-PB
	Rank: 2
	Configured Clock Speed: 1600 MHz
```

> 也可以使用 `sudo dmidecode --type 17` 来显示内存相关信息（注意：前述内存信息中就有`Handle 0x0046, DMI type 17, 34 bytes`，显示内存就是`DMI type 17`）

# 参考

* [How to determine the number of cpu/cores in redhat linux.](https://www.redhat.com/archives/redhat-list/2011-August/msg00007.html)
* [Figuring out CPUs and Sockets - Updated! ](https://access.redhat.com/discussions/480953)