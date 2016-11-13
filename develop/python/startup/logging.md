# 简单的日志

* 简单记录日志

```python
import logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)
logging.debug('This message should go to the log file')
logging.info('So should this')
logging.warning('And this, too')
```

* 日志中增加时间戳

```python
import logging
logging.basicConfig(format='%(asctime)s %(message)s')
logging.warning('is when this event was logged.')
```

* 设置日志级别：

```
import logging
logger = logging.getLogger('myapp')
hdlr = logging.FileHandler('/var/tmp/myapp.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.WARNING)
```

然后通过如下方法记录日志

```
logger.error('We have a problem')
logger.info('While this is just chatty')
```

> 参考 [Basic example - log to a file](https://docs.python.org/2.3/lib/node304.html)

# 多线程日志记录

以下案例是主线程（initlal）和其他线程同时记录日志的方法

```
import logging
import threading
import time

def worker(arg):
    while not arg['stop']:
```

> 参考 [Logging Cookbook](https://docs.python.org/2/howto/logging-cookbook.html)

# 日志文件中的空行

```python
g_tsar_log="/tmp/tsar.logging"
logging.basicConfig(filename=g_tsar_log,format='%(asctime)s %(message)s')
logging.warning(res)
```

但是发现日志中每行记录后面都有一个空白行，所以记录日志中增加`strip()`去除多余回行

```python
logging.warning(res.strip())
```

# python怎么删除txt文本里面的第一行？

```python
fin=open('a.txt')
a=fin.readlines()
fout=open('newa.txt','w')
b=''.join(a[1:])
fout.write(b)
fin.close()
fout.close()
```

这个方法通过切片方式，可以去除掉指定行

> 参考 [python怎么删除txt文本里面的第一行？](http://zhidao.baidu.com/question/583049390.html)

```python
with open('file.txt', 'r') as fin:
    data = fin.read().splitlines(True)
with open('file.txt', 'w') as fout:
    fout.writelines(data[1:])
```

> 参考 [How to delete the first line of a text file using Python?](http://stackoverflow.com/questions/20364396/how-to-delete-the-first-line-of-a-text-file-using-python)，这个转换需要确保内存足够容纳文件内容

* 巨大文件的行删除

```python
def removeLine(filename, lineno):
    fro = open(filename, "rb")

    current_line = 0
    while current_line < lineno:
        fro.readline()
        current_line += 1

    seekpoint = fro.tell()
    frw = open(filename, "r+b")
    frw.seek(seekpoint, 0)

    # read the line we want to discard
    fro.readline()

    # now move the rest of the lines in the file 
    # one line back 
    chars = fro.readline()
    while chars:
        frw.writelines(chars)
        chars = fro.readline()

    fro.close()
    frw.truncate()
    frw.close()
```

> 参考 [Fastest Way to Delete a Line from Large File in Python](http://stackoverflow.com/questions/2329417/fastest-way-to-delete-a-line-from-large-file-in-python)

# 参考

* [Logging HOWTO:Basic Logging Tutorial](https://docs.python.org/2/howto/logging.html)