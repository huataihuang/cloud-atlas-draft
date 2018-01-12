通常对比文件我们采用`diff`命令，在shell脚本中，经常需要根据对比结果：相同或不同，做进一步处理。

# 使用diff

```bash
#!/bin/sh

if diff file1 file2 >/dev/null ; then
  echo Same
else
  echo Different
fi
```

# 使用cmp

> `cmp`和`diff`都是diffutils工具包中的对比工具：`cmp`是一个字节一个字节对比文件

```bash
cmp --silent $old $new || echo "files are different"
```

# 使用cksum

```bash
chk1=`cksum <file1> | awk -F" " '{print $1}'`
chk2=`cksum <file2> | awk -F" " '{print $1}'`

if [ $chk1 -eq $chk2 ]
then
  echo "File is identical"
else
  echo "File is not identical"
fi
```

# 对比输出文件的差异

如果要获得两个文件的差异内容使用如下方法

```
cat file1 file2 | sort | uniq -u
```

# 参考

* [Bash script to compare two files](https://www.linuxquestions.org/questions/linux-newbie-8/bash-script-to-compare-two-files-563836/)
* [Fastest way to tell if two files are the same in Unix/Linux?](https://stackoverflow.com/questions/12900538/fastest-way-to-tell-if-two-files-are-the-same-in-unix-linux)