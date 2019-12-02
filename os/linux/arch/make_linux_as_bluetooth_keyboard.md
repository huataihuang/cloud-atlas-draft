在使用Linux笔记本设备时，有时候希望自己的电脑键盘能够作为手机等移动设备的蓝牙键盘，这样就不需要再单独为移动设备配置蓝牙键盘，也方便移动办公。

从原理上来看，Linux主机对外显示为一个蓝牙键盘要求:

- 使用蓝牙社别，运行Bluez
- 通过 hidclient 实现用Bluetooth技术将主机模拟城蓝牙键盘和鼠标设备分享给群其他主机

设置方法参考 [How do I make Ubuntu appear as a bluetooth keyboard?](https://askubuntu.com/questions/229287/how-do-i-make-ubuntu-appear-as-a-bluetooth-keyboard) ，目前还没有实践，仅记录备用。


# 参考

- [How do I make Ubuntu appear as a bluetooth keyboard?](https://askubuntu.com/questions/229287/how-do-i-make-ubuntu-appear-as-a-bluetooth-keyboard)
