在[读取文件逐行处理元素](read_file_line_by_line_process_each_segment)处理中，想采用读取出每行后，`ssh`到第一字段对应的主机上，通过`cat`命令输出第二列字段对应的文件内容。

```
while read nc file
    echo $nc
    echo $file
    ssh $nc "cat $file"
done < "data.txt"
```

然而，发现循环只执行了一次，即只登录到第一台nc服务器上，输出文件内容后脚本就结束了。

导致循环被中断的原因是：ssh会从`stdin`读取内容，而这里`stdin`就是输入文件`data.txt`。这导致第一次循环ssh就把整个文件读取（消费）完了，所以循环就结束了。

解决的方法是使用`ssh`的`-n`参数，这样就会使得`ssh`从`/dev/null`读取而不是从`stdin`读取：

```
ssh -n $nc "cat $file"
```

也可以显式指定`/dev/null`作为ssh读取：

```
ssh $nc "cat $file" < /dev/null
```

# 参考

* [ssh breaks out of while-loop in bash](https://stackoverflow.com/questions/9393038/ssh-breaks-out-of-while-loop-in-bash)
* [Shell script while read line loop stops after the first line](https://stackoverflow.com/questions/13800225/shell-script-while-read-line-loop-stops-after-the-first-line)