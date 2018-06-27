经常需要处理多列的文本文件，需要一行行读取，然后处理每个字段内容。例如文本`data.txt`内容如下

```
server1.example.com     file_name_1
server2.example.com     file_name_2
server3.example.com     file_name_3
```

需要将每行数据读入变量 `$nc` 和 `$file` 然后进行处理

在bash中有一个非常简单的通过while循环将每行数据的列值赋予变量的方法：

```bash
while read nc file;do
    echo $nc
    echo $file
    ....
done < "data.txt"
```

# 参考

* [Bash: read a file line-by-line and process each segment as parameters to other prog](https://stackoverflow.com/questions/7619438/bash-read-a-file-line-by-line-and-process-each-segment-as-parameters-to-other-p)