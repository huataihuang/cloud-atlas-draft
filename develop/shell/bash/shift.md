shell中使用shift指令可以将shell脚本的参数左移，这样可以在不知道位置变量个数情况下逐个处理参数。在 shift 命令执行前变量 `$1` 的值在 shift 命令执行后就不可用了。

```bash
#测试 shift 命令(x_shift.sh)
until [ $# -eq 0 ]
do
echo "第一个参数为: $1 参数个数为: $#"
shift
done
```

执行以上程序x_shift.sh：

```bash
$./x_shift.sh 1 2 3 4
```

结果显示如下：

```bash
第一个参数为: 1 参数个数为: 4
第一个参数为: 2 参数个数为: 3
第一个参数为: 3 参数个数为: 2
第一个参数为: 4 参数个数为: 1
```

下面代码用 until 和 shift 命令计算所有命令行参数的和。

```bash
#shift 上档命令的应用(x_shift2.sh)
if [ $# -eq 0 ]
then
echo "Usage:x_shift2.sh 参数"
exit 1
fi
sum=0
until [ $# -eq 0 ]
do
sum=`expr $sum + $1`
shift
done
echo "sum is: $sum"
```

Shift 命令还有另外一个重要用途, Bsh 定义了9个位置变量，从 $1 到 $9,这并不意味着用户在命令行只能使用9个参数，借助 shift 命令可以访问多于9个的参数。

Shift 命令一次移动参数的个数由其所带的参数指定。例如当 shell 程序处理完前九个命令行参数后，可以使用 shift 9 命令把 $10 移到 $1。

# 参考

* [Shell编程中Shift的用法](http://www.cnblogs.com/image-eye/archive/2011/08/20/2147153.html) - 本文转载自这篇博文