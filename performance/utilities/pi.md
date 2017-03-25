用Linux自带的bc计算器计算pi值的一种benchmark手段

```
time echo “scale=5000; 4*a(1)” | bc -l -q
```

time是计时程序。scale是精度，`4*a(1`）调用了反正切函数。由三角函数我们知道1的反正切是`pi/4`, `pi=4* pi/4`。 `-l -q`参数的意思请参照`man page`。这一行其实就是让bc计算`1`的反正切，计算精度是`5000`位。

`time echo “scale=5000; 4*a(1)” | bc -l -q &` 可以让命令在后台运行，即而可以执行多条命令。

# 参考

* 本文转自[Linux下一种简单易行的cpu benchmark方法](http://www.cnblogs.com/Skyar/p/3397092.html)