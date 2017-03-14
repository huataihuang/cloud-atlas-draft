比较基本的测试顺序读写的磁盘性能，可以使用`dd`命令，这是一个简单的写块设备的命令。

* 写入2倍内存的大文件，并且sync到磁盘

写入2倍内存的大文件，并且sync到磁盘，这可以确保获得持续的写入速率，因为此时缓存影响有限。例如，这里虚拟机采用8G内存配置，采用8k块大小写入（通常PostgresSQL使用的块大小），则每1G有125000个块，则设置200w个写入块

```
time sh -c "dd if=/dev/zero of=ddfile bs=8k count=2000000 && sync"
```

输出显示

```
2000000+0 records in
2000000+0 records out
16384000000 bytes (16 GB) copied, 409.806 s, 40.0 MB/s

real	7m4.617s
user	0m0.428s
sys	0m36.500s
```

这里可以看到，`dd`测试性能显示是 `40MB/s`，但是如果加上`sync`指令，则只有`36.8MB/s` (16384000000/1024/1024/424.6.17)

* 写入和内存一样大小大文件，这样内存中的缓存会完全被第二个文件刷新掉，这样我们后面再次读文件时候就会真正从磁盘读取文件，而不会读取第一次写入文件缓存在FS cache中的数据，以保证测试准确

 ```
time sh -c "dd if=/dev/zero of=ddfile2 bs=8K count=1000000"
 ```

* 测试读取性能

由于在第二步中FS Cache被第二个文件填满，所以，这次测试读取性能是完全测试磁盘的读取性能

```
time dd if=ddfile of=/dev/null bs=8k
```

测试性能显示是

```
2000000+0 records in
2000000+0 records out
16384000000 bytes (16 GB) copied, 432.9 s, 37.8 MB/s

real	7m12.902s
user	0m0.382s
sys	0m13.033s
```

# 参考

* [Testing Disk Speed: the dd Test](http://it.toolbox.com/blogs/database-soup/testing-disk-speed-the-dd-test-31069)