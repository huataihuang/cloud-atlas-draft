# 弹出Mac的CD

Mac的光驱采用了 ``设计优先`` 原则，浑然一体，没有提供CD/DVD设备常见的物理弹出按钮。当光盘无法弹出时，例如光盘无法识别，Finder就不会显示光驱图标无法进行交互操作，我们需要强制弹出光盘。

# drutil

``drutil`` 是macOS的光驱操作工具，可以用来刻录光盘，提供了 ``enject`` 命令:

```bash
drutil eject
```

# diskutil

``diskutil`` 也提供了卸载磁盘挂载和弹出光盘功能，首先使用 ``df`` 命令检查设备:

```bash
df -hl
```

可以看到挂载卷，其中有光驱设备

```
Filesystem       Size   Used  Avail Capacity iused      ifree %iused  Mounted on
/dev/disk1s5s1  233Gi   14Gi  124Gi    11%  553788 2447547532    0%   /
...
/dev/disk2s0    497Mi  497Mi    0Bi   100%       0          0  100%   /Volumes/新建
```

最后一行就是光驱设备 ``/dev/disk2s0`` ，我们就可以弹出该设备:

```bash
diskutil eject /dev/disk2s0
```

# 最终方法

如果上述命令方法都不奏效，则重启主机，在重启时光驱冲下（吸入的那一边垂直对着地板），同时:

- iMac, Mac mini等非笔记本用户在苹果灰色logo出现前按住鼠标
- MBP, MBA等笔记本用户按住触摸板长键，既左键右键一起按

光驱就会强制弹出

如果还不行，就只有找苹果技术支持了

# 参考

* [苹果吸入式光驱弹出不能的解决方法](http://blog.sina.com.cn/s/blog_770230810101mrbs.html)
