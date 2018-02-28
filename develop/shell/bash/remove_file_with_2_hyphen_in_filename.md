# 错误生成文件名包含"--"

一个意外错误命令

```
tar cfz --exclude=data --exclude=backup PerfKitBenchmarker.tar.gz PerfKitBenchmarker
```

导致当前目录下生成了一个名为`--exclude=data`的文件

本意是参考[6.4 Excluding Some Files](https://www.gnu.org/software/tar/manual/html_node/exclude.html)创建一个不包含`data`和`backup`目录的打包文件。

上述命令错误在于，tar只认命令参数`cfz`之后必须是目标文件名，之后才可以是可选参数，以及源文件目录，正确写法应该是：

```
tar cfz PerfKitBenchmarker.tar.gz --exclude=data --exclude=backup PerfKitBenchmarker
```

但是，这个奇怪的`--exclude=data`文件如何清理？shell会始终把这个文件名立即成参数：

```
# rm --exclude\=data 
rm: unrecognized option '--exclude=data'
Try 'rm ./'--exclude=data'' to remove the file ‘--exclude=data’.
Try 'rm --help' for more information.
```

StackExchange上有人提供了简单的解决方法，原来`--`空白的时候表示关闭处理命令行参数，即可以通过如下命令删除：

```
rm -- --exclude=data
```

在shell中使用空白的`--`居然能够停止参数解析，实在是神奇...

# 参考

* [How do I delete a file whose name begins with “-” (hyphen a.k.a. dash or minus)?](https://unix.stackexchange.com/questions/1519/how-do-i-delete-a-file-whose-name-begins-with-hyphen-a-k-a-dash-or-minus)