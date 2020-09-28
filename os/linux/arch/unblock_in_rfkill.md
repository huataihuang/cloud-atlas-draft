# rfkill block问题

之前在部署arch linux时比较偷懒，没有采用正规的网络设置方法，而是使用脚本来启动有线和无线网络。

* start_lan

```bash
sudo wpa_supplicant -c /etc/wpa_supplicant/wpa_supplicant-my_wifi.conf -D wired -i enp0s25 &
sleep 5
sudo dhcpcd enp0s25
```

* start_wifi

```bash
sudo ifconfig wlp3s0 down
sleep 1
sudo ifconfig wlp3s0 up
sudo wpa_supplicant -B -c /etc/wpa_supplicant/wpa_supplicant-my_wifi.conf -i wlp3s0
sleep 5
sudo dhcpcd wlp3s0
```

但是我发现发现无线脚本运行时候报错

```bash
SIOCSIFFLAGS: Operation not possible due to RF-kill
Successfully initialized wpa_supplicant
rfkill: WLAN soft blocked
dhcpcd-9.2.0 starting
DUID 00:04:62:91:a1:81:51:17:11:cb:b7:60:eb:9e:7a:2e:cc:7b
dhcpcd_prestartinterface: Operation not possible due to RF-kill
wlp3s0: waiting for carrier
timed out
dhcpcd exited
```

为何会出现 `rfkill: WLAN soft blocked` 报错？

参考 [How to unblock something listed in rfkill?](https://askubuntu.com/questions/98702/how-to-unblock-something-listed-in-rfkill)

- 检查 rfkill

```
rfkill list all
```

显示无线接口存在 `Soft blocked`

```
0: tpacpi_bluetooth_sw: Bluetooth
	Soft blocked: no
	Hard blocked: no
1: hci0: Bluetooth
	Soft blocked: no
	Hard blocked: no
2: phy0: Wireless LAN
	Soft blocked: yes
	Hard blocked: no
```

> "Hard blocked" 不能通过软件修改，需要检查是否是硬件开关关闭，例如ThinkPad笔记本的侧边有一个硬件拨动开关可以关闭无线设备
>
> "Soft blocked" 是软件关闭，例如失败的驱动或者内核模块导致连接断开

- 解除block: 这里可以看到无线接口是 `2: phy0: Wireless LAN` ，所以使用这个标号就是 `2`

```
rfkill unblock 2
```

- 然后再次 `rfkill list all` 检查就可以看到软件阻断已经关闭

```
0: tpacpi_bluetooth_sw: Bluetooth
	Soft blocked: no
	Hard blocked: no
1: hci0: Bluetooth
	Soft blocked: no
	Hard blocked: no
2: phy0: Wireless LAN
	Soft blocked: no
	Hard blocked: no
```

- 再次执行

```
./start_wifi
```

但是提示无法从驱动读取 SSID

```
Successfully initialized wpa_supplicant
wlp3s0: Could not read SSID from driver
dhcpcd-9.2.0 starting
DUID 00:04:62:91:a1:81:51:17:11:cb:b7:60:eb:9e:7a:2e:cc:7b
wlp3s0: waiting for carrier
timed out
dhcpcd exited
```

我发现可能是我在 `/etc/wpa_supplicant/wpa_supplicant-my_wifi.conf` 有一个配置影响了SSID获取

```
ap_scan=0
```

将这个配置修改成 `ap_scan=1` ，即

```bash
ctrl_interface=/var/run/wpa_supplicant
ap_scan=1
network={
  ssid="my_wifi"
  key_mgmt=WPA-EAP
  eap=PEAP
  phase1="peaplabel=0"
  phase2="auth=MSCHAPV2"
  identity="my_id"
  password="my_passwd"
}
```

然后再执行

```
sudo wpa_supplicant -c /etc/wpa_supplicant/wpa_supplicant-my_wifi.conf -i wlp3s0
```

则正常连接成功，此时使用 `iwconfig` 可以看到

```
...
wlp3s0    IEEE 802.11  ESSID:"my_wifi"
          Mode:Managed  Frequency:5.745 GHz  Access Point: xx:xx:xx:xx:xx:xx
          Bit Rate=12 Mb/s   Tx-Power=15 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:off
          Link Quality=53/70  Signal level=-57 dBm
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
          Tx excessive retries:0  Invalid misc:0   Missed beacon:0
...
```



# 完整配置

## 确保无线网卡已经激活

* 首先使用 `rfkill` 确保无线网卡已经激活

```
sudo apt install rfkill
```

* 检查无线网卡状态

```
rfkill list
```

如果wifi被软件block，需要unblock

```
rfkill unblock wifi
```

* 停止NetworkManager(如果是Ubuntu桌面版本，通常需要停止NetworkManager)

```
sudo systemctl stop NetworkManager
sudo systemctl disable NetworkManager
```

## 检查无线网卡接口

* 使用iwconfig命令检查

```
iwconfig
```

显示输出

```
lo        no wireless extensions.

enp0s25   no wireless extensions.

wlp3s0    IEEE 802.11  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated   Tx-Power=15 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:off

virbr0    no wireless extensions.

virbr0-nic  no wireless extensions.

anbox0    no wireless extensions
```

这里可以看到 `Access Point: Not-Associated`

如果无线接口没有显示，可能需要激活:

```
sudo ifconfig wlp3s0 up
```

* 然后扫描无线网络：

```
sudo iwlist wlp3s0 scan | grep ESSID
```

此时可以看到周围可用的无线热点名字列表

## 使用wpa_supplicant连接无线网络

* 安装wpa_supplicant

```
sudo apt install wpasupplicant
```

*  wapsupplicant提供了一个 `wpa_passphrase` 工具可以创建配置:

```
wpa_passphrase your-ESSID your-passphrase | sudo tee /etc/wpa_supplicant/wpa_supplicant-home.conf
```

* 然后我们通过命令行就可以连接

```
sudo wpa_supplicant -c /etc/wpa_supplicant/wpa_supplicant-home.conf -i wlp3s0
```

如果终端显示的输出没有报错，就可以在命令行上添加 `-B` 参数以便在后台运行 `wpa_supplicant` 进程

```
sudo wpa_supplicant -B -c /etc/wpa_supplicant/wpa_supplicant-home.conf -i wlp3s0
```

* 连接正常，则使用 `iwconfig` 可以看到已经连接到无线Access Point

* 最后执行dhcp

```
sudo dhclient wlp3s0
```

## 连接隐藏的无线网络

如果无线网络是隐藏SSID，则需要在 `wpa_supplicant.conf` 配置中加上 

```
scan_ssid=1
```

## 启动时自动连接

# 参考

* [Turn WIFI on from the command line - Still off](https://www.raspberrypi.org/forums/viewtopic.php?t=206223)
* [How to unblock something listed in rfkill?](https://askubuntu.com/questions/98702/how-to-unblock-something-listed-in-rfkill)
* [Using WPA_Supplicant to Connect to WPA2 Wi-fi from Terminal on Ubuntu 16.04 Server](https://www.linuxbabe.com/command-line/ubuntu-server-16-04-wifi-wpa-supplicant) - 这片文档写得非常详细，建议阅读参考