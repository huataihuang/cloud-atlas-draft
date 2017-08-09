经常遇到python调用shell命令的输出内容中有换行符，导致隐形的字符串没有匹配上。所以在对比shell命令输出的字符串，一定要在python中注意处理掉字符串结尾的换行符。

python提供了一个非常方便的方法`rstrip()`可以删除掉换行符

```python
>>> 'test string\n'.rstrip()
'test string'
```

`rstrip()`甚至可以删除所有类型的尾部：

```python
>>> 'test string \n \r\n\n\r \n\n'.rstrip()
'test string'
```

只删除新行符号（newlines）可以指定：

```python
>>> 'test string \n \r\n\n\r \n\n'.rstrip('\n')
'test string \n \r\n\n\r '
```

另外还有对应的`lstrip()`和`rstrip()`分别用于去除左边的换行符和右边的换行符

```python
>>> s = "   \n\r\n  \n  abc   def \n\r\n  \n  "
>>> s.strip()
'abc   def'
>>> s.lstrip()
'abc   def \n\r\n  \n  '
>>> s.rstrip()
'   \n\r\n  \n  abc   def'
```

> 在日常调用shell中，实际上shell也提供了一个去除换行符的方法，就是使用`echo -n $(XXXXX)`，此时调用的指令的换行符也会被去除。

# 参考

* [How can I remove (chomp) a newline in Python?](https://stackoverflow.com/questions/275018/how-can-i-remove-chomp-a-newline-in-python)