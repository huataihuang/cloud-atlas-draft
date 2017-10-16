常用的字符过滤命令`grep`实际上有很多使用技巧，这里搜集一些案例。

# 只显示匹配的第一行数据

通常`grep`过滤会显示所有匹配行，虽然也可以将匹配后的多行再使用`head -1`过滤一次得到第一个匹配行，但是，实际上`grep`提供了一个参数`-m`或`--max`来显示最大显示多少行，也就能够得到最先匹配的行了：

```bash
grep -m 1 "pattern" filename.txt
```

# 匹配内容输出时同时显示行号

`grep`提供了同时输出匹配行的行号功能，命令行参数是`-n`，此时输出时会显示`行号:匹配行内容`:

```bash
grep -n "pattern" filename.txt
```

输出类似

```
5:line_x xxxxxx
6:line_y yyyyyy
```

# 参考

* [GREP如何提取文件中第一个相关匹配](http://bbs.chinaunix.net/thread-3590779-1-1.html)
* [grep 能否给出搜到行的行号＋内容？](http://bbs.chinaunix.net/thread-286265-1-1.html)