# sar

`sar`工具可以非常容易显示网卡的流量，并且对于虚拟化环境，可以在物理服务器上实时显示所有网卡，包括虚拟网卡，的流量

```bash
sar -n DEV 1 10
```

上述命令以1秒为间隔采样10次网络流量

```bash
16:48:15        IFACE   rxpck/s   txpck/s   rxbyt/s   txbyt/s   rxcmp/s   txcmp/s  rxmcst/s
16:48:16           lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16         eth0   1882.00   1692.00 1278403.00 675412.00      0.00      0.00      0.00
16:48:16         eth1   1733.00   2010.00 928858.00 703407.00      0.00      0.00      3.00
16:48:16         eth2      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16         eth3      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16         sit0      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16        bond0   3615.00   3702.00 2207261.00 1378819.00      0.00      0.00      3.00
16:48:16       vif0.0      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16        veth0      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16       vif0.1      0.00      0.00      0.00      0.00      0.00      0.00      0.00
16:48:16        veth1      0.00      0.00      0.00      0.00      0.00      0.00      0.00
...
```

# ifstat

```bash
ifstat
```

显示输出：

```bash
       eth0                eth1               bond0              vif1.0              vif7.0              vif8.0              vif9.0             vif10.0
 KB/s in  KB/s out   KB/s in  KB/s out   KB/s in  KB/s out  KB/s in  KB/s out   KB/s in  KB/s out   KB/s in  KB/s out   KB/s in  KB/s out   KB/s in  KB/s out
  694.05    360.13    666.18    668.66   1360.23   1028.79   539.82    706.79    127.30     80.60     39.99     51.47    218.20    798.86      1.25      5.08
 1844.64    790.66    873.11    680.79   2717.75   1471.45   696.90    940.66    176.02     72.21    116.64    199.17    499.60   1300.55      0.40      3.14
 1498.76    698.02    941.65    803.12   2440.41   1501.14   845.92    636.89    179.29    102.96    398.92    102.42    470.97   1349.95      3.15     14.64
 1081.93    945.84    794.25   1317.05   1876.19   2262.89   696.90    750.91    270.19    114.40    113.89    136.48    574.73    917.45      0.40      2.82
 1257.05    831.35    752.77    730.28   2009.82   1561.63   492.52    585.58    410.79    104.79     72.67     63.68    292.45    954.20      1.16      4.30
  686.76    428.11    586.20    537.74   1272.96    965.86   534.81    751.65    196.37    103.71     97.14     75.01     96.63    339.06      0.70      4.06
 1630.72    896.84    807.46    584.03   2438.19   1480.87   832.62    776.28    377.24    155.64     77.17     23.89    648.40   1834.11      0.55      2.55
 1172.60    714.94   1234.37   1110.80   2406.97   1825.74   743.15    998.96    106.39     84.83      5.71      4.99    512.52   1372.14      0.63      2.45
 1470.18    706.38    940.09    846.90   2410.27   1553.28  1556.88   1030.38    216.60    139.77    165.31     57.97    411.64   1131.69      1.73      8.04
```

# iptraf

`iptraf`是一个非常强大的控制台交互程序，提供了对话框交互方式来访问网络监控，非常适合调试排查问题。

通过`iftraf`找到对应的端口（假设是`22`）流量，就可以使用如下命令找出提供服务端口的进程

```bash
netstat -tunp | grep 22
```

```
tcp        0     64 192.168.190.129:22      192.168.190.1:49946     ESTABLISHED 1104/sshd: ubuntu [
```

# iftop

`iftop`提供了按照网络流量排序的top方式，能够找出主机间通讯流量。

```bash
iftop -P
```

`-P`参数是为了显示端口

* `-i` 设定监测的网卡，如： `iftop -i eth1`
* `-B` 以bytes为单位显示流量(默认是bits)，如：`iftop -B`
* `-n` 使host信息默认直接都显示IP，如：`iftop -n`
* `-N` 使端口信息默认直接都显示端口号，如: `iftop -N`
* `-F` 显示特定网段的进出流量，如 `iftop -F 10.10.1.0/24` 或 `iftop -F 10.10.1.0/255.255.255.0`
* `-h`（display this message），帮助，显示参数信息
* `-p` 使用这个参数后，中间的列表显示的本地主机信息，出现了本机以外的IP信息;
* `-b` 使流量图形条默认就显示;
* `-f` 过滤计算包用的;
* `-P` 使host信息及端口信息默认就都显示
* `-m` 设置界面最上边的刻度的最大值，刻度分五个大段显示，例：`iftop -m 100M`

交互界面中显示的参数含义：

* TX：发送流量
* RX：接收流量
* TOTAL：总流量
* Cumm：运行iftop到目前时间的总流量
* peak：流量峰值
* rates：分别表示过去 2s 10s 40s 的平均流量

# nethogs

`nethogs`是非常强大的找到每个进程的网络流量的工具

```bash
root@ubuntu2:~# nethogs
NetHogs version 0.8.0
 
  PID USER     PROGRAM                      DEV        SENT      RECEIVED
2214  root     /usr/lib/apt/methods/http    eth0       4.693     238.631 KB/sec
2051  ubuntu   sshd: ubuntu@pts/1           eth0       3.442       0.310 KB/sec
1120  ubuntu   sshd: ubuntu@pts/0           eth0       0.416       0.035 KB/sec
2213  root     /usr/lib/apt/methods/http    eth0       0.021       0.023 KB/sec
?     root     unknown TCP                             0.000       0.000 KB/sec
 
  TOTAL                                                8.572     239.000 KB/sec
```

* m : Cycle between display modes (kb/s, kb, b, mb)
* r : Sort by received.
* s : Sort by sent.
* q : Quit and return to the shell prompt.

如果要以每秒1次，则加上`-d 1`


# 参考

* [Linux: See Bandwidth Usage Per Process With Nethogs Tool](http://www.cyberciti.biz/faq/linux-find-out-what-process-is-using-bandwidth/)
* [Find Network Traffic and Bandwidth usage per Process in Linux](http://www.slashroot.in/find-network-traffic-and-bandwidth-usage-process-linux)
* [Linux流量监控工具 - iftop (最全面的iftop教程)](http://www.vpser.net/manage/iftop.html)