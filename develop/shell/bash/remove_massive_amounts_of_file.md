线上环境[找出大量消耗inode的文件目录](os/linux/security/audit/find_inode_consume.md)，我们需要有一个快速清理文件的方法。

参考 [Delete only files older than 7 days: -mtime and find](https://unix.stackexchange.com/questions/447360/delete-only-files-older-than-7-days-mtime-and-find)

```
find /tmp/exec -maxdepth 1 -mtime +1 -type f -delete
```

如果要检查文件而不是删除，可以将 `-delete` 改成 `-print`

```
find /tmp/exec -maxdepth 1 -mtime +1 -type f -print
```

但是发现不行

```
#df -i | grep vda
/dev/vda1        2621440 2618372      3068  100% /

[root@server-1.example.com /root]
#find /tmp/exec -maxdepth 1 -mtime +1 -type f -delete

[root@server-1.example.com /root]
#df -i | grep vda
/dev/vda1        2621440 2564624     56816   98% /
```

也就是说都是一天内生成的文件

参考 [find -mtime files older than 1 hour [duplicate]](https://stackoverflow.com/questions/543946/find-mtime-files-older-than-1-hour) 改成一小时

原先案例：

```
find /var/www/html/audio -daystart -maxdepth 1 -mmin +59 -type f -name "*.mp3" \
    -exec rm -f {} \;
```

如果要在删除前先验证可以使用echo命令加入

```
... -exec echo rm -f '{}' \;
          ^^^^ Add the 'echo' so you just see the commands that are going to get
               run instead of actual trying them first.
```

我执行：

```
find /tmp/exec -maxdepth 1 -mmin +59 -type f -exec rm -f {} \;
```

不过，这个命令执行起来超级慢。我测试了一下，如果要删除200w+文件，需要大约1.5小时。用watch每2秒检查一下文件清理速度，似乎每秒钟只清理350～400个文件。(计算了一下，每秒400个文件的话，1.5小时确实只能删除 216万 个文件)

为了加快清理速度，我找到 [Efficiently delete large directory containing thousands of files](https://unix.stackexchange.com/questions/37329/efficiently-delete-large-directory-containing-thousands-of-files)

有以下一些推荐方法：

* 较快的删除目录文件方法是使用 `rsync` 对一个空目录和需要删除文件目录进行同步，可以快速清理掉目录下的文件

```
mkdir empty_dir
rsync -a --delete empty_dir/ yourdirectory/
```

但是，这个方法对于我的案例不适用

此外，更快的方法是使用perl，但是我不熟悉perl，没有把握使用这个命令

```bash
cd yourdirectory
perl -e 'for(<*>){((stat)[9]<(unlink))}'
```

* 有推荐使用 `find` 命令的 `-delete` 参数，据说比标准的 `-exec rm -f {} \;` 要快。但是这个命令不是所有平台通用（GNU find才支持 `-delete`），并且也是递归方式删除

* 可以通过 `xargs` 来加速删除，因为 `xargs` 可以并发删除文件，也就是你可以一次传递多个文件给xargs，执行一条删除命令：

```
find /path/to/folder -name "filenamestart*" -type f -print0 | xargs -0rn 20 rm -f
```

> * 这里 `xargs` 的参数 `-0` 表示输入项是以`null`字符结束而不是空白，并且引号和反斜杠不指定。这个参数适合输入项可能包含空格，引号和反斜杠情况。
> * `-r, --no-run-if-empty` 通常即使没有输入也会运行一次，GNU扩展的这个参数在没有包含任何非空白，就不运行
> * `-n 20` 表示最大参数20个
>
> 上述参数结合起来就是表示输入给xargs的一次处理参数是20个，也就是20个并发删除。你可以调整大这个参数以便更大并发。
>
> 不过，根据 `man xargs` 手册提示，xargs能够自动根据平台计算出缓存大小，来决定尽可能大的参数，所以可以不用加 `-n 20` 而是让 `xargs` 自动判断取最大并发。所以可以改为 `| xargs -0r rm -f`

对于我这个案例可以修订脚本命令

```bash
find /tmp/exec -maxdepth 1 -mmin +59 -type f | xargs -0r rm -f
```

## 测试对比

* 先创建一个目录下50w文件

```bash
mkdir test1
cd test1
for i in $(seq 1 500000); do echo testing >> $i.txt; done
```

> 大约15秒就可以创建好500w文件

* 删除测试常规rm

```
time find . -type f -exec rm {} \;
```

完成时间

```
real	10m51.132s
user	1m56.469s
sys	8m49.892s
```

再次测试

```
real	11m36.329s
user	1m37.385s
sys	9m53.831s
```

* 测试find的`-delete`

```
time find . -type f -delete
```

神奇，达到了xargs的效率

```
real	0m10.493s
user	0m0.692s
sys	0m5.105s
```

* 测试删除: xargs并发20个文件

```
time find . -type f | xargs -0rn 20 rm -f
```

> 实测不行，传递参数过长，导致报错 `xargs: argument line too long`

但是可以改成 `find` 加上 `-print0` 参数

```
time find . -type f -print0 | xargs -0rn 20 rm -f
```

删除效率也有很大提高，仅26秒钟，虽然比不上让xargs自动选择buffer的方式

```
real	0m26.355s
user	0m8.334s
sys	0m15.133s
```

* 测试删除: xargs自动使用buffer并发删除文件

```
time find . -type f | xargs -0r rm -f
```

> 实测不行，传递参数过长，导致报错 `xargs: argument line too long`

```
time find . -type f -print0 | xargs -0r rm -f
```

神奇的效率，仅仅12秒钟就可以完成删除

```
real	0m11.995s
user	0m0.984s
sys	0m5.603s
```

# 批量处理

如果有大量的服务器需要检查inode消耗，我们可以使用 [pssh](pssh) 工具：

* 例如对于案例，执行 `pssh -ih hosts 'df -i | grep vda1'` 输出到日志文件 `check_disk.log` 如下：

```
192.168.6.172:/dev/vda1        2621440 2613825      7615  100% /
192.168.6.239:/dev/vda1        2621440 2614148      7292  100% /
```

* 过滤日志进行处理

```
cat check_disk.log | awk '{print $1","$5}'
```

获得类似输出

```
192.168.6.192:/dev/vda1,96%
192.168.6.200:/dev/vda1,5%
192.168.6.202:/dev/vda1,84%
```

* 再进行数据整理

```
cat check_disk.log | awk '{print $1","$5}' | awk -F"[:,%]" '{print $1","$3}'
```

就获得了如下格式

```
192.168.6.183,5
192.168.6.165,82
192.168.6.168,6
...
192.168.6.192,96
192.168.6.200,5
192.168.6.202,84
```

现在进行判断参考 [print line only if number in third field is greater than X [duplicate]](https://unix.stackexchange.com/questions/395588/print-line-only-if-number-in-third-field-is-greater-than-x) 或者参考我之前的实践记录 [awk搜索字符串](awk_search_string)

```
cat check_disk.log | awk '{print $1","$5}' | awk -F"[:,%]" '{print $1","$3}' | awk -F, '$2>10 {print $1}'
```

> awk 支持先判断，然后执行打印 参考 [get all rows having a column value greater than a threshold](https://unix.stackexchange.com/questions/356080/get-all-rows-having-a-column-value-greater-than-a-threshold)

所以执行

```
cat check_disk.log | awk '{print $1","$5}' | awk -F"[:,%]" '{print $1","$3}' | awk -F, '$2>10 {print $1}' | tee ip_clean
```

* 现在我们可以开始批量清理了

```
pssh -t 0 -ih ip_clean 'sudo find /tmp/exec -maxdepth 1 -mmin +10 -type f -delete'
```

# 参考

* [Which is the fastest method to delete files in Linux](https://www.slashroot.in/which-is-the-fastest-method-to-delete-files-in-linux) - 有详细对比不同命令的删除时间，不过没有对比 `xargs` 命令
* [Faster way to delete large number of files [duplicate]](https://unix.stackexchange.com/questions/96935/faster-way-to-delete-large-number-of-files/211650)