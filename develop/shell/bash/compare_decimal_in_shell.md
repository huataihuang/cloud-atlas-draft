我们知道在shell中比较整数的方法，即常用的比较命令 `-gt`, `-lt`, `-eq` 等，但是，如果数值是小数的话，再使用这些比较指令就会出现语法错误：

```bash
example_script.sh: line 799: [[: 2.12: syntax error: invalid arithmetic operator (error token is ".12")
...
```

上述报错信息是比在[多变量赋值](multiple_variable_assignment)比较系统负载值是否大于某个阀值，错误使用如下判断脚本

```bash
LOAD1_UP=8
LOAD5_UP=7
LOAD15_UP=7

read load1 load5 load15  <<< $(echo $(uptime | tr -d " " | awk -F "[:,]" '{print $8" "$9" "$10}'))

if [[ $load1 -gt $LOAD1_UP ]] || [[ $load5 -gt $LOAD5_UP ]] || [[ $load15 -gt $LOAD15_UP ]]; then
    echo "LOAD is too high"
fi
```

# shell的小数比较方法

## 方法一：扩大倍数转换成整数比较

首先判断小数后有多少为（N），然后将比较的数值乘以10的N次方，也就是将小数点去掉比较。注意：小数点后位数多的去掉小数点，少的用0补齐

> shell内置的计算`(())`和`expr`不支持乘除，所以通过`bc`进行计算（扩大10的N次方）然后进比较。以下假设进行小数点之后2位精度进行对比（使用`${A%%.*}`截掉扩大100倍后小数点之后内容）

```bash
A=`echo $A*100 | bc`
A=${A%%.*}
B=`echo $B*100 | bc`
B=${B%%.*}
if (($A >= $B)); then
    echo "A >= B"
else
    echo "B > A"
fi
```

## 方法二：使用awk

```bash
awk -v num1=6.6 -v num2=5.5 'BEGIN{print(num1>num2)?"0":"1"}'
```

awk直接支持小数比较，并且提供了三元运算输出不同的结果。这里输出0表示`num1>num2`成立。

## 方法三：使用`expr`的`\>`

`expr`支持小数对比，返回值1表示大于成立，返回0则不成立

```bash
a=6.6 b=5.5;expr $a \> $b
```

此时返回`1`表示变量a大于b成立

## 方法四：使用`br`

`br`也支持小数对比

```bash
echo "6.6>5.5" |br

1

echo "5.5>6.6" | br

0
```

> 但是，很不幸，`br`工具多数系统默认不安装

# 脚本改进

前述脚本改进：

```bash
LOAD1_UP=8
LOAD5_UP=7
LOAD15_UP=7

read load1 load5 load15  <<< $(echo $(uptime | tr -d " " | awk -F "[:,]" '{print $8" "$9" "$10}'))

compare_load1=$(expr $load1 \> $LOAD1_UP)
compare_load5=$(expr $load5 \> $LOAD5_UP)
compare_load15=$(expr $load15 \> $LOAD15_UP)
# expr比较小数满足输出1

if [[ $compare_load1 -eq 0 ]] && [[ $compare_load5 -eq 0 ]] && [[ $compare_load15 -eq 0 ]]; then
    echo "LOAD is OK"
else
    echo "LOAD is too high"
fi
```

# 参考

* [shell 中对小数进行比较的方法总结](http://blog.sina.com.cn/s/blog_5e77c61f0100grf9.html)