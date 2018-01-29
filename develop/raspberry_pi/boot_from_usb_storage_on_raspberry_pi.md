默认情况下树莓派Raspberry Pi是从SD卡启动系统的，但是SD卡存储容量有限，如果能够转换成磁盘启动（SSD/HDD）则可以实现一个海量的存储系统。

树莓派没有内建的SATA接口，如果要接磁盘设备，采用的是USB接口连接的磁盘设备。

> 最初我以为树莓派可以通过扩展卡来支持SATA磁盘，后来参考[Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)，发现类似的解决复方氨是通过一种USB连接卡转换成 mSATA 或者 SATA接口，这样就类似于常用的USB接口移动硬盘连接，但使用转接卡可以获得紧凑的转接。
>
> [mSATA](https://baike.baidu.com/item/mSATA)是SATA技术整合在小尺寸装置的接口控制器规范。目前笔记本电脑开始使用这种接口用于固态硬盘。

当前SSD固态硬盘价格还远高于HDD磁盘，在组建大容量存储用于存储离线数据或非高性能访问要求数据的，可以考虑采用低廉的HDD组建。

个人组建存储集群，建议采用的HDD，结合开源存储技术如Ceph，可以构建海量存储容量的NAS以及TimeMachine（用于Apple系列产品数据备份），甚至可以组建个人的云计算存储。

# 参考

* [Raspberry Pi: Adding an SSD drive to the Pi-Desktop kit](http://www.zdnet.com/article/raspberry-pi-adding-an-ssd-drive-to-the-pi-desktop-kit/)
* [HOW TO BOOT FROM A USB MASS STORAGE DEVICE ON A RASPBERRY PI 3](https://www.raspberrypi.org/documentation/hardware/raspberrypi/bootmodes/msd.md)