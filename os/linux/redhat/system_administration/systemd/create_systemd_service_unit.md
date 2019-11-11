[笔记本suspended后数秒无故wake up问题排查（"ACPI: Waking up from system sleep state S3"](../../../kernel/cpu/acpi_wake_up_system_sleep_state_s3)，解决休眠问题的方法是通过[systemd管理rc.local启动](rc_local)来执行电源管理设置。

此外为了解决nVidia显卡的屏幕亮度调节问题，还需要启动时执行 `setpci` 指令。本文描述如何将脚本打包成systemd的服务单元配置，采用标准systemd实现脚本或服务运行。

在RHEL/CentOS 7上，兼容以往的`init`模式的启动脚本，依然提供了 `/etc/rc.local` 配置，只是需要[systemd管理rc.local启动](rc_local)。

Arch Linux没有默认rc.local支持，但还是可以参考 [rc.local support on Arch Linux with systemd](https://raymii.org/s/tutorials/rc.local_support_on_Arch_Linux_and_systemd.html)自己搞一个兼容方式。

- 编辑 `/usr/lib/systemd/system/rc-local.service` :

```
[Unit]
Description=/etc/rc.local Compatibility

[Service]
Type=oneshot
ExecStart=/etc/rc.local
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

- 编辑 `/etc/rc.local` 设置:

```
#!/usr/bin/bash

echo XHC1 | tee /proc/acpi/wakeup
setpci -v -H1 -s 00:01.00 BRIDGE_CONTROL=0
```

- 给 `/etc/rc.local` 添加可执行属性:

```
chmod 755 /etc/rc.local
```

- 激活服务

```
systemctl enable rc-local.service
```

> [Use systemd to Start a Linux Service at Boot](https://www.linode.com/docs/quick-answers/linux/start-service-at-boot/) 有一个简单的将脚本运行成服务的方法可以参考

# 参考

- [rc.local support on Arch Linux with systemd](https://raymii.org/s/tutorials/rc.local_support_on_Arch_Linux_and_systemd.html)
- [How to create systemd service unit in Linux](https://linuxconfig.org/how-to-create-systemd-service-unit-in-linux)