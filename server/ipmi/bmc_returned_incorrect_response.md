服务器日志 `/var/log/messages`中有关于IPMI消息处理显示BMC返回错误响应：

```
May 22 19:15:05 server1.example.com kernel: : [80535364.870752] IPMI message handler: BMC returned incorrect response, expected netfn 3f cmd 31, got netfn 7 cmd 35
May 22 20:14:04 server1.example.com kernel: : [80538907.829272] IPMI message handler: BMC returned incorrect response, expected netfn 3f cmd 31, got netfn 7 cmd 35
```

上述消息表示从主板管理控制器（Baseboard Management Controller, BMC）返回的响应和请求的预期不一致。可能会在BMC firmware刷新或reset时耦发生，此时操作系统的CIM以及IPMI组件和硬件BMC丢失同步。另外也可能是有其他软件或者硬件客户端在请求BMC和操作系统冲突。

一般可以忽略上述消息，但是如果不断出现，则可以尝试如下措施：

* 更新BMC firmware和系统BIOS
* 更新IPMI驱动和SFCB CIM组件
* 如果不需要检查硬件健康状况，尝试关闭CIM agent

# 参考

* [The ESXi/ESX host logs report the message: IPMI message handler: BMC returned incorrect response (2001933)](https://kb.vmware.com/s/article/2001933)