在Linux上设置系统时间命令，传统上非常简单，就是用一条 `date` 命令。然而，结合NTP协议部署，以及时区、硬件时钟同步，实际上需要我们注意一些基本的配置。

# 系统时间显示

首先我们介绍一下最简单的显示系统时钟和调整的方法: `date`

- 首先 `date` 是一个显示系统时间命令:

```bash
date
```

显示输出类似

```
Wed Jun  2 09:53:43 CST 2021
```

- 对于主机，哟一个硬件时钟，可以通过 `hwclock` 命令显示:

```
hwclock -r
```

或者

```
hwclock --show
```

显示输出

```
2021-06-02 09:54:43.287056+08:00
```

可以显示对应的世界协调时(Coordinated Universal time, UTC):

```
hwclock --show --utc
```

显示输出依然是东八区时间

```
2021-06-02 09:58:14.629137+08:00
```

# hwclock

Linux的系统时间和主机的硬件时间是两套系统，使用 `hwclock` 可以显示也能调整系统硬件时钟

* `hwclock` 命令默认显示硬件时钟，参数 `-r` 和 `--show` 相同:

```
#hwclock
2021-06-02 11:30:44.493312+08:00

#hwclock -r
2021-06-02 11:30:49.769558+08:00

#hwclock --show
2021-06-02 11:30:54.537828+08:00
```

和 `date` 命令不同， `date` 命令显示的是内核维护的时钟


# 手工设置硬件时钟和系统时钟

* `hwclock` 提供了 `--set` 和 `--date` 选项来调整硬件时钟

```
hwclock --set --date "6/2/2021 23:10:45"
```

* `date` 命令提供了 `--set="SRING"` 方式设置系统时间:

```
date --set="2 JUN 2021 11:45:00"
```

此外也可以通过格式传递方式来设置日期和时间

```
date +%Y%m%d -s "20210602"

date +%T -s "10:13:13"
```

## 同步(copy)系统时钟到硬件时钟

通过NTP协议可以校准Linux内核维护的系统时钟，但是如果没有持续的联网NTP校准维护，系统时钟有可能偏移或者服务器重启后又回退到采用硬件时钟(可能不准确)，所以我们需要把NTP校准(或者手工校准)时钟同步到硬件时钟:

`hwclock` 提供了参数 `-w` 和 `--systohc` 都可以实现把系统时钟写入到硬件时钟，矫正硬件时钟:

```bash
hwclock -w
hwclock --systohc
```

## 同步硬件时钟到系统时钟

如果硬件时钟准确，但是系统时钟偏移(这种情况比较少见)，可以通过 `-s` 参数 或者 `--hctosys` 参数把硬件时钟同步到系统时钟:

```
hwclock -s

hwclock --hctosys
```

# timedatectl

现在来介绍 `systemd` 配套大杀器 `timedatectl` 工具，这是现代化Linux提供的完整时间调整工具

## 时间

* 显示时间

```
timedatectl
```

显示输出

```
               Local time: Wed 2021-06-02 11:48:08 CST
           Universal time: Wed 2021-06-02 03:48:08 UTC
                 RTC time: Wed 2021-06-02 03:48:08
                Time zone: Asia/Shanghai (CST, +0800)
System clock synchronized: yes
              NTP service: inactive
          RTC in local TZ: no
```

* 调整时间

```
timedatectl set-time YYYY-MM-DD
```

举例

```
timedatectl set-time '2021-06-02'
```

```
timedatectl set-time YYYY-MM-DD HH:MM:SS
```

举例

```
timedatectl set-time '2021-06-02 11:50:00'
```

## 时区

* 显示所有支持时区

```
timedatectl list-timezones
```

* 设置时区

```
timedatectl set-timezone 'Asia/Shanghai'
```

## NTP同步

`timedatectl` 提供了启用ntp同步方法

```
timedatectl set-ntp yes
```

此时使用 `timedatectl` 命令可以看到:

```
...
System clock synchronized: no
              NTP service: active
```

注意，默认配置 `/etc/systemd/timesyncd.conf` 配置需要确保能访问正确时间服务器

```
[Time]
#NTP=
#FallbackNTP=0.rhel.pool.ntp.org 1.rhel.pool.ntp.org 2.rhel.pool.ntp.org 3.rhel.pool.ntp.org
```

如果服务器能够访问internet，则即使没有配置NTP服务器，也可以通过 `FailbackNTP` 访问internet上公共NTP服务器进行时间同步，过一会再次使用 `timedatectl` 命令检查可以看到同步

```
...
System clock synchronized: yes
              NTP service: active
...
```

# 参考

* [Linux Set Date and Time From a Command Prompt](https://www.cyberciti.biz/faq/howto-set-date-time-from-linux-command-prompt/)
* [7 Linux hwclock Command Examples to Set Hardware Clock Date Time](https://www.thegeekstuff.com/2013/08/hwclock-examples/)