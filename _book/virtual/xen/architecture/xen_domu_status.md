当使用`sudo xm list`检查xen虚拟机状态，有如下可能状态：

* `r` running 表示domU当前运行状态并且健康
* `b` blocked 表示domU被阻塞，当前没有在运行或者不可运行。可能是domain正在等待IO或者进入睡眠，因为没有事情可以做
* `p` paused  表示domU被暂停。这个暂停是因为管理员运行了`xm pause`命令。当domU进入paused状态，它仍然会消耗内存资源，但是该domin没有资格被Xen调度器调度
* `s` shutdown 表示domU已经被请求关机(shutdown)、重启(rebooted)或挂起(suspended)，而domain响应正在destoryed处理过程中。
* `c` crashed 表示domU已经crash，通常这个状态只在虚拟机配置成crash时候不重启才会停留在这个状态。

# 参考

* [Managing Xen using the xm Command-line Tool](http://www.techotopia.com/index.php/Managing_Xen_using_the_xm_Command-line_Tool)