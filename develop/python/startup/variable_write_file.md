* 需要将subprocess处理结果写入文件

```python
f = open( 'file.py', 'w' )
f.write( 'dict = ' + repr(dict) + '\n' )
f.close()
```

```python
p = subprocess.Popen("cat /etc/redhat-release", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
res = p.communicate()[0]

f = open("/tmp/record.txt",'w')
f.write("%s %s" % (datetime.now(),res.strip()))
f.close()
```

* 清空文件内容

```python
open(filename, 'w').close()
```

# 参考

* [Write variable to file, including name](http://stackoverflow.com/questions/1900956/write-variable-to-file-including-name)
* [How to empty a file using Python](http://stackoverflow.com/questions/4914277/how-to-empty-a-file-using-python)