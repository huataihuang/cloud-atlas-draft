当出现双网卡bonding的网线断开时候，日志如下：

```
Apr 18 15:18:38 server1.example.com kernel: : [66624539.368208] igb: slave1 NIC Link is Down
Apr 18 15:18:38 server1.example.com kernel: : [66624539.447092] bonding: eth0: link status definitely down for interface slave1, disabling it
```

参考 [What does the message "bonding: bond0: link status definitely down for interface eth0, disabling it" mean](https://access.redhat.com/solutions/977393) 对于这种情况需要判断`Link Down`是否在 `bonding: eth0: link status definitely down for interface slave1, disabling it`之前，如果物理网线检测到`Link is Down`在之前，则表明确实检测到了物理网线断开。


