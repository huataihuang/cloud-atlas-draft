通常在Python函数中返回多个值采用的是元组（[tupling](https://stackoverflow.com/questions/38508/whats-the-best-way-to-return-multiple-values-from-a-function-in-python)）

在 [Python Cookbook, 3rd Edition: 7.4. Returning Multiple Values from a Function](https://www.safaribooksonline.com/library/view/python-cookbook-3rd/9781449357337/ch07s04.html) 有一个案例可以借鉴：

```python
def myfun():
    return 1, 2, 3

a, b, c = myfun()
```

注意，这里`myfun()`返回的多个值实际上是创建了一个元组。因为元组是通过逗号来组成的，而不是圆括号。当调用的函数返回了元组，通常会将结果赋值给多个变量。实际上这就是简单的元组解包。

返回值也可以只付给一个单独的变量：

```python
>>> x = myfun()
>>> x
(1, 2, 3)
```

其他一些函数返回多个值的方法可以参考[How do you return multiple values in Python?](https://stackoverflow.com/questions/354883/how-do-you-return-multiple-values-in-python)，即通过字典，类，列表来返回，不过有些复杂。

# 参考

* [Python Cookbook, 3rd Edition: 7.4. Returning Multiple Values from a Function](https://www.safaribooksonline.com/library/view/python-cookbook-3rd/9781449357337/ch07s04.html)
* [What's the best way to return multiple values from a function in Python?](https://stackoverflow.com/questions/38508/whats-the-best-way-to-return-multiple-values-from-a-function-in-python)
* [How do you return multiple values in Python?](https://stackoverflow.com/questions/354883/how-do-you-return-multiple-values-in-python)