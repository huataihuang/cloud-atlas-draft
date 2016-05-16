当Xen服务器出现异常时，有可能没有任何输入，也没有日志（本地或远程日志），这种情况下，需要设法访问Xen hypervisor，使得其能够响应输出debug信息，帮助我们判断故障原因。

此时，需要通过串口连接到物理服务器控制台，按下`CTRL-A`

# 参考

* [Xen Hypervisor Debugging](https://azouhr.wordpress.com/2011/02/01/xen-hypervisor-debugging/)