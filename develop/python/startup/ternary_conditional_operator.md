Python三元表达式和其他语言java类似：

```python
result = x if condition else y
```

也可以写成（这种方式可能更清晰）

```python
result = (x, y)[condition]
```

> 方法二有个不太方便的地方是，对于列表引用，由于列表的索引需要使用`[]`可能会造成困扰。我通常使用方法一。

# 参考

* [Python三元表达式](http://www.jianshu.com/p/fcad6f70feec)