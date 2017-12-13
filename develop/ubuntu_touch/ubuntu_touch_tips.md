# 截屏

> 参考 [How to take a screenshot on Ubuntu Touch](https://askubuntu.com/questions/272349/how-to-take-a-screenshot-on-ubuntu-touch/603318)

* 最简单的截屏方法

同时按下`音量增加键`和`音量减小键`，直到听到`picture`声音并看到`screenshot`闪烁了一下。截屏文件被保存在`/home/phablet/Picture/Screenshots`目录。

* 使用命令行

`phablet-screenshot`命令可以在`phablet-tools`软件包中找到，可以通过USB线缆连接到Ubuntu设备进行截图：

```
phablet-screenshot foo.png
```