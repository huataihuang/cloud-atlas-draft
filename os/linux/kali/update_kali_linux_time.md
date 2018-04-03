[在树莓派Zero W上运行Kali Linux](../../../develop/raspberry_pi/running_kali_linux_on_raspberry_pi_zero_w)之后，发现每次尝试更新系统都出现如下报错：

```
root@kali:~# apt update
Get:1 http://mirrors.neusoft.edu.cn/kali kali-rolling InRelease [30.5 kB]
Reading package lists... Done
W: http: aptMethod::Configuration: could not load seccomp policy: Invalid argument
W: http: aptMethod::Configuration: could not load seccomp policy: Invalid argument
E: Release file for http://http.kali.org/kali/dists/kali-rolling/InRelease is not valid yet (invalid for another 101d 9h 32min 36s). Updates for this repository will not be applied.
```

可以看到提示信息中显示时间差异`invalid for another 101d 9h 32min 36s`，仔细检查系统时间可以看到，当前系统时钟还停留在`2017年`，而准确的当前时间是2018年：

```
root@kali:~# date
Thu Dec 21 14:36:31 UTC 2017
```

# 矫正Kali Linux时钟

# 配置时区

## BIOS时间设置local模式

编辑 `/etc/timezone` 设置

```
Asia/Shanghai
```

## 硬件时钟

> 在树莓派上没有如何设置硬件时钟的方法（参考[How to check if hardware clock is in UTC or Local time](https://askubuntu.com/questions/728590/how-to-check-if-hardware-clock-is-in-utc-or-local-time)），使用`sudo hwclok --debug`显示：

```
Trying to open: /dev/rtc0
Trying to open: /dev/rtc
Trying to open: /dev/misc/rtc
No usable clock interface found.
hwclock: Cannot access the Hardware Clock via any known method.
```

检查`timedatectl`显示输出

```
# timedatectl status
                      Local time: Thu 2017-12-21 14:54:17 UTC
                  Universal time: Thu 2017-12-21 14:54:17 UTC
                        RTC time: n/a
                       Time zone: Etc/UTC (UTC, +0000)
       System clock synchronized: no
systemd-timesyncd.service active: yes
                 RTC in local TZ: no
```

## 设置本地时间软链接

`/etc/localtime` 做软链接指向时区

```
unlink /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime 
```

## 矫正系统时间

```
ntpdate pool.ntp.org
```

此时检查时钟如下：

```
# timedatectl status
                      Local time: Mon 2018-04-02 11:56:49 CST
                  Universal time: Mon 2018-04-02 03:56:49 UTC
                        RTC time: n/a
                       Time zone: Asia/Shanghai (CST, +0800)
       System clock synchronized: no
systemd-timesyncd.service active: yes
                 RTC in local TZ: no
```

## 检查和设置时钟同步

* 检查`timesyncd`服务

```
# systemctl status systemd-timesyncd

● systemd-timesyncd.service - Network Time Synchronization
   Loaded: loaded (/lib/systemd/system/systemd-timesyncd.service; enabled; vendo
   Active: failed (Result: exit-code) since Fri 2017-12-15 06:10:29 CST; 3 month
     Docs: man:systemd-timesyncd.service(8)
 Main PID: 302 (code=exited, status=1/FAILURE)
   Status: "Shutting down..."

Dec 15 06:10:29 kali systemd[1]: systemd-timesyncd.service: Service has no hold-
Dec 15 06:10:29 kali systemd[1]: systemd-timesyncd.service: Scheduled restart jo
Dec 15 06:10:29 kali systemd[1]: Stopped Network Time Synchronization.
Dec 15 06:10:29 kali systemd[1]: systemd-timesyncd.service: Start request repeat
Dec 15 06:10:29 kali systemd[1]: systemd-timesyncd.service: Failed with result '
Dec 15 06:10:29 kali systemd[1]: Failed to start Network Time Synchronization.
```

* 启动过`timesyncd`

```
systemctl start systemd-timesyncd.service
```

* 设置系统启动时启动时间同步（不过默认就是启动的）

```
systemctl enable systemd-timesyncd.service
```

完成时钟同步之后，再次使用`apt update`就不会报错了

# 参考

* [Date Time](https://wiki.debian.org/DateTime)
* [Time Synchronisation](https://help.ubuntu.com/lts/serverguide/NTP.html)