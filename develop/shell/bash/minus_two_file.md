经常需要检查一个文件中是否包含另外一个文件内容，或者需要从file1中剔除file2的内容，在shell中可以直接使用 `grep` 命令实现。

* `file1 - file2`

```
grep -vFf file 2 file1
```

> -f StringFile 指定包含字符串的文件。
>
> -v反向

如果要统计两个文件中相同行，则不要使用 `-v` 反向参数，即：

```
grep -Ff file1 file2
```

# 参考

* [如何实现两个文件相减的功能（剔除](https://blog.csdn.net/crazyhacking/article/details/8637880)