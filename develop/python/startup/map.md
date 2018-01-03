Python的`map`函数是一个使用方便直观而且非常常用的函数，参数是一个函数和一个列表，将函数作用于列表的每个元素，得到一个新的列表并返回。

# map函数简介

* 将一个列表的每个值平方：

```python
def square(x):
    return x*x

print map(square, [1, 2, 3, 4, 5, 6, 7, 8, 9])
```

则输出结果就是

```
[1, 4, 9, 10, 25, 36, 49, 64, 81]
```

> 注意：`map()`函数不改变原有的列表，而是返回一个新的列表。

上述python程序中，`square(x)`函数可以简化成`lambda`匿名函数（[`lambda`语法糖:无需定义函数名的简便方法](lambda)）：

```python
print map(lambda x: x ** 2, [1, 2, 3, 4, 5, 6, 7, 8, 9])
```

* 将用户输入内容（列表）的首字母大写，后续字母小写

例如：

```
输入：['adam', 'LISA', 'barT']
输出：['Adam', 'Lisa', 'Bart']
```

```python
def format_name(s):
    s1 = s[0:1].upper() + s[1:].lower()
    return s1

print map(format_name, ['adam', 'LISA', 'barT'])
```

# map函数进阶

实际上，`map()`函数的参数不仅仅是2个，从第2个列表开始，可以是多个列表(多个`iterable`)

```
map(function, iterable, ...)
```

例如，提供两个列表，将相同位置的列表数据进行相加：

```python
map(lambda x, y: x + y, [1, 3, 5, 7, 9], [2, 4, 6, 8, 10])
```

# 参考

* [python map函数](http://www.cnblogs.com/superxuezhazha/p/5714970.html)
* [Python map() 函数](http://www.runoob.com/python/python-func-map.html)