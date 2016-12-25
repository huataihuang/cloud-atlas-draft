线上服务器无法ssh，从带外检查看，不断出现

```
2016-12-09 00:21:54	INIT: cannot fork, retry..
2016-12-09 00:21:59	INIT: cannot fork, retry..
2016-12-09 00:23:44	INIT: Id "c0" respawning too fast: disabled for 5 minutes
2016-12-09 00:28:45	INIT: cannot fork, retry..
2016-12-09 00:28:50	INIT: cannot fork, retry..
2016-12-09 00:28:56	INIT: cannot fork, retry..
2016-12-09 00:29:01	INIT: cannot fork, retry..
```

> INIT无法fork进程问题排查请见 ["INIT: cannot fork"故障排查](../../process/management/init_cannot_fork)

oob reset重启了服务器，发现`dmesg`中有如下警告信息

```
[    0.326387] Your BIOS has requested that x2apic be disabled.
[    0.326388] This will leave your machine vulnerable to irq-injection attacks.
[    0.326388] Use 'intremap=no_x2apic_optout' to override BIOS request.
[    0.347119] Enabled IRQ remapping in xapic mode
[    0.351997] x2apic not enabled, IRQ remapping is in xapic mode
```