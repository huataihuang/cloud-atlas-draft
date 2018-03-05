> 这里`分割`（split）指字符串中包含某个字符或某个单词，以特定字符或单词作为分割符分割字符串。

有时候需要将很长的字符串分割成小块或一系列小字符串，相反的操作是合并字符串。此时，可以使用`split`函数，可以提供分割字符串以及在字符串数组中添加数据作为自定义分割符。

如果没有在调用`split`函数的时候定义分割符，则默认使用空格作为分割符。

# `split`函数案例

* `,`分割符调用`split`

```python
x = 'blue,red,green'
x.split(",")
 
['blue', 'red', 'green']
>>>
 
>>> a,b,c = x.split(",")
 
>>> a
'blue'
 
>>> b 
'red'
 
>>> c
'green'
```

以上案例可以看到，向`split`函数传递自定义分割符，可以将长字符串分割并赋值给元组。

> 另外的一个实践案例在[本地变量分配前被引用报错"local variable 'XXX' referenced before assignment"](local_variable_referenced_before_assignment)，也采用`split`。

## 一些有趣的案例

* 空格分割符调用`split`:

```python
alphabet = "a b c d e f g"
data = alphabet.split() #split string into a list

for temp in data:
    print temp
```

输出

```
a
b
c
d
e
f
g
```

* split+maxsplit（指定只分割几次）

```python
alphabet = "a b c d e f g"
data = alphabet.split(" ",2) #maxsplit

for temp in data:
    print temp
```

输出

```
a
b
c d e f g
```

*  Split by #

```python
url = "mkyong.com#100#2015-10-1"
data = url.split("#")

print len(data) #3
print data[0]  # mkyong.com
print data[1]  # 100
print data[2]  # 2015-10-1

for temp in data:
    print temp
```

输出

```
3
mkyong.com
100
2015-10-1
mkyong.com
100
2015-10-1
```

# 参考

* [How to use Split in Python](http://www.pythonforbeginners.com/dictionary/python-split)
* [Python – How to split a String](https://www.mkyong.com/python/python-how-to-split-a-string/)