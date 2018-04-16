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
