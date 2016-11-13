# 获取字典的索引

获取字典中所有的索引值作为一个列表非常简单

```python
PYTHON 2.7
>>> newdict = {1:0, 2:0, 3:0}
>>> newdict
{1: 0, 2: 0, 3: 0}
>>> newdict.keys()
[1, 2, 3]
```

对于3.x

```python
for key in newdict.keys():
  print(key)
```

> [How to return dictionary keys as a list in Python 3.3](http://stackoverflow.com/questions/16819222/how-to-return-dictionary-keys-as-a-list-in-python-3-3)

# 加载多列文本到字典（嵌套列表）中

在计算系统负载的程序中，需要将`/proc/stat`加载到字典中（使用cpu核标号作为字典的索引key），方便对每行数据进行计算

```
def get_vcpu_time(vcpu_top_file):
    """
    传入vcpu_top指定文件，返回一个加载好这个文件的字典方便计算
    这个字典的值是数组，所以非常方便累加
    """
    # 字典索引使用第4列的cpu编号为索引
    vcpu_time = {}
    with open(vcpu_top_file,'r') as f:
        for line in f:
            items = line.split()
            key, values = items[3], items[4:]
            vcpu_time[key] = values
    return vcpu_time
```

# 字典嵌套数组

python的字典非常灵活，其值可以嵌套数组也可以再嵌套字典，而且嵌套无限制。

```
    # 先计算cpu的time，然后再计算百分比
    cpu_time = {}
    for i in cpu_list:
        print i
        # user time
        cpu_time[i][0] = int(vcpu_time_now[i][0]) - int(vcpu_time_now[i][0])
        print cpu_time[i][0]
```

这里会报错

```
28
Traceback (most recent call last):
  File "./tsar_jtsy", line 187, in <module>
    main()
  File "./tsar_jtsy", line 183, in main
    get_cpu()
  File "./tsar_jtsy", line 170, in get_cpu
    cpu_time[i][0] = int(vcpu_time_now[i][0]) - int(vcpu_time_now[i][0])
KeyError: '28'
```

是因为`vcpu_time_now`和`vcpu_time_now`是嵌套字典，而前面初始化单层字典无法适配

google好久，原来 [defaultdict](https://docs.python.org/3/library/collections.html#collections.defaultdict) 对象可以实现这个功能

> returns a new dictionary-like object. defaultdict is a subclass of the built-in dict class. It overrides one method and adds one writable instance variable. The remaining functionality is the same as for the dict class and is not documented here.

参考 [Python creating a dictionary of lists](http://stackoverflow.com/questions/960733/python-creating-a-dictionary-of-lists)

```python
    cpu_list = vcpu_time_now.keys()
    cpu_time = defaultdict(list)
    for i in cpu_list:
        print i
        cpu_time[i].append(int(vcpu_time_now[i][0]) - int(vcpu_time_old[i][0]))
        print cpu_time[i][0]
```