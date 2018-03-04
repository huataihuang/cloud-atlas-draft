默认情况下树莓派Raspberry Pi是从SD卡启动系统的，但是SD卡存储容量有限，如果能够转换成磁盘启动（SSD/HDD）则可以实现一个海量的存储系统。

树莓派没有内建的SATA接口，如果要接磁盘设备，采用的是USB接口连接的磁盘设备。

> 最初我以为树莓派可以通过扩展卡来支持SATA磁盘，后来参考[Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)，发现类似的解决复方氨是通过一种USB连接卡转换成 mSATA 或者 SATA接口，这样就类似于常用的USB接口移动硬盘连接，但使用转接卡可以获得紧凑的转接。
>
> [mSATA](https://baike.baidu.com/item/mSATA)是SATA技术整合在小尺寸装置的接口控制器规范。目前笔记本电脑开始使用这种接口用于固态硬盘。
>
> 

当前SSD固态硬盘价格还远高于HDD磁盘，在组建大容量存储用于存储离线数据或非高性能访问要求数据的，可以考虑采用低廉的HDD组建。

个人组建存储集群，建议采用的HDD，结合开源存储技术如Ceph，可以构建海量存储容量的NAS以及TimeMachine（用于Apple系列产品数据备份），甚至可以组建个人的云计算存储。

# 硬件

> 理论上直接将USB移动硬盘连接到树莓派也可以作为硬盘使用，但是为了方便和紧凑，我使用了硬件[SupTronics X820扩展卡](http://www.suptronics.com/miniPCkits/x820-hardware.html)。这个HDD扩展卡可以从淘宝上购买。

![SupTronics X820扩展卡 Top view](../../img/develop/raspberry_pi/x820-430p1.jpg)

安装过程请参考[SupTronics X820扩展卡安装手册](http://www.suptronics.com/miniPCkits/x820-hardware.html)，主要是安装顺序（固定树莓派的4个螺钉是在硬盘下方，所以要先插上螺钉后才能安装硬盘）。另外需要注意电源线连接，红色火线需要插在Pin4(5V电压)黑色地线插在Pin6 - GPIO接口可以参考微软的Windows10 IoT [Raspberry Pi 2 & 3 Pin Mappings](https://docs.microsoft.com/en-us/windows/iot-core/learn-about-hardware/pinmappings/pinmappingsrpi)：

![Raspberry Pi 2 & 3 Pin Mappings](../../img/develop/raspberry_pi/rp2_pinout.png)

# 设置USB启动模式

在设置树莓派3能够从磁盘启动之前，它首先需要从SD卡启动并配置激活USB启动模式。这个过程是通过在树莓派SoC的OTP(One Time Programmable)内存设置一个激活从USB存储设备启动的。

一旦这个位设置，就不再需要SD卡。但是要注意：任何修改OTP都是永久的，不能撤销。

* 通过更新准备`/boot`目录：

```
sudo apt-get update && sudo apt-get upgrade
```

# 参考

* [Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)
* [HOW TO BOOT FROM A USB MASS STORAGE DEVICE ON A RASPBERRY PI 3](https://www.raspberrypi.org/documentation/hardware/raspberrypi/bootmodes/msd.md)