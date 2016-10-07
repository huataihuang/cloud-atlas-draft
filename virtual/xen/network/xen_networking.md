# Virtual Network Interfaces

* Paravirtualised Network Devices(半虚拟化网络设备)

Xen guest可以访问一个或多个 para

# Xen虚拟网卡后端

* 检查虚拟机虚拟网卡的mac地址以及对应dom0的Virtual Interafce backend (`vifA.B`，例如`vif301.0`)

```
xl network-list <domU名字 / domU_id>
```

例如(这里`28`作为domU的id也可以替换成domU的虚拟机名字)

```
xl network-list 28
```

显示输出

```
Idx BE Mac Addr.         handle state evt-ch   tx-/rx-ring-ref BE-path
0   0  00:16:3e:10:92:37      0     4     11  1280/1281        /local/domain/0/backend/vif/28/0
1   0  00:16:3e:10:8a:7e      1     4     12  1282/1283        /local/domain/0/backend/vif/28/1
```

在Xen物理服务器上，`vifA.B`作为虚拟网卡接口后端是需要消耗物理服务器CPU资源的，有可能在`top`命令中看到显示`vif301.0`占用较高的CPU资源，就可以通过上述`xl network-list`找出对应vm并进一步排查

```
top - 21:40:45 up 77 days,  8:26,  1 user,  load average: 7.42, 6.85, 7.11
Tasks: 522 total,   2 running, 519 sleeping,   0 stopped,   1 zombie
Cpu(s):  5.1%us,  7.1%sy,  0.1%ni, 82.4%id,  0.5%wa,  0.0%hi,  4.1%si,  0.6%st
Mem:  19483124k total, 19202956k used,   280168k free,   643312k buffers
Swap:        0k total,        0k used,        0k free, 10593596k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
 3696 root     -51   0     0    0    0 S 29.2  0.0   1726:20 vif301.0
```

```
xl network-list 301
```

显示输出

```
Idx BE Mac Addr.         handle state evt-ch   tx-/rx-ring-ref BE-path
0   0  00:16:3e:0c:5a:4a      0     4     52   768/769         /local/domain/0/backend/vif/301/0
1   0  00:16:3e:0c:5b:68      1     4     53  1280/1281        /local/domain/0/backend/vif/301/1
```


# 参考

* [Xen Networking](https://wiki.xenproject.org/wiki/Xen_Networking)
* [Xen FAQ Networking](https://wiki.xenproject.org/wiki/Xen_FAQ_Networking)