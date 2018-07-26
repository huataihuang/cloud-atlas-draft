# 多队列 virtio-net

多队列 `virtio-net` 提供了随着虚拟 CPU 数量增加而改变网络性能的方法，即允许每一次通过一组以上的 `virtqueue` 传输数据包。

在单一队列的 `virtio-net` 中，客机中协议堆叠的缩放收到限制，因为网络性能不随虚拟 CPU 数量的增加而改变。鉴于 `virtio-net` 只有一组 `TX` 和 `RX` 队列，客机不能并行传输或检索数据包。

多队列 virtio-net 在这些时候可以提供最佳性能：

* 流量`数据包相对较大`。
* 客机同时在各种连接中活跃，流量从客机、客机到主机或客户端运行到外部系统。
队列数量与虚拟 CPU 相同。因为多队列支持可以优化 RX 中断关联和 TX 队列选择，实现特定队列对于特定虚拟 CPU 的私有化。

`注意`

> 多队列 virtio-net 在输入流量中运行良好，但在少数情况下可能会影响输出流量的性能。启用多队列 `virtio-net` 提高总体吞吐量，同时提高 CPU 可用量。

# 配置多队列 virtio-net

* 物理NC服务器

使用多队列 virtio-net 时，通过向虚拟机 `XML` 配置（N 的值为 1 到 8，即 kernel 最多可支持一组多队列 tap 设备中的 8 个队列）添加以下命令：

```
<interface type='network'>
      <source network='default'/>
      <model type='virtio'/>
      <driver name='vhost' queues='N'/>
</interface>
```

> 虚拟机需要关闭再使用多队列`virtio`配置启动才能生效

* KVM guest虚拟机操作

在虚拟机内部执行以下命令（M 的值为 1 到 N）时允许多队列支持：

```
# ethtool -L eth0 combined M
```

> ` -L --set-channels` - 设置指定网络设备的通道数量（the numbers of channels）

# 实践

* 在没有设置`virtio-vhost`多队列之前，通过`ps aux | grep vhost`可以看到对应虚拟机`vm-1`的`vhost`只有2个进程（单队列有一个收网络包的进程和一个发网络包进程）（当前虚拟机`qemu`进程号是`17060`）

```
root     17061  0.0  0.0      0     0 ?        S    10:48   0:00 [vhost-17060-0]
root     17062  0.0  0.0      0     0 ?        S    10:48   0:00 [vhost-17060-1]
```

* 将运行中的虚拟机配置导出

```
virsh dumpxml vm-1 > vm-1.xml
```

* 修改`vm-1.xml`配置文件，在虚拟网卡配置段落的`<model type='virtio'/>`下面添加一行`<driver name='vhost' queues='4'/>`

```
<interface type='network'>
...
      <model type='virtio'/>
      <driver name='vhost' queues='4'/>
...
</interface>
```

* 然后启动虚拟机

```
virsh create vm-1.xml
```

* 此时再次`ps aux | grep vhost`可以看到这个虚拟机现在有了4个队列对应的8个vhost进程（当前虚拟机`qemu`进程号是`61912`）

```
root     61913  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-0]
root     61914  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-1]
root     61915  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-0]
root     61916  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-1]
root     61917  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-0]
root     61918  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-1]
root     61919  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-0]
root     61920  0.0  0.0      0     0 ?        S    11:12   0:00 [vhost-61912-1]
```

* 登录到虚拟机内部，在虚拟内部没有启用多队列之前检查网卡

```
# ethtool -L eth0
no channel parameters changed, aborting
current values: tx 0 rx 0 other 0combined 1
```

使用`ethtool -l eth0`可以看到

```
# ethtool -l eth0
Channel parameters for eth0:
Pre-set maximums:
RX:		0
TX:		0
Other:		0
Combined:	4
Current hardware settings:
RX:		0
TX:		0
Other:		0
Combined:	1
```

> `-l --show-channels` - 查询指定网络设备具有的通道数量。所谓通道（channel）就是一个IRQ和可以触发IRQ的队列集。

* 虚拟机设置多队列支持

```
# ethtool -L eth0 combined 2
```

> 如果没有在物理服务器上设置好多队列支持，会提示错误`Cannot set device channel parameters: Invalid argument`

此时再次检查可以看到虚拟网卡硬件设置队列数是`2`

```
# ethtool -l eth0
Channel parameters for eth0:
Pre-set maximums:
RX:		0
TX:		0
Other:		0
Combined:	4
Current hardware settings:
RX:		0
TX:		0
Other:		0
Combined:	2
```

最多可以设置`4`个多队列（和物理服务器上设置对应）

```
# ethtool -L eth0 combined 4

# ethtool -l eth0
Channel parameters for eth0:
Pre-set maximums:
RX:		0
TX:		0
Other:		0
Combined:	4
Current hardware settings:
RX:		0
TX:		0
Other:		0
Combined:	4
```

* 验证多队列生效的方法是观察中断，即`cat /proc/interrupts`

```
# cat /proc/interrupts
           CPU0       CPU1
...
 27:       1352          0   PCI-MSI-edge      virtio0-input.0
 28:          1          0   PCI-MSI-edge      virtio0-output.0
 29:        378          0   PCI-MSI-edge      virtio0-input.1
 30:          1          0   PCI-MSI-edge      virtio0-output.1
 31:        151          0   PCI-MSI-edge      virtio0-input.2
 32:          1          0   PCI-MSI-edge      virtio0-output.2
 33:        268          0   PCI-MSI-edge      virtio0-input.3
 34:          0          0   PCI-MSI-edge      virtio0-output.3
```

可以观察到中断分布到4个`virtio0`队列设备上。

# 参考

* [虚拟化调试和优化指南](https://access.redhat.com/documentation/zh-CN/Red_Hat_Enterprise_Linux/7/html-single/Virtualization_Tuning_and_Optimization_Guide/index.html#sect-Virtualization_Tuning_Optimization_Guide-Networking-Multi-queue_virtio-net)