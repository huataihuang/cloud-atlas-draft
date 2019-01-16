在 [通过linux命令行修改服务器BIOS配置](modify_bios_through_linux_command) 介绍了Linux平台下修改服务器BIOS的方法，基本上各个服务器厂商都采用AMI的BIOS，基本工具实际是相同的。

[AMI Setup Control Environment (AMISCE)](https://ami.com/en/products/bios-uefi-tools-and-utilities/bios-uefi-utilities/) 是命令行工具提供了更新NVRAM变量，也就是直接设置BIOS的方法。AMISCE提供了一个脚本来列出系统所有的设置选项问题，然后用户就可以通过修改这个脚本文件并使用它来正确修改NVRAM设置变量。

AMISCE 在 Linux 下通過 `SCELNX_64` 命令行工具來配置 BIOS ，`SCELNX_64` 依赖 `kernel-devel` 软件包：

```
yum install -y kernel-devel
```

# 准备工作

* 通过远程ipmi方式先验证能够通过串口控制台访问服务器：

```
ipmitool -I lanplus -H IP  -U username -P password -E sol activate
```

* 登录服务器，通过ipmitool将服务器引导到BIOS界面，方法请参考 [ipmitool使用tips](../ipmi/ipmitool_tips):

```bash
ipmitool raw 0x00 0x08 0x05 0x80 0x18 0x00 0x00 0x00
ipmitool chassis bootdev bios
ipmitool chassis bootparam set bootflag force_bios
```

* 重启服务器

```
sync;sync;sync
shutdown -r now
```

> 重启后服务器会自动进入BIOS界面

# 通过SCELNX设置

* 首先读取并保存 AMI BIOS 配置文件 NVRAM script file:

```
SCELNX_64 /o /lang /s BIOS-with-map-string.cfg /hb
```

> 对于早期版本工具，可能不支持`/lang`参数或者`/hb`参数，可以简化为 `SCELNX_64 /o /s BIOS-with-map-string.cfg`。

只有 `/lang` 参数导出的配置文件，才包含BIOS配置项对应的 `map string`

例如：

具有 `map string` 的导出配置

```
Setup Question  = Active Video
Map String  = IRCS001
Token   =22 // Do NOT change this line
Offset  =4F
Width   =01
BIOS Default =[00]Auto
Options =*[00]Auto  // Move "*" to the desired Option
         [01]Onboard Device
         [02]PCIE Device
```

没有 `map string` 的导出配置

```
Setup Question  = Active Video
Token   =22 // Do NOT change this line
Offset  =4F
Width   =01
BIOS Default =[00]Auto
Options =*[00]Auto  // Move "*" to the desired Option
         [01]Onboard Device
         [02]PCIE Device
```

`map string`可以帮助我们定位BIOS问题，例如，我们如果只需要检查单一的选项，就可以按照 `map string` 查询：

```
Single Question Export Usage:
    SCELNX_64 /o [/lang <Lang Code>] /ms <question map string> [/q] [/d] [/hb]
```

* 查看 BIOS 单一配置选项的命令

# 设置举例

我们需要开启服务器NUMA功能

* 首先输出BIOS当前配置文件：

```
SCELNX_64 /o /lang /s bios_no_numa.cfg /hb
```

* 检查配置文件 bios_no_numa.cfg 可以看到有关Numa配置，当前是关闭状态：

```
Setup Question  = Numa
Map String  = CRCS005
Token   =0C // Do NOT change this line
Offset  =09
Width   =01
BIOS Default =[00]Disable
Options =*[00]Disable   // Move "*" to the desired Option
         [01]Enable
```

此时使用 `numactl -H` 可以看到只有一个node:

```
available: 1 nodes (0)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
node 0 size: 195995 MB
node 0 free: 7216 MB
node distances:
node   0
  0:  10
```

不过，为了能够设置BIOS，需要选择一台同型号规格服务器，通过带外控制台防伪BIOS的交互界面，设置好NUMA，然后重启并使用上述命令导出一份激活了NUMA的BIOS配置，以便确定需要修改的内容：

对比可知激活NUMA的设置如下：

```
Setup Question  = Numa
Map String  = CRCS005
Token   =0C // Do NOT change this line
Offset  =09
Width   =01
BIOS Default =[00]Disable
Options =[00]Disable    // Move "*" to the desired Option
         *[01]Enable
```

通过对比可以看到，如果只是激活 双node 配置的 NUMA，实际修改配置内容非常少，只有

```
Options =[00]Disable    // Move "*" to the desired Option
         *[01]Enable
```

* 既然我们通过 `/lang` 参数已经获得了有关NUMA配置的 `map string` 值是 `CRCS005`，所以我们可以通过以下命令单独查询出NUMA配置项

```
./SCELNX_64 /o /ms CRCS005 /hb
```

输出就是选项设置，如下

```
Options	=*[00]Disable
         [01]Enable
```

* 根据 `map string` 修改单独配置项

```
./SCELNX_64 /i /ms CRCS005 /qv 0x01 /hb
```

提示：

```
Question value imported successfully.
```

* 再次检查NUMA单项配置，可以看到BIOS已经调整成激活NUMA

```
#./SCELNX_64 /o /ms CRCS005 /hb
Options	=[00]Disable
         *[01]Enable
```

> 注意：有些BIOS配置需要修改多个位置，例如 `Boot Option` 就有多个问题设置需要修改，必须全部修改才能生效。见原文：[使用 AMI SCELNX 工具配置 BIOS](https://hk.saowen.com/a/73bab0c6a52dddf9cd4b55ef13c0e844c1d5e4312d2c002e63cfc548be87fe31)

* 重启服务器，重启以后，使用 `numactl -H` 验证可以看到服务器的NUMA已经激活

```
#numactl -H
available: 2 nodes (0-1)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12
node 0 size: 97691 MB
node 0 free: 9668 MB
node 1 cpus: 13 14 15 16 17 18 19 20 21 22 23 24
node 1 size: 98304 MB
node 1 free: 12509 MB
node distances:
node   0   1
  0:  10  21
  1:  21  10
```

# 参考

* [使用 AMI SCELNX 工具配置 BIOS](https://hk.saowen.com/a/73bab0c6a52dddf9cd4b55ef13c0e844c1d5e4312d2c002e63cfc548be87fe31)