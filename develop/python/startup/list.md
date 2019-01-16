# 打印list内容

如果list内容全部是字符串，则非常容易打印输出

```
mylist = ['spam', 'ham', 'eggs']
print ', '.join(mylist)
```

输出就是

```
spam, ham, eggs
```

类似可以

```
print '\n'.join(mylist)
```

输出是

```
spam
ham
eggs
```

但是，如果list中有数字，则会导致打印问题

解决方法是使用`map()`转换

> `map`是Python的内置高阶函数，参数是一个函数和一个列表，将函数作用于列表的每个元素，得到一个新的列表并返回，是非常高效的一个方法。详细请参考[Python的map函数](map)

```
>>> print ', '.join(map(str, list_of_ints))
80, 443, 8080, 8081
>>> print '\n'.join(map(str, list_of_ints))
80
443
8080
8081
```

# list内容差异（相减）

很多时候要判断list A减去list B的剩余集合，也就是A包含B，要找出差集。

> 使用`set()`集合指令进行运算比较直观易懂，非常推荐

## 使用`set()`集合方法计算list差异

使用 `set()` 方法可以很容易实现列表差集：

伪代码：

```
Input :
list1 = [10, 15, 20, 25, 30, 35, 40]
list2 = [25, 40, 35] 
Output :
[10, 20, 30, 15]
Explanation:
resultant list = list1 - list2
```

首先将list转换成集合（set），然后使用运算符对集合进行计算，再转换回list就实现了list的差：

```python

# Python code t get difference of two lists 
# Using set() 
def Diff(li1, li2): 
    return (list(set(li1) - set(li2))) 
  
# Driver Code 
li1 = [10, 15, 20, 25, 30, 35, 40] 
li2 = [25, 40, 35] 
print(Diff(li1, li2)) 
```

## 使用从list中复制元素并检查是否包含

```python

# Python code t get difference of two lists 
# Not using set() 
def Diff(li1, li2): 
    li_dif = [i for i in li1 + li2 if i not in li1 or i not in li2] 
    return li_dif 
  
# Driver Code 
li1 = [10, 15, 20, 25, 30, 35, 40] 
li2 = [25, 40, 35] 
li3 = Diff(li1, li2) 
print(li3) 
```

#参考

* [Python | Difference between two lists](https://www.geeksforgeeks.org/python-difference-two-lists/)