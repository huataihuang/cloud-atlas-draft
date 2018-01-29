在判断一个字符串是否是null空值时，会使用如下代码：

```bash
if [ -n "$str1" ]; then
    echo "$str1 is NOT null"
fi
```

这里条件测试 `[-n]`相当于bash内建命令`test -n`。bash内建命令`test`在值有一个参数的时候，只要参数不为空就返回真：

> The expression is true if and only if the argument is not null.

在这里`[ -n "$str1" ]`中`str1`加上了双引号，扩展成了`[ -n "" ]`，所以就能够判断是否为空。

另外还有两种比较巧妙的判断方法：

```bash
[ ${#str1} -eq 0 ] && echo "str1:Null"
[ _${str1} = _ ] && echo "str1:Null" 
```

# 参考

* [Linux shell 编程 字符串null值 的 条件判断?](https://www.zhihu.com/question/22539151)