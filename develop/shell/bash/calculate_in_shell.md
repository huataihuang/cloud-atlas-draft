# shell计算的几种方法

* 使用 `expr` 计算

```
sum=`expr a+b+c`
```

* 使用 `let` 计算

```
let sum=a+b+c
```

* 使用 `bc` 计算

```
echo "7+3*2" | bc
```

* 整数计算

```
sum=$((32+79))
```

# 浮点数计算


`bc` 支持浮点数计算，但是我发现如果被除数是整数，则输出结果也是整数。对于 `bc` 可以使用 `scale` 定义精度

```
echo "scale=3; 1.55 * 1.55 " | bc -l
```

> scale参数指定小数点后的保留位数
   
# bc显示小数点前的0

在使用 `bc` 做计算的时候，会发现如果小数点前面是0的时候会不显示，解决的方法可以采用

```
res1=$(printf "%.2f" `echo "scale=2;1/3"|bc`)
```
   
> `printf` 打印函数可以格式化输出小数点之前的0。
   
更为精确的方法是采用 `awk`

```
v1=$(echo 1 3 | awk '{ printf "%0.2f\n" ,$1/$2}')
```

# 参考

* [如何在shell中对浮点数进行计算?](http://blog.csdn.net/lllxy/article/details/3450913)
* [bc显示小数点前的0](http://www.361way.com/linux-bc-point-zero/4960.html)