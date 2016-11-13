在python脚本中经常要转换变量类型，虽然同样是`12`，对于数值和字符串，其比较是完全不同的，非常容易忽略导致错误。

检查方法是使用`type()`功能：

```
>>> type([]) is list
True
>>> type({}) is dict
True
>>> type('') is str
True
>>> type(0) is int
True
>>> type({})
<type 'dict'>
>>> type([])
<type 'list'>
```

> 参考 [Determine the type of a Python object](http://stackoverflow.com/questions/2225038/determine-the-type-of-a-python-object)