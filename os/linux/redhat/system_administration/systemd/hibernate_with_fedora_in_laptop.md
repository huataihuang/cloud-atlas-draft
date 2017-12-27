> 设置Hibernate休眠模式关键点是设置足够存储笔记本内存内容的swap空间，否则会导致hibernate失败。

我的笔记本安装了双操作系统，有时候希望能够切换到MacOS平台，同时在切换回Linux时候能够保持离开时的工作桌面。

# 挂起、睡眠和休眠的区别

暂停并保存当前系统运行状态（前后台进程服务，不包含buff和cache等）有三种方法：

* 挂起到内存：suspend to ram(简称str）

通常被称为挂起，设备通电，低功耗。

挂起也被称为暂停或待机，一般系统一段时间没有操作，系统就会挂起（到内存中），多数外围设备会关闭，某些设备会运行（如键盘鼠标），可以快速响应这些设备从而唤醒系统。 

* 挂起到磁盘：suspend to disk(简称std)

通常被称为休眠，设备断电，即设备会关机。 

休眠也被称为冬眠（hibernate实为冬眠之意），保存运行状态存到硬盘中，然后关机。下次开机后，系统从硬盘中读取存储的数据并恢复到关机前的状态。 

* 混合挂起：suspend to ram and disk(简称strd)

通常被称为睡眠，设备通电，低功耗。

睡眠更准确的名称应该是混合睡眠，所谓混合即存储方式上包含了挂起和休眠两种方式，唤醒时会优先从内存中读取数据，如果设备在此状态下断电（例如笔记本电脑在睡眠时外部电源断掉，而睡眠一段时间后内部电源耗尽），就和休眠一样了。 

> `suspend`(挂起到内存)基本无需设置，可参考

# 休眠设置

当前比较新的发行版采用了`systemd`来管理系统，通常可以使用`systemd`休眠管理。此外，也可以选择[pm-utils](https://wiki.archlinux.org/index.php/Pm-utils_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))实现。

## 

# 参考

* [Power management/Suspend and hibernate (简体中文)](https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))