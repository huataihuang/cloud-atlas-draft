在很多时候，我们需要知道字符串的长度(计算多少个字符)，有以下一些方法

* `wc -m` 可以计算字符串的字符数量:

```bash
STRLENGTH=$(echo -n $STRING | wc -m)
# 或者
STRLENGTH=`echo -n $STRING | wc -m`
```

不过，需要注意，这里 `wc -m` 获得的结果，会出现一个多个空格之后的数字，例如 `       5`

所以还需要做一个截取

* 更好的方式是变量

```bash
myvar="This is a test"
echo "${#myvar}"
14
```

或者

```bash
expr length "${myvar}"
14
```

# 参考

* [How to find length of string in shell](https://superuser.com/questions/807573/how-to-find-length-of-string-in-shell)