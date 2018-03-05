Python可以非常轻易检查某个字符串是否包含在另一个字符串中，方法比较多。

# 使用`in`函数（最简单）

```python
if "ABCD" in "xxxxABCDyyyy":
    # whatever
```

我自己在实践中有一个简单的案例检查字典的索引是否包含某个字符串，如果包含则提取索引对应的值（见[本地变量分配前被引用报错"local variable 'XXX' referenced before assignment"](local_variable_referenced_before_assignment)）

```python
        INSTANCETYPE_STRING=self.machine_type
        cpu_base_set = {"SMALL": 1, "MEDIUM": 2, "LARGE": 4}
        for typeKey in cpu_base_set.keys():
            if typeKey in INSTANCETYPE_STRING:
                cpu_base = cpu_base_set[typeKey]
                type_base = typeKey
```

[Check if multiple strings exist in another string](https://stackoverflow.com/questions/3389574/check-if-multiple-strings-exist-in-another-string)有一个巧妙的案例，使用了[any](http://docs.python.org/library/functions.html#any)库函数：

```python
a = ['a', 'b', 'c']
str = "a123"

if any(x in str for x in a):
    print "some of the strings found in str"
```

# 使用`index`函数

```python
>>> try :
...   "xxxxABCDyyyy".index("test")
... except ValueError:
...   print "not found"
... else:
...   print "found"
...
not found
```

# 使用`find`函数

```python
>>> if "xxxxABCDyyyy".find("ABCD") != -1:
...   print "found"
...
found
```

# 使用`re`函数

```python
>>> import re
>>> if re.search("ABCD" , "xxxxABCDyyyy"):
...  print "found"
...
found
```

> 在[Does Python have a string 'contains' substring method?](https://stackoverflow.com/questions/3437059/does-python-have-a-string-contains-substring-method)问答中，有人对比了不同方法的效率，`in`函数速度最快，`find`其次，`index`最慢。

```python
import timeit

def in_(s, other):
    return other in s

def contains(s, other):
    return s.__contains__(other)

def find(s, other):
    return s.find(other) != -1

def index(s, other):
    try:
        s.index(other)
    except ValueError:
        return False
    else:
        return True



perf_dict = {
'in:True': min(timeit.repeat(lambda: in_('superstring', 'str'))),
'in:False': min(timeit.repeat(lambda: in_('superstring', 'not'))),
'__contains__:True': min(timeit.repeat(lambda: contains('superstring', 'str'))),
'__contains__:False': min(timeit.repeat(lambda: contains('superstring', 'not'))),
'find:True': min(timeit.repeat(lambda: find('superstring', 'str'))),
'find:False': min(timeit.repeat(lambda: find('superstring', 'not'))),
'index:True': min(timeit.repeat(lambda: index('superstring', 'str'))),
'index:False': min(timeit.repeat(lambda: index('superstring', 'not'))),
}
```

输出：

```python
>>> perf_dict
{'in:True': 0.16450627865128808,
 'in:False': 0.1609668098178645,
 '__contains__:True': 0.24355481654697542,
 '__contains__:False': 0.24382793854783813,
 'find:True': 0.3067379407923454,
 'find:False': 0.29860888058124146,
 'index:True': 0.29647137792585454,
 'index:False': 0.5502287584545229}
```

# 参考

* [Test a String for a Substring?](https://stackoverflow.com/questions/5473014/test-a-string-for-a-substring)