在解决[KVM虚拟机vnc远程访问鼠标偏移修复](../startup/in_action/kvm_vnc_mouse)问题时，修改了libvirt的xml配置，需要重启一次Windows虚拟机。

尝试采用save/restore方式恢复运行Windows虚拟机：

* 首先暂停虚拟机运行

```
#virsh suspend win2016
Domain win2016 suspended
```

* 检查win2016虚拟机运行状态

```
#virsh list
 Id    Name                           State
----------------------------------------------------
 ...
 9     win2016                        paused
```

* 保存虚拟机到文件：

```
#virsh save win2016 win2016.status

Domain win2016 saved to win2016.status
```

* 当虚拟机保存到文件之后，可以看到虚拟机立即恢复了running状态（此时 **没有** 执行`virsh resume win2016`）

```
#virsh list
 Id    Name                           State
----------------------------------------------------
 ...
 9     win2016                        running
```

* 销毁运行中虚拟机

```
#virsh destroy win2016
Domain win2016 destroyed
```

* 从存储的状态文件恢复虚拟机

```
#virsh restore win2016.status
Domain restored from win2016.status
```

* 此时恢复的虚拟机是保存时候的`paused`状态

```
#virsh list
 Id    Name                           State
----------------------------------------------------
 11    win2016                        paused
```

* 恢复虚拟机运行

```
#virsh resume win2016
Domain win2016 resumed
```

> 检查发现这种save/restore方式不能使得鼠标偏移立即解决，还是需要在虚拟机操作系统内部重启一次虚拟机才生效。