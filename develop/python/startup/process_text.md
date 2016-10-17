
# 检查文本行数

```python
len(open('/path/and/filename').readlines())
```

> 参考 [number of lines in a file](http://grokbase.com/t/python/python-list/023x86165h/number-of-lines-in-a-file)

# 检查文件是否为空

```python
>>> import os
>>> os.stat("file").st_size == 0
True
```

> **注意**：`st_size`是检查文件的大小是否为零来判断文件是否为空，这种方法不适合`/proc`文件系统，因为在`/proc`和`/sys`文件系统中所有文件的大小都是0，则需要通过计算文件内容来判断。

> 参考 [python how to check file empty or not](http://stackoverflow.com/questions/2507808/python-how-to-check-file-empty-or-not)

# 检查文件大小

```python
>>> import os
>>> statinfo = os.stat('somefile.txt')
>>> statinfo
(33188, 422511L, 769L, 1, 1032, 100, 926L, 1105022698,1105022732, 1105022732)
>>> statinfo.st_size
926L
```

> 参考 [How to check file size in python?](http://stackoverflow.com/questions/2104080/how-to-check-file-size-in-python)

# 文件合并

python合并文件的方法需要考虑文件大小，略有不同

* 大文件合并

```python
filenames = ['file1.txt', 'file2.txt', ...]
with open('path/to/output/file', 'w') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            for line in infile:
                outfile.write(line)
```

* 小文件合并

```pyton
filenames = ['file1.txt', 'file2.txt', ...]
with open('path/to/output/file', 'w') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            outfile.write(infile.read())
```

> 参考 [Python concatenate text files](http://stackoverflow.com/questions/13613336/python-concatenate-text-files)

偷懒一些的方法是直接使用操作系统命令

# `glob`模块处理Unix风格路径文件匹配

[glob](https://docs.python.org/3/library/glob.html) 是一个通过使用Unix shell来查找符合特定规则的所有路径名字。它是通过使用 `os.listdir()` 和 `fnmatch.fnmatch()` 功能来实现，不需要调用子shell。

```python
import glob
print glob.glob("/home/admin/*.txt")
```

则返回

```
['/home/adam/file1.txt', '/home/adam/file2.txt', .... ]
```

参考

* [How to list all files of a directory in Python](http://stackoverflow.com/questions/3207219/how-to-list-all-files-of-a-directory-in-python)
* [11.7. glob — Unix style pathname pattern expansion](https://docs.python.org/3/library/glob.html)

# 列出目录下文件

`os.listdir()` 可以获取目录下的文件和子目录

如果只是文件，可以使用 `os.path`

```path
from os import listdir
from os.path import isfile, join
onlyfiles = [f for f in listdir(mypath) if is file(join(mypath, f))]
```

如果使用 `os.walk()` 则会将访问的每个目录分为两个列表，分别是文件和目录。

```python
from os import walk

f = []
for (dirpath, dirnames, filenames) in walk(mypath):
    f.extend(filenames)
	break
```

> 参考 [How to list all files of a directory in Python](http://stackoverflow.com/questions/3207219/how-to-list-all-files-of-a-directory-in-python)