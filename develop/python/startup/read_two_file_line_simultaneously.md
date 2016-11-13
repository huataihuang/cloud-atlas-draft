需要同时读取2个文件，一行行处理合并列

```
from itertools import izip

with open("textfile1") as textfile1, open("textfile2") as textfile2: 
    for x, y in izip(textfile1, textfile2):
        x = x.strip()
        y = y.strip()
        print("{0}\t{1}".format(x, y))
```

> In Python 3, replace itertools.izip with the built-in zip

> 参考 [Read two textfile line by line simultaneously -python](http://stackoverflow.com/questions/11295171/read-two-textfile-line-by-line-simultaneously-python)