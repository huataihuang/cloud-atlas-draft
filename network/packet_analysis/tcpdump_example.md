# 常用tcpdump案例

* 指定接口抓包 `-i`

```bash
tcpdump -i eth1
```

* 只抓取N个数量包 `-c`

```bash
tcpdump -c 2 -i eth0
```

* 显示捕捉的数据包ASCII码 `-A`

```bash
tcpdump -A -i eth0
```

* 显示捕捉的数据包HEX和ASCII码 `-XX`

```bash
tcpdump -XX -i eth0
```

* 将捕捉到的数据包写入文件 `-w`

```bash
tcpdump -w 0823010.pcap -i eth0
```

* 从已经保存的文件中读取数据包 `-r`

```bash
tcpdump -tttt -r data.pcap
```

* 捕捉数据包显示IP地址 `-n`

```bash
tcpdump -n -i eth0
```

> 默认捕捉数据包时候显示DNS地址，如果要显示IP则使用`-n`参数
>
> 建议使用`-n`参数，因为默认捕捉数据包时候使用DNS解析会导致捕捉数据包效率降低，并导致drop数据包。

* 捕捉数据包时显示可阅读的时间戳 `-tttt`

```bash
tcpdump -n -tttt -i eth0
```
> `-tttt` 似乎只是添加了日期时间，作用不大

* 只捕捉大于N字节的数据包 `greater N`

```bash
tcpdump -w g_1024.pcap greater 1024
```

* 只捕捉特定协议的数据包 `协议`

```bash
tcpdump -i eth0 arp
```

* 读取小于N字节的数据包 `less N`

```bash
tcpdump -w l_1024.pcap less 1024
```

* 使用特定端口捕捉数据包 `port N`

```bash
tcpdump -i eth0 port 22
```

* 结合IP地址和端口捕捉数据包

```bash
tcpdump -w xpackets.pcap -i eth0 dst 10.181.140.216 and port 22
```

* 捕捉两个主机间数据包

```bash
tcpdump -w comm.pcap -i eth0 host 10.181.140.216 and port 22
```

* 捕捉过滤特定协议 - 例如，捕捉**非**`arp`和`rarp`协议数据包

```bash
tcpdump -i eth0 not arp and not rarp
```


# 参考

* [Packet Analyzer: 15 TCPDUMP Command Examples](http://www.thegeekstuff.com/2010/08/tcpdump-command-examples/)
