# 检查单个进程内存使用

* 使用`pmap`可以详细输出一个进程或线程的内存映射报告

```bash
sudo pmap 34751
```

可以看到详细的报告

```bash
34751:   /usr/local/python/bin/python /opt/demo/bin/demo-server --config-file=/etc/demo.conf --log-config=/etc/demo-log.conf
0000000000400000      4K r-x--  /usr/local/python/bin/python2.7
0000000000600000      4K rw---  /usr/local/python/bin/python2.7
0000000000601000  10096K rw---    [ anon ]
0000000041826000      4K -----    [ anon ]
...
00007fff4bab8000     84K rw---    [ stack ]
00007fff4bb42000      4K r-x--    [ anon ]
ffffffffff600000      4K r-x--    [ anon ]
 total           192320K
```

其中最后输出的`total`字段值不是进程使用的当前内存，需要使用`-x`参数来输出扩展字段

```bash
-x   extended       Show the extended format.
-d   device         Show the device format.

EXTENDED AND DEVICE FORMAT FIELDS
       Address:   start address of map
       Kbytes:    size of map in kilobytes
       RSS:       resident set size in kilobytes
       Dirty:     dirty pages (both shared and private) in kilobytes
       Mode:      permissions on map: read, write, execute, shared, private (copy on write)
       Mapping:   file backing the map, or ’[ anon ]’ for allocated memory, or  ’[ stack ]’ for the program stack
       Offset:    offset into the file
       Device:    device name (major:minor)
```

例如 `sudo pmap -x 34751` 输出显示

```bash
34751:   /usr/local/python/bin/python /opt/demo/bin/demo-server --config-file=/etc/demo.conf --log-config=/etc/demo-log.conf
Address           Kbytes     RSS   Dirty Mode   Mapping
0000000000400000       4       4       0 r-x--  python2.7
0000000000600000       4       4       4 rw---  python2.7
0000000000601000   10096    9964    9964 rw---    [ anon ]
...
00007fff4bb42000       4       4       0 r-x--    [ anon ]
ffffffffff600000       4       0       0 r-x--    [ anon ]
----------------  ------  ------  ------
total kB          192320   16360   12512
```



# 参考

* [How to find the memory consumption of a particular process in linux for every 5 seconds](http://stackoverflow.com/questions/14641553/how-to-find-the-memory-consumption-of-a-particular-process-in-linux-for-every-5)
* [Actual memory usage of a process](http://unix.stackexchange.com/questions/164653/actual-memory-usage-of-a-process)