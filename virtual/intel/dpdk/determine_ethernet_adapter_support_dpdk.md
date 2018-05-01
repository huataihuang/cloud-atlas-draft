检查网卡(NIC)是否支持DPDK技术可以采用如下方法之一：

* 从 http://dpdk.org/doc/nics 获取支持DPDK技术的网卡列表

* 检查设备ID:

```
lspci -nn | grep [eE]ther
```

例如输出显示：

```
00:19.0 Ethernet controller [0200]: Intel Corporation 82579LM Gigabit Network Connection [8086:1502] (rev 04)
```

则检查`[8086:xxxx]`对应的数字例如这里`[8086:1502]`数字就是`1502`。根据这个数字检查SDK源代码中的对应驱动的定义头文件

在DPDK文档的[Overview of Networking Deivers](http://dpdk.readthedocs.io/en/latest/nics/overview.html)提供了一个完整的网络驱动功能列表：

例如：`e1000`驱动不支持`SR-IOV`但是支持`Linux VFIO`

# 参考

* [How can you determine if your Ethernet adapters support DPDK and SR-IOV?](https://software.intel.com/en-us/forums/networking/topic/542581)