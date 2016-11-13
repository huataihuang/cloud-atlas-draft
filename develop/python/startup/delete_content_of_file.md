* 清空一个打开的文件

```
def deleteContent(pfile):
    pfile.seek(0)
	pfile.truncate()
```

* 清空一个打开的文件，并且文件句柄是已知的

```
def deleteContent(fd):
    os.ftruncate(fd, 0)
	os.lseek(fd, 0, os.SEEK_SET)
```

* 清空一个关闭的文件（文件名已知） - 这个方法简单，并且可行

```
def deleteContent(fName):
    with open(fName, "w"):
	    pass
```

也可以使用一条命令，直接打开文件写并覆写就会清空（注意，不能使用增加参数'a'）

```
open(filename, 'w').close()
```

# 参考

* [How to delete only the content of file in python](http://stackoverflow.com/questions/17126037/how-to-delete-only-the-content-of-file-in-python)