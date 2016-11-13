从文件中加载的列表，值都是字符串。对于需要计算的数值，可以通过复制列表的方法，在复制过程中将字符串转换成float

```
new_list = []
for item in list:
    new_list.append(float(item))
```

以下是一个比较巧妙的方法

```
[float(i) for i in lst]
```

> 上述方法适合 python 2 也可以用于 python 3

如果是python 3，提供了一个 map

```
map(float, mylist)
```

不过，浮点数会有小数点以后很多位，可以通过`round`函数来限制小数点后位数

```
[round(float(i), 2) for i in mylist]
```

# 参考

* [In Python, how to I convert all items in a list to floats?](http://stackoverflow.com/questions/1614236/in-python-how-to-i-convert-all-items-in-a-list-to-floats)