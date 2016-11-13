在一个简单的python脚本中，执行脚本的用户是`nobody`，则该脚本创建的文件默认属主是`nobody`并且文件属性是`644`，也就是对其他用户只能读不能写。

但是由于这个脚本是给系统中任意用户执行的，如果中间文件不能被其它用户写，则其它用户无法执行。

解决的方法是让脚本创建的文件属性是`777`（本案例无安全要求），参考 [How do you create in python a file with permissions other users can write](http://stackoverflow.com/questions/36745577/how-do-you-create-in-python-a-file-with-permissions-other-users-can-write)，即在文件写入后，立即将文件属性设置为777

```python
with open("/home/pi/test/relaxbank1.txt", "w+") as fh:
    fh.write(p1)
os.chmod("/home/pi/test/relaxbank1.txt", 0o777)
```