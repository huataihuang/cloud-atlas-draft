在Python程序中，经常可以看到如下程序结构

```python
def main():
    # my code here

if __name__ == "__main__":
    main()
```

或者

```python
import sys

def main(argv):
    # My code here
    pass

if __name__ == "__main__":
    main(sys.argv)
```

为什么不是直接定义自己的函数，蕾丝

```python
def my_function()
    # my code here

def my_function_two()
    # my code here

# some code
# call function
# print(something)
```

这是因为

* 如果不使用`main`函数，代码就会在导入的时候作为一个模块直接运行
* 其他语言（如C和Java)都有一个`main()`函数在程序执行时调用，使用 `if` 结构，则更为熟悉
* 定义了较为清晰和易读的代码

# 参考

* [Why use def main()?](http://stackoverflow.com/questions/4041238/why-use-def-main)