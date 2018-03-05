在Python中，对应于其他语言的`null`使用的是关键字`None`:

```python
if foo is None:
    ...
```

```python
>>> foo is None
True
>>> foo = 'bar' 
>>> foo is None
False
```

在Python惯例中，使用`is`来检查变量是否没有设置成`None`这个管理在案例[declaring keyword functions with default parameters](http://effbot.org/zone/default-values.htm)有详细说明。`is`检查的是标识，这是因为在Python程序中`None`只有一个实例，所以`is`用来检查。

所以检查一个变量不是`None`的时候，我们会使用(参考[Zen of Python](http://www.python.org/dev/peps/pep-0020/))：

```python
if not (val is None):
    # ...
```

----

# `None`的详解

* **There is and can only be one None**

在Python中，`None`是类`NoneType`的唯一实例，并且任何尝试这个类都会返回相同对象，也就时`None`是唯一的。

```python
>>> NoneType
NameError: name 'NoneType' is not defined
>>> type(None)
NoneType
```

你可以使用Python的标识函数`id()`来检查`None`的唯一性，会返回对象的唯一标识，每个对象一个标识。如果两个变量具有相同的id，就表示这两个变量实际上是同一个对象：

```python
>>> NoneType = type(None)
>>> id(None)
10748000
>>> my_none = NoneType()
>>> id(my_none)
10748000
>>> another_none = NoneType()
>>> id(another_none)
10748000
>>> def function_that_does_nothing(): pass
>>> return_value = function_that_does_nothing()
>>> id(return_value)
10748000
```

* **`None` cannot be overwritten**

在早期的Python(2.4之前)可以重新设置`None`，但是现在不能：

```python
# In Python 2.7
>>> class SomeClass(object):
...     def my_fnc(self):
...             self.None = 'foo'
SyntaxError: cannot assign to None
>>> def my_fnc():
        None = 'foo'
SyntaxError: cannot assign to None

# In Python 3.5
>>> class SomeClass:
...     def my_fnc(self):
...             self.None = 'foo'
SyntaxError: invalid syntax
>>> def my_fnc():
        None = 'foo'
SyntaxError: cannot assign to keyword
```

这就确保了`None`的引用是相同的，没有"定制"的`None`

* **To test for `None` use the is operator**

要检查是否是`None`需要使用关键字`is`，不要使用`==`

# 参考

* [null object in Python?](https://stackoverflow.com/questions/3289601/null-object-in-python) - 问答中的`mike_e`提供了详细的解说，非常详细，我没有全文翻译，建议阅读原文
* [not None test in Python](https://stackoverflow.com/questions/3965104/not-none-test-in-python)