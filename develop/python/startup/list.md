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

但是，如果list中有数字，则会导致问题

解决方法是使用`map()`转换

```
>>> print ', '.join(map(str, list_of_ints))
80, 443, 8080, 8081
>>> print '\n'.join(map(str, list_of_ints))
80
443
8080
8081
```

> 参考[Python tips - How to easily convert a list to a string for display](https://www.decalage.info/en/python/print_list)