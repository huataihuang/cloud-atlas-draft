从文本文件中获取数据加载到变量中是很常见的方式，python的文件处理适合这种场景。

例如，输入文件内容是

```
LLKKKKKKKKMMMMMMMMNNNNNNNNNNNNN
GGGGGGGGGHHHHHHHHHHHHHHHHHHHHEEEEEEEE
```

处理方法：

```python
with open('data.txt', 'r') as myfile:
    data=myfile.read().replace('\n', '')
```

> 这里`\n`被替换掉，则读入以后就是：

```
['LLKKKKKKKKMMMMMMMMNNNNNNNNNNNNN', 'GGGGGGGGGHHHHHHHHHHHHHHHHHHHHEEEEEEEE']
```

# 参考

* [How do I read a text file into a string variable in Python](https://stackoverflow.com/questions/8369219/how-do-i-read-a-text-file-into-a-string-variable-in-python)