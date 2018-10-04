ping是常用的检测网络连通性的工具，有一些使用技巧可以方便我们更好检查网络问题

# 快速连续ping主机

> 在Linux中，`gateway`关键字指代网关

* 检查指定数量的ping

```
ping -c 1000 gateway > /dev/shm/1
```

* `-i 0.01` 设置ping包间隔时间为0.01秒，可以测试网络稳定性

```
ping -i 0.01 -c 100000 gateway > /dev/shm/2
```

这里将输出重定向到文件中，避免通过网络刷新终端显示拖累程序命令执行。

* `-f`参数表示Flood ping，即洪水ping，发出的数据包会尽可能快：

```
ping -f gateway -c 1000000 > /dev/shm/3
```

