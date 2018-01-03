# 打印list内容

如果list内容全部是字符串，则非常容易打印输出

```
mylist = ['spam', 'ham', 'eggs']
print ', '.join(mylist)
```

输出就是

```
spam, ham, eggs
```

类似可以

```
print '\n'.join(mylist)
```

输出是

```
spam
ham
eggs
```

但是，如果list中有数字，则会导致打印问题

解决方法是使用`map()`转换

> `map`是Python的内置高阶函数，参数是一个函数和一个列表，将函数作用于列表的每个元素，得到一个新的列表并返回，是非常高效的一个方法。详细请参考[Python的map函数](map)

```
>>> print ', '.join(map(str, list_of_ints))
80, 443, 8080, 8081
>>> print '\n'.join(map(str, list_of_ints))
80
443
8080
8081
```

#参考

* [Python tips - How to easily convert a list to a string for display](https://www.decalage.info/en/python/print_list)