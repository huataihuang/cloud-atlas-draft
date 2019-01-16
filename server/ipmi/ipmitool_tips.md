# 重启MC控制器

如果能够登录操作系统，可以在操作系统执行命令

```bash
modprobe ipmi-devintf
modprobe ipmi-si
ipmitool mc reset cold
```

> 在系统级别变更后重启操作系统前，一定要确保带外能够正确访问终端，所以建议在操作系统中执行一次`mc reset cold`
>
> 注意，一定要加载impi模块，否则会提示无法找到设备

也可以远程访问

```bash
ipmitool -I lanplus -H IP -U username -P password mc reset cold
```

## Ubuntu的ipmi

```bash
apt install ipmitool
```



# 远程访问终端

```bash
ipmitool -I lanplus -H IP  -U username -P password -E sol activate
```

# 重启服务器

```bash
ipmitool -I lanplus -H IP -U username -P password power reset
```

# 检查服务器sol日志（故障原因）

```bash
ipmitool sel list
```

# 设置启动设备

## 设置服务器从PXE重启

```bash
ipmitool raw 0x00 0x08 0x05 0x80 0x04 0x00 0x00 0x00

# 推荐临时启动PXE
ipmitool chassis bootdev pxe
ipmitool chassis bootparam set bootflag force_pxe
```

## 设置强制启动进入BIOS设置

```bash
ipmitool raw 0x00 0x08 0x05 0x80 0x18 0x00 0x00 0x00
ipmitool chassis bootdev bios
ipmitool chassis bootparam set bootflag force_bios
```

## 从默认的硬盘启动

```bash
ipmitool raw 0x00 0x08 0x05 0x80 0x08 0x00 0x00 0x00
ipmitool chassis bootdev disk
ipmitool chassis bootparam set bootflag force_disk
```

## 从CD/DVD启动

```
ipmitool raw 0x00 0x08 0x05 0x80 0x14 0x00 0x00 0x00
ipmitool chassis bootdev cdrom
ipmitool chassis bootparam set bootflag force_cdrom
```

## 获取系统启动选项 - NetFn = Chassis (0x00h), CMD = 0x09h

```
ipmitool raw 0x00 0x09 Data[1:3]
```

例如：

```
$ ipmitool raw 0x00 0x09 0x05 0x00 0x00
 01 05 80 18 00 00 00
Where,
Response Data[5]
0x00: No override
0x04: Force PXE
0x08: Force boot from default Hard-drive
0x14: Force boot from default CD/DVD
0x18: Force boot into BIOS setup
```

# 参考

* [IPMI-Chassis Device](https://github.com/erik-smit/oohhh-what-does-this-ipmi-doooo-no-deedee-nooooo/blob/master/1-discovering/snippets/Computercheese/IPMI-Chassis%20Device%20Commands.txt)