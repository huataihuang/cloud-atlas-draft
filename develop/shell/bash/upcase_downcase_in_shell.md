Shell中转换字符串大小写，可以通过 `tr` 工具，也可以使用 `typeset` 工具。

# tr

* 转换成全大写字母

```
echo down2up | tr '[a-z]' '[A-Z]'
```

输出 `DOWN2UP`

* 转换成全小写字母

```
echo UP2DOWN | tr '[A-Z]' '[a-z]'
```

输出 `up2down`

# typeset

```bash
typeset -u VARIABLE  #把VARIABLE的小写转换成大写
typeset -l  VARIABLE #把VARIABLE的大写转换成小写
```

举例：

```bash
typeset -u VARIABLE
VARIABLE="True"
echo $VARIABLE
```

输出 `TRUE`

# 参考

* [shell中大小写转换](https://blog.csdn.net/shandianling/article/details/17394511)