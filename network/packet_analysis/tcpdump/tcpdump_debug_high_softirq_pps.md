有台XEN服务器负载不高但是显示软中断非常严重

```
top - 14:12:10 up 1467 days,  4:30,  3 users,  load average: 4.90, 4.37, 4.32
Tasks: 438 total,   7 running, 425 sleeping,   4 stopped,   2 zombie
Cpu(s):  7.0%us, 11.0%sy,  0.3%ni, 64.4%id,  4.7%wa,  0.0%hi, 12.5%si,  0.1%st
Mem:  12310560k total, 12167284k used,   143276k free,   261096k buffers
Swap:  2008116k total,  1164228k used,   843888k free,  5533976k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND
    6 root      20   0     0    0    0 R 98.1  0.0 146868:16 ksoftirqd/1
```

> 软中断通常是由于网络负载过高引发的，所以在快速排查服务器硬件无异常，检查网络流量。

检查网络`sar -n DEV 1`显示有一个虚拟机存在异常的网络收包，这个虚拟网卡占用了所有的网络流量，网络收包达到接近15wPPS：

```
01:09:36 PM     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s
01:09:37 PM        lo     89.00     89.00    594.82    594.82      0.00      0.00      0.00
01:09:37 PM    slave0  41006.00   1015.00  18034.06    988.48      0.00      0.00      0.00
01:09:37 PM    slave1 109760.00   1314.00  38255.56   1460.69      0.00      0.00      0.00
01:09:37 PM      eth0 150765.00   2329.00  56289.22   2449.17      0.00      0.00      0.00
...
01:09:37 PM  000a17-I      5.00  16880.00      1.91   4522.79      0.00      0.00      0.00
01:09:37 PM  vlan.503 147969.00      5.00  51539.09      1.98      0.00      0.00      0.00
```

检查到虚拟网卡`000a17-I`接收大量数据包 检查虚拟机domU的id

```
sudo xm list | grep -v "Domain-0" | grep -v "ID" | awk '{print $2}' | tee domU
```

查看是哪个dom

```
for i in `cat domU`;do echo $i;sudo virsh dumpxml $i | grep 000a17-I;done
```

这个虚拟机dom_id是`74`，然后就可根据这个id找到对应的vm，并进一步排查

抓包验证（对虚拟网卡抓包），可以增加`host`的参数指定IP地址，方便过滤数据包

```
sudo tcpdump -i 000a17-I -tttt -nn host 192.168.1.111
```

显示该服务器接收到大量的syslog日志

```
2017-02-08 13:23:48.310520 IP 192.168.1.222.7616 > 192.168.1.111.514: SYSLOG local7.info, length: 196
2017-02-08 13:23:48.310530 IP 192.168.1.222.7616 > 192.168.1.111.514: SYSLOG local7.info, length: 190
...
2017-02-08 14:06:39.001213 IP 192.168.1.238.2000 > 192.168.1.111.514: SYSLOG local7.warning, length: 365
2017-02-08 14:06:39.001228 IP 192.168.1.238.2000 > 192.168.1.111.514: SYSLOG local7.warning, length: 370
```

后续则可以进一步进行业务排查。
