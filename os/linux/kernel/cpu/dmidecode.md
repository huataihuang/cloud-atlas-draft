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

# 参考

* [How to determine the number of cpu/cores in redhat linux.](https://www.redhat.com/archives/redhat-list/2011-August/msg00007.html)
* [Figuring out CPUs and Sockets - Updated! ](https://access.redhat.com/discussions/480953)