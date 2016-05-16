# grep使用`OR`

以下命令检查服务器`bonding`的情况，获取节点`Aggregator`状态

```bash
pssh -ih nc_ip 'cat /proc/net/bonding/eth0 | grep "Slave\|Status\|Aggregator"'
```

> grep实用`OR`采用`\|`方式，或者采用 `grep -E "XXX|YYY"` （[How to use regex OR in grep in Cygwin?](http://stackoverflow.com/questions/7874751/how-to-use-regex-or-in-grep-in-cygwin)）
>
> 还有一种方式是使用 `grep -e "string1" -e "string2" my.file`

# grep匹配后取前n行或后m行

以下命令扫描服务器集群的网卡`bonding`状态，检查有哪些节点出现单网卡故障

```bash
pssh -ih nc_ip 'cat /proc/net/bonding/eth0 | grep -B1 "MII Status: down"'
```

```
-Bn 匹配后取前n行，B表示before
-Am匹配后取后m行，A表示after
```

显示结果可以看到，匹配上`SUCESS`的节点就是出现网卡故障的节点

```
...
[92] 16:01:42 [FAILURE] 10.151.105.173 Exited with error code 1
[93] 16:01:42 [SUCCESS] 10.151.105.168
Slave Interface: slave1
MII Status: down
...
```