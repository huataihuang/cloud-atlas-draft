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

# 设置服务器从PXE重启

```bash
ipmitool chassis bootdev pxe
```