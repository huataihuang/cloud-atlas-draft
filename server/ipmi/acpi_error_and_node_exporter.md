服务器异常重启，发现系统日志

```bash
Jul  5 08:37:53 server.example kernel: ACPI Error: SMBus/IPMI/GenericSerialBus write requires Buffer of length 66, found length 32 (20130517/exfield-299)
Jul  5 08:37:53 server.example kernel: ACPI Error: Method parse/execution failed [\_SB_.PMI0._PMM] (Node ffff880fe8cf2118), AE_AML_BUFFER_LIMIT (20130517/psparse-536)
Jul  5 08:37:53 server.example kernel: ACPI Exception: AE_AML_BUFFER_LIMIT, Evaluating _PMM (20130517/power_meter-339)
```

上述日志是有关ACPI电源管理的报错，搜索了一下，原因是HP的硬件/firmware的bug，可以参考 [Kernel ACPI Error SMBus/IPMI/GenericSerialBus](http://www.serveradminblog.com/2015/05/kernel-acpi-error-smbusipmigenericserialbus/):

当 `lm-sensors` 从电源检测感应器(power meter sensor)读取数值，HP会会忽略这个方法的参数，这就导致了上述错误。这个错误消息实际上就是BIOS和内核之间的诊断出现了ACPI buffer大小相关的问题，涉及到电源监控。由于这个问题是BIOS的bug，通常需要从硬件厂商这里获得firmware更新来解决。不过，如果无法更新firmware，则可以关闭 `acpi_power_meter` 内核模块来简单解决。

注意：通常情况下，操作系统安装了 `lm-sensors` 工具包才会出现上述报错日志。不过，如果你安装了prometheus的node_exporter用来输出主机的metrics，则系统日志会不断滚动上述报错 - 原因和解决方法请参考 [node_exporter creating ACPI Error with Kernel error log #903](https://github.com/prometheus/node_exporter/issues/903) ，下文我将介绍解决方法。

可以查看 `power1_avreage` 文件:

```bash
find /sys/devices/LNXSYSTM\:00/ |grep ACPI000D
```

可以看到该文件位于 `/sys/devices/LNXSYSTM:00/device:00/ACPI000D:00/` 目录下，你可以尝试读取该文件:

```bash
cat /sys/devices/LNXSYSTM:00/device:00/ACPI000D:00/power1_average
```

此时返回的值可能是 0 ，同时日志文件出现上述报错。

* 安装`sensors`工具:

```
yum install lm_sensors
```

然后检查感应器:

```
sensors
```

输出可以看到如下

```
...
power_meter-acpi-0
Adapter: ACPI interface
power1:        0.00 W  (interval = 300.00 s)
...
```

可以看到这个电源感应器是 `power_meter-acpi-0` ，然后我们在配置文件 `/etc/sensors3.conf` 添加

```
chip "power_meter-acpi-0"
        ignore power1
```

此时再次使用 `sensors` 命令检查，可以看到输出有所不同，一斤关闭了 `power1` :

```
power_meter-acpi-0
Adapter: ACPI interface
```

# prometheus node_exporter

我遇到的案例是 HP ProLiant DL360p Gen8 服务器上安装了 Prometheus node_exporter 之后，系统日志不断滚动出现ACPI错误

```
Jul  5 16:22:43 server.example kernel: ACPI Error: SMBus/IPMI/GenericSerialBus write requires Buffer of length 66, found length 32 (20130517/exfield-299)
Jul  5 16:22:43 server.example kernel: ACPI Error: Method parse/execution failed [\_SB_.PMI0._PMM] (Node ffff880fe8cf2118), AE_AML_BUFFER_LIMIT (20130517/psparse-536)
Jul  5 16:22:43 server.example kernel: ACPI Exception: AE_AML_BUFFER_LIMIT, Evaluating _PMM (20130517/power_meter-339)
```

虽然这个错误是无害的，可以完全忽略，但是对于强迫症SA来说，这个滚动报错实在太多，浪费了系统资源。

解决方法参考 [Frequent ACPI errors starting with SMBus or IPMI write requires Buffer of length 42.](https://support.microfocus.com/kb/doc.php?id=7010449) ，如果不能更新服务器BIOS firmware，就通过关闭内核 `acpi_power_meter` 模块绕过这个问题。操作命令可以参考 [node_exporter creating ACPI Error with Kernel error log #903](https://github.com/prometheus/node_exporter/issues/903)

* 对于RHEL6执行以下命令

```bash
modprobe -r power_meter
echo "blacklist power_meter" >>/etc/modprobe.d/hwmon.conf
```

* 对于RHEL7执行以下命令

```bash
modprobe -r acpi_power_meter
echo "blacklist acpi_power_meter" >>/etc/modprobe.d/hwmon.conf 
```

# 参考

* [Frequent ACPI errors in dmesg ring buffer #827](https://github.com/netdata/netdata/issues/827)
* [node_exporter creating ACPI Error with Kernel error log #903](https://github.com/prometheus/node_exporter/issues/903)
* [Frequent ACPI errors starting with SMBus or IPMI write requires Buffer of length 42.](https://support.microfocus.com/kb/doc.php?id=7010449)
* [Frequent ACPI errors in dmesg ring buffer #827](https://github.com/netdata/netdata/issues/827)