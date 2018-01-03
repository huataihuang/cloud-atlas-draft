> `lambda`是希腊字母的第11个字`λ`（大写`Λ`，小写`λ`）

Python 中定义函数有两种方法，一种是用常规方式 def 定义，函数要指定名字，第二种是用 lambda 定义，不需要指定名字，称为 Lambda 函数。

Lambda 函数又称匿名函数，匿名函数就是没有名字的函数。有些函数如果只是临时一用，而且它的业务逻辑也很简单时，就没必要非给它取个名字不可。(否则只使用一次就建立一个函数，会带来"环境污染")

简单的lambda函数：

```python
>>> add = lambda x, y : x+y
>>> add
<function <lambda> at 0x102bc2140>
>>> add(1,2)
3
```

同于常规函数

```python
>>> def add2(x, y):
...     return x+y
...
>>> add2
<function add2 at 0x102bc1c80>
>>> add2(1,2)
3
```

# 函数式编程

尽管 Python 算不上是一门纯函数式编程语言，但它本身提供了很多函数式编程的特性，像 `map`、`reduce`、`filter`、`sorted` 这些函数都支持函数作为参数，`lambda` 函数就可以应用在函数式编程中。

* 一个整数列表，要求按照列表中元素的绝对值大小升序排列

```python
>>> list1 = [3,5,-4,-1,0,-2,-6]
>>> sorted(list1, key=lambda x: abs(x))
[0, -1, -2, 3, -4, 5, -6]
```

排序函数`sorted`支持接收一个函数作为参数，该参数作为`sorted`的排序一句。这里按照列表元素的绝对值进行排序。以下是采用普通函数来实现的方法：

```python
>>> def foo(x):
...     return abs(x)
...
>>> sorted(list1, key=foo)
[0, -1, -2, 3, -4, 5, -6]
```

但是这种方法不简洁清晰。

# 闭包

`闭包`是一个晦涩难懂的概念，这里简单粗暴理解为**`闭包就是定义在一个函数内部的函数`**，闭包使得变量即使脱离了该函数的所用域范围也依然能够被访问到。

一个用 lambda 函数作为闭包的例子：

```python
>>> def my_add(n):
...     return lambda x:x+n
...
>>> add_3 = my_add(3)
>>> add_3(7)
10
```

这里的lambda函数就是一个闭包，在全局作用域范围内，`add_3(7)`可以正常执行并返回值10是因为在`my_add`局部作用域中，变量n的值在闭包的作用使得它在全局作用域也可以被访问到。

换成常规函数也可以实现闭包，只不过是这种方式稍显啰嗦：

```python
>>> def my_add(n):
...     def wrapper(x):
...         return x+n
...     return wrapper
...
>>> add_5 = my_add(5)
>>> add_5(2)
7
```

> 如果用 lambda 函数不能使你的代码变得更清晰时，这时你就要考虑使用常规的方式来定义函数。

# 参考

* [什么时候使用Lambda函数？](https://foofish.net/lambda.html)
* [Python学习笔记（十二）：lambda表达式与函数式编程](http://blog.csdn.net/mathboylinlin/article/details/9413551)
* [Lambda 表达式有何用处？如何使用？](https://www.zhihu.com/question/20125256/answer/14058285)
* [为什么匿名函数叫lambda 表达式？](https://www.zhihu.com/question/27448188/answer/36701731)