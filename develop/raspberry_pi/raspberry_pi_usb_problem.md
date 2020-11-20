在 [USB移动硬盘启动树莓派](boot_from_usb_storage_on_raspberry_pi) 我发现树莓派4的USB接口可能有以下问题：

* 两个USB 3接口同时各自连接一个WD My Passpot SSD移动硬盘，使用 `dd` 命令进行硬盘复制，大约10秒多点，源盘就无法读取数据，不断报读取错误并hang住主机
* 使用USB外接移动硬盘时候，可能会影响无线连接 2GHz - 我的实践是发现无法正常连接公司的5GHz的WPA PEAP认证无线AP，始终显示连接 `00:00:00:00:00:00` 不存在的bssid节点 ，目前我在 [排查树莓派无线网络连接](debug_systemd_networkd) 遇到问题没有解决，不过也在查找资料中发现可能确实有比较多的问题存在。

我暂时把可能的一些问题线索整理在这里，等有时间仔细排查

- [RPI4 cannot connect to WIFI - status_code=16](https://www.raspberrypi.org/forums/viewtopic.php?f=28&t=274715&sid=38c2ba82c63d25387614ba4e791df3a7) 这个问题现象和我遇到的问题非常接近，剔除的解决方法是 **wifi-HDMI interference** 降低屏幕分辨率到 1600x1200 。但是我采用了这个方法没有解决

- [USB3 and 2.4 GHz Wifi #1430](https://github.com/raspberrypi/firmware/issues/1430) 提到了Intel手册 [USB 3.0* Radio Frequency Interference on 2.4 GHz Devices](https://www.intel.com/content/www/us/en/products/docs/io/universal-serial-bus/usb3-frequency-interference-paper.html) 说明了USB3.0无线频率影响2.4GHz设备，这个是普遍的问题，并不是树莓派独有现象。具体需要阅读Intel文档

- [Problems adding a USB 3.0 SSD to PI4](https://www.raspberrypi.org/forums/viewtopic.php?f=36&t=266353) 提到了当USB 3.0 SSD存储连接到树莓派上会影响无线游戏手柄，我感觉这个问题极有可能和我的case相似。此外这个问题也是和2.4GHz有关

- [Pi4, USB3, and Wireless 2.4Ghz interference](https://www.indilib.org/forum/general/6576-pi4-usb3-and-wireless-2-4ghz-interference.html)

- [STICKY: If you have a Raspberry Pi 4 and are getting bad speeds transferring data to/from USB3.0 SSDs, read this](https://www.raspberrypi.org/forums/viewtopic.php?f=28&t=245931) 说明了USB固态存储和树莓派4的匹配情况，有可能某些设备会速度非常慢



