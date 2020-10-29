我在使用Synergy实现多个桌面共享键盘鼠标时，感觉在Linux桌面共享给macOS使用键盘鼠标，移动鼠标时候有时候会发生卡顿现象，快速移动鼠标时候，看top输出中Xorg似乎也是占用了比较高的cpu使用率。

我初略google了一下，了解到使用高分辨率鼠标，鼠标的采样频率对usbhid设备有比较大的影响。

鼠标的默认采样间隔是10ms，也就是100Hz。但是USB控制器会圆整调节到最近的采样间隔，所以采样间隔实际上设置会从 10ms 逐步调整为 8ms, 7ms 以及 4ms等等。以下是采样间隔和对应Hz

| Hz | 1000 | 500 | 250 | 125 |
| ---- | ---- | ---- | ---- | ---- |
| ms | 1 | 2 | 4 | 8 |

注意，如果 polling rate 设置为 125则鼠标位置每8ms更新一次，这对一些游戏场景可能不能接受。但是如果缩短采样间隔时间，即提高采样率，就会消耗更多的CPU资源。

# 显示polling interval

* 首先找到设备厂商

```
lsusb
```

例如我的富勒蓝牙鼠标，对应的设备显示如下

```
Bus 001 Device 004: ID 1a81:1004 Holtek Semiconductor, Inc.
```

可以看到这个鼠标设备对应的USB ID 是 `1a81:1004`

* 使用root身份检查这个设备对应ID的debug信息:

```
grep -B3 -A6 1a81.*1004 /sys/kernel/debug/usb/devices
```

输出显示

```
T:  Bus=01 Lev=02 Prnt=02 Port=00 Cnt=01 Dev#=  7 Spd=1.5  MxCh= 0
D:  Ver= 2.00 Cls=00(>ifc ) Sub=00 Prot=00 MxPS= 8 #Cfgs=  1
P:  Vendor=1a81 ProdID=1004 Rev= 0.01
S:  Manufacturer=G-Tech
S:  Product=Wireless Dongle
C:* #Ifs= 2 Cfg#= 1 Atr=a0 MxPwr= 98mA
I:* If#= 0 Alt= 0 #EPs= 1 Cls=03(HID  ) Sub=01 Prot=01 Driver=usbhid
E:  Ad=81(I) Atr=03(Int.) MxPS=   8 Ivl=10ms
I:* If#= 1 Alt= 0 #EPs= 1 Cls=03(HID  ) Sub=01 Prot=02 Driver=usbhid
```

这里可以看到输出信息显示

```
... Spd=1.5 ...
...
... Ivl=10ms
```

这里的 `Ivl` 就是 polling interval， 而这里 `spd` 是USB设备速率 1.5Mbit/s

也可以使用以下命令检查

```bash
lsusb -vd 1a81:1004 | grep bInterval
```

# 配置polling interval

配置鼠标的poll参数是通过 `usbhid` 内核模块设置，默认设置是0也就是由设备使用自己内建间隔

* 当前采样间隔可以通过以下命令检查

```bash
systool -m usbhid -A mousepoll
```

* 也可以直接查看内核

```bash
cat /sys/module/usbhid/parameters/mousepoll
```

显示值是0，这个值可以在线调整，如果你发现移动鼠标导致Xorg较高的CPU占用率，可以设置固定的采样频率，避免设备自动调整采样频率消耗较多的Xorg的cpu资源:

```bash
echo "4" > /sys/module/usbhid/parameters/mousepoll
```

要永久调整这个配置，可以设置usbhid内核模块，修改 `/etc/modprobe.d/usbhid.conf` :

```bash
options usbhid mousepoll=4
```

如果要修改这个参数无需重启，在需要重新加载 usbhid 内核模块

```bash
modprobe -r usbhid && modprobe usbhid
```

不过，如果usbhid是编译进内核的，则提示错误

```
modprobe: FATAL: Module usbhid is builtin.
```

对于直接将 usbhid 编译进内核的Linux系统，则通过在线调整 `echo "4" > /sys/module/usbhid/parameters/mousepoll` ，另外可以通过修改启动内核参数来修改。即修改 `/etc/default/grub`

```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash usbhid.mousepoll=4"     
```

然后执行更新grub:

```
update-grub
```

并重启系统使之生效。

# 参考

* [arch linux - Mouse polling rate](https://wiki.archlinux.org/index.php/Mouse_polling_rate)
* [Xorg: High CPU Usage (94%) on Moving Mouse (Ubuntu 18.04)](https://askubuntu.com/questions/1068538/xorg-high-cpu-usage-94-on-moving-mouse-ubuntu-18-04)