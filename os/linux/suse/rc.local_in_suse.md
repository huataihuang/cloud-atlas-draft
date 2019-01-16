# SuSE 12

SuSE 12使用了systemd，默认不再支持 `/etc/rc.local` 这样的启动脚本。需要通过Unit配置来定制一个类似`after.local`这样的启动脚本。

* 创建`after-local.service`服务配置

注意：这里将systemd配置文件存放在 `/usr/lib/systemd/system/` 目录下，你的发行版可能会存放在 `/lib/systemd/system/`

```bash
cat << EOF > /usr/lib/systemd/system/after-local.service
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
[Unit]
Description=/etc/init.d/after.local Compatibility
ConditionFileIsExecutable=/etc/init.d/after.local
[Service]
Type=oneshot
ExecStart=/etc/init.d/after.local
TimeoutSec=0
StandardOutput=tty
RemainAfterExit=yes
SysVStartPriority=99
[Install]
WantedBy=multi-user.target
EOF
```

* 激活 `after-local.service` 服务：

```
sudo systemctl enable /usr/lib/systemd/system/after-local.service
```

* 然后配置启动脚本 `/etc/init.d/after.local`

```
cat << EOF > /etc/init.d/after.local
#!/bin/bash
/opt/bin/my_boot_script.sh run
touch /var/lock/subsys/local
EOF
chmod 755 /etc/init.d/after.local
```

# SuSE 10/11

在SuSE 10/11 上，可以使用 `/etc/init.d/boot.local` 配置来实现启动时执行必要脚本。不过，这个`boot.local`中执行的程序是在进入第一个run level之前执行的，所以如果运行脚本依赖网络或者其他设备就绪，可能会运行失败。

可以尝试在 `/etc/init.d/after.local` 和 `/etc/init.d/before.local` 添加运行脚本，具体请仔细检查 `/etc/rc.d/rc` 中调用 `/etc/inittab` 的脚本，我没有实践。

# 参考

* [systemd and using the after.local script in openSUSE 12.3](https://forums.opensuse.org/content.php/120-systemd-and-using-the-after-local-script-in-openSUSE-12-1)
* [openSUSE 11.2 怎么没有 /etc/rc.d/rc.local 啊？](http://www.csuboy.com/read-renqi-tid-151357-page-e-fpage-13.html) 和 [Equivalent of rc.local in SUSE 10](https://www.linuxquestions.org/questions/suse-opensuse-60/equivalent-of-rc-local-in-suse-10-a-524575/)