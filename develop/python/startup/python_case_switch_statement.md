Python没有直接支持case/switch结构，通常是通过 `if / elif / else` 来实现类似结构。

以下是一个采用字典来实现case/switch结构，值得借鉴：

```python
# define the function blocks
def zero():
    print "You typed zero.\n"

def sqr():
    print "n is a perfect square\n"

def even():
    print "n is an even number\n"

def prime():
    print "n is a prime number\n"

# map the inputs to the function blocks
options = {0 : zero,
           1 : sqr,
           4 : sqr,
           9 : sqr,
           2 : even,
           3 : prime,
           5 : prime,
           7 : prime,
}
```

然后采用如下调用来实现：

```python
options[num]()
```

另外一种巧妙的字典方法：

```python
def f(x):
    return {
        'a': 1,
        'b': 2,
    }[x]
```

使用字典[get(key[, default])](https://docs.python.org/2/library/stdtypes.html#dict.get)方法

```python
def f(x):
    return {
        'a': 1,
        'b': 2
    }.get(x, 9)    # 9 is default if x not found
```

# 参考

* [What is the Python equivalent for a case/switch statement? [duplicate]](What is the Python equivalent for a case/switch statement? [duplicate])
* [Replacements for switch statement in Python?](https://stackoverflow.com/questions/60208/replacements-for-switch-statement-in-python)