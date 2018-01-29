我一直以为，用`^`和`$`来代表行首和行尾，用`sed`可以很容易实现替换行首和行尾，但是没有想到还有一个`&`符号，实际方法如下：

```bash
sed -i 's/^/HEAD&/g' test.file

sed -i 's/$/&TAIL/g' test.file
```

> `-i`参数直接修改原文件
>
> `g`表示每行出现的匹配字符全部替换，否则就只替换每行的第一个匹配字符

上述两条命令可以结合成一起使用

```bash
sed '/./{s/^/HEAD&/;s/$/&TAIL/}' test.file
```

# 参考

* [linux shell 用sed命令在文本的行尾或行首添加字符](http://www.cnblogs.com/aaronwxb/archive/2011/08/19/2145364.html)