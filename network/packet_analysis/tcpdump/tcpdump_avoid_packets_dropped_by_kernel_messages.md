当使用tcpdump抓包的时候，如果简单使用

```bash
sudo tcpdump -i eth0
```

抓包显示

```bash
506 packets captured
67943 packets received by filter
67347 packets dropped by kernel
```

为何大量的包被内核丢弃了？


参考 [One way to avoid tcpdump “packets dropped by kernel” messages](http://prefetch.net/blog/index.php/2011/06/09/one-way-to-avoid-tcpdump-packets-dropped-by-kernel-messages/) 需要添加一个 `-n` 参数来避免DNS反向解析


```bash
sudo tcpdump -n -i eth0
```

此时，内核丢包就会大幅度减少

```bash
33587 packets captured
37943 packets received by filter
4285 packets dropped by kernel
```

参考 [Why would the kernel drop packets?](http://unix.stackexchange.com/questions/144794/why-would-the-kernel-drop-packets) 可以增加缓存来减少包丢失

```
       When tcpdump finishes capturing packets, it will report counts of:

              packets ‘‘captured’’ (this is the number of packets that tcpdump has received and processed);

              packets  ‘‘received  by filter’’ (the meaning of this depends on the OS on which you’re running tcpdump, and possibly on the way the OS was configured - if a filter was specified on the command line, on some OSes it counts packets
              regardless of whether they were matched by the filter expression and, even if they were matched by the filter expression, regardless of whether tcpdump has read and processed them yet, on other OSes it  counts  only  packets  that
              were matched by the filter expression regardless of whether tcpdump has read and processed them yet, and on other OSes it counts only packets that were matched by the filter expression and were processed by tcpdump);

              packets  ‘‘dropped  by kernel’’ (this is the number of packets that were dropped, due to a lack of buffer space, by the packet capture mechanism in the OS on which tcpdump is running, if the OS reports that information to applica-
              tions; if not, it will be reported as 0).
```

```bash
sudo tcpdump --buffer-size=4096 -n -i eth0
```

`buffer-size`的单位是KB，所以上述是4MB的缓存

对于老版本的tcpdump，可以使用`-B 4096`

```bash
sudo tcpdump -B 4096 -n -i eth0
```

> 不过，我测试`tcpdump 3.9.4`不支持上述参数，按照`man tcpdump`是建议通过`-w`参数将抓包写入到文件解决缓存问题