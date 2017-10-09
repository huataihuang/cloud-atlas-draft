当在python中使用append模式写入文件，会发现每次写入的时候都是在行末添加内容，而没有换行。

例如记录日志：

```python
    myapp_content = "需要记录的日志内容"
    f = open(myapp_log_file,'a')
    f.write(myapp_content)
    f.close()
```

反复执行，就会发现文件内容不是一行行，而是堆积一行中。

这是因为每次记录内容结尾都没有换行符号，导致 append 的时候串成一行。

```python
    myapp_content = "需要记录的日志内容"
    f = open(myapp_log_file,'a')
    f.write("%s\n" % myapp_content)
    f.close()
```